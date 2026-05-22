import { Maximize2, Minimize2, Pause, Play, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ClipTransformLayer } from '@/components/editor/ClipTransformLayer'
import { VideoCropOverlay } from '@/components/editor/VideoCropOverlay'
import type { NormalizedCrop } from '@/types/clipTransform'
import { EffectOverlay } from '@/components/editor/EffectOverlay'
import { FilteredMedia } from '@/components/editor/FilteredMedia'
import type { ClipTransform } from '@/types/clipTransform'
import { VideoStickerOverlay } from '@/components/editor/VideoStickerOverlay'
import { VideoTextOverlay } from '@/components/editor/VideoTextOverlay'
import type { StickerOverlay, TextOverlay } from '@/types/editorState'
import { EDITOR_PREVIEW_ATTR } from '@/utils/editorSelectionHitTest'
import { clamp, formatTime } from '@/utils/formatTime'
import { isActiveAtTime } from '@/utils/timeRange'

export interface StickerPreviewItem {
  overlay: StickerOverlay
  editable: boolean
}

export interface TextPreviewItem {
  overlay: TextOverlay
  editable: boolean
}

interface VideoPreviewProps {
  poster: string
  videoSrc?: string
  clipTransform?: ClipTransform
  /** 当前片段内的播放时间 */
  clipTime?: number
  /** 当前片段播放倍速 */
  playbackRate?: number
  currentTime: number
  duration: number
  isPlaying: boolean
  filterCss?: string
  filterIntensity?: number
  effectId?: string
  textItems?: TextPreviewItem[]
  onTextChange?: (id: string, patch: Partial<TextOverlay>) => void
  onTextTransformEnd?: () => void
  onTextActivate?: (id: string) => void
  onTextContextMenu?: (e: React.MouseEvent, id: string) => void
  stickerItems?: StickerPreviewItem[]
  onStickerChange?: (id: string, patch: Partial<StickerOverlay>) => void
  onStickerTransformEnd?: () => void
  onStickerActivate?: (id: string) => void
  onStickerContextMenu?: (e: React.MouseEvent, id: string) => void
  onPreviewBackgroundClick?: () => void
  onPreviewContextMenu?: (e: React.MouseEvent) => void
  selectedTextId?: string | null
  selectedStickerId?: string | null
  onTogglePlay: () => void
  onSeek: (ratio: number) => void
  isCropMode?: boolean
  cropDraft?: NormalizedCrop
  onCropChange?: (crop: NormalizedCrop) => void
  onCropConfirm?: () => void
  onCropCancel?: () => void
  onSourceAspectChange?: (aspect: number) => void
  /** 为 false 时播放视频原声（需用户点击播放，满足浏览器策略） */
  previewMuted?: boolean
  previewVolume?: number
}

export function VideoPreview({
  poster,
  videoSrc,
  clipTransform,
  clipTime = 0,
  playbackRate = 1,
  currentTime,
  duration,
  isPlaying,
  filterCss = 'none',
  filterIntensity = 100,
  effectId = 'none',
  textItems = [],
  onTextChange,
  onTextTransformEnd,
  onTextActivate,
  onTextContextMenu,
  stickerItems = [],
  onStickerChange,
  onStickerTransformEnd,
  onStickerActivate,
  onStickerContextMenu,
  onPreviewBackgroundClick,
  onPreviewContextMenu,
  selectedTextId = null,
  selectedStickerId = null,
  onTogglePlay,
  onSeek,
  isCropMode = false,
  cropDraft,
  onCropChange,
  onCropConfirm,
  onCropCancel,
  onSourceAspectChange,
  previewMuted = false,
  previewVolume = 1,
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const [sourceAspect, setSourceAspect] = useState(16 / 9)
  const [scrubbing, setScrubbing] = useState(false)
  const [overlayExpanded, setOverlayExpanded] = useState(false)
  const [nativeFullscreen, setNativeFullscreen] = useState(false)
  const isExpanded = overlayExpanded || nativeFullscreen
  const progress = duration > 0 ? clamp(currentTime / duration, 0, 1) : 0

  const exitExpanded = useCallback(async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen()
      } catch {
        /* ignore */
      }
    }
    setOverlayExpanded(false)
  }, [])

  const enterExpanded = useCallback(async () => {
    const el = previewContainerRef.current
    if (!el) return
    if (el.requestFullscreen) {
      try {
        await el.requestFullscreen()
        return
      } catch {
        /* fallback to overlay */
      }
    }
    setOverlayExpanded(true)
  }, [])

  const toggleExpanded = useCallback(() => {
    if (isExpanded) void exitExpanded()
    else void enterExpanded()
  }, [enterExpanded, exitExpanded, isExpanded])

  useEffect(() => {
    const onFullscreenChange = () => {
      setNativeFullscreen(document.fullscreenElement === previewContainerRef.current)
      if (!document.fullscreenElement) setOverlayExpanded(false)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  useEffect(() => {
    if (!overlayExpanded) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') void exitExpanded()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [overlayExpanded, exitExpanded])

  useEffect(() => {
    if (!overlayExpanded) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [overlayExpanded])

  const seekRatioFromClientX = useCallback((clientX: number) => {
    const el = progressRef.current
    if (!el) return 0
    const { left, width } = el.getBoundingClientRect()
    if (width <= 0) return 0
    return clamp((clientX - left) / width, 0, 1)
  }, [])

  const syncSourceAspect = useCallback(() => {
    const video = videoRef.current
    if (video?.videoWidth && video.videoHeight) {
      const aspect = video.videoWidth / video.videoHeight
      setSourceAspect(aspect)
      onSourceAspectChange?.(aspect)
      return
    }
    if (!poster) return
    const img = new Image()
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        const aspect = img.naturalWidth / img.naturalHeight
        setSourceAspect(aspect)
        onSourceAspectChange?.(aspect)
      }
    }
    img.src = poster
  }, [poster, onSourceAspectChange])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoSrc) return

    const onMeta = () => syncSourceAspect()
    video.addEventListener('loadedmetadata', onMeta)
    onMeta()

    return () => video.removeEventListener('loadedmetadata', onMeta)
  }, [syncSourceAspect, videoSrc])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoSrc) return
    const target = clipTime
    if (!Number.isFinite(target)) return
    if (Math.abs(video.currentTime - target) > 0.06) {
      video.currentTime = target
    }
  }, [clipTime, currentTime, videoSrc])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoSrc) return
    const rate = Math.max(0.1, Math.min(16, playbackRate))
    video.playbackRate = rate
    video.muted = previewMuted
    video.volume = Math.max(0, Math.min(1, previewVolume))
  }, [playbackRate, videoSrc, previewMuted, previewVolume])

  useEffect(() => {
    if (!videoSrc) syncSourceAspect()
  }, [poster, syncSourceAspect, videoSrc])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoSrc) return

    if (isPlaying) {
      video.muted = previewMuted
      video.volume = Math.max(0, Math.min(1, previewVolume))
      void video.play().catch(() => {
        video.pause()
      })
    } else {
      video.pause()
    }
  }, [isPlaying, videoSrc, previewMuted, previewVolume])

  const visibleTexts = textItems.filter(
    ({ overlay }) =>
      overlay.content.trim() && isActiveAtTime(currentTime, overlay),
  )
  const visibleStickers = stickerItems.filter(({ overlay }) =>
    isActiveAtTime(currentTime, overlay),
  )

  const handleProgressPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const bar = e.currentTarget
    bar.setPointerCapture(e.pointerId)
    setScrubbing(true)
    onSeek(seekRatioFromClientX(e.clientX))

    const onMove = (ev: PointerEvent) => {
      onSeek(seekRatioFromClientX(ev.clientX))
    }
    const onUp = () => {
      setScrubbing(false)
      bar.releasePointerCapture(e.pointerId)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <section className="shrink-0 px-4">
      <div
        ref={previewContainerRef}
        className={
          overlayExpanded
            ? 'fixed inset-0 z-[100] flex flex-col overflow-hidden bg-black'
            : isExpanded
              ? 'relative flex h-full w-full flex-col overflow-hidden bg-black'
              : 'relative overflow-hidden rounded-[var(--radius-xl)] bg-black shadow-[var(--shadow-card)]'
        }
      >
        {isExpanded && (
          <button
            type="button"
            onClick={() => void exitExpanded()}
            className="absolute right-3 top-3 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-black/70"
            aria-label="退出放大预览"
          >
            <X size={18} />
          </button>
        )}

        <div
          {...{ [EDITOR_PREVIEW_ATTR]: '' }}
          className={
            isExpanded
              ? 'relative mx-auto flex min-h-0 w-full max-w-full flex-1 items-center justify-center self-stretch'
              : 'relative aspect-video w-full'
          }
          onClick={() => onPreviewBackgroundClick?.()}
          onContextMenu={onPreviewContextMenu}
          role="presentation"
        >
          <div
            className={
              isExpanded
                ? 'relative aspect-video max-h-full w-full max-w-full'
                : 'relative h-full w-full'
            }
          >
          <ClipTransformLayer transform={clipTransform} sourceAspect={sourceAspect}>
            <FilteredMedia
              key={videoSrc || poster}
              src={poster}
              alt="视频预览"
              videoSrc={videoSrc}
              videoRef={videoRef}
              muted={previewMuted}
              filterCss={filterCss}
              intensity={filterIntensity}
              objectFit="contain"
              className="h-full w-full transition-opacity duration-200"
            />
          </ClipTransformLayer>

          {isCropMode && cropDraft && onCropChange && onCropConfirm && onCropCancel && (
            <VideoCropOverlay
              crop={cropDraft}
              sourceAspect={sourceAspect}
              rotation={clipTransform?.rotation ?? 0}
              onChange={onCropChange}
              onConfirm={onCropConfirm}
              onCancel={onCropCancel}
            />
          )}

          {!isCropMode && <EffectOverlay effectId={effectId} />}

          {visibleTexts.map(({ overlay, editable }) => (
            <VideoTextOverlay
              key={overlay.id}
              overlay={overlay}
              editable={editable}
              selected={editable || selectedTextId === overlay.id}
              onChange={
                editable && onTextChange
                  ? (patch) => onTextChange(overlay.id, patch)
                  : undefined
              }
              onTransformEnd={editable ? onTextTransformEnd : undefined}
              onActivate={
                onTextActivate ? () => onTextActivate(overlay.id) : undefined
              }
              onContextMenu={
                onTextContextMenu
                  ? (e) => onTextContextMenu(e, overlay.id)
                  : undefined
              }
            />
          ))}

          {visibleStickers.map(({ overlay, editable }) => (
            <VideoStickerOverlay
              key={overlay.id}
              overlay={overlay}
              editable={editable}
              selected={editable || selectedStickerId === overlay.id}
              onChange={
                editable && onStickerChange
                  ? (patch) => onStickerChange(overlay.id, patch)
                  : undefined
              }
              onTransformEnd={editable ? onStickerTransformEnd : undefined}
              onActivate={
                onStickerActivate ? () => onStickerActivate(overlay.id) : undefined
              }
              onContextMenu={
                onStickerContextMenu
                  ? (e) => onStickerContextMenu(e, overlay.id)
                  : undefined
              }
            />
          ))}

          </div>

          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" aria-hidden />

          <div
            className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-8"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onTogglePlay}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-transform active:scale-90"
                aria-label={isPlaying ? '暂停' : '播放'}
              >
                {isPlaying ? (
                  <Pause size={16} fill="white" />
                ) : (
                  <Play size={16} fill="white" className="ml-0.5" />
                )}
              </button>

              <div
                ref={progressRef}
                role="slider"
                aria-label="播放进度"
                aria-valuemin={0}
                aria-valuemax={duration}
                aria-valuenow={Math.round(currentTime)}
                aria-valuetext={`${formatTime(currentTime)} / ${formatTime(duration)}`}
                className="group relative flex h-4 flex-1 cursor-pointer touch-none items-center"
                onPointerDown={handleProgressPointerDown}
              >
                <div className="relative h-1 w-full rounded-full bg-white/30">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full bg-white ${
                      scrubbing ? '' : 'transition-[width] duration-75'
                    }`}
                    style={{ width: `${progress * 100}%` }}
                  />
                  <div
                    className={`absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white shadow ${
                      scrubbing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                    style={{ left: `calc(${progress * 100}% - 6px)` }}
                  />
                </div>
              </div>

              <span className="shrink-0 text-xs font-medium tabular-nums text-white/90">
                {formatTime(currentTime)}/{formatTime(duration)}
              </span>

              <button
                type="button"
                onClick={() => void toggleExpanded()}
                className="shrink-0 text-white/80 transition-colors hover:text-white"
                aria-label={isExpanded ? '退出放大预览' : '放大预览'}
                aria-pressed={isExpanded}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
