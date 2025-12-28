"use client"

import Link from "next/link"
import { ArrowLeft, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Consultation } from "@/lib/db"

interface DischargeHeaderProps {
  consultation: Consultation
}

export function DischargeHeader({ consultation }: DischargeHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-8 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/consultation/${consultation.id}/labs`}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Discharge & Handoff
              </h1>
              <p className="text-xs text-muted-foreground">
                {consultation.chief_complaint || "Consultation"} • {formatDate(consultation.started_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/consultation/${consultation.id}/labs`}>
              <Button variant="outline" size="sm" className="gap-2 text-xs bg-transparent">
                <ArrowLeft className="h-3 w-3" />
                Back to Labs
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="gap-2 text-xs bg-transparent">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
