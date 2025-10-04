import mongoose, { Schema, model, models } from "mongoose";

export interface IAuditLog {
  _id?: mongoose.Types.ObjectId;
  dueDateId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;   // who completed
  firmId?: mongoose.Types.ObjectId;  // optional link to firm
  action: "completed";               // only track completed
  createdAt?: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
  dueDateId: { type: Schema.Types.ObjectId, ref: "DueDate", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  firmId: { type: Schema.Types.ObjectId, ref: "Firm" },
  action: { type: String, enum: ["completed"], default: "completed" },
}, { timestamps: true });

const AuditLog = models.AuditLog || model<IAuditLog>("AuditLog", auditLogSchema);
export default AuditLog;