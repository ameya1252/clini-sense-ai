"use client"

import { useCallback, useRef } from "react"
import type { AIEvent, TranscriptEntry } from "@/lib/db"

interface UseAIInsightsOptions {
  consultationId: string
  onAIEvent: (event: AIEvent) => void
}

export function useAIInsights({ consultationId, onAIEvent }: UseAIInsightsOptions) {
  const lastCallRef = useRef(0)
  const pendingTextRef = useRef("")
  const throttleMs = 5000 // 5 seconds minimum between calls
  const minTextLength = 50 // Minimum characters before processing

  const processTranscript = useCallback(
    async (newText: string, existingTranscripts: TranscriptEntry[]) => {
      pendingTextRef.current += " " + newText

      const now = Date.now()
      const timeSinceLastCall = now - lastCallRef.current
      const textLength = pendingTextRef.current.trim().length

      // Only call AI if enough time has passed and we have enough text
      if (timeSinceLastCall < throttleMs || textLength < minTextLength) {
        return
      }

      lastCallRef.current = now
      const textToProcess = pendingTextRef.current.trim()
      pendingTextRef.current = ""

      try {
        const response = await fetch("/api/ai/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            consultationId,
            transcript: textToProcess,
          }),
        })

        if (!response.ok) {
          console.error("[v0] AI analysis request failed")
          return
        }

        const data = await response.json()

        // Emit events to the callback
        if (data.events && Array.isArray(data.events)) {
          for (const event of data.events) {
            onAIEvent(event as AIEvent)
          }
        }
      } catch (error) {
        console.error("[v0] Error in AI processing:", error)
      }
    },
    [consultationId, onAIEvent],
  )

  return { processTranscript }
}
