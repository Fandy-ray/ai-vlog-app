export interface FilterPreset {
  id: string
  name: string
  /** CSS filter 值，原图为 none */
  css: string
}

export const FILTER_PRESETS: FilterPreset[] = [
  { id: 'none', name: '原图', css: 'none' },
  { id: 'warm', name: '暖阳', css: 'sepia(0.25) saturate(1.2) brightness(1.05)' },
  { id: 'cool', name: '冷调', css: 'saturate(0.9) hue-rotate(15deg) brightness(1.08)' },
  { id: 'fresh', name: '清新', css: 'saturate(1.15) brightness(1.1) contrast(0.95)' },
  { id: 'vintage', name: '复古', css: 'sepia(0.45) contrast(1.1) brightness(0.95)' },
  { id: 'cinematic', name: '电影', css: 'contrast(1.15) saturate(0.85) brightness(0.92)' },
  { id: 'vivid', name: '鲜艳', css: 'saturate(1.45) contrast(1.08)' },
  { id: 'soft', name: '柔光', css: 'brightness(1.12) contrast(0.88) saturate(0.95)' },
  { id: 'bw', name: '黑白', css: 'grayscale(1) contrast(1.1)' },
]

export function getFilterCss(id: string): string {
  return FILTER_PRESETS.find((f) => f.id === id)?.css ?? 'none'
}
