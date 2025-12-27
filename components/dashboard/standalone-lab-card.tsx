"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FlaskConical, ArrowRight, Loader2, Upload, FileSpreadsheet, TrendingUp, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StandaloneLabCardProps {
  userId: string
}

export function StandaloneLabCard({ userId }: StandaloneLabCardProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateLabSession = async () => {
    setIsCreating(true)
    try {
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          type: "lab_only",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/consultation/${data.id}/labs`)
      }
    } catch (error) {
      console.error("Error creating lab session:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const features = [
    { icon: Upload, label: "CSV Import" },
    { icon: FileSpreadsheet, label: "Manual Entry" },
    { icon: TrendingUp, label: "Reference Ranges" },
    { icon: Brain, label: "AI Insights" },
  ]

  return (
    <div className="glass-panel-solid rounded-2xl p-6 gradient-border group hover:border-purple-500/40 transition-all duration-300 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center shrink-0 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-colors border border-purple-500/20">
            <FlaskConical className="h-7 w-7 text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground mb-1">Lab Analysis</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Analyze lab reports independently without a consultation. Get AI-powered insights and pattern detection.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {features.map((feature, index) => (
            <div
              key={feature.label}
              className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/40 border border-border/30"
            >
              <feature.icon className="h-4 w-4 text-purple-400/70" />
              <span className="text-xs font-medium text-muted-foreground">{feature.label}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleCreateLabSession}
          disabled={isCreating}
          className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 h-11 text-sm font-medium"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating Lab Session...
            </>
          ) : (
            <>
              <FlaskConical className="h-4 w-4" />
              Start Lab Analysis
              <ArrowRight className="h-4 w-4 ml-auto" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
