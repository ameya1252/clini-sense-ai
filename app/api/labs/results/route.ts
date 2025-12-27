import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, consultationId, test_name, value, unit, reference_range, test_date, flag } = body

    if (!consultationId || !test_name || !value) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO lab_results (id, consultation_id, test_name, value, unit, reference_range, test_date, flag)
      VALUES (${id}, ${consultationId}, ${test_name}, ${value}, ${unit || null}, ${reference_range || null}, ${test_date || new Date().toISOString()}, ${flag || null})
      ON CONFLICT (id) DO UPDATE SET
        test_name = ${test_name},
        value = ${value},
        unit = ${unit || null},
        reference_range = ${reference_range || null},
        flag = ${flag || null},
        updated_at = NOW()
      RETURNING *
    `

    return NextResponse.json({ labResult: result[0] })
  } catch (error) {
    console.error("[v0] Error saving lab result:", error)
    return NextResponse.json({ error: "Failed to save lab result" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    await sql`DELETE FROM lab_results WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting lab result:", error)
    return NextResponse.json({ error: "Failed to delete lab result" }, { status: 500 })
  }
}
