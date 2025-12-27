import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { consultationId } = await request.json()
    if (!consultationId) {
      return NextResponse.json({ error: "Consultation ID required" }, { status: 400 })
    }

    const apiKey = process.env.DEEPGRAM_API_KEY
    if (!apiKey) {
      console.error("[v0] DEEPGRAM_API_KEY not configured")
      return NextResponse.json({ error: "Deepgram not configured" }, { status: 500 })
    }

    // Build Deepgram WebSocket URL with parameters
    const params = new URLSearchParams({
      model: "nova-2",
      language: "en",
      punctuate: "true",
      interim_results: "true",
      endpointing: "300",
      encoding: "linear16",
      sample_rate: "16000",
      channels: "1",
    })

    const url = `wss://api.deepgram.com/v1/listen?${params.toString()}`

    return NextResponse.json({
      url: url,
      apiKey: apiKey,
    })
  } catch (error) {
    console.error("[v0] Error in Deepgram token route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
