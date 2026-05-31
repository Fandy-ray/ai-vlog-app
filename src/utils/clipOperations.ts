import type { VideoClip } from '@/data/mockProject'
import type { ClipTransform, NormalizedCrop } from '@/types/clipTransform'
import type { ClipTransition, ClipTransitionKind } from '@/types/clipTransition'
import { DEFAULT_TRANSITION_DURATION } from '@/types/clipTransition'

export type ClipJoinPoint = {
  joinIndex: number
  joinTime: number
  label: string
  transition: ClipTransition | null
}

const MIN_PART_SEC = 0.35
/** 时间轴切点/范围端点容差（秒） */
const TIME_EPS = 0.12
/** 语音/播放头定位转场时，允许偏离衔接点的最大距离（秒） */
export const JOIN_TRANSITION_MAX_DIST = 0.6
const ROTATIONS = [0, 90, 180, 270] as const

function totalDuration(clips: VideoClip[]): number {
  return Math.max(
    clips.reduce((sum, clip) => sum + clip.duration, 0),
    1,
  )
}

function reindexClipStarts(clips: VideoClip[]): VideoClip[] {
  let start = 0
  return clips.map((clip) => {
    const next = { ...clip, start }
    start += clip.duration
    return next
  })
}

function revokeClipBlobIfUnused(clips: VideoClip[], removed: VideoClip) {
  const src = removed.videoSrc
  if (!src?.startsWith('blob:')) return
  if (clips.some((clip) => clip.videoSrc === src)) return
  URL.revokeObjectURL(src)
}

function splitClipAtIndex(
  clips: VideoClip[],
  index: number,
  time: number,
): { clips: VideoClip[]; duration: number } | null {
  const clip = clips[index]
  if (
    time <= clip.start + MIN_PART_SEC ||
    time >= clip.start + clip.duration - MIN_PART_SEC
  ) {
    return null
  }
  const offset = time - clip.start
  const stamp = Date.now()

  const first: VideoClip = {
    ...clip,
    id: `${clip.id}-a-${stamp}`,
    duration: offset,
  }
  const second: VideoClip = {
    ...clip,
    id: `${clip.id}-b-${stamp}`,
    duration: clip.duration - offset,
    sourceOffset: (clip.sourceOffset ?? 0) + offset,
  }

  const merged = reindexClipStarts([
    ...clips.slice(0, index),
    first,
    second,
    ...clips.slice(index + 1),
  ])

  return { clips: merged, duration: totalDuration(merged) }
}

/** 在播放头位置分割指定片段 */
export function splitClipAt(
  clips: VideoClip[],
  time: number,
  clipId?: string,
): { clips: VideoClip[]; duration: number; secondId: string } | null {
  const index =
    clipId != null
      ? clips.findIndex((c) => c.id === clipId)
      : clips.findIndex(
          (clip) =>
            time > clip.start + MIN_PART_SEC &&
            time < clip.start + clip.duration - MIN_PART_SEC,
        )
  if (index === -1) return null

  const result = splitClipAtIndex(clips, index, time)
  if (!result) return null
  const second = result.clips[index + 1]
  return { ...result, secondId: second.id }
}

/** 删除播放头所在片段 */
export function deleteClipAt(
  clips: VideoClip[],
  time: number,
): { clips: VideoClip[]; duration: number } | null {
  if (clips.length <= 1) return null

  const index = clips.findIndex(
    (clip) => time >= clip.start && time < clip.start + clip.duration,
  )
  if (index === -1) return null

  const removed = clips[index]
  const remaining = reindexClipStarts(clips.filter((_, i) => i !== index))
  revokeClipBlobIfUnused(remaining, removed)

  return { clips: remaining, duration: totalDuration(remaining) }
}

/** 按 id 删除片段（至少保留一段） */
export function deleteClipById(
  clips: VideoClip[],
  clipId: string,
): { clips: VideoClip[]; duration: number } | null {
  if (clips.length <= 1) return null
  const index = clips.findIndex((c) => c.id === clipId)
  if (index === -1) return null

  const removed = clips[index]
  const remaining = reindexClipStarts(clips.filter((_, i) => i !== index))
  revokeClipBlobIfUnused(remaining, removed)

  return { clips: remaining, duration: totalDuration(remaining) }
}

function findClipIndexAtTime(clips: VideoClip[], time: number): number {
  for (let i = clips.length - 1; i >= 0; i -= 1) {
    const clip = clips[i]
    if (time >= clip.start - TIME_EPS && time < clip.start + clip.duration + TIME_EPS) {
      return i
    }
  }
  return -1
}

/** 在时间点切开（若已落在衔接处则不再切） */
function splitAtTimeIfNeeded(
  clips: VideoClip[],
  time: number,
): { clips: VideoClip[]; boundaryIndex: number } | null {
  const index = findClipIndexAtTime(clips, time)
  if (index === -1) return null

  const clip = clips[index]
  const clipEnd = clip.start + clip.duration

  if (Math.abs(time - clip.start) <= TIME_EPS) {
    return { clips, boundaryIndex: index }
  }
  if (Math.abs(time - clipEnd) <= TIME_EPS) {
    return { clips, boundaryIndex: index + 1 }
  }

  const split = splitClipAtIndex(clips, index, time)
  if (!split) return null

  const boundaryIndex = split.clips.findIndex(
    (c) => c.start >= time - TIME_EPS,
  )
  if (boundaryIndex === -1) return null
  return { clips: split.clips, boundaryIndex }
}

export function deleteClipRange(
  clips: VideoClip[],
  startTime: number,
  endTime: number,
): { clips: VideoClip[]; duration: number } | null {
  if (!clips.length || endTime <= startTime) return null

  const startPrep = splitAtTimeIfNeeded(clips, startTime)
  if (!startPrep) return null

  let working = startPrep.clips
  let startBoundary = startPrep.boundaryIndex

  const endPrep = splitAtTimeIfNeeded(working, endTime)
  if (!endPrep) return null

  working = endPrep.clips
  let endBoundary = endPrep.boundaryIndex

  if (endBoundary < startBoundary) {
    const endIdx = working.findIndex((c) => c.start >= endTime - TIME_EPS)
    if (endIdx === -1) return null
    endBoundary = endIdx
  }

  if (endBoundary <= startBoundary) return null

  const removedClips = working.slice(startBoundary, endBoundary)
  const remaining = reindexClipStarts([
    ...working.slice(0, startBoundary),
    ...working.slice(endBoundary),
  ])
  for (const clip of removedClips) revokeClipBlobIfUnused(remaining, clip)
  return { clips: remaining, duration: totalDuration(remaining) }
}

export function keepClipRange(
  clips: VideoClip[],
  startTime: number,
  endTime: number,
): { clips: VideoClip[]; duration: number } | null {
  if (!clips.length || endTime <= startTime) return null

  const startIndex = clips.findIndex(
    (clip) =>
      startTime >= clip.start && startTime < clip.start + clip.duration,
  )
  if (startIndex === -1) return null
  const startSplit = splitClipAtIndex(clips, startIndex, startTime)
  if (!startSplit) return null

  const endIndex = startSplit.clips.findIndex(
    (clip) => endTime > clip.start && endTime <= clip.start + clip.duration,
  )
  if (endIndex === -1) return null
  const endSplit = splitClipAtIndex(startSplit.clips, endIndex, endTime)
  if (!endSplit) return null

  const startBoundary = endSplit.clips.findIndex(
    (clip) => clip.start >= startTime - 0.001,
  )
  const endBoundary = endSplit.clips.findIndex(
    (clip) => clip.start >= endTime - 0.001,
  )
  if (startBoundary === -1 || endBoundary === -1 || endBoundary <= startBoundary) return null

  const keptClips = endSplit.clips.slice(startBoundary, endBoundary)
  const remaining = reindexClipStarts(keptClips)
  return { clips: remaining, duration: totalDuration(remaining) }
}

export const CLIP_SPEED_OPTIONS = [
  0.25, 0.5, 0.75, 1, 1.25, 1.5, 2,
] as const

/** 设置片段倍速，并按倍速反比调整时间轴时长（保持源素材占用量不变） */
export function setClipPlaybackRate(
  clips: VideoClip[],
  clipId: string,
  rate: number,
): { clips: VideoClip[]; duration: number } {
  const clampedRate = Math.max(0.1, Math.min(16, rate))
  const index = clips.findIndex((c) => c.id === clipId)
  if (index === -1) {
    return { clips, duration: totalDuration(clips) }
  }

  const clip = clips[index]
  const oldRate = clip.playbackRate ?? 1
  if (Math.abs(oldRate - clampedRate) < 0.001) {
    return { clips, duration: totalDuration(clips) }
  }

  const newDuration = Math.max(
    MIN_PART_SEC,
    clip.duration * (oldRate / clampedRate),
  )

  const updated = clips.map((c, i) =>
    i === index
      ? { ...c, playbackRate: clampedRate, duration: newDuration }
      : c,
  )
  const reindexed = reindexClipStarts(updated)
  return { clips: reindexed, duration: totalDuration(reindexed) }
}

export function toggleClipMirror(clips: VideoClip[], clipId: string): VideoClip[] {
  return clips.map((clip) => {
    if (clip.id !== clipId) return clip
    const transform: ClipTransform = {
      ...clip.transform,
      flipH: !clip.transform?.flipH,
    }
    return { ...clip, transform }
  })
}

function snapRotationDegrees(degrees: number): (typeof ROTATIONS)[number] {
  const steps = Math.round(degrees / 90)
  const snapped = ((steps * 90) % 360 + 360) % 360
  return ROTATIONS.includes(snapped as (typeof ROTATIONS)[number])
    ? (snapped as (typeof ROTATIONS)[number])
    : 0
}

export function rotateClip(clips: VideoClip[], clipId: string): VideoClip[] {
  return rotateClipByDelta(clips, clipId, 90)
}

/** 按角度旋转片段（正数=顺时针，负数=逆时针，与 transform.rotation 一致） */
export function rotateClipByDelta(
  clips: VideoClip[],
  clipId: string,
  deltaDegrees: number,
): VideoClip[] {
  return clips.map((clip) => {
    if (clip.id !== clipId) return clip
    const current = clip.transform?.rotation ?? 0
    const next = snapRotationDegrees(current + deltaDegrees)
    return {
      ...clip,
      transform: { ...clip.transform, rotation: next },
    }
  })
}

export function setClipCrop(
  clips: VideoClip[],
  clipId: string,
  crop: NormalizedCrop,
): VideoClip[] {
  return clips.map((clip) => {
    if (clip.id !== clipId) return clip
    return {
      ...clip,
      transform: { ...clip.transform, crop },
    }
  })
}

function findJoinIndexAtTime(clips: VideoClip[], time: number): number {
  for (let i = 0; i < clips.length - 1; i += 1) {
    const join = clips[i].start + clips[i].duration
    if (Math.abs(join - time) <= TIME_EPS) return i
  }
  return -1
}

/** 找离指定时间最近、且在容差内的片段衔接点（不会切开片段） */
export function findJoinIndexForTransition(
  clips: VideoClip[],
  time: number,
  maxDist = JOIN_TRANSITION_MAX_DIST,
): { joinIndex: number; joinTime: number } | null {
  if (clips.length < 2) return null

  let bestIndex = -1
  let bestDist = Infinity
  let bestJoinTime = 0

  for (let i = 0; i < clips.length - 1; i += 1) {
    const joinTime = clips[i].start + clips[i].duration
    const dist = Math.abs(joinTime - time)
    if (dist < bestDist) {
      bestDist = dist
      bestIndex = i
      bestJoinTime = joinTime
    }
  }

  if (bestIndex < 0 || bestDist > maxDist) return null
  return { joinIndex: bestIndex, joinTime: bestJoinTime }
}

/** 仅在已有片段衔接处设置转场（不切分、不新建衔接点） */
export function applyTransitionAtExistingJoin(
  clips: VideoClip[],
  time: number,
  kind: ClipTransitionKind,
  transitionDuration = DEFAULT_TRANSITION_DURATION,
  maxDist = JOIN_TRANSITION_MAX_DIST,
): { clips: VideoClip[]; joinTime: number; joinIndex: number } | null {
  const hit = findJoinIndexForTransition(clips, time, maxDist)
  if (!hit) return null
  const result = applyTransitionAtJoinIndex(
    clips,
    hit.joinIndex,
    kind,
    transitionDuration,
  )
  if (!result) return null
  return { ...result, joinIndex: hit.joinIndex }
}

/** 在指定时间添加转场：必要时先切开，再在衔接处写入 transitionIn/Out */
export function applyTransitionAtTime(
  clips: VideoClip[],
  time: number,
  kind: ClipTransitionKind,
  transitionDuration = DEFAULT_TRANSITION_DURATION,
): { clips: VideoClip[]; duration: number; joinTime: number } | null {
  if (!clips.length) return null

  let working = clips
  let duration = totalDuration(clips)
  let joinIndex = findJoinIndexAtTime(working, time)

  if (joinIndex === -1) {
    const split = splitClipAt(working, time)
    if (!split) return null
    working = split.clips
    duration = split.duration
    joinIndex = findJoinIndexAtTime(working, time)
    if (joinIndex === -1) {
      joinIndex = working.findIndex((clip, i) => {
        if (i >= working.length - 1) return false
        const join = clip.start + clip.duration
        return Math.abs(join - time) < 0.6
      })
    }
  }

  if (joinIndex < 0 || joinIndex >= working.length - 1) return null

  const dur = Math.max(0.25, Math.min(1.2, transitionDuration))
  const transition = { kind, duration: dur }
  const joinTime = working[joinIndex].start + working[joinIndex].duration

  const updated = working.map((clip, i) => {
    if (i === joinIndex) return { ...clip, transitionOut: transition }
    if (i === joinIndex + 1) return { ...clip, transitionIn: transition }
    return clip
  })

  return { clips: updated, duration, joinTime }
}

/** 列出所有片段衔接点（至少两段视频才有） */
export function listClipJoinPoints(clips: VideoClip[]): ClipJoinPoint[] {
  const points: ClipJoinPoint[] = []
  for (let i = 0; i < clips.length - 1; i += 1) {
    const joinTime = clips[i].start + clips[i].duration
    points.push({
      joinIndex: i,
      joinTime,
      label: `片段 ${i + 1} → ${i + 2}`,
      transition: clips[i].transitionOut ?? clips[i + 1].transitionIn ?? null,
    })
  }
  return points
}

/** 找离播放时间最近的衔接点索引 */
export function findJoinIndexNearTime(clips: VideoClip[], time: number): number {
  if (clips.length < 2) return -1
  let best = 0
  let bestDist = Infinity
  for (let i = 0; i < clips.length - 1; i += 1) {
    const join = clips[i].start + clips[i].duration
    const dist = Math.abs(join - time)
    if (dist < bestDist) {
      bestDist = dist
      best = i
    }
  }
  return best
}

/** 在已有衔接处设置转场（不切开片段） */
export function applyTransitionAtJoinIndex(
  clips: VideoClip[],
  joinIndex: number,
  kind: ClipTransitionKind,
  transitionDuration = DEFAULT_TRANSITION_DURATION,
): { clips: VideoClip[]; joinTime: number } | null {
  if (joinIndex < 0 || joinIndex >= clips.length - 1) return null

  const dur = Math.max(0.25, Math.min(1.2, transitionDuration))
  const transition = { kind, duration: dur }
  const joinTime = clips[joinIndex].start + clips[joinIndex].duration

  const updated = clips.map((clip, i) => {
    if (i === joinIndex) return { ...clip, transitionOut: transition }
    if (i === joinIndex + 1) return { ...clip, transitionIn: transition }
    return clip
  })

  return { clips: updated, joinTime }
}

/** 移除衔接处转场 */
export function clearTransitionAtJoinIndex(
  clips: VideoClip[],
  joinIndex: number,
): VideoClip[] {
  if (joinIndex < 0 || joinIndex >= clips.length - 1) return clips

  return clips.map((clip, i) => {
    if (i === joinIndex) {
      const { transitionOut: _out, ...rest } = clip
      return rest
    }
    if (i === joinIndex + 1) {
      const { transitionIn: _in, ...rest } = clip
      return rest
    }
    return clip
  })
}
