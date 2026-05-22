import { Check, X } from 'lucide-react'
import { useCallback, useId, useLayoutEffect, useRef, useState } from 'react'
import type { NormalizedCrop } from '@/types/clipTransform'
import {
  computeContainRect,
  cropToPixelRect,
  getContentAspect,
  normalizeCrop,
  pixelRectToCrop,
  type PixelRect,
} from '@/utils/videoFit'

interface VideoCropOverlayProps {
  crop: NormalizedCrop
  sourceAspect?: number
  rotation?: number
  onChange: (crop: NormalizedCrop) => void
  onConfirm: () => void
  onCancel: () => void
}

type DragMode =
  | 'move'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'

const MIN_FRAC = 0.12

function clampRect(rect: PixelRect, fit: PixelRect): PixelRect {
  const minW = fit.width * MIN_FRAC
  const minH = fit.height * MIN_FRAC
  let { left, top, width, height } = rect

  width = Math.max(minW, Math.min(fit.width, width))
  height = Math.max(minH, Math.min(fit.height, height))
  left = Math.max(fit.left, Math.min(fit.left + fit.width - width, left))
  top = Math.max(fit.top, Math.min(fit.top + fit.height - height, top))

  return { left, top, width, height }
}

export function VideoCropOverlay({
  crop,
  sourceAspect = 16 / 9,
  rotation = 0,
  onChange,
  onConfirm,
  onCancel,
}: VideoCropOverlayProps) {
  const maskId = useId().replace(/:/g, '')
  const rootRef = useRef<HTMLDivElement>(null)
  const [fitRect, setFitRect] = useState<PixelRect | null>(null)
  const [box, setBox] = useState<PixelRect | null>(null)

  const measure = useCallback(() => {
    const root = rootRef.current
    if (!root) return
    const { width, height } = root.getBoundingClientRect()
    const fit = computeContainRect(
      width,
      height,
      getContentAspect(rotation, sourceAspect),
    )
    const pixelBox = cropToPixelRect(normalizeCrop(crop), fit)
    setFitRect(fit)
    setBox(pixelBox)
  }, [crop, rotation, sourceAspect])

  useLayoutEffect(() => {
    measure()
    const root = rootRef.current
    if (!root) return
    const ro = new ResizeObserver(() => measure())
    ro.observe(root)
    return () => ro.disconnect()
  }, [measure])

  const bindDrag = useCallback(
    (mode: DragMode) => (e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!fitRect || !box) return

      const startX = e.clientX
      const startY = e.clientY
      const startBox = { ...box }
      const el = e.currentTarget as HTMLElement
      el.setPointerCapture(e.pointerId)

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX
        const dy = ev.clientY - startY
        let next = { ...startBox }

        if (mode === 'move') {
          next.left = startBox.left + dx
          next.top = startBox.top + dy
        } else {
          if (mode.includes('left')) {
            next.left = startBox.left + dx
            next.width = startBox.width - dx
          }
          if (mode.includes('right')) {
            next.width = startBox.width + dx
          }
          if (mode.includes('top')) {
            next.top = startBox.top + dy
            next.height = startBox.height - dy
          }
          if (mode.includes('bottom')) {
            next.height = startBox.height + dy
          }
        }

        next = clampRect(next, fitRect)
        setBox(next)
        onChange(normalizeCrop(pixelRectToCrop(next, fitRect)))
      }

      const onUp = () => {
        el.releasePointerCapture(e.pointerId)
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [box, fitRect, onChange],
  )

  if (!box || !fitRect) {
    return <div ref={rootRef} className="absolute inset-0 z-40" />
  }

  const handles: { mode: DragMode; className: string; cursor: string }[] = [
    { mode: 'top-left', className: 'left-0 top-0 -translate-x-1/2 -translate-y-1/2', cursor: 'nwse-resize' },
    { mode: 'top-right', className: 'right-0 top-0 translate-x-1/2 -translate-y-1/2', cursor: 'nesw-resize' },
    { mode: 'bottom-left', className: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2', cursor: 'nesw-resize' },
    { mode: 'bottom-right', className: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2', cursor: 'nwse-resize' },
    { mode: 'top', className: 'left-1/2 top-0 -translate-x-1/2 -translate-y-1/2', cursor: 'ns-resize' },
    { mode: 'bottom', className: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2', cursor: 'ns-resize' },
    { mode: 'left', className: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2', cursor: 'ew-resize' },
    { mode: 'right', className: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2', cursor: 'ew-resize' },
  ]

  return (
    <div ref={rootRef} className="absolute inset-0 z-40 touch-none">
      <svg className="pointer-events-none absolute inset-0 h-full w-full">
        <defs>
          <mask id={`crop-mask-${maskId}`}>
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={box.left}
              y={box.top}
              width={box.width}
              height={box.height}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.55)"
          mask={`url(#crop-mask-${maskId})`}
        />
      </svg>

      <div
        className="absolute border-2 border-white shadow-[0_0_0_1px_rgba(94,124,224,0.8)]"
        style={{
          left: box.left,
          top: box.top,
          width: box.width,
          height: box.height,
        }}
        onPointerDown={bindDrag('move')}
      >
        <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="border border-white/25" />
          ))}
        </div>

        {handles.map(({ mode, className, cursor }) => (
          <span
            key={mode}
            className={`absolute h-3.5 w-3.5 rounded-full border-2 border-white bg-primary shadow ${className}`}
            style={{ cursor }}
            onPointerDown={bindDrag(mode)}
          />
        ))}
      </div>

      <div className="absolute inset-x-0 top-2 z-50 flex items-center justify-center gap-2 px-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onCancel()
          }}
          className="flex items-center gap-1 rounded-full bg-black/50 px-3 py-1 text-xs text-white backdrop-blur-sm"
        >
          <X size={14} />
          取消
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onConfirm()
          }}
          className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-white shadow"
        >
          <Check size={14} />
          完成裁剪
        </button>
      </div>
    </div>
  )
}
