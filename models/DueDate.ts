import mongoose, { Schema, model, models } from "mongoose";

export interface IDueDate {
  _id?: mongoose.Types.ObjectId;
  title: string;
  date: Date;
  firmId?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy:mongoose.Types.ObjectId;  
}

const dueDateSchema = new Schema<IDueDate>(
  {
    title: { type: String, required: true },
    date: { type: Date, required: true },
    createdBy:{ type: Schema.Types.ObjectId, ref: "User", required: true },
    firmId:{ type: Schema.Types.ObjectId , ref: "Firm", required: true }

  },
  {
    timestamps: true,
  }
);
// run before json conversion 
dueDateSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    delete ret.createdAt;
    delete ret.updatedAt;
    delete ret.__v;
    return ret;
  },
});

const DueDate = models?.DueDate || model<IDueDate>("DueDate", dueDateSchema);
export default DueDate;
