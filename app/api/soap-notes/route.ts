import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { upsertSOAPNote } from "@/lib/actions/consultations"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { consultationId, subjective, objective, assessment, plan } = await request.json()

    if (!consultationId) {
      return NextResponse.json({ error: "Consultation ID required" }, { status: 400 })
    }

    await upsertSOAPNote(consultationId, {
      subjective,
      objective,
      assessment,
      plan,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error saving SOAP note:", error)
    return NextResponse.json({ error: "Failed to save SOAP note" }, { status: 500 })
  }
}
