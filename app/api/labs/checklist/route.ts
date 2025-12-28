import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const { consultationId, itemKey, isChecked, itemLabel } = await request.json()

    if (!consultationId || !itemKey) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await sql`
      INSERT INTO lab_safety_checklist (consultation_id, item_key, item_label, is_checked, updated_at)
      VALUES (${consultationId}, ${itemKey}, ${itemLabel || itemKey}, ${isChecked}, NOW())
      ON CONFLICT (consultation_id, item_key) 
      DO UPDATE SET is_checked = ${isChecked}, updated_at = NOW()
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating checklist:", error)
    return NextResponse.json({ error: "Failed to update checklist" }, { status: 500 })
  }
}
