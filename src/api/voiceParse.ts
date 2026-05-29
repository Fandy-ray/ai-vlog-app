import type { ParsedVoiceCommand } from '@/utils/voiceCommandParser'

type AiCommandRow = {
  type?: string
  start?: number
  end?: number
  time?: number
  rate?: number
  direction?: string
  text?: string
  filterId?: string
  effectId?: string
  transition?: string
  transitionDuration?: number
}

function mapAiCommands(rows: AiCommandRow[]): ParsedVoiceCommand[] {
  const items: ParsedVoiceCommand[] = []
  for (const row of rows) {
    const type = String(row.type || '').toLowerCase()
    if (type === 'delete' && row.start != null && row.end != null) {
      items.push({
        id: `ai-delete-${row.start}-${row.end}`,
        command: 'delete',
        label: `删除 ${row.start} 到 ${row.end} 秒`,
        payload: { start: Number(row.start), end: Number(row.end) },
      })
    } else if (type === 'keep' && row.start != null && row.end != null) {
      items.push({
        id: `ai-keep-${row.start}-${row.end}`,
        command: 'keepRange',
        label: `保留 ${row.start} 到 ${row.end} 秒`,
        payload: { start: Number(row.start), end: Number(row.end) },
      })
    } else if (type === 'speed' && row.rate != null) {
      const rate = Number(row.rate)
      items.push({
        id: `ai-speed-${rate}`,
        command: 'speed',
        label: `${rate} 倍速`,
        payload: { rate },
      })
    } else if (type === 'rotate') {
      const left = String(row.direction || '').toLowerCase().includes('left')
      const degrees =
        row.rate != null && Number(row.rate) > 0 ? Number(row.rate) : 90
      const delta = left ? -degrees : degrees
      items.push({
        id: 'ai-rotate',
        command: 'rotate',
        label: left ? `向左旋转 ${degrees} 度` : `向右旋转 ${degrees} 度`,
        payload: { rotationDelta: delta },
      })
    } else if (type === 'mirror') {
      items.push({
        id: 'ai-mirror',
        command: 'mirror',
        label: '镜像片段',
      })
    } else if (type === 'bgm' || type === 'music') {
      items.push({
        id: 'ai-bgm',
        command: 'bgm',
        label: '智能配乐',
        payload: { text: String(row.text || '') },
      })
    } else if (type === 'transition') {
      const time = row.time ?? row.start
      const raw = String(row.transition || 'fade').toLowerCase()
      const kind =
        raw.includes('dissolve') || raw.includes('叠化')
          ? 'dissolve'
          : raw.includes('wipe') || raw.includes('划')
            ? 'wipe'
            : 'fade'
      items.push({
        id: `ai-transition-${time ?? 'head'}`,
        command: 'transition',
        label:
          time != null
            ? `在第 ${time} 秒添加转场`
            : '在播放头添加转场',
        payload: {
          time: time != null ? Number(time) : undefined,
          transitionKind: kind,
          transitionDuration:
            row.transitionDuration != null
              ? Number(row.transitionDuration)
              : undefined,
        },
      })
    } else if (type === 'split' && (row.time != null || row.start != null)) {
      const time = Number(row.time ?? row.start)
      items.push({
        id: `ai-split-${time}`,
        command: 'split',
        label: `在第 ${time} 秒分割`,
        payload: { time },
      })
    } else if (type === 'filter') {
      const filterId = String(row.filterId || row.text || 'soft')
      items.push({
        id: `ai-filter-${filterId}`,
        command: 'filter',
        label: `应用滤镜 · ${filterId}`,
        payload: { filterId },
      })
    } else if (type === 'effect') {
      const effectId = String(row.effectId || row.text || 'light')
      items.push({
        id: `ai-effect-${effectId}`,
        command: 'effect',
        label: `应用特效 · ${effectId}`,
        payload: { effectId },
      })
    } else if (type === 'seek' && (row.time != null || row.start != null)) {
      const time = Number(row.time ?? row.start)
      items.push({
        id: `ai-seek-${time}`,
        command: 'seek',
        label: `跳转到第 ${time} 秒`,
        payload: { time },
      })
    } else if (type === 'mute' || type === 'muteoriginal') {
      items.push({
        id: 'ai-mute',
        command: 'muteOriginal',
        label: '关闭视频原声',
      })
    } else if (type === 'unmute' || type === 'unmuteoriginal') {
      items.push({
        id: 'ai-unmute',
        command: 'unmuteOriginal',
        label: '保留视频原声',
      })
    } else if (type === 'crop') {
      items.push({
        id: 'ai-crop',
        command: 'crop',
        label: '进入画面裁剪',
      })
    } else if (type === 'narration') {
      items.push({
        id: 'ai-narration',
        command: 'narration',
        label: '打开 AI 旁白',
        payload: { text: String(row.text || '') },
      })
    } else if (type === 'audio' || type === 'openaudio') {
      items.push({
        id: 'ai-open-audio',
        command: 'openAudio',
        label: '打开音频面板',
      })
    }
  }
  return items
}

/** 本地规则未命中时，用蓝心 Chat 理解自然语言指令（需后端） */
export async function fetchVoiceCommandsFromAi(
  text: string,
): Promise<ParsedVoiceCommand[]> {
  const res = await fetch('/api/voice/parse-commands', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ text }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.message || 'AI 解析指令失败')
  }
  const rows = (data?.data?.commands ?? []) as AiCommandRow[]
  return mapAiCommands(rows)
}
