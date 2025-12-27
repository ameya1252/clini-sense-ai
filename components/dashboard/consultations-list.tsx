"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import type { Consultation } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Clock, CheckCircle, PauseCircle, ChevronRight, Sparkles } from "lucide-react"

interface ConsultationsListProps {
  consultations: Consultation[]
  isLoading?: boolean
}

const statusConfig = {
  active: {
    label: "Active",
    icon: Clock,
    className: "bg-primary/20 text-primary border-primary/30",
    dotClass: "bg-primary",
  },
  paused: {
    label: "Paused",
    icon: PauseCircle,
    className: "bg-warning/20 text-warning border-warning/30",
    dotClass: "bg-warning",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    className: "bg-success/20 text-success border-success/30",
    dotClass: "bg-success",
  },
}

function ConsultationSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-3 rounded-xl bg-secondary/30 border border-transparent">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="w-2 h-2 rounded-full bg-secondary/80" />
                <Skeleton className="h-4 w-40 bg-secondary/80" />
              </div>
              <Skeleton className="h-3 w-28 bg-secondary/60" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-full bg-secondary/80" />
              <Skeleton className="h-3.5 w-3.5 bg-secondary/60" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ConsultationsList({ consultations, isLoading = false }: ConsultationsListProps) {
  return (
    <div className="glass-panel-solid rounded-2xl p-5 gradient-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/20">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Recent Consultations</h2>
            <p className="text-xs text-muted-foreground">
              {isLoading ? <Skeleton className="h-3 w-16 inline-block" /> : `${consultations.length} sessions`}
            </p>
          </div>
        </div>
        <Link
          href="/consultations"
          className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-0.5"
        >
          View All
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* List */}
      {isLoading ? (
        <ConsultationSkeleton />
      ) : consultations.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="h-7 w-7 text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground font-medium text-sm">No consultations yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Start your first consultation to begin</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1.5 custom-scrollbar">
          {consultations.map((consultation, index) => {
            const status = statusConfig[consultation.status]
            const StatusIcon = status.icon
            const href =
              consultation.status === "completed"
                ? `/consultation/${consultation.id}/summary`
                : `/consultation/${consultation.id}`

            return (
              <Link
                key={consultation.id}
                href={href}
                className="group block p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all duration-200 border border-transparent hover:border-primary/20"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
                      <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                        {consultation.chief_complaint || "Consultation"}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(consultation.started_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className={`${status.className} text-[10px] px-1.5 py-0`}>
                      <StatusIcon className="h-2.5 w-2.5 mr-0.5" />
                      {status.label}
                    </Badge>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
