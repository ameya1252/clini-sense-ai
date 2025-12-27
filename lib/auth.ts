import type { NextAuthOptions } from "next-auth"
import { getServerSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "clini-sense-dev-secret-key-32chars",
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        try {
          const { neon } = await import("@neondatabase/serverless")
          const bcrypt = await import("bcryptjs")

          const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
          if (!dbUrl) {
            console.error("[v0] No DATABASE_URL configured")
            return null
          }

          const sql = neon(dbUrl)

          const users = await sql`
            SELECT id, email, password_hash, name FROM auth_users WHERE email = ${email}
          `

          if (!users || users.length === 0) {
            return null
          }

          const user = users[0]

          if (!user.password_hash) {
            return null
          }

          const passwordMatch = await bcrypt.compare(password, user.password_hash)

          if (!passwordMatch) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name || email,
          }
        } catch (error) {
          console.error("[v0] Auth error:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}

export async function auth() {
  return getServerSession(authOptions)
}
