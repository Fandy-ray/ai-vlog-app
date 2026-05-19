import { DEFAULT_CROP } from '@/types/clipTransform'
import type { ClipTransform } from '@/types/clipTransform'
import { getCroppedSourceAspect } from '@/utils/videoFit'

function getSourceSize(source: CanvasImageSource): { w: number; h: number } {
  if (source instanceof HTMLVideoElement) {
    return {
      w: source.videoWidth || 1280,
      h: source.videoHeight || 720,
    }
  }
  if (source instanceof HTMLImageElement) {
    return { w: source.naturalWidth || 1280, h: source.naturalHeight || 720 }
  }
  if (source instanceof HTMLCanvasElement) {
    return { w: source.width, h: source.height }
  }
  return { w: 1280, h: 720 }
}

/** 在画布上绘制带变换的片段画面（旋转时完整显示，黑边填充） */
export function drawClipMedia(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  width: number,
  height: number,
  transform?: ClipTransform,
) {
  const crop = transform?.crop ?? DEFAULT_CROP
  const rotation = transform?.rotation ?? 0
  const flipH = transform?.flipH ?? false
  const { w: sw0, h: sh0 } = getSourceSize(source)

  const sx = crop.x * sw0
  const sy = crop.y * sh0
  const sw = crop.w * sw0
  const sh = crop.h * sh0
  const contentAspect = getCroppedSourceAspect(sw / sh, crop)

  ctx.save()
  ctx.translate(width / 2, height / 2)
  if (rotation) ctx.rotate((rotation * Math.PI) / 180)
  if (flipH) ctx.scale(-1, 1)

  const frameW = rotation === 90 || rotation === 270 ? height : width
  const frameH = rotation === 90 || rotation === 270 ? width : height

  let drawW = frameW
  let drawH = drawW / contentAspect
  if (drawH > frameH) {
    drawH = frameH
    drawW = frameH * contentAspect
  }

  ctx.drawImage(source, sx, sy, sw, sh, -drawW / 2, -drawH / 2, drawW, drawH)
  ctx.restore()
}
