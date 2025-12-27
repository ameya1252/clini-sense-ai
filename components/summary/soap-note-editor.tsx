"use client"

import { useState } from "react"
import type { SOAPNote } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, Copy, Check, RefreshCw, Loader2, Save } from "lucide-react"
import { upsertSOAPNote } from "@/lib/actions/consultations"

interface SOAPNoteEditorProps {
  consultationId: string
  soapNote: SOAPNote | null
  onUpdate: (note: SOAPNote) => void
  isGenerating: boolean
  onRegenerate: () => void
}

export function SOAPNoteEditor({
  consultationId,
  soapNote,
  onUpdate,
  isGenerating,
  onRegenerate,
}: SOAPNoteEditorProps) {
  const [isCopied, setIsCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [localNote, setLocalNote] = useState({
    subjective: soapNote?.subjective || "",
    objective: soapNote?.objective || "",
    assessment: soapNote?.assessment || "",
    plan: soapNote?.plan || "",
  })

  // Update local note when soapNote changes (e.g., after generation)
  if (soapNote && localNote.subjective === "" && soapNote.subjective) {
    setLocalNote({
      subjective: soapNote.subjective,
      objective: soapNote.objective || "",
      assessment: soapNote.assessment || "",
      plan: soapNote.plan || "",
    })
  }

  async function handleSave() {
    setIsSaving(true)
    try {
      await upsertSOAPNote(consultationId, localNote)
      if (soapNote) {
        onUpdate({ ...soapNote, ...localNote, updated_at: new Date().toISOString() })
      }
    } catch (error) {
      console.error("[v0] Error saving SOAP note:", error)
    } finally {
      setIsSaving(false)
    }
  }

  function handleCopy() {
    const fullNote = `SOAP NOTE
================

SUBJECTIVE:
${localNote.subjective || "N/A"}

OBJECTIVE:
${localNote.objective || "N/A"}

ASSESSMENT:
${localNote.assessment || "N/A"}

PLAN:
${localNote.plan || "N/A"}`

    navigator.clipboard.writeText(fullNote)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="glass-panel rounded-xl p-6 gradient-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">SOAP Note</h2>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRegenerate} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-1 hidden sm:inline">{isGenerating ? "Generating..." : "Regenerate"}</span>
          </Button>

          <Button variant="outline" size="sm" onClick={handleCopy}>
            {isCopied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            <span className="ml-1 hidden sm:inline">{isCopied ? "Copied!" : "Copy"}</span>
          </Button>

          <Button size="sm" onClick={handleSave} disabled={isSaving} className="teal-glow-sm">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span className="ml-1 hidden sm:inline">Save</span>
          </Button>
        </div>
      </div>

      {isGenerating ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-sm text-muted-foreground">Generating SOAP note...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="subjective" className="text-xs uppercase tracking-wider text-muted-foreground">
              Subjective
            </Label>
            <Textarea
              id="subjective"
              value={localNote.subjective}
              onChange={(e) => setLocalNote({ ...localNote, subjective: e.target.value })}
              placeholder="Patient's chief complaint and history..."
              className="min-h-[150px] bg-secondary/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="objective" className="text-xs uppercase tracking-wider text-muted-foreground">
              Objective
            </Label>
            <Textarea
              id="objective"
              value={localNote.objective}
              onChange={(e) => setLocalNote({ ...localNote, objective: e.target.value })}
              placeholder="Factual observations..."
              className="min-h-[150px] bg-secondary/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assessment" className="text-xs uppercase tracking-wider text-muted-foreground">
              Assessment
            </Label>
            <Textarea
              id="assessment"
              value={localNote.assessment}
              onChange={(e) => setLocalNote({ ...localNote, assessment: e.target.value })}
              placeholder="Clinical considerations (not diagnoses)..."
              className="min-h-[150px] bg-secondary/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan" className="text-xs uppercase tracking-wider text-muted-foreground">
              Plan
            </Label>
            <Textarea
              id="plan"
              value={localNote.plan}
              onChange={(e) => setLocalNote({ ...localNote, plan: e.target.value })}
              placeholder="Suggested next steps (as considerations)..."
              className="min-h-[150px] bg-secondary/30"
            />
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-4 text-center">
        This note is auto-generated as a draft. Please review and edit before finalizing.
      </p>
    </div>
  )
}
