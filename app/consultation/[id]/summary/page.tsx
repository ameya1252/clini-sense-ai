import { notFound } from "next/navigation"
import { sql } from "@/lib/db"
import { DisclaimerBanner } from "@/components/disclaimer-banner"
import { SummaryHeader } from "@/components/summary/summary-header"
import { SummaryContent } from "@/components/summary/summary-content"
import { SummaryClientWrapper } from "@/components/summary/summary-client-wrapper"
import type { Consultation, TranscriptEntry, AIEvent, SOAPNote } from "@/lib/db"

const MOCK_USER_ID = "demo-user-001"

interface SummaryPageProps {
  params: Promise<{ id: string }>
}

export default async function SummaryPage({ params }: SummaryPageProps) {
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
  const [transcripts, aiEvents, soapNotes] = await Promise.all([
    sql`
      SELECT * FROM transcript_entries 
      WHERE consultation_id = ${id}
      ORDER BY created_at ASC
    ` as Promise<TranscriptEntry[]>,
    sql`
      SELECT * FROM ai_events 
      WHERE consultation_id = ${id}
      ORDER BY created_at DESC
    ` as Promise<AIEvent[]>,
    sql`
      SELECT * FROM soap_notes 
      WHERE consultation_id = ${id}
    ` as Promise<SOAPNote[]>,
  ])

  const soapNote = soapNotes[0] || null

  return (
    <SummaryClientWrapper>
      <div className="min-h-screen flex flex-col">
        <DisclaimerBanner />
        <SummaryHeader consultation={consultation} />

        <main className="flex-1 p-4 lg:p-6">
          <SummaryContent
            consultation={consultation}
            transcripts={transcripts}
            aiEvents={aiEvents}
            initialSoapNote={soapNote}
          />
        </main>
      </div>
    </SummaryClientWrapper>
  )
}
