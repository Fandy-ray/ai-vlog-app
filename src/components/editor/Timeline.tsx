import { Plus, Star } from 'lucide-react'
import { useMemo, useRef } from 'react'
import {
  HIGHLIGHT_AT,
  PREVIEW_POSTER,
  VIDEO_CLIPS,
  type VideoClip,
} from '@/data/mockProject'
import type { TimelineDisplayClip } from '@/types/timelineDisplay'
import type { PlayheadSnapEdge } from '@/utils/playheadSnap'
import type { TimelineClipDragMode } from '@/utils/timelineDisplay'
import { EDITOR_TIMELINE_ATTR } from '@/utils/editorSelectionHitTest'
import { TIMELINE_INSET_PCT, timeToTimelinePercent } from '@/utils/timelineRuler'
import { TimelineObjectTracks } from './TimelineObjectTracks'
import { TimelinePlayhead } from './TimelinePlayhead'
import { TimelineRuler } from './TimelineRuler'

interface TimelineProps {
  clips?: VideoClip[]
  highlightAt?: number
  currentTime: number
  duration: number
  overlayClips?: TimelineDisplayClip[]
  draggingClipId?: string | null
  playheadSnapActive?: boolean
  playheadSnapEdge?: PlayheadSnapEdge | null
  onSeek: (time: number) => void
  onPlayheadSeekEnd?: () => void
  onClipSelect?: (clip: VideoClip) => void
  onImportClick?: () => void
  importLoading?: boolean
  onOverlayClipClick?: (clip: TimelineDisplayClip) => void
  onOverlayClipDoubleClick?: (clip: TimelineDisplayClip) => void
  onOverlayClipOpenMenu?: (clip: TimelineDisplayClip, x: number, y: number) => void
  onOverlayClipDragStart?: (
    clip: TimelineDisplayClip,
    clientX: number,
    mode: TimelineClipDragMode,
  ) => void
  onOverlayClipDragMove?: (
    clip: TimelineDisplayClip,
    clientX: number,
    trackWidthPx: number,
  ) => void
  onOverlayClipDragEnd?: (
    clip: TimelineDisplayClip,
    clientX: number,
    trackWidthPx: number,
  ) => void
}

function isClipActive(clip: VideoClip, time: number) {
  return time >= clip.start && time < clip.start + clip.duration
}

function getHighlightClipCenterRatio(
  duration: number,
  clips: VideoClip[],
  highlightAt: number,
): number {
  const clip =
    clips.find((c) => highlightAt >= c.start && highlightAt < c.start + c.duration) ??
    clips[0]
  if (!clip) return 0
  const centerSec = clip.start + clip.duration / 2
  return duration > 0 ? centerSec / duration : 0
}

export function Timeline({
  clips = VIDEO_CLIPS,
  highlightAt = HIGHLIGHT_AT,
  currentTime,
  duration,
  overlayClips = [],
  draggingClipId = null,
  playheadSnapActive = false,
  playheadSnapEdge = null,
  onSeek,
  onPlayheadSeekEnd,
  onClipSelect,
  onImportClick,
  importLoading = false,
  onOverlayClipClick,
  onOverlayClipDoubleClick,
  onOverlayClipOpenMenu,
  onOverlayClipDragStart,
  onOverlayClipDragMove,
  onOverlayClipDragEnd,
}: TimelineProps) {
  const timelineAreaRef = useRef<HTMLDivElement>(null)
  const highlightCenterRatio = useMemo(
    () => getHighlightClipCenterRatio(duration, clips, highlightAt),
    [duration, clips, highlightAt],
  )
  const playheadLeftPct = timeToTimelinePercent(currentTime, duration)

  return (
    <section
      {...{ [EDITOR_TIMELINE_ATTR]: '' }}
      className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-2"
    >
      <article className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-lg)] bg-surface shadow-[var(--shadow-card)]">
        <div
          ref={timelineAreaRef}
          className="relative flex min-h-0 flex-1 flex-col overflow-visible"
        >
          {playheadSnapActive && (
            <span
              className="pointer-events-none absolute top-7 bottom-0 z-[25] w-px -translate-x-1/2 bg-primary shadow-[0_0_8px_rgba(94,124,224,0.85)]"
              style={{ left: `${playheadLeftPct}%` }}
              aria-hidden
            />
          )}

          <TimelineRuler
            duration={duration}
            onSeek={onSeek}
            onPlayheadSeekEnd={onPlayheadSeekEnd}
          />

          <div
            className="flex min-h-0 flex-1 flex-col"
            style={{
              marginLeft: `${TIMELINE_INSET_PCT}%`,
              marginRight: `${TIMELINE_INSET_PCT}%`,
            }}
          >
            <section className="relative shrink-0 py-1.5">
              <ul className="flex h-14 gap-0.5 overflow-hidden rounded-lg">
                {clips.map((clip) => {
                  const active = isClipActive(clip, currentTime)
                  return (
                    <li
                      key={clip.id}
                      className="h-full flex-1"
                      style={{ flex: clip.duration }}
                    >
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation()
                          onClipSelect?.(clip)
                        }}
                        className={`h-full w-full overflow-hidden rounded-md bg-track-video transition-all active:scale-[0.98] ${
                          active
                            ? 'ring-2 ring-primary ring-offset-1 ring-offset-surface'
                            : 'opacity-90 hover:opacity-100'
                        }`}
                        aria-label={`片段 ${clip.id}`}
                        aria-pressed={active}
                      >
                        <img
                          src={clip.thumb}
                          alt=""
                          className="h-full w-full object-cover"
                          draggable={false}
                          loading="lazy"
                          onError={(e) => {
                            const img = e.currentTarget
                            if (img.dataset.fallbackApplied) return
                            img.dataset.fallbackApplied = '1'
                            img.src = PREVIEW_POSTER
                          }}
                        />
                      </button>
                    </li>
                  )
                })}
                {onImportClick && (
                  <li className="h-full w-14 shrink-0">
                    <button
                      type="button"
                      disabled={importLoading}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation()
                        onImportClick()
                      }}
                      className="flex h-full w-full flex-col items-center justify-center rounded-md border border-dashed border-primary/40 bg-primary/5 text-primary transition-all hover:border-primary/60 hover:bg-primary/10 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
                      aria-label="导入视频"
                    >
                      {importLoading ? (
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      ) : (
                        <Plus size={22} strokeWidth={2} />
                      )}
                    </button>
                  </li>
                )}
              </ul>

              <span
                className="pointer-events-none absolute -top-1 z-10 flex -translate-x-1/2 items-center gap-0.5 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-medium text-white shadow-sm"
                style={{ left: `${highlightCenterRatio * 100}%` }}
              >
                <Star size={8} fill="white" />
                高光时刻
              </span>
            </section>

            <TimelineObjectTracks
              clips={overlayClips}
              duration={duration}
              draggingClipId={draggingClipId}
              playheadSnapEdge={playheadSnapActive ? playheadSnapEdge : null}
              onClipClick={onOverlayClipClick}
              onClipDoubleClick={onOverlayClipDoubleClick}
              onClipOpenMenu={onOverlayClipOpenMenu}
              onClipDragStart={onOverlayClipDragStart}
              onClipDragMove={onOverlayClipDragMove}
              onClipDragEnd={onOverlayClipDragEnd}
            />
          </div>

          <TimelinePlayhead
            currentTime={currentTime}
            duration={duration}
            areaRef={timelineAreaRef}
            snapActive={playheadSnapActive}
            onSeek={onSeek}
            onSeekEnd={onPlayheadSeekEnd}
          />
        </div>
      </article>
    </section>
  )
}
