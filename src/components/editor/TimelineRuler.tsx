import { useMemo } from 'react'
import { formatTime } from '@/utils/formatTime'
import {
  getRulerTicksForDisplay,
  TIMELINE_RULER_ROW_CLASS,
  timeFromContentPointer,
  timeFromPointer,
  timeToContentPercent,
  timeToTimelinePercent,
  type RulerLabelAlign,
} from '@/utils/timelineRuler'

interface TimelineRulerProps {
  duration: number
  onSeek: (time: number) => void
  onPlayheadSeekEnd?: () => void
  onBackgroundPointerDown?: () => void
  /** 仅映射时间内容区（与素材轨同宽，不含右侧添加列） */
  contentArea?: boolean
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
  contentArea = false,
}: TimelineRulerProps) {
  const tickDisplays = useMemo(() => getRulerTicksForDisplay(duration), [duration])
  const endSec = Math.floor(duration)
  const timeToPercent = contentArea ? timeToContentPercent : timeToTimelinePercent
  const timeFromClientX = contentArea ? timeFromContentPointer : timeFromPointer

  const seekFromEvent = (clientX: number, header: HTMLElement) => {
    const time = Math.round(
      Math.max(0, Math.min(duration, timeFromClientX(clientX, header, duration))),
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
      className={`${TIMELINE_RULER_ROW_CLASS} relative z-0 cursor-pointer`}
      onPointerDown={handlePointerDown}
      aria-label="时间刻度"
    >
      {tickDisplays.map(({ sec, align, showLabel }) => (
        <div
          key={sec}
          className={`pointer-events-none absolute bottom-0 top-3 ${ALIGN_CLASS[align]}`}
          style={{ left: `${timeToPercent(sec, duration)}%` }}
        >
          <div className="flex h-full flex-col">
            {showLabel && (
              <span
                className={`shrink-0 whitespace-nowrap text-[10px] tabular-nums leading-none ${
                  sec === endSec ? 'font-medium text-text-secondary' : 'text-text-muted'
                }`}
              >
                {formatTime(sec)}
              </span>
            )}
            <span
              className={`mt-auto w-px shrink-0 bg-border/80 ${
                contentArea ? 'h-2.5' : 'h-2'
              } ${
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
