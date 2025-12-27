"use client"

import { useCallback, useRef, useState, useEffect } from "react"
import type { TranscriptEntry } from "@/lib/db"
import { saveTranscriptEntry } from "@/lib/actions/consultations"

interface UseDeepgramStreamingOptions {
  consultationId: string
  onFinalTranscript: (entry: TranscriptEntry) => void
  onInterimTranscript: (text: string) => void
}

interface DeepgramMessage {
  type: string
  channel?: {
    alternatives?: Array<{
      transcript: string
      confidence: number
    }>
  }
  is_final?: boolean
  speech_final?: boolean
}

export function useDeepgramStreaming({
  consultationId,
  onFinalTranscript,
  onInterimTranscript,
}: UseDeepgramStreamingOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  // Cleanup function
  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setIsConnected(false)
  }, [])

  // Connect to Deepgram
  const connect = useCallback(async () => {
    cleanup()
    reconnectAttemptsRef.current = 0
    setError(null)

    try {
      // Get WebSocket URL and API key from our API
      const response = await fetch("/api/deepgram/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultationId }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || "Failed to get Deepgram connection")
      }

      const { url, apiKey } = await response.json()

      if (!apiKey) {
        throw new Error("DEEPGRAM_API_KEY not configured. Please add it to your environment variables.")
      }

      console.log("[v0] Connecting to Deepgram...")

      // Browser WebSockets can't set Authorization header, but Deepgram
      // accepts the API key via the protocol header as ["token", apiKey]
      const ws = new WebSocket(url, ["token", apiKey])
      wsRef.current = ws

      ws.onopen = () => {
        console.log("[v0] Deepgram WebSocket connected")
        setIsConnected(true)
        setError(null)
        reconnectAttemptsRef.current = 0
      }

      ws.onmessage = async (event) => {
        try {
          const data: DeepgramMessage = JSON.parse(event.data)

          if (data.type === "Results" && data.channel?.alternatives?.[0]) {
            const alternative = data.channel.alternatives[0]
            const transcript = alternative.transcript.trim()

            if (!transcript) return

            if (data.is_final || data.speech_final) {
              // Final transcript - save to DB and update UI
              const entry: TranscriptEntry = {
                id: crypto.randomUUID(),
                consultation_id: consultationId,
                speaker: "conversation",
                content: transcript,
                confidence: alternative.confidence,
                is_final: true,
                created_at: new Date().toISOString(),
              }

              onFinalTranscript(entry)

              // Save to database (fire and forget)
              saveTranscriptEntry(consultationId, transcript, alternative.confidence, true).catch((err) =>
                console.error("[v0] Error saving transcript:", err),
              )
            } else {
              // Interim transcript - just update UI
              onInterimTranscript(transcript)
            }
          }
        } catch (err) {
          console.error("[v0] Error parsing Deepgram message:", err)
        }
      }

      ws.onerror = (err) => {
        console.error("[v0] Deepgram WebSocket error:", err)
        setError("WebSocket connection error")
      }

      ws.onclose = (event) => {
        console.log("[v0] Deepgram WebSocket closed:", event.code, event.reason)
        setIsConnected(false)

        // Attempt reconnection with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
          console.log(`[v0] Reconnecting in ${delay}ms...`)
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++
            connect()
          }, delay)
        } else {
          setError("Failed to connect after multiple attempts")
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect to Deepgram"
      console.error("[v0] Error connecting to Deepgram:", errorMessage)
      setError(errorMessage)
      setIsConnected(false)
    }
  }, [consultationId, onFinalTranscript, onInterimTranscript, cleanup])

  // Disconnect
  const disconnect = useCallback(() => {
    cleanup()
    console.log("[v0] Disconnected from Deepgram")
  }, [cleanup])

  // Send audio data
  const sendAudio = useCallback((audioData: Float32Array) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Convert Float32Array to Int16Array (PCM linear16)
      const int16 = new Int16Array(audioData.length)
      for (let i = 0; i < audioData.length; i++) {
        const s = Math.max(-1, Math.min(1, audioData[i]))
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
      }
      wsRef.current.send(int16.buffer)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup()
  }, [cleanup])

  return {
    isConnected,
    error,
    connect,
    disconnect,
    sendAudio,
  }
}
