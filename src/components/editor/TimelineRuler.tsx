import { useMemo } from 'react'
import { formatTime } from '@/utils/formatTime'
import {
  getRulerTicksForDisplay,
  timeFromPointer,
  timeToTimelinePercent,
  type RulerLabelAlign,
} from '@/utils/timelineRuler'

interface TimelineRulerProps {
  duration: number
  onSeek: (time: number) => void
  onPlayheadSeekEnd?: () => void
  onBackgroundPointerDown?: () => void
}

const ALIGN_CLASS: Record<RulerLabelAlign, string> = {
  start: 'items-start',
  center: 'items-center -translate-x-1/2',
  end: 'items-end -translate-x-full',
}

export function TimelineRuler({
  duration,
  onSeek,
  onPlayheadSeekEnd,
  onBackgroundPointerDown,
}: TimelineRulerProps) {
  const tickDisplays = useMemo(() => getRulerTicksForDisplay(duration), [duration])
  const endSec = Math.floor(duration)

  const seekFromEvent = (clientX: number, header: HTMLElement) => {
    const time = Math.round(
      Math.max(0, Math.min(duration, timeFromPointer(clientX, header, duration))),
    )
    onSeek(time)
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    onBackgroundPointerDown?.()
    const header = e.currentTarget
    header.setPointerCapture(e.pointerId)
    seekFromEvent(e.clientX, header)

    const onMove = (ev: PointerEvent) => seekFromEvent(ev.clientX, header)
    const onUp = () => {
      header.releasePointerCapture(e.pointerId)
      onPlayheadSeekEnd?.()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <header
      className="relative flex h-7 shrink-0 cursor-pointer items-end overflow-visible border-b border-border/60 pb-1"
      onPointerDown={handlePointerDown}
      aria-label="时间刻度"
    >
      {tickDisplays.map(({ sec, align, showLabel }) => (
        <div
          key={sec}
          className="pointer-events-none absolute bottom-0"
          style={{ left: `${timeToTimelinePercent(sec, duration)}%` }}
        >
          <div className={`flex flex-col ${ALIGN_CLASS[align]}`}>
            {showLabel && (
              <span
                className={`whitespace-nowrap text-[10px] tabular-nums leading-none ${
                  sec === endSec ? 'font-medium text-text-secondary' : 'text-text-muted'
                }`}
              >
                {formatTime(sec)}
              </span>
            )}
            <span
              className={`mt-0.5 h-2 w-px shrink-0 bg-border/80 ${
                align === 'start'
                  ? 'self-start'
                  : align === 'end'
                    ? 'self-end'
                    : 'self-center'
              }`}
              aria-hidden
            />
          </div>
        </div>
      ))}
    </header>
  )
}
