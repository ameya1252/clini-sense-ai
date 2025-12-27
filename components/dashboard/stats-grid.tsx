"use client"

import { Activity, CheckCircle, Clock, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface StatsGridProps {
  stats: {
    total: number
    active: number
    completed: number
    avgDuration: number
  }
  isLoading?: boolean
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="glass-panel-solid rounded-xl p-3 gradient-border">
          <div className="flex items-start justify-between">
            <Skeleton className="h-8 w-8 rounded-lg bg-secondary/80" />
            <Skeleton className="h-4 w-10 rounded-full bg-secondary/60" />
          </div>
          <div className="mt-3 space-y-1.5">
            <Skeleton className="h-7 w-14 bg-secondary/80" />
            <Skeleton className="h-3 w-24 bg-secondary/60" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function StatsGrid({ stats, isLoading = false }: StatsGridProps) {
  if (isLoading) {
    return <StatsSkeleton />
  }

  const statCards = [
    {
      label: "Total Consultations",
      value: stats.total,
      icon: Activity,
      color: "primary",
      trend: "+12%",
      trendUp: true,
    },
    {
      label: "Active Sessions",
      value: stats.active,
      icon: Clock,
      color: "warning",
      trend: stats.active > 0 ? "Live" : "None",
      isLive: stats.active > 0,
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      color: "success",
      trend: "+8%",
      trendUp: true,
    },
    {
      label: "Avg. Duration",
      value: `${stats.avgDuration || 0}m`,
      icon: TrendingUp,
      color: "primary",
      trend: "-2m",
      trendUp: true,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {statCards.map((stat, index) => (
        <div
          key={stat.label}
          className="glass-panel-solid rounded-xl p-3 md:p-4 card-hover gradient-border group"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-start justify-between">
            <div
              className={`p-2 rounded-lg ${
                stat.color === "primary"
                  ? "bg-primary/20 group-hover:bg-primary/30"
                  : stat.color === "warning"
                    ? "bg-warning/20 group-hover:bg-warning/30"
                    : "bg-success/20 group-hover:bg-success/30"
              } transition-colors`}
            >
              <stat.icon
                className={`h-4 w-4 ${
                  stat.color === "primary" ? "text-primary" : stat.color === "warning" ? "text-warning" : "text-success"
                }`}
              />
            </div>
            {stat.isLive ? (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-warning/20 border border-warning/30">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-warning" />
                </span>
                <span className="text-[10px] font-medium text-warning">Live</span>
              </div>
            ) : (
              <span className={`text-[10px] font-medium ${stat.trendUp ? "text-success" : "text-muted-foreground"}`}>
                {stat.trend}
              </span>
            )}
          </div>
          <div className="mt-3">
            <p className="text-2xl md:text-3xl font-bold tracking-tight">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
