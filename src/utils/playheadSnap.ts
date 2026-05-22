import { clamp } from '@/utils/formatTime'
import {
  MIN_RANGE_DURATION_SEC,
  normalizeTimeRange,
  type TimeRange,
} from '@/utils/timeRange'
import type {
  TimelineDisplayClip,
  TimelineOverlayKind,
} from '@/types/timelineDisplay'

/** 条块边缘与播放指针距离小于该值（秒）时触发吸附 */
export const PLAYHEAD_SNAP_THRESHOLD_SEC = 0.4

export type PlayheadSnapEdge = 'start' | 'end'

export const PLAYHEAD_SNAP_CLIP_KINDS: TimelineOverlayKind[] = [
  'text',
  'sticker',
  'bgm',
]

export function isPlayheadSnapClipKind(kind: TimelineOverlayKind): boolean {
  return (PLAYHEAD_SNAP_CLIP_KINDS as TimelineOverlayKind[]).includes(kind)
}

/**
 * 整体平移后的时间范围吸附到播放指针（保持时长不变）。
 * 优先吸附距离更近的边缘；若吸附后越界则放弃吸附。
 */
export function snapMoveRangeToPlayhead(
  range: TimeRange,
  playheadSec: number,
  videoDuration: number,
  thresholdSec: number = PLAYHEAD_SNAP_THRESHOLD_SEC,
): { range: TimeRange; snapped: PlayheadSnapEdge | null } {
  const max = Math.max(0, Math.floor(videoDuration))
  const playhead = clamp(Math.round(playheadSec), 0, max)
  const base = normalizeTimeRange(range, videoDuration).range
  const span = base.endTime - base.startTime
  if (span < MIN_RANGE_DURATION_SEC) {
    return { range: base, snapped: null }
  }

  const distStart = Math.abs(base.startTime - playhead)
  const distEnd = Math.abs(base.endTime - playhead)

  const candidates: { edge: PlayheadSnapEdge; dist: number }[] = []
  if (distStart <= thresholdSec) {
    candidates.push({ edge: 'start', dist: distStart })
  }
  if (distEnd <= thresholdSec) {
    candidates.push({ edge: 'end', dist: distEnd })
  }
  if (candidates.length === 0) {
    return { range: base, snapped: null }
  }

  candidates.sort((a, b) => a.dist - b.dist)
  const edge = candidates[0].edge

  let start: number
  let end: number
  if (edge === 'start') {
    start = playhead
    end = start + span
  } else {
    end = playhead
    start = end - span
  }

  if (start < 0 || end > max || end - start < MIN_RANGE_DURATION_SEC) {
    return { range: base, snapped: null }
  }

  const normalized = normalizeTimeRange(
    { startTime: start, endTime: end },
    videoDuration,
  ).range

  if (edge === 'start' && normalized.startTime !== playhead) {
    return { range: base, snapped: null }
  }
  if (edge === 'end' && normalized.endTime !== playhead) {
    return { range: base, snapped: null }
  }

  return { range: normalized, snapped: edge }
}

/**
 * 拖动左/右缘调整时，仅将被拖动的一侧吸附到播放指针，另一侧保持拖动结果。
 */
export function snapResizeRangeToPlayhead(
  range: TimeRange,
  edge: PlayheadSnapEdge,
  playheadSec: number,
  videoDuration: number,
  thresholdSec: number = PLAYHEAD_SNAP_THRESHOLD_SEC,
): { range: TimeRange; snapped: PlayheadSnapEdge | null } {
  const max = Math.max(0, Math.floor(videoDuration))
  const playhead = clamp(Math.round(playheadSec), 0, max)
  const base = normalizeTimeRange(range, videoDuration).range

  if (edge === 'start') {
    if (Math.abs(base.startTime - playhead) > thresholdSec) {
      return { range: base, snapped: null }
    }
    const normalized = normalizeTimeRange(
      { startTime: playhead, endTime: base.endTime },
      videoDuration,
    ).range
    if (normalized.startTime !== playhead) {
      return { range: base, snapped: null }
    }
    return { range: normalized, snapped: 'start' }
  }

  if (Math.abs(base.endTime - playhead) > thresholdSec) {
    return { range: base, snapped: null }
  }
  const normalized = normalizeTimeRange(
    { startTime: base.startTime, endTime: playhead },
    videoDuration,
  ).range
  if (normalized.endTime !== playhead) {
    return { range: base, snapped: null }
  }
  return { range: normalized, snapped: 'end' }
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
  if (mode === 'move') {
    return snapMoveRangeToPlayhead(range, playheadSec, videoDuration, thresholdSec)
  }
  if (mode === 'resize-start') {
    return snapResizeRangeToPlayhead(
      range,
      'start',
      playheadSec,
      videoDuration,
      thresholdSec,
    )
  }
  return snapResizeRangeToPlayhead(
    range,
    'end',
    playheadSec,
    videoDuration,
    thresholdSec,
  )
}

/** 从可吸附条块收集 start/end 时间点（秒） */
export function collectSnapTargetTimes(
  clips: Pick<TimelineDisplayClip, 'kind' | 'startTime' | 'endTime'>[],
): number[] {
  const times = new Set<number>()
  for (const clip of clips) {
    if (!isPlayheadSnapClipKind(clip.kind)) continue
    times.add(Math.round(clip.startTime))
    times.add(Math.round(clip.endTime))
  }
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
