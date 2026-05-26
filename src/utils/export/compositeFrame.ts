import { getFilterCss } from '@/data/filters'
import {
  getFontFamily,
  TEXT_FONTS,
  resolveTextBackground,
  resolveTextDimensions,
} from '@/data/textStyles'
import { drawStickerFallback, getStickerImageKey, loadStickerImage } from './stickerImage'
import type { VideoClip } from '@/data/mockProject'
import { getClipAtTime } from '@/data/mockProject'
import type { EditorSnapshot, TextOverlay } from '@/types/editorState'
import { isActiveAtTime } from '@/utils/timeRange'
import { drawClipMedia } from '@/utils/drawClipMedia'
import { drawAnimatedDoodle } from '@/utils/animatedDoodle'
import { drawEffectOverlay } from './effectsCanvas'

export const EXPORT_WIDTH = 1280
export const EXPORT_HEIGHT = 720

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`image load failed: ${src}`))
    img.src = src
  })
}

/** 等待视频 seek 完成后再绘制，确保滤镜/画面正确 */
async function seekVideoAccurate(video: HTMLVideoElement, time: number) {
  const t = Math.max(0, Math.min(time, Math.max(0, video.duration - 0.001)))
  if (Math.abs(video.currentTime - t) < 0.04 && video.readyState >= 2) return

  await new Promise<void>((resolve) => {
    const timer = window.setTimeout(resolve, 400)
    const onSeeked = () => {
      window.clearTimeout(timer)
      video.removeEventListener('seeked', onSeeked)
      resolve()
    }
    video.addEventListener('seeked', onSeeked, { once: true })
    video.currentTime = t
  })
}

function drawFilteredMedia(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  width: number,
  height: number,
  filterCss: string,
  intensity: number,
) {
  const alpha = Math.max(0, Math.min(100, intensity)) / 100
  const hasFilter = filterCss !== 'none' && alpha > 0

  ctx.save()
  ctx.drawImage(source, 0, 0, width, height)

  if (hasFilter) {
    ctx.globalAlpha = alpha
    ctx.filter = filterCss
    ctx.drawImage(source, 0, 0, width, height)
    ctx.filter = 'none'
    ctx.globalAlpha = 1
  }
  ctx.restore()
}

function drawTextOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  overlay: TextOverlay,
) {
  const { width: boxWPct, height: boxHPct } = resolveTextDimensions(overlay)
  const boxW = (boxWPct / 100) * width
  const boxH = (boxHPct / 100) * height
  const cx = (overlay.x / 100) * width
  const cy = (overlay.y / 100) * height
  const rotation = ((overlay.rotation ?? 0) * Math.PI) / 180
  const text = overlay.content.trim() || '输入文字'
  const fontScale = boxHPct / 14
  const fontSize = Math.max(12, Math.min(52, 26 * fontScale * (width / 430)))

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rotation)

  const bg = resolveTextBackground(overlay)
  if (bg) {
    ctx.fillStyle = bg
    const pad = 6
    ctx.fillRect(-boxW / 2 - pad, -boxH / 2 - pad, boxW + pad * 2, boxH + pad * 2)
  }

  ctx.fillStyle = overlay.color
  ctx.font = `600 ${fontSize}px ${getFontFamily(overlay.fontId)}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = 'rgba(0,0,0,0.35)'
  ctx.shadowBlur = 4
  wrapText(ctx, text, 0, 0, boxW - 8, fontSize * 1.25)
  ctx.restore()
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const chars = text.split('')
  let line = ''
  const lines: string[] = []
  for (const ch of chars) {
    const test = line + ch
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = ch
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  const totalH = lines.length * lineHeight
  let offsetY = y - totalH / 2 + lineHeight / 2
  for (const ln of lines) {
    ctx.fillText(ln, x, offsetY)
    offsetY += lineHeight
  }
}

function drawSticker(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  sticker: EditorSnapshot['stickerOverlays'][number],
  stickerImages: Map<string, HTMLImageElement>,
) {
  const cx = (sticker.x / 100) * width
  const cy = (sticker.y / 100) * height
  const boxW = (sticker.width / 100) * width
  const boxH = (sticker.height / 100) * height
  const rotation = ((sticker.rotation ?? 0) * Math.PI) / 180
  const img = stickerImages.get(getStickerImageKey(sticker))

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rotation)

  if (img) {
    drawFittedStickerImage(ctx, img, boxW, boxH, sticker.imageFit ?? 'contain')
  } else {
    drawStickerFallback(ctx, sticker.stickerId, boxW, boxH)
  }

  ctx.restore()
}

function drawFittedStickerImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  boxW: number,
  boxH: number,
  fit: 'contain' | 'cover',
) {
  const imageAspect = (img.naturalWidth || boxW) / Math.max(1, img.naturalHeight || boxH)
  const boxAspect = boxW / Math.max(1, boxH)
  const useWidth =
    fit === 'cover' ? imageAspect < boxAspect : imageAspect > boxAspect
  const drawW = useWidth ? boxW : boxH * imageAspect
  const drawH = useWidth ? boxW / imageAspect : boxH
  ctx.save()
  ctx.beginPath()
  ctx.rect(-boxW / 2, -boxH / 2, boxW, boxH)
  ctx.clip()
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)
  ctx.restore()
}

export interface CompositeContext {
  clips: VideoClip[]
  totalDuration: number
  snapshot: EditorSnapshot
  videoElements: Map<string, HTMLVideoElement>
  imageCache: Map<string, HTMLImageElement>
  stickerImages: Map<string, HTMLImageElement>
  doodleCanvas: HTMLCanvasElement
}

export async function prepareCompositeContext(
  clips: VideoClip[],
  totalDuration: number,
  snapshot: EditorSnapshot,
): Promise<CompositeContext> {
  const videoElements = new Map<string, HTMLVideoElement>()
  const imageCache = new Map<string, HTMLImageElement>()
  const stickerImages = new Map<string, HTMLImageElement>()
  const doodleCanvas = document.createElement('canvas')

  await document.fonts.ready
  await Promise.all(
    TEXT_FONTS.map((font) =>
      document.fonts.load(`600 32px ${font.family}`).catch(() => undefined),
    ),
  )

  const stickerSources = new Map<string, EditorSnapshot['stickerOverlays'][number]>()
  for (const sticker of snapshot.stickerOverlays) {
    if (sticker.animatedDoodle) continue
    stickerSources.set(getStickerImageKey(sticker), sticker)
  }
  for (const [key, sticker] of stickerSources) {
    const img = await loadStickerImage(sticker)
    if (img) stickerImages.set(key, img)
  }

  await Promise.all(
    clips.map(async (clip) => {
      if (clip.videoSrc) {
        const video = document.createElement('video')
        video.muted = true
        video.playsInline = true
        video.preload = 'auto'
        if (!clip.videoSrc.startsWith('blob:')) {
          video.crossOrigin = 'anonymous'
        }
        video.src = clip.videoSrc
        await new Promise<void>((resolve, reject) => {
          const timer = window.setTimeout(() => reject(new Error('video load timeout')), 20000)
          video.onloadeddata = () => {
            window.clearTimeout(timer)
            resolve()
          }
          video.onerror = () => {
            window.clearTimeout(timer)
            reject(new Error('video load failed'))
          }
        })
        videoElements.set(clip.id, video)
      } else {
        const src = clip.poster || clip.thumb
        if (src && !imageCache.has(src)) {
          imageCache.set(src, await loadImage(src))
        }
      }
    }),
  )

  return {
    clips,
    totalDuration,
    snapshot,
    videoElements,
    imageCache,
    stickerImages,
    doodleCanvas,
  }
}

export interface CompositeFrameOptions {
  width?: number
  height?: number
}

export async function compositeFrameAt(
  ctx: CanvasRenderingContext2D,
  context: CompositeContext,
  globalTime: number,
  options: CompositeFrameOptions = {},
): Promise<void> {
  const {
    clips,
    totalDuration,
    snapshot,
    videoElements,
    imageCache,
    stickerImages,
    doodleCanvas,
  } =
    context
  const width = options.width ?? EXPORT_WIDTH
  const height = options.height ?? EXPORT_HEIGHT
  const t = Math.max(0, Math.min(globalTime, totalDuration - 0.001))
  const clip = getClipAtTime(t, clips, totalDuration)
  const rate = clip.playbackRate ?? 1
  const localTime = Math.max(
    0,
    (clip.sourceOffset ?? 0) + (t - clip.start) * rate,
  )
  const filterCss = getFilterCss(snapshot.filterId)
  const intensity = snapshot.filterIntensity

  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, width, height)

  const video = videoElements.get(clip.id)
  if (video) {
    const target = Math.min(localTime, Math.max(0, video.duration - 0.05))
    await seekVideoAccurate(video, target)
    const mediaCanvas = document.createElement('canvas')
    mediaCanvas.width = width
    mediaCanvas.height = height
    const mediaCtx = mediaCanvas.getContext('2d')
    if (mediaCtx) {
      drawClipMedia(mediaCtx, video, width, height, clip.transform)
      drawFilteredMedia(ctx, mediaCanvas, width, height, filterCss, intensity)
    }
  } else {
    const src = clip.poster || clip.thumb
    const img = src ? imageCache.get(src) : undefined
    if (img) {
      const mediaCanvas = document.createElement('canvas')
      mediaCanvas.width = width
      mediaCanvas.height = height
      const mediaCtx = mediaCanvas.getContext('2d')
      if (mediaCtx) {
        drawClipMedia(mediaCtx, img, width, height, clip.transform)
        drawFilteredMedia(ctx, mediaCanvas, width, height, filterCss, intensity)
      }
    }
  }

  drawEffectOverlay(ctx, width, height, snapshot.effectId ?? 'none', t, false)

  for (const text of snapshot.textOverlays) {
    if (text.content.trim() && isActiveAtTime(t, text)) {
      drawTextOverlay(ctx, width, height, text)
    }
  }

  for (const sticker of snapshot.stickerOverlays) {
    if (!isActiveAtTime(t, sticker)) continue
    if (sticker.animatedDoodle) {
      if (doodleCanvas.width !== width) doodleCanvas.width = width
      if (doodleCanvas.height !== height) doodleCanvas.height = height
      const doodleCtx = doodleCanvas.getContext('2d')
      if (!doodleCtx) continue
      doodleCtx.clearRect(0, 0, width, height)
      drawAnimatedDoodle(
        doodleCtx,
        sticker.animatedDoodle,
        t - sticker.startTime,
        width,
        height,
      )
      ctx.drawImage(doodleCanvas, 0, 0)
      continue
    }
    drawSticker(ctx, width, height, sticker, stickerImages)
  }
}

export function disposeCompositeContext(context: CompositeContext) {
  context.videoElements.forEach((video) => {
    video.pause()
    video.removeAttribute('src')
    video.load()
  })
  context.videoElements.clear()
  context.imageCache.clear()
  context.stickerImages.clear()
  context.doodleCanvas.width = 0
  context.doodleCanvas.height = 0
}
