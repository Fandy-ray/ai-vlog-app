import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { RotateCw } from 'lucide-react'
import type { TextOverlay } from '@/types/editorState'
import { getFontFamily, resolveTextBackground, resolveTextDimensions } from '@/data/textStyles'

interface VideoTextOverlayProps {
  overlay: TextOverlay
  editable?: boolean
  onChange?: (patch: Partial<TextOverlay>) => void
  /** 非编辑态点击文字时回调（用于重新打开文字面板） */
  onActivate?: () => void
}

type ResizeEdge = 'top' | 'bottom' | 'left' | 'right'
type ResizeCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

const MIN_W = 14
const MAX_W = 88
const MIN_H = 6
const MAX_H = 48

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function getCenter(el: HTMLElement) {
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

const MIN_FONT_PX = 8

/** 在容器内缩小字号，必要时再整体缩放，保证文字完整可见 */
function fitTextInBox(container: HTMLElement, textEl: HTMLElement, maxFontPx: number) {
  const minFont = Math.min(MIN_FONT_PX, maxFontPx)
  let fontSize = maxFontPx
  textEl.style.transform = 'none'
  textEl.style.fontSize = `${fontSize}px`

  const overflows = () =>
    textEl.scrollHeight > container.clientHeight + 1 ||
    textEl.scrollWidth > container.clientWidth + 1

  while (fontSize > minFont && overflows()) {
    fontSize -= 0.5
    textEl.style.fontSize = `${fontSize}px`
  }

  let contentScale = 1
  if (overflows()) {
    const sh = textEl.scrollHeight
    const sw = textEl.scrollWidth
    const ch = container.clientHeight
    const cw = container.clientWidth
    if (sh > 0 && sw > 0) {
      contentScale = Math.min(ch / sh, cw / sw, 1)
    }
  }

  return { fontSize, contentScale }
}

export function VideoTextOverlay({
  overlay,
  editable,
  onChange,
  onActivate,
}: VideoTextOverlayProps) {
  const canEdit = Boolean(editable && onChange)
  const boxRef = useRef<HTMLSpanElement>(null)
  const textContainerRef = useRef<HTMLSpanElement>(null)
  const textContentRef = useRef<HTMLSpanElement>(null)
  const [textFit, setTextFit] = useState({ fontSize: 0, contentScale: 1 })

  const { width, height } = resolveTextDimensions(overlay)
  const rotation = overlay.rotation ?? 0
  const displayText = overlay.content.trim() || '输入文字'
  const isPlaceholder = !overlay.content.trim()
  const fontScale = height / 14
  const maxFontPx = 26 * fontScale
  const background = resolveTextBackground(overlay)

  const runTextFit = useCallback(() => {
    const container = textContainerRef.current
    const textEl = textContentRef.current
    if (!container || !textEl) return
    const next = fitTextInBox(container, textEl, maxFontPx)
    setTextFit(next)
  }, [displayText, maxFontPx, overlay.fontId, width, height])

  useLayoutEffect(() => {
    runTextFit()
    const container = textContainerRef.current
    if (!container) return
    const ro = new ResizeObserver(() => runTextFit())
    ro.observe(container)
    return () => ro.disconnect()
  }, [runTextFit])

  const getVideoRect = useCallback(() => {
    const parent = boxRef.current?.offsetParent as HTMLElement | null
    return parent?.getBoundingClientRect() ?? null
  }, [])

  const bindPointerSession = useCallback(
    (e: React.PointerEvent, onMove: (ev: PointerEvent) => void) => {
      e.preventDefault()
      e.stopPropagation()
      const el = e.currentTarget as HTMLElement
      el.setPointerCapture(e.pointerId)

      const handleMove = (ev: PointerEvent) => onMove(ev)
      const handleUp = () => {
        el.releasePointerCapture(e.pointerId)
        window.removeEventListener('pointermove', handleMove)
        window.removeEventListener('pointerup', handleUp)
      }

      window.addEventListener('pointermove', handleMove)
      window.addEventListener('pointerup', handleUp)
    },
    [],
  )

  const handleMoveStart = useCallback(
    (e: React.PointerEvent) => {
      if (!canEdit || !onChange) return
      const rect = getVideoRect()
      if (!rect) return

      const startX = overlay.x
      const startY = overlay.y
      const startPx = e.clientX
      const startPy = e.clientY

      bindPointerSession(e, (ev) => {
        const dx = ((ev.clientX - startPx) / rect.width) * 100
        const dy = ((ev.clientY - startPy) / rect.height) * 100
        onChange({
          x: clamp(startX + dx, 5, 95),
          y: clamp(startY + dy, 8, 88),
        })
      })
    },
    [canEdit, onChange, overlay.x, overlay.y, getVideoRect, bindPointerSession],
  )

  const handleEdgeResize = useCallback(
    (edge: ResizeEdge, e: React.PointerEvent) => {
      if (!canEdit || !onChange) return
      const rect = getVideoRect()
      if (!rect) return

      const start = { x: overlay.x, y: overlay.y, w: width, h: height }
      const startPx = e.clientX
      const startPy = e.clientY

      bindPointerSession(e, (ev) => {
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
      })
    },
    [canEdit, onChange, overlay.x, overlay.y, width, height, getVideoRect, bindPointerSession],
  )

  const handleCornerResize = useCallback(
    (corner: ResizeCorner, e: React.PointerEvent) => {
      if (!canEdit || !onChange) return
      const rect = getVideoRect()
      if (!rect) return

      const start = { x: overlay.x, y: overlay.y, w: width, h: height }
      const startPx = e.clientX
      const startPy = e.clientY

      bindPointerSession(e, (ev) => {
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
      })
    },
    [canEdit, onChange, overlay.x, overlay.y, width, height, getVideoRect, bindPointerSession],
  )

  const handleRotateStart = useCallback(
    (e: React.PointerEvent) => {
      if (!canEdit || !onChange || !boxRef.current) return

      const center = getCenter(boxRef.current)
      const startAngle = Math.atan2(e.clientY - center.y, e.clientX - center.x)
      const startRotation = rotation

      bindPointerSession(e, (ev) => {
        const angle = Math.atan2(ev.clientY - center.y, ev.clientX - center.x)
        const delta = ((angle - startAngle) * 180) / Math.PI
        onChange({ rotation: Math.round(startRotation + delta) })
      })
    },
    [canEdit, onChange, rotation, bindPointerSession],
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
        className={`absolute z-20 bg-primary/25 transition-colors hover:bg-primary/45 active:bg-primary/60 ${cursor} ${className}`}
        aria-label={`${edge === 'top' ? '上' : edge === 'bottom' ? '下' : edge === 'left' ? '左' : '右'}边调节大小`}
      />
    ) : null

  const cornerLabels: Record<ResizeCorner, string> = {
    'top-left': '左上角',
    'top-right': '右上角',
    'bottom-left': '左下角',
    'bottom-right': '右下角',
  }

  const cornerHandle = (corner: ResizeCorner, cursor: string, className: string) =>
    canEdit ? (
      <button
        key={corner}
        type="button"
        onPointerDown={(e) => handleCornerResize(corner, e)}
        className={`absolute z-30 h-4 w-4 rounded-full border-2 border-primary bg-surface shadow-md transition-transform hover:scale-110 active:scale-95 ${cursor} ${className}`}
        aria-label={`${cornerLabels[corner]}调节大小`}
      />
    ) : null

  return (
    <span
      ref={boxRef}
      className={`absolute z-10 select-none ${
        canEdit ? '' : onActivate ? 'cursor-pointer' : 'pointer-events-none'
      }`}
      style={{
        left: `${overlay.x}%`,
        top: `${overlay.y}%`,
        width: `${width}%`,
        height: `${height}%`,
        minWidth: 56,
        minHeight: 32,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        transformOrigin: 'center center',
      }}
    >
      {canEdit && (
        <button
          type="button"
          onPointerDown={handleRotateStart}
          className="absolute -top-9 left-1/2 z-30 flex h-6 w-6 -translate-x-1/2 cursor-grab items-center justify-center rounded-full border-2 border-primary bg-surface text-primary shadow-md active:cursor-grabbing"
          aria-label="旋转文字"
        >
          <RotateCw size={12} />
        </button>
      )}

      {canEdit && (
        <span
          className="absolute -top-5 left-1/2 h-4 w-px -translate-x-1/2 bg-primary/70"
          aria-hidden
        />
      )}

      {edgeHandle('top', 'cursor-ns-resize', '-top-2 inset-x-3 h-3 rounded-sm border-t-2 border-primary')}
      {edgeHandle(
        'bottom',
        'cursor-ns-resize',
        '-bottom-2 inset-x-3 h-3 rounded-sm border-b-2 border-primary',
      )}
      {edgeHandle('left', 'cursor-ew-resize', 'inset-y-3 -left-2 w-3 rounded-sm border-l-2 border-primary')}
      {edgeHandle(
        'right',
        'cursor-ew-resize',
        'inset-y-3 -right-2 w-3 rounded-sm border-r-2 border-primary',
      )}

      {cornerHandle('top-left', 'cursor-nwse-resize', '-left-2.5 -top-2.5')}
      {cornerHandle('top-right', 'cursor-nesw-resize', '-right-2.5 -top-2.5')}
      {cornerHandle('bottom-left', 'cursor-nesw-resize', '-bottom-2.5 -left-2.5')}
      {cornerHandle('bottom-right', 'cursor-nwse-resize', '-bottom-2.5 -right-2.5')}

      <span
        ref={textContainerRef}
        onPointerDown={canEdit ? handleMoveStart : undefined}
        onClick={canEdit ? undefined : handleActivateClick}
        className={`flex h-full w-full items-center justify-center overflow-hidden rounded-md px-2 py-1 ${
          canEdit ? 'cursor-move border-2 border-dashed border-white/80' : ''
        } ${isPlaceholder && canEdit ? 'opacity-70' : ''}`}
        style={{ backgroundColor: background }}
      >
        <span
          ref={textContentRef}
          className="block w-full text-center"
          style={{
            color: overlay.color,
            fontFamily: getFontFamily(overlay.fontId),
            fontWeight: overlay.fontId === 'bold' ? 700 : 500,
            fontSize: `${textFit.fontSize || maxFontPx}px`,
            lineHeight: 1.35,
            wordBreak: 'break-word',
            transform: `scale(${textFit.contentScale})`,
            transformOrigin: 'center center',
            textShadow:
              '0 1px 4px rgba(0,0,0,0.55), 0 0 12px rgba(0,0,0,0.25)',
          }}
        >
          {displayText}
        </span>
      </span>
    </span>
  )
}
