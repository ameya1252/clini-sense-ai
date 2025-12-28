import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { consultationId, handoff } = await request.json()

    await sql`
      INSERT INTO clinician_handoff (consultation_id, reason_for_visit, key_positive_findings, relevant_negatives, labs_summary, safety_considerations, pending_concerns, followup_needed)
      VALUES (${consultationId}, ${handoff.reason_for_visit}, ${handoff.key_positive_findings}, ${handoff.relevant_negatives}, ${handoff.labs_summary}, ${handoff.safety_considerations}, ${handoff.pending_concerns}, ${handoff.followup_needed})
      ON CONFLICT (consultation_id) DO UPDATE SET
        reason_for_visit = EXCLUDED.reason_for_visit,
        key_positive_findings = EXCLUDED.key_positive_findings,
        relevant_negatives = EXCLUDED.relevant_negatives,
        labs_summary = EXCLUDED.labs_summary,
        safety_considerations = EXCLUDED.safety_considerations,
        pending_concerns = EXCLUDED.pending_concerns,
        followup_needed = EXCLUDED.followup_needed,
        updated_at = NOW()
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error saving clinician handoff:", error)
    return NextResponse.json({ error: "Failed to save handoff" }, { status: 500 })
  }
}
