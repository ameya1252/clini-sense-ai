export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { generateText } from "ai"
import { saveAIEvent } from "@/lib/actions/consultations"

interface ClinicalInsights {
  entities: {
    symptoms: Array<{ name: string; duration?: string; severity?: string }>
    negatives: string[]
  }
  followUps: Array<{ category: string; question: string; priority: string }>
  safetyConsiderations: Array<{ description: string; severity: string; rationale?: string }>
}

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

IMPORTANT: Return ONLY valid JSON with no additional text, matching this exact structure:
{
  "entities": { "symptoms": [{"name": "...", "duration": "...", "severity": "..."}], "negatives": ["..."] },
  "followUps": [{ "category": "...", "question": "...", "priority": "high|medium|low" }],
  "safetyConsiderations": [{ "description": "...", "severity": "critical|warning|info", "rationale": "..." }]
}`

function parseAIResponse(text: string): ClinicalInsights | null {
  try {
    // Try to extract JSON from the response (in case there's extra text)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error("[v0] No JSON object found in response")
      return null
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Validate and normalize the structure
    return {
      entities: {
        symptoms: Array.isArray(parsed.entities?.symptoms)
          ? parsed.entities.symptoms.map((s: Record<string, unknown>) => ({
              name: String(s.name || ""),
              duration: String(s.duration || "not specified"),
              severity: String(s.severity || "not specified"),
            }))
          : [],
        negatives: Array.isArray(parsed.entities?.negatives) ? parsed.entities.negatives.map(String) : [],
      },
      followUps: Array.isArray(parsed.followUps)
        ? parsed.followUps.map((f: Record<string, unknown>) => ({
            category: String(f.category || "General"),
            question: String(f.question || ""),
            priority: ["high", "medium", "low"].includes(String(f.priority).toLowerCase())
              ? String(f.priority).toLowerCase()
              : "medium",
          }))
        : [],
      safetyConsiderations: Array.isArray(parsed.safetyConsiderations)
        ? parsed.safetyConsiderations.map((s: Record<string, unknown>) => ({
            description: String(s.description || ""),
            severity: ["critical", "warning", "info"].includes(String(s.severity).toLowerCase())
              ? String(s.severity).toLowerCase()
              : "info",
            rationale: String(s.rationale || ""),
          }))
        : [],
    }
  } catch (error) {
    console.error("[v0] JSON parse error:", error)
    console.error("[v0] Raw text was:", text.substring(0, 500))
    return null
  }
}

const EMPTY_INSIGHTS: ClinicalInsights = {
  entities: { symptoms: [], negatives: [] },
  followUps: [],
  safetyConsiderations: [],
}

export async function POST(request: Request) {
  console.log("[v0] AI analyze endpoint called")

  try {
    const body = await request.json()
    const { consultationId, transcript } = body

    console.log("[v0] Processing transcript:", {
      consultationId,
      transcriptLength: transcript?.length,
    })

    if (!consultationId || !transcript) {
      console.log("[v0] Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let insights: ClinicalInsights = EMPTY_INSIGHTS

    try {
      const result = await generateText({
        model: "openai/gpt-4o-mini",
        system: SYSTEM_PROMPT,
        prompt: `Analyze this clinical consultation transcript excerpt and extract relevant insights:

"${transcript}"

Return ONLY a JSON object with:
1. entities: symptoms (with name, duration, severity) and relevant negatives
2. followUps: array of questions with category, question text, and priority (high/medium/low)
3. safetyConsiderations: any red flags with description, severity (critical/warning/info), and rationale

If no relevant information for a category, return an empty array.
Remember: Do NOT diagnose, prescribe, or make definitive medical recommendations.
Return ONLY valid JSON, no additional text.`,
        temperature: 0.2,
        maxTokens: 2000,
      })

      console.log("[v0] Raw AI response received, length:", result.text.length)

      const parsed = parseAIResponse(result.text)
      if (parsed) {
        insights = parsed
        console.log("[v0] Successfully parsed insights:", {
          symptoms: insights.entities.symptoms.length,
          negatives: insights.entities.negatives.length,
          followUps: insights.followUps.length,
          safety: insights.safetyConsiderations.length,
        })
      } else {
        console.error("[v0] Failed to parse AI response, using empty insights")
      }
    } catch (aiError) {
      console.error("[v0] AI Gateway error:", aiError instanceof Error ? aiError.message : aiError)
      // Continue with empty insights rather than failing
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
      try {
        await saveAIEvent(consultationId, "follow_up", { questions: insights.followUps })
      } catch (dbError) {
        console.error("[v0] DB save error for follow_ups:", dbError)
      }
      events.push({
        event_type: "follow_up",
        content: { questions: insights.followUps },
      })
    }

    // Save safety considerations if present
    if (insights.safetyConsiderations.length > 0) {
      try {
        await saveAIEvent(consultationId, "red_flag", { flags: insights.safetyConsiderations })
      } catch (dbError) {
        console.error("[v0] DB save error for red_flags:", dbError)
      }
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
      eventsGenerated: eventsWithIds.length,
    })

    return NextResponse.json({ events: eventsWithIds })
  } catch (error) {
    console.error("[v0] AI analysis error:", error instanceof Error ? error.message : error)
    return NextResponse.json({ events: [] }, { status: 200 })
  }
}
