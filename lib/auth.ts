import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectionToDatabase } from "./db";
import User from "@/models/User";
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn("Warning: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set.");
}
if (!process.env.NEXTAUTH_SECRET) {
  console.warn("Warning: NEXTAUTH_SECRET is not set.");
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],

  callbacks: {
    // Runs when JWT is created/updated
    async jwt({ token, user }) {
      // First login (user object available)
      if (user?.email) {
        
       try {
         await connectionToDatabase();
 
         let dbUser = await User.findOne({ email: user.email });
 
         if (!dbUser) {
           dbUser = await User.create({
             name: user.name,
             email: user.email,
             image: user.image,
             googleId: user.id, // make sure your schema has this
           });
         }
         token.id = dbUser?._id.toString();
         if(dbUser?.firmId)
         {token.firmId=dbUser.firmId.toString();}
         
       }
        catch (error) {
        console.error("NextAuth jwt callback DB error:", error);
       }
      }

      return token;
    },

    // Runs whenever session is checked (frontend / API)
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;

        if(token.firmId){
          session.user.firmId= token.firmId as string
        }
      }
      
      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/",
    error: "/",
  }

  secret: process.env.NEXTAUTH_SECRET,
};