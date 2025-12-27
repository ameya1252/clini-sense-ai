import { NextResponse } from "next/server"
import { generateObject } from "ai"
import { z } from "zod"
import { saveAIEvent } from "@/lib/actions/consultations"

// Schema for AI analysis output
const ClinicalInsightsSchema = z.object({
  entities: z.object({
    symptoms: z.array(
      z.object({
        name: z.string().describe("Name of the symptom"),
        duration: z.string().optional().describe("How long the symptom has been present"),
        severity: z.string().optional().describe("Severity level if mentioned"),
      }),
    ),
    negatives: z.array(z.string()).describe("Relevant negative findings mentioned"),
  }),
  followUps: z.array(
    z.object({
      category: z.string().describe("Category like History, Review of Systems, Physical Exam"),
      question: z.string().describe("The follow-up question to consider asking"),
      priority: z.enum(["high", "medium", "low"]).describe("Priority level"),
    }),
  ),
  safetyConsiderations: z.array(
    z.object({
      description: z.string().describe("Description of the safety consideration or red flag"),
      severity: z.enum(["critical", "warning", "info"]).describe("Severity level"),
      rationale: z.string().optional().describe("Brief rationale for this consideration"),
    }),
  ),
})

const SYSTEM_PROMPT = `You are a clinical decision support assistant. Your role is to help healthcare providers by:

1. EXTRACTING clinical entities from patient consultations (symptoms, duration, severity, relevant negatives)
2. SUGGESTING follow-up questions organized by category and priority
3. IDENTIFYING safety considerations and red flags that warrant attention

CRITICAL SAFETY RULES - YOU MUST FOLLOW:
- NEVER state diagnoses as facts - only mention "considerations" or "possibilities"
- NEVER prescribe or recommend specific medications, dosages, or treatments
- NEVER make definitive medical decisions
- Frame suggestions as "may consider" or "consider asking about"
- Focus on gathering more information, not concluding

Your output should help clinicians think through the case systematically while preserving their clinical judgment.

Be concise and clinically relevant. Prioritize safety-critical findings.`

export async function POST(request: Request) {
  try {
    console.log("[v0] AI analyze endpoint called")

    const { consultationId, transcript } = await request.json()
    console.log("[v0] Processing transcript:", { consultationId, transcriptLength: transcript?.length })

    if (!consultationId || !transcript) {
      console.log("[v0] Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate structured clinical insights using AI Gateway (no API key needed)
    console.log("[v0] Calling OpenAI via AI Gateway...")
    const result = await generateObject({
      model: "openai/gpt-4o-mini",
      schema: ClinicalInsightsSchema,
      system: SYSTEM_PROMPT,
      prompt: `Analyze this portion of a clinical consultation transcript and extract relevant insights:

"${transcript}"

Extract:
1. Clinical entities (symptoms with duration/severity if mentioned, relevant negatives)
2. Follow-up questions the clinician might consider (prioritized, categorized)
3. Any safety considerations or red flags (with severity and rationale)

Remember: Do NOT diagnose, prescribe, or make definitive medical recommendations.`,
    })

    console.log("[v0] AI response received:", JSON.stringify(result.object, null, 2))

    const insights = result.object
    const events: Array<{ event_type: string; content: Record<string, unknown> }> = []

    // Save entities if present
    if (insights.entities.symptoms.length > 0 || insights.entities.negatives.length > 0) {
      await saveAIEvent(consultationId, "entities", insights.entities)
      events.push({
        event_type: "entities",
        content: insights.entities,
      })
    }

    // Save follow-ups if present
    if (insights.followUps.length > 0) {
      await saveAIEvent(consultationId, "follow_up", { questions: insights.followUps })
      events.push({
        event_type: "follow_up",
        content: { questions: insights.followUps },
      })
    }

    // Save safety considerations if present
    if (insights.safetyConsiderations.length > 0) {
      await saveAIEvent(consultationId, "red_flag", { flags: insights.safetyConsiderations })
      events.push({
        event_type: "red_flag",
        content: { flags: insights.safetyConsiderations },
      })
    }

    // Return events with generated IDs for client state update
    const eventsWithIds = events.map((e) => ({
      id: crypto.randomUUID(),
      consultation_id: consultationId,
      event_type: e.event_type,
      content: e.content,
      created_at: new Date().toISOString(),
    }))

    console.log("[v0] AI analysis completed:", {
      consultationId,
      eventsGenerated: events.length,
    })

    return NextResponse.json({ events: eventsWithIds })
  } catch (error) {
    console.error("[v0] AI analysis error:", error)
    return NextResponse.json({ error: "AI analysis failed", details: String(error) }, { status: 500 })
  }
}
