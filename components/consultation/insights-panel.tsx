"use client"

import { useState, useCallback, useMemo } from "react"
import type { AIEvent } from "@/lib/db"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertTriangle,
  HelpCircle,
  Tags,
  Brain,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ChevronDown,
} from "lucide-react"

interface InsightsPanelProps {
  aiEvents: AIEvent[]
  isLoading?: boolean
}

interface FollowUpContent {
  questions: Array<{
    category: string
    question: string
    priority: "high" | "medium" | "low"
  }>
}

interface RedFlagContent {
  flags: Array<{
    description: string
    severity: "critical" | "warning" | "info"
    rationale?: string
  }>
}

interface EntitiesContent {
  symptoms: Array<{
    name: string
    duration?: string
    severity?: string
  }>
  negatives: string[]
}

type ItemStatus = "pending" | "accepted" | "dismissed" | "asked"

export function InsightsPanel({ aiEvents, isLoading = false }: InsightsPanelProps) {
  const [activeTab, setActiveTab] = useState("follow-ups")

  const followUps = aiEvents.filter((e) => e.event_type === "follow_up")
  const redFlags = aiEvents.filter((e) => e.event_type === "red_flag")
  const entities = aiEvents.filter((e) => e.event_type === "entities")

  const redFlagCount = redFlags.reduce((acc, e) => {
    const content = e.content as RedFlagContent
    return acc + (content.flags?.length || 0)
  }, 0)

  return (
    <div className="glass-panel rounded-xl flex flex-col gradient-border overflow-hidden h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">AI Insights</h3>
            <Badge variant="outline" className="ml-auto text-[10px] border-primary/30 text-primary">
              Clinician Review
            </Badge>
          </div>
          <TabsList className="grid grid-cols-3 bg-secondary/50">
            <TabsTrigger value="follow-ups" className="text-xs">
              <HelpCircle className="h-3 w-3 mr-1" />
              Follow-ups
            </TabsTrigger>
            <TabsTrigger value="red-flags" className="text-xs relative">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Safety
              {redFlagCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                >
                  {redFlagCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="entities" className="text-xs">
              <Tags className="h-3 w-3 mr-1" />
              Entities
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full">
            <TabsContent value="follow-ups" className="p-4 m-0">
              {isLoading ? <FollowUpsSkeleton /> : <FollowUpsContent events={followUps} />}
            </TabsContent>

            <TabsContent value="red-flags" className="p-4 m-0">
              {isLoading ? <SafetySkeleton /> : <RedFlagsContent events={redFlags} />}
            </TabsContent>

            <TabsContent value="entities" className="p-4 m-0">
              {isLoading ? <EntitiesSkeleton /> : <EntitiesContent events={entities} />}
            </TabsContent>
          </ScrollArea>
        </div>
      </Tabs>
    </div>
  )
}

function FollowUpsSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-32 mb-4 bg-secondary/80" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-3 rounded-lg border border-border/50 space-y-2">
          <Skeleton className="h-4 w-full bg-secondary/80" />
          <Skeleton className="h-4 w-3/4 bg-secondary/60" />
          <div className="flex justify-between pt-2">
            <Skeleton className="h-5 w-20 bg-secondary/80" />
            <Skeleton className="h-7 w-16 bg-secondary/60" />
          </div>
        </div>
      ))}
    </div>
  )
}

function SafetySkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-32 mb-4 bg-secondary/80" />
      {[1, 2].map((i) => (
        <div key={i} className="p-3 rounded-lg border border-border/50 space-y-2">
          <div className="flex items-start gap-2">
            <Skeleton className="h-5 w-5 rounded-full bg-secondary/80" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full bg-secondary/80" />
              <Skeleton className="h-3 w-2/3 bg-secondary/60" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EntitiesSkeleton() {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-3 w-16 mb-2 bg-secondary/80" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-6 w-20 rounded-full bg-secondary/60" />
          ))}
        </div>
      </div>
      <div>
        <Skeleton className="h-3 w-24 mb-2 bg-secondary/80" />
        <div className="flex flex-wrap gap-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-6 w-16 rounded-full bg-secondary/60" />
          ))}
        </div>
      </div>
    </div>
  )
}

function StatusIndicator({ status }: { status: ItemStatus }) {
  const config = {
    pending: { icon: Clock, label: "Not yet asked", className: "text-muted-foreground bg-muted/50" },
    accepted: { icon: CheckCircle2, label: "Accepted", className: "text-emerald-400 bg-emerald-500/20" },
    dismissed: {
      icon: XCircle,
      label: "Not relevant",
      className: "text-muted-foreground bg-muted/30 line-through opacity-60",
    },
    asked: { icon: MessageSquare, label: "Asked", className: "text-primary bg-primary/20" },
  }

  const { icon: Icon, label, className } = config[status]

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${className}`}>
      <Icon className="h-3 w-3" />
      {label}
    </div>
  )
}

function ActionButtons({
  status,
  onAccept,
  onDismiss,
  onMarkAsked,
  showAsked = false,
}: {
  status: ItemStatus
  onAccept: () => void
  onDismiss: () => void
  onMarkAsked?: () => void
  showAsked?: boolean
}) {
  if (status === "dismissed") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onAccept}
        className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
      >
        Restore
      </Button>
    )
  }

  if (status === "accepted" || status === "asked") {
    return <StatusIndicator status={status} />
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={onAccept}
        className="h-7 w-7 p-0 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20"
        title="Accept"
      >
        <Check className="h-3.5 w-3.5" />
      </Button>
      {showAsked && onMarkAsked && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onMarkAsked}
          className="h-7 w-7 p-0 text-primary hover:text-primary hover:bg-primary/20"
          title="Mark as Asked"
        >
          <MessageSquare className="h-3.5 w-3.5" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={onDismiss}
        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/20"
        title="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

function FollowUpsContent({ events }: { events: AIEvent[] }) {
  const [statuses, setStatuses] = useState<Record<string, ItemStatus>>({})
  const [showAll, setShowAll] = useState(false)
  // Track order of questions as they arrive
  const [questionOrder, setQuestionOrder] = useState<string[]>([])

  const updateStatus = useCallback((key: string, status: ItemStatus) => {
    setStatuses((prev) => ({ ...prev, [key]: status }))
  }, [])

  // Get all unique questions maintaining arrival order
  const allQuestions = useMemo(() => {
    const questions: Array<{ category: string; question: string; priority: "high" | "medium" | "low" }> = []
    const seen = new Set<string>()

    // Process events in reverse order (oldest first) to maintain sequence
    const reversedEvents = [...events].reverse()

    reversedEvents.forEach((e) => {
      const content = e.content as FollowUpContent
      if (content.questions) {
        content.questions.forEach((q) => {
          if (!seen.has(q.question)) {
            seen.add(q.question)
            questions.push(q)
          }
        })
      }
    })

    return questions
  }, [events])

  // Update question order when new questions arrive
  useMemo(() => {
    allQuestions.forEach((q) => {
      if (!questionOrder.includes(q.question)) {
        setQuestionOrder((prev) => [...prev, q.question])
      }
    })
  }, [allQuestions, questionOrder])

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <HelpCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Follow-up questions will appear here</p>
        <p className="text-xs mt-1 opacity-70">Review and accept relevant suggestions</p>
      </div>
    )
  }

  const priorityColors = {
    high: "border-destructive/50 bg-destructive/10",
    medium: "border-warning/50 bg-warning/10",
    low: "border-muted-foreground/30 bg-muted/10",
  }

  // Sort: pending first (in original order), then accepted/asked, then dismissed
  const sortedQuestions = [...allQuestions].sort((a, b) => {
    const statusA = statuses[a.question] || "pending"
    const statusB = statuses[b.question] || "pending"

    // Dismissed always at bottom
    if (statusA === "dismissed" && statusB !== "dismissed") return 1
    if (statusB === "dismissed" && statusA !== "dismissed") return -1

    // If both same status, maintain original order
    const orderA = questionOrder.indexOf(a.question)
    const orderB = questionOrder.indexOf(b.question)
    return orderA - orderB
  })

  // Limit visible questions - show only first 3 pending ones plus all reviewed
  const pendingQuestions = sortedQuestions.filter((q) => !statuses[q.question] || statuses[q.question] === "pending")
  const reviewedQuestions = sortedQuestions.filter((q) => statuses[q.question] && statuses[q.question] !== "pending")

  const visiblePending = showAll ? pendingQuestions : pendingQuestions.slice(0, 3)
  const hiddenCount = pendingQuestions.length - visiblePending.length

  const displayQuestions = [...visiblePending, ...reviewedQuestions]

  const reviewedCount = Object.values(statuses).filter((s) => s === "accepted" || s === "asked").length

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-border/50 mb-3">
        <span className="text-xs text-muted-foreground">
          {reviewedCount} / {allQuestions.length} reviewed
        </span>
        {pendingQuestions.length > 3 && (
          <Badge variant="outline" className="text-[10px] ml-auto">
            {pendingQuestions.length} pending
          </Badge>
        )}
      </div>

      {displayQuestions.map((q, i) => {
        const status = statuses[q.question] || "pending"
        const isDismissed = status === "dismissed"

        return (
          <div
            key={q.question}
            className={`p-3 rounded-lg border transition-all duration-200 ${
              isDismissed ? "opacity-50 bg-muted/20 border-muted/30" : priorityColors[q.priority]
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className={`text-sm flex-1 ${isDismissed ? "line-through" : ""}`}>{q.question}</p>
              <Badge variant="outline" className="text-[10px] shrink-0">
                {q.category}
              </Badge>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
              <StatusIndicator status={status} />
              <ActionButtons
                status={status}
                onAccept={() => updateStatus(q.question, "accepted")}
                onDismiss={() => updateStatus(q.question, "dismissed")}
                onMarkAsked={() => updateStatus(q.question, "asked")}
                showAsked={true}
              />
            </div>
          </div>
        )
      })}

      {/* Show more button */}
      {hiddenCount > 0 && !showAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(true)}
          className="w-full text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronDown className="h-3 w-3 mr-1" />
          Show {hiddenCount} more questions
        </Button>
      )}
    </div>
  )
}

function RedFlagsContent({ events }: { events: AIEvent[] }) {
  const [statuses, setStatuses] = useState<Record<string, ItemStatus>>({})

  const updateStatus = useCallback((key: string, status: ItemStatus) => {
    setStatuses((prev) => ({ ...prev, [key]: status }))
  }, [])

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertTriangle className="h-10 w-10 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Safety considerations will appear here</p>
        <p className="text-xs mt-1 opacity-70">Review and acknowledge safety signals</p>
      </div>
    )
  }

  const allFlags = events.flatMap((e) => {
    const content = e.content as RedFlagContent
    return content.flags || []
  })

  const uniqueFlags = allFlags.filter((f, i, arr) => arr.findIndex((x) => x.description === f.description) === i)

  const severityConfig = {
    critical: { className: "border-destructive bg-destructive/20", iconBg: "bg-destructive/30", icon: "!!" },
    warning: { className: "border-warning bg-warning/20", iconBg: "bg-warning/30", icon: "!" },
    info: { className: "border-primary/50 bg-primary/10", iconBg: "bg-primary/30", icon: "i" },
  }

  const sortedFlags = [...uniqueFlags].sort((a, b) => {
    const statusA = statuses[a.description] || "pending"
    const statusB = statuses[b.description] || "pending"
    const order = { pending: 0, accepted: 1, asked: 1, dismissed: 2 }
    return order[statusA] - order[statusB]
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-border/50 mb-3">
        <span className="text-xs text-muted-foreground">
          {Object.values(statuses).filter((s) => s === "accepted").length} / {uniqueFlags.length} acknowledged
        </span>
        {uniqueFlags.some((f) => f.severity === "critical" && statuses[f.description] !== "accepted") && (
          <Badge variant="destructive" className="text-[10px]">
            Action Required
          </Badge>
        )}
      </div>

      {sortedFlags.map((f, i) => {
        const config = severityConfig[f.severity]
        const status = statuses[f.description] || "pending"
        const isDismissed = status === "dismissed"

        return (
          <div
            key={i}
            className={`p-3 rounded-lg border transition-all duration-200 ${
              isDismissed ? "opacity-50 bg-muted/20 border-muted/30" : config.className
            }`}
          >
            <div className="flex items-start gap-2">
              <span
                className={`w-5 h-5 rounded-full ${config.iconBg} flex items-center justify-center text-xs font-bold shrink-0`}
              >
                {config.icon}
              </span>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isDismissed ? "line-through" : ""}`}>{f.description}</p>
                {f.rationale && <p className="text-xs text-muted-foreground mt-1">{f.rationale}</p>}
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/30">
              <StatusIndicator status={status} />
              <ActionButtons
                status={status}
                onAccept={() => updateStatus(f.description, "accepted")}
                onDismiss={() => updateStatus(f.description, "dismissed")}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function EntitiesContent({ events }: { events: AIEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Tags className="h-10 w-10 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Extracted entities will appear here</p>
      </div>
    )
  }

  const latestEvent = events[0]
  const content = latestEvent.content as EntitiesContent

  return (
    <div className="space-y-4">
      {content.symptoms && content.symptoms.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Symptoms</h4>
          <div className="flex flex-wrap gap-2">
            {content.symptoms.map((s, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {s.name}
                {s.duration && <span className="text-muted-foreground ml-1">({s.duration})</span>}
                {s.severity && <span className="text-warning ml-1">[{s.severity}]</span>}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {content.negatives && content.negatives.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Relevant Negatives
          </h4>
          <div className="flex flex-wrap gap-2">
            {content.negatives.map((n, i) => (
              <Badge key={i} variant="outline" className="text-xs text-muted-foreground">
                No {n}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
