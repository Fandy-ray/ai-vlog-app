interface FilteredMediaProps {
  src: string
  alt?: string
  filterCss?: string
  /** 0–100，仅对非原图滤镜生效 */
  intensity?: number
  className?: string
}

/** 双层叠加：底层原图 + 顶层滤镜，通过透明度控制强度 */
export function FilteredMedia({
  src,
  alt = '',
  filterCss = 'none',
  intensity = 100,
  className = '',
}: FilteredMediaProps) {
  const opacity = Math.max(0, Math.min(100, intensity)) / 100
  const showFilter = filterCss !== 'none' && opacity > 0

  return (
    <span className={`relative block overflow-hidden ${className}`}>
      <img src={src} alt={alt} className="h-full w-full object-cover" draggable={false} />
      {showFilter && (
        <img
          src={src}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-150"
          style={{ filter: filterCss, opacity }}
          draggable={false}
        />
      )}
    </span>
  )
}
