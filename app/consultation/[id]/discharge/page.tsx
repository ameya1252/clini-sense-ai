import { notFound } from "next/navigation"
import { sql } from "@/lib/db"
import { DisclaimerBanner } from "@/components/disclaimer-banner"
import { DischargeHeader } from "@/components/discharge/discharge-header"
import { DischargeContent } from "@/components/discharge/discharge-content"
import type {
  Consultation,
  TranscriptEntry,
  AIEvent,
  SOAPNote,
  LabResult,
  DischargeInstructions,
  ClinicianHandoff,
  DischargeChecklistItem,
} from "@/lib/db"

const MOCK_USER_ID = "demo-user-001"

interface DischargePageProps {
  params: Promise<{ id: string }>
}

function extractStringsFromObject(obj: unknown): string[] {
  if (!obj) return []
  if (typeof obj === "string") return [obj]
  if (Array.isArray(obj)) {
    return obj.flatMap((item) => {
      if (typeof item === "string") return [item]
      if (typeof item === "object" && item !== null) {
        // Handle { name: string } or { text: string } structures
        if ("name" in item && typeof item.name === "string") return [item.name]
        if ("text" in item && typeof item.text === "string") return [item.text]
        if ("label" in item && typeof item.label === "string") return [item.label]
      }
      return []
    })
  }
  if (typeof obj === "object" && obj !== null) {
    // Handle nested objects like { BMP: [...], CBC: [...] }
    return Object.values(obj).flatMap((value) => extractStringsFromObject(value))
  }
  return []
}

export default async function DischargePage({ params }: DischargePageProps) {
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
  let transcripts: TranscriptEntry[] = []
  let aiEvents: AIEvent[] = []
  let soapNotes: SOAPNote[] = []
  let labResults: LabResult[] = []
  let dischargeInstructions: DischargeInstructions[] = []
  let clinicianHandoff: ClinicianHandoff[] = []
  let dischargeChecklist: DischargeChecklistItem[] = []

  try {
    const results = await Promise.all([
      sql`SELECT * FROM transcript_entries WHERE consultation_id = ${id} ORDER BY created_at ASC` as Promise<
        TranscriptEntry[]
      >,
      sql`SELECT * FROM ai_events WHERE consultation_id = ${id} ORDER BY created_at DESC` as Promise<AIEvent[]>,
      sql`SELECT * FROM soap_notes WHERE consultation_id = ${id}` as Promise<SOAPNote[]>,
      sql`SELECT * FROM lab_results WHERE consultation_id = ${id} ORDER BY created_at ASC` as Promise<LabResult[]>,
      sql`SELECT * FROM discharge_instructions WHERE consultation_id = ${id}` as Promise<DischargeInstructions[]>,
      sql`SELECT * FROM clinician_handoff WHERE consultation_id = ${id}` as Promise<ClinicianHandoff[]>,
      sql`SELECT * FROM discharge_checklist WHERE consultation_id = ${id} ORDER BY created_at ASC` as Promise<
        DischargeChecklistItem[]
      >,
    ])
    transcripts = results[0]
    aiEvents = results[1]
    soapNotes = results[2]
    labResults = results[3]
    dischargeInstructions = results[4]
    clinicianHandoff = results[5]
    dischargeChecklist = results[6]
  } catch (error) {
    console.log("[v0] Discharge tables may not exist yet:", error)
  }

  const symptoms: string[] = []
  const safetyConsiderations: string[] = []

  aiEvents.forEach((event) => {
    if (event.event_type === "entities" && event.content) {
      const content = event.content as Record<string, unknown>
      // Try to extract symptoms from various possible structures
      if (content.symptoms) {
        symptoms.push(...extractStringsFromObject(content.symptoms))
      }
      // Also check for other symptom-like fields
      if (content.items) {
        symptoms.push(...extractStringsFromObject(content.items))
      }
    }
    if (event.event_type === "red_flag" && event.content) {
      const content = event.content as Record<string, unknown>
      // Try to extract safety considerations from various structures
      if (content.considerations) {
        safetyConsiderations.push(...extractStringsFromObject(content.considerations))
      }
      if (content.items) {
        safetyConsiderations.push(...extractStringsFromObject(content.items))
      }
      if (content.text && typeof content.text === "string") {
        safetyConsiderations.push(content.text)
      }
    }
  })

  return (
    <div className="min-h-screen flex flex-col">
      <DisclaimerBanner />
      <DischargeHeader consultation={consultation} />

      <main className="flex-1 p-4 lg:p-6">
        <DischargeContent
          consultation={consultation}
          transcripts={transcripts}
          soapNote={soapNotes[0] || null}
          labResults={labResults}
          symptoms={[...new Set(symptoms)].filter(Boolean)}
          safetyConsiderations={[...new Set(safetyConsiderations)].filter(Boolean)}
          initialDischargeInstructions={dischargeInstructions[0] || null}
          initialClinicianHandoff={clinicianHandoff[0] || null}
          initialDischargeChecklist={dischargeChecklist}
        />
      </main>
    </div>
  )
}
