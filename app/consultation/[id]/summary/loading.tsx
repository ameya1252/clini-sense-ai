import { Skeleton } from "@/components/ui/skeleton"

export default function SummaryLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Disclaimer Banner Skeleton */}
      <div className="bg-secondary/30 px-4 py-2">
        <Skeleton className="h-4 w-3/4 mx-auto bg-secondary/50" />
      </div>

      {/* Header Skeleton */}
      <header className="border-b border-border/50 bg-background/50 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg bg-secondary/60" />
            <div>
              <Skeleton className="h-5 w-48 mb-1.5 bg-secondary/60" />
              <Skeleton className="h-3 w-32 bg-secondary/40" />
            </div>
          </div>
          <Skeleton className="h-9 w-32 bg-secondary/50" />
        </div>
      </header>

      <main className="flex-1 p-4 lg:p-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Key Findings Skeleton */}
            <div className="glass-panel rounded-xl p-4 gradient-border">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-5 w-5 bg-secondary/60" />
                <Skeleton className="h-5 w-28 bg-secondary/60" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20">
                    <Skeleton className="h-5 w-5 rounded-full shrink-0 bg-secondary/50" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-1.5 bg-secondary/50" />
                      <Skeleton className="h-3 w-full bg-secondary/40" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety Card Skeleton */}
            <div className="glass-panel rounded-xl p-4 gradient-border">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-5 w-5 bg-secondary/60" />
                <Skeleton className="h-5 w-40 bg-secondary/60" />
              </div>
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="p-3 rounded-lg bg-secondary/20">
                    <Skeleton className="h-4 w-full bg-secondary/50" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* SOAP Note Skeleton */}
            <div className="glass-panel rounded-xl p-4 gradient-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 bg-secondary/60" />
                  <Skeleton className="h-5 w-24 bg-secondary/60" />
                </div>
                <Skeleton className="h-8 w-24 bg-secondary/50" />
              </div>
              <div className="space-y-4">
                {["S", "O", "A", "P"].map((letter) => (
                  <div key={letter}>
                    <Skeleton className="h-4 w-20 mb-2 bg-secondary/50" />
                    <Skeleton className="h-20 w-full rounded-lg bg-secondary/40" />
                  </div>
                ))}
              </div>
            </div>

            {/* EHR Export Skeleton */}
            <div className="glass-panel rounded-xl p-4 gradient-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 bg-secondary/60" />
                  <Skeleton className="h-5 w-32 bg-secondary/60" />
                </div>
                <Skeleton className="h-9 w-28 bg-secondary/50" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
