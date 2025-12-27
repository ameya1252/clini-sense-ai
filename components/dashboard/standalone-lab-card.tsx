"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FlaskConical, ArrowRight, Loader2 } from "lucide-react"
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
          patientId: `LAB-${Date.now()}`,
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

  return (
    <div className="glass-panel rounded-xl p-4 gradient-border group hover:border-purple-500/30 transition-all duration-300">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0 group-hover:bg-purple-500/30 transition-colors">
          <FlaskConical className="h-5 w-5 text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground mb-1">Lab Analysis Only</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Analyze lab reports without a consultation. Import CSV or enter values manually.
          </p>
          <Button
            onClick={handleCreateLabSession}
            disabled={isCreating}
            size="sm"
            variant="outline"
            className="gap-2 text-xs border-purple-500/30 text-purple-400 hover:bg-purple-500/10 bg-transparent"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Start Lab Analysis
                <ArrowRight className="h-3 w-3" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
