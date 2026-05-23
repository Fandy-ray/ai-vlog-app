import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Crop,
  FlipHorizontal2,
  RotateCw,
  Scissors,
  Trash2,
} from 'lucide-react'
import { CLIP_SPEED_OPTIONS } from '@/utils/clipOperations'

export type TimelineToolId =
  | 'split'
  | 'delete'
  | 'mirror'
  | 'rotate'
  | 'speed'
  | 'crop'

const ICON_TOOLS: {
  id: Exclude<TimelineToolId, 'speed'>
  label: string
  icon: typeof Scissors
  needsSplit?: boolean
  needsDelete?: boolean
}[] = [
  { id: 'split', label: '分割', icon: Scissors, needsSplit: true },
  { id: 'delete', label: '删除', icon: Trash2, needsDelete: true },
  { id: 'mirror', label: '镜像', icon: FlipHorizontal2 },
  { id: 'rotate', label: '旋转', icon: RotateCw },
  { id: 'crop', label: '裁剪', icon: Crop },
]

function formatSpeedLabel(rate: number) {
  return Number.isInteger(rate) ? `${rate}x` : `${rate}x`
}

interface TimelineToolbarProps {
  onTool: (id: TimelineToolId) => void
  /** 未选中素材时禁用全部工具（含倍速） */
  disabled?: boolean
  canSplit?: boolean
  canDelete?: boolean
  playbackRate?: number
  onPlaybackRateChange?: (rate: number) => void
  activeTool?: TimelineToolId | null
}

export function TimelineToolbar({
  onTool,
  disabled = false,
  canSplit = true,
  canDelete = true,
  playbackRate = 1,
  onPlaybackRateChange,
  activeTool = null,
}: TimelineToolbarProps) {
  const [speedOpen, setSpeedOpen] = useState(false)
  const speedWrapRef = useRef<HTMLDivElement>(null)
  const speedMenuRef = useRef<HTMLUListElement>(null)
  const speedBtnRef = useRef<HTMLButtonElement>(null)
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
    null,
  )

  useLayoutEffect(() => {
    if (!speedOpen || !speedBtnRef.current) {
      setMenuPos(null)
      return
    }
    const update = () => {
      const r = speedBtnRef.current?.getBoundingClientRect()
      if (!r) return
      setMenuPos({ top: r.bottom + 6, left: r.left + r.width / 2 })
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [speedOpen])

  useEffect(() => {
    if (!speedOpen) return
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (speedWrapRef.current?.contains(target)) return
      if (speedMenuRef.current?.contains(target)) return
      setSpeedOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [speedOpen])

  const speedLabel = formatSpeedLabel(playbackRate)
  const speedDisabled = disabled || !onPlaybackRateChange

  useEffect(() => {
    if (disabled) setSpeedOpen(false)
  }, [disabled])

  const speedMenu =
    speedOpen && !speedDisabled && menuPos
      ? createPortal(
          <ul
            ref={speedMenuRef}
            role="listbox"
            aria-label="选择播放倍速"
            style={{
              position: 'fixed',
              top: menuPos.top,
              left: menuPos.left,
              transform: 'translateX(-50%)',
            }}
            className="z-[9999] min-w-[5.5rem] overflow-hidden rounded-xl border border-black/15 bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
          >
            {CLIP_SPEED_OPTIONS.map((rate) => {
              const selected = Math.abs(playbackRate - rate) < 0.001
              return (
                <li key={rate} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    className={`block w-full px-4 py-2 text-left text-sm tabular-nums text-gray-900 transition-colors hover:bg-primary/10 ${
                      selected
                        ? 'bg-primary/12 font-semibold text-primary'
                        : ''
                    }`}
                    onClick={() => {
                      onPlaybackRateChange?.(rate)
                      setSpeedOpen(false)
                    }}
                  >
                    {formatSpeedLabel(rate)}
                  </button>
                </li>
              )
            })}
          </ul>,
          document.body,
        )
      : null

  const toolButtonClass = (active: boolean) =>
    `flex h-9 w-9 items-center justify-center rounded-full transition-colors active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent ${
      active
        ? 'bg-primary text-white shadow-sm'
        : 'text-primary hover:bg-primary/20'
    }`

  return (
    <nav
      className="relative flex w-full items-center justify-between gap-1 overflow-visible"
      aria-label="剪辑工具"
    >
      {ICON_TOOLS.map(({ id, label, icon: Icon, needsSplit, needsDelete }) => {
        const toolDisabled =
          disabled ||
          (needsSplit && !canSplit) ||
          (needsDelete && !canDelete)
        const active = activeTool === id
        return (
          <div key={id} className="flex min-w-0 flex-1 justify-center">
            <button
              type="button"
              disabled={toolDisabled}
              onClick={() => onTool(id)}
              title={label}
              aria-label={label}
              aria-pressed={active}
              className={toolButtonClass(active)}
            >
              <Icon size={17} strokeWidth={1.85} />
            </button>
          </div>
        )
      })}

      <div ref={speedWrapRef} className="flex min-w-0 flex-1 justify-center">
        <button
          ref={speedBtnRef}
          type="button"
          disabled={speedDisabled}
          onClick={() => {
            if (speedDisabled) return
            setSpeedOpen((o) => !o)
          }}
          title={`倍速 ${speedLabel}`}
          aria-label={`倍速 ${speedLabel}`}
          aria-expanded={speedOpen}
          aria-haspopup="listbox"
          className={`flex h-9 min-w-[2.5rem] items-center justify-center rounded-full px-2 text-[11px] font-semibold tabular-nums transition-colors active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent ${
            speedOpen
              ? 'bg-primary text-white shadow-sm'
              : 'text-primary hover:bg-primary/20'
          }`}
        >
          {speedLabel}
        </button>
      </div>
      {speedMenu}
    </nav>
  )
}
