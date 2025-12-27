"use client"

import { useCallback, useRef, useState } from "react"

interface UseAudioRecordingOptions {
  onAudioData: (data: Float32Array) => void
  sampleRate?: number
}

export function useAudioRecording({ onAudioData, sampleRate = 16000 }: UseAudioRecordingOptions) {
  const [isRecording, setIsRecording] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const workletNodeRef = useRef<AudioWorkletNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startRecording = useCallback(async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: sampleRate,
          echoCancellation: true,
          noiseSuppression: true,
        },
      })
      streamRef.current = stream

      // Create audio context
      audioContextRef.current = new AudioContext({ sampleRate })

      // Create source from microphone
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream)

      // Use ScriptProcessor as fallback (AudioWorklet requires HTTPS in some browsers)
      const bufferSize = 4096
      const scriptProcessor = audioContextRef.current.createScriptProcessor(bufferSize, 1, 1)

      scriptProcessor.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer.getChannelData(0)
        // Create a copy of the audio data
        const audioData = new Float32Array(inputBuffer)
        onAudioData(audioData)
      }

      sourceRef.current.connect(scriptProcessor)
      scriptProcessor.connect(audioContextRef.current.destination)

      // Store reference for cleanup
      workletNodeRef.current = scriptProcessor as unknown as AudioWorkletNode

      setIsRecording(true)
      console.log("[v0] Audio recording started")
    } catch (error) {
      console.error("[v0] Error starting audio recording:", error)
      throw error
    }
  }, [onAudioData, sampleRate])

  const stopRecording = useCallback(() => {
    try {
      // Disconnect and cleanup
      if (workletNodeRef.current) {
        workletNodeRef.current.disconnect()
        workletNodeRef.current = null
      }

      if (sourceRef.current) {
        sourceRef.current.disconnect()
        sourceRef.current = null
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }

      setIsRecording(false)
      console.log("[v0] Audio recording stopped")
    } catch (error) {
      console.error("[v0] Error stopping audio recording:", error)
    }
  }, [])

  return {
    isRecording,
    startRecording,
    stopRecording,
  }
}
