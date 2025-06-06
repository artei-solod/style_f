declare module "next-auth" {
  interface Session {
    accessToken?: string
    refreshToken?: string
    userInfo?: any
    user: {
      id: string
      username?: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User {
    id: string
    username?: string
    accessToken?: string
    refreshToken?: string
    userInfo?: any
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    username?: string
    userInfo?: any
  }
}
