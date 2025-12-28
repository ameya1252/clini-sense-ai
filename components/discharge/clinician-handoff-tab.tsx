"use client"

import { useState } from "react"
import { Sparkles, Loader2, Copy, Download, Edit3, Save, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Consultation, SOAPNote, LabResult, ClinicianHandoff } from "@/lib/db"

interface ClinicianHandoffTabProps {
  consultation: Consultation
  handoff: ClinicianHandoff | null
  onUpdate: (handoff: ClinicianHandoff) => void
  transcript: string
  soapNote: SOAPNote | null
  labResults: LabResult[]
  symptoms: string[]
  safetyConsiderations: string[]
}

function safeString(value: unknown): string {
  if (value === null || value === undefined) return ""
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (Array.isArray(value)) {
    return value.map(safeString).filter(Boolean).join(", ")
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>
    if ("text" in obj && typeof obj.text === "string") return obj.text
    if ("name" in obj && typeof obj.name === "string") return obj.name
    if ("label" in obj && typeof obj.label === "string") return obj.label
    const allValues = Object.values(obj).flatMap((v) => {
      if (Array.isArray(v)) return v.map(safeString)
      return [safeString(v)]
    })
    return allValues.filter(Boolean).join(", ")
  }
  return ""
}

function sanitizeHandoff(handoff: ClinicianHandoff): ClinicianHandoff {
  return {
    ...handoff,
    reason_for_visit: safeString(handoff.reason_for_visit),
    key_positive_findings: safeString(handoff.key_positive_findings),
    relevant_negatives: safeString(handoff.relevant_negatives),
    labs_summary: safeString(handoff.labs_summary),
    safety_considerations: safeString(handoff.safety_considerations),
    pending_concerns: safeString(handoff.pending_concerns),
    followup_needed: safeString(handoff.followup_needed),
  }
}

export function ClinicianHandoffTab({
  consultation,
  handoff,
  onUpdate,
  transcript,
  soapNote,
  labResults,
  symptoms,
  safetyConsiderations,
}: ClinicianHandoffTabProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedHandoff, setEditedHandoff] = useState<ClinicianHandoff | null>(handoff ? sanitizeHandoff(handoff) : null)

  const generateHandoff = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/discharge/generate-clinician-handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultationId: consultation.id,
          transcript,
          soapNote,
          labResults: labResults.map((lr) => ({
            test_name: safeString(lr.test_name),
            value: safeString(lr.value),
            unit: safeString(lr.unit),
            reference_range: safeString(lr.reference_range),
            flag: safeString(lr.flag),
          })),
          symptoms: symptoms.map(safeString).filter(Boolean),
          safetyConsiderations: safetyConsiderations.map(safeString).filter(Boolean),
          chiefComplaint: safeString(consultation.chief_complaint),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const sanitized = sanitizeHandoff(data.handoff)
        onUpdate(sanitized)
        setEditedHandoff(sanitized)
      }
    } catch (error) {
      console.error("[v0] Error generating handoff:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const saveEdits = async () => {
    if (!editedHandoff) return

    try {
      await fetch("/api/discharge/clinician-handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultationId: consultation.id,
          handoff: editedHandoff,
        }),
      })
      onUpdate(editedHandoff)
      setIsEditing(false)
    } catch (error) {
      console.error("[v0] Error saving handoff:", error)
    }
  }

  const copyToClipboard = () => {
    const h = handoff ? sanitizeHandoff(handoff) : null
    if (!h) return
    const text = `
CLINICIAN HANDOFF SUMMARY
=========================

REASON FOR VISIT
${h.reason_for_visit || ""}

KEY POSITIVE FINDINGS
${h.key_positive_findings || ""}

RELEVANT NEGATIVES
${h.relevant_negatives || ""}

LABS SUMMARY
${h.labs_summary || ""}

SAFETY CONSIDERATIONS
${h.safety_considerations || ""}

PENDING CONCERNS
${h.pending_concerns || ""}

FOLLOW-UP NEEDED
${h.followup_needed || ""}
    `.trim()

    navigator.clipboard.writeText(text)
  }

  const downloadAsPDF = () => {
    const h = handoff ? sanitizeHandoff(handoff) : null
    if (!h) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Clinician Handoff - ${currentDate}</title>
        <style>
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
          }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            max-width: 8.5in; 
            margin: 0 auto; 
            padding: 0.5in; 
            line-height: 1.4;
            font-size: 10pt;
            color: #1a1a1a;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .logo-area h1 { 
            color: #3b82f6; 
            font-size: 22pt;
            font-weight: 700;
          }
          .logo-area p { color: #666; font-size: 9pt; }
          .doc-info { text-align: right; font-size: 9pt; color: #666; }
          .doc-info strong { color: #1e40af; font-size: 10pt; }
          .patient-banner {
            background: linear-gradient(to right, #eff6ff, #dbeafe);
            border: 1px solid #93c5fd;
            border-radius: 6px;
            padding: 10px 14px;
            margin-bottom: 16px;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            font-size: 9pt;
          }
          .patient-banner strong { color: #1e40af; }
          .sbar-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 16px;
          }
          .sbar-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px;
          }
          .sbar-card.full-width {
            grid-column: 1 / -1;
          }
          .sbar-card h3 {
            font-size: 9pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
            margin-bottom: 8px;
            padding-bottom: 4px;
            border-bottom: 2px solid #3b82f6;
          }
          .sbar-card p { 
            font-size: 10pt;
            white-space: pre-wrap;
          }
          .safety-card {
            background: #fef2f2;
            border-color: #fecaca;
          }
          .safety-card h3 {
            color: #dc2626;
            border-bottom-color: #ef4444;
          }
          .labs-card {
            background: #f0fdf4;
            border-color: #bbf7d0;
          }
          .labs-card h3 {
            color: #16a34a;
            border-bottom-color: #22c55e;
          }
          .pending-card {
            background: #fffbeb;
            border-color: #fde68a;
          }
          .pending-card h3 {
            color: #b45309;
            border-bottom-color: #f59e0b;
          }
          .footer { 
            margin-top: 20px;
            padding-top: 12px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            font-size: 8pt;
            color: #9ca3af;
          }
          .confidential {
            background: #fee2e2;
            color: #991b1b;
            font-size: 8pt;
            font-weight: 600;
            padding: 4px 8px;
            border-radius: 4px;
            display: inline-block;
            margin-bottom: 12px;
          }
          .download-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #3b82f6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .download-btn:hover { background: #2563eb; }
        </style>
      </head>
      <body>
        <button class="download-btn no-print" onclick="window.print()">
          Download PDF
        </button>
        
        <span class="confidential">⚠️ CONFIDENTIAL - FOR CLINICAL USE ONLY</span>
        
        <div class="header">
          <div class="logo-area">
            <h1>CliniSense</h1>
            <p>Clinical Handoff Summary</p>
          </div>
          <div class="doc-info">
            <strong>CLINICIAN HANDOFF</strong><br>
            Date: ${currentDate}<br>
            Time: ${currentTime}<br>
            ID: ${consultation.id.slice(0, 8).toUpperCase()}
          </div>
        </div>
        
        <div class="patient-banner">
          <span><strong>Chief Complaint:</strong> ${safeString(consultation.chief_complaint) || "Not specified"}</span>
          <span><strong>Status:</strong> ${safeString(consultation.status) || "Completed"}</span>
          <span><strong>Duration:</strong> ${consultation.started_at && consultation.ended_at ? Math.round((new Date(consultation.ended_at).getTime() - new Date(consultation.started_at).getTime()) / 60000) + " min" : "N/A"}</span>
        </div>
        
        <div class="sbar-grid">
          <div class="sbar-card full-width">
            <h3>Reason for Visit</h3>
            <p>${h.reason_for_visit || "Not documented"}</p>
          </div>
          
          <div class="sbar-card">
            <h3>Key Positive Findings</h3>
            <p>${h.key_positive_findings || "Not documented"}</p>
          </div>
          
          <div class="sbar-card">
            <h3>Relevant Negatives</h3>
            <p>${h.relevant_negatives || "Not documented"}</p>
          </div>
          
          <div class="sbar-card labs-card full-width">
            <h3>Labs Summary</h3>
            <p>${h.labs_summary || "No labs reviewed"}</p>
          </div>
          
          <div class="sbar-card safety-card full-width">
            <h3>⚠️ Safety Considerations</h3>
            <p>${h.safety_considerations || "None documented"}</p>
          </div>
          
          <div class="sbar-card pending-card">
            <h3>Pending Concerns</h3>
            <p>${h.pending_concerns || "None"}</p>
          </div>
          
          <div class="sbar-card">
            <h3>Follow-up Needed</h3>
            <p>${h.followup_needed || "Not specified"}</p>
          </div>
        </div>
        
        <div class="footer">
          <div>
            Generated by CliniSense AI Clinical Decision Support<br>
            For clinical support only. Final decisions rest with the treating clinician.
          </div>
          <div style="text-align: right;">
            Page 1 of 1<br>
            ${currentDate} ${currentTime}
          </div>
        </div>
      </body>
      </html>
    `)

    printWindow.document.close()
  }

  const sanitizedHandoff = handoff ? sanitizeHandoff(handoff) : null

  if (!sanitizedHandoff && !isGenerating) {
    return (
      <div className="glass-panel rounded-xl p-8 gradient-border text-center">
        <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-8 w-8 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Generate Clinician Handoff</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Create a structured clinical handoff summary for continuity of care. This is not patient-facing and follows
          standard handoff formats.
        </p>
        <Button onClick={generateHandoff} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Sparkles className="h-4 w-4" />
          Generate Handoff
        </Button>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="glass-panel rounded-xl p-8 gradient-border text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Generating Clinician Handoff...</h3>
        <p className="text-sm text-muted-foreground">Creating a structured clinical summary.</p>
      </div>
    )
  }

  const displayHandoff = isEditing ? editedHandoff : sanitizedHandoff

  return (
    <div className="space-y-6">
      {/* Actions bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={copyToClipboard}>
            <Copy className="h-3 w-3" />
            Copy
          </Button>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={downloadAsPDF}>
            <Download className="h-3 w-3" />
            Download PDF
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" className="gap-2" onClick={saveEdits}>
                <Save className="h-3 w-3" />
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={() => setIsEditing(true)}>
                <Edit3 className="h-3 w-3" />
                Edit
              </Button>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={generateHandoff}>
                <Sparkles className="h-3 w-3" />
                Regenerate
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Handoff content */}
      <div className="glass-panel rounded-xl p-6 gradient-border space-y-5">
        <HandoffSection
          title="Reason for Visit"
          content={displayHandoff?.reason_for_visit || ""}
          isEditing={isEditing}
          onChange={(v) => setEditedHandoff((p) => (p ? { ...p, reason_for_visit: v } : null))}
        />

        <HandoffSection
          title="Key Positive Findings"
          content={displayHandoff?.key_positive_findings || ""}
          isEditing={isEditing}
          onChange={(v) => setEditedHandoff((p) => (p ? { ...p, key_positive_findings: v } : null))}
        />

        <HandoffSection
          title="Relevant Negatives"
          content={displayHandoff?.relevant_negatives || ""}
          isEditing={isEditing}
          onChange={(v) => setEditedHandoff((p) => (p ? { ...p, relevant_negatives: v } : null))}
        />

        <HandoffSection
          title="Labs Summary"
          content={displayHandoff?.labs_summary || ""}
          isEditing={isEditing}
          onChange={(v) => setEditedHandoff((p) => (p ? { ...p, labs_summary: v } : null))}
          highlight
        />

        <HandoffSection
          title="Safety Considerations"
          content={displayHandoff?.safety_considerations || ""}
          isEditing={isEditing}
          onChange={(v) => setEditedHandoff((p) => (p ? { ...p, safety_considerations: v } : null))}
          highlight
        />

        <HandoffSection
          title="Pending Concerns"
          content={displayHandoff?.pending_concerns || ""}
          isEditing={isEditing}
          onChange={(v) => setEditedHandoff((p) => (p ? { ...p, pending_concerns: v } : null))}
        />

        <HandoffSection
          title="Follow-up Needed"
          content={displayHandoff?.followup_needed || ""}
          isEditing={isEditing}
          onChange={(v) => setEditedHandoff((p) => (p ? { ...p, followup_needed: v } : null))}
        />

        {/* Disclaimer */}
        <div className="p-3 bg-secondary/30 border border-border/50 rounded-lg">
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Info className="h-3 w-3 flex-shrink-0" />
            For clinical support only. Final decisions rest with the treating clinician.
          </p>
        </div>
      </div>
    </div>
  )
}

function HandoffSection({
  title,
  content,
  isEditing,
  onChange,
  highlight,
}: {
  title: string
  content: string
  isEditing: boolean
  onChange: (value: string) => void
  highlight?: boolean
}) {
  const safeContent = typeof content === "string" ? content : ""

  return (
    <div className={highlight ? "p-3 bg-red-500/5 border border-red-500/10 rounded-lg -mx-2" : ""}>
      <h3
        className={`text-xs font-semibold uppercase tracking-wide mb-2 ${highlight ? "text-red-400" : "text-muted-foreground"}`}
      >
        {title}
      </h3>
      {isEditing ? (
        <Textarea
          value={safeContent}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[80px] bg-background/50 text-sm"
        />
      ) : (
        <p className="text-sm text-foreground whitespace-pre-wrap">{safeContent || "Not documented"}</p>
      )}
    </div>
  )
}
