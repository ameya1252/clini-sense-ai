"use client"

import { useState } from "react"
import { Shield, ShieldCheck } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function SafetyModeToggle() {
  const [safetyMode, setSafetyMode] = useState(true)

  return (
    <div className="flex items-center gap-2">
      {safetyMode ? <ShieldCheck className="h-4 w-4 text-green-400" /> : <Shield className="h-4 w-4 text-warning" />}
      <Label htmlFor="safety-mode" className="text-xs cursor-pointer">
        Safety Mode
      </Label>
      <Switch id="safety-mode" checked={safetyMode} onCheckedChange={setSafetyMode} />
    </div>
  )
}
