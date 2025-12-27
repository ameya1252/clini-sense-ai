import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { consultationId, itemKey, isChecked } = await request.json()

    if (!consultationId || !itemKey) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await sql`
      UPDATE lab_safety_checklist 
      SET is_checked = ${isChecked}, updated_at = NOW()
      WHERE consultation_id = ${consultationId} AND item_key = ${itemKey}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating checklist:", error)
    return NextResponse.json({ error: "Failed to update checklist" }, { status: 500 })
  }
}
