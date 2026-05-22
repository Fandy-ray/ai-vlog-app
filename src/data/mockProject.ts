import clip5Thumb from '@/assets/images/clip-5.jpg'
import type { ClipTransform } from '@/types/clipTransform'

export const PROJECT_DURATION = 96 // seconds (01:36)

export interface VideoClip {
  id: string
  start: number
  duration: number
  thumb: string
  poster: string
  /** 本地导入视频的 blob URL */
  videoSrc?: string
  /** 源视频内的起始偏移（秒），用于分割后的片段 */
  sourceOffset?: number
  /** 画面变换：镜像 / 旋转 / 裁剪 */
  transform?: ClipTransform
}

export const VIDEO_CLIPS: VideoClip[] = [
  {
    id: '1',
    start: 0,
    duration: 18,
    thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=120&fit=crop',
    poster: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop',
  },
  {
    id: '2',
    start: 18,
    duration: 22,
    thumb: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=200&h=120&fit=crop',
    poster: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=450&fit=crop',
  },
  {
    id: '3',
    start: 40,
    duration: 20,
    thumb: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=200&h=120&fit=crop',
    poster: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&h=450&fit=crop',
  },
  {
    id: '4',
    start: 60,
    duration: 18,
    thumb: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200&h=120&fit=crop',
    poster: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=450&fit=crop',
  },
  {
    id: '5',
    start: 78,
    duration: 18,
    thumb: clip5Thumb,
    poster: clip5Thumb,
  },
]

/** 根据播放时间定位所在片段 */
export function getClipAtTime(
  time: number,
  clips: VideoClip[] = VIDEO_CLIPS,
  totalDuration: number = PROJECT_DURATION,
): VideoClip {
  const t = Math.max(0, Math.min(time, totalDuration - 0.001))
  for (let i = clips.length - 1; i >= 0; i--) {
    if (t >= clips[i].start) return clips[i]
  }
  return clips[0]
}

export const HIGHLIGHT_AT = 52 // seconds — 高光时刻

export const BGM_LABEL = 'Sunny Day - 轻松治愈'

export const PREVIEW_POSTER =
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=450&fit=crop'
