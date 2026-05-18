import { Maximize2, Pause, Play } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { EffectOverlay } from '@/components/editor/EffectOverlay'
import { FilteredMedia } from '@/components/editor/FilteredMedia'
import { VideoStickerOverlay } from '@/components/editor/VideoStickerOverlay'
import { VideoTextOverlay } from '@/components/editor/VideoTextOverlay'
import type { StickerOverlay, TextOverlay } from '@/types/editorState'
import { formatTime } from '@/utils/formatTime'

export interface StickerPreviewItem {
  overlay: StickerOverlay
  editable: boolean
}

interface VideoPreviewProps {
  poster: string
  videoSrc?: string
  /** 当前片段内的播放时间 */
  clipTime?: number
  currentTime: number
  duration: number
  isPlaying: boolean
  filterCss?: string
  filterIntensity?: number
  effectId?: string
  textOverlay?: TextOverlay | null
  textEditable?: boolean
  onTextChange?: (patch: Partial<TextOverlay>) => void
  /** 非编辑态下点击已有文字，重新进入文字编辑 */
  onTextActivate?: () => void
  stickerItems?: StickerPreviewItem[]
  onStickerChange?: (id: string, patch: Partial<StickerOverlay>) => void
  onStickerTransformEnd?: () => void
  onStickerActivate?: (id: string) => void
  onPreviewBackgroundClick?: () => void
  onTogglePlay: () => void
  onSeek: (ratio: number) => void
}

export function VideoPreview({
  poster,
  videoSrc,
  clipTime = 0,
  currentTime,
  duration,
  isPlaying,
  filterCss = 'none',
  filterIntensity = 100,
  effectId = 'none',
  textOverlay,
  textEditable,
  onTextChange,
  onTextActivate,
  stickerItems = [],
  onStickerChange,
  onStickerTransformEnd,
  onStickerActivate,
  onPreviewBackgroundClick,
  onTogglePlay,
  onSeek,
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const progress = duration > 0 ? currentTime / duration : 0

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoSrc) return

    if (Math.abs(video.currentTime - clipTime) > 0.25) {
      video.currentTime = clipTime
    }
  }, [clipTime, videoSrc])

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

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    onSeek(ratio)
  }

  return (
    <section className="shrink-0 px-4">
      <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-black shadow-[var(--shadow-card)]">
        <div
          className="relative aspect-video w-full"
          onClick={() => onPreviewBackgroundClick?.()}
          role="presentation"
        >
          <FilteredMedia
            key={videoSrc || poster}
            src={poster}
            alt="视频预览"
            videoSrc={videoSrc}
            videoRef={videoRef}
            filterCss={filterCss}
            intensity={filterIntensity}
            className="h-full w-full transition-opacity duration-200"
          />
          <EffectOverlay effectId={effectId} />

          {textOverlay && (
            <VideoTextOverlay
              overlay={textOverlay}
              editable={textEditable}
              onChange={onTextChange}
              onActivate={onTextActivate}
            />
          )}

          {stickerItems.map(({ overlay, editable }) => (
            <VideoStickerOverlay
              key={overlay.id}
              overlay={overlay}
              editable={editable}
              onChange={
                editable && onStickerChange
                  ? (patch) => onStickerChange(overlay.id, patch)
                  : undefined
              }
              onTransformEnd={editable ? onStickerTransformEnd : undefined}
              onActivate={
                onStickerActivate ? () => onStickerActivate(overlay.id) : undefined
              }
            />
          ))}

          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" aria-hidden />

          <div
            className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-8"
            onClick={(e) => e.stopPropagation()}
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
