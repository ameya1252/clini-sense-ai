export const runtime = "nodejs"

import { generateText } from "ai"
import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { consultationId, transcript, soapNote, symptoms, safetyConsiderations, chiefComplaint } =
      await request.json()

    const systemPrompt = `You are a medical documentation assistant helping create patient-friendly discharge instructions.

CRITICAL SAFETY RULES:
- NEVER diagnose or suggest diagnoses
- NEVER prescribe medications or suggest specific medications
- NEVER recommend dosages
- Use simple, reassuring, non-technical language
- Always emphasize following up with their healthcare provider

Generate discharge instructions in JSON format with these fields:
- visit_summary: Brief, patient-friendly summary of why they were seen (2-3 sentences)
- symptoms_discussed: List the key symptoms that were discussed in simple terms
- watch_for: Clear return precautions - when to seek care again (be specific but not alarming)
- next_steps: General follow-up guidance (not prescriptive)
- disclaimer: Always include "This summary is not a diagnosis. Please follow your healthcare provider's recommendations and contact them with any questions or concerns."

Keep language at an 8th-grade reading level. Be reassuring but clear about warning signs.`

    const userPrompt = `Create patient discharge instructions based on:

Chief Complaint: ${chiefComplaint || "General consultation"}

Symptoms Discussed: ${symptoms.length > 0 ? symptoms.join(", ") : "General symptoms"}

${
  soapNote
    ? `SOAP Note Summary:
- Subjective: ${soapNote.subjective || "Not documented"}
- Assessment considerations: ${soapNote.assessment || "Not documented"}
- Plan: ${soapNote.plan || "Not documented"}`
    : "No SOAP note available"
}

Safety Considerations: ${safetyConsiderations.length > 0 ? safetyConsiderations.join("; ") : "None specifically noted"}

Generate patient-friendly discharge instructions in JSON format.`

    const result = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.3,
    })

    // Parse JSON from response
    let instructions = {
      visit_summary: "",
      symptoms_discussed: "",
      watch_for: "",
      next_steps: "",
      disclaimer:
        "This summary is not a diagnosis. Please follow your healthcare provider's recommendations and contact them with any questions or concerns.",
    }

    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        instructions = {
          visit_summary: parsed.visit_summary || "",
          symptoms_discussed: parsed.symptoms_discussed || "",
          watch_for: parsed.watch_for || "",
          next_steps: parsed.next_steps || "",
          disclaimer: parsed.disclaimer || instructions.disclaimer,
        }
      }
    } catch (parseError) {
      console.error("[v0] Error parsing AI response:", parseError)
    }

    // Save to database
    try {
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
    } catch (dbError) {
      console.error("[v0] Error saving to database:", dbError)
    }

    return NextResponse.json({
      instructions: {
        id: crypto.randomUUID(),
        consultation_id: consultationId,
        ...instructions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[v0] Error generating patient instructions:", error)
    return NextResponse.json({ error: "Failed to generate instructions" }, { status: 500 })
  }
}
