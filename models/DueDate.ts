
import mongoose , {Schema, model , models} from "mongoose";

export interface IDueDate{
    _id?:mongoose.Types.ObjectId;
    title:string;
    date:Date;
    label:string;
    recurrence:"none"|"monthly"|"quarterly"|"yearly"
    clientId:mongoose.Types.ObjectId;
    firmId?:mongoose.Types.ObjectId;
    userId:mongoose.Types.ObjectId;
    status:"pending"|"completed"
    createdAt?:Date;
    updatedAt?:Date;
    completedBy?:mongoose.Types.ObjectId
}

const dueDateSchema = new Schema<IDueDate>({
    title:{type:String, required:true},
    status:{type:String, required : true, enum:["pending","completed" ],default:"pending"},
    recurrence:{type:String, required : true, enum:["none","monthly","quarterly","yearly"],default:"none"},
    date:{type:Date, required:true},
    clientId:{type:Schema.Types.ObjectId,required:true ,ref:"Client"},
    firmId:{type:Schema.Types.ObjectId,required:true, ref:"Firm"},
    completedBy:{type:Schema.Types.ObjectId,ref:"User"},
    label:{type:String, required:true},
},
{
    timestamps:true
})

dueDateSchema.set("toJSON",{
        transform:(_doc,ret:any)=>{
                delete ret.createdAt
                delete ret.updatedAt
                delete ret.__v
                return ret
        }
})

const DueDate=models?.DueDate || model<IDueDate>("DueDate", dueDateSchema)
export default DueDate;