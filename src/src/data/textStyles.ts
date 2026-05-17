export interface TextFontOption {
  id: string
  name: string
  family: string
}

export const TEXT_FONTS: TextFontOption[] = [
  { id: 'noto', name: '默认', family: "'Noto Sans SC', sans-serif" },
  { id: 'serif', name: '宋体', family: "'Noto Serif SC', serif" },
  { id: 'rounded', name: '圆润', family: "'M PLUS Rounded 1c', 'Noto Sans SC', sans-serif" },
  { id: 'hand', name: '手写', family: "'ZCOOL KuaiLe', cursive" },
  { id: 'bold', name: '粗体', family: "'Noto Sans SC', sans-serif" },
]

export const TEXT_COLORS = [
  { id: 'white', value: '#FFFFFF', label: '白' },
  { id: 'black', value: '#1A1A1A', label: '黑' },
  { id: 'gold', value: '#FFD700', label: '金' },
  { id: 'coral', value: '#FF6B6B', label: '红' },
  { id: 'blue', value: '#5E7CE0', label: '蓝' },
  { id: 'orange', value: '#FFB357', label: '橙' },
  { id: 'green', value: '#2ECC71', label: '绿' },
  { id: 'pink', value: '#FF8FAB', label: '粉' },
] as const

export const TEXT_BG_COLORS = [
  { id: 'black', value: '#000000', label: '黑' },
  { id: 'white', value: '#FFFFFF', label: '白' },
  { id: 'gold', value: '#FFD700', label: '金' },
  { id: 'coral', value: '#FF6B6B', label: '红' },
  { id: 'blue', value: '#5E7CE0', label: '蓝' },
  { id: 'orange', value: '#FFB357', label: '橙' },
] as const

function parseHexColor(hex: string): [number, number, number] | null {
  const raw = hex.replace('#', '').trim()
  if (raw.length === 3) {
    const r = parseInt(raw[0] + raw[0], 16)
    const g = parseInt(raw[1] + raw[1], 16)
    const b = parseInt(raw[2] + raw[2], 16)
    return [r, g, b]
  }
  if (raw.length === 6) {
    const r = parseInt(raw.slice(0, 2), 16)
    const g = parseInt(raw.slice(2, 4), 16)
    const b = parseInt(raw.slice(4, 6), 16)
    return [r, g, b]
  }
  return null
}

/** 将背景色与不透明度合成为 CSS 颜色，opacity 为 0 时返回 undefined（透明） */
export function resolveTextBackground(overlay: {
  backgroundColor?: string
  backgroundOpacity?: number
}): string | undefined {
  const opacity = Math.max(0, Math.min(100, overlay.backgroundOpacity ?? 0))
  if (opacity <= 0) return undefined
  const rgb = parseHexColor(overlay.backgroundColor ?? '#000000')
  if (!rgb) return undefined
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity / 100})`
}

export function getFontFamily(fontId: string): string {
  return TEXT_FONTS.find((f) => f.id === fontId)?.family ?? TEXT_FONTS[0].family
}

export function createDefaultTextOverlay() {
  return {
    content: '输入文字',
    color: '#FFFFFF',
    fontId: 'noto',
    x: 50,
    y: 38,
    width: 42,
    height: 14,
    rotation: 0,
    backgroundColor: '#000000',
    backgroundOpacity: 0,
  }
}

/** 兼容旧版仅含 scale 的数据 */
export function resolveTextDimensions(overlay: {
  width?: number
  height?: number
  scale?: number
}) {
  if (overlay.width != null && overlay.height != null) {
    return { width: overlay.width, height: overlay.height }
  }
  const s = overlay.scale ?? 1
  return { width: 42 * s, height: 14 * s }
}
