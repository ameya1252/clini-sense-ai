import { NextResponse } from "next/server"
import { generateObject } from "ai"
import { z } from "zod"
import { saveAIEvent } from "@/lib/actions/consultations"

const ClinicalInsightsSchema = z.object({
  entities: z
    .object({
      symptoms: z
        .array(
          z.object({
            name: z.string(),
            duration: z.string().nullable().optional().default("not specified"),
            severity: z.string().nullable().optional().default("not specified"),
          }),
        )
        .default([]),
      negatives: z.array(z.string()).default([]),
    })
    .default({ symptoms: [], negatives: [] }),
  followUps: z
    .array(
      z.object({
        category: z.string().default("General"),
        question: z.string(),
        priority: z.string().default("medium"), // Changed from enum to string for flexibility
      }),
    )
    .default([]),
  safetyConsiderations: z
    .array(
      z.object({
        description: z.string(),
        severity: z.string().default("info"), // Changed from enum to string for flexibility
        rationale: z.string().nullable().optional().default(""),
      }),
    )
    .default([]),
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

Be concise and clinically relevant. Prioritize safety-critical findings.

IMPORTANT: Always return valid JSON matching this exact structure:
{
  "entities": { "symptoms": [...], "negatives": [...] },
  "followUps": [{ "category": "...", "question": "...", "priority": "high|medium|low" }],
  "safetyConsiderations": [{ "description": "...", "severity": "critical|warning|info", "rationale": "..." }]
}`

export async function POST(request: Request) {
  console.log("[v0] AI analyze endpoint called")

  try {
    const body = await request.json()
    const { consultationId, transcript } = body

    console.log("[v0] Processing transcript:", {
      consultationId,
      transcriptLength: transcript?.length,
      hasTranscript: !!transcript,
    })

    if (!consultationId || !transcript) {
      console.log("[v0] Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let insights = null
    let attempts = 0
    const maxAttempts = 2

    while (attempts < maxAttempts && !insights) {
      attempts++
      console.log(`[v0] AI Gateway attempt ${attempts}/${maxAttempts}...`)

      try {
        const result = await generateObject({
          model: "openai/gpt-4o-mini",
          schema: ClinicalInsightsSchema,
          system: SYSTEM_PROMPT,
          prompt: `Analyze this clinical consultation transcript excerpt and extract relevant insights:

"${transcript}"

Extract the following in valid JSON format:
1. entities: symptoms (with name, duration, severity) and relevant negatives
2. followUps: array of questions with category, question text, and priority (high/medium/low)
3. safetyConsiderations: any red flags with description, severity (critical/warning/info), and rationale

If no relevant information for a category, return an empty array.
Remember: Do NOT diagnose, prescribe, or make definitive medical recommendations.`,
          temperature: 0.3, // Lower temperature for more consistent output
        })

        insights = result.object
        console.log("[v0] AI response received:", JSON.stringify(insights, null, 2))
      } catch (aiError: unknown) {
        console.error(`[v0] AI Gateway attempt ${attempts} error:`, aiError)

        if (attempts >= maxAttempts) {
          console.log("[v0] All attempts failed, returning empty insights")
          insights = {
            entities: { symptoms: [], negatives: [] },
            followUps: [],
            safetyConsiderations: [],
          }
        }
      }
    }

    if (!insights) {
      return NextResponse.json({ events: [] }, { status: 200 })
    }

    const events: Array<{ event_type: string; content: Record<string, unknown> }> = []

    // Save entities if present
    if (insights.entities.symptoms.length > 0 || insights.entities.negatives.length > 0) {
      try {
        await saveAIEvent(consultationId, "entities", insights.entities)
      } catch (dbError) {
        console.error("[v0] DB save error for entities:", dbError)
      }
      events.push({
        event_type: "entities",
        content: insights.entities,
      })
    }

    // Save follow-ups if present
    if (insights.followUps.length > 0) {
      const normalizedFollowUps = insights.followUps.map((f) => ({
        ...f,
        priority: ["high", "medium", "low"].includes(f.priority.toLowerCase()) ? f.priority.toLowerCase() : "medium",
      }))

      try {
        await saveAIEvent(consultationId, "follow_up", { questions: normalizedFollowUps })
      } catch (dbError) {
        console.error("[v0] DB save error for follow_ups:", dbError)
      }
      events.push({
        event_type: "follow_up",
        content: { questions: normalizedFollowUps },
      })
    }

    // Save safety considerations if present
    if (insights.safetyConsiderations.length > 0) {
      const normalizedSafety = insights.safetyConsiderations.map((s) => ({
        ...s,
        severity: ["critical", "warning", "info"].includes(s.severity.toLowerCase())
          ? s.severity.toLowerCase()
          : "info",
      }))

      try {
        await saveAIEvent(consultationId, "red_flag", { flags: normalizedSafety })
      } catch (dbError) {
        console.error("[v0] DB save error for red_flags:", dbError)
      }
      events.push({
        event_type: "red_flag",
        content: { flags: normalizedSafety },
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
      eventsGenerated: eventsWithIds.length,
    })

    return NextResponse.json({ events: eventsWithIds })
  } catch (error) {
    console.error("[v0] AI analysis error:", error)
    return NextResponse.json({ events: [] }, { status: 200 })
  }
}
