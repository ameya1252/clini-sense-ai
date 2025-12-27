import { Skeleton } from "@/components/ui/skeleton"

export default function LabsLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Disclaimer skeleton */}
      <Skeleton className="h-10 w-full bg-secondary/50" />

      {/* Header skeleton */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded bg-secondary/60" />
            <div className="space-y-1">
              <Skeleton className="h-5 w-32 bg-secondary/60" />
              <Skeleton className="h-3 w-48 bg-secondary/50" />
            </div>
          </div>
          <Skeleton className="h-9 w-32 bg-secondary/60" />
        </div>
      </div>

      {/* Content skeleton */}
      <main className="flex-1 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Left: Lab Input (3 cols) */}
            <div className="lg:col-span-3 space-y-6">
              <div className="glass-panel rounded-xl p-6 gradient-border">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-5 w-32 bg-secondary/60" />
                  <Skeleton className="h-9 w-24 bg-secondary/60" />
                </div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-2">
                      <Skeleton className="h-10 flex-1 bg-secondary/50" />
                      <Skeleton className="h-10 w-20 bg-secondary/50" />
                      <Skeleton className="h-10 w-16 bg-secondary/50" />
                      <Skeleton className="h-10 w-28 bg-secondary/50" />
                      <Skeleton className="h-10 w-10 bg-secondary/50" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Checklist skeleton */}
              <div className="glass-panel rounded-xl p-6 gradient-border">
                <Skeleton className="h-5 w-40 mb-4 bg-secondary/60" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5 rounded bg-secondary/50" />
                      <Skeleton className="h-4 flex-1 bg-secondary/50" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: AI Insights (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-panel rounded-xl p-4 gradient-border">
                  <Skeleton className="h-4 w-36 mb-3 bg-secondary/60" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full bg-secondary/50" />
                    <Skeleton className="h-3 w-4/5 bg-secondary/50" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
