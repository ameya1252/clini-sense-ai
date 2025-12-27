"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Mic, Pause, Play, Square } from "lucide-react"
import { updateConsultationStatus } from "@/lib/actions/consultations"

interface ControlBarProps {
  consultationId: string
  status: "idle" | "recording" | "paused"
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onEndStart?: () => void
}

function AnalyzingOverlayInline() {
  return (
    <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        {/* Animated AI brain icon */}
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full bg-accent/20 animate-ping"
            style={{ animationDuration: "2s" }}
          />
          <div
            className="absolute -inset-4 rounded-full bg-accent/10 animate-pulse"
            style={{ animationDuration: "1.5s" }}
          />
          <div
            className="absolute -inset-8 rounded-full bg-accent/5 animate-pulse"
            style={{ animationDuration: "2s" }}
          />

          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center shadow-lg shadow-accent/30">
            <svg
              className="absolute w-full h-full animate-spin"
              style={{ animationDuration: "3s" }}
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="20 10"
                className="text-background/30"
              />
            </svg>

            <svg
              className="w-10 h-10 text-background"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
              />
            </svg>
          </div>
        </div>

        <div className="text-center space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">AI Analyzing Consultation</h2>
          <p className="text-muted-foreground max-w-md">Processing transcript and generating clinical insights...</p>

          <div className="flex items-center justify-center gap-1.5 pt-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground mt-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
              <svg className="w-3 h-3 text-accent animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span>Saving transcript</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-background animate-pulse" />
            </div>
            <span className="text-foreground">Extracting insights</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-muted-foreground" />
            </div>
            <span>Preparing summary</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ControlBar({ consultationId, status, onStart, onPause, onResume, onEndStart }: ControlBarProps) {
  const [isEnding, setIsEnding] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function handleEnd() {
    setIsEnding(true)
    onPause()
    onEndStart?.()

    if (typeof window !== "undefined") {
      sessionStorage.setItem("clinisense_analyzing", "true")
    }

    try {
      await updateConsultationStatus(consultationId, "completed")

      startTransition(() => {
        router.push(`/consultation/${consultationId}/summary`)
      })
    } catch (error) {
      console.error("Error ending consultation:", error)
      setIsEnding(false)
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("clinisense_analyzing")
      }
    }
  }

  const showOverlay = isEnding || isPending

  return (
    <>
      {showOverlay && <AnalyzingOverlayInline />}

      <div className="glass-panel rounded-xl p-4 gradient-border">
        <div className="flex items-center justify-center gap-4">
          {status === "recording" && (
            <div className="flex items-center gap-2 mr-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-sm text-red-400 font-medium">Recording</span>
            </div>
          )}

          {status === "idle" && (
            <Button onClick={onStart} size="lg" className="teal-glow-sm">
              <Mic className="mr-2 h-5 w-5" />
              Start Recording
            </Button>
          )}

          {status === "recording" && (
            <Button onClick={onPause} variant="secondary" size="lg">
              <Pause className="mr-2 h-5 w-5" />
              Pause
            </Button>
          )}

          {status === "paused" && (
            <Button onClick={onResume} size="lg" className="teal-glow-sm">
              <Play className="mr-2 h-5 w-5" />
              Resume
            </Button>
          )}

          {status !== "idle" && (
            <Button onClick={handleEnd} variant="destructive" size="lg" disabled={showOverlay}>
              <Square className="mr-2 h-5 w-5" />
              {showOverlay ? "Ending..." : "End Consultation"}
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
