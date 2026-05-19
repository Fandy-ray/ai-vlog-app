/** 归一化裁剪区域（0–1，相对源画面） */
export interface NormalizedCrop {
  x: number
  y: number
  w: number
  h: number
}

export interface ClipTransform {
  flipH?: boolean
  /** 顺时针旋转角度 */
  rotation?: 0 | 90 | 180 | 270
  crop?: NormalizedCrop
}

export const DEFAULT_CROP: NormalizedCrop = { x: 0, y: 0, w: 1, h: 1 }
