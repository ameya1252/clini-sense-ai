import { Skeleton } from "@/components/ui/skeleton"

export default function DischargeLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Disclaimer banner skeleton */}
      <div className="h-8 bg-yellow-500/10 flex items-center justify-center">
        <Skeleton className="h-4 w-64 bg-secondary/50" />
      </div>

      {/* Header skeleton */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded bg-secondary/50" />
              <div>
                <Skeleton className="h-5 w-48 bg-secondary/50 mb-1" />
                <Skeleton className="h-3 w-32 bg-secondary/60" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-24 rounded bg-secondary/50" />
              <Skeleton className="h-8 w-24 rounded bg-secondary/50" />
            </div>
          </div>
        </div>
      </header>

      {/* Main content skeleton */}
      <main className="flex-1 p-4 lg:p-6">
        <div className="max-w-5xl mx-auto">
          {/* Tabs skeleton */}
          <div className="flex gap-2 mb-6">
            <Skeleton className="h-10 w-40 rounded bg-secondary/50" />
            <Skeleton className="h-10 w-40 rounded bg-secondary/50" />
            <Skeleton className="h-10 w-40 rounded bg-secondary/50" />
          </div>

          {/* Content skeleton */}
          <div className="glass-panel rounded-xl p-6">
            <Skeleton className="h-6 w-48 bg-secondary/50 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full bg-secondary/60" />
              <Skeleton className="h-4 w-5/6 bg-secondary/60" />
              <Skeleton className="h-4 w-4/5 bg-secondary/60" />
              <Skeleton className="h-4 w-full bg-secondary/60" />
              <Skeleton className="h-4 w-3/4 bg-secondary/60" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
