"use client"

import Link from "next/link"
import { Activity, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SafetyModeToggle } from "./safety-mode-toggle"
import type { Consultation } from "@/lib/db"

interface ConsultationHeaderProps {
  consultation: Consultation
}

export function ConsultationHeader({ consultation }: ConsultationHeaderProps) {
  return (
    <header className="border-b border-border glass-panel">
      <div className="max-w-full mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg glass-panel teal-glow-sm">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-semibold">
                <span className="text-primary">Clini</span>Sense
              </span>
              {consultation.chief_complaint && (
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{consultation.chief_complaint}</p>
              )}
            </div>
          </div>
        </div>

        <SafetyModeToggle />
      </div>
    </header>
  )
}
