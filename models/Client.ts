import mongoose , {Schema, model , models} from "mongoose";


export interface IClient{
        name:string;
        phoneNumber?:string;
        email?:string;
        firmId?:mongoose.Types.ObjectId;
        _id?:mongoose.Types.ObjectId;
        createdAt?:Date;
        updatedAt?:Date;
        }

const clientSchema = new Schema<IClient>({
        name:{type:String, required:true},
        phoneNumber:String,
        email:String,
        firmId:{type:Schema.Types.ObjectId,required:true, ref:"Firm"},
},{
        timestamps:true
})

clientSchema.set("toJSON",{
        transform:(_doc,ret:any)=>{
                delete ret.createdAt
                delete ret.updatedAt
                delete ret.__v
                return ret
        }
})

const Client = models.Client || model<IClient>("Client",clientSchema)
export default Client;





























































































































































































































