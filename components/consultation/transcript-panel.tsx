"use client"

import { useEffect, useRef } from "react"
import { formatDistanceToNow } from "date-fns"
import type { TranscriptEntry } from "@/lib/db"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Mic, MicOff } from "lucide-react"

interface TranscriptPanelProps {
  transcripts: TranscriptEntry[]
  interimTranscript: string
  isRecording: boolean
  isLoading?: boolean
}

function TranscriptSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-4 w-16 shrink-0 bg-secondary/60" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-full bg-secondary/60" />
            <Skeleton className="h-4 w-2/3 bg-secondary/60" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function TranscriptPanel({
  transcripts,
  interimTranscript,
  isRecording,
  isLoading = false,
}: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new transcripts arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [transcripts, interimTranscript])

  return (
    <div className="glass-panel rounded-xl flex flex-col gradient-border overflow-hidden h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {isRecording ? (
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <Mic className="h-4 w-4 text-primary" />
            </div>
          ) : (
            <MicOff className="h-4 w-4 text-muted-foreground" />
          )}
          <h3 className="font-semibold">Live Transcript</h3>
        </div>
        <span className="text-xs text-muted-foreground">{transcripts.length} entries</span>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {isLoading ? (
          <TranscriptSkeleton />
        ) : (
          <ScrollArea className="h-full p-4" ref={scrollRef}>
            <div className="space-y-3">
              {transcripts.length === 0 && !interimTranscript && (
                <div className="text-center py-12 text-muted-foreground">
                  <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Start recording to capture the consultation</p>
                </div>
              )}

              {transcripts.map((entry) => (
                <div key={entry.id} className="group">
                  <div className="flex items-start gap-3">
                    <span className="text-[10px] text-muted-foreground mt-1 w-16 flex-shrink-0">
                      {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                    </span>
                    <p className="text-sm leading-relaxed">{entry.content}</p>
                  </div>
                  {entry.confidence && (
                    <span className="text-[10px] text-muted-foreground ml-[76px]">
                      {Math.round(entry.confidence * 100)}% confidence
                    </span>
                  )}
                </div>
              ))}

              {/* Interim transcript (live typing effect) */}
              {interimTranscript && (
                <div className="flex items-start gap-3 opacity-70">
                  <span className="text-[10px] text-muted-foreground mt-1 w-16 flex-shrink-0">now</span>
                  <p className="text-sm leading-relaxed italic text-primary">
                    {interimTranscript}
                    <span className="animate-pulse">|</span>
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}
