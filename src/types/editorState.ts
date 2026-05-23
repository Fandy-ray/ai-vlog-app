import type { VideoClip } from '@/data/mockProject'
import type { TimeRange } from '@/utils/timeRange'
import { createDefaultTimeRange } from '@/utils/timeRange'
import { PROJECT_DURATION } from '@/data/mockProject'

export type { TimeRange }

export interface TextOverlay {
  id: string
  content: string
  color: string
  fontId: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  backgroundColor?: string
  backgroundOpacity?: number
  scale?: number
  startTime: number
  endTime: number
}

export interface StickerOverlay {
  id: string
  stickerId: string
  imageUrl?: string
  imageFit?: 'contain' | 'cover'
  name?: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  startTime: number
  endTime: number
}

export interface EditorSnapshot {
  title: string
  filterId: string
  filterIntensity: number
  effectId: string
  textOverlays: TextOverlay[]
  stickerOverlays: StickerOverlay[]
  /** 叠加轨显示顺序（clip id，不含原声轨；按添加先后） */
  overlayTrackOrder?: string[]
  keepOriginalAudio: boolean
  originalAudioRange: TimeRange
  bgmId: string | null
  bgmRange: TimeRange
  /** AI 旁白文稿 */
  narrationText: string | null
  /** vivo TTS 发音人 vcn */
  narrationVoice: string
  /** vivo TTS engineid */
  narrationEngineId: string
  /** 是否将旁白混入导出 */
  narrationEnabled: boolean
  /** 视频轨片段（与时间轴剪辑工具栏撤销联动） */
  videoClips?: VideoClip[]
  videoDuration?: number
}

const defaultRange = createDefaultTimeRange(PROJECT_DURATION)

export const INITIAL_EDITOR_SNAPSHOT: EditorSnapshot = {
  title: '旅行的意义',
  filterId: 'none',
  filterIntensity: 100,
  effectId: 'none',
  textOverlays: [],
  stickerOverlays: [],
  overlayTrackOrder: [],
  keepOriginalAudio: true,
  originalAudioRange: { ...defaultRange },
  bgmId: null,
  bgmRange: { ...defaultRange },
  narrationText: null,
  narrationVoice: 'yige',
  narrationEngineId: 'short_audio_synthesis_jovi',
  narrationEnabled: false,
}
