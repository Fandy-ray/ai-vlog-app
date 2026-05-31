/**
 * 语音转场：仅能在已有片段衔接处添加，与播放头/播放位置无关。
 * 定位方式二选一：① 相邻片段序号；② 衔接点秒数（须对准交界）。
 */

import type { VideoClip } from '@/data/mockProject'
import type { ClipTransitionKind } from '@/types/clipTransition'
import { DEFAULT_TRANSITION_DURATION } from '@/types/clipTransition'
import { transitionKindLabel } from '@/types/clipTransition'
import {
  applyTransitionAtJoinIndex,
  listClipJoinPoints,
} from '@/utils/clipOperations'
import {
  parseNumberToken,
  extractSingleTimes,
} from '@/utils/voiceCommandParser'

/** 口语秒数与真实衔接点允许偏差（秒） */
const VOICE_JOIN_TIME_EPS = 0.45

export type VoiceTransitionPayload = {
  joinIndex?: number
  joinTime?: number
  transitionKind?: ClipTransitionKind
  transitionDuration?: number
}

export type VoiceTransitionParseResult = {
  command: 'transition'
  id: string
  label: string
  payload: VoiceTransitionPayload & {
    transitionKind: ClipTransitionKind
    transitionDuration: number
  }
}

export type VoiceTransitionApplyError =
  | 'need_clips'
  | 'need_target'
  | 'join_out_of_range'
  | 'time_not_join'
  | 'apply_failed'

export type VoiceTransitionApplyResult =
  | {
      ok: true
      clips: VideoClip[]
      joinIndex: number
      joinTime: number
      appliedLabel: string
    }
  | {
      ok: false
      error: VoiceTransitionApplyError
      joinHint?: string
      at?: number
      pairLabel?: string
    }

function transitionKindFromText(text: string): ClipTransitionKind {
  if (/叠化|溶解|交融|cross/i.test(text)) return 'dissolve'
  if (/划像|划变|擦除|擦过|wip/i.test(text)) return 'wipe'
  if (/淡化|淡入淡出|渐隐|渐显|fade/i.test(text)) return 'fade'
  return 'fade'
}

function transitionDurationFromText(text: string): number {
  if (/长一点|长一些|久一点/u.test(text)) return 0.8
  if (/短一点|快一点/u.test(text)) return 0.35
  if (/一点|稍微|略微/u.test(text)) return 0.45
  const explicit = text.match(
    /([零一二两三四五六七八九十\d]+(?:\.\d+)?)\s*秒(?:的)?转场/u,
  )
  if (explicit) {
    const n = parseNumberToken(explicit[1])
    if (n != null && n >= 0.2 && n <= 1.5) return n
  }
  return DEFAULT_TRANSITION_DURATION
}

function kindLabel(kind: ClipTransitionKind): string {
  return kind === 'dissolve' ? '叠化' : kind === 'wipe' ? '划像' : '淡化'
}

/** 解析「第1和第2个片段之间」等相邻片段说法 */
export function parseVoiceTransitionJoinPair(
  text: string,
): { joinIndex: number; label: string } | null {
  const patterns = [
    /第?\s*([零一二两三四五六七八九十\d]+)\s*(?:和|与|跟|到|至)\s*第?\s*([零一二两三四五六七八九十\d]+)\s*(?:个|段)?\s*(?:片段|镜头|视频|素材)?\s*(?:之间|中间|衔接处|的衔接|加转场|加过渡)?/u,
    /片段\s*([零一二两三四五六七八九十\d]+)\s*(?:和|与|到|至)\s*片段\s*([零一二两三四五六七八九十\d]+)\s*(?:之间|中间|衔接)?/u,
    /([零一二两三四五六七八九十\d]+)\s*段\s*(?:和|与|到|至)\s*([零一二两三四五六七八九十\d]+)\s*段\s*(?:之间|中间)?/u,
  ]
  for (const re of patterns) {
    const m = text.match(re)
    if (!m) continue
    const a = parseNumberToken(m[1])
    const b = parseNumberToken(m[2])
    if (a == null || b == null || a < 1 || b < 1) continue
    const first = Math.min(a, b)
    const second = Math.max(a, b)
    if (second !== first + 1) continue
    return {
      joinIndex: first - 1,
      label: `片段 ${first} → ${second}`,
    }
  }
  return null
}

/** 从整句提取转场用的衔接点秒数（排除范围里的数字） */
export function extractVoiceTransitionJoinTime(text: string): number | null {
  const patterns = [
    /第?\s*([零一二两三四五六七八九十\d]+(?:\.\d+)?)\s*秒\s*(?:的)?\s*(?:衔接|交界|连接|转场|过渡|加)/u,
    /(?:在|于)\s*第?\s*([零一二两三四五六七八九十\d]+(?:\.\d+)?)\s*秒\s*(?:衔接|交界|处)?/u,
    /第?\s*([零一二两三四五六七八九十\d]+(?:\.\d+)?)\s*秒\s*(?:加|做|用|来个)?\s*(?:淡化|叠化|划像|转场|过渡)/u,
  ]
  for (const re of patterns) {
    const m = text.match(re)
    if (!m) continue
    const n = parseNumberToken(m[1])
    if (n != null && n >= 0) return n
  }
  const times = extractSingleTimes(text)
  if (times.length === 1 && /转场|过渡|叠化|划像|淡化|溶解|擦除|淡入|淡出/u.test(text)) {
    return times[0]
  }
  return null
}

export function hasVoiceTransitionIntent(text: string): boolean {
  return (
    /转场|过渡|切换镜头|切镜头|切镜|淡入淡出|淡入|淡出|叠化|溶解|渐隐|渐显|划像|擦除/u.test(
      text,
    ) &&
    (parseVoiceTransitionJoinPair(text) != null ||
      extractVoiceTransitionJoinTime(text) != null)
  )
}

export function buildVoiceTransitionLabel(payload: VoiceTransitionPayload): string {
  const kind = payload.transitionKind ?? 'fade'
  const kl = kindLabel(kind)
  if (payload.joinIndex != null) {
    const label = `片段 ${payload.joinIndex + 1} → ${payload.joinIndex + 2}`
    return `在${label}之间添加${kl}转场`
  }
  if (payload.joinTime != null) {
    return `在 ${payload.joinTime} 秒衔接处添加${kl}转场`
  }
  return `添加${kl}转场（需指定衔接点）`
}

/** 本地语音识别 → 转场指令（无目标则不生成） */
export function parseVoiceTransitionCommand(
  text: string,
): VoiceTransitionParseResult | null {
  if (!hasVoiceTransitionIntent(text)) return null

  const kind = transitionKindFromText(text)
  const duration = transitionDurationFromText(text)
  const joinPair = parseVoiceTransitionJoinPair(text)
  const joinTime = joinPair
    ? undefined
    : (extractVoiceTransitionJoinTime(text) ?? undefined)

  if (!joinPair && joinTime == null) return null

  const payload: VoiceTransitionParseResult['payload'] = {
    transitionKind: kind,
    transitionDuration: duration,
    joinIndex: joinPair?.joinIndex,
    joinTime,
  }

  return {
    command: 'transition',
    id: `transition-${joinPair?.joinIndex ?? joinTime ?? 'spec'}-${kind}`,
    label: joinPair
      ? `在${joinPair.label}之间添加${kindLabel(kind)}转场`
      : `在 ${joinTime} 秒衔接处添加${kindLabel(kind)}转场`,
    payload,
  }
}

/** AI 返回行 → 转场 payload（无有效目标则 null） */
export function voiceTransitionPayloadFromAi(row: {
  time?: number
  start?: number
  joinIndex?: number
  clipFrom?: number
  clipTo?: number
  transition?: string
  transitionDuration?: number
}): VoiceTransitionPayload | null {
  const raw = String(row.transition || 'fade').toLowerCase()
  const transitionKind: ClipTransitionKind =
    raw.includes('dissolve') || raw.includes('叠化') || raw.includes('溶解')
      ? 'dissolve'
      : raw.includes('wipe') || raw.includes('划') || raw.includes('擦')
        ? 'wipe'
        : 'fade'

  let joinIndex: number | undefined
  if (row.joinIndex != null && Number.isFinite(Number(row.joinIndex))) {
    joinIndex = Number(row.joinIndex)
  } else if (row.clipFrom != null && row.clipTo != null) {
    const from = Number(row.clipFrom)
    const to = Number(row.clipTo)
    if (from >= 1 && to === from + 1) joinIndex = from - 1
  }

  let joinTime: number | undefined
  if (joinIndex == null) {
    const t = row.time ?? row.start
    if (t != null && Number.isFinite(Number(t))) joinTime = Number(t)
  }

  if (joinIndex == null && joinTime == null) return null

  return {
    joinIndex,
    joinTime,
    transitionKind,
    transitionDuration:
      row.transitionDuration != null
        ? Number(row.transitionDuration)
        : undefined,
  }
}

export function formatJoinHint(clips: VideoClip[]): string {
  return listClipJoinPoints(clips)
    .map((j) => `${Math.round(j.joinTime)}秒`)
    .join('、')
}

function findJoinIndexAtVoiceTime(
  clips: VideoClip[],
  time: number,
): { joinIndex: number; joinTime: number } | null {
  if (clips.length < 2) return null

  let hit: { joinIndex: number; joinTime: number } | null = null
  let bestDist = Infinity

  for (let i = 0; i < clips.length - 1; i += 1) {
    const joinTime = clips[i].start + clips[i].duration
    const dist = Math.abs(joinTime - time)
    if (dist > VOICE_JOIN_TIME_EPS) continue
    if (dist < bestDist) {
      bestDist = dist
      hit = { joinIndex: i, joinTime }
    }
  }
  return hit
}

/** 执行语音转场（不读播放头、不切开片段） */
export function applyVoiceTransition(
  clips: VideoClip[],
  payload: VoiceTransitionPayload,
): VoiceTransitionApplyResult {
  if (clips.length < 2) {
    return { ok: false, error: 'need_clips' }
  }

  const kind = payload.transitionKind ?? 'fade'
  const duration = payload.transitionDuration ?? DEFAULT_TRANSITION_DURATION
  let joinIndex = payload.joinIndex
  let resolvedJoinTime: number | undefined

  if (joinIndex != null) {
    if (joinIndex < 0 || joinIndex >= clips.length - 1) {
      return {
        ok: false,
        error: 'join_out_of_range',
        pairLabel: `片段 ${joinIndex + 1} → ${joinIndex + 2}`,
      }
    }
    resolvedJoinTime = clips[joinIndex].start + clips[joinIndex].duration
  } else if (payload.joinTime != null) {
    const hit = findJoinIndexAtVoiceTime(clips, payload.joinTime)
    if (!hit) {
      return {
        ok: false,
        error: 'time_not_join',
        at: payload.joinTime,
        joinHint: formatJoinHint(clips),
      }
    }
    joinIndex = hit.joinIndex
    resolvedJoinTime = hit.joinTime
  } else {
    return { ok: false, error: 'need_target' }
  }

  const applied = applyTransitionAtJoinIndex(clips, joinIndex, kind, duration)
  if (!applied) {
    return { ok: false, error: 'apply_failed' }
  }

  const joinLabel =
    listClipJoinPoints(applied.clips).find((j) => j.joinIndex === joinIndex)
      ?.label ?? `片段 ${joinIndex + 1} → ${joinIndex + 2}`

  return {
    ok: true,
    clips: applied.clips,
    joinIndex,
    joinTime: resolvedJoinTime ?? applied.joinTime,
    appliedLabel: `${joinLabel} · ${transitionKindLabel(kind)}转场`,
  }
}

export function voiceTransitionErrorMessage(
  result: Extract<VoiceTransitionApplyResult, { ok: false }>,
): string {
  switch (result.error) {
    case 'need_clips':
      return '至少需要两段视频才能设置转场'
    case 'need_target':
      return '转场请说明衔接点秒数（须对准两段交界），或说「第1和第2个片段之间加叠化」'
    case 'join_out_of_range':
      return `未找到 ${result.pairLabel ?? '该'} 的衔接处，请检查片段数量`
    case 'time_not_join':
      return `第 ${Math.round(result.at ?? 0)} 秒不是片段衔接处。当前衔接点：${result.joinHint ?? ''}`
    default:
      return '无法在该衔接处设置转场'
  }
}
