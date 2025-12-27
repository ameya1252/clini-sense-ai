"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import type { TranscriptEntry } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, ChevronDown, ChevronUp, Copy, Check } from "lucide-react"

interface TranscriptCardProps {
  transcripts: TranscriptEntry[]
}

export function TranscriptCard({ transcripts }: TranscriptCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  function handleCopy() {
    const fullTranscript = transcripts.map((t) => t.content).join("\n\n")
    navigator.clipboard.writeText(fullTranscript)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="glass-panel rounded-xl gradient-border overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Full Transcript</h2>
          <span className="text-xs text-muted-foreground">({transcripts.length} entries)</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-border">
          <div className="p-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {isCopied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              <span className="ml-1">{isCopied ? "Copied!" : "Copy Transcript"}</span>
            </Button>
          </div>

          <ScrollArea className="h-[400px] px-4 pb-4">
            <div className="space-y-3">
              {transcripts.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No transcript entries recorded.</p>
              ) : (
                transcripts.map((entry) => (
                  <div key={entry.id} className="group">
                    <div className="flex items-start gap-3">
                      <span className="text-[10px] text-muted-foreground mt-1 w-20 flex-shrink-0">
                        {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                      </span>
                      <p className="text-sm leading-relaxed">{entry.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
