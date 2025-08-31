import mongoose , {Schema, model , models} from "mongoose";

export interface IReferral{
    _id?:mongoose.Types.ObjectId;
    referrerId?:mongoose.Types.ObjectId;
    // the one who referred
    referredId?:mongoose.Types.ObjectId;
    // the one who is being reffered
    status?:"yetToSubscribe"|"successful";
    createdAt?:Date;
    updatedAt?:Date;
}

const referralSchema = new Schema<IReferral>({

    referrerId:{type:Schema.Types.ObjectId, ref:"User"},
    referredId:{type:Schema.Types.ObjectId, ref:"User"},
    status:{type:String,enum:["yetToSubscribe","successful"]},
},
{
    timestamps:true
})
const Referral=models?.Referral || model<IReferral>("Referral", referralSchema)
export default Referral;