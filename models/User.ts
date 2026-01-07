import mongoose, { Schema, model, models } from "mongoose";
export interface IUser {
  _id?: mongoose.Types.ObjectId;
  firmId?: mongoose.Types.ObjectId;
  email: string;
  name: string;
  phoneNumber?: string;
  image?: string;
  googleId?: string;
  role?: "owner"| "admin"| "staff";
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: String,
    googleId: String,
    phoneNumber: String,
    firmId: { type: Schema.Types.ObjectId, ref: "Firm" },
    role: { type: String, enum: ["owner", "admin","staff"], default: "owner" },
  },
  {
    timestamps: true,
  }
);

userSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    delete ret.createdAt;
    delete ret.updatedAt;
    delete ret.__v;
    return ret;
  },
});

const User = models.User || model<IUser>("User", userSchema);

export default User;
