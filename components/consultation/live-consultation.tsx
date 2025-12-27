"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import type { Consultation, TranscriptEntry, AIEvent } from "@/lib/db"
import { TranscriptPanel } from "./transcript-panel"
import { InsightsPanel } from "./insights-panel"
import { ControlBar } from "./control-bar"
import { AnalyzingOverlay } from "./analyzing-overlay"
import { useAudioRecording } from "@/hooks/use-audio-recording"
import { useDeepgramStreaming } from "@/hooks/use-deepgram-streaming"
import { Skeleton } from "@/components/ui/skeleton"

interface LiveConsultationProps {
  consultation: Consultation
  initialTranscripts: TranscriptEntry[]
  initialAIEvents: AIEvent[]
}

function ConsultationSkeleton() {
  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-4 overflow-hidden">
      <div className="flex-1 grid lg:grid-cols-2 gap-4 min-h-0 overflow-hidden">
        {/* Left: Transcript Panel Skeleton */}
        <div className="glass-panel rounded-xl flex flex-col gradient-border overflow-hidden h-full">
          <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 bg-secondary/80" />
              <Skeleton className="h-5 w-32 bg-secondary/80" />
            </div>
            <Skeleton className="h-4 w-16 bg-secondary/60" />
          </div>
          <div className="flex-1 p-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-4 w-16 shrink-0 bg-secondary/60" />
                <Skeleton className="h-4 w-full bg-secondary/60" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Insights Panel Skeleton */}
        <div className="glass-panel rounded-xl flex flex-col gradient-border overflow-hidden h-full">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-4 w-4 bg-secondary/80" />
              <Skeleton className="h-5 w-24 bg-secondary/80" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-full bg-secondary/60" />
              ))}
            </div>
          </div>
          <div className="flex-1 p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-lg border border-border/50 space-y-2">
                <Skeleton className="h-4 w-full bg-secondary/60" />
                <Skeleton className="h-4 w-3/4 bg-secondary/60" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: Control Bar Skeleton */}
      <div className="shrink-0">
        <div className="glass-panel rounded-xl p-4 flex items-center justify-center gap-4">
          <Skeleton className="h-12 w-32 rounded-lg bg-secondary/80" />
          <Skeleton className="h-12 w-32 rounded-lg bg-secondary/60" />
        </div>
      </div>
    </div>
  )
}

export function LiveConsultation({ consultation, initialTranscripts, initialAIEvents }: LiveConsultationProps) {
  const [status, setStatus] = useState<"idle" | "recording" | "paused">(
    consultation.status === "active" ? "idle" : "paused",
  )
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>(initialTranscripts)
  const [interimTranscript, setInterimTranscript] = useState("")
  const [aiEvents, setAIEvents] = useState<AIEvent[]>(initialAIEvents)
  const [isLoading, setIsLoading] = useState(true)
  const [showAnalyzing, setShowAnalyzing] = useState(false)

  // Track accumulated transcript for AI processing
  const accumulatedTextRef = useRef("")
  const lastAICallRef = useRef(0)
  const aiThrottleMs = 5000 // 5 seconds between AI calls

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  const processWithAI = useCallback(async (text: string, consultationId: string) => {
    console.log("[v0] Starting AI processing with text length:", text.length)

    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultationId,
          transcript: text,
        }),
      })

      console.log("[v0] AI response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] AI analyze failed:", response.status, errorText)
        return
      }

      const data = await response.json()
      console.log("[v0] AI response data:", JSON.stringify(data, null, 2))

      // Add new AI events to state
      if (data.events && Array.isArray(data.events) && data.events.length > 0) {
        console.log("[v0] Adding", data.events.length, "new AI events")

        setAIEvents((prev) => {
          // Simply prepend new events - the InsightsPanel handles deduplication
          const newEvents = [...data.events, ...prev]
          console.log("[v0] Total AI events after update:", newEvents.length)
          return newEvents
        })
      } else {
        console.log("[v0] No events in response or empty array")
      }
    } catch (error) {
      console.error("[v0] Error processing with AI:", error)
    }
  }, [])

  // Callback when we receive final transcript
  const handleFinalTranscript = useCallback(
    (entry: TranscriptEntry) => {
      setTranscripts((prev) => [...prev, entry])
      setInterimTranscript("")

      // Accumulate text for AI processing
      accumulatedTextRef.current += " " + entry.content

      // Throttle AI calls
      const now = Date.now()
      const timeSinceLastCall = now - lastAICallRef.current
      const textLength = accumulatedTextRef.current.trim().length

      console.log(
        "[v0] Final transcript received, accumulated length:",
        textLength,
        "time since last AI call:",
        timeSinceLastCall,
      )

      if (timeSinceLastCall > aiThrottleMs && textLength > 50) {
        lastAICallRef.current = now
        const textToProcess = accumulatedTextRef.current.trim()
        accumulatedTextRef.current = ""
        console.log("[v0] Triggering AI analysis...")
        processWithAI(textToProcess, entry.consultation_id)
      }
    },
    [processWithAI],
  )

  // Callback when we receive interim transcript
  const handleInterimTranscript = useCallback((text: string) => {
    setInterimTranscript(text)
  }, [])

  // Deepgram streaming hook
  const { connect, disconnect, sendAudio, isConnected } = useDeepgramStreaming({
    consultationId: consultation.id,
    onFinalTranscript: handleFinalTranscript,
    onInterimTranscript: handleInterimTranscript,
  })

  // Audio recording hook - sends audio to Deepgram
  const { startRecording, stopRecording } = useAudioRecording({
    onAudioData: sendAudio,
    sampleRate: 16000,
  })

  const handleStart = useCallback(async () => {
    setStatus("recording")
    await connect()
    // Small delay to ensure WebSocket is connected before starting audio
    setTimeout(async () => {
      await startRecording()
    }, 500)
  }, [connect, startRecording])

  const handlePause = useCallback(() => {
    setStatus("paused")
    stopRecording()
    disconnect()
  }, [stopRecording, disconnect])

  const handleResume = useCallback(async () => {
    setStatus("recording")
    await connect()
    setTimeout(async () => {
      await startRecording()
    }, 500)
  }, [connect, startRecording])

  const handleEndStart = useCallback(() => {
    setShowAnalyzing(true)
  }, [])

  if (isLoading) {
    return <ConsultationSkeleton />
  }

  return (
    <>
      {showAnalyzing && <AnalyzingOverlay />}

      <div className="h-[calc(100vh-140px)] flex flex-col gap-4 overflow-hidden">
        {/* Connection status indicator */}
        {status === "recording" && !isConnected && (
          <div className="text-center text-sm text-warning shrink-0">Connecting to transcription service...</div>
        )}

        {/* Main content area */}
        <div className="flex-1 grid lg:grid-cols-2 gap-4 min-h-0 overflow-hidden">
          {/* Left: Transcript Panel */}
          <TranscriptPanel
            transcripts={transcripts}
            interimTranscript={interimTranscript}
            isRecording={status === "recording"}
          />

          {/* Right: Insights Panel */}
          <InsightsPanel aiEvents={aiEvents} />
        </div>

        {/* Bottom: Control Bar */}
        <div className="shrink-0">
          <ControlBar
            consultationId={consultation.id}
            status={status}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onEndStart={handleEndStart}
          />
        </div>
      </div>
    </>
  )
}
