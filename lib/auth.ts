import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"

const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:8000"
const API_PREFIX = "/api/v1"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          const formData = new FormData()
          formData.append("username", credentials.username)
          formData.append("password", credentials.password)

          const response = await fetch(`${API_BASE_URL}${API_PREFIX}/token`, {
            method: "POST",
            body: formData,
          })

          const data = await response.json()

          if (response.ok && data.access_token) {
            return {
              id: data.user_info?.email || data.user_info?.phone || credentials.username,
              email: data.user_info?.email || credentials.username,
              name: data.user_info?.email || credentials.username,
              username: credentials.username,
              accessToken: data.access_token,
              refreshToken: data.refresh_token,
              userInfo: data.user_info,
            }
          }

          return null
        } catch (error) {
          console.error("Login error:", error)
          return null
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        if (account.provider === "google") {
          try {
            const response = await fetch(`${API_BASE_URL}${API_PREFIX}/google_auth`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                token: account.id_token,
              }),
            })

            const data = await response.json()

            if (response.ok) {
              token.accessToken = data.access_token
              token.refreshToken = data.refresh_token
              token.username = user.email
              token.userInfo = data.user_info
            }
          } catch (error) {
            console.error("Google auth error:", error)
          }
        } else {
          token.accessToken = user.accessToken
          token.refreshToken = user.refreshToken
          token.username = user.username
          token.userInfo = user.userInfo
        }
      }

      return token
    },
    async session({ session, token }) {
      session.user.id = token.username as string
      session.user.username = token.username as string
      session.accessToken = token.accessToken as string
      session.refreshToken = token.refreshToken as string
      session.userInfo = token.userInfo as any

      return session
    },
  },
  pages: {
    signIn: "/login",
    signUp: "/signup",
  },
  session: {
    strategy: "jwt",
  },
}
