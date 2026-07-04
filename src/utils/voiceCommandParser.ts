/**
 * 将语音识别文本解析为可执行的剪辑指令（容错同音字、多种说法）。
 */

import type { ClipTransitionKind } from '@/types/clipTransition'
import { parseVoiceTransitionCommand } from '@/utils/voiceTransition'

export type ParsedVoiceCommandType =
  | 'speed'
  | 'delete'
  | 'keepRange'
  | 'rotate'
  | 'mirror'
  | 'bgm'
  | 'text'
  | 'transition'
  | 'split'
  | 'filter'
  | 'effect'
  | 'seek'
  | 'muteOriginal'
  | 'unmuteOriginal'
  | 'crop'
  | 'narration'
  | 'openAudio'

export interface ParsedVoiceCommand {
  id: string
  command: ParsedVoiceCommandType
  label: string
  payload?: {
    rate?: number
    start?: number
    end?: number
    time?: number
    rotationSteps?: number
    /** 旋转增量：正=顺时针，负=逆时针（度） */
    rotationDelta?: number
    text?: string
    filterId?: string
    effectId?: string
    transitionKind?: ClipTransitionKind
    transitionDuration?: number
    /** 片段衔接索引：joinIndex 0 = 片段1→2 */
    joinIndex?: number
  }
}

const CHINESE_DIGIT_MAP: Record<string, number> = {
  零: 0,
  一: 1,
  二: 2,
  两: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
}

/** 修正常见听写错误，便于后续匹配 */
export function normalizeVoiceTranscript(raw: string): string {
  let text = raw.replace(/^识别结果[:：\s]*/u, '').trim()
  const fixes: Array<[RegExp, string]> = [
    [/倍数/g, '倍速'],
    [/两倍/g, '二倍'],
    [/双倍/g, '二倍'],
    [/俩倍/g, '二倍'],
    [/二倍数/g, '二倍速'],
    [/左旋转/g, '向左旋转'],
    [/右旋转/g, '向右旋转'],
    [/往左转/g, '向左转'],
    [/往右转/g, '向右转'],
    [/一倍数/g, '一倍速'],
    [/三倍数/g, '三倍速'],
    [/加快一点/g, '加速'],
    [/慢一点/g, '慢放'],
    [/视频频/g, '视频'],
    [/删掉掉/g, '删掉'],
    [/切掉掉/g, '切掉'],
    [/第([零一二两三四五六七八九十\d]+)到第([零一二两三四五六七八九十\d]+)/g, '$1到$2'],
    [/删出/g, '删掉'],
    [/专场/g, '转场'],
    [/装场/g, '转场'],
    [/转厂/g, '转场'],
    [/更留畅/g, '更流畅'],
  ]
  for (const [pattern, replacement] of fixes) {
    text = text.replace(pattern, replacement)
  }
  return text
}

export function parseNumberToken(token: string): number | null {
  const normalized = token.trim()
  if (!normalized) return null
  if (/^\d+(?:\.\d+)?$/.test(normalized)) return Number(normalized)
  if (/^[零一二两三四五六七八九十]+$/.test(normalized)) {
    if (normalized === '十') return 10
    if (normalized.length === 2 && normalized.startsWith('十')) {
      return 10 + (CHINESE_DIGIT_MAP[normalized[1]] ?? 0)
    }
    if (normalized.length === 2 && normalized.endsWith('十')) {
      return (CHINESE_DIGIT_MAP[normalized[0]] ?? 0) * 10
    }
    if (normalized.includes('十')) {
      const [head, tail] = normalized.split('十')
      const tens = head ? (CHINESE_DIGIT_MAP[head] ?? 0) : 1
      const ones = tail ? (CHINESE_DIGIT_MAP[tail] ?? 0) : 0
      return tens * 10 + ones
    }
    return normalized
      .split('')
      .reduce((sum, ch) => sum * 10 + (CHINESE_DIGIT_MAP[ch] ?? 0), 0)
  }
  return null
}

const RANGE_PATTERN =
  /第?\s*([零一二两三四五六七八九十\d]+(?:\.\d+)?)\s*秒?\s*(?:到|至|~|—|-|−|–)\s*第?\s*([零一二两三四五六七八九十\d]+(?:\.\d+)?)\s*秒?/gu

const RANGE_ALT_PATTERN =
  /([零一二两三四五六七八九十\d]+(?:\.\d+)?)\s*[-－]\s*([零一二两三四五六七八九十\d]+(?:\.\d+)?)\s*秒/gu

/** 从整句中提取单个时间点（秒），排除「X 到 Y 秒」范围里的数字 */
export function extractSingleTimes(text: string): number[] {
  const times: number[] = []
  const re = /第?\s*([零一二两三四五六七八九十\d]+(?:\.\d+)?)\s*秒/gu
  for (const match of text.matchAll(re)) {
    const idx = match.index ?? 0
    const tail = text.slice(idx + match[0].length, idx + match[0].length + 6)
    const head = text.slice(Math.max(0, idx - 6), idx)
    if (/到|至|~|—|-|−|–/.test(tail) || /到|至|~|—|-|−|–/.test(head)) continue
    const n = parseNumberToken(match[1])
    if (n != null) times.push(n)
  }
  return times
}

function pushRange(
  ranges: Array<{ start: number; end: number }>,
  start: number | null,
  end: number | null,
) {
  if (start == null || end == null || end <= start) return
  if (ranges.some((r) => r.start === start && r.end === end)) return
  ranges.push({ start, end })
}

/** 从整句中提取所有「X 到 Y 秒」时间范围 */
export function extractTimeRanges(text: string): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = []
  for (const match of text.matchAll(RANGE_PATTERN)) {
    pushRange(ranges, parseNumberToken(match[1]), parseNumberToken(match[2]))
  }
  for (const match of text.matchAll(RANGE_ALT_PATTERN)) {
    pushRange(ranges, parseNumberToken(match[1]), parseNumberToken(match[2]))
  }
  return ranges
}

function hasDeleteIntent(text: string): boolean {
  return (
    /删/u.test(text) ||
    /去掉/u.test(text) ||
    /移除/u.test(text) ||
    /切掉/u.test(text) ||
    /剪掉/u.test(text) ||
    /不要.{0,12}秒/u.test(text) ||
    /干掉/u.test(text) ||
    /清除/u.test(text)
  )
}

function hasBgmIntent(text: string): boolean {
  return (
    /配乐|背景音乐|背景乐|bgm|加音乐|配音乐|配个乐|配一首|选音乐|选歌/u.test(
      text,
    ) ||
    /好听.*音乐|音乐.*好听|配.*好听|加.*好听/u.test(text) ||
    (/音乐|乐曲|曲子/u.test(text) &&
      /配|加|选|来一|换|推荐|适合/u.test(text))
  )
}

function extractBgmDescription(text: string): string {
  const stripped = text
    .replace(
      /^(请|帮我|给我|把|将)?(给)?(视频|片子|vlog|作品)?(配|加|选|换|来)(一)?(首|段)?/u,
      '',
    )
    .replace(/(好听|合适|一点|一下)的?(音乐|配乐|背景音乐|bgm)/u, '')
    .replace(/(配|加|选).*(音乐|配乐)$/u, '')
    .trim()
  return stripped.length >= 2 ? stripped : text
}

function hasKeepIntent(text: string): boolean {
  return (
    /保留/u.test(text) ||
    /留下/u.test(text) ||
    /只要/u.test(text) ||
    /仅留/u.test(text) ||
    /只留/u.test(text) ||
    /留下.{0,6}段/u.test(text)
  )
}

function parsePlaybackRate(text: string): number | null {
  const explicit = text.match(
    /([零一二两三四五六七八九十\d]+(?:\.\d+)?)\s*倍(?:速)?/u,
  )
  if (explicit) {
    const n = parseNumberToken(explicit[1])
    if (n != null && n > 0) return Math.min(4, Math.max(0.25, n))
  }
  if (/半速|0\.5\s*倍/u.test(text)) return 0.5
  if (/二倍|两倍|双倍|2\s*倍/u.test(text)) return 2
  if (/三倍|3\s*倍/u.test(text)) return 3
  if (/加速|快一点|快点|加快/u.test(text)) return 1.5
  if (/慢放|慢一点|减速/u.test(text)) return 0.75
  if (/倍速|速度/u.test(text)) return 1.5
  return null
}

function parseRotationDegrees(text: string): number {
  const explicit = text.match(
    /([零一二两三四五六七八九十\d]+)\s*度/u,
  )
  if (explicit) {
    const n = parseNumberToken(explicit[1])
    if (n != null && n > 0) return Math.min(360, n)
  }
  if (/九十|九十/u.test(text)) return 90
  if (/一百八十|180/u.test(text)) return 180
  return 90
}

/** 解析旋转方向；未提及方向时返回 null */
function parseRotationDirection(
  text: string,
): 'left' | 'right' | null {
  if (/逆时针|反时针/u.test(text)) return 'left'
  if (/顺时针/u.test(text)) return 'right'

  const leftHint =
    /向左|左转|左旋|往左|朝左|向左旋转|左旋转|旋转左/u.test(text) ||
    (/左/u.test(text) && /旋转|转/u.test(text) && !/右/u.test(text))
  const rightHint =
    /向右|右转|右旋|往右|朝右|向右旋转|右旋转|旋转右/u.test(text) ||
    (/右/u.test(text) && /旋转|转/u.test(text) && !/左/u.test(text))

  if (leftHint && !rightHint) return 'left'
  if (rightHint && !leftHint) return 'right'

  if (leftHint && rightHint) {
    const pivot = text.search(/旋转|转向|转/u)
    const leftAt = text.search(/左/u)
    const rightAt = text.search(/右/u)
    if (leftAt >= 0 && (rightAt < 0 || Math.abs(leftAt - pivot) < Math.abs(rightAt - pivot))) {
      return 'left'
    }
    if (rightAt >= 0) return 'right'
  }

  return null
}

function hasSplitIntent(text: string): boolean {
  if (/转场|过渡/u.test(text)) return false
  return (
    /分割|切开|切一刀|断开|断开点/u.test(text) ||
    (/在.{0,12}秒/u.test(text) &&
      /(切开|分割|切一刀)/u.test(text) &&
      !hasDeleteIntent(text))
  )
}

const FILTER_VOICE_RULES: Array<[RegExp, string]> = [
  [/原图|无滤镜|去掉滤镜/u, 'none'],
  [/暖阳/u, 'warm'],
  [/冷调/u, 'cool'],
  [/清新/u, 'fresh'],
  [/复古/u, 'vintage'],
  [/电影/u, 'cinematic'],
  [/鲜艳/u, 'vivid'],
  [/柔光/u, 'soft'],
  [/黑白/u, 'bw'],
]

const FILTER_LABELS: Record<string, string> = {
  none: '原图',
  warm: '暖阳',
  cool: '冷调',
  fresh: '清新',
  vintage: '复古',
  cinematic: '电影',
  vivid: '鲜艳',
  soft: '柔光',
  bw: '黑白',
}

const EFFECT_LABELS: Record<string, string> = {
  none: '无',
  vignette: '暗角',
  film: '胶片',
  grain: '颗粒',
  light: '光晕',
  dream: '梦幻',
  sparkle: '闪粉',
  snow: '飘雪',
}

const EFFECT_VOICE_RULES: Array<[RegExp, string]> = [
  [/无特效|去掉特效/u, 'none'],
  [/暗角/u, 'vignette'],
  [/胶片/u, 'film'],
  [/颗粒/u, 'grain'],
  [/光晕/u, 'light'],
  [/梦幻/u, 'dream'],
  [/闪粉/u, 'sparkle'],
  [/飘雪|下雪/u, 'snow'],
]

function parseFilterId(text: string): string | null {
  if (!/滤镜|调色|色调|滤镜效果/u.test(text) && !FILTER_VOICE_RULES.some(([re]) => re.test(text))) {
    return null
  }
  for (const [re, id] of FILTER_VOICE_RULES) {
    if (re.test(text)) return id
  }
  if (/滤镜|调色/u.test(text)) return 'soft'
  return null
}

function parseEffectId(text: string): string | null {
  if (!/特效|效果层/u.test(text) && !EFFECT_VOICE_RULES.some(([re]) => re.test(text))) {
    return null
  }
  for (const [re, id] of EFFECT_VOICE_RULES) {
    if (re.test(text)) return id
  }
  if (/特效/u.test(text)) return 'light'
  return null
}

function hasMuteOriginalIntent(text: string): boolean {
  return (
    /静音|关掉原声|关闭原声|不要原声|去掉原声|原声关/u.test(text) ||
    (/原声|人声/u.test(text) && /关|静音|不要|去掉/u.test(text))
  )
}

function hasUnmuteOriginalIntent(text: string): boolean {
  return /打开原声|保留原声|恢复原声|原声开/u.test(text)
}

function hasCropIntent(text: string): boolean {
  return /裁剪|裁切|画面裁剪|重新构图/u.test(text)
}

function hasNarrationIntent(text: string): boolean {
  return /旁白|配音|解说音|口播|读稿|tts/i.test(text)
}

function parseNarrationText(text: string): string {
  const m = text.match(
    /(?:旁白|配音|解说)(?:说|念|读)?[:：]?\s*(.+)$/u,
  )
  return (m?.[1] ?? text).trim()
}

function hasOpenAudioIntent(text: string): boolean {
  return (
    /音频面板|打开音频|选音乐|手动选曲|音乐面板/u.test(text) &&
    !hasBgmIntent(text)
  )
}

function parseTextIntent(text: string): string | null {
  const titleMatch = text.match(
    /(?:帮我做一个|请帮我做一个|生成|写一个|做一个)(.+?)(?:标题|解说|文案|字幕|文字)/u,
  )
  const copyMatch = text.match(
    /(?:帮我写|请帮我写|生成|写一段|做一段)(.+?)(?:解说|文案|旁白|字幕|文字)/u,
  )
  const value = (titleMatch?.[1] ?? copyMatch?.[1] ?? '').trim()
  return value || (titleMatch || copyMatch ? text : null)
}

/** 解析识别文本 → 剪辑指令列表 */
export function parseVoiceCommands(raw: string): ParsedVoiceCommand[] {
  const text = normalizeVoiceTranscript(raw)
  if (!text) return []

  const items: ParsedVoiceCommand[] = []
  const ranges = extractTimeRanges(text)
  const primaryRange = ranges[0]

  const textValue = parseTextIntent(text)
  if (textValue) {
    items.push({
      id: 'text',
      command: 'text',
      label: `文字 · ${textValue.slice(0, 24)}`,
      payload: { text: textValue },
    })
  }

  if (hasBgmIntent(text)) {
    const desc = extractBgmDescription(text)
    items.push({
      id: 'bgm',
      command: 'bgm',
      label: '智能配乐',
      payload: { text: desc },
    })
  }

  const rate = parsePlaybackRate(text)
  if (rate != null) {
    items.push({
      id: 'speed',
      command: 'speed',
      label: `${rate} 倍速`,
      payload: { rate },
    })
  }

  if (hasDeleteIntent(text)) {
    items.push({
      id: 'delete',
      command: 'delete',
      label: primaryRange
        ? `删除 ${primaryRange.start} 到 ${primaryRange.end} 秒`
        : '删除当前片段',
      payload: primaryRange
        ? { start: primaryRange.start, end: primaryRange.end }
        : undefined,
    })
  } else if (hasKeepIntent(text)) {
    const range = primaryRange ?? { start: 0, end: 5 }
    items.push({
      id: 'keepRange',
      command: 'keepRange',
      label: `保留 ${range.start} 到 ${range.end} 秒`,
      payload: { start: range.start, end: range.end },
    })
  }

  if (/(旋转|转向|转一下|左转|右转)/u.test(text)) {
    const degrees = parseRotationDegrees(text)
    const direction = parseRotationDirection(text)
    const delta =
      direction === 'left' ? -degrees : direction === 'right' ? degrees : 90
    const label =
      direction === 'left'
        ? `向左旋转 ${degrees} 度`
        : direction === 'right'
          ? `向右旋转 ${degrees} 度`
          : `顺时针旋转 ${degrees} 度`
    items.push({
      id: 'rotate',
      command: 'rotate',
      label,
      payload: { rotationDelta: delta },
    })
  }

  if (/(镜像|翻转)/u.test(text)) {
    items.push({
      id: 'mirror',
      command: 'mirror',
      label: /左右|水平/u.test(text) ? '左右镜像' : '镜像片段',
    })
  }

  const singleTimes = extractSingleTimes(text)
  const primaryTime = singleTimes[0]

  const voiceTransition = parseVoiceTransitionCommand(text)
  if (voiceTransition) {
    items.push({
      id: voiceTransition.id,
      command: 'transition',
      label: voiceTransition.label,
      payload: {
        time: voiceTransition.payload.joinTime,
        joinIndex: voiceTransition.payload.joinIndex,
        transitionKind: voiceTransition.payload.transitionKind,
        transitionDuration: voiceTransition.payload.transitionDuration,
      },
    })
  }

  if (hasSplitIntent(text) && primaryTime != null) {
    items.push({
      id: `split-${primaryTime}`,
      command: 'split',
      label: `在第 ${primaryTime} 秒分割`,
      payload: { time: primaryTime },
    })
  }

  const filterId = parseFilterId(text)
  if (filterId) {
    const filterName = FILTER_LABELS[filterId] ?? filterId
    items.push({
      id: `filter-${filterId}`,
      command: 'filter',
      label: filterId === 'none' ? '关闭滤镜' : `应用滤镜 · ${filterName}`,
      payload: { filterId },
    })
  }

  const effectId = parseEffectId(text)
  if (effectId) {
    const effectName = EFFECT_LABELS[effectId] ?? effectId
    items.push({
      id: `effect-${effectId}`,
      command: 'effect',
      label: effectId === 'none' ? '关闭特效' : `应用特效 · ${effectName}`,
      payload: { effectId },
    })
  }

  if (hasMuteOriginalIntent(text) && !hasUnmuteOriginalIntent(text)) {
    items.push({
      id: 'mute-original',
      command: 'muteOriginal',
      label: '关闭视频原声',
    })
  } else if (hasUnmuteOriginalIntent(text)) {
    items.push({
      id: 'unmute-original',
      command: 'unmuteOriginal',
      label: '保留视频原声',
    })
  }

  if (hasCropIntent(text)) {
    items.push({
      id: 'crop',
      command: 'crop',
      label: '进入画面裁剪',
    })
  }

  if (hasNarrationIntent(text) && !parseTextIntent(text)) {
    const narrationText = parseNarrationText(text)
    items.push({
      id: 'narration',
      command: 'narration',
      label: '打开 AI 旁白',
      payload: { text: narrationText },
    })
  }

  if (hasOpenAudioIntent(text)) {
    items.push({
      id: 'open-audio',
      command: 'openAudio',
      label: '打开音频面板',
    })
  }

  if (/跳到|跳转|定位到|seek/u.test(text) && primaryTime != null) {
    items.push({
      id: `seek-${primaryTime}`,
      command: 'seek',
      label: `跳转到第 ${primaryTime} 秒`,
      payload: { time: primaryTime },
    })
  }

  return items
}

function commandDedupeKey(item: ParsedVoiceCommand): string {
  switch (item.command) {
    case 'delete':
    case 'keepRange':
      return `${item.command}:${item.payload?.start ?? ''}:${item.payload?.end ?? ''}`
    case 'split':
    case 'seek':
      return `${item.command}:${item.payload?.time ?? ''}`
    case 'speed':
      return `speed:${item.payload?.rate ?? ''}`
    case 'filter':
      return `filter:${item.payload?.filterId ?? ''}`
    case 'effect':
      return `effect:${item.payload?.effectId ?? ''}`
    case 'transition':
      return `transition:${item.payload?.joinIndex ?? item.payload?.time ?? ''}:${item.payload?.transitionKind ?? ''}`
    case 'bgm':
      return `bgm:${item.payload?.text ?? ''}`
    default:
      return item.command
  }
}

/** 合并本地规则与 AI 解析结果：本地精确指令优先，AI 补充未覆盖的意图 */
export function mergeVoiceCommands(
  local: ParsedVoiceCommand[],
  ai: ParsedVoiceCommand[],
): ParsedVoiceCommand[] {
  if (!ai.length) return local
  if (!local.length) return ai

  const merged: ParsedVoiceCommand[] = []
  const seen = new Set<string>()

  for (const item of local) {
    const key = commandDedupeKey(item)
    if (seen.has(key)) continue
    seen.add(key)
    merged.push(item)
  }

  for (const item of ai) {
    const key = commandDedupeKey(item)
    if (seen.has(key)) continue
    seen.add(key)
    merged.push(item)
  }

  return merged
}
