export interface VlogGenerateManifest {
  type: string
  style: string
  /** 用户填写的 Vlog 主题（用于文案/配乐） */
  theme?: string
  stylePreference?: string
  refinement?: string
  /** 为 true 时才生成 AI 旁白并合成 TTS */
  enableNarration?: boolean
  /** AI 导拍完整分镜（用于剪辑顺序） */
  directorScenes?: Array<{
    id: string
    title: string
    subtitle?: string
    aiPrompt?: string
  }>
  projectTitle?: string
  scenes: Array<{
    clipId: string
    sceneId: string
    sceneTitle: string
    subtitle?: string
    duration: number
  }>
}

export interface VlogClipAnalysis {
  sceneId: string
  sceneTitle: string
  durationSec: number
  qualityScore: number
  shotType: string
  highlights: string[]
  selected: boolean
}

export interface VlogBgmInfo {
  id: string
  title: string
  artist: string
  bpm: number
  mood: string
}

export interface VlogSubtitleCue {
  startSec: number
  endSec: number
  text: string
  sceneId?: string
}

export interface VlogGenerateResult {
  id: string
  title: string
  narration: string
  videoUrl?: string
  aiVideoUrl?: string
  coverUrl?: string
  userClips?: Array<{ name: string; uri: string; sceneId?: string }>
  timeline: Array<{
    order: number
    shotTitle: string
    materialName: string
    duration: number
    caption?: string
    transition: string
  }>
  analysis?: {
    summary: string
    clipCount: number
    selectedCount: number
    clips: VlogClipAnalysis[]
  }
  bgm?: VlogBgmInfo
  subtitles?: VlogSubtitleCue[]
  /** 实际送入 TTS 的旁白（与 narration 一致） */
  ttsNarration?: string
  effects?: {
    colorGrade: string
    transition: string
    hasBurnedSubtitles: boolean
    hasBurnedTitle?: boolean
    hasBgm: boolean
    hasTts?: boolean
    bgmSegmented?: boolean
  }
  director?: {
    provider: string
    videoTitle?: string
    storyArc?: Record<string, string>
    chapters?: Array<{ name: string; mood: string; sceneIds: string[] }>
    editOrder?: Array<{
      sceneId: string
      act: string
      mood: string
      caption: string
    }>
    styleHint?: string
  }
  ai?: {
    provider: string
    stitchNote?: string
    styleHint?: string
    transition?: string
    fallbackReason?: string
    message?: string
    videoGenError?: string
    videoRateLimit?: {
      daily_remaining?: number
      total_remaining?: number
    } | null
  }
}

export const VLOG_GENERATE_RESULT_KEY = 'memento-vlog-generate-result'
export const VLOG_GENERATE_MANIFEST_KEY = 'memento-vlog-generate-manifest'
