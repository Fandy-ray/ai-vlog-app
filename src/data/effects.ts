export interface EffectPreset {
  id: string
  name: string
  /** 叠加层 CSS 类名，用于预览与成片 */
  overlayClass?: string
}

export const EFFECT_PRESETS: EffectPreset[] = [
  { id: 'none', name: '无' },
  { id: 'vignette', name: '暗角', overlayClass: 'effect-vignette' },
  { id: 'film', name: '胶片', overlayClass: 'effect-film' },
  { id: 'grain', name: '颗粒', overlayClass: 'effect-grain' },
  { id: 'light', name: '光晕', overlayClass: 'effect-light' },
  { id: 'dream', name: '梦幻', overlayClass: 'effect-dream' },
  { id: 'sparkle', name: '闪粉', overlayClass: 'effect-sparkle' },
  { id: 'snow', name: '飘雪', overlayClass: 'effect-snow' },
]

export function getEffectPreset(id: string): EffectPreset | undefined {
  return EFFECT_PRESETS.find((e) => e.id === id)
}
