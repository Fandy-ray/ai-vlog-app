/** 预览混音：避免视频原声（100%）盖过配乐（约 48%） */

/** 视频原声音量（0–1） */
export function getPreviewVideoVolume(
  keepOriginalAudio: boolean,
  /** 当前时间轴上存在配乐且指针在配乐范围内 */
  mixWithBgm: boolean,
): number {
  if (!keepOriginalAudio) return 1
  if (mixWithBgm) return 0.42
  return 1
}

/** 配乐预览音量（0–1） */
export function getPreviewBgmVolume(
  hasBgm: boolean,
  keepOriginalAudio: boolean,
): number {
  if (!hasBgm) return 0
  if (!keepOriginalAudio) return 0.92
  return 0.68
}
