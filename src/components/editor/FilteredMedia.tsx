import type { RefObject } from 'react'

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

/** 单层滤镜：直接作用在媒体本体上，避免双层叠加不同步。 */
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
  const showFilter = filterCss !== 'none' && intensity > 0
  const mediaClass = `h-full w-full object-${objectFit}`
  const mediaStyle = showFilter ? { filter: filterCss } : undefined

  return (
    <span className={`relative block overflow-hidden ${className}`}>
      {videoSrc ? (
        <video
          ref={videoRef}
          src={videoSrc}
          className={mediaClass}
          style={mediaStyle}
          muted={muted}
          playsInline
          preload="auto"
        />
      ) : (
        <img
          src={src}
          alt={alt}
          className={mediaClass}
          style={mediaStyle}
          draggable={false}
        />
      )}
    </span>
  )
}
