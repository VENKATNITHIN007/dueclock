import mongoose, { Schema, model, models } from "mongoose";

export interface ISubscription {
  plan: "free" | "premium";
  firmId?: mongoose.Types.ObjectId;
  expiryDate?: Date;
  status?: "active" | "cancelled" | "paused" | "expired";
  autorenew?: boolean;
  razorpaySubscriptionId?: string;
  razorpayCustomerId?: string;
  razorpayPaymentId?: string;
  paymentMethod?: "upi";
  amount?: number;
  currency?: "INR";
  createdAt?: Date;
  updatedAt?: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    plan: { type: String, enum: ["free", "premium"], default: "free" },
    firmId: { type: Schema.Types.ObjectId, ref: "Firm", required: true },
    expiryDate: Date,
    status: {
      type: String,
      enum: ["active", "cancelled", "paused", "expired"],
      default: "active"
    },
    autorenew: { type: Boolean, default: true },
    razorpaySubscriptionId: String,
    razorpayCustomerId: String,
    razorpayPaymentId: String,
    paymentMethod: { type: String, enum: ["upi"], default: "upi" },
    amount: Number,
    currency: { type: String, default: "INR" },
  },
  {
    timestamps: true,
  }
);

const Subscription =
  models.Subscription ||
  model<ISubscription>("Subscription", subscriptionSchema);

export default Subscription;