import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex noise-bg grid-bg">
      {/* Left Sidebar Skeleton */}
      <div className="hidden md:flex w-16 xl:w-56 border-r border-border/50 flex-col p-3 gap-2 bg-background/50 backdrop-blur-sm shrink-0">
        <div className="p-2 mb-4">
          <Skeleton className="h-8 w-8 xl:w-full bg-secondary/60" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-full bg-secondary/50" />
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Disclaimer Banner Skeleton */}
        <div className="bg-secondary/30 px-4 py-2">
          <Skeleton className="h-4 w-3/4 mx-auto bg-secondary/50" />
        </div>

        {/* Header Skeleton */}
        <header className="border-b border-border/50 bg-background/50 backdrop-blur-sm px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg bg-secondary/60" />
              <Skeleton className="h-6 w-32 bg-secondary/50" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-20 bg-secondary/50" />
              <Skeleton className="h-8 w-8 rounded-full bg-secondary/50" />
              <Skeleton className="h-8 w-8 rounded-full bg-secondary/50" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {/* Stats Grid Skeleton */}
            <div className="pl-2 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-panel rounded-lg p-3 gradient-border">
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-3 w-16 bg-secondary/50" />
                    <Skeleton className="h-4 w-10 bg-secondary/40" />
                  </div>
                  <Skeleton className="h-6 w-12 bg-secondary/60" />
                </div>
              ))}
            </div>

            {/* Main Grid Skeleton */}
            <div className="grid lg:grid-cols-12 gap-5 mt-5">
              {/* Left Column */}
              <div className="lg:col-span-7 space-y-5">
                {/* Start Consultation Card Skeleton */}
                <div className="glass-panel rounded-xl p-4 gradient-border">
                  <div className="flex items-center gap-3 mb-3">
                    <Skeleton className="h-10 w-10 rounded-lg bg-secondary/60" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-40 mb-2 bg-secondary/60" />
                      <Skeleton className="h-3 w-56 bg-secondary/40" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-full bg-secondary/50" />
                </div>

                {/* Consultations List Skeleton */}
                <div className="glass-panel rounded-xl gradient-border overflow-hidden">
                  <div className="p-3 border-b border-border/50 flex items-center justify-between">
                    <Skeleton className="h-4 w-36 bg-secondary/60" />
                    <Skeleton className="h-3 w-16 bg-secondary/40" />
                  </div>
                  <div className="divide-y divide-border/30">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="p-3 flex items-center gap-3">
                        <Skeleton className="h-2 w-2 rounded-full bg-secondary/50" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-32 mb-1.5 bg-secondary/60" />
                          <Skeleton className="h-3 w-48 bg-secondary/40" />
                        </div>
                        <Skeleton className="h-4 w-4 bg-secondary/40" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - System Status Skeleton */}
              <div className="lg:col-span-5">
                <div className="glass-panel rounded-xl gradient-border h-full">
                  <div className="p-3 border-b border-border/50">
                    <Skeleton className="h-4 w-28 bg-secondary/60" />
                  </div>
                  <div className="p-3 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-2 w-2 rounded-full bg-secondary/50" />
                          <Skeleton className="h-3 w-24 bg-secondary/50" />
                        </div>
                        <Skeleton className="h-3 w-16 bg-secondary/40" />
                      </div>
                    ))}
                    <div className="pt-2 border-t border-border/30">
                      <div className="flex items-center justify-between mb-2">
                        <Skeleton className="h-3 w-20 bg-secondary/50" />
                        <Skeleton className="h-3 w-12 bg-secondary/40" />
                      </div>
                      <Skeleton className="h-1.5 w-full rounded-full bg-secondary/50" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
