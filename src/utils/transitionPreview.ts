import type { VideoClip } from '@/data/mockProject'
import type { ClipTransform } from '@/types/clipTransform'
import type { ClipTransitionKind } from '@/types/clipTransition'

export type TransitionUnderlayPreview = {
  poster: string
  videoSrc?: string
  clipTime: number
  clipTimelineStart: number
  clipSourceOffset: number
  playbackRate: number
  transform?: ClipTransform
  opacity: number
}

export type TransitionPreviewFrame = {
  kind: ClipTransitionKind
  overOpacity: number
  overClipPath?: string
  underlay: TransitionUnderlayPreview
}

export type TransitionBlendState = {
  outgoing: VideoClip
  incoming: VideoClip
  kind: ClipTransitionKind
  overOpacity: number
  underOpacity: number
  /** 0=完整 outgoing，1=完全露出 incoming（划像） */
  wipeReveal: number
  outgoingLocalTime: number
  incomingLocalTime: number
}

function smoothstep(t: number): number {
  const x = Math.max(0, Math.min(1, t))
  return x * x * (3 - 2 * x)
}

export function clipLocalTime(clip: VideoClip, timelineTime: number): number {
  const rate = clip.playbackRate ?? 1
  return Math.max(
    0,
    (clip.sourceOffset ?? 0) + (timelineTime - clip.start) * rate,
  )
}

export function findTransitionAtTime(
  clips: VideoClip[],
  timelineTime: number,
): {
  outgoing: VideoClip
  incoming: VideoClip
  out: NonNullable<VideoClip['transitionOut']>
  progress: number
} | null {
  for (let joinIndex = 0; joinIndex < clips.length - 1; joinIndex += 1) {
    const outgoing = clips[joinIndex]
    const out = outgoing.transitionOut
    if (!out) continue

    const local = timelineTime - outgoing.start
    if (local < outgoing.duration - out.duration || local >= outgoing.duration) {
      continue
    }

    const incoming = clips[joinIndex + 1]
    if (!incoming) continue

    const progress =
      (local - (outgoing.duration - out.duration)) / out.duration
    return { outgoing, incoming, out, progress }
  }
  return null
}

export function resolveTransitionBlendAtTime(
  clips: VideoClip[],
  timelineTime: number,
): TransitionBlendState | null {
  const hit = findTransitionAtTime(clips, timelineTime)
  if (!hit) return null

  const p = smoothstep(hit.progress)
  let overOpacity = 1
  let underOpacity = 1

  switch (hit.out.kind) {
    case 'wipe':
      overOpacity = 1
      underOpacity = 1
      break
    case 'dissolve':
      overOpacity = 1 - p
      underOpacity = p
      break
    default:
      overOpacity = 1 - p
      underOpacity = p
      break
  }

  return {
    outgoing: hit.outgoing,
    incoming: hit.incoming,
    kind: hit.out.kind,
    overOpacity,
    underOpacity,
    wipeReveal: p,
    outgoingLocalTime: clipLocalTime(hit.outgoing, timelineTime),
    incomingLocalTime: clipLocalTime(hit.incoming, timelineTime),
  }
}

function buildBlendFrame(
  kind: ClipTransitionKind,
  progress: number,
  underClip: VideoClip,
  timelineTime: number,
): TransitionPreviewFrame {
  const p = smoothstep(progress)
  let overOpacity = 1
  let overClipPath: string | undefined
  let underOpacity = 1

  switch (kind) {
    case 'wipe':
      overOpacity = 1
      overClipPath = `inset(0 ${p * 100}% 0 0)`
      underOpacity = 1
      break
    case 'dissolve':
      overOpacity = 1 - p
      underOpacity = p
      break
    default:
      overOpacity = 1 - p
      underOpacity = p
      break
  }

  return {
    kind,
    overOpacity,
    overClipPath,
    underlay: {
      poster: underClip.poster,
      videoSrc: underClip.videoSrc,
      clipTime: clipLocalTime(underClip, timelineTime),
      clipTimelineStart: underClip.start,
      clipSourceOffset: underClip.sourceOffset ?? 0,
      playbackRate: underClip.playbackRate ?? 1,
      transform: underClip.transform,
      opacity: underOpacity,
    },
  }
}

/** 转场预览仅在前一段的 transitionOut 区间生效 */
export function resolveTransitionPreview(
  clips: VideoClip[],
  _activeClip: VideoClip,
  timelineTime: number,
): TransitionPreviewFrame | null {
  if (!clips.length) return null

  const hit = findTransitionAtTime(clips, timelineTime)
  if (!hit) return null

  return buildBlendFrame(hit.out.kind, hit.progress, hit.incoming, timelineTime)
}

export function resolveSimpleTransitionOpacity(
  clip: VideoClip,
  timelineTime: number,
): number {
  if (!clip.id || clip.id === 'placeholder') return 1
  const local = timelineTime - clip.start
  const out = clip.transitionOut
  if (out && local >= clip.duration - out.duration && local < clip.duration) {
    const progress = (local - (clip.duration - out.duration)) / out.duration
    const p = smoothstep(progress)
    switch (out.kind) {
      case 'wipe':
        return 1
      default:
        return 1 - p
    }
  }
  return 1
}

export function resolveTransitionOpacityAtTime(
  clips: VideoClip[],
  timelineTime: number,
): number {
  const blend = resolveTransitionBlendAtTime(clips, timelineTime)
  if (!blend) return 1
  switch (blend.kind) {
    case 'wipe':
      return 1
    default:
      return blend.overOpacity
  }
}
