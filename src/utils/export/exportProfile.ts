/** 单块原始帧缓冲区上限（约 64MB） */
export const MAX_CHUNK_BYTES = 64 * 1024 * 1024

export interface ExportProfile {
  width: number
  height: number
  fps: number
  label: string
}

/** 优先高画质；分块导出不再受总时长内存限制 */
const PROFILES: ExportProfile[] = [
  { width: 1280, height: 720, fps: 24, label: '720p · 24fps' },
  { width: 960, height: 540, fps: 24, label: '540p · 24fps' },
  { width: 854, height: 480, fps: 20, label: '480p · 20fps' },
  { width: 640, height: 360, fps: 18, label: '360p · 18fps' },
]

export function chunkFrameCount(profile: ExportProfile) {
  const frameBytes = profile.width * profile.height * 4
  return Math.max(10, Math.floor(MAX_CHUNK_BYTES / frameBytes))
}

export function pickExportProfile(_durationSec: number): ExportProfile {
  for (const profile of PROFILES) {
    if (chunkFrameCount(profile) >= 12) return profile
  }
  return PROFILES[PROFILES.length - 1]
}
