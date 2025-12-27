import { Skeleton } from "@/components/ui/skeleton"

export default function ConsultationLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Disclaimer Banner Skeleton */}
      <div className="bg-secondary/30 px-4 py-2">
        <Skeleton className="h-4 w-3/4 mx-auto bg-secondary/50" />
      </div>

      {/* Header Skeleton */}
      <header className="border-b border-border/50 bg-background/50 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg bg-secondary/60" />
            <div>
              <Skeleton className="h-5 w-40 mb-1.5 bg-secondary/60" />
              <Skeleton className="h-3 w-24 bg-secondary/40" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-20 rounded-full bg-secondary/50" />
            <Skeleton className="h-8 w-8 rounded bg-secondary/50" />
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 lg:p-6 overflow-hidden">
        <div className="h-[calc(100vh-140px)] flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 grid lg:grid-cols-2 gap-4 min-h-0 overflow-hidden">
            {/* Left: Transcript Panel Skeleton */}
            <div className="glass-panel rounded-xl flex flex-col gradient-border overflow-hidden h-full">
              <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 bg-secondary/60" />
                  <Skeleton className="h-5 w-32 bg-secondary/60" />
                </div>
                <Skeleton className="h-4 w-16 bg-secondary/40" />
              </div>
              <div className="flex-1 p-4 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-4 w-16 shrink-0 bg-secondary/50" />
                    <Skeleton className="h-4 w-full bg-secondary/40" style={{ width: `${60 + Math.random() * 40}%` }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Insights Panel Skeleton */}
            <div className="glass-panel rounded-xl flex flex-col gradient-border overflow-hidden h-full">
              <div className="p-4 border-b border-border shrink-0">
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="h-4 w-4 bg-secondary/60" />
                  <Skeleton className="h-5 w-24 bg-secondary/60" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-8 w-full bg-secondary/50" />
                  ))}
                </div>
              </div>
              <div className="flex-1 p-4 space-y-3 overflow-hidden">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 rounded-lg border border-border/50 space-y-2">
                    <Skeleton className="h-4 w-full bg-secondary/50" />
                    <Skeleton className="h-4 w-3/4 bg-secondary/40" />
                    <div className="flex gap-2 pt-1">
                      <Skeleton className="h-6 w-16 bg-secondary/40" />
                      <Skeleton className="h-6 w-16 bg-secondary/40" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom: Control Bar Skeleton */}
          <div className="shrink-0">
            <div className="glass-panel rounded-xl p-4 flex items-center justify-center gap-4">
              <Skeleton className="h-11 w-36 rounded-lg bg-secondary/60" />
              <Skeleton className="h-11 w-36 rounded-lg bg-secondary/50" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
