"use client"

import { useEffect } from "react"
import { ClipboardCheck, AlertTriangle, Check, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Consultation, DischargeChecklistItem } from "@/lib/db"

interface DischargeChecklistTabProps {
  consultation: Consultation
  checklist: DischargeChecklistItem[]
  onChange: (itemKey: string, isChecked: boolean) => void
  onInitialize: (checklist: DischargeChecklistItem[]) => void
  hasAbnormalLabs: boolean
  hasSafetyConsiderations: boolean
  hasInstructions: boolean
  hasHandoff: boolean
}

const DEFAULT_CHECKLIST_ITEMS = [
  {
    key: "return_precautions",
    label: "Return precautions documented",
    prompt: "Consider documenting when to return to care.",
  },
  { key: "abnormal_labs", label: "Abnormal labs addressed", prompt: "Review and address any abnormal lab values." },
  {
    key: "high_risk_symptoms",
    label: "High-risk symptoms acknowledged",
    prompt: "Ensure safety considerations are reviewed.",
  },
  { key: "followup_plan", label: "Follow-up plan noted", prompt: "Document follow-up recommendations." },
  {
    key: "instructions_reviewed",
    label: "Discharge instructions reviewed with patient",
    prompt: "Ensure patient understands discharge instructions.",
  },
]

export function DischargeChecklistTab({
  consultation,
  checklist,
  onChange,
  onInitialize,
  hasAbnormalLabs,
  hasSafetyConsiderations,
  hasInstructions,
  hasHandoff,
}: DischargeChecklistTabProps) {
  // Initialize checklist if empty
  useEffect(() => {
    if (checklist.length === 0) {
      const defaultItems: DischargeChecklistItem[] = DEFAULT_CHECKLIST_ITEMS.map((item) => ({
        id: crypto.randomUUID(),
        consultation_id: consultation.id,
        item_key: item.key,
        item_label: item.label,
        is_checked: false,
        prompt: item.prompt,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))
      onInitialize(defaultItems)
    }
  }, [checklist.length, consultation.id, onInitialize])

  const checklistItems =
    checklist.length > 0
      ? checklist
      : DEFAULT_CHECKLIST_ITEMS.map((d) => ({
          id: crypto.randomUUID(),
          consultation_id: consultation.id,
          item_key: d.key,
          item_label: d.label,
          is_checked: false,
          prompt: d.prompt,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))

  const checkedCount = checklistItems.filter((i) => i.is_checked).length
  const totalCount = checklistItems.length
  const allChecked = checkedCount === totalCount

  // Determine which prompts to show based on context
  const shouldShowPrompt = (item: DischargeChecklistItem) => {
    if (item.is_checked) return false
    if (item.item_key === "abnormal_labs" && !hasAbnormalLabs) return false
    if (item.item_key === "high_risk_symptoms" && !hasSafetyConsiderations) return false
    return true
  }

  return (
    <div className="space-y-6">
      {/* Progress header */}
      <div className="glass-panel rounded-xl p-5 gradient-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-primary" />
            Discharge Safety Checklist
          </h2>
          <span
            className={cn(
              "text-xs px-3 py-1 rounded-full font-medium",
              allChecked ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400",
            )}
          >
            {checkedCount}/{totalCount} completed
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-secondary/50 rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all duration-500", allChecked ? "bg-green-500" : "bg-primary")}
            style={{ width: `${(checkedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="glass-panel rounded-xl p-5 gradient-border space-y-3">
        {checklistItems.map((item) => (
          <button
            key={item.item_key}
            type="button"
            onClick={() => onChange(item.item_key, !item.is_checked)}
            className={cn(
              "w-full flex items-start gap-4 p-4 rounded-lg transition-all text-left",
              "hover:bg-secondary/50 active:scale-[0.995]",
              item.is_checked
                ? "bg-green-500/10 border border-green-500/20"
                : "bg-secondary/20 border border-transparent hover:border-border/50",
            )}
          >
            {/* Checkbox */}
            <div
              className={cn(
                "flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all mt-0.5",
                item.is_checked
                  ? "bg-green-500 border-green-500"
                  : "border-muted-foreground/40 bg-transparent hover:border-primary/50",
              )}
            >
              {item.is_checked && <Check className="h-4 w-4 text-white" />}
            </div>

            <div className="flex-1 min-w-0">
              <span
                className={cn(
                  "text-sm font-medium transition-colors block",
                  item.is_checked ? "text-muted-foreground line-through" : "text-foreground",
                )}
              >
                {item.item_label}
              </span>
              {shouldShowPrompt(item) && item.prompt && (
                <p className="text-xs text-yellow-400 mt-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                  {item.prompt}
                </p>
              )}
            </div>

            {/* Status */}
            {item.is_checked && (
              <span className="text-xs text-green-400 font-medium flex-shrink-0 mt-0.5">Completed</span>
            )}
          </button>
        ))}
      </div>

      {/* Status summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div
          className={cn(
            "glass-panel rounded-xl p-4 gradient-border",
            hasInstructions ? "border-green-500/20" : "border-yellow-500/20",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center",
                hasInstructions ? "bg-green-500/20" : "bg-yellow-500/20",
              )}
            >
              {hasInstructions ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">Patient Instructions</p>
              <p className="text-xs text-muted-foreground">
                {hasInstructions ? "Generated and ready" : "Not yet generated"}
              </p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "glass-panel rounded-xl p-4 gradient-border",
            hasHandoff ? "border-green-500/20" : "border-yellow-500/20",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center",
                hasHandoff ? "bg-green-500/20" : "bg-yellow-500/20",
              )}
            >
              {hasHandoff ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">Clinician Handoff</p>
              <p className="text-xs text-muted-foreground">
                {hasHandoff ? "Generated and ready" : "Not yet generated"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Warning if not all checked */}
      {!allChecked && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-sm text-yellow-400 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            Please complete all checklist items before finalizing discharge to ensure patient safety and continuity of
            care.
          </p>
        </div>
      )}

      {allChecked && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-sm text-green-400 flex items-start gap-2">
            <Check className="h-4 w-4 shrink-0 mt-0.5" />
            All discharge safety items have been reviewed. The patient is ready for discharge.
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="p-3 bg-secondary/30 border border-border/50 rounded-lg">
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <Info className="h-3 w-3 flex-shrink-0" />
          For clinical support only. Final decisions rest with the treating clinician.
        </p>
      </div>
    </div>
  )
}
