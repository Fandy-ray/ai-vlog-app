import { getStickerEmoji } from '@/data/stickers'

const TWEMOJI_BASE =
  'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72'

function emojiToCodePoint(emoji: string) {
  return [...emoji]
    .map((char) => char.codePointAt(0)!)
    .filter((cp) => cp !== 0xfe0f)
    .map((cp) => cp.toString(16))
    .join('-')
}

export async function loadStickerImage(stickerId: string): Promise<HTMLImageElement | null> {
  const emoji = getStickerEmoji(stickerId)
  const code = emojiToCodePoint(emoji)
  const urls = [
    `${TWEMOJI_BASE}/${code}.png`,
    `${TWEMOJI_BASE}/${code.split('-')[0]}.png`,
  ]

  for (const url of urls) {
    try {
      return await new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error('load failed'))
        img.src = url
      })
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
