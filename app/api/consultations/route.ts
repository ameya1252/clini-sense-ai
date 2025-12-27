import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { userId, patientId, type } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const consultationId = crypto.randomUUID()
    const now = new Date().toISOString()

    const consultationType = type || "full"

    await sql`
      INSERT INTO consultations (id, user_id, patient_id, status, started_at, created_at, updated_at)
      VALUES (${consultationId}, ${userId}, ${patientId || null}, ${consultationType === "lab_only" ? "completed" : "active"}, ${now}, ${now}, ${now})
    `

    return NextResponse.json({ id: consultationId, type: consultationType })
  } catch (error) {
    console.error("[v0] Error creating consultation:", error)
    return NextResponse.json({ error: "Failed to create consultation" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json()

    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 })
    }

    const now = new Date().toISOString()

    if (status === "completed") {
      await sql`
        UPDATE consultations 
        SET status = ${status}, ended_at = ${now}, updated_at = ${now}
        WHERE id = ${id}
      `
    } else {
      await sql`
        UPDATE consultations 
        SET status = ${status}, updated_at = ${now}
        WHERE id = ${id}
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating consultation:", error)
    return NextResponse.json({ error: "Failed to update consultation" }, { status: 500 })
  }
}
