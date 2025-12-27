"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function startConsultation(userId: string, chiefComplaint?: string) {
  try {
    const results = await sql`
      INSERT INTO consultations (user_id, chief_complaint, status)
      VALUES (${userId}, ${chiefComplaint || null}, 'active')
      RETURNING id
    `

    if (results.length === 0) {
      return { success: false, error: "Failed to create consultation" }
    }

    revalidatePath("/dashboard")
    return { success: true, consultationId: results[0].id }
  } catch (error) {
    console.error("[v0] Error starting consultation:", error)
    return { success: false, error: "Database error" }
  }
}

export async function updateConsultationStatus(consultationId: string, status: "active" | "paused" | "completed") {
  try {
    const endedAt = status === "completed" ? new Date().toISOString() : null

    await sql`
      UPDATE consultations 
      SET status = ${status}, ended_at = ${endedAt}, updated_at = NOW()
      WHERE id = ${consultationId}
    `

    revalidatePath(`/consultation/${consultationId}`)
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error updating consultation status:", error)
    return { success: false, error: "Database error" }
  }
}

export async function saveTranscriptEntry(
  consultationId: string,
  content: string,
  confidence?: number,
  isFinal = true,
) {
  try {
    await sql`
      INSERT INTO transcript_entries (consultation_id, content, confidence, is_final)
      VALUES (${consultationId}, ${content}, ${confidence || null}, ${isFinal})
    `
    return { success: true }
  } catch (error) {
    console.error("[v0] Error saving transcript:", error)
    return { success: false, error: "Database error" }
  }
}

export async function saveAIEvent(
  consultationId: string,
  eventType: "follow_up" | "red_flag" | "entities",
  content: Record<string, unknown>,
) {
  try {
    await sql`
      INSERT INTO ai_events (consultation_id, event_type, content)
      VALUES (${consultationId}, ${eventType}, ${JSON.stringify(content)})
    `
    return { success: true }
  } catch (error) {
    console.error("[v0] Error saving AI event:", error)
    return { success: false, error: "Database error" }
  }
}

export async function upsertSOAPNote(
  consultationId: string,
  data: {
    subjective?: string
    objective?: string
    assessment?: string
    plan?: string
  },
) {
  try {
    await sql`
      INSERT INTO soap_notes (consultation_id, subjective, objective, assessment, plan)
      VALUES (${consultationId}, ${data.subjective || null}, ${data.objective || null}, ${data.assessment || null}, ${data.plan || null})
      ON CONFLICT (consultation_id) 
      DO UPDATE SET 
        subjective = COALESCE(${data.subjective || null}, soap_notes.subjective),
        objective = COALESCE(${data.objective || null}, soap_notes.objective),
        assessment = COALESCE(${data.assessment || null}, soap_notes.assessment),
        plan = COALESCE(${data.plan || null}, soap_notes.plan),
        updated_at = NOW()
    `
    return { success: true }
  } catch (error) {
    console.error("[v0] Error upserting SOAP note:", error)
    return { success: false, error: "Database error" }
  }
}
