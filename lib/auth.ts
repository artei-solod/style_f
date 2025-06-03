// ai-stylist-app/lib/auth.ts

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";

// Ensure you have BACKEND_URL in your .env.local, e.g.:
// BACKEND_URL=http://localhost:8000

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "john@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // ====================================
        // 1) Send form‐urlencoded login to /api/v1/token
        // ====================================
        const loginRes = await fetch(
          `${process.env.BACKEND_URL}/api/v1/token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              username: credentials.email,
              password: credentials.password,
            }),
          }
        );

        if (!loginRes.ok) {
          // e.g. 401 Invalid credentials
          return null;
        }

        const data = await loginRes.json();
        // data should look like:
        // {
        //   access_token: "…jwt…",
        //   token_type: "bearer",
        //   refresh_token: "…refresh…",
        //   user: { id: "...", email: "...", name: "..." }
        // }

        return {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],

  pages: {
    signIn: "/login",
    signUp: "/signup",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // On initial sign in, NextAuth gives us `user` + `account`
      if (account && user) {
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session as any).accessToken = (token as JWT)
          .accessToken as string;
        (session as any).refreshToken = (token as JWT)
          .refreshToken as string;
      }
      return session;
    },
  },
};
