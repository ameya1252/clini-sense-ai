import { redirect, notFound } from "next/navigation"
import { sql } from "@/lib/db"
import { DisclaimerBanner } from "@/components/disclaimer-banner"
import { ConsultationHeader } from "@/components/consultation/consultation-header"
import { LiveConsultation } from "@/components/consultation/live-consultation"
import type { Consultation, TranscriptEntry, AIEvent } from "@/lib/db"

const MOCK_USER_ID = "demo-user-001"

interface ConsultationPageProps {
  params: Promise<{ id: string }>
}

export default async function ConsultationPage({ params }: ConsultationPageProps) {
  const { id } = await params

  // Fetch consultation
  const consultations = (await sql`
    SELECT * FROM consultations WHERE id = ${id} AND user_id = ${MOCK_USER_ID}
  `) as Consultation[]

  if (consultations.length === 0) {
    notFound()
  }

  const consultation = consultations[0]

  // If completed, redirect to summary
  if (consultation.status === "completed") {
    redirect(`/consultation/${id}/summary`)
  }

  // Fetch existing transcripts
  const transcripts = (await sql`
    SELECT * FROM transcript_entries 
    WHERE consultation_id = ${id}
    ORDER BY created_at ASC
  `) as TranscriptEntry[]

  // Fetch existing AI events
  const aiEvents = (await sql`
    SELECT * FROM ai_events 
    WHERE consultation_id = ${id}
    ORDER BY created_at DESC
  `) as AIEvent[]

  return (
    <div className="min-h-screen flex flex-col">
      <DisclaimerBanner />
      <ConsultationHeader consultation={consultation} />

      <main className="flex-1 p-4 lg:p-6 overflow-hidden">
        <LiveConsultation consultation={consultation} initialTranscripts={transcripts} initialAIEvents={aiEvents} />
      </main>
    </div>
  )
}
