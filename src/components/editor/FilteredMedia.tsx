import { useEffect, useRef, type RefObject } from 'react'

interface FilteredMediaProps {
  src: string
  alt?: string
  filterCss?: string
  /** 0–100，仅对非原图滤镜生效 */
  intensity?: number
  className?: string
  objectFit?: 'cover' | 'contain'
  videoSrc?: string
  videoRef?: RefObject<HTMLVideoElement | null>
  /** 预览是否静音（滤镜层视频始终静音，避免双轨） */
  muted?: boolean
}

/** 双层叠加：底层原图/视频 + 顶层滤镜，通过透明度控制强度 */
export function FilteredMedia({
  src,
  alt = '',
  filterCss = 'none',
  intensity = 100,
  className = '',
  objectFit = 'cover',
  videoSrc,
  videoRef,
  muted = true,
}: FilteredMediaProps) {
  const opacity = Math.max(0, Math.min(100, intensity)) / 100
  const showFilter = filterCss !== 'none' && opacity > 0
  const mediaClass = `h-full w-full object-${objectFit}`
  const filterVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const main = videoRef?.current
    const overlay = filterVideoRef.current
    if (!main || !overlay || !videoSrc || !showFilter) return

    const attachStream = () => {
      const capture = (
        main as HTMLVideoElement & {
          captureStream?: () => MediaStream
        }
      ).captureStream
      if (typeof capture !== 'function') return false
      try {
        overlay.srcObject = capture.call(main)
        return true
      } catch {
        return false
      }
    }

    if (attachStream()) {
      return () => {
        overlay.srcObject = null
      }
    }

    overlay.src = videoSrc
    return () => {
      overlay.removeAttribute('src')
    }
  }, [videoRef, videoSrc, showFilter])

  return (
    <span className={`relative block overflow-hidden ${className}`}>
      {videoSrc ? (
        <video
          ref={videoRef}
          src={videoSrc}
          className={mediaClass}
          muted={muted}
          playsInline
          preload="auto"
        />
      ) : (
        <img src={src} alt={alt} className={mediaClass} draggable={false} />
      )}
      {showFilter && (
        <span
          className="pointer-events-none absolute inset-0 transition-opacity duration-150"
          style={{ filter: filterCss, opacity }}
          aria-hidden
        >
          {videoSrc ? (
            <video
              ref={filterVideoRef}
              className={mediaClass}
              muted
              playsInline
              preload="none"
            />
          ) : (
            <img src={src} alt="" className={mediaClass} draggable={false} />
          )}
        </span>
      )}
    </span>
  )
}
