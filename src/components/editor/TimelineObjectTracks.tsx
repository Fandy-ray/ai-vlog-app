import { useEffect, useRef } from 'react'
import type { TimelineDisplayClip } from '@/types/timelineDisplay'
import type { PlayheadSnapEdge } from '@/utils/playheadSnap'
import {
  isDraggableClipKind,
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
  onTracksWidthChange?: (widthPx: number) => void
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
  onTracksWidthChange,
}: TimelineObjectTracksProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = trackRef.current
    if (!el || !onTracksWidthChange) return

    const report = () => {
      const w = el.getBoundingClientRect().width
      if (w > 0) onTracksWidthChange(w)
    }

    report()
    const ro = new ResizeObserver(report)
    ro.observe(el)
    return () => ro.disconnect()
  }, [onTracksWidthChange])

  if (clips.length === 0) return null

  return (
    <section
      ref={trackRef}
      className="mt-1 shrink-0 pb-1 pt-0.5"
      aria-label="叠加轨道"
    >
      {clips.map((clip) => (
        <div
          key={clip.id}
          data-timeline-overlay-track-row=""
          data-timeline-track-kind={clip.kind}
          className={`relative w-full ${ROW_HEIGHT_CLASS} ${ROW_GAP_CLASS}`}
        >
          <TimelineObjectBar
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
        </div>
      ))}
    </section>
  )
}
