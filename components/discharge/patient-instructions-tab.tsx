"use client"

import { useState } from "react"
import { Sparkles, Loader2, Copy, Download, Edit3, Save, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { Consultation, SOAPNote, DischargeInstructions } from "@/lib/db"

interface PatientInstructionsTabProps {
  consultation: Consultation
  instructions: DischargeInstructions | null
  onUpdate: (instructions: DischargeInstructions) => void
  transcript: string
  soapNote: SOAPNote | null
  symptoms: string[]
  safetyConsiderations: string[]
}

export function PatientInstructionsTab({
  consultation,
  instructions,
  onUpdate,
  transcript,
  soapNote,
  symptoms,
  safetyConsiderations,
}: PatientInstructionsTabProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedInstructions, setEditedInstructions] = useState<DischargeInstructions | null>(instructions)

  const generateInstructions = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/discharge/generate-patient-instructions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultationId: consultation.id,
          transcript,
          soapNote,
          symptoms,
          safetyConsiderations,
          chiefComplaint: consultation.chief_complaint,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        onUpdate(data.instructions)
        setEditedInstructions(data.instructions)
      }
    } catch (error) {
      console.error("[v0] Error generating instructions:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const saveEdits = async () => {
    if (!editedInstructions) return

    try {
      await fetch("/api/discharge/patient-instructions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultationId: consultation.id,
          instructions: editedInstructions,
        }),
      })
      onUpdate(editedInstructions)
      setIsEditing(false)
    } catch (error) {
      console.error("[v0] Error saving instructions:", error)
    }
  }

  const copyToClipboard = () => {
    if (!instructions) return
    const text = `
VISIT SUMMARY
${instructions.visit_summary || ""}

SYMPTOMS DISCUSSED
${instructions.symptoms_discussed || ""}

WHAT TO WATCH FOR
${instructions.watch_for || ""}

NEXT STEPS
${instructions.next_steps || ""}

IMPORTANT NOTE
${instructions.disclaimer || ""}
    `.trim()

    navigator.clipboard.writeText(text)
  }

  const downloadAsPDF = () => {
    if (!instructions) return

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
        <title>Patient Discharge Instructions - ${currentDate}</title>
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
            line-height: 1.5;
            font-size: 11pt;
            color: #1a1a1a;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid #0d9488;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .logo-area h1 { 
            color: #0d9488; 
            font-size: 24pt;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          .logo-area p { color: #666; font-size: 9pt; margin-top: 2px; }
          .doc-info { text-align: right; font-size: 9pt; color: #666; }
          .doc-info strong { color: #333; }
          .patient-banner {
            background: #f0fdfa;
            border: 1px solid #99f6e4;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
          }
          .patient-banner span { font-size: 10pt; }
          .patient-banner strong { color: #0d9488; }
          h2 { 
            color: #0d9488; 
            font-size: 13pt;
            font-weight: 600;
            margin: 20px 0 10px 0;
            padding-bottom: 5px;
            border-bottom: 1px solid #e5e7eb;
          }
          .section { 
            margin-bottom: 16px;
            padding: 12px 16px;
            background: #fafafa;
            border-radius: 6px;
            border-left: 3px solid #0d9488;
          }
          .section p { margin: 0; white-space: pre-wrap; }
          .warning-section {
            background: #fef2f2;
            border-left-color: #ef4444;
            border: 1px solid #fecaca;
          }
          .warning-section h3 {
            color: #dc2626;
            font-size: 11pt;
            font-weight: 600;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .disclaimer { 
            background: #fffbeb;
            border: 1px solid #fde68a;
            border-radius: 6px;
            padding: 12px 16px;
            margin-top: 24px;
          }
          .disclaimer-title {
            color: #b45309;
            font-weight: 600;
            font-size: 10pt;
            margin-bottom: 4px;
          }
          .disclaimer p { color: #92400e; font-size: 9pt; }
          .footer { 
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .footer-left { font-size: 8pt; color: #9ca3af; }
          .footer-right { font-size: 8pt; color: #9ca3af; text-align: right; }
          .signature-area {
            margin-top: 30px;
            display: flex;
            gap: 40px;
          }
          .signature-line {
            flex: 1;
            border-top: 1px solid #333;
            padding-top: 5px;
            font-size: 9pt;
            color: #666;
          }
          .download-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #0d9488;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .download-btn:hover { background: #0f766e; }
        </style>
      </head>
      <body>
        <button class="download-btn no-print" onclick="window.print()">
          Download PDF
        </button>
        
        <div class="header">
          <div class="logo-area">
            <h1>CliniSense</h1>
            <p>AI-Powered Clinical Decision Support</p>
          </div>
          <div class="doc-info">
            <strong>PATIENT DISCHARGE INSTRUCTIONS</strong><br>
            Date: ${currentDate}<br>
            Time: ${currentTime}<br>
            Doc ID: ${consultation.id.slice(0, 8).toUpperCase()}
          </div>
        </div>
        
        <div class="patient-banner">
          <span><strong>Chief Complaint:</strong> ${consultation.chief_complaint || "General Consultation"}</span>
          <span><strong>Visit Type:</strong> Outpatient</span>
        </div>
        
        <h2>Visit Summary</h2>
        <div class="section">
          <p>${instructions.visit_summary || "No summary provided"}</p>
        </div>
        
        <h2>Symptoms Discussed</h2>
        <div class="section">
          <p>${instructions.symptoms_discussed || "No symptoms documented"}</p>
        </div>
        
        <h2>Warning Signs - Return Immediately If:</h2>
        <div class="section warning-section">
          <p>${instructions.watch_for || "No specific warning signs documented"}</p>
        </div>
        
        <h2>Next Steps & Follow-Up</h2>
        <div class="section">
          <p>${instructions.next_steps || "Follow up with your primary care provider"}</p>
        </div>
        
        <div class="disclaimer">
          <div class="disclaimer-title">⚠️ Important Notice</div>
          <p>${instructions.disclaimer || "This document is for informational purposes only and does not constitute a medical diagnosis. Please follow up with your healthcare provider for any concerns."}</p>
        </div>
        
        <div class="signature-area">
          <div class="signature-line">Patient Signature</div>
          <div class="signature-line">Date</div>
        </div>
        
        <div class="footer">
          <div class="footer-left">
            Generated by CliniSense AI Clinical Decision Support<br>
            This is a computer-generated document.
          </div>
          <div class="footer-right">
            Page 1 of 1<br>
            ${currentDate} ${currentTime}
          </div>
        </div>
      </body>
      </html>
    `)

    printWindow.document.close()
  }

  if (!instructions && !isGenerating) {
    return (
      <div className="glass-panel rounded-xl p-8 gradient-border text-center">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Generate Patient Instructions</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Create patient-friendly discharge instructions based on the consultation. The AI will generate clear, simple
          language suitable for patients.
        </p>
        <Button onClick={generateInstructions} className="gap-2">
          <Sparkles className="h-4 w-4" />
          Generate Instructions
        </Button>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="glass-panel rounded-xl p-8 gradient-border text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Generating Patient Instructions...</h3>
        <p className="text-sm text-muted-foreground">Creating clear, patient-friendly discharge information.</p>
      </div>
    )
  }

  const displayInstructions = isEditing ? editedInstructions : instructions

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
              <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={generateInstructions}>
                <Sparkles className="h-3 w-3" />
                Regenerate
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Instructions content */}
      <div className="glass-panel rounded-xl p-6 gradient-border space-y-6">
        <Section
          title="Visit Summary"
          content={displayInstructions?.visit_summary || ""}
          isEditing={isEditing}
          onChange={(value) => setEditedInstructions((prev) => (prev ? { ...prev, visit_summary: value } : null))}
          placeholder="Summary of why the patient was seen..."
        />

        <Section
          title="Symptoms Discussed"
          content={displayInstructions?.symptoms_discussed || ""}
          isEditing={isEditing}
          onChange={(value) => setEditedInstructions((prev) => (prev ? { ...prev, symptoms_discussed: value } : null))}
          placeholder="Key symptoms that were discussed..."
        />

        <Section
          title="Warning Signs - Return Immediately If:"
          content={displayInstructions?.watch_for || ""}
          isEditing={isEditing}
          onChange={(value) => setEditedInstructions((prev) => (prev ? { ...prev, watch_for: value } : null))}
          placeholder="Return precautions and warning signs..."
          highlight
        />

        <Section
          title="Next Steps & Follow-Up"
          content={displayInstructions?.next_steps || ""}
          isEditing={isEditing}
          onChange={(value) => setEditedInstructions((prev) => (prev ? { ...prev, next_steps: value } : null))}
          placeholder="Follow-up guidance..."
        />

        {/* Disclaimer */}
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-400 mb-1">Important Notice</p>
              <p className="text-sm text-muted-foreground">
                {displayInstructions?.disclaimer ||
                  "This document is for informational purposes only and does not constitute a medical diagnosis. Please follow up with your healthcare provider for any concerns."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({
  title,
  content,
  isEditing,
  onChange,
  placeholder,
  highlight,
}: {
  title: string
  content: string
  isEditing: boolean
  onChange: (value: string) => void
  placeholder: string
  highlight?: boolean
}) {
  return (
    <div className={cn(highlight && "p-4 bg-red-500/5 border border-red-500/10 rounded-lg -mx-2")}>
      <h3 className={cn("text-sm font-semibold mb-2", highlight ? "text-red-400" : "text-foreground")}>{title}</h3>
      {isEditing ? (
        <Textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[100px] bg-background/50"
        />
      ) : (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{content || "Not provided"}</p>
      )}
    </div>
  )
}
