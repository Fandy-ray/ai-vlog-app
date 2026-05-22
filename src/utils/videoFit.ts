import type { NormalizedCrop } from '@/types/clipTransform'
import { DEFAULT_CROP } from '@/types/clipTransform'

export interface PixelRect {
  left: number
  top: number
  width: number
  height: number
}

/** 计算 object-contain 后画面在容器内的像素区域 */
export function computeContainRect(
  containerW: number,
  containerH: number,
  contentAspect: number,
): PixelRect {
  if (containerW <= 0 || containerH <= 0) {
    return { left: 0, top: 0, width: containerW, height: containerH }
  }

  const containerAspect = containerW / containerH
  if (contentAspect > containerAspect) {
    const width = containerW
    const height = containerW / contentAspect
    return { left: 0, top: (containerH - height) / 2, width, height }
  }

  const height = containerH
  const width = containerH * contentAspect
  return { left: (containerW - width) / 2, top: 0, width, height }
}

export function getCroppedSourceAspect(
  sourceAspect: number,
  crop: NormalizedCrop = DEFAULT_CROP,
): number {
  return (sourceAspect * crop.w) / crop.h
}

/** 旋转后在容器中的可见宽高比 */
export function getContentAspect(
  rotation: number,
  sourceAspect = 16 / 9,
  crop: NormalizedCrop = DEFAULT_CROP,
): number {
  const cropped = getCroppedSourceAspect(sourceAspect, crop)
  return rotation === 90 || rotation === 270 ? 1 / cropped : cropped
}

export interface RotatedFitBox {
  width: number
  height: number
  transform: string
}

/**
 * 计算旋转元素在 16:9 容器内的像素尺寸（旋转前宽高，居中 transform）。
 * 保证旋转后完整显示画面，多余区域由容器黑底露出。
 */
export function computeRotatedFitBox(
  containerW: number,
  containerH: number,
  sourceAspect: number,
  rotation: number,
  flipH: boolean,
  crop: NormalizedCrop = DEFAULT_CROP,
): RotatedFitBox {
  const displayAspect = getContentAspect(rotation, sourceAspect, crop)
  const containerAspect = containerW / containerH

  let visualW: number
  let visualH: number
  if (displayAspect > containerAspect) {
    visualW = containerW
    visualH = containerW / displayAspect
  } else {
    visualH = containerH
    visualW = containerH * displayAspect
  }

  let boxW = visualW
  let boxH = visualH
  if (rotation === 90 || rotation === 270) {
    boxW = visualH
    boxH = visualW
  }

  const transforms = ['translate(-50%, -50%)']
  if (rotation) transforms.push(`rotate(${rotation}deg)`)
  if (flipH) transforms.push('scaleX(-1)')

  return {
    width: boxW,
    height: boxH,
    transform: transforms.join(' '),
  }
}

export function cropToPixelRect(
  crop: NormalizedCrop,
  fit: PixelRect,
): PixelRect {
  return {
    left: fit.left + crop.x * fit.width,
    top: fit.top + crop.y * fit.height,
    width: crop.w * fit.width,
    height: crop.h * fit.height,
  }
}

export function pixelRectToCrop(rect: PixelRect, fit: PixelRect): NormalizedCrop {
  return {
    x: clamp01((rect.left - fit.left) / fit.width),
    y: clamp01((rect.top - fit.top) / fit.height),
    w: clamp01(rect.width / fit.width),
    h: clamp01(rect.height / fit.height),
  }
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}

export function normalizeCrop(crop?: NormalizedCrop): NormalizedCrop {
  if (!crop) return { ...DEFAULT_CROP }
  const w = Math.min(1, Math.max(0.08, crop.w))
  const h = Math.min(1, Math.max(0.08, crop.h))
  const x = Math.min(1 - w, Math.max(0, crop.x))
  const y = Math.min(1 - h, Math.max(0, crop.y))
  return { x, y, w, h }
}

/** 裁剪区域在预览容器中的可见宽高比 */
export function getCropDisplayAspect(
  crop: NormalizedCrop,
  sourceAspect: number,
  rotation = 0,
): number {
  const cropped = getCroppedSourceAspect(sourceAspect, crop)
  return rotation === 90 || rotation === 270 ? 1 / cropped : cropped
}

/**
 * 将裁剪框微调为贴合目标画幅（默认 16:9），减少黑边，尽量居中。
 */
export function refineCropToFillFrame(
  crop: NormalizedCrop,
  sourceAspect: number,
  frameAspect = 16 / 9,
  rotation: 0 | 90 | 180 | 270 = 0,
): NormalizedCrop {
  let { x, y, w, h } = normalizeCrop(crop)
  const targetAspect = frameAspect
  const displayAspect = getCropDisplayAspect({ x, y, w, h }, sourceAspect, rotation)

  if (Math.abs(displayAspect - targetAspect) < 0.015) {
    return { x, y, w, h }
  }

  if (displayAspect > targetAspect) {
    const newH = (sourceAspect * w) / targetAspect
    y += (h - newH) / 2
    h = newH
  } else {
    const newW = (targetAspect * h) / sourceAspect
    x += (w - newW) / 2
    w = newW
  }

  if (x < 0) {
    w += x
    x = 0
  }
  if (y < 0) {
    h += y
    y = 0
  }
  if (x + w > 1) w = 1 - x
  if (y + h > 1) h = 1 - y

  return normalizeCrop({ x, y, w, h })
}

/** 在源画面内生成居中、指定可见比例的裁剪框 */
export function createCenteredCropForAspect(
  targetDisplayAspect: number,
  sourceAspect: number,
  rotation = 0,
): NormalizedCrop {
  const contentAspect = getContentAspect(rotation, sourceAspect, DEFAULT_CROP)
  let w = 1
  let h = 1

  if (contentAspect > targetDisplayAspect) {
    w = targetDisplayAspect / contentAspect
    h = 1
  } else {
    h = contentAspect / targetDisplayAspect
    w = 1
  }

  return normalizeCrop({
    x: (1 - w) / 2,
    y: (1 - h) / 2,
    w,
    h,
  })
}

export function isFullFrameCrop(crop?: NormalizedCrop): boolean {
  const c = normalizeCrop(crop)
  return c.w > 0.99 && c.h > 0.99 && c.x < 0.005 && c.y < 0.005
}

/**
 * 旋转后在容器内铺满（类似 object-cover），用于已裁剪片段的预览。
 */
export function computeRotatedCoverBox(
  containerW: number,
  containerH: number,
  sourceAspect: number,
  rotation: number,
  flipH: boolean,
  crop: NormalizedCrop = DEFAULT_CROP,
): RotatedFitBox {
  const displayAspect = getContentAspect(rotation, sourceAspect, crop)
  const containerAspect = containerW / containerH

  let visualW: number
  let visualH: number
  if (displayAspect > containerAspect) {
    visualH = containerH
    visualW = containerH * displayAspect
  } else {
    visualW = containerW
    visualH = containerW / displayAspect
  }

  let boxW = visualW
  let boxH = visualH
  if (rotation === 90 || rotation === 270) {
    boxW = visualH
    boxH = visualW
  }

  const transforms = ['translate(-50%, -50%)']
  if (rotation) transforms.push(`rotate(${rotation}deg)`)
  if (flipH) transforms.push('scaleX(-1)')

  return {
    width: boxW,
    height: boxH,
    transform: transforms.join(' '),
  }
}
