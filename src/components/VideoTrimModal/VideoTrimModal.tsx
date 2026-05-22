import { Check, Scissors, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { trimVideoOnServer } from '@/api/videoTrim'
import { formatDurationMs, clamp } from '@/utils/formatTime'
import type { VideoTrimRequest, VideoTrimResult } from '@/utils/videoTrimFlow'

const MIN_CLIP_MS = 2000
const MAX_CLIP_MS = 60_000

type ActiveHandle = 'start' | 'end' | null

interface VideoTrimModalProps {
  request: VideoTrimRequest | null
  onClose: (result: VideoTrimResult | null) => void
}

export function VideoTrimModal({ request, onClose }: VideoTrimModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [url, setUrl] = useState<string | null>(null)
  const [durationMs, setDurationMs] = useState(0)
  const [startMs, setStartMs] = useState(0)
  const [endMs, setEndMs] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [activeHandle, setActiveHandle] = useState<ActiveHandle>(null)
  const [previewAt, setPreviewAt] = useState<'start' | 'end'>('start')

  useEffect(() => {
    if (!request) {
      setUrl(null)
      setReady(false)
      return
    }
    const objectUrl = URL.createObjectURL(request.file)
    setUrl(objectUrl)
    setError(null)
    setStartMs(0)
    setEndMs(0)
    setDurationMs(0)
    setReady(false)
    setActiveHandle(null)
    setPreviewAt('start')

    return () => URL.revokeObjectURL(objectUrl)
  }, [request])

  const seekTo = useCallback((ms: number, pause = true) => {
    const el = videoRef.current
    if (!el || !Number.isFinite(ms)) return
    const t = ms / 1000
    const apply = () => {
      try {
        el.currentTime = t
      } catch {
        /* ignore */
      }
      if (pause) el.pause()
    }
    if (el.readyState >= 1) apply()
    else el.addEventListener('loadeddata', apply, { once: true })
  }, [])

  const onVideoLoaded = useCallback(() => {
    const el = videoRef.current
    if (!el) return
    const total = Math.round((el.duration || 3) * 1000)
    const cap = Math.min(total, MAX_CLIP_MS)
    setDurationMs(total)
    setEndMs(cap)
    setStartMs(0)
    setReady(true)
    seekTo(0, true)
  }, [seekTo])

  const clipMs = Math.max(0, endMs - startMs)

  const msFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current
      if (!track || durationMs <= 0) return 0
      const rect = track.getBoundingClientRect()
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1)
      return Math.round(ratio * durationMs)
    },
    [durationMs],
  )

  const updateStart = useCallback(
    (ms: number) => {
      const maxStart = Math.max(0, endMs - MIN_CLIP_MS)
      const next = clamp(ms, 0, maxStart)
      setStartMs(next)
      setPreviewAt('start')
      seekTo(next, true)
    },
    [endMs, seekTo],
  )

  const updateEnd = useCallback(
    (ms: number) => {
      const minEnd = startMs + MIN_CLIP_MS
      const cap = Math.min(durationMs || MAX_CLIP_MS, MAX_CLIP_MS)
      const next = clamp(ms, minEnd, cap)
      setEndMs(next)
      setPreviewAt('end')
      seekTo(next, true)
    },
    [startMs, durationMs, seekTo],
  )

  useEffect(() => {
    if (!ready || activeHandle) return
    const el = videoRef.current
    if (!el) return

    const onTimeUpdate = () => {
      if (activeHandle) return
      const tMs = el.currentTime * 1000
      if (tMs >= endMs - 80) {
        el.currentTime = startMs / 1000
      }
    }

    el.addEventListener('timeupdate', onTimeUpdate)
    const playLoop = () => {
      el.currentTime = startMs / 1000
      void el.play().catch(() => {})
    }
    playLoop()

    return () => {
      el.removeEventListener('timeupdate', onTimeUpdate)
      el.pause()
    }
  }, [ready, activeHandle, startMs, endMs])

  useEffect(() => {
    if (!activeHandle) return

    const onMove = (e: PointerEvent) => {
      const ms = msFromClientX(e.clientX)
      if (activeHandle === 'start') updateStart(ms)
      else updateEnd(ms)
    }

    const onUp = () => setActiveHandle(null)

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [activeHandle, msFromClientX, updateStart, updateEnd])

  const handleConfirm = async () => {
    if (!request || clipMs < MIN_CLIP_MS) {
      setError(`请选取至少 ${MIN_CLIP_MS / 1000} 秒的片段`)
      return
    }
    setProcessing(true)
    setError(null)
    try {
      const trimmed = await trimVideoOnServer(
        request.file,
        startMs / 1000,
        endMs / 1000,
        request.file.name || 'clip.mp4',
      )
      onClose({
        blob: trimmed,
        durationMs: clipMs,
        startSec: startMs / 1000,
        endSec: endMs / 1000,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : '裁剪失败')
    } finally {
      setProcessing(false)
    }
  }

  if (!request || !url) return null

  const title = request.sceneTitle || '选取片段'
  const startPct = durationMs > 0 ? (startMs / durationMs) * 100 : 0
  const endPct = durationMs > 0 ? (endMs / durationMs) * 100 : 100

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/95">
      <header className="flex shrink-0 items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={() => onClose(null)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white"
          aria-label="取消"
        >
          <X size={20} />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-white">裁剪素材</p>
          <p className="text-[10px] text-white/70">{title}</p>
        </div>
        <span className="w-9" />
      </header>

      <div className="relative min-h-0 flex-1 bg-black">
        <video
          ref={videoRef}
          src={url}
          playsInline
          muted
          preload="auto"
          className="h-full w-full object-contain"
          onLoadedMetadata={onVideoLoaded}
        />
        <div className="pointer-events-none absolute inset-x-0 top-4 px-6">
          <div className="rounded-lg border border-white/30 bg-black/50 px-3 py-2 text-center backdrop-blur-sm">
            <p className="text-xs text-white/90">
              {previewAt === 'start' ? '起点画面' : '终点画面'} · 已选{' '}
              {formatDurationMs(clipMs)}
            </p>
          </div>
        </div>
      </div>

      <div className="shrink-0 space-y-4 bg-bg px-4 pb-8 pt-4">
        <p className="text-center text-[10px] text-text-muted">
          拖动左右手柄选片段；松手后会循环预览选中区间（{MIN_CLIP_MS / 1000}–
          {MAX_CLIP_MS / 1000} 秒）
        </p>

        <div className="space-y-3">
          <div className="flex justify-between text-[10px] text-text-muted tabular-nums">
            <span>起点 {formatDurationMs(startMs)}</span>
            <span>终点 {formatDurationMs(endMs)}</span>
          </div>

          <div
            ref={trackRef}
            className="relative mx-1 h-12 touch-none select-none rounded-lg bg-zinc-200"
            role="group"
            aria-label="裁剪时间轴"
          >
            <div
              className="absolute inset-y-3 left-0 rounded-l-lg bg-zinc-400/80"
              style={{ width: `${startPct}%` }}
            />
            <div
              className="absolute inset-y-2 rounded-md bg-primary/35 ring-2 ring-primary"
              style={{ left: `${startPct}%`, width: `${Math.max(0, endPct - startPct)}%` }}
            />
            <div
              className="absolute inset-y-3 right-0 rounded-r-lg bg-zinc-400/80"
              style={{ width: `${100 - endPct}%` }}
            />

            <button
              type="button"
              className={`absolute top-1/2 z-10 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white shadow-md transition-transform ${
                activeHandle === 'start' ? 'scale-110 border-primary' : 'border-primary/80'
              }`}
              style={{ left: `${startPct}%` }}
              aria-label="拖动调整起点"
              onPointerDown={(e) => {
                e.preventDefault()
                setActiveHandle('start')
                updateStart(msFromClientX(e.clientX))
              }}
            />

            <button
              type="button"
              className={`absolute top-1/2 z-10 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white shadow-md transition-transform ${
                activeHandle === 'end' ? 'scale-110 border-primary' : 'border-primary/80'
              }`}
              style={{ left: `${endPct}%` }}
              aria-label="拖动调整终点"
              onPointerDown={(e) => {
                e.preventDefault()
                setActiveHandle('end')
                updateEnd(msFromClientX(e.clientX))
              }}
            />
          </div>
        </div>

        {error ? <p className="text-center text-xs text-red-600">{error}</p> : null}

        <button
          type="button"
          disabled={processing || !ready || clipMs < MIN_CLIP_MS}
          onClick={() => void handleConfirm()}
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-primary py-3.5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] disabled:opacity-50"
        >
          {processing ? (
            '正在裁剪…'
          ) : (
            <>
              <Scissors size={18} />
              使用此片段
              <Check size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
