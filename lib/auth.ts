import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectionToDatabase } from "./db";
import User from "@/models/User";


if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn("⚠️ GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing");
}

if (!process.env.NEXTAUTH_SECRET) {
  console.warn("⚠️ NEXTAUTH_SECRET is missing");
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],

  callbacks: {
   
    async signIn({ user }) {
      try {
        await connectionToDatabase();

        if (!user.email) return false;

        const dbUser = await User.findOne({ email: user.email });

        if (!dbUser) {
          // Always create user WITHOUT firm - everyone goes through onboarding
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            googleId: user.id,
            // No firmId - user must choose to create or join firm
            role: "staff", // Default role until they create/join firm
          });
        }

        return true;
      } catch (error) {
        console.error("❌ SignIn error:", error);
        return false;
      }
    },

    async jwt({ token }) {
      try {
        if (!token.email) return token;

        await connectionToDatabase();

        // Always fetch latest user data to get updated firm/role after invite acceptance
        const dbUser = await User.findOne({ email: token.email });

        if (dbUser) {
          token.id = dbUser._id.toString();
          token.firmId = dbUser.firmId?.toString() || null;
          token.role = dbUser.role;
        }

        return token;
      } catch (error) {
        console.error(" JWT callback error:", error);
        return token;
      }
    },

   
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.firmId = token.firmId as string;
        session.user.role = token.role as "owner" | "admin" | "staff";
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
  },

  secret: process.env.NEXTAUTH_SECRET,
};