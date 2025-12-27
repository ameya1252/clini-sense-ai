import { notFound } from "next/navigation"
import { sql } from "@/lib/db"
import { DisclaimerBanner } from "@/components/disclaimer-banner"
import { LabsHeader } from "@/components/labs/labs-header"
import { LabsContent } from "@/components/labs/labs-content"
import type { Consultation, LabResult, LabAIInsight, LabSafetyChecklistItem, TranscriptEntry, AIEvent } from "@/lib/db"

const MOCK_USER_ID = "demo-user-001"

interface LabsPageProps {
  params: Promise<{ id: string }>
}

export default async function LabsPage({ params }: LabsPageProps) {
  const { id } = await params

  // Fetch consultation
  const consultations = (await sql`
    SELECT * FROM consultations WHERE id = ${id} AND user_id = ${MOCK_USER_ID}
  `) as Consultation[]

  if (consultations.length === 0) {
    notFound()
  }

  const consultation = consultations[0]

  // Fetch all related data in parallel
  let labResults: LabResult[] = []
  let labInsights: LabAIInsight[] = []
  let safetyChecklist: LabSafetyChecklistItem[] = []
  let transcripts: TranscriptEntry[] = []
  let aiEvents: AIEvent[] = []

  try {
    const results = await Promise.all([
      sql`SELECT * FROM lab_results WHERE consultation_id = ${id} ORDER BY created_at ASC` as Promise<LabResult[]>,
      sql`SELECT * FROM lab_ai_insights WHERE consultation_id = ${id} ORDER BY created_at DESC` as Promise<
        LabAIInsight[]
      >,
      sql`SELECT * FROM lab_safety_checklist WHERE consultation_id = ${id} ORDER BY created_at ASC` as Promise<
        LabSafetyChecklistItem[]
      >,
      sql`SELECT * FROM transcript_entries WHERE consultation_id = ${id} ORDER BY created_at ASC` as Promise<
        TranscriptEntry[]
      >,
      sql`SELECT * FROM ai_events WHERE consultation_id = ${id} ORDER BY created_at DESC` as Promise<AIEvent[]>,
    ])
    labResults = results[0]
    labInsights = results[1]
    safetyChecklist = results[2]
    transcripts = results[3]
    aiEvents = results[4]
  } catch (error) {
    console.log("[v0] Labs tables may not exist yet:", error)
  }

  // Extract symptoms from AI events for correlation
  const symptoms: string[] = []
  aiEvents.forEach((event) => {
    if (event.event_type === "entities" && event.content) {
      const entities = event.content as { symptoms?: Array<{ name: string }> }
      if (entities.symptoms) {
        symptoms.push(...entities.symptoms.map((s) => s.name))
      }
    }
  })

  return (
    <div className="min-h-screen flex flex-col">
      <DisclaimerBanner />
      <LabsHeader consultation={consultation} />

      <main className="flex-1 p-4 lg:p-6">
        <LabsContent
          consultation={consultation}
          initialLabResults={labResults}
          initialLabInsights={labInsights}
          initialSafetyChecklist={safetyChecklist}
          symptoms={symptoms}
          transcript={transcripts.map((t) => t.content).join(" ")}
        />
      </main>
    </div>
  )
}
