import { Maximize2, Pause, Play } from 'lucide-react'
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
import { formatTime } from '@/utils/formatTime'
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
}

export function VideoPreview({
  poster,
  videoSrc,
  clipTransform,
  clipTime = 0,
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
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [sourceAspect, setSourceAspect] = useState(16 / 9)
  const progress = duration > 0 ? currentTime / duration : 0

  const syncSourceAspect = useCallback(() => {
    const video = videoRef.current
    if (video?.videoWidth && video.videoHeight) {
      setSourceAspect(video.videoWidth / video.videoHeight)
      return
    }
    if (!poster) return
    const img = new Image()
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setSourceAspect(img.naturalWidth / img.naturalHeight)
      }
    }
    img.src = poster
  }, [poster])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoSrc) return

    const onMeta = () => syncSourceAspect()
    video.addEventListener('loadedmetadata', onMeta)
    onMeta()

    if (Math.abs(video.currentTime - clipTime) > 0.25) {
      video.currentTime = clipTime
    }

    return () => video.removeEventListener('loadedmetadata', onMeta)
  }, [clipTime, syncSourceAspect, videoSrc])

  useEffect(() => {
    if (!videoSrc) syncSourceAspect()
  }, [poster, syncSourceAspect, videoSrc])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoSrc) return

    if (isPlaying) {
      void video.play().catch(() => {
        video.pause()
      })
    } else {
      video.pause()
    }
  }, [isPlaying, videoSrc])

  const visibleTexts = textItems.filter(
    ({ overlay }) =>
      overlay.content.trim() && isActiveAtTime(currentTime, overlay),
  )
  const visibleStickers = stickerItems.filter(({ overlay }) =>
    isActiveAtTime(currentTime, overlay),
  )

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    onSeek(ratio)
  }

  return (
    <section className="shrink-0 px-4">
      <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-black shadow-[var(--shadow-card)]">
        <div
          {...{ [EDITOR_PREVIEW_ATTR]: '' }}
          className="relative aspect-video w-full"
          onClick={() => onPreviewBackgroundClick?.()}
          onContextMenu={onPreviewContextMenu}
          role="presentation"
        >
          <ClipTransformLayer transform={clipTransform} sourceAspect={sourceAspect}>
            <FilteredMedia
              key={videoSrc || poster}
              src={poster}
              alt="视频预览"
              videoSrc={videoSrc}
              videoRef={videoRef}
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
                role="slider"
                aria-valuenow={Math.round(progress * 100)}
                className="group relative h-1 flex-1 cursor-pointer rounded-full bg-white/30"
                onClick={handleProgressClick}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-white transition-[width] duration-75"
                  style={{ width: `${progress * 100}%` }}
                />
                <div
                  className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white opacity-0 shadow transition-opacity group-hover:opacity-100"
                  style={{ left: `calc(${progress * 100}% - 6px)` }}
                />
              </div>

              <span className="shrink-0 text-xs font-medium tabular-nums text-white/90">
                {formatTime(currentTime)}/{formatTime(duration)}
              </span>

              <button
                type="button"
                className="shrink-0 text-white/80 transition-colors hover:text-white"
                aria-label="全屏"
              >
                <Maximize2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
