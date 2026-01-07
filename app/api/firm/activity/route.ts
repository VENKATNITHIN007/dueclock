import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import Audit from "@/models/Audit";
import mongoose from "mongoose";
import { ActivityResponse } from "@/schemas/apiSchemas/activitySchema";

interface MatchFilter {
  firmId: mongoose.Types.ObjectId;
  actionType?: { $in: string[] };
  dueDateId?: mongoose.Types.ObjectId;
  clientId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  createdAt?: { $gte?: Date; $lte?: Date };
}

export async function GET(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.firmId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectionToDatabase();

		const url = new URL(req.url);
		const category = url.searchParams.get("category"); // "clients", "duedates", "firm"
		const dueDateId = url.searchParams.get("dueDateId"); // Filter by specific due date ID
		const clientId = url.searchParams.get("clientId"); // Filter by specific client ID
		const userId = url.searchParams.get("userId");
		const actionTypes = url.searchParams.get("actionTypes"); // Comma-separated: "created,edited,deleted"
		const period = url.searchParams.get("period"); // "day", "week", "month"
		const startDate = url.searchParams.get("startDate");
		const endDate = url.searchParams.get("endDate");
		const limit = parseInt(url.searchParams.get("limit") || "500", 10);

		const match: MatchFilter = { firmId: new mongoose.Types.ObjectId(session.user.firmId) };
		
		// Filter by action types (created, edited, deleted) - use actionType field
		if (actionTypes) {
			const actionArray = actionTypes.split(",").map(a => a.trim().toLowerCase());
			match.actionType = { $in: actionArray };
		}
		
		// Filter by specific IDs
		if (dueDateId) match.dueDateId = new mongoose.Types.ObjectId(dueDateId);
		if (clientId) match.clientId = new mongoose.Types.ObjectId(clientId);
		if (userId) match.userId = new mongoose.Types.ObjectId(userId);
		
		// Handle time period filters
		if (period) {
			const now = new Date();
			let periodStart: Date;
			let periodEnd: Date;
			
			if (period === "day") {
				periodStart = new Date(now);
				periodStart.setHours(0, 0, 0, 0);
				periodEnd = new Date(now);
				periodEnd.setHours(23, 59, 59, 999);
			} else if (period === "week") {
				const dayOfWeek = now.getDay();
				const diff = now.getDate() - dayOfWeek; // Sunday as start of week
				periodStart = new Date(now);
				periodStart.setDate(diff);
				periodStart.setHours(0, 0, 0, 0);
				periodEnd = new Date(periodStart);
				periodEnd.setDate(periodStart.getDate() + 6);
				periodEnd.setHours(23, 59, 59, 999);
			} else if (period === "month") {
				periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
				periodStart.setHours(0, 0, 0, 0);
				periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
				periodEnd.setHours(23, 59, 59, 999);
			} else {
				periodStart = new Date(now);
				periodStart.setHours(0, 0, 0, 0);
				periodEnd = new Date(now);
				periodEnd.setHours(23, 59, 59, 999);
			}
			
			match.createdAt = { $gte: periodStart, $lte: periodEnd };
		} else if (startDate || endDate) {
			// Custom date range
			match.createdAt = {};
			if (startDate) {
				const start = new Date(startDate);
				start.setHours(0, 0, 0, 0);
				match.createdAt.$gte = start;
			}
			if (endDate) {
				const end = new Date(endDate);
				end.setHours(23, 59, 59, 999);
				match.createdAt.$lte = end;
			}
		}

		// Build aggregation pipeline
		const pipeline: mongoose.PipelineStage[] = [
			{ $match: match },
			// Lookup user
			{
				$lookup: {
					from: "users",
					localField: "userId",
					foreignField: "_id",
					as: "user",
				},
			},
			{
				$unwind: {
					path: "$user",
					preserveNullAndEmptyArrays: true,
				},
			},
			// Lookup due date
			{
				$lookup: {
					from: "duedates",
					localField: "dueDateId",
					foreignField: "_id",
					as: "dueDate",
				},
			},
			{
				$unwind: {
					path: "$dueDate",
					preserveNullAndEmptyArrays: true,
				},
			},
			// Lookup client
			{
				$lookup: {
					from: "clients",
					localField: "clientId",
					foreignField: "_id",
					as: "client",
				},
			},
			{
				$unwind: {
					path: "$client",
					preserveNullAndEmptyArrays: true,
				},
			},
			// Project final fields
			{
				$project: {
					_id: 1,
					action: 1,
					actionType: 1,
					category: 1,
					details: 1,
					createdAt: 1,
					dueDateId: 1,
					dueDateClientId: 1,
					clientId: 1,
					userName: { $ifNull: ["$user.name", "System"] },
					userEmail: { $ifNull: ["$user.email", null] },
					dueDateTitle: { $ifNull: ["$dueDate.title", null] },
					dueDateDate: { $ifNull: ["$dueDate.date", null] },
					clientName: { $ifNull: ["$client.name", null] },
				},
			},
			{ $sort: { createdAt: -1 } },
			{ $limit: limit },
		];

		let activities = await Audit.aggregate(pipeline);

		// Calculate category and filter in JavaScript (cleaner than complex MongoDB queries)
		activities = activities.map((activity: {
			_id: mongoose.Types.ObjectId;
			action: string;
			actionType: string;
			createdAt: Date;
			dueDateId?: mongoose.Types.ObjectId;
			dueDateClientId?: mongoose.Types.ObjectId;
			clientId?: mongoose.Types.ObjectId;
			userName?: string;
			userEmail?: string;
			dueDateTitle?: string;
			dueDateDate?: Date;
			clientName?: string;
		}) => {
			const action = (activity.action || "").toLowerCase();
			let cat = "firm"; // default
			
			// Firm category: member, invite, firm updates
			if (action.includes("member") || action.includes("invite") || action.includes("firm")) {
				cat = "firm";
			}
			// Due Dates category: due date actions, attaching clients, due date client updates
			else if (action.includes("due date") || action.includes("attached client") || activity.dueDateId || activity.dueDateClientId) {
				cat = "duedates";
			}
			// Clients category: client actions without due date context
			else if (action.includes("client") && !activity.dueDateId) {
				cat = "clients";
			}
			// Default to clients if clientId exists without dueDateId
			else if (activity.clientId && !activity.dueDateId) {
				cat = "clients";
			}
			// Default to duedates if dueDateId exists
			else if (activity.dueDateId) {
				cat = "duedates";
			}
			
			return { ...activity, category: cat };
		});

		// Filter by category if provided
		if (category) {
			activities = activities.filter((activity) => activity.category === category);
		}

		// Convert to proper format with string IDs and dates
		const formattedActivities = activities.map((activity) => ({
			_id: activity._id?.toString() || "",
			action: activity.action,
			actionType: activity.actionType as "created" | "edited" | "deleted",
			category: (activity as { category?: string }).category || "firm" as "clients" | "duedates" | "firm",
			details: (activity as { details?: Record<string, unknown> }).details,
			createdAt: activity.createdAt.toISOString(),
			dueDateId: activity.dueDateId?.toString() || null,
			dueDateClientId: activity.dueDateClientId?.toString() || null,
			clientId: activity.clientId?.toString() || null,
			userName: activity.userName || null,
			userEmail: activity.userEmail || null,
			dueDateTitle: activity.dueDateTitle || null,
			dueDateDate: activity.dueDateDate ? new Date(activity.dueDateDate).toISOString() : null,
			clientName: activity.clientName || null,
		}));

		return NextResponse.json(
			{ activities: formattedActivities } as ActivityResponse,
			{
				status: 200,
				headers: {
					"Cache-Control": "private, no-cache, no-store, must-revalidate",
				},
			}
		);
	} catch (err) {
		console.error("Failed to fetch firm activity:", err);
		return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
	}
}
