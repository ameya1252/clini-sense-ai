import type { Consultation, AIEvent } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Stethoscope, Clock, ThermometerSun, MinusCircle, HelpCircle } from "lucide-react"

interface KeyFindingsCardProps {
  consultation: Consultation
  entitiesEvents: AIEvent[]
  followUpEvents: AIEvent[]
}

interface EntitiesContent {
  symptoms: Array<{
    name: string
    duration?: string
    severity?: string
  }>
  negatives: string[]
}

interface FollowUpContent {
  questions: Array<{
    category: string
    question: string
    priority: "high" | "medium" | "low"
  }>
}

export function KeyFindingsCard({ consultation, entitiesEvents, followUpEvents }: KeyFindingsCardProps) {
  // Aggregate all symptoms and negatives
  const allSymptoms: EntitiesContent["symptoms"] = []
  const allNegatives: string[] = []

  for (const event of entitiesEvents) {
    const content = event.content as EntitiesContent
    if (content.symptoms) {
      for (const symptom of content.symptoms) {
        if (!allSymptoms.some((s) => s.name === symptom.name)) {
          allSymptoms.push(symptom)
        }
      }
    }
    if (content.negatives) {
      for (const neg of content.negatives) {
        if (!allNegatives.includes(neg)) {
          allNegatives.push(neg)
        }
      }
    }
  }

  // Aggregate follow-ups
  const allFollowUps: FollowUpContent["questions"] = []
  for (const event of followUpEvents) {
    const content = event.content as FollowUpContent
    if (content.questions) {
      for (const q of content.questions) {
        if (!allFollowUps.some((f) => f.question === q.question)) {
          allFollowUps.push(q)
        }
      }
    }
  }

  // Sort follow-ups by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  allFollowUps.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return (
    <div className="glass-panel rounded-xl p-6 gradient-border">
      <div className="flex items-center gap-2 mb-4">
        <Stethoscope className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">Key Findings</h2>
      </div>

      {/* Chief Complaint */}
      {consultation.chief_complaint && (
        <div className="mb-4 p-3 rounded-lg bg-secondary/30">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Chief Complaint</span>
          <p className="mt-1 font-medium">{consultation.chief_complaint}</p>
        </div>
      )}

      {/* Symptoms */}
      {allSymptoms.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <ThermometerSun className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Symptoms</span>
          </div>
          <div className="space-y-2">
            {allSymptoms.map((symptom, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="font-medium">{symptom.name}</span>
                {symptom.duration && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {symptom.duration}
                  </Badge>
                )}
                {symptom.severity && (
                  <Badge variant="secondary" className="text-xs text-warning">
                    {symptom.severity}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Negatives */}
      {allNegatives.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <MinusCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Relevant Negatives</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allNegatives.map((neg, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                No {neg}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Follow-ups */}
      {allFollowUps.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Suggested Follow-ups</span>
          </div>
          <div className="space-y-2">
            {allFollowUps.slice(0, 5).map((q, i) => (
              <div
                key={i}
                className={`text-sm p-2 rounded border ${
                  q.priority === "high"
                    ? "border-destructive/30 bg-destructive/10"
                    : q.priority === "medium"
                      ? "border-warning/30 bg-warning/10"
                      : "border-border bg-secondary/20"
                }`}
              >
                <span className="text-xs text-muted-foreground">{q.category}</span>
                <p className="mt-0.5">{q.question}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {allSymptoms.length === 0 && allNegatives.length === 0 && allFollowUps.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No key findings extracted from this consultation.
        </p>
      )}
    </div>
  )
}
