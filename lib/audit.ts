import mongoose from "mongoose";
import Audit from "@/models/Audit";

export type ActionType = "created" | "edited" | "deleted";

interface CreateAuditParams {
  firmId: string | mongoose.Types.ObjectId;
  userId?: string | mongoose.Types.ObjectId;
  dueDateId?: string | mongoose.Types.ObjectId;
  dueDateClientId?: string | mongoose.Types.ObjectId;
  clientId?: string | mongoose.Types.ObjectId;
  action: string;
  actionType: ActionType;
  details?: any;
}

/**
 * Create an audit log entry
 * Wraps audit creation in try-catch to prevent audit failures from breaking the main operation
 */
export async function createAudit(params: CreateAuditParams): Promise<void> {
  try {
    await Audit.create({
      firmId:
        typeof params.firmId === "string"
          ? new mongoose.Types.ObjectId(params.firmId)
          : params.firmId,
      userId: params.userId
        ? typeof params.userId === "string"
          ? new mongoose.Types.ObjectId(params.userId)
          : params.userId
        : undefined,
      dueDateId: params.dueDateId
        ? typeof params.dueDateId === "string"
          ? new mongoose.Types.ObjectId(params.dueDateId)
          : params.dueDateId
        : undefined,
      dueDateClientId: params.dueDateClientId
        ? typeof params.dueDateClientId === "string"
          ? new mongoose.Types.ObjectId(params.dueDateClientId)
          : params.dueDateClientId
        : undefined,
      clientId: params.clientId
        ? typeof params.clientId === "string"
          ? new mongoose.Types.ObjectId(params.clientId)
          : params.clientId
        : undefined,
      action: params.action,
      actionType: params.actionType,
      details: params.details || {},
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw - audit failures shouldn't break the main operation
  }
}

/**
 * Generate human-readable action descriptions
 */
export const AuditActions = {
  // Due Date actions
  DUE_DATE_CREATED: (title: string) => `Created due date "${title}"`,
  DUE_DATE_UPDATED: (title: string, changes: Record<string, any>) => {
    const changeList = Object.keys(changes).join(", ");
    return `Updated due date "${title}" (changed: ${changeList})`;
  },
  DUE_DATE_DELETED: (title: string) => `Deleted due date "${title}"`,

  // Due Date Client actions
  DUE_DATE_CLIENT_ATTACHED: (clientName: string, dueDateTitle: string) =>
    `Attached client "${clientName}" to due date "${dueDateTitle}"`,
  DUE_DATE_CLIENT_UPDATED: (
    clientName: string,
    dueDateTitle: string,
    changes: Record<string, any>
  ) => {
    const changeList = Object.entries(changes)
      .map(([key, value]: [string, any]) => {
        if (value.from !== undefined && value.to !== undefined) {
          return `${key}: ${value.from} → ${value.to}`;
        }
        return `${key}`;
      })
      .join(", ");
    return `Updated client "${clientName}" in due date "${dueDateTitle}" (${changeList})`;
  },
  DUE_DATE_CLIENT_DELETED: (clientName: string, dueDateTitle: string) =>
    `Removed client "${clientName}" from due date "${dueDateTitle}"`,

  // Client actions
  CLIENT_CREATED: (clientName: string) => `Created client "${clientName}"`,
  CLIENT_UPDATED: (clientName: string, changes: Record<string, any>) => {
    const changeList = Object.keys(changes).join(", ");
    return `Updated client "${clientName}" (changed: ${changeList})`;
  },
  CLIENT_DELETED: (clientName: string) => `Deleted client "${clientName}"`,

  // Invite actions
  INVITE_CREATED: (email: string, role: string) =>
    `Created invite for ${email} as ${role}`,
  INVITE_DELETED: (email: string) => `Deleted invite for ${email}`,

  // Firm actions
  FIRM_CREATED: (firmName: string) => `Created firm "${firmName}"`,
  FIRM_UPDATED: (firmName: string, changes: Record<string, any>) => {
    const changeList = Object.keys(changes).join(", ");
    return `Updated firm "${firmName}" (changed: ${changeList})`;
  },

  // Member actions
  MEMBER_ADDED: (email: string, role: string) =>
    `Added member ${email} as ${role}`,
  MEMBER_REMOVED: (email: string) => `Removed member ${email}`,
  MEMBER_UPDATED: (email: string, changes: Record<string, any>) => {
    const changeList = Object.keys(changes).join(", ");
    return `Updated member ${email} (changed: ${changeList})`;
  },

  // User actions
  USER_UPDATED: (userName: string, changes: Record<string, any>) => {
    const changeList = Object.keys(changes).join(", ");
    return `Updated user "${userName}" (changed: ${changeList})`;
  },

  // Import/Export actions
  CLIENTS_IMPORTED: (count: number) => `Imported ${count} client${count !== 1 ? "s" : ""}`,
  CLIENTS_EXPORTED: () => `Exported clients`,
  DUE_DATE_EXPORTED: (dueDateTitle: string) =>
    `Exported due date "${dueDateTitle}"`,
};
