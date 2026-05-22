import { clamp } from '@/utils/formatTime'

export interface TimeRange {
  startTime: number
  endTime: number
}

export const MIN_RANGE_DURATION_SEC = 1

export function createDefaultTimeRange(videoDuration: number): TimeRange {
  const max = Math.max(0, Math.floor(videoDuration))
  return { startTime: 0, endTime: max }
}

/** 新建对象：开始为当前播放时间（或 0），结束为视频总时长 */
export function createDefaultTimeRangeFromPlayhead(
  videoDuration: number,
  currentTime = 0,
): TimeRange {
  const max = Math.max(0, Math.floor(videoDuration))
  const start = clamp(Math.round(currentTime), 0, Math.max(0, max - MIN_RANGE_DURATION_SEC))
  return { startTime: start, endTime: max }
}

export function normalizeTimeRange(
  range: Partial<TimeRange> | undefined,
  videoDuration: number,
): { range: TimeRange; corrected: boolean } {
  const max = Math.max(0, Math.floor(videoDuration))
  let start = Math.round(Number(range?.startTime ?? 0))
  let end = Math.round(Number(range?.endTime ?? max))
  const before = { startTime: start, endTime: end }

  if (Number.isNaN(start)) start = 0
  if (Number.isNaN(end)) end = max
  start = clamp(start, 0, max)
  end = clamp(end, 0, max)
  if (end < start + MIN_RANGE_DURATION_SEC) {
    end = Math.min(max, start + MIN_RANGE_DURATION_SEC)
  }
  if (end > max) end = max
  if (start > end - MIN_RANGE_DURATION_SEC) {
    start = Math.max(0, end - MIN_RANGE_DURATION_SEC)
  }

  const normalized = { startTime: start, endTime: end }
  const corrected =
    before.startTime !== normalized.startTime || before.endTime !== normalized.endTime
  return { range: normalized, corrected }
}

/** 拖动左/右边缘调整开始或结束时间，并保证最短时长与边界 */
export function resizeTimeRange(
  range: TimeRange,
  edge: 'start' | 'end',
  deltaSec: number,
  videoDuration: number,
): TimeRange {
  const normalized = normalizeTimeRange(range, videoDuration).range
  const delta = Math.round(deltaSec)
  if (edge === 'start') {
    return normalizeTimeRange(
      { startTime: normalized.startTime + delta, endTime: normalized.endTime },
      videoDuration,
    ).range
  }
  return normalizeTimeRange(
    { startTime: normalized.startTime, endTime: normalized.endTime + delta },
    videoDuration,
  ).range
}

/** 整体平移时间范围，保持时长不变，并限制在 [0, 视频总时长] */
export function shiftTimeRange(
  range: TimeRange,
  deltaSec: number,
  videoDuration: number,
): TimeRange {
  const max = Math.max(0, Math.floor(videoDuration))
  const normalized = normalizeTimeRange(range, videoDuration).range
  const span = normalized.endTime - normalized.startTime
  const delta = Math.round(deltaSec)
  let start = normalized.startTime + delta
  start = clamp(start, 0, Math.max(0, max - span))
  const end = start + span
  return normalizeTimeRange({ startTime: start, endTime: end }, videoDuration).range
}

export function isActiveAtTime(time: number, range: TimeRange): boolean {
  const t = Math.round(time)
  return t >= range.startTime && t <= range.endTime
}

export function overlayWithNormalizedRange<T extends TimeRange>(
  overlay: T,
  videoDuration: number,
): T {
  const { range } = normalizeTimeRange(
    { startTime: overlay.startTime, endTime: overlay.endTime },
    videoDuration,
  )
  return { ...overlay, ...range }
}
