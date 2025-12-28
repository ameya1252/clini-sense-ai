"use client"

import { ClipboardCheck, AlertTriangle, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LabSafetyChecklistItem } from "@/lib/db"

interface LabSafetyChecklistProps {
  items: LabSafetyChecklistItem[]
  onChange: (itemKey: string, isChecked: boolean, itemLabel: string) => void
  hasAbnormalLabs: boolean
}

const DEFAULT_CHECKLIST_ITEMS = [
  { key: "abnormal_acknowledged", label: "Abnormal labs acknowledged" },
  { key: "critical_addressed", label: "Critical values addressed" },
  { key: "clinical_reasoning", label: "Labs incorporated into clinical reasoning" },
  { key: "followup_considered", label: "Follow-up labs considered if appropriate" },
]

export function LabSafetyChecklist({ items, onChange, hasAbnormalLabs }: LabSafetyChecklistProps) {
  const checklistItems =
    items.length > 0
      ? items
      : DEFAULT_CHECKLIST_ITEMS.map((d) => ({
          id: crypto.randomUUID(),
          consultation_id: "",
          item_key: d.key,
          item_label: d.label,
          is_checked: false,
          prompt: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))

  const checkedCount = checklistItems.filter((i) => i.is_checked).length
  const totalCount = checklistItems.length
  const allChecked = checkedCount === totalCount

  return (
    <div className="glass-panel rounded-xl p-5 gradient-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-primary" />
          Lab Safety Checklist
        </h2>
        <span
          className={cn(
            "text-xs px-2 py-1 rounded-full",
            allChecked ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400",
          )}
        >
          {checkedCount}/{totalCount} completed
        </span>
      </div>

      <div className="space-y-2">
        {checklistItems.map((item) => (
          <button
            key={item.item_key}
            type="button"
            onClick={() => onChange(item.item_key, !item.is_checked, item.item_label)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left",
              "hover:bg-secondary/50 active:scale-[0.99]",
              item.is_checked
                ? "bg-green-500/10 border border-green-500/20"
                : "bg-secondary/30 border border-transparent",
            )}
          >
            {/* Custom checkbox icon */}
            <div
              className={cn(
                "flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all",
                item.is_checked
                  ? "bg-green-500 border-green-500 shadow-lg shadow-green-500/30"
                  : "border-muted-foreground/50 bg-transparent hover:border-primary/50",
              )}
            >
              {item.is_checked && <Check className="h-4 w-4 text-white stroke-[3]" />}
            </div>

            <div className="flex-1 min-w-0">
              <span
                className={cn(
                  "text-sm transition-colors block font-medium",
                  item.is_checked ? "text-muted-foreground line-through" : "text-foreground",
                )}
              >
                {item.item_label}
              </span>
              {item.prompt && !item.is_checked && (
                <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                  {item.prompt}
                </p>
              )}
            </div>

            {/* Status indicator */}
            {item.is_checked && (
              <span className="text-xs text-green-400 flex-shrink-0 font-medium bg-green-500/10 px-2 py-0.5 rounded">
                Done
              </span>
            )}
          </button>
        ))}
      </div>

      {hasAbnormalLabs && !allChecked && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-xs text-yellow-400 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Abnormal lab values detected. Please review and complete the safety checklist before proceeding.
          </p>
        </div>
      )}
    </div>
  )
}
