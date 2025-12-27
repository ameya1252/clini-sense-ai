"use client"

import { AlertCircle, TrendingUp, Link2, CheckCircle, Info, Loader2, FlaskConical } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LabAIInsight, LabResult } from "@/lib/db"
import { Skeleton } from "@/components/ui/skeleton"

interface LabInsightsPanelProps {
  insights: LabAIInsight[]
  isAnalyzing: boolean
  labResults: LabResult[]
}

const INSIGHT_CONFIG = {
  abnormal: {
    title: "Abnormal Values Identified",
    icon: AlertCircle,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
  },
  pattern: {
    title: "Lab Pattern Insights",
    icon: TrendingUp,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  correlation: {
    title: "Correlation with Presentation",
    icon: Link2,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
  },
  reassuring: {
    title: "Reassuring Findings",
    icon: CheckCircle,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
  },
}

function InsightCard({ insight }: { insight: LabAIInsight }) {
  const config = INSIGHT_CONFIG[insight.insight_type]
  const Icon = config.icon
  const content = insight.content as { items?: Array<{ text: string; detail?: string }> }

  return (
    <div className={cn("glass-panel rounded-xl p-4 gradient-border", config.bgColor, config.borderColor)}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={cn("h-4 w-4", config.color)} />
        <h3 className="text-sm font-semibold text-foreground">{config.title}</h3>
      </div>

      <div className="space-y-2">
        {content.items?.map((item, idx) => (
          <div key={idx} className="text-sm">
            <p className="text-foreground/90">{item.text}</p>
            {item.detail && <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>}
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-border/50">
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Info className="h-3 w-3" />
          For clinical context only — not diagnostic
        </p>
      </div>
    </div>
  )
}

function AnalyzingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="glass-panel rounded-xl p-4 gradient-border">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-4 w-4 rounded bg-secondary/60" />
            <Skeleton className="h-4 w-32 bg-secondary/60" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full bg-secondary/50" />
            <Skeleton className="h-3 w-4/5 bg-secondary/50" />
            <Skeleton className="h-3 w-3/5 bg-secondary/50" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function LabInsightsPanel({ insights, isAnalyzing, labResults }: LabInsightsPanelProps) {
  const hasAbnormalLabs = labResults.some((lr) => lr.flag === "abnormal" || lr.flag === "mild")

  if (isAnalyzing) {
    return (
      <div className="sticky top-20 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">Analyzing lab results...</span>
        </div>
        <AnalyzingSkeleton />
      </div>
    )
  }

  if (insights.length === 0) {
    return (
      <div className="sticky top-20">
        <div className="glass-panel rounded-xl p-6 gradient-border text-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <FlaskConical className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-sm font-semibold mb-1">AI Lab Analysis</h3>
          <p className="text-xs text-muted-foreground">
            {labResults.length === 0
              ? "Enter lab results and click 'Analyze Labs' to generate clinical insights."
              : hasAbnormalLabs
                ? "Click 'Analyze Labs' to get AI-powered clinical context for these values."
                : "All values appear within normal ranges. Click 'Analyze Labs' for detailed context."}
          </p>
        </div>
      </div>
    )
  }

  // Group insights by type
  const groupedInsights = {
    abnormal: insights.filter((i) => i.insight_type === "abnormal"),
    pattern: insights.filter((i) => i.insight_type === "pattern"),
    correlation: insights.filter((i) => i.insight_type === "correlation"),
    reassuring: insights.filter((i) => i.insight_type === "reassuring"),
  }

  return (
    <div className="sticky top-20 space-y-4">
      <h2 className="text-sm font-semibold text-muted-foreground">AI Lab Analysis</h2>

      {groupedInsights.abnormal.map((insight) => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
      {groupedInsights.pattern.map((insight) => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
      {groupedInsights.correlation.map((insight) => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
      {groupedInsights.reassuring.map((insight) => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
    </div>
  )
}
