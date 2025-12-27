import { sql } from "@/lib/db"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ConsultationsList } from "@/components/dashboard/consultations-list"
import { StartConsultationCard } from "@/components/dashboard/start-consultation-card"
import { DisclaimerBanner } from "@/components/disclaimer-banner"
import { StatsGrid } from "@/components/dashboard/stats-grid"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { SystemStatus } from "@/components/dashboard/system-status"
import { StandaloneLabCard } from "@/components/dashboard/standalone-lab-card"
import type { Consultation } from "@/lib/db"

const MOCK_USER_ID = "demo-user-001"
const MOCK_USER_NAME = "Dr. Demo"

export default async function DashboardPage() {
  let consultations: Consultation[] = []
  const stats = { total: 0, active: 0, completed: 0, avgDuration: 0 }

  try {
    consultations = (await sql`
      SELECT * FROM consultations 
      WHERE user_id = ${MOCK_USER_ID}
      ORDER BY created_at DESC
      LIMIT 20
    `) as Consultation[]

    stats.total = consultations.length
    stats.active = consultations.filter((c) => c.status === "active" || c.status === "paused").length
    stats.completed = consultations.filter((c) => c.status === "completed").length

    const completedWithDuration = consultations.filter((c) => c.status === "completed" && c.ended_at)
    if (completedWithDuration.length > 0) {
      const totalMinutes = completedWithDuration.reduce((acc, c) => {
        const duration = (new Date(c.ended_at!).getTime() - new Date(c.started_at).getTime()) / 60000
        return acc + duration
      }, 0)
      stats.avgDuration = Math.round(totalMinutes / completedWithDuration.length)
    }
  } catch (error) {
    console.log("[v0] Could not fetch consultations - tables may not exist yet")
  }

  return (
    <div className="min-h-screen flex noise-bg grid-bg">
      {/* Left Sidebar - Quick Actions Taskbar */}
      <QuickActions />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <DisclaimerBanner />
        <DashboardHeader userName={MOCK_USER_NAME} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <div className="pl-2">
              <StatsGrid stats={stats} />
            </div>

            {/* Main Grid - 2 columns */}
            <div className="grid lg:grid-cols-12 gap-5 mt-5">
              {/* Left Column - Start Consultation + Consultations List */}
              <div className="lg:col-span-7 space-y-5">
                <StartConsultationCard userId={MOCK_USER_ID} />
                <ConsultationsList consultations={consultations} />
              </div>

              <div className="lg:col-span-5 space-y-5">
                <StandaloneLabCard userId={MOCK_USER_ID} />
                <SystemStatus />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
