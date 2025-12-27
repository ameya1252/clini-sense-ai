import type { AIEvent } from "@/lib/db"
import { AlertTriangle, ShieldCheck } from "lucide-react"

interface SafetyCardProps {
  redFlagEvents: AIEvent[]
}

interface RedFlagContent {
  flags: Array<{
    description: string
    severity: "critical" | "warning" | "info"
    rationale?: string
  }>
}

export function SafetyCard({ redFlagEvents }: SafetyCardProps) {
  // Aggregate all flags
  const allFlags: RedFlagContent["flags"] = []

  for (const event of redFlagEvents) {
    const content = event.content as RedFlagContent
    if (content.flags) {
      for (const flag of content.flags) {
        if (!allFlags.some((f) => f.description === flag.description)) {
          allFlags.push(flag)
        }
      }
    }
  }

  // Sort by severity
  const severityOrder = { critical: 0, warning: 1, info: 2 }
  allFlags.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  const severityConfig = {
    critical: {
      className: "border-destructive bg-destructive/20",
      icon: "!!",
    },
    warning: {
      className: "border-warning bg-warning/20",
      icon: "!",
    },
    info: {
      className: "border-primary/50 bg-primary/10",
      icon: "i",
    },
  }

  return (
    <div className="glass-panel rounded-xl p-6 gradient-border">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-warning" />
        <h2 className="font-semibold">Safety Considerations</h2>
      </div>

      {allFlags.length === 0 ? (
        <div className="text-center py-8">
          <ShieldCheck className="h-12 w-12 mx-auto mb-3 text-green-400 opacity-70" />
          <p className="text-sm text-muted-foreground">No specific safety considerations identified.</p>
          <p className="text-xs text-muted-foreground mt-1">Always apply clinical judgment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allFlags.map((flag, i) => {
            const config = severityConfig[flag.severity]
            return (
              <div key={i} className={`p-3 rounded-lg border ${config.className}`}>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {config.icon}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{flag.description}</p>
                    {flag.rationale && <p className="text-xs text-muted-foreground mt-1">{flag.rationale}</p>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
