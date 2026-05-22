import { clamp } from '@/utils/formatTime'
import { getRulerTicks } from '@/utils/timelineRuler'
import {
  MIN_RANGE_DURATION_SEC,
  normalizeTimeRange,
  type TimeRange,
} from '@/utils/timeRange'
import type {
  TimelineDisplayClip,
  TimelineOverlayKind,
} from '@/types/timelineDisplay'

/** 指针拖动吸附默认阈值（秒），无轨道宽度时的回退 */
export const PLAYHEAD_SNAP_THRESHOLD_SEC = 0.4

/** 时间轴内容区上约 6～10px 对应的吸附距离（取 8px） */
export const TIMELINE_SNAP_THRESHOLD_PX = 8

export type PlayheadSnapEdge = 'start' | 'end'

/** 支持边缘吸附的轨道条块类型 */
export const PLAYHEAD_SNAP_CLIP_KINDS: TimelineOverlayKind[] = [
  'originalAudio',
  'text',
  'sticker',
  'bgm',
]

/** 根据轨道内容区像素宽度换算吸附阈值（秒） */
export function snapThresholdSecFromPx(
  thresholdPx: number,
  contentWidthPx: number,
  durationSec: number,
): number {
  if (contentWidthPx <= 0 || durationSec <= 0) return PLAYHEAD_SNAP_THRESHOLD_SEC
  return (thresholdPx / contentWidthPx) * durationSec
}

export function isPlayheadSnapClipKind(kind: TimelineOverlayKind): boolean {
  return (PLAYHEAD_SNAP_CLIP_KINDS as TimelineOverlayKind[]).includes(kind)
}

function snapMoveRangeToTargetTimes(
  range: TimeRange,
  targetTimes: number[],
  videoDuration: number,
  thresholdSec: number,
): { range: TimeRange; snapped: PlayheadSnapEdge | null } {
  const max = Math.max(0, Math.floor(videoDuration))
  const base = normalizeTimeRange(range, videoDuration).range
  const span = base.endTime - base.startTime
  if (span < MIN_RANGE_DURATION_SEC) {
    return { range: base, snapped: null }
  }

  let best: { edge: PlayheadSnapEdge; dist: number; snappedRange: TimeRange } | null =
    null

  for (const raw of targetTimes) {
    const target = clamp(Math.round(raw), 0, max)

    const tryCandidate = (edge: PlayheadSnapEdge, dist: number, start: number, end: number) => {
      if (dist > thresholdSec) return
      if (start < 0 || end > max || end - start < MIN_RANGE_DURATION_SEC) return
      const normalized = normalizeTimeRange(
        { startTime: start, endTime: end },
        videoDuration,
      ).range
      const aligned =
        edge === 'start'
          ? normalized.startTime === target
          : normalized.endTime === target
      if (!aligned) return
      if (!best || dist < best.dist) {
        best = { edge, dist, snappedRange: normalized }
      }
    }

    tryCandidate('start', Math.abs(base.startTime - target), target, target + span)
    tryCandidate('end', Math.abs(base.endTime - target), target - span, target)
  }

  if (best === null) return { range: base, snapped: null }
  const { snappedRange, edge } = best
  return { range: snappedRange, snapped: edge }
}

/**
 * 整体平移后的时间范围吸附到目标时间点（保持时长不变）。
 */
export function snapMoveRangeToPlayhead(
  range: TimeRange,
  playheadSec: number,
  videoDuration: number,
  thresholdSec: number = PLAYHEAD_SNAP_THRESHOLD_SEC,
): { range: TimeRange; snapped: PlayheadSnapEdge | null } {
  return snapMoveRangeToTargetTimes(
    range,
    [playheadSec],
    videoDuration,
    thresholdSec,
  )
}

function snapResizeRangeToTargetTimes(
  range: TimeRange,
  edge: PlayheadSnapEdge,
  targetTimes: number[],
  videoDuration: number,
  thresholdSec: number,
): { range: TimeRange; snapped: PlayheadSnapEdge | null } {
  const max = Math.max(0, Math.floor(videoDuration))
  const base = normalizeTimeRange(range, videoDuration).range

  let best: { dist: number; snappedRange: TimeRange } | null = null

  for (const raw of targetTimes) {
    const target = clamp(Math.round(raw), 0, max)
    const dist =
      edge === 'start'
        ? Math.abs(base.startTime - target)
        : Math.abs(base.endTime - target)
    if (dist > thresholdSec) continue

    const candidate =
      edge === 'start'
        ? normalizeTimeRange(
            { startTime: target, endTime: base.endTime },
            videoDuration,
          ).range
        : normalizeTimeRange(
            { startTime: base.startTime, endTime: target },
            videoDuration,
          ).range

    const aligned =
      edge === 'start'
        ? candidate.startTime === target
        : candidate.endTime === target
    if (!aligned) continue
    if (candidate.endTime - candidate.startTime < MIN_RANGE_DURATION_SEC) continue

    if (!best || dist < best.dist) {
      best = { dist, snappedRange: candidate }
    }
  }

  if (best === null) return { range: base, snapped: null }
  return { range: best.snappedRange, snapped: edge }
}

/** 拖动左/右缘调整时，将被拖动的一侧吸附到播放指针。 */
export function snapResizeRangeToPlayhead(
  range: TimeRange,
  edge: PlayheadSnapEdge,
  playheadSec: number,
  videoDuration: number,
  thresholdSec: number = PLAYHEAD_SNAP_THRESHOLD_SEC,
): { range: TimeRange; snapped: PlayheadSnapEdge | null } {
  return snapResizeRangeToTargetTimes(
    range,
    edge,
    [playheadSec],
    videoDuration,
    thresholdSec,
  )
}

export type PlayheadSnapDragMode = 'move' | 'resize-start' | 'resize-end'

/** 按拖动方式将条块时间范围吸附到播放指针 */
export function snapRangeToPlayhead(
  range: TimeRange,
  playheadSec: number,
  videoDuration: number,
  mode: PlayheadSnapDragMode,
  thresholdSec: number = PLAYHEAD_SNAP_THRESHOLD_SEC,
): { range: TimeRange; snapped: PlayheadSnapEdge | null } {
  return snapRangeToTargetTimes(
    range,
    [playheadSec],
    videoDuration,
    mode,
    thresholdSec,
  )
}

/** 按拖动方式将条块吸附到多个目标时间点（其他条块边缘、刻度、播放指针等） */
export function snapRangeToTargetTimes(
  range: TimeRange,
  targetTimes: number[],
  videoDuration: number,
  mode: PlayheadSnapDragMode,
  thresholdSec: number = PLAYHEAD_SNAP_THRESHOLD_SEC,
): { range: TimeRange; snapped: PlayheadSnapEdge | null } {
  if (mode === 'move') {
    return snapMoveRangeToTargetTimes(range, targetTimes, videoDuration, thresholdSec)
  }
  if (mode === 'resize-start') {
    return snapResizeRangeToTargetTimes(
      range,
      'start',
      targetTimes,
      videoDuration,
      thresholdSec,
    )
  }
  return snapResizeRangeToTargetTimes(
    range,
    'end',
    targetTimes,
    videoDuration,
    thresholdSec,
  )
}

export type CollectSnapTargetOptions = {
  excludeClipId?: string
  durationSec?: number
  includeRuler?: boolean
}

/** 从可吸附条块（及可选刻度）收集 start/end 时间点（秒） */
export function collectSnapTargetTimes(
  clips: Pick<TimelineDisplayClip, 'id' | 'kind' | 'startTime' | 'endTime'>[],
  options?: CollectSnapTargetOptions,
): number[] {
  const times = new Set<number>()
  for (const clip of clips) {
    if (options?.excludeClipId && clip.id === options.excludeClipId) continue
    if (!isPlayheadSnapClipKind(clip.kind)) continue
    times.add(Math.round(clip.startTime))
    times.add(Math.round(clip.endTime))
  }
  if (options?.includeRuler && options.durationSec != null && options.durationSec > 0) {
    for (const t of getRulerTicks(options.durationSec)) {
      times.add(t)
    }
  }
  return [...times]
}

/** 条块拖动用的吸附目标：其他条块边缘 + 刻度 + 播放指针 */
export function buildClipDragSnapTargets(
  clips: Pick<TimelineDisplayClip, 'id' | 'kind' | 'startTime' | 'endTime'>[],
  playheadSec: number,
  durationSec: number,
  excludeClipId?: string,
): number[] {
  const times = new Set(
    collectSnapTargetTimes(clips, {
      excludeClipId,
      durationSec,
      includeRuler: true,
    }),
  )
  times.add(Math.round(playheadSec))
  return [...times]
}

/**
 * 拖动播放指针时，若靠近条块 start/end，则将指针吸附到该时间点。
 */
export function snapPlayheadTime(
  timeSec: number,
  targetTimes: number[],
  videoDuration: number,
  thresholdSec: number = PLAYHEAD_SNAP_THRESHOLD_SEC,
): { time: number; snapped: boolean } {
  const max = Math.max(0, Math.floor(videoDuration))
  const time = clamp(Math.round(timeSec), 0, max)

  let best: { dist: number; target: number } | null = null
  for (const raw of targetTimes) {
    const target = clamp(Math.round(raw), 0, max)
    const dist = Math.abs(time - target)
    if (dist <= thresholdSec && (!best || dist < best.dist)) {
      best = { dist, target }
    }
  }

  if (!best) {
    return { time, snapped: false }
  }
  return { time: best.target, snapped: true }
}
