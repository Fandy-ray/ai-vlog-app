import type { RefObject } from 'react'

interface FilteredMediaProps {
  src: string
  alt?: string
  filterCss?: string
  /** 0–100，仅对非原图滤镜生效 */
  intensity?: number
  className?: string
  videoSrc?: string
  videoRef?: RefObject<HTMLVideoElement | null>
}

/** 双层叠加：底层原图/视频 + 顶层滤镜，通过透明度控制强度 */
export function FilteredMedia({
  src,
  alt = '',
  filterCss = 'none',
  intensity = 100,
  className = '',
  videoSrc,
  videoRef,
}: FilteredMediaProps) {
  const opacity = Math.max(0, Math.min(100, intensity)) / 100
  const showFilter = filterCss !== 'none' && opacity > 0
  const mediaClass = 'h-full w-full object-cover'

  return (
    <span className={`relative block overflow-hidden ${className}`}>
      {videoSrc ? (
        <video
          ref={videoRef}
          src={videoSrc}
          className={mediaClass}
          muted
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
            <video src={videoSrc} className={mediaClass} muted playsInline />
          ) : (
            <img src={src} alt="" className={mediaClass} draggable={false} />
          )}
        </span>
      )}
    </span>
  )
}
