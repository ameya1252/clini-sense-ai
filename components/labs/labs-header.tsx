"use client"

import Link from "next/link"
import { ArrowLeft, FlaskConical, FileText, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Consultation } from "@/lib/db"

interface LabsHeaderProps {
  consultation: Consultation
}

export function LabsHeader({ consultation }: LabsHeaderProps) {
  const formattedDate = new Date(consultation.started_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-8 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/consultation/${consultation.id}/summary`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <FlaskConical className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground">Lab Results</h1>
              <p className="text-xs text-muted-foreground">{formattedDate}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/consultation/${consultation.id}/summary`}>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <FileText className="h-4 w-4" />
              Summary
            </Button>
          </Link>
          <Link href={`/consultation/${consultation.id}/discharge`}>
            <Button size="sm" className="gap-2">
              Discharge & Handoff
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
