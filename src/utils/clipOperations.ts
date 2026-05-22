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

export const CLIP_SPEED_OPTIONS = [
  0.25, 0.5, 0.75, 1, 1.25, 1.5, 2,
] as const

export function setClipPlaybackRate(
  clips: VideoClip[],
  clipId: string,
  rate: number,
): VideoClip[] {
  return clips.map((clip) =>
    clip.id === clipId ? { ...clip, playbackRate: rate } : clip,
  )
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
