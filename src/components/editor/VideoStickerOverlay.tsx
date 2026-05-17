import { useCallback, useRef } from 'react'
import { RotateCw } from 'lucide-react'
import { getStickerEmoji } from '@/data/stickers'
import type { StickerOverlay } from '@/types/editorState'

interface VideoStickerOverlayProps {
  overlay: StickerOverlay
  editable?: boolean
  onChange?: (patch: Partial<StickerOverlay>) => void
  /** 手势结束（用于提交到历史记录） */
  onTransformEnd?: () => void
  /** 非编辑态点击贴纸时选中，以便缩放旋转 */
  onActivate?: () => void
}

type ResizeEdge = 'top' | 'bottom' | 'left' | 'right'
type ResizeCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

const MIN_W = 8
const MAX_W = 50
const MIN_H = 8
const MAX_H = 50

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function getCenter(el: HTMLElement) {
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

export function VideoStickerOverlay({
  overlay,
  editable,
  onChange,
  onTransformEnd,
  onActivate,
}: VideoStickerOverlayProps) {
  const canEdit = Boolean(editable && onChange)
  const boxRef = useRef<HTMLSpanElement>(null)
  const { width, height } = overlay
  const rotation = overlay.rotation ?? 0
  const emoji = getStickerEmoji(overlay.stickerId)

  const getVideoRect = useCallback(() => {
    const parent = boxRef.current?.offsetParent as HTMLElement | null
    return parent?.getBoundingClientRect() ?? null
  }, [])

  const bindPointerSession = useCallback(
    (
      e: React.PointerEvent,
      onMove: (ev: PointerEvent) => void,
      onEnd?: () => void,
    ) => {
      e.preventDefault()
      e.stopPropagation()
      const el = e.currentTarget as HTMLElement
      el.setPointerCapture(e.pointerId)

      const handleMove = (ev: PointerEvent) => onMove(ev)
      const handleUp = () => {
        el.releasePointerCapture(e.pointerId)
        window.removeEventListener('pointermove', handleMove)
        window.removeEventListener('pointerup', handleUp)
        onEnd?.()
      }

      window.addEventListener('pointermove', handleMove)
      window.addEventListener('pointerup', handleUp)
    },
    [],
  )

  const endTransform = useCallback(() => {
    onTransformEnd?.()
  }, [onTransformEnd])

  const handleMoveStart = useCallback(
    (e: React.PointerEvent) => {
      if (!canEdit || !onChange) return
      const rect = getVideoRect()
      if (!rect) return

      const startX = overlay.x
      const startY = overlay.y
      const startPx = e.clientX
      const startPy = e.clientY

      bindPointerSession(
        e,
        (ev) => {
          const dx = ((ev.clientX - startPx) / rect.width) * 100
          const dy = ((ev.clientY - startPy) / rect.height) * 100
          onChange({
            x: clamp(startX + dx, 5, 95),
            y: clamp(startY + dy, 8, 88),
          })
        },
        endTransform,
      )
    },
    [
      canEdit,
      onChange,
      overlay.x,
      overlay.y,
      getVideoRect,
      bindPointerSession,
      endTransform,
    ],
  )

  const handleEdgeResize = useCallback(
    (edge: ResizeEdge, e: React.PointerEvent) => {
      if (!canEdit || !onChange) return
      const rect = getVideoRect()
      if (!rect) return

      const start = { x: overlay.x, y: overlay.y, w: width, h: height }
      const startPx = e.clientX
      const startPy = e.clientY

      bindPointerSession(
        e,
        (ev) => {
          const dx = ((ev.clientX - startPx) / rect.width) * 100
          const dy = ((ev.clientY - startPy) / rect.height) * 100

          switch (edge) {
            case 'left':
              onChange({
                width: clamp(start.w - 2 * dx, MIN_W, MAX_W),
                x: clamp(start.x + dx, 5, 95),
              })
              break
            case 'right':
              onChange({
                width: clamp(start.w + 2 * dx, MIN_W, MAX_W),
                x: clamp(start.x + dx, 5, 95),
              })
              break
            case 'top':
              onChange({
                height: clamp(start.h - 2 * dy, MIN_H, MAX_H),
                y: clamp(start.y + dy, 8, 88),
              })
              break
            case 'bottom':
              onChange({
                height: clamp(start.h + 2 * dy, MIN_H, MAX_H),
                y: clamp(start.y + dy, 8, 88),
              })
              break
          }
        },
        endTransform,
      )
    },
    [
      canEdit,
      onChange,
      overlay.x,
      overlay.y,
      width,
      height,
      getVideoRect,
      bindPointerSession,
      endTransform,
    ],
  )

  const handleCornerResize = useCallback(
    (corner: ResizeCorner, e: React.PointerEvent) => {
      if (!canEdit || !onChange) return
      const rect = getVideoRect()
      if (!rect) return

      const start = { x: overlay.x, y: overlay.y, w: width, h: height }
      const startPx = e.clientX
      const startPy = e.clientY

      bindPointerSession(
        e,
        (ev) => {
          const dx = ((ev.clientX - startPx) / rect.width) * 100
          const dy = ((ev.clientY - startPy) / rect.height) * 100
          const wSign = corner.includes('right') ? 1 : -1
          const hSign = corner.includes('bottom') ? 1 : -1

          onChange({
            width: clamp(start.w + wSign * 2 * dx, MIN_W, MAX_W),
            height: clamp(start.h + hSign * 2 * dy, MIN_H, MAX_H),
            x: clamp(start.x + dx, 5, 95),
            y: clamp(start.y + dy, 8, 88),
          })
        },
        endTransform,
      )
    },
    [
      canEdit,
      onChange,
      overlay.x,
      overlay.y,
      width,
      height,
      getVideoRect,
      bindPointerSession,
      endTransform,
    ],
  )

  const handleRotateStart = useCallback(
    (e: React.PointerEvent) => {
      if (!canEdit || !onChange || !boxRef.current) return

      const center = getCenter(boxRef.current)
      const startAngle = Math.atan2(e.clientY - center.y, e.clientX - center.x)
      const startRotation = rotation

      bindPointerSession(
        e,
        (ev) => {
          const angle = Math.atan2(ev.clientY - center.y, ev.clientX - center.x)
          const delta = ((angle - startAngle) * 180) / Math.PI
          onChange({ rotation: Math.round(startRotation + delta) })
        },
        endTransform,
      )
    },
    [canEdit, onChange, rotation, bindPointerSession, endTransform],
  )

  const handleActivateClick = useCallback(
    (e: React.MouseEvent) => {
      if (canEdit || !onActivate) return
      e.stopPropagation()
      onActivate()
    },
    [canEdit, onActivate],
  )

  const edgeHandle = (edge: ResizeEdge, cursor: string, className: string) =>
    canEdit ? (
      <button
        key={edge}
        type="button"
        onPointerDown={(e) => handleEdgeResize(edge, e)}
        className={`absolute z-20 bg-accent/30 transition-colors hover:bg-accent/50 active:bg-accent/60 ${cursor} ${className}`}
        aria-label="调节贴纸大小"
      />
    ) : null

  const cornerHandle = (corner: ResizeCorner, cursor: string, className: string) =>
    canEdit ? (
      <button
        key={corner}
        type="button"
        onPointerDown={(e) => handleCornerResize(corner, e)}
        className={`absolute z-30 h-4 w-4 rounded-full border-2 border-accent bg-surface shadow-md transition-transform hover:scale-110 active:scale-95 ${cursor} ${className}`}
        aria-label="调节贴纸大小"
      />
    ) : null

  return (
    <span
      ref={boxRef}
      className={`absolute z-[11] select-none ${
        canEdit ? '' : onActivate ? 'cursor-pointer' : 'pointer-events-none'
      }`}
      style={{
        left: `${overlay.x}%`,
        top: `${overlay.y}%`,
        width: `${width}%`,
        height: `${height}%`,
        containerType: 'size',
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        transformOrigin: 'center center',
      }}
    >
      {canEdit && (
        <button
          type="button"
          onPointerDown={handleRotateStart}
          className="absolute -top-9 left-1/2 z-30 flex h-6 w-6 -translate-x-1/2 cursor-grab items-center justify-center rounded-full border-2 border-accent bg-surface text-accent shadow-md active:cursor-grabbing"
          aria-label="旋转贴纸"
        >
          <RotateCw size={12} />
        </button>
      )}

      {canEdit && (
        <span
          className="absolute -top-5 left-1/2 h-4 w-px -translate-x-1/2 bg-accent/70"
          aria-hidden
        />
      )}

      {edgeHandle('top', 'cursor-ns-resize', '-top-2 inset-x-3 h-3 rounded-sm border-t-2 border-accent')}
      {edgeHandle(
        'bottom',
        'cursor-ns-resize',
        '-bottom-2 inset-x-3 h-3 rounded-sm border-b-2 border-accent',
      )}
      {edgeHandle('left', 'cursor-ew-resize', 'inset-y-3 -left-2 w-3 rounded-sm border-l-2 border-accent')}
      {edgeHandle(
        'right',
        'cursor-ew-resize',
        'inset-y-3 -right-2 w-3 rounded-sm border-r-2 border-accent',
      )}

      {cornerHandle('top-left', 'cursor-nwse-resize', '-left-2.5 -top-2.5')}
      {cornerHandle('top-right', 'cursor-nesw-resize', '-right-2.5 -top-2.5')}
      {cornerHandle('bottom-left', 'cursor-nesw-resize', '-bottom-2.5 -left-2.5')}
      {cornerHandle('bottom-right', 'cursor-nwse-resize', '-bottom-2.5 -right-2.5')}

      <span
        onPointerDown={canEdit ? handleMoveStart : undefined}
        onClick={canEdit ? undefined : handleActivateClick}
        className={`flex h-full w-full items-center justify-center ${
          canEdit ? 'cursor-move border-2 border-dashed border-white/80' : ''
        }`}
      >
        <span
          className="inline-block origin-center leading-none drop-shadow-[0_2px_8px_rgb(0_0_0/35%)]"
          style={{
            fontSize: '88cqmin',
            transform: 'scale(calc(100cqw / 100cqmin), calc(100cqh / 100cqmin))',
          }}
          aria-hidden
        >
          {emoji}
        </span>
      </span>
    </span>
  )
}
