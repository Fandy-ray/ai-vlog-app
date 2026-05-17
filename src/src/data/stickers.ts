export interface StickerPreset {
  id: string
  name: string
  emoji: string
}

export const STICKER_PRESETS: StickerPreset[] = [
  { id: 'heart', name: '爱心', emoji: '❤️' },
  { id: 'star', name: '星星', emoji: '⭐' },
  { id: 'sparkle', name: '闪亮', emoji: '✨' },
  { id: 'fire', name: '火焰', emoji: '🔥' },
  { id: 'sun', name: '太阳', emoji: '☀️' },
  { id: 'rainbow', name: '彩虹', emoji: '🌈' },
  { id: 'camera', name: '相机', emoji: '📷' },
  { id: 'plane', name: '飞机', emoji: '✈️' },
  { id: 'palm', name: '棕榈', emoji: '🌴' },
  { id: 'wave', name: '海浪', emoji: '🌊' },
  { id: 'party', name: '庆祝', emoji: '🎉' },
  { id: 'music', name: '音乐', emoji: '🎵' },
]

export function getStickerPreset(id: string): StickerPreset | undefined {
  return STICKER_PRESETS.find((s) => s.id === id)
}

export function getStickerEmoji(id: string): string {
  return getStickerPreset(id)?.emoji ?? '✨'
}

export function createStickerId(): string {
  return `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function createDefaultStickerOverlay(stickerId: string, index = 0) {
  const offset = index % 5
  return {
    id: createStickerId(),
    stickerId,
    x: 50 + (offset % 3) * 10,
    y: 40 + Math.floor(offset / 3) * 12,
    width: 18,
    height: 18,
    rotation: 0,
  }
}
