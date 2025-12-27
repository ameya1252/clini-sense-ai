"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mic, Loader2, Sparkles, Wand2 } from "lucide-react"
import { startConsultation } from "@/lib/actions/consultations"

interface StartConsultationCardProps {
  userId: string
}

export function StartConsultationCard({ userId }: StartConsultationCardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [chiefComplaint, setChiefComplaint] = useState("")
  const [isFocused, setIsFocused] = useState(false)

  async function handleStart(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await startConsultation(userId, chiefComplaint || undefined)
      if (result.success && result.consultationId) {
        router.push(`/consultation/${result.consultationId}`)
      }
    } catch (error) {
      console.error("[v0] Failed to start consultation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={`glass-panel-solid rounded-2xl p-5 gradient-border-full card-hover transition-all duration-300 ${
        isFocused ? "teal-glow" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="relative p-2.5 rounded-xl bg-primary/20 teal-glow-sm">
            <Mic className="h-5 w-5 text-primary" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-semibold">New Consultation</h2>
            <p className="text-xs text-muted-foreground">AI-powered assistant</p>
          </div>
        </div>
        <Sparkles className="h-4 w-4 text-primary/50 animate-pulse" />
      </div>

      {/* Form */}
      <form onSubmit={handleStart} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="chief-complaint" className="text-xs font-medium flex items-center gap-1.5">
            <Wand2 className="h-3 w-3 text-primary" />
            Chief Complaint
            <span className="text-muted-foreground font-normal">(Optional)</span>
          </Label>
          <Textarea
            id="chief-complaint"
            placeholder="E.g., Persistent headache for 3 days..."
            value={chiefComplaint}
            onChange={(e) => setChiefComplaint(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="bg-secondary/50 min-h-[90px] border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all resize-none text-sm"
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          className="w-full h-10 text-sm font-semibold bg-primary hover:bg-primary/90 teal-glow-sm hover:teal-glow transition-all duration-300"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Initializing...
            </>
          ) : (
            <>
              <Mic className="mr-2 h-4 w-4" />
              Start Consultation
            </>
          )}
        </Button>
      </form>

      {/* Bottom hint */}
      <p className="text-[10px] text-muted-foreground text-center mt-3">
        Press to begin real-time AI-assisted documentation
      </p>
    </div>
  )
}
