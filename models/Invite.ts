import mongoose , {Schema, model , models} from "mongoose";

export interface IInvite{
    _id?:mongoose.Types.ObjectId;
    token:string;
    firmId?:mongoose.Types.ObjectId;
    email?:string;
    expiresAt?:Date;
    status?:"pending" | "accepted";
    createdAt?:Date;
    updatedAt?:Date;

}

const inviteSchema = new Schema<IInvite>({
    token:{type:String,required:true},
    firmId:{type:Schema.Types.ObjectId, ref:"Firm"},
    email:String,
    status:{type:String,enum:["pending","accepted"]},
    expiresAt:{type:Date,required:true}
},
{
    timestamps:true
})

const Invite = models.Invite || model<IInvite>("Invite", inviteSchema)
export default Invite;