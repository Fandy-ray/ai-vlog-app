import { useCallback, useState } from 'react'
import { clamp, formatTime } from '@/utils/formatTime'
import {
  timeFromContentPointer,
  timeFromPointer,
  timeToContentPercent,
  timeToTimelinePercent,
} from '@/utils/timelineRuler'

interface TimelinePlayheadProps {
  currentTime: number
  duration: number
  areaRef: React.RefObject<HTMLElement | null>
  snapActive?: boolean
  onSeek: (time: number) => void
  onSeekEnd?: () => void
  contentArea?: boolean
}

export function TimelinePlayhead({
  currentTime,
  duration,
  areaRef,
  snapActive = false,
  onSeek,
  onSeekEnd,
  contentArea = false,
}: TimelinePlayheadProps) {
  const [dragging, setDragging] = useState(false)
  const timeToPercent = contentArea ? timeToContentPercent : timeToTimelinePercent
  const timeFromClientX = contentArea ? timeFromContentPointer : timeFromPointer
  const leftPct = timeToPercent(currentTime, duration)

  const seekFromClientX = useCallback(
    (clientX: number) => {
      const el = areaRef.current
      if (!el || duration <= 0) return
      const time = Math.round(
        clamp(timeFromClientX(clientX, el, duration), 0, duration),
      )
      onSeek(time)
    },
    [areaRef, duration, onSeek, timeFromClientX],
  )

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    const handle = e.currentTarget as HTMLElement
    handle.setPointerCapture(e.pointerId)
    setDragging(true)
    seekFromClientX(e.clientX)

    const onMove = (ev: PointerEvent) => seekFromClientX(ev.clientX)
    const onUp = () => {
      handle.releasePointerCapture(e.pointerId)
      setDragging(false)
      onSeekEnd?.()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 z-40"
      aria-hidden={!dragging}
    >
      <div
        data-timeline-playhead=""
        className="pointer-events-auto absolute top-0 bottom-0 w-3 -translate-x-1/2 cursor-ew-resize touch-none"
        style={{ left: `${leftPct}%` }}
        onPointerDown={handlePointerDown}
        role="slider"
        aria-label="播放指针"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={Math.round(currentTime)}
        aria-valuetext={formatTime(currentTime)}
      >
        {/* 圆点在指针顶端；竖线从圆点下缘贯穿刻度与轨道 */}
        <span
          className={`pointer-events-none absolute left-1/2 top-0 z-50 block h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white bg-primary transition-transform ${
            snapActive ? 'scale-125 shadow-[0_0_8px_rgba(94,124,224,0.9)]' : 'shadow-sm'
          }`}
          aria-hidden
        />
        <span
          className={`pointer-events-none absolute left-1/2 top-3 bottom-0 block w-0.5 -translate-x-1/2 transition-colors ${
            snapActive
              ? 'w-1 bg-primary shadow-[0_0_10px_rgba(94,124,224,0.95)]'
              : 'bg-primary shadow-[0_0_6px_rgba(94,124,224,0.6)]'
          }`}
          aria-hidden
        />

        {dragging && (
          <span className="absolute left-1/2 top-7 z-50 -translate-x-1/2 whitespace-nowrap rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white shadow-md">
            {formatTime(currentTime)}
          </span>
        )}
      </div>
    </div>
  )
}
