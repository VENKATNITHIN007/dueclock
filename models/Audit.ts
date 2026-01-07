import mongoose from "mongoose";

const AuditSchema = new mongoose.Schema(
  {
    firmId: { type: mongoose.Schema.Types.ObjectId, ref: "Firm", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    dueDateId: { type: mongoose.Schema.Types.ObjectId, ref: "DueDate", required: false },
    dueDateClientId: { type: mongoose.Schema.Types.ObjectId, ref: "DueDateClient", required: false },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: false },
    action: { type: String, required: true },
    actionType: { type: String, enum: ["created", "edited", "deleted"], required: true },
    details: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Audit = mongoose.models.Audit || mongoose.model("Audit", AuditSchema);
export default Audit;
