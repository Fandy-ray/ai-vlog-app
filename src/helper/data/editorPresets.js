export const FILTER_PRESETS = [
  { id: 'none', name: '原图', overlay: 'rgba(0,0,0,0)' },
  { id: 'warm', name: '暖阳', overlay: 'rgba(255, 200, 120, 0.18)' },
  { id: 'cool', name: '冷调', overlay: 'rgba(120, 180, 255, 0.16)' },
  { id: 'fresh', name: '清新', overlay: 'rgba(180, 255, 200, 0.12)' },
  { id: 'vintage', name: '复古', overlay: 'rgba(160, 120, 80, 0.22)' },
  { id: 'cinematic', name: '电影', overlay: 'rgba(40, 60, 90, 0.2)' },
  { id: 'vivid', name: '鲜艳', overlay: 'rgba(255, 100, 150, 0.1)' },
  { id: 'soft', name: '柔光', overlay: 'rgba(255, 255, 255, 0.15)' },
  { id: 'bw', name: '黑白', overlay: 'rgba(80, 80, 80, 0.35)' }
]

export const TEXT_PRESETS = [
  { id: 'none', label: '无字幕' },
  { id: 'travel', label: '旅行的意义', content: '旅行的意义' },
  { id: 'daily', label: '今日份快乐', content: '今日份快乐' },
  { id: 'study', label: '专注时刻', content: '专注时刻' }
]

export const EFFECT_PRESETS = [
  { id: 'none', name: '无' },
  { id: 'vignette', name: '暗角', overlay: 'rgba(0,0,0,0.35)' },
  { id: 'film', name: '胶片', overlay: 'rgba(80,60,40,0.2)' },
  { id: 'dream', name: '梦幻', overlay: 'rgba(200,180,255,0.18)' }
]

export const EDITOR_TOOLS = [
  { id: 'cut', label: '剪辑', icon: '✂' },
  { id: 'filter', label: '滤镜', icon: '◐' },
  { id: 'effect', label: '特效', icon: '✦' },
  { id: 'text', label: '文字', icon: 'T' },
  { id: 'sticker', label: '贴纸', icon: '☺' },
  { id: 'audio', label: '音频', icon: '♪' }
]

export const TOOL_ITEMS = [
  { id: 'filter', label: '滤镜' },
  { id: 'text', label: '文字' },
  { id: 'audio', label: '音效' }
]

export function getFilterOverlay(id) {
  const preset = FILTER_PRESETS.find(item => item.id === id)
  return preset ? preset.overlay : 'rgba(0,0,0,0)'
}

export function getEffectOverlay(id) {
  const preset = EFFECT_PRESETS.find(item => item.id === id)
  return preset && preset.overlay ? preset.overlay : 'rgba(0,0,0,0)'
}

export default {
  FILTER_PRESETS,
  TEXT_PRESETS,
  EFFECT_PRESETS,
  EDITOR_TOOLS,
  TOOL_ITEMS,
  getFilterOverlay,
  getEffectOverlay
}
