import { useCallback, useEffect, useRef, useState } from 'react'

const MAX_MS = 60_000

function pickMimeType(): string {
  const candidates = [
    'video/mp4',
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9,opus',
    'video/webm',
  ]
  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? ''
}

export function useVideoRecorder(stream: MediaStream | null) {
  const [recording, setRecording] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const startedAtRef = useRef(0)

  const stopRecorder = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current
      if (!recorder || recorder.state === 'inactive') {
        resolve(null)
        return
      }

      recorder.onstop = () => {
        const mime = recorder.mimeType || pickMimeType() || 'video/mp4'
        const blob = chunksRef.current.length
          ? new Blob(chunksRef.current, { type: mime })
          : null
        chunksRef.current = []
        recorderRef.current = null
        resolve(blob)
      }

      if (recorder.state === 'recording') {
        recorder.requestData()
      }
      recorder.stop()
    })
  }, [])

  const start = useCallback(() => {
    if (!stream || recording) return

    const mimeType = pickMimeType()
    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream)

    chunksRef.current = []
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.start(250)
    recorderRef.current = recorder
    startedAtRef.current = Date.now()
    setElapsedMs(0)
    setRecording(true)

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAtRef.current
      setElapsedMs(elapsed)
      if (elapsed >= MAX_MS) {
        void stopRecorder().then(() => setRecording(false))
      }
    }, 200)
  }, [stream, recording, stopRecorder])

  const stop = useCallback(async () => {
    clearInterval(timerRef.current)
    setRecording(false)
    const blob = await stopRecorder()
    const durationMs = Date.now() - startedAtRef.current
    return { blob, durationMs }
  }, [stopRecorder])

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      if (recorderRef.current?.state === 'recording') {
        recorderRef.current.stop()
      }
    }
  }, [])

  return { recording, elapsedMs, start, stop, maxMs: MAX_MS }
}
