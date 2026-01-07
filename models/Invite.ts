// models/Invite.ts
import mongoose, { Schema, model, models } from "mongoose";


export interface IFirm {
  _id?: mongoose.Types.ObjectId;
  firmId?: mongoose.Types.ObjectId;
  email?:string;
  role:"admin | staff"
  token:string;
  expiresAt?:Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const inviteSchema = new Schema(
  {
    firmId: { type: Schema.Types.ObjectId, ref: "Firm", required: true },
    email: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "staff"],
      default: "staff",
    },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export default models.Invite || model("Invite", inviteSchema);