import type { VideoClip } from '@/data/mockProject'
import type { ClipTransform, NormalizedCrop } from '@/types/clipTransform'

const MIN_PART_SEC = 0.35
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

/** 在播放头位置分割当前片段 */
export function splitClipAt(
  clips: VideoClip[],
  time: number,
): { clips: VideoClip[]; duration: number } | null {
  const index = clips.findIndex(
    (clip) =>
      time > clip.start + MIN_PART_SEC &&
      time < clip.start + clip.duration - MIN_PART_SEC,
  )
  if (index === -1) return null

  const clip = clips[index]
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

export function rotateClip(clips: VideoClip[], clipId: string): VideoClip[] {
  return clips.map((clip) => {
    if (clip.id !== clipId) return clip
    const current = clip.transform?.rotation ?? 0
    const idx = ROTATIONS.indexOf(current)
    const next = ROTATIONS[(idx + 1) % ROTATIONS.length]
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
