import { neon } from "@neondatabase/serverless"

export function getDb() {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!dbUrl) {
    throw new Error("DATABASE_URL or POSTGRES_URL environment variable is not set")
  }
  return neon(dbUrl)
}

// For backwards compatibility
export const sql = (...args: Parameters<ReturnType<typeof neon>>) => {
  const db = getDb()
  return db(...args)
}

// Types for database entities
export interface Profile {
  id: string
  user_id: string
  full_name: string | null
  specialty: string | null
  organization: string | null
  created_at: string
  updated_at: string
}

export interface Consultation {
  id: string
  user_id: string
  status: "active" | "paused" | "completed"
  chief_complaint: string | null
  started_at: string
  ended_at: string | null
  created_at: string
  updated_at: string
}

export interface TranscriptEntry {
  id: string
  consultation_id: string
  speaker: string
  content: string
  confidence: number | null
  is_final: boolean
  created_at: string
}

export interface AIEvent {
  id: string
  consultation_id: string
  event_type: "follow_up" | "red_flag" | "entities"
  content: Record<string, unknown>
  created_at: string
}

export interface SOAPNote {
  id: string
  consultation_id: string
  subjective: string | null
  objective: string | null
  assessment: string | null
  plan: string | null
  created_at: string
  updated_at: string
}

export interface LabResult {
  id: string
  consultation_id: string
  test_name: string
  value: string
  unit: string | null
  reference_range: string | null
  test_date: string
  flag: "normal" | "mild" | "abnormal" | null
  created_at: string
  updated_at: string
}

export interface LabAIInsight {
  id: string
  consultation_id: string
  insight_type: "abnormal" | "pattern" | "correlation" | "reassuring"
  content: Record<string, unknown>
  created_at: string
}

export interface LabSafetyChecklistItem {
  id: string
  consultation_id: string
  item_key: string
  item_label: string
  is_checked: boolean
  prompt: string | null
  created_at: string
  updated_at: string
}
