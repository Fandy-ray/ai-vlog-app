import type { TransitionPresetId } from '@/data/clipTransitions'

interface TransitionPresetPreviewProps {
  kind: TransitionPresetId
  sceneOutSrc: string
  sceneInSrc: string
  className?: string
}

export function TransitionPresetPreview({
  kind,
  sceneOutSrc,
  sceneInSrc,
  className = '',
}: TransitionPresetPreviewProps) {
  if (kind === 'none') {
    return (
      <div className={`relative h-full w-full overflow-hidden bg-track-video ${className}`}>
        <div className="flex h-full w-full">
          <img
            src={sceneOutSrc}
            alt=""
            className="h-full w-1/2 object-cover"
            draggable={false}
          />
          <img
            src={sceneInSrc}
            alt=""
            className="h-full w-1/2 object-cover"
            draggable={false}
          />
        </div>
        <span
          className="pointer-events-none absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-white shadow-[0_0_4px_rgba(0,0,0,0.45)]"
          aria-hidden
        />
      </div>
    )
  }

  if (kind === 'fade') {
    return (
      <div className={`relative h-full w-full overflow-hidden bg-black ${className}`}>
        <img
          src={sceneOutSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        <img
          src={sceneInSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-55"
          draggable={false}
        />
        <span
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/15"
          aria-hidden
        />
      </div>
    )
  }

  if (kind === 'dissolve') {
    return (
      <div className={`relative h-full w-full overflow-hidden bg-black ${className}`}>
        <img
          src={sceneOutSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-50"
          draggable={false}
        />
        <img
          src={sceneInSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-50"
          draggable={false}
        />
      </div>
    )
  }

  return (
    <div className={`relative h-full w-full overflow-hidden bg-black ${className}`}>
      <img
        src={sceneInSrc}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <img
        src={sceneOutSrc}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ clipPath: 'inset(0 38% 0 0)' }}
        draggable={false}
      />
      <span
        className="pointer-events-none absolute inset-y-0 left-[62%] w-[2px] -translate-x-1/2 bg-white shadow-[0_0_6px_rgba(94,124,224,0.85)]"
        aria-hidden
      />
    </div>
  )
}
