import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { consultationId, itemKey, isChecked } = await request.json()

    await sql`
      INSERT INTO discharge_checklist (consultation_id, item_key, item_label, is_checked)
      VALUES (${consultationId}, ${itemKey}, ${itemKey}, ${isChecked})
      ON CONFLICT (consultation_id, item_key) DO UPDATE SET
        is_checked = ${isChecked},
        updated_at = NOW()
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating discharge checklist:", error)
    return NextResponse.json({ error: "Failed to update checklist" }, { status: 500 })
  }
}
