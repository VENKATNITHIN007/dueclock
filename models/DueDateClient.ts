import mongoose, { Schema, model, models } from "mongoose";

export interface IDueDateClient {
  _id?: mongoose.Types.ObjectId;
  firmId: mongoose.Types.ObjectId;
  dueDateId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  // status
  docStatus: "pending" | "received";
  workStatus:"pending" | "completed"
  // audit
  updatedAt?: Date;
  updatedBy?: mongoose.Types.ObjectId;
  lastContactedAt?:Date;
}

const DueDateClientSchema = new Schema<IDueDateClient>(
  {
    firmId: { type: Schema.Types.ObjectId, ref: "Firm", required: true },
    dueDateId: { type: Schema.Types.ObjectId, ref: "DueDate", required: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    docStatus: {
      type: String,
      enum: ["pending", "received"],
      default: "pending",
    },
    workStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    lastContactedAt: Date,
  },
  { timestamps: true }
);

 DueDateClientSchema.index(
  { firmId: 1, dueDateId: 1, clientId: 1 },
  { unique: true }
);

const DueDateClient = models?.DueDateClient || model<IDueDateClient>("DueDateClient", DueDateClientSchema);
export default DueDateClient;