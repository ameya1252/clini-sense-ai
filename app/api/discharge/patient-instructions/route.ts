import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { consultationId, instructions } = await request.json()

    await sql`
      INSERT INTO discharge_instructions (consultation_id, visit_summary, symptoms_discussed, watch_for, next_steps, disclaimer)
      VALUES (${consultationId}, ${instructions.visit_summary}, ${instructions.symptoms_discussed}, ${instructions.watch_for}, ${instructions.next_steps}, ${instructions.disclaimer})
      ON CONFLICT (consultation_id) DO UPDATE SET
        visit_summary = EXCLUDED.visit_summary,
        symptoms_discussed = EXCLUDED.symptoms_discussed,
        watch_for = EXCLUDED.watch_for,
        next_steps = EXCLUDED.next_steps,
        disclaimer = EXCLUDED.disclaimer,
        updated_at = NOW()
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error saving patient instructions:", error)
    return NextResponse.json({ error: "Failed to save instructions" }, { status: 500 })
  }
}
