import { NextResponse } from "next/server"
import { generateObject } from "ai"
import { z } from "zod"
import { sql } from "@/lib/db"

const LabInsightsSchema = z.object({
  abnormalFindings: z.array(
    z.object({
      text: z.string().describe("Clear description of the abnormal value with clinical significance"),
      detail: z
        .string()
        .describe(
          "Specific clinical context: what conditions this may be associated with, severity assessment, and what to consider",
        ),
    }),
  ),
  patternInsights: z.array(
    z.object({
      text: z.string().describe("Pattern identified across multiple lab values"),
      detail: z.string().describe("Clinical significance of this pattern and differential considerations"),
    }),
  ),
  correlations: z.array(
    z.object({
      text: z.string().describe("How lab findings relate to reported symptoms"),
      detail: z.string().describe("Explanation of pathophysiological connection"),
    }),
  ),
  reassuringFindings: z.array(
    z.object({
      text: z.string().describe("Normal lab values that help rule out certain conditions"),
      detail: z.string().describe("Why this finding is clinically reassuring"),
    }),
  ),
  suggestedFollowUp: z.array(
    z.object({
      test: z.string().describe("Suggested follow-up test name"),
      rationale: z.string().describe("Why this test may be helpful"),
    }),
  ),
  safetyPrompts: z.array(
    z.object({
      itemKey: z.string().describe("Key for the checklist item"),
      prompt: z.string().describe("Gentle prompt for the clinician"),
    }),
  ),
})

const SYSTEM_PROMPT = `You are an expert clinical laboratory medicine consultant providing systematic analysis of lab results. Your role is to deliver actionable, clinically relevant insights that help physicians interpret lab findings.

ANALYSIS FRAMEWORK - Follow this systematic approach:

1. ABNORMAL VALUES ANALYSIS
   - Identify each abnormal value
   - Classify severity: mildly abnormal, moderately abnormal, or critically abnormal
   - List differential diagnoses in order of likelihood
   - Note if the abnormality is isolated or part of a pattern

2. PATTERN RECOGNITION
   - Identify multi-parameter patterns (e.g., anemia workup, liver panel, renal function)
   - Recognize classic lab constellations (e.g., microcytic anemia pattern, DKA pattern, sepsis pattern)
   - Note trends if prior values available

3. CLINICAL CORRELATION
   - Connect lab findings to reported symptoms
   - Explain pathophysiology in practical terms
   - Identify findings that support or argue against suspected diagnoses

4. REASSURING FINDINGS
   - Highlight normal values that help exclude serious conditions
   - Note preserved organ function where relevant
   - Identify findings that suggest benign etiology

5. FOLLOW-UP RECOMMENDATIONS
   - Suggest additional tests that would clarify the picture
   - Recommend repeat testing timeframes if appropriate
   - Note any urgent actions needed

CRITICAL SAFETY RULES:
- Use probabilistic language: "consistent with", "may suggest", "often seen in"
- NEVER state definitive diagnoses - only associations and differentials
- NEVER recommend specific medications or dosages
- Always emphasize clinical correlation is required
- Flag critical values prominently
- Note when urgent action may be needed

OUTPUT STYLE:
- Be concise but thorough
- Use medical terminology appropriately
- Organize findings by clinical priority
- Provide actionable insights, not just data description`

export async function POST(request: Request) {
  try {
    const { consultationId, labResults, symptoms, transcript } = await request.json()

    if (!consultationId || !labResults || labResults.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Format lab results for AI with more detail
    const labSummary = labResults
      .map((lr: { test_name: string; value: string; unit: string; reference_range: string; flag: string }) => {
        const flagIndicator = lr.flag === "abnormal" ? "[ABNORMAL]" : lr.flag === "mild" ? "[BORDERLINE]" : "[NORMAL]"
        return `${flagIndicator} ${lr.test_name}: ${lr.value} ${lr.unit || ""} (Reference: ${lr.reference_range || "N/A"})`
      })
      .join("\n")

    const abnormalCount = labResults.filter((lr: { flag: string }) => lr.flag === "abnormal").length
    const borderlineCount = labResults.filter((lr: { flag: string }) => lr.flag === "mild").length

    const symptomsList = symptoms && symptoms.length > 0 ? `\n\nREPORTED SYMPTOMS:\n${symptoms.join("\n- ")}` : ""

    const clinicalContext = transcript
      ? `\n\nCLINICAL CONTEXT FROM CONSULTATION:\n${transcript.substring(0, 500)}...`
      : ""

    const result = await generateObject({
      model: "openai/gpt-4o",
      schema: LabInsightsSchema,
      system: SYSTEM_PROMPT,
      prompt: `Analyze these laboratory results and provide systematic clinical insights:

LAB RESULTS (${labResults.length} total, ${abnormalCount} abnormal, ${borderlineCount} borderline):
${labSummary}
${symptomsList}
${clinicalContext}

Provide a comprehensive but concise analysis following the systematic framework. Focus on:
1. Clinical significance of abnormal values with differential diagnoses
2. Multi-parameter patterns and their implications
3. Correlations with reported symptoms if any
4. Reassuring normal findings
5. Suggested follow-up tests if indicated

Remember: Use probabilistic language. Do NOT diagnose. Emphasize clinical correlation.`,
    })

    const insights = result.object

    // Clear previous insights for this consultation
    await sql`DELETE FROM lab_ai_insights WHERE consultation_id = ${consultationId}`

    // Save insights to database
    const savedInsights = []

    if (insights.abnormalFindings.length > 0) {
      const abnormalInsight = await sql`
        INSERT INTO lab_ai_insights (consultation_id, insight_type, content)
        VALUES (${consultationId}, 'abnormal', ${JSON.stringify({ items: insights.abnormalFindings })})
        RETURNING *
      `
      savedInsights.push(abnormalInsight[0])
    }

    if (insights.patternInsights.length > 0) {
      const patternInsight = await sql`
        INSERT INTO lab_ai_insights (consultation_id, insight_type, content)
        VALUES (${consultationId}, 'pattern', ${JSON.stringify({ items: insights.patternInsights })})
        RETURNING *
      `
      savedInsights.push(patternInsight[0])
    }

    if (insights.correlations.length > 0) {
      const correlationInsight = await sql`
        INSERT INTO lab_ai_insights (consultation_id, insight_type, content)
        VALUES (${consultationId}, 'correlation', ${JSON.stringify({ items: insights.correlations })})
        RETURNING *
      `
      savedInsights.push(correlationInsight[0])
    }

    if (insights.reassuringFindings.length > 0) {
      const reassuringInsight = await sql`
        INSERT INTO lab_ai_insights (consultation_id, insight_type, content)
        VALUES (${consultationId}, 'reassuring', ${JSON.stringify({ items: insights.reassuringFindings })})
        RETURNING *
      `
      savedInsights.push(reassuringInsight[0])
    }

    // Clear and update safety checklist
    await sql`DELETE FROM lab_safety_checklist WHERE consultation_id = ${consultationId}`

    const safetyChecklist = []
    const defaultItems = [
      { key: "abnormal_acknowledged", label: "Abnormal labs acknowledged" },
      { key: "critical_addressed", label: "Critical values addressed" },
      { key: "clinical_reasoning", label: "Labs incorporated into clinical reasoning" },
      { key: "followup_considered", label: "Follow-up labs considered if appropriate" },
    ]

    for (const item of defaultItems) {
      const prompt = insights.safetyPrompts.find((p) => p.itemKey === item.key)?.prompt || null

      const result = await sql`
        INSERT INTO lab_safety_checklist (consultation_id, item_key, item_label, prompt)
        VALUES (${consultationId}, ${item.key}, ${item.label}, ${prompt})
        ON CONFLICT (consultation_id, item_key) 
        DO UPDATE SET prompt = ${prompt}, updated_at = NOW()
        RETURNING *
      `
      safetyChecklist.push(result[0])
    }

    return NextResponse.json({
      insights: savedInsights,
      safetyChecklist,
      suggestedFollowUp: insights.suggestedFollowUp,
    })
  } catch (error) {
    console.error("[v0] Lab analysis error:", error)
    return NextResponse.json({ error: "Lab analysis failed", details: String(error) }, { status: 500 })
  }
}
