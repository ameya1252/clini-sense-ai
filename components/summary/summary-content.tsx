"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FlaskConical } from "lucide-react"
import type { Consultation, TranscriptEntry, AIEvent, SOAPNote } from "@/lib/db"
import { KeyFindingsCard } from "./key-findings-card"
import { TranscriptCard } from "./transcript-card"
import { SOAPNoteEditor } from "./soap-note-editor"
import { SafetyCard } from "./safety-card"
import { FHIRExportButton } from "./fhir-export-button"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

interface SummaryContentProps {
  consultation: Consultation
  transcripts: TranscriptEntry[]
  aiEvents: AIEvent[]
  initialSoapNote: SOAPNote | null
}

function SummarySkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-end gap-3">
        <Skeleton className="h-10 w-28 bg-secondary/80" />
        <Skeleton className="h-10 w-36 bg-secondary/80" />
      </div>

      {/* Top row skeleton */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-xl p-6 gradient-border space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 bg-secondary/80" />
            <Skeleton className="h-5 w-32 bg-secondary/80" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-6 w-full rounded-full bg-secondary/60" />
            ))}
          </div>
        </div>
        <div className="glass-panel rounded-xl p-6 gradient-border space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 bg-secondary/80" />
            <Skeleton className="h-5 w-40 bg-secondary/80" />
          </div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full bg-secondary/60" />
            ))}
          </div>
        </div>
      </div>

      {/* SOAP Note skeleton */}
      <div className="glass-panel rounded-xl p-6 gradient-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 bg-secondary/80" />
            <Skeleton className="h-5 w-24 bg-secondary/80" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 bg-secondary/60" />
            <Skeleton className="h-8 w-20 bg-secondary/60" />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20 bg-secondary/80" />
              <Skeleton className="h-[150px] w-full bg-secondary/60" />
            </div>
          ))}
        </div>
      </div>

      {/* Transcript skeleton */}
      <div className="glass-panel rounded-xl p-6 gradient-border">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5 bg-secondary/80" />
          <Skeleton className="h-5 w-28 bg-secondary/80" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-4 w-16 shrink-0 bg-secondary/60" />
              <Skeleton className="h-4 w-full bg-secondary/60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SummaryContent({ consultation, transcripts, aiEvents, initialSoapNote }: SummaryContentProps) {
  const [soapNote, setSoapNote] = useState<SOAPNote | null>(initialSoapNote)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Simulate initial loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  // Auto-generate SOAP note if not exists
  useEffect(() => {
    if (!soapNote && transcripts.length > 0 && !isGenerating && !isLoading) {
      generateSOAPNote()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  async function generateSOAPNote() {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/ai/generate-soap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultationId: consultation.id }),
      })

      if (response.ok) {
        const data = await response.json()
        const newNote: SOAPNote = {
          id: crypto.randomUUID(),
          consultation_id: consultation.id,
          ...data.soapNote,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setSoapNote(newNote)

        // Save to database
        await fetch("/api/soap-notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            consultationId: consultation.id,
            ...data.soapNote,
          }),
        })
      }
    } catch (error) {
      console.error("Error generating SOAP note:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoading) {
    return <SummarySkeleton />
  }

  // Extract key findings from AI events
  const entitiesEvents = aiEvents.filter((e) => e.event_type === "entities")
  const redFlagEvents = aiEvents.filter((e) => e.event_type === "red_flag")
  const followUpEvents = aiEvents.filter((e) => e.event_type === "follow_up")

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-end gap-3">
        <Link href={`/consultation/${consultation.id}/labs`}>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <FlaskConical className="h-4 w-4" />
            Lab Results
          </Button>
        </Link>
        <FHIRExportButton
          consultation={consultation}
          transcripts={transcripts}
          aiEvents={aiEvents}
          soapNote={soapNote}
        />
      </div>

      {/* Top row: Key Findings and Safety */}
      <div className="grid lg:grid-cols-2 gap-6">
        <KeyFindingsCard consultation={consultation} entitiesEvents={entitiesEvents} followUpEvents={followUpEvents} />
        <SafetyCard redFlagEvents={redFlagEvents} />
      </div>

      {/* Middle: SOAP Note Editor */}
      <SOAPNoteEditor
        consultationId={consultation.id}
        soapNote={soapNote}
        onUpdate={setSoapNote}
        isGenerating={isGenerating}
        onRegenerate={generateSOAPNote}
      />

      {/* Bottom: Full Transcript */}
      <TranscriptCard transcripts={transcripts} />
    </div>
  )
}
