import mongoose , {Schema, model , models} from "mongoose";
export interface IUser{
    email:string;
    name:string;
    phoneNumber?:string;
    image?:string;
    googleId?:string;
    firmId?:mongoose.Types.ObjectId;
    role?:"solo"|"ca"|"owner",default:"solo";
    _id?:mongoose.Types.ObjectId;
    referralCode?:string;
    referredBy?:string;
    createdAt?:Date;
    updatedAt?:Date;
    
}

const userSchema = new Schema<IUser>(
    {
    email:{type:String, required:true , unique:true},
    name:{type:String,required:true},
    image:String ,
    googleId:String,
    phoneNumber:String,
    firmId:{type:Schema.Types.ObjectId,ref:"Firm" },
    role:{type:String,enum:["solo","ca","owner"],default:"solo"},
    referralCode:String,
    referredBy:String,
},
{
    timestamps:true
}

)

const User = models.User || model<IUser>("User", userSchema)

export default User;