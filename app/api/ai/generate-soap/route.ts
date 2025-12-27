import { NextResponse } from "next/server"
import { generateObject } from "ai"
import { z } from "zod"
import { sql } from "@/lib/db"
import type { TranscriptEntry, AIEvent } from "@/lib/db"

// Schema for SOAP note generation
const SOAPNoteSchema = z.object({
  subjective: z.string().describe("Patient's chief complaint and history in their own words"),
  objective: z.string().describe("Factual observations mentioned (avoid making up exam findings not discussed)"),
  assessment: z.string().describe("Clinical considerations - NOT diagnoses. Use phrases like 'considerations include'"),
  plan: z.string().describe("Suggested next steps as considerations - investigations, follow-ups. NO prescriptions."),
})

const SOAP_SYSTEM_PROMPT = `You are a clinical documentation assistant helping to draft SOAP notes from consultation transcripts.

CRITICAL RULES:
- Use ONLY information from the provided transcript - do not invent findings
- In Assessment: Use "Considerations include..." or "Differential considerations..." - NEVER state diagnoses as facts
- In Plan: Use "May consider..." or "Consider..." for all recommendations
- NEVER include specific medication names, dosages, or prescriptions
- NEVER make definitive diagnostic statements
- Keep each section concise and clinically relevant
- If information is not available for a section, write "To be documented"

This is a support tool for the clinician's documentation - they will review and edit.`

const MOCK_USER_ID = "demo-user-001"

export async function POST(request: Request) {
  try {
    console.log("[v0] SOAP generation endpoint called")

    const { consultationId } = await request.json()

    if (!consultationId) {
      return NextResponse.json({ error: "Consultation ID required" }, { status: 400 })
    }

    const consultations = await sql`
      SELECT * FROM consultations WHERE id = ${consultationId} AND user_id = ${MOCK_USER_ID}
    `

    if (consultations.length === 0) {
      return NextResponse.json({ error: "Consultation not found" }, { status: 404 })
    }

    const consultation = consultations[0]

    // Fetch transcripts
    const transcripts = (await sql`
      SELECT * FROM transcript_entries 
      WHERE consultation_id = ${consultationId} 
      ORDER BY created_at ASC
    `) as TranscriptEntry[]

    // Fetch AI events
    const aiEvents = (await sql`
      SELECT * FROM ai_events 
      WHERE consultation_id = ${consultationId}
    `) as AIEvent[]

    // Build context for SOAP generation
    const transcriptText = transcripts.map((t) => t.content).join("\n")
    const entitiesEvents = aiEvents.filter((e) => e.event_type === "entities")
    const redFlagEvents = aiEvents.filter((e) => e.event_type === "red_flag")

    console.log("[v0] Generating SOAP note with context:", {
      transcriptLength: transcriptText.length,
      entitiesCount: entitiesEvents.length,
      redFlagsCount: redFlagEvents.length,
    })

    // Generate SOAP note
    const result = await generateObject({
      model: "openai/gpt-4o-mini",
      schema: SOAPNoteSchema,
      system: SOAP_SYSTEM_PROMPT,
      prompt: `Generate a SOAP note draft from this consultation:

Chief Complaint: ${consultation.chief_complaint || "Not specified"}

Transcript:
${transcriptText || "No transcript available"}

Previously Extracted Entities:
${JSON.stringify(
  entitiesEvents.map((e) => e.content),
  null,
  2,
)}

Safety Considerations Identified:
${JSON.stringify(
  redFlagEvents.map((e) => e.content),
  null,
  2,
)}

Create a clinically appropriate SOAP note draft. Remember:
- Only use information from the transcript
- Use "considerations" not diagnoses in Assessment
- Use "may consider" for all Plan items
- No medication names or doses`,
    })

    console.log("[v0] SOAP note generated for consultation:", consultationId)

    return NextResponse.json({ soapNote: result.object })
  } catch (error) {
    console.error("[v0] SOAP generation error:", error)
    return NextResponse.json({ error: "SOAP generation failed", details: String(error) }, { status: 500 })
  }
}
