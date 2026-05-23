import { useCallback, useEffect, useRef } from 'react'
import type { AnimatedDoodle, DoodlePoint, DoodleStroke } from '@/types/editorState'
import {
  drawAnimatedDoodle,
  drawDoodleStrokes,
  type DoodleBrushSettings,
} from '@/utils/animatedDoodle'

interface DoodlePlaybackOverlayProps {
  animation: AnimatedDoodle
  currentTime: number
  startTime: number
}

interface DoodleRecordingOverlayProps {
  strokes: DoodleStroke[]
  settings: DoodleBrushSettings
  currentTime: number
  recordingStartTime: number | null
  isPlaying: boolean
  onRecordingStart: () => number
  onStrokesChange: (strokes: DoodleStroke[]) => void
}

function syncCanvasSize(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect()
  const ratio = window.devicePixelRatio || 1
  const width = Math.max(1, Math.round(rect.width * ratio))
  const height = Math.max(1, Math.round(rect.height * ratio))
  if (canvas.width !== width) canvas.width = width
  if (canvas.height !== height) canvas.height = height
}

function useCanvasResize(
  ref: React.RefObject<HTMLCanvasElement | null>,
  redraw: () => void,
) {
  const redrawRef = useRef(redraw)

  useEffect(() => {
    redrawRef.current = redraw
  }, [redraw])

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const resize = () => {
      syncCanvasSize(canvas)
      redrawRef.current()
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [ref])
}

export function VideoDoodlePlaybackOverlay({
  animation,
  currentTime,
  startTime,
}: DoodlePlaybackOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawAnimatedDoodle(ctx, animation, currentTime - startTime, canvas.width, canvas.height)
  }, [animation, currentTime, startTime])

  useCanvasResize(canvasRef, redraw)
  useEffect(redraw, [redraw])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-[13] h-full w-full"
      aria-hidden
    />
  )
}

export function VideoDoodleRecordingOverlay({
  strokes,
  settings,
  currentTime,
  recordingStartTime,
  isPlaying,
  onRecordingStart,
  onStrokesChange,
}: DoodleRecordingOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const strokesRef = useRef(strokes)
  const activeStrokeRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(recordingStartTime)
  const clockRef = useRef({ time: currentTime, playing: isPlaying, updatedAt: performance.now() })

  useEffect(() => {
    strokesRef.current = strokes
  }, [strokes])

  useEffect(() => {
    startTimeRef.current = recordingStartTime
  }, [recordingStartTime])

  useEffect(() => {
    clockRef.current = { time: currentTime, playing: isPlaying, updatedAt: performance.now() }
  }, [currentTime, isPlaying])

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawDoodleStrokes(ctx, strokesRef.current, Number.POSITIVE_INFINITY, canvas.width, canvas.height)
  }, [])

  useCanvasResize(canvasRef, redraw)
  useEffect(redraw, [redraw, strokes])

  const recordedAt = useCallback(() => {
    const clock = clockRef.current
    const timelineTime = clock.playing
      ? clock.time + (performance.now() - clock.updatedAt) / 1000
      : clock.time
    return Math.max(0, timelineTime - (startTimeRef.current ?? timelineTime))
  }, [])

  const canvasPoint = (event: React.PointerEvent<HTMLCanvasElement>): DoodlePoint => {
    const rect = event.currentTarget.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
      at: recordedAt(),
    }
  }

  const commit = (next: DoodleStroke[]) => {
    strokesRef.current = next
    onStrokesChange(next)
    redraw()
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (startTimeRef.current == null) {
      startTimeRef.current = onRecordingStart()
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    const stroke: DoodleStroke = {
      color: settings.color,
      width: (settings.size / 640) * 100,
      erasing: settings.erasing,
      points: [canvasPoint(event)],
    }
    const next = [...strokesRef.current, stroke]
    activeStrokeRef.current = next.length - 1
    commit(next)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const active = activeStrokeRef.current
    if (active == null || !(event.buttons & 1)) return
    event.preventDefault()
    event.stopPropagation()
    const next = strokesRef.current.map((stroke, index) =>
      index === active
        ? { ...stroke, points: [...stroke.points, canvasPoint(event)] }
        : stroke,
    )
    commit(next)
  }

  const stopDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault()
    event.stopPropagation()
    activeStrokeRef.current = null
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      // Pointer capture may have ended outside the canvas.
    }
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-[30] h-full w-full touch-none cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDrawing}
        onPointerCancel={stopDrawing}
        aria-label="在视频上绘制动态涂鸦"
      />
      <span className="pointer-events-none absolute left-3 top-3 z-[31] rounded-full bg-black/45 px-2.5 py-1 text-[10px] text-white">
        在视频上拖动绘制
      </span>
    </>
  )
}
