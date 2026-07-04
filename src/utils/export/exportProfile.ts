import type { VideoClip } from '@/data/mockProject'
import type { EditorSnapshot } from '@/types/editorState'
import { clipHasPlayableVideo } from '@/utils/collaborativeSnapshot'

/**
 * 单块原始帧缓冲区上限。
 * FFmpeg WebAssembly 编码时需同时持有 raw 文件与 libx264 工作内存，块过大易在第 1 段失败。
 */
export const MAX_CHUNK_BYTES = 28 * 1024 * 1024

export interface ExportProfile {
  width: number
  height: number
  fps: number
  label: string
}

/** 优先高画质；特效/叠加层较多时自动降级 */
const PROFILES: ExportProfile[] = [
  { width: 1280, height: 720, fps: 24, label: '720p · 24fps' },
  { width: 960, height: 540, fps: 24, label: '540p · 24fps' },
  { width: 854, height: 480, fps: 20, label: '480p · 20fps' },
  { width: 640, height: 360, fps: 18, label: '360p · 18fps' },
]

/** 根据叠加层、特效、转场等估算导出复杂度 */
export function scoreExportComplexity(
  snapshot: EditorSnapshot,
  clips: VideoClip[],
): number {
  let score = 0

  score += snapshot.textOverlays.filter((t) => t.content.trim()).length * 2
  score += snapshot.stickerOverlays.length * 2
  score += snapshot.stickerOverlays.filter((s) => s.animatedDoodle).length * 8

  if (snapshot.effectId && snapshot.effectId !== 'none') {
    score += snapshot.effectId === 'grain' ? 12 : 4
  }
  if (snapshot.filterId && snapshot.filterId !== 'none') score += 2

  score += clips.filter(
    (c) => c.transitionOut && c.transitionOut !== 'none',
  ).length * 3
  score += clips.filter((c) => clipHasPlayableVideo(c)).length

  if (snapshot.narrationEnabled) score += 3
  if (snapshot.bgmId) score += 2
  if (snapshot.keepOriginalAudio) score += 2

  return score
}

function chunkByteBudget(complexity: number) {
  if (complexity > 35) return 14 * 1024 * 1024
  if (complexity > 20) return 20 * 1024 * 1024
  return MAX_CHUNK_BYTES
}

export function chunkFrameCount(profile: ExportProfile, complexity = 0) {
  const frameBytes = profile.width * profile.height * 4
  const budget = chunkByteBudget(complexity)
  // 留 1 帧余量，避免 raw 缓冲 + FFmpeg 工作内存刚好越界
  return Math.max(6, Math.floor(budget / frameBytes) - 1)
}

export function pickExportProfile(
  durationSec: number,
  complexity = 0,
): ExportProfile {
  let startIndex = 0
  if (durationSec > 120) startIndex = 1
  if (durationSec > 240) startIndex = 2
  if (complexity > 15) startIndex = Math.max(startIndex, 1)
  if (complexity > 28) startIndex = Math.max(startIndex, 2)
  if (complexity > 42) startIndex = Math.max(startIndex, 3)

  for (let i = startIndex; i < PROFILES.length; i++) {
    if (chunkFrameCount(PROFILES[i], complexity) >= 10) return PROFILES[i]
  }
  return PROFILES[PROFILES.length - 1]
}

/** 滚动合并时分批拼接的段数，避免 FFmpeg 虚拟文件系统堆积过多片段 */
export function segmentBatchSize(complexity: number) {
  if (complexity > 35) return 4
  if (complexity > 20) return 6
  return 8
}
