import { getEffectPreset } from '@/data/effects'

interface EffectOverlayProps {
  effectId: string
  className?: string
}

/** 视频画面上的特效叠加层 */
export function EffectOverlay({ effectId, className = '' }: EffectOverlayProps) {
  const preset = getEffectPreset(effectId)
  if (!preset?.overlayClass) return null

  return (
    <span
      className={`pointer-events-none absolute inset-0 z-[1] ${preset.overlayClass} ${className}`}
      aria-hidden
    />
  )
}
