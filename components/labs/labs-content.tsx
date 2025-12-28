"use client"

import { useState, useCallback } from "react"
import type { Consultation, LabResult, LabAIInsight, LabSafetyChecklistItem } from "@/lib/db"
import { LabInputTable } from "./lab-input-table"
import { LabInsightsPanel } from "./lab-insights-panel"
import { LabSafetyChecklist } from "./lab-safety-checklist"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"

interface LabsContentProps {
  consultation: Consultation
  initialLabResults: LabResult[]
  initialLabInsights: LabAIInsight[]
  initialSafetyChecklist: LabSafetyChecklistItem[]
  symptoms: string[]
  transcript: string
}

export function LabsContent({
  consultation,
  initialLabResults,
  initialLabInsights,
  initialSafetyChecklist,
  symptoms,
  transcript,
}: LabsContentProps) {
  const [labResults, setLabResults] = useState<LabResult[]>(initialLabResults)
  const [insights, setInsights] = useState<LabAIInsight[]>(initialLabInsights)
  const [safetyChecklist, setSafetyChecklist] = useState<LabSafetyChecklistItem[]>(initialSafetyChecklist)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzeLabResults = useCallback(async () => {
    if (labResults.length === 0) return

    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/labs/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultationId: consultation.id,
          labResults: labResults.map((lr) => ({
            test_name: lr.test_name,
            value: lr.value,
            unit: lr.unit,
            reference_range: lr.reference_range,
            flag: lr.flag,
          })),
          symptoms,
          transcript,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setInsights(data.insights || [])
        setSafetyChecklist(data.safetyChecklist || [])
      }
    } catch (error) {
      console.error("[v0] Error analyzing labs:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [consultation.id, labResults, symptoms, transcript])

  const handleLabResultsChange = useCallback((newResults: LabResult[]) => {
    setLabResults(newResults)
  }, [])

  const handleChecklistChange = useCallback(
    (itemKey: string, isChecked: boolean, itemLabel: string) => {
      setSafetyChecklist((prev) => {
        const existing = prev.find((item) => item.item_key === itemKey)
        if (existing) {
          return prev.map((item) => (item.item_key === itemKey ? { ...item, is_checked: isChecked } : item))
        } else {
          // Add new item if it doesn't exist
          return [
            ...prev,
            {
              id: crypto.randomUUID(),
              consultation_id: consultation.id,
              item_key: itemKey,
              item_label: itemLabel,
              is_checked: isChecked,
              prompt: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]
        }
      })

      // Persist to database with upsert
      fetch("/api/labs/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultationId: consultation.id,
          itemKey,
          isChecked,
          itemLabel,
        }),
      }).catch(console.error)
    },
    [consultation.id],
  )

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Lab Input Table (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-panel rounded-xl p-5 gradient-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="h-5 w-5 rounded bg-primary/20 flex items-center justify-center">
                  <span className="text-xs text-primary">🧪</span>
                </span>
                Lab Results Entry
              </h2>
              <Button
                onClick={analyzeLabResults}
                disabled={isAnalyzing || labResults.length === 0}
                size="sm"
                className="gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Analyze Labs
                  </>
                )}
              </Button>
            </div>

            <LabInputTable consultationId={consultation.id} labResults={labResults} onChange={handleLabResultsChange} />
          </div>

          {/* Safety Checklist */}
          <LabSafetyChecklist
            items={safetyChecklist}
            onChange={handleChecklistChange}
            hasAbnormalLabs={labResults.some((lr) => lr.flag === "abnormal" || lr.flag === "mild")}
          />
        </div>

        {/* Right: AI Insights Panel (2 cols) */}
        <div className="lg:col-span-2">
          <LabInsightsPanel insights={insights} isAnalyzing={isAnalyzing} labResults={labResults} />
        </div>
      </div>
    </div>
  )
}
