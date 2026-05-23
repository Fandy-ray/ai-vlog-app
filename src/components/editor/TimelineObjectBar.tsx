import { MoreVertical } from 'lucide-react'
import { useRef } from 'react'
import type {
  TimelineDisplayClip,
  TimelineOverlayKind,
} from '@/types/timelineDisplay'
import {
  hasTimelineClipMenu,
  isDraggableClipKind,
  type TimelineClipDragMode,
} from '@/utils/timelineDisplay'
import type { PlayheadSnapEdge } from '@/utils/playheadSnap'
import { contentRangeStyle } from '@/utils/timelineRuler'

export const TIMELINE_OVERLAY_CLIP_ATTR = 'data-timeline-overlay-clip'

const CLIP_HEIGHT_CLASS = 'h-7'
const CLIP_RADIUS_CLASS = 'rounded-md'
/** 行高略大于 1，为 y/g/p/q 等下伸笔画留出空间，避免在 h-7 条块内被裁切 */
const CLIP_LABEL_CLASS =
  'pointer-events-none block min-w-0 truncate text-[10px] font-medium leading-[1.35]'
const DRAG_THRESHOLD_PX = 4
const RESIZE_COL_CLASS = 'w-3 shrink-0'
const MENU_COL_CLASS = 'w-5 shrink-0'

const KIND_STYLE: Record<
  TimelineOverlayKind,
  { base: string; selected: string; disabled: string; dragging: string }
> = {
  originalAudio: {
    base: 'bg-track-audio/25 text-primary-dark ring-1 ring-track-audio/40',
    selected: 'ring-2 ring-track-audio ring-offset-1 ring-offset-surface',
    disabled: 'opacity-50',
    dragging: 'z-20 opacity-95 shadow-md ring-2 ring-track-audio',
  },
  text: {
    base: 'bg-[#8B7FD6]/25 text-[#4A3F8C] ring-1 ring-[#8B7FD6]/40',
    selected: 'ring-2 ring-[#8B7FD6] ring-offset-1 ring-offset-surface',
    disabled: '',
    dragging: 'z-20 opacity-95 shadow-md ring-2 ring-[#8B7FD6]',
  },
  sticker: {
    base: 'bg-[#6BC9A8]/25 text-[#2D6B55] ring-1 ring-[#6BC9A8]/40',
    selected: 'ring-2 ring-[#6BC9A8] ring-offset-1 ring-offset-surface',
    disabled: '',
    dragging: 'z-20 opacity-95 shadow-md ring-2 ring-[#6BC9A8]',
  },
  bgm: {
    base: 'bg-accent/25 text-[#B86E1A] ring-1 ring-accent/45',
    selected: 'ring-2 ring-accent ring-offset-1 ring-offset-surface',
    disabled: '',
    dragging: 'z-20 opacity-95 shadow-md ring-2 ring-accent',
  },
}

interface TimelineObjectBarProps {
  clip: TimelineDisplayClip
  duration: number
  trackRef: React.RefObject<HTMLElement | null>
  isDragging?: boolean
  playheadSnapEdge?: PlayheadSnapEdge | null
  onClick?: (clip: TimelineDisplayClip) => void
  onDoubleClick?: (clip: TimelineDisplayClip) => void
  onOpenMenu?: (clip: TimelineDisplayClip, x: number, y: number) => void
  onDragStart?: (
    clip: TimelineDisplayClip,
    clientX: number,
    mode: TimelineClipDragMode,
  ) => void
  onDragMove?: (
    clip: TimelineDisplayClip,
    clientX: number,
    trackWidthPx: number,
  ) => void
  onDragEnd?: (
    clip: TimelineDisplayClip,
    clientX: number,
    trackWidthPx: number,
  ) => void
}

export function TimelineObjectBar({
  clip,
  duration,
  trackRef,
  isDragging = false,
  playheadSnapEdge = null,
  onClick,
  onDoubleClick,
  onOpenMenu,
  onDragStart,
  onDragMove,
  onDragEnd,
}: TimelineObjectBarProps) {
  const didDragRef = useRef(false)
  const suppressClickAfterMenuRef = useRef(false)
  const pointerStartXRef = useRef(0)
  const draggable = isDraggableClipKind(clip.kind)
  const menuEnabled = hasTimelineClipMenu(clip.kind) && Boolean(onOpenMenu)
  const geom = contentRangeStyle(clip.startTime, clip.endTime, duration)
  const style = KIND_STYLE[clip.kind]
  const interactive = Boolean(onClick) || draggable || menuEnabled

  const shellClass = [
    'group absolute top-0 min-w-[28px] max-w-full touch-none select-none overflow-hidden',
    CLIP_HEIGHT_CLASS,
    CLIP_RADIUS_CLASS,
    style.base,
    clip.disabled ? style.disabled : '',
    clip.selected && !isDragging ? style.selected : '',
    isDragging ? style.dragging : '',
    playheadSnapEdge
      ? 'ring-2 ring-primary ring-offset-1 ring-offset-surface shadow-[0_0_10px_rgba(94,124,224,0.45)]'
      : '',
  ]
    .filter(Boolean)
    .join(' ')

  const beginPointerDrag = (
    e: React.PointerEvent,
    mode: TimelineClipDragMode,
  ) => {
    e.stopPropagation()
    e.preventDefault()
    if (!draggable) return

    const target = e.currentTarget as HTMLElement
    const startClientX = e.clientX
    pointerStartXRef.current = startClientX
    didDragRef.current = false
    let dragStarted = false

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - pointerStartXRef.current
      if (!dragStarted) {
        if (Math.abs(dx) < DRAG_THRESHOLD_PX) return
        dragStarted = true
        didDragRef.current = true
        onDragStart?.(clip, startClientX, mode)
      }

      const track = trackRef.current
      if (!track) return
      const width = track.getBoundingClientRect().width
      onDragMove?.(clip, ev.clientX, width)
    }

    const onUp = (ev: PointerEvent) => {
      target.releasePointerCapture(ev.pointerId)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)

      if (dragStarted) {
        const track = trackRef.current
        const width = track?.getBoundingClientRect().width ?? 0
        onDragEnd?.(clip, ev.clientX, width)
      }
    }

    target.setPointerCapture(e.pointerId)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const handleBodyClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (didDragRef.current) {
      didDragRef.current = false
      return
    }
    if (suppressClickAfterMenuRef.current) {
      suppressClickAfterMenuRef.current = false
      return
    }
    onClick?.(clip)
  }

  const handleBodyDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (didDragRef.current) return
    onDoubleClick?.(clip)
  }

  const openClipMenu = (x: number, y: number) => {
    suppressClickAfterMenuRef.current = true
    onOpenMenu?.(clip, x, y)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!menuEnabled) return
    e.preventDefault()
    e.stopPropagation()
    openClipMenu(e.clientX, e.clientY)
  }

  const handleMenuButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    openClipMenu(rect.left, rect.bottom + 2)
  }

  const label = <span className={CLIP_LABEL_CLASS}>{clip.label}</span>

  const menuButton = menuEnabled ? (
    <button
      type="button"
      aria-label="更多操作"
      className={`${MENU_COL_CLASS} z-30 flex shrink-0 cursor-pointer items-center justify-center self-center rounded text-text-muted opacity-0 transition-opacity hover:bg-black/10 hover:text-text group-hover:opacity-100 active:bg-black/15 ${
        clip.selected ? 'opacity-100' : ''
      }`}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={handleMenuButtonClick}
    >
      <MoreVertical size={12} strokeWidth={2.5} />
    </button>
  ) : null

  const shellProps = { [TIMELINE_OVERLAY_CLIP_ATTR]: '' } as const

  if (!interactive) {
    return (
      <div
        {...shellProps}
        className={`${shellClass} flex items-center px-1.5`}
        style={geom}
        title={clip.label}
        onClick={(e) => e.stopPropagation()}
      >
        {label}
      </div>
    )
  }

  if (!draggable) {
    return (
      <div
        {...shellProps}
        className={`${shellClass} flex cursor-pointer items-center px-1.5 active:scale-[0.99]`}
        style={geom}
        title={clip.label}
        onContextMenu={handleContextMenu}
        onClick={(e) => {
          e.stopPropagation()
          handleBodyClick(e)
        }}
        onDoubleClick={onDoubleClick ? handleBodyDoubleClick : undefined}
      >
        {label}
        {menuButton}
      </div>
    )
  }

  const gridCols = menuEnabled
    ? 'grid-cols-[auto_minmax(0,1fr)_auto_auto]'
    : 'grid-cols-[auto_minmax(0,1fr)_auto]'

  return (
    <div
      {...shellProps}
      className={`${shellClass} grid ${gridCols} items-center`}
      style={geom}
      title={clip.label}
      aria-label={clip.label}
      onContextMenu={handleContextMenu}
      onClick={(e) => e.stopPropagation()}
    >
      <span
        role="separator"
        aria-label="调整开始时间"
        className={`${RESIZE_COL_CLASS} z-20 h-7 shrink-0 cursor-ew-resize self-center rounded-l-md hover:bg-black/10 active:bg-black/15`}
        onPointerDown={(e) => beginPointerDrag(e, 'resize-start')}
      />

      <div
        className="flex h-7 min-w-0 cursor-grab items-center overflow-x-clip pl-0.5 pr-0 active:cursor-grabbing"
        onPointerDown={(e) => beginPointerDrag(e, 'move')}
        onClick={handleBodyClick}
        onDoubleClick={onDoubleClick ? handleBodyDoubleClick : undefined}
      >
        {label}
      </div>

      {menuButton}

      <span
        role="separator"
        aria-label="调整结束时间"
        className={`${RESIZE_COL_CLASS} z-20 h-7 shrink-0 cursor-ew-resize self-center rounded-r-md hover:bg-black/10 active:bg-black/15`}
        onPointerDown={(e) => beginPointerDrag(e, 'resize-end')}
      />
    </div>
  )
}
