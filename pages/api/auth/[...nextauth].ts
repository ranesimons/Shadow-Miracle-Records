// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    // add more providers if you like
  ],
  secret: process.env.NEXTAUTH_SECRET,
  // optionally add callbacks, session config, pages override, etc.
};

export default NextAuth(authOptions);
