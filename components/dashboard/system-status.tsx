"use client"

import { Activity, Cpu, Database, Wifi, CheckCircle2, Zap } from "lucide-react"

const systems = [
  { name: "AI Engine", icon: Cpu, status: "operational", latency: "45ms" },
  { name: "Speech Recognition", icon: Activity, status: "operational", latency: "120ms" },
  { name: "Database", icon: Database, status: "operational", latency: "12ms" },
  { name: "Real-time Sync", icon: Wifi, status: "operational", latency: "8ms" },
]

export function SystemStatus() {
  return (
    <div className="glass-panel-solid rounded-2xl p-5 gradient-border flex flex-col h-full flex-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-success/20">
            <Zap className="h-4 w-4 text-success" />
          </div>
          <div>
            <h2 className="text-base font-semibold">System Status</h2>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/20 border border-success/30">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
          </span>
          <span className="text-[10px] font-medium text-success">Online</span>
        </div>
      </div>

      {/* Systems List - flex-1 to take remaining space */}
      <div className="space-y-2 flex-1">
        {systems.map((system, index) => (
          <div
            key={system.name}
            className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/30 border border-border/30"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <system.icon className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="font-medium text-sm">{system.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono">{system.latency}</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            </div>
          </div>
        ))}
      </div>

      {/* Performance Bar - at the bottom */}
      <div className="mt-4 pt-4 border-t border-border/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium">System Performance</span>
          <span className="text-xs text-success font-semibold">98.5%</span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary/50 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-success" style={{ width: "98.5%" }} />
        </div>
      </div>
    </div>
  )
}
