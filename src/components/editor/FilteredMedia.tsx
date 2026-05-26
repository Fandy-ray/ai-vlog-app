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

function scaleFilterCss(filterCss: string, intensity: number): string {
  const ratio = Math.max(0, Math.min(100, intensity)) / 100
  if (filterCss === 'none' || ratio === 0) return 'none'

  return filterCss.replace(
    /([a-z-]+)\(([-\d.]+)(deg)?\)/g,
    (_match, operation: string, rawValue: string, unit?: string) => {
      const value = Number(rawValue)
      const neutral = ['brightness', 'contrast', 'saturate'].includes(operation) ? 1 : 0
      const scaled = neutral + (value - neutral) * ratio
      return `${operation}(${Number(scaled.toFixed(4))}${unit ?? ''})`
    },
  )
}

/** 单层滤镜保持视频同步，同时按强度将滤镜参数向原图状态插值。 */
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
  const mediaClass = `h-full w-full object-${objectFit}`
  const appliedFilter = scaleFilterCss(filterCss, intensity)
  const mediaStyle = appliedFilter === 'none' ? undefined : { filter: appliedFilter }

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
