import { useRef } from 'react'
import type { TimelineDisplayClip } from '@/types/timelineDisplay'
import type { PlayheadSnapEdge } from '@/utils/playheadSnap'
import {
  isDraggableClipKind,
  TIMELINE_CLIP_ROW_KINDS,
  type TimelineClipDragMode,
} from '@/utils/timelineDisplay'
import { TimelineObjectBar } from './TimelineObjectBar'

const ROW_GAP_CLASS = 'mb-1'
const ROW_HEIGHT_CLASS = 'h-7'

interface TimelineObjectTracksProps {
  clips: TimelineDisplayClip[]
  duration: number
  draggingClipId?: string | null
  playheadSnapEdge?: PlayheadSnapEdge | null
  onClipClick?: (clip: TimelineDisplayClip) => void
  onClipDoubleClick?: (clip: TimelineDisplayClip) => void
  onClipOpenMenu?: (clip: TimelineDisplayClip, x: number, y: number) => void
  onClipDragStart?: (
    clip: TimelineDisplayClip,
    clientX: number,
    mode: TimelineClipDragMode,
  ) => void
  onClipDragMove?: (
    clip: TimelineDisplayClip,
    clientX: number,
    trackWidthPx: number,
  ) => void
  onClipDragEnd?: (
    clip: TimelineDisplayClip,
    clientX: number,
    trackWidthPx: number,
  ) => void
}

export function TimelineObjectTracks({
  clips,
  duration,
  draggingClipId = null,
  playheadSnapEdge = null,
  onClipClick,
  onClipDoubleClick,
  onClipOpenMenu,
  onClipDragStart,
  onClipDragMove,
  onClipDragEnd,
}: TimelineObjectTracksProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  const rows = TIMELINE_CLIP_ROW_KINDS.map((kind) => ({
    kind,
    clips: clips.filter((c) => c.kind === kind),
  })).filter((row) => row.clips.length > 0)

  if (rows.length === 0) return null

  return (
    <section
      ref={trackRef}
      className="shrink-0 pb-1"
      aria-label="文字贴纸配乐轨道"
    >
      {rows.map((row) => (
        <div
          key={row.kind}
          data-timeline-overlay-track-row=""
          className={`relative w-full ${ROW_HEIGHT_CLASS} ${ROW_GAP_CLASS}`}
        >
          {row.clips.map((clip) => (
            <TimelineObjectBar
              key={clip.id}
              clip={clip}
              duration={duration}
              trackRef={trackRef}
              isDragging={draggingClipId === clip.id}
              playheadSnapEdge={
                draggingClipId === clip.id ? playheadSnapEdge : null
              }
              onClick={onClipClick}
              onDoubleClick={onClipDoubleClick}
              onOpenMenu={onClipOpenMenu}
              onDragStart={
                isDraggableClipKind(clip.kind) ? onClipDragStart : undefined
              }
              onDragMove={
                isDraggableClipKind(clip.kind) ? onClipDragMove : undefined
              }
              onDragEnd={
                isDraggableClipKind(clip.kind) ? onClipDragEnd : undefined
              }
            />
          ))}
        </div>
      ))}
    </section>
  )
}
