"use client"

import { ClipboardCheck, AlertTriangle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import type { LabSafetyChecklistItem } from "@/lib/db"

interface LabSafetyChecklistProps {
  items: LabSafetyChecklistItem[]
  onChange: (itemKey: string, isChecked: boolean) => void
  hasAbnormalLabs: boolean
}

const DEFAULT_CHECKLIST_ITEMS = [
  { key: "abnormal_acknowledged", label: "Abnormal labs acknowledged" },
  { key: "critical_addressed", label: "Critical values addressed" },
  { key: "clinical_reasoning", label: "Labs incorporated into clinical reasoning" },
  { key: "followup_considered", label: "Follow-up labs considered if appropriate" },
]

export function LabSafetyChecklist({ items, onChange, hasAbnormalLabs }: LabSafetyChecklistProps) {
  // Use items from props if available, otherwise use defaults
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

      <div className="space-y-3">
        {checklistItems.map((item) => (
          <div key={item.item_key} className="flex items-start gap-3">
            <Checkbox
              id={item.item_key}
              checked={item.is_checked}
              onCheckedChange={(checked) => onChange(item.item_key, checked === true)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <label
                htmlFor={item.item_key}
                className={cn(
                  "text-sm cursor-pointer transition-colors",
                  item.is_checked ? "text-muted-foreground line-through" : "text-foreground",
                )}
              >
                {item.item_label}
              </label>
              {item.prompt && !item.is_checked && (
                <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {item.prompt}
                </p>
              )}
            </div>
          </div>
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
