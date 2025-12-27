"use client"

import { AlertTriangle } from "lucide-react"

export function DisclaimerBanner() {
  return (
    <div className="w-full bg-warning/10 border-b border-warning/30 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <span className="text-warning font-medium">
          Clinical Decision Support Tool — does not replace professional judgment.
        </span>
      </div>
    </div>
  )
}
