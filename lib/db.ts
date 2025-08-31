import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI){
    throw new Error("please define mongodb uri in env file")
}  
let cached = global.mongoose;

if(!cached){
    cached = global.mongoose = {conn:null , promise:null}
}
export async function connectionToDatabase() {
    if(cached.conn){
        return cached.conn
    }

    if(!cached.promise){
        const opts={
           
            maxPoolSize:10
        }
         cached.promise = mongoose.connect(MONGODB_URI,opts)
    .then(()=>mongoose.connection)
       console.log("✅ MongoDB connected successfully");
    }
    try{
        cached.conn = await cached.promise
    }
   catch(error){
    cached.promise=null
     console.error("❌ MongoDB connection failed:", error);
    throw error
   }
   return cached.conn
}