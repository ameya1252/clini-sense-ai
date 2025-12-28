"use client"

import { useState, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Stethoscope, ClipboardCheck } from "lucide-react"
import type {
  Consultation,
  TranscriptEntry,
  SOAPNote,
  LabResult,
  DischargeInstructions,
  ClinicianHandoff,
  DischargeChecklistItem,
} from "@/lib/db"
import { PatientInstructionsTab } from "./patient-instructions-tab"
import { ClinicianHandoffTab } from "./clinician-handoff-tab"
import { DischargeChecklistTab } from "./discharge-checklist-tab"

interface DischargeContentProps {
  consultation: Consultation
  transcripts: TranscriptEntry[]
  soapNote: SOAPNote | null
  labResults: LabResult[]
  symptoms: string[]
  safetyConsiderations: string[]
  initialDischargeInstructions: DischargeInstructions | null
  initialClinicianHandoff: ClinicianHandoff | null
  initialDischargeChecklist: DischargeChecklistItem[]
}

export function DischargeContent({
  consultation,
  transcripts,
  soapNote,
  labResults,
  symptoms,
  safetyConsiderations,
  initialDischargeInstructions,
  initialClinicianHandoff,
  initialDischargeChecklist,
}: DischargeContentProps) {
  const [dischargeInstructions, setDischargeInstructions] = useState<DischargeInstructions | null>(
    initialDischargeInstructions,
  )
  const [clinicianHandoff, setClinicianHandoff] = useState<ClinicianHandoff | null>(initialClinicianHandoff)
  const [dischargeChecklist, setDischargeChecklist] = useState<DischargeChecklistItem[]>(initialDischargeChecklist)

  const transcript = transcripts.map((t) => t.content).join(" ")

  const handleChecklistChange = useCallback(
    (itemKey: string, isChecked: boolean) => {
      setDischargeChecklist((prev) =>
        prev.map((item) => (item.item_key === itemKey ? { ...item, is_checked: isChecked } : item)),
      )

      fetch("/api/discharge/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultationId: consultation.id,
          itemKey,
          isChecked,
        }),
      }).catch(console.error)
    },
    [consultation.id],
  )

  return (
    <div className="max-w-5xl mx-auto">
      <Tabs defaultValue="patient" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-secondary/30">
          <TabsTrigger value="patient" className="gap-2 data-[state=active]:bg-primary/20">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Patient Instructions</span>
            <span className="sm:hidden">Patient</span>
          </TabsTrigger>
          <TabsTrigger value="handoff" className="gap-2 data-[state=active]:bg-primary/20">
            <Stethoscope className="h-4 w-4" />
            <span className="hidden sm:inline">Clinician Handoff</span>
            <span className="sm:hidden">Handoff</span>
          </TabsTrigger>
          <TabsTrigger value="checklist" className="gap-2 data-[state=active]:bg-primary/20">
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Safety Checklist</span>
            <span className="sm:hidden">Checklist</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patient">
          <PatientInstructionsTab
            consultation={consultation}
            instructions={dischargeInstructions}
            onUpdate={setDischargeInstructions}
            transcript={transcript}
            soapNote={soapNote}
            symptoms={symptoms}
            safetyConsiderations={safetyConsiderations}
          />
        </TabsContent>

        <TabsContent value="handoff">
          <ClinicianHandoffTab
            consultation={consultation}
            handoff={clinicianHandoff}
            onUpdate={setClinicianHandoff}
            transcript={transcript}
            soapNote={soapNote}
            labResults={labResults}
            symptoms={symptoms}
            safetyConsiderations={safetyConsiderations}
          />
        </TabsContent>

        <TabsContent value="checklist">
          <DischargeChecklistTab
            consultation={consultation}
            checklist={dischargeChecklist}
            onChange={handleChecklistChange}
            onInitialize={setDischargeChecklist}
            hasAbnormalLabs={labResults.some((lr) => lr.flag === "abnormal" || lr.flag === "mild")}
            hasSafetyConsiderations={safetyConsiderations.length > 0}
            hasInstructions={!!dischargeInstructions}
            hasHandoff={!!clinicianHandoff}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
