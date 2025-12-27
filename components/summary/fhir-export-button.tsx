"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileJson, Copy, Check, ExternalLink, FileText, Loader2 } from "lucide-react"
import type { Consultation, TranscriptEntry, AIEvent, SOAPNote } from "@/lib/db"

interface FHIRExportButtonProps {
  consultation: Consultation
  transcripts: TranscriptEntry[]
  aiEvents: AIEvent[]
  soapNote: SOAPNote | null
}

interface EntitiesContent {
  symptoms: Array<{
    name: string
    duration?: string
    severity?: string
  }>
  negatives: string[]
}

interface RedFlagContent {
  flags: Array<{
    description: string
    severity: "critical" | "warning" | "info"
    rationale?: string
  }>
}

export function FHIRExportButton({ consultation, transcripts, aiEvents, soapNote }: FHIRExportButtonProps) {
  const [copied, setCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("preview")
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  // Generate FHIR-like JSON structure
  const generateFHIRBundle = () => {
    const entitiesEvents = aiEvents.filter((e) => e.event_type === "entities")
    const redFlagEvents = aiEvents.filter((e) => e.event_type === "red_flag")

    const symptoms: Array<{ name: string; duration?: string; severity?: string }> = []
    entitiesEvents.forEach((e) => {
      const content = e.content as EntitiesContent
      if (content.symptoms) {
        symptoms.push(...content.symptoms)
      }
    })

    const safetyFlags: Array<{ description: string; severity: string }> = []
    redFlagEvents.forEach((e) => {
      const content = e.content as RedFlagContent
      if (content.flags) {
        safetyFlags.push(...content.flags.map((f) => ({ description: f.description, severity: f.severity })))
      }
    })

    const fhirBundle = {
      resourceType: "Bundle",
      type: "document",
      timestamp: new Date().toISOString(),
      meta: {
        profile: ["http://hl7.org/fhir/StructureDefinition/Bundle"],
        source: "CliniSense AI Clinical Decision Support",
        versionId: "1",
        lastUpdated: new Date().toISOString(),
      },
      identifier: {
        system: "urn:clinisense:consultation",
        value: consultation.id,
      },
      entry: [
        {
          fullUrl: `urn:uuid:${consultation.id}`,
          resource: {
            resourceType: "Encounter",
            id: consultation.id,
            status: consultation.status === "completed" ? "finished" : "in-progress",
            class: {
              system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
              code: "AMB",
              display: "ambulatory",
            },
            period: {
              start: consultation.created_at,
              end: consultation.ended_at || undefined,
            },
            reasonCode: consultation.chief_complaint ? [{ text: consultation.chief_complaint }] : undefined,
          },
        },
        {
          fullUrl: `urn:uuid:transcript-${consultation.id}`,
          resource: {
            resourceType: "DocumentReference",
            id: `transcript-${consultation.id}`,
            status: "current",
            type: {
              coding: [{ system: "http://loinc.org", code: "11506-3", display: "Progress note" }],
            },
            date: new Date().toISOString(),
            content: [
              {
                attachment: {
                  contentType: "text/plain",
                  data: btoa(transcripts.map((t) => t.content).join("\n")),
                },
              },
            ],
          },
        },
        ...(soapNote
          ? [
              {
                fullUrl: `urn:uuid:soap-${consultation.id}`,
                resource: {
                  resourceType: "ClinicalImpression",
                  id: `soap-${consultation.id}`,
                  status: "completed",
                  encounter: { reference: `urn:uuid:${consultation.id}` },
                  date: soapNote.created_at,
                  summary: soapNote.assessment,
                  extension: [
                    {
                      url: "http://clinisense.ai/fhir/StructureDefinition/soap-note",
                      extension: [
                        { url: "subjective", valueString: soapNote.subjective },
                        { url: "objective", valueString: soapNote.objective },
                        { url: "assessment", valueString: soapNote.assessment },
                        { url: "plan", valueString: soapNote.plan },
                      ],
                    },
                  ],
                },
              },
            ]
          : []),
        ...symptoms.map((symptom, index) => ({
          fullUrl: `urn:uuid:symptom-${consultation.id}-${index}`,
          resource: {
            resourceType: "Observation",
            id: `symptom-${consultation.id}-${index}`,
            status: "final",
            code: { text: symptom.name },
            encounter: { reference: `urn:uuid:${consultation.id}` },
          },
        })),
        ...safetyFlags.map((flag, index) => ({
          fullUrl: `urn:uuid:safety-flag-${consultation.id}-${index}`,
          resource: {
            resourceType: "DetectedIssue",
            id: `safety-flag-${consultation.id}-${index}`,
            status: "final",
            severity: flag.severity === "critical" ? "high" : flag.severity === "warning" ? "moderate" : "low",
            code: { text: flag.description },
          },
        })),
      ],
    }

    return fhirBundle
  }

  const fhirJson = generateFHIRBundle()
  const jsonString = JSON.stringify(fhirJson, null, 2)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadJSON = () => {
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `consultation-${consultation.id}-fhir.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)

    try {
      const entitiesEvents = aiEvents.filter((e) => e.event_type === "entities")
      const redFlagEvents = aiEvents.filter((e) => e.event_type === "red_flag")

      const symptoms: Array<{ name: string; duration?: string; severity?: string }> = []
      entitiesEvents.forEach((e) => {
        const content = e.content as EntitiesContent
        if (content.symptoms) symptoms.push(...content.symptoms)
      })

      const safetyFlags: Array<{ description: string; severity: string }> = []
      redFlagEvents.forEach((e) => {
        const content = e.content as RedFlagContent
        if (content.flags)
          safetyFlags.push(...content.flags.map((f) => ({ description: f.description, severity: f.severity })))
      })

      // Create HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>CliniSense Clinical Report - ${consultation.id}</title>
          <style>
            @page { margin: 1in; size: letter; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 0; color: #1a1a1a; line-height: 1.5; font-size: 11pt; }
            .header { border-bottom: 2px solid #0d9488; padding-bottom: 15px; margin-bottom: 20px; }
            .logo { font-size: 20pt; font-weight: bold; color: #0d9488; }
            .subtitle { color: #666; font-size: 10pt; margin-top: 3px; }
            .meta { margin-top: 10px; font-size: 9pt; color: #666; }
            .meta-row { display: flex; gap: 30px; margin-top: 5px; }
            .section { margin-bottom: 20px; page-break-inside: avoid; }
            .section-title { font-size: 12pt; font-weight: 600; color: #0d9488; border-bottom: 1px solid #e5e5e5; padding-bottom: 5px; margin-bottom: 10px; }
            .soap-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .soap-item { background: #f8f9fa; padding: 12px; border-radius: 6px; border-left: 3px solid #0d9488; }
            .soap-label { font-size: 9pt; font-weight: 600; color: #0d9488; text-transform: uppercase; margin-bottom: 5px; }
            .soap-content { font-size: 10pt; white-space: pre-wrap; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 9pt; font-weight: 500; margin: 2px; }
            .badge-symptom { background: #e0f2f1; color: #00695c; }
            .badge-critical { background: #ffebee; color: #c62828; }
            .badge-warning { background: #fff3e0; color: #e65100; }
            .badge-info { background: #e3f2fd; color: #1565c0; }
            .transcript { background: #f5f5f5; padding: 15px; border-radius: 6px; font-size: 9pt; }
            .transcript-entry { margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #e0e0e0; }
            .transcript-entry:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
            .timestamp { font-size: 8pt; color: #999; }
            .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e5e5; font-size: 8pt; color: #999; text-align: center; }
            .disclaimer { background: #fff3e0; padding: 12px; border-radius: 6px; font-size: 9pt; color: #e65100; margin-bottom: 20px; border-left: 3px solid #e65100; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">CliniSense</div>
            <div class="subtitle">AI-Assisted Clinical Decision Support Report</div>
            <div class="meta">
              <div class="meta-row">
                <span><strong>Consultation ID:</strong> ${consultation.id.slice(0, 8)}...</span>
                <span><strong>Date:</strong> ${new Date(consultation.created_at).toLocaleDateString()}</span>
                <span><strong>Status:</strong> ${consultation.status}</span>
              </div>
              ${consultation.chief_complaint ? `<div style="margin-top: 5px;"><strong>Chief Complaint:</strong> ${consultation.chief_complaint}</div>` : ""}
            </div>
          </div>

          <div class="disclaimer">
            <strong>IMPORTANT DISCLAIMER:</strong> This document is generated by AI for clinical decision support only. 
            All information must be verified by a qualified healthcare professional. 
            This is NOT a diagnosis or prescription. Clinical judgment must always be applied.
          </div>

          ${
            soapNote
              ? `
          <div class="section">
            <div class="section-title">SOAP Note</div>
            <div class="soap-grid">
              <div class="soap-item">
                <div class="soap-label">Subjective</div>
                <div class="soap-content">${soapNote.subjective || "N/A"}</div>
              </div>
              <div class="soap-item">
                <div class="soap-label">Objective</div>
                <div class="soap-content">${soapNote.objective || "N/A"}</div>
              </div>
              <div class="soap-item">
                <div class="soap-label">Assessment</div>
                <div class="soap-content">${soapNote.assessment || "N/A"}</div>
              </div>
              <div class="soap-item">
                <div class="soap-label">Plan</div>
                <div class="soap-content">${soapNote.plan || "N/A"}</div>
              </div>
            </div>
          </div>
          `
              : ""
          }

          ${
            symptoms.length > 0
              ? `
          <div class="section">
            <div class="section-title">Extracted Symptoms</div>
            <div>
              ${symptoms.map((s) => `<span class="badge badge-symptom">${s.name}${s.duration ? ` (${s.duration})` : ""}${s.severity ? ` [${s.severity}]` : ""}</span>`).join("")}
            </div>
          </div>
          `
              : ""
          }

          ${
            safetyFlags.length > 0
              ? `
          <div class="section">
            <div class="section-title">Safety Considerations</div>
            <div>
              ${safetyFlags.map((f) => `<span class="badge badge-${f.severity}">${f.description}</span>`).join("")}
            </div>
          </div>
          `
              : ""
          }

          ${
            transcripts.length > 0
              ? `
          <div class="section">
            <div class="section-title">Consultation Transcript</div>
            <div class="transcript">
              ${transcripts.map((t) => `<div class="transcript-entry"><span class="timestamp">${new Date(t.created_at).toLocaleTimeString()}</span> - ${t.content}</div>`).join("")}
            </div>
          </div>
          `
              : ""
          }

          <div class="footer">
            <p>Generated by CliniSense AI Clinical Decision Support System</p>
            <p>FHIR R4 Compliant | HL7 Standard | Generated: ${new Date().toISOString()}</p>
            <p style="margin-top: 8px;"><em>This report is for clinical decision support only and does not constitute medical advice or diagnosis.</em></p>
          </div>
        </body>
        </html>
      `

      // Create an iframe to render and print the PDF
      const iframe = document.createElement("iframe")
      iframe.style.position = "fixed"
      iframe.style.right = "0"
      iframe.style.bottom = "0"
      iframe.style.width = "0"
      iframe.style.height = "0"
      iframe.style.border = "none"
      document.body.appendChild(iframe)

      const iframeDoc = iframe.contentWindow?.document
      if (iframeDoc) {
        iframeDoc.open()
        iframeDoc.write(htmlContent)
        iframeDoc.close()

        // Wait for content to load
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Trigger print dialog which allows saving as PDF
        iframe.contentWindow?.print()

        // Clean up after a delay
        setTimeout(() => {
          document.body.removeChild(iframe)
        }, 1000)
      }
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-primary/30 hover:border-primary hover:bg-primary/10 bg-transparent"
        >
          <FileJson className="h-4 w-4" />
          <span className="hidden sm:inline">Export EHR</span>
          <Badge variant="secondary" className="text-[10px] hidden sm:inline-flex">
            FHIR
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[90vw] max-w-lg sm:max-w-xl max-h-[80vh] glass-panel border-border flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileJson className="h-4 w-4 text-primary" />
            Export Clinical Report
          </DialogTitle>
          <DialogDescription className="text-xs">Export in FHIR R4 format or download as PDF report.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <TabsList className="grid grid-cols-2 shrink-0">
            <TabsTrigger value="preview" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="json" className="text-xs">
              <FileJson className="h-3 w-3 mr-1" />
              JSON
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="flex-1 min-h-0 mt-3 overflow-hidden">
            <ScrollArea className="h-[35vh] rounded-lg border border-border bg-secondary/30 p-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-primary text-sm">Clinical Report</h3>
                    <p className="text-[10px] text-muted-foreground">
                      ID: {consultation.id.slice(0, 8)}... | {new Date(consultation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {consultation.status}
                  </Badge>
                </div>

                {consultation.chief_complaint && (
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-[10px] text-muted-foreground mb-1">Chief Complaint</p>
                    <p className="text-xs font-medium">{consultation.chief_complaint}</p>
                  </div>
                )}

                {soapNote && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-semibold text-muted-foreground uppercase">SOAP Note</h4>
                    <div className="grid grid-cols-2 gap-1.5">
                      {["subjective", "objective", "assessment", "plan"].map((field) => (
                        <div key={field} className="p-1.5 rounded bg-muted/30 text-[10px]">
                          <span className="font-medium text-primary capitalize">{field[0].toUpperCase()}: </span>
                          <span className="text-muted-foreground line-clamp-2">
                            {soapNote[field as keyof SOAPNote] || "N/A"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-[9px]">
                    FHIR R4
                  </Badge>
                  <Badge variant="outline" className="text-[9px]">
                    {fhirJson.entry.length} Resources
                  </Badge>
                  <Badge variant="outline" className="text-[9px] text-primary border-primary/30">
                    HL7
                  </Badge>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="json" className="flex-1 min-h-0 mt-3 overflow-hidden">
            <ScrollArea className="h-[35vh] rounded-lg border border-border bg-secondary/30">
              <pre className="p-3 text-[10px] font-mono text-muted-foreground whitespace-pre-wrap break-all">
                {jsonString}
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-3 border-t border-border shrink-0 mt-3 gap-2">
          <a
            href="https://www.hl7.org/fhir/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors shrink-0"
          >
            <ExternalLink className="h-3 w-3" />
            <span className="hidden sm:inline">FHIR Docs</span>
          </a>
          <div className="flex gap-1.5 flex-wrap justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-1 bg-transparent text-[10px] h-7 px-2"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadJSON}
              className="gap-1 bg-transparent text-[10px] h-7 px-2"
            >
              <FileJson className="h-3 w-3" />
              JSON
            </Button>
            <Button
              size="sm"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="gap-1 bg-primary hover:bg-primary/90 text-[10px] h-7 px-2"
            >
              {isGeneratingPDF ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
              PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
