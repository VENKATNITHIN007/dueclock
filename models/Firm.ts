
import mongoose , {Schema, model , models} from "mongoose";

export interface IFirm{
    _id?:mongoose.Types.ObjectId;
    ownerId?:mongoose.Types.ObjectId;
    firmName:string;
    createdAt?:Date;
    updatedAt?:Date;
}

const firmSchema = new Schema<IFirm>({
    ownerId:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    firmName:{type:String,required:true},    
    
},
    {
       timestamps:true
    }
)
const Firm = models.Firm || model<IFirm>("Firm",firmSchema)

export default Firm;