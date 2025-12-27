"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Plus, Trash2, AlertCircle, CheckCircle, AlertTriangle, Upload, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { LabResult } from "@/lib/db"

interface LabInputTableProps {
  consultationId: string
  labResults: LabResult[]
  onChange: (results: LabResult[]) => void
}

// Common lab tests with reference ranges
const COMMON_LABS = [
  { name: "WBC", unit: "x10³/µL", range: "4.5-11.0" },
  { name: "RBC", unit: "x10⁶/µL", range: "4.5-5.5" },
  { name: "Hemoglobin", unit: "g/dL", range: "12.0-17.5" },
  { name: "Hematocrit", unit: "%", range: "36-50" },
  { name: "Platelets", unit: "x10³/µL", range: "150-400" },
  { name: "MCV", unit: "fL", range: "80-100" },
  { name: "MCH", unit: "pg", range: "27-33" },
  { name: "MCHC", unit: "g/dL", range: "32-36" },
  { name: "RDW", unit: "%", range: "11.5-14.5" },
  { name: "Glucose", unit: "mg/dL", range: "70-100" },
  { name: "HbA1c", unit: "%", range: "4.0-5.6" },
  { name: "BUN", unit: "mg/dL", range: "7-20" },
  { name: "Creatinine", unit: "mg/dL", range: "0.6-1.2" },
  { name: "eGFR", unit: "mL/min", range: ">60" },
  { name: "Sodium", unit: "mEq/L", range: "136-145" },
  { name: "Potassium", unit: "mEq/L", range: "3.5-5.0" },
  { name: "Chloride", unit: "mEq/L", range: "98-106" },
  { name: "CO2", unit: "mEq/L", range: "23-29" },
  { name: "Calcium", unit: "mg/dL", range: "8.5-10.5" },
  { name: "Phosphorus", unit: "mg/dL", range: "2.5-4.5" },
  { name: "Magnesium", unit: "mg/dL", range: "1.7-2.2" },
  { name: "Total Protein", unit: "g/dL", range: "6.0-8.3" },
  { name: "Albumin", unit: "g/dL", range: "3.5-5.0" },
  { name: "Bilirubin Total", unit: "mg/dL", range: "0.1-1.2" },
  { name: "Bilirubin Direct", unit: "mg/dL", range: "0.0-0.3" },
  { name: "ALT", unit: "U/L", range: "7-56" },
  { name: "AST", unit: "U/L", range: "10-40" },
  { name: "ALP", unit: "U/L", range: "44-147" },
  { name: "GGT", unit: "U/L", range: "9-48" },
  { name: "LDH", unit: "U/L", range: "140-280" },
  { name: "TSH", unit: "mIU/L", range: "0.4-4.0" },
  { name: "Free T4", unit: "ng/dL", range: "0.8-1.8" },
  { name: "Free T3", unit: "pg/mL", range: "2.3-4.2" },
  { name: "Cholesterol Total", unit: "mg/dL", range: "<200" },
  { name: "LDL", unit: "mg/dL", range: "<100" },
  { name: "HDL", unit: "mg/dL", range: ">40" },
  { name: "Triglycerides", unit: "mg/dL", range: "<150" },
  { name: "CRP", unit: "mg/L", range: "<3.0" },
  { name: "ESR", unit: "mm/hr", range: "0-20" },
  { name: "Ferritin", unit: "ng/mL", range: "20-200" },
  { name: "Iron", unit: "µg/dL", range: "60-170" },
  { name: "TIBC", unit: "µg/dL", range: "250-370" },
  { name: "Vitamin B12", unit: "pg/mL", range: "200-900" },
  { name: "Folate", unit: "ng/mL", range: "2.7-17.0" },
  { name: "Vitamin D", unit: "ng/mL", range: "30-100" },
  { name: "PT", unit: "sec", range: "11-13.5" },
  { name: "INR", unit: "", range: "0.8-1.1" },
  { name: "PTT", unit: "sec", range: "25-35" },
  { name: "D-Dimer", unit: "µg/mL", range: "<0.5" },
  { name: "Troponin I", unit: "ng/mL", range: "<0.04" },
  { name: "BNP", unit: "pg/mL", range: "<100" },
  { name: "Procalcitonin", unit: "ng/mL", range: "<0.1" },
  { name: "Lactate", unit: "mmol/L", range: "0.5-2.0" },
  { name: "Ammonia", unit: "µmol/L", range: "15-45" },
  { name: "Lipase", unit: "U/L", range: "0-160" },
  { name: "Amylase", unit: "U/L", range: "28-100" },
  { name: "Uric Acid", unit: "mg/dL", range: "3.5-7.2" },
  { name: "PSA", unit: "ng/mL", range: "<4.0" },
]

function determineFlag(value: string, referenceRange: string | null): LabResult["flag"] {
  if (!referenceRange || !value) return null

  const numValue = Number.parseFloat(value)
  if (isNaN(numValue)) return null

  // Parse reference range (e.g., "4.5-11.0" or "<100" or ">10")
  const rangeMatch = referenceRange.match(/^([<>]?)(\d+\.?\d*)-?(\d+\.?\d*)?$/)
  if (!rangeMatch) return null

  const [, operator, min, max] = rangeMatch
  const minVal = Number.parseFloat(min)
  const maxVal = max ? Number.parseFloat(max) : null

  if (operator === "<") {
    if (numValue >= minVal) return "abnormal"
    return "normal"
  }

  if (operator === ">") {
    if (numValue <= minVal) return "abnormal"
    return "normal"
  }

  if (maxVal !== null) {
    if (numValue >= minVal && numValue <= maxVal) return "normal"
    const rangeDiff = maxVal - minVal
    const mildThreshold = rangeDiff * 0.2
    if (numValue < minVal && numValue >= minVal - mildThreshold) return "mild"
    if (numValue > maxVal && numValue <= maxVal + mildThreshold) return "mild"
    return "abnormal"
  }

  return null
}

const FlagIcon = ({ flag }: { flag: LabResult["flag"] }) => {
  if (flag === "normal") return <CheckCircle className="h-4 w-4 text-green-500" />
  if (flag === "mild") return <AlertTriangle className="h-4 w-4 text-yellow-500" />
  if (flag === "abnormal") return <AlertCircle className="h-4 w-4 text-red-500" />
  return null
}

export function LabInputTable({ consultationId, labResults, onChange }: LabInputTableProps) {
  const [suggestions, setSuggestions] = useState<typeof COMMON_LABS>([])
  const [activeInputIndex, setActiveInputIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addRow = useCallback(() => {
    const newResult: LabResult = {
      id: crypto.randomUUID(),
      consultation_id: consultationId,
      test_name: "",
      value: "",
      unit: "",
      reference_range: "",
      test_date: new Date().toISOString(),
      flag: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    onChange([...labResults, newResult])
  }, [consultationId, labResults, onChange])

  const removeRow = useCallback(
    (id: string) => {
      onChange(labResults.filter((lr) => lr.id !== id))
      fetch("/api/labs/results", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      }).catch(console.error)
    },
    [labResults, onChange],
  )

  const updateRow = useCallback(
    (id: string, field: keyof LabResult, value: string) => {
      onChange(
        labResults.map((lr) => {
          if (lr.id !== id) return lr

          const updated = { ...lr, [field]: value, updated_at: new Date().toISOString() }

          if (field === "test_name") {
            const match = COMMON_LABS.find((l) => l.name.toLowerCase() === value.toLowerCase())
            if (match) {
              updated.unit = match.unit
              updated.reference_range = match.range
            }
          }

          if (field === "value" || field === "reference_range") {
            const newValue = field === "value" ? value : lr.value
            const newRange = field === "reference_range" ? value : lr.reference_range
            updated.flag = determineFlag(newValue, newRange)
          }

          return updated
        }),
      )
    },
    [labResults, onChange],
  )

  const saveRow = useCallback(
    async (result: LabResult) => {
      if (!result.test_name || !result.value) return

      try {
        await fetch("/api/labs/results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...result,
            consultationId: consultationId,
          }),
        })
      } catch (error) {
        console.error("[v0] Error saving lab result:", error)
      }
    },
    [consultationId],
  )

  const handleTestNameChange = (id: string, value: string, index: number) => {
    updateRow(id, "test_name", value)
    if (value.length > 0) {
      const filtered = COMMON_LABS.filter((l) => l.name.toLowerCase().includes(value.toLowerCase()))
      setSuggestions(filtered)
      setActiveInputIndex(index)
    } else {
      setSuggestions([])
      setActiveInputIndex(null)
    }
  }

  const selectSuggestion = (id: string, suggestion: (typeof COMMON_LABS)[0]) => {
    updateRow(id, "test_name", suggestion.name)
    const result = labResults.find((lr) => lr.id === id)
    if (result) {
      const updated = {
        ...result,
        test_name: suggestion.name,
        unit: suggestion.unit,
        reference_range: suggestion.range,
      }
      onChange(labResults.map((lr) => (lr.id === id ? updated : lr)))
    }
    setSuggestions([])
    setActiveInputIndex(null)
  }

  const exportToCSV = useCallback(() => {
    if (labResults.length === 0) return

    const headers = ["Test Name", "Value", "Unit", "Reference Range", "Flag", "Date"]
    const rows = labResults.map((lr) => [
      lr.test_name,
      lr.value,
      lr.unit || "",
      lr.reference_range || "",
      lr.flag || "",
      new Date(lr.test_date).toLocaleDateString(),
    ])

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `lab_results_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [labResults])

  const importFromCSV = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const lines = text.split("\n").filter((line) => line.trim())

        // Skip header row
        const dataLines = lines.slice(1)

        const newResults: LabResult[] = dataLines.map((line) => {
          // Parse CSV properly handling quoted values
          const values: string[] = []
          let current = ""
          let inQuotes = false

          for (const char of line) {
            if (char === '"') {
              inQuotes = !inQuotes
            } else if (char === "," && !inQuotes) {
              values.push(current.trim())
              current = ""
            } else {
              current += char
            }
          }
          values.push(current.trim())

          const [testName, value, unit, refRange] = values

          // Try to match with common labs for auto-fill
          const match = COMMON_LABS.find((l) => l.name.toLowerCase() === testName?.toLowerCase())

          const result: LabResult = {
            id: crypto.randomUUID(),
            consultation_id: consultationId,
            test_name: testName || "",
            value: value || "",
            unit: unit || match?.unit || "",
            reference_range: refRange || match?.range || "",
            test_date: new Date().toISOString(),
            flag: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          result.flag = determineFlag(result.value, result.reference_range)
          return result
        })

        onChange([...labResults, ...newResults.filter((r) => r.test_name && r.value)])

        // Save all new results
        newResults.forEach((result) => {
          if (result.test_name && result.value) {
            saveRow(result)
          }
        })
      }

      reader.readAsText(file)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    [consultationId, labResults, onChange, saveRow],
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end gap-2 mb-2">
        <input type="file" ref={fileInputRef} accept=".csv" onChange={importFromCSV} className="hidden" />
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs bg-transparent"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-3 w-3" />
          Import CSV
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs bg-transparent"
          onClick={exportToCSV}
          disabled={labResults.length === 0}
        >
          <Download className="h-3 w-3" />
          Export CSV
        </Button>
      </div>

      {/* Header */}
      <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-1">
        <div className="col-span-3">Test Name</div>
        <div className="col-span-2">Value</div>
        <div className="col-span-2">Unit</div>
        <div className="col-span-3">Reference Range</div>
        <div className="col-span-1">Flag</div>
        <div className="col-span-1"></div>
      </div>

      {/* Rows */}
      {labResults.map((result, index) => (
        <div
          key={result.id}
          className={cn(
            "grid grid-cols-12 gap-2 items-center p-2 rounded-lg transition-colors",
            result.flag === "abnormal" && "bg-red-500/10 border border-red-500/20",
            result.flag === "mild" && "bg-yellow-500/10 border border-yellow-500/20",
            result.flag === "normal" && "bg-green-500/5 border border-green-500/10",
            !result.flag && "bg-secondary/30",
          )}
        >
          <div className="col-span-3 relative">
            <Input
              value={result.test_name}
              onChange={(e) => handleTestNameChange(result.id, e.target.value, index)}
              onBlur={() => {
                setTimeout(() => {
                  setSuggestions([])
                  setActiveInputIndex(null)
                }, 200)
                saveRow(result)
              }}
              placeholder="e.g., WBC"
              className="h-9 text-sm bg-background/50"
            />
            {suggestions.length > 0 && activeInputIndex === index && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
                {suggestions.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-secondary/50 transition-colors"
                    onMouseDown={() => selectSuggestion(result.id, s)}
                  >
                    <span className="font-medium">{s.name}</span>
                    <span className="text-muted-foreground ml-2">
                      ({s.range} {s.unit})
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="col-span-2">
            <Input
              value={result.value}
              onChange={(e) => updateRow(result.id, "value", e.target.value)}
              onBlur={() => saveRow(result)}
              placeholder="Value"
              className="h-9 text-sm bg-background/50"
            />
          </div>
          <div className="col-span-2">
            <Input
              value={result.unit || ""}
              onChange={(e) => updateRow(result.id, "unit", e.target.value)}
              onBlur={() => saveRow(result)}
              placeholder="Unit"
              className="h-9 text-sm bg-background/50"
            />
          </div>
          <div className="col-span-3">
            <Input
              value={result.reference_range || ""}
              onChange={(e) => updateRow(result.id, "reference_range", e.target.value)}
              onBlur={() => saveRow(result)}
              placeholder="e.g., 4.5-11.0"
              className="h-9 text-sm bg-background/50"
            />
          </div>
          <div className="col-span-1 flex justify-center">
            <FlagIcon flag={result.flag} />
          </div>
          <div className="col-span-1 flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => removeRow(result.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      {/* Add Row Button */}
      <Button variant="outline" size="sm" className="w-full gap-2 border-dashed bg-transparent" onClick={addRow}>
        <Plus className="h-4 w-4" />
        Add Lab Result
      </Button>

      {labResults.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No lab results entered yet.</p>
          <p className="text-xs mt-1">Click "Add Lab Result" or import a CSV file to begin.</p>
        </div>
      )}
    </div>
  )
}
