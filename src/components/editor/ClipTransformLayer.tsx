import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { DEFAULT_CROP } from '@/types/clipTransform'
import type { ClipTransform } from '@/types/clipTransform'
import { computeRotatedFitBox, type RotatedFitBox } from '@/utils/videoFit'

interface ClipTransformLayerProps {
  transform?: ClipTransform
  /** 源视频宽高比 width/height，默认 16:9 */
  sourceAspect?: number
  children: ReactNode
}

/** 预览区：按真实比例旋转，完整画面 + 黑边 */
export function ClipTransformLayer({
  transform,
  sourceAspect = 16 / 9,
  children,
}: ClipTransformLayerProps) {
  const crop = transform?.crop ?? DEFAULT_CROP
  const rotation = transform?.rotation ?? 0
  const flipH = transform?.flipH ?? false
  const containerRef = useRef<HTMLDivElement>(null)
  const [fitBox, setFitBox] = useState<RotatedFitBox | null>(null)

  const measure = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    setFitBox(
      computeRotatedFitBox(width, height, sourceAspect, rotation, flipH, crop),
    )
  }, [crop, flipH, rotation, sourceAspect])

  useLayoutEffect(() => {
    measure()
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => measure())
    ro.observe(el)
    return () => ro.disconnect()
  }, [measure])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden bg-black">
      {fitBox && (
        <div
          className="absolute left-1/2 top-1/2 overflow-hidden"
          style={{
            width: fitBox.width,
            height: fitBox.height,
            transform: fitBox.transform,
          }}
        >
          <div
            className="h-full w-full"
            style={{
              width: `${100 / crop.w}%`,
              height: `${100 / crop.h}%`,
              marginLeft: `${(-crop.x / crop.w) * 100}%`,
              marginTop: `${(-crop.y / crop.h) * 100}%`,
            }}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

