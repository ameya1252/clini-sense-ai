import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const { email, password, name, specialty, organization } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
    if (!dbUrl) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const sql = neon(dbUrl)

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM auth_users WHERE email = ${email}
    `

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    const bcrypt = await import("bcryptjs")
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const newUsers = await sql`
      INSERT INTO auth_users (email, password_hash, name)
      VALUES (${email}, ${passwordHash}, ${name || null})
      RETURNING id, email, name
    `

    const newUser = newUsers[0]

    // Create profile
    await sql`
      INSERT INTO profiles (user_id, full_name, specialty, organization)
      VALUES (${newUser.id}, ${name || null}, ${specialty || null}, ${organization || null})
    `

    return NextResponse.json({
      success: true,
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
    })
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
