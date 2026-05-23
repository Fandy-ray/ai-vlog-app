import { getStickerEmoji } from '@/data/stickers'
import type { StickerOverlay } from '@/types/editorState'

const TWEMOJI_BASE =
  'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72'

function emojiToCodePoint(emoji: string) {
  return [...emoji]
    .map((char) => char.codePointAt(0)!)
    .filter((cp) => cp !== 0xfe0f)
    .map((cp) => cp.toString(16))
    .join('-')
}

function loadImageUrl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('load failed'))
    img.src = src
  })
}

export function getStickerImageKey(sticker: Pick<StickerOverlay, 'stickerId' | 'imageUrl'>) {
  return sticker.imageUrl || sticker.stickerId
}

export async function loadStickerImage(
  sticker: string | Pick<StickerOverlay, 'stickerId' | 'imageUrl'>,
): Promise<HTMLImageElement | null> {
  if (typeof sticker !== 'string' && sticker.imageUrl) {
    try {
      return await loadImageUrl(sticker.imageUrl)
    } catch {
      return null
    }
  }

  const stickerId = typeof sticker === 'string' ? sticker : sticker.stickerId
  const emoji = getStickerEmoji(stickerId)
  const code = emojiToCodePoint(emoji)
  const urls = [
    `${TWEMOJI_BASE}/${code}.png`,
    `${TWEMOJI_BASE}/${code.split('-')[0]}.png`,
  ]

  for (const url of urls) {
    try {
      return await loadImageUrl(url)
    } catch {
      // try next url
    }
  }

  return null
}

export function drawStickerFallback(
  ctx: CanvasRenderingContext2D,
  stickerId: string,
  boxW: number,
  boxH: number,
) {
  const emoji = getStickerEmoji(stickerId)
  const fontSize = Math.min(boxW, boxH) * 0.9
  ctx.font = `${fontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emoji, 0, 0)
}
