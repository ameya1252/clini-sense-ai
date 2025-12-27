import Link from "next/link"
import { Activity, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Consultation } from "@/lib/db"
import { format } from "date-fns"

interface SummaryHeaderProps {
  consultation: Consultation
}

export function SummaryHeader({ consultation }: SummaryHeaderProps) {
  return (
    <header className="border-b border-border glass-panel">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg glass-panel teal-glow-sm">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-semibold">Consultation Summary</span>
              <p className="text-xs text-muted-foreground">
                {format(new Date(consultation.started_at), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
