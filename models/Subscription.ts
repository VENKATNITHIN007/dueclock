import mongoose , {Schema, model , models} from "mongoose";

export interface ISubscription{
    plan:"free"|"premium";
    
    firmId?:mongoose.Types.ObjectId;
    expiryDate?:Date;
    status?:"active"|"cancelled"|"paused"|"expired";
    autorenew?:boolean;
    createdAt?:Date;
    updatedAt?:Date;
}

const subscriptionSchema = new Schema<ISubscription>({
    plan:{type:String,enum:["free","premium"]},
    firmId:{type:Schema.Types.ObjectId, ref:"Firm"},
    expiryDate:Date,
    status:{type:String,enum:["active","cancelled","paused","expired"]},
    autorenew:Boolean,

},{
    timestamps:true
})
const Subscription=models.Subscription || model<ISubscription>("Subscription", subscriptionSchema)
export default Subscription;