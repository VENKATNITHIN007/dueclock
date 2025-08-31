
import mongoose , {Schema, model , models} from "mongoose";

export interface IDueDate{
    _id?:mongoose.Types.ObjectId;
    title:string;
    description?:string;
    date:Date;
    clientId:mongoose.Types.ObjectId;
    firmId?:mongoose.Types.ObjectId;
    userId:mongoose.Types.ObjectId;
    status:"notRedayToFile"|"readyToFile"|"completed", default:"notRedayToFile";
    createdAt?:Date;
    updatedAt?:Date;
}

const dueDateSchema = new Schema<IDueDate>({
    title:{type:String, required:true},
    status:{type:String, required : true, enum:["notRedayToFile","readyToFile","completed" ],default:"notRedayToFile"},
    date:{type:Date, required:true},
    clientId:{type:Schema.Types.ObjectId,required:true ,ref:"Client"},
    description:String,
    firmId:{type:Schema.Types.ObjectId, ref:"Firm"},
    userId:{type:Schema.Types.ObjectId,required:true, ref:"User"},
},
{
    timestamps:true
})

const DueDate=models?.DueDate || model<IDueDate>("DueDate", dueDateSchema)
export default DueDate;