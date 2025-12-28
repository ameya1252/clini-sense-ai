export const runtime = "nodejs"

import { generateText } from "ai"
import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { consultationId, transcript, soapNote, labResults, symptoms, safetyConsiderations, chiefComplaint } =
      await request.json()

    // Format labs for the prompt
    const labsSummary =
      labResults.length > 0
        ? labResults
            .map(
              (lr: any) =>
                `${lr.test_name}: ${lr.value} ${lr.unit || ""} (ref: ${lr.reference_range || "N/A"}) [${lr.flag || "pending"}]`,
            )
            .join("\n")
        : "No labs available"

    const systemPrompt = `You are a clinical documentation assistant creating a clinician-to-clinician handoff summary.

CRITICAL SAFETY RULES:
- NEVER diagnose - use probabilistic language like "concerning for", "consider", "may suggest"
- NEVER prescribe or recommend specific medications
- Present findings objectively
- Highlight safety considerations prominently

Generate a structured handoff in JSON format with these fields:
- reason_for_visit: Brief clinical reason (1-2 sentences)
- key_positive_findings: Important positive findings from history/exam
- relevant_negatives: Pertinent negatives that were explored
- labs_summary: Summary of lab findings (abnormal values highlighted, normal values noted as reassuring)
- safety_considerations: Red flags or concerns requiring attention
- pending_concerns: Unresolved issues or things to monitor
- followup_needed: Recommended follow-up (general, not prescriptive)

Use clinical language appropriate for provider-to-provider communication.`

    const userPrompt = `Create a clinician handoff summary:

Chief Complaint: ${chiefComplaint || "General consultation"}

Key Symptoms: ${symptoms.length > 0 ? symptoms.join(", ") : "Not specified"}

${
  soapNote
    ? `SOAP Note:
- Subjective: ${soapNote.subjective || "Not documented"}
- Objective: ${soapNote.objective || "Not documented"}
- Assessment: ${soapNote.assessment || "Not documented"}
- Plan: ${soapNote.plan || "Not documented"}`
    : "No SOAP note available"
}

Labs:
${labsSummary}

Safety Flags: ${safetyConsiderations.length > 0 ? safetyConsiderations.join("; ") : "None specifically flagged"}

Generate the clinician handoff in JSON format.`

    const result = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.3,
    })

    // Parse JSON from response
    let handoff = {
      reason_for_visit: "",
      key_positive_findings: "",
      relevant_negatives: "",
      labs_summary: "",
      safety_considerations: "",
      pending_concerns: "",
      followup_needed: "",
    }

    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        handoff = {
          reason_for_visit: parsed.reason_for_visit || "",
          key_positive_findings: parsed.key_positive_findings || "",
          relevant_negatives: parsed.relevant_negatives || "",
          labs_summary: parsed.labs_summary || "",
          safety_considerations: parsed.safety_considerations || "",
          pending_concerns: parsed.pending_concerns || "",
          followup_needed: parsed.followup_needed || "",
        }
      }
    } catch (parseError) {
      console.error("[v0] Error parsing AI response:", parseError)
    }

    // Save to database
    try {
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
    } catch (dbError) {
      console.error("[v0] Error saving to database:", dbError)
    }

    return NextResponse.json({
      handoff: {
        id: crypto.randomUUID(),
        consultation_id: consultationId,
        ...handoff,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[v0] Error generating clinician handoff:", error)
    return NextResponse.json({ error: "Failed to generate handoff" }, { status: 500 })
  }
}
