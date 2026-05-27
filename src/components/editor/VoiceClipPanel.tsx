import { Check, Mic, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { EditorToolPanelShell } from '@/components/editor/EditorToolPanelShell'

type VoiceCommandType = 'speed' | 'delete' | 'keepRange' | 'rotate' | 'mirror' | 'preset' | 'text'

type VoiceCommandItem = {
  id: string
  command: VoiceCommandType
  label: string
  payload?: { rate?: number; start?: number; end?: number; rotationSteps?: number; text?: string }
}

type TextAISuggestion = {
  title: string
  caption: string
}

type StylePresetSuggestion = {
  id: string
  title: string
  filter: string
  effect: string
  hint: string
  keywords: RegExp
}

const STYLE_PRESET_SUGGESTIONS: StylePresetSuggestion[] = [
  { id: 'daily', title: '日常', filter: '原图', effect: '无', hint: '自然真实，适合普通日常记录', keywords: /(日常|日记|vlog|记录)/u },
  { id: 'outdoor', title: '户外活动 / 运动', filter: '暖阳', effect: '无', hint: '温暖明亮，适合户外和运动', keywords: /(户外|运动|跑步|骑行|活动|出行|旅行)/u },
  { id: 'tech', title: '科技 / 讲解 / 产品', filter: '冷调', effect: '暗角', hint: '干净克制，突出主体和内容信息', keywords: /(科技|讲解|产品|测评|教程|拆解|发布)/u },
  { id: 'low', title: '低落情绪片', filter: '黑白', effect: '胶片', hint: '情绪化、克制、有回忆感', keywords: /(低落|难过|失落|emo|情绪|回忆|伤感)/u },
  { id: 'hype', title: '高能片段 / 短视频节奏点', filter: '电影', effect: '暗角', hint: '节奏更集中，适合高光和转折', keywords: /(高能|燃|节奏|卡点|高光|爆点|转场)/u },
  { id: 'warm', title: '温暖情绪片', filter: '柔光', effect: '光晕', hint: '柔和发亮，适合温柔表达', keywords: /(温暖|治愈|柔和|光晕|温柔|暖心)/u },
  { id: 'nostalgia', title: '怀旧片', filter: '复古', effect: '胶片', hint: '复古怀旧，适合回忆和故事感', keywords: /(怀旧|复古|回忆|老照片|年代感|往事)/u },
]

function getStylePresetSuggestion(text: string): StylePresetSuggestion | null {
  return STYLE_PRESET_SUGGESTIONS.find((item) => item.keywords.test(text)) ?? null
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

function parseNumberToken(token: string): number | null {
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
    return normalized.split('').reduce((sum, ch) => sum * 10 + (CHINESE_DIGIT_MAP[ch] ?? 0), 0)
  }
  return null
}

function parseRangeTokens(text: string): { start: number; end: number } | null {
  const match = text.match(/([零一二两三四五六七八九十\d]+)\s*(?:到|[-–—~至])\s*([零一二两三四五六七八九十\d]+)/u)
  if (!match) return null
  const start = parseNumberToken(match[1])
  const end = parseNumberToken(match[2])
  if (start == null || end == null) return null
  return { start, end }
}

interface VoiceClipPanelProps {
  busy?: boolean
  onClose: () => void
  onConfirm: () => void
  onApplyCommands?: (
    commands: VoiceCommandItem[],
  ) => void
  onToggleCommand?: (
    command: VoiceCommandType,
    payload?: { rate?: number; start?: number; end?: number; rotationSteps?: number },
    enabled?: boolean,
  ) => void
  onApplyStylePreset?: (preset: StylePresetSuggestion) => void
  onApplyTextSuggestion?: (suggestion: TextAISuggestion) => void
  textApiEndpoint?: string
}

const SpeechRecognitionCtor =
  typeof window !== 'undefined'
    ? ((window as typeof window & {
        webkitSpeechRecognition?: typeof SpeechRecognition
        SpeechRecognition?: typeof SpeechRecognition
      }).SpeechRecognition ??
      (window as typeof window & {
        webkitSpeechRecognition?: typeof SpeechRecognition
        SpeechRecognition?: typeof SpeechRecognition
      }).webkitSpeechRecognition)
    : undefined

export function VoiceClipPanel({ busy = false, onClose, onConfirm, onApplyCommands, onToggleCommand, onApplyStylePreset, onApplyTextSuggestion, textApiEndpoint }: VoiceClipPanelProps) {
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [displayedTranscript, setDisplayedTranscript] = useState('')
  const [commands, setCommands] = useState<VoiceCommandItem[]>([])
  const [confirmedIds, setConfirmedIds] = useState<string[]>([])
  const [appliedIds, setAppliedIds] = useState<string[]>([])
  const [appliedStyleIds, setAppliedStyleIds] = useState<string[]>([])
  const [speechSupported] = useState(Boolean(SpeechRecognitionCtor))
  const [waveSeed, setWaveSeed] = useState(0)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const parsedCommands = useMemo<VoiceCommandItem[]>(() => {
    if (!transcript) return []
    const text = transcript.replace(/^识别结果[:：\s]*/u, '').trim()
    const items: VoiceCommandItem[] = []
    const rateMatch = text.match(/([零一二两三四五六七八九十\d]+(?:\.\d+)?)\s*倍/u)
    const titleMatch = text.match(/(?:帮我做一个|请帮我做一个|生成|写一个|做一个)(.+?)(?:标题|解说|文案|字幕|文字)/u)
    const copyMatch = text.match(/(?:帮我写|请帮我写|生成|写一段|做一段)(.+?)(?:解说|文案|旁白|字幕|文字)/u)
    if (titleMatch || copyMatch) {
      const textValue = (titleMatch?.[1] ?? copyMatch?.[1] ?? '').trim()
      items.push({
        id: 'text',
        command: 'text',
        label: textValue ? `文字 · ${textValue}` : '文字内容',
        payload: { text: textValue || text },
      })
    }
    if (/(倍速|加速|慢放|速度)/u.test(text)) {
      const rate = rateMatch ? String(parseNumberToken(rateMatch[1]) ?? 1.5) : '1.5'
      items.push({
        id: 'speed',
        command: 'speed',
        label: `${rate} 倍速`,
        payload: { rate: Number(rate) },
      })
    }
    const rangeMatch = parseRangeTokens(text)
    if (/(删除|删掉|移除|去掉)/u.test(text)) {
      const start = rangeMatch?.start ?? 0
      const end = rangeMatch?.end ?? 0
      items.push({
        id: 'split-start-delete',
        command: 'delete',
        label: rangeMatch ? `删除 ${start} 到 ${end} 秒` : '删除片段',
        payload: rangeMatch ? { start, end } : undefined,
      })
    }
    if (/(保留|保留.*?到|保留.*?时间段)/u.test(text)) {
      const start = rangeMatch?.start ?? 15
      const end = rangeMatch?.end ?? 20
      items.push({
        id: 'keepRange',
        command: 'keepRange',
        label: `保留 ${start} 到 ${end} 秒`,
        payload: { start, end },
      })
    }
    if (/(旋转|转向|向左转|向右转|向左旋转|向右旋转)/u.test(text)) {
      const isLeft = /向左转|向左旋转/u.test(text)
      const isRight = /向右转|向右旋转/u.test(text)
      const label = isLeft ? '向左旋转' : isRight ? '向右旋转' : '旋转片段'
      items.push({
        id: 'rotate',
        command: 'rotate',
        label,
        payload: { rotationSteps: isLeft ? 3 : 1 },
      })
    }
    if (/(镜像|翻转)/u.test(text)) {
      const label = /左右|水平/u.test(text) ? '左右镜像' : '镜像片段'
      items.push({ id: 'mirror', command: 'mirror', label })
    }
    return items
  }, [transcript])

  const [textAiSuggestion, setTextAiSuggestion] = useState<TextAISuggestion | null>(null)
  const [textAiLoading, setTextAiLoading] = useState(false)
  const [textAiError, setTextAiError] = useState('')
  const stylePresetSuggestion = useMemo(() => {
    if (!transcript) return null
    const text = transcript.replace(/^识别结果[:：\s]*/u, '').trim()
    return getStylePresetSuggestion(text)
  }, [transcript])
  const isStyleApplied = Boolean(stylePresetSuggestion && appliedStyleIds.includes(stylePresetSuggestion.id))
  const textSuggestion = useMemo(() => {
    if (!textAiSuggestion) return null
    return {
      id: 'text-ai',
      title: textAiSuggestion.title,
      body: textAiSuggestion.caption,
      hint: '点确认后会把 AI 生成的标题和文案应用到视频',
    }
  }, [textAiSuggestion])

  useEffect(() => {
    const input = transcript.replace(/^识别结果[:：\s]*/u, '').trim()
    if (!textApiEndpoint || !input) {
      setTextAiSuggestion(null)
      setTextAiError('')
      setTextAiLoading(false)
      return
    }
    let cancelled = false
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setTextAiLoading(true)
      setTextAiError('')
      try {
        const response = await fetch(textApiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify({ input }),
          signal: controller.signal,
        })
        const data = await response.json()
        const title = String(data?.data?.title ?? data?.title ?? '').trim()
        const caption = String(data?.data?.caption ?? data?.caption ?? '').trim()
        if (!cancelled && title && caption) {
          setTextAiSuggestion({ title, caption })
        } else if (!cancelled) {
          setTextAiSuggestion(null)
          setTextAiError('AI 未返回有效的标题/文案')
        }
      } catch (error) {
        if (!cancelled) {
          setTextAiSuggestion(null)
          setTextAiError(error instanceof Error ? error.message : 'AI 请求失败')
        }
      } finally {
        if (!cancelled) setTextAiLoading(false)
      }
    }, 450)
    return () => {
      cancelled = true
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [textApiEndpoint, transcript])

  const suggestions = useMemo(
    () => [
      '删除静音片段，保留口播高能部分',
      '在停顿处切镜头，让节奏更紧凑',
      '保留前 3 秒原声，后半段切入音乐',
    ],
    [],
  )

  useEffect(() => {
    setCommands(parsedCommands)
  }, [parsedCommands])

  useEffect(() => {
    const Recognition = SpeechRecognitionCtor
    if (!Recognition) return
    const recognition = new Recognition()
    recognition.lang = 'zh-CN'
    recognition.interimResults = true
    recognition.continuous = true
    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? '')
        .join('')
        .trim()
      if (text) setTranscript(text)
    }
    recognition.onend = () => {
      setRecording(false)
    }
    recognition.onerror = () => {
      setRecording(false)
    }
    recognitionRef.current = recognition
    return () => {
      recognition.stop()
      recognitionRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!recording) return
    const id = window.setInterval(() => setWaveSeed((prev) => prev + 1), 160)
    return () => window.clearInterval(id)
  }, [recording])

  useEffect(() => {
    if (!transcript) {
      setDisplayedTranscript('')
      return
    }
    setDisplayedTranscript('')
    let index = 0
    const id = window.setInterval(() => {
      index += 1
      setDisplayedTranscript(transcript.slice(0, index))
      if (index >= transcript.length) {
        window.clearInterval(id)
      }
    }, 25)
    return () => window.clearInterval(id)
  }, [transcript])

  const toggleRecording = () => {
    if (busy) return
    const recognition = recognitionRef.current
    if (!speechSupported || !recognition) {
      if (!recording && !transcript) {
        setTranscript('识别结果：日常，删除 10 到 12 秒，保留 15 到 20 秒，科技，低落情绪片，怀旧片，高能片段，温暖情绪片，户外活动')
      }
      setRecording((prev) => !prev)
      return
    }
    if (recording) {
      recognition.stop()
      setRecording(false)
      return
    }
    setTranscript('')
    setDisplayedTranscript('')
    setRecording(true)
    recognition.start()
  }

  const reset = () => {
    if (busy) return
    recognitionRef.current?.stop()
    setRecording(false)
    setTranscript('')
    setDisplayedTranscript('')
    setCommands([])
    setConfirmedIds([])
    setAppliedIds([])
  }

  return (
    <EditorToolPanelShell
      title="语音剪辑"
      headerActions={
        <>
          <button
            type="button"
            onClick={reset}
            disabled={busy}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="撤销"
          >
            <Trash2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              const selected = commands.filter((item) => confirmedIds.includes(item.id))
              if (selected.length > 0) {
                onApplyCommands?.(selected)
              }
              setAppliedIds(confirmedIds)
              onConfirm()
            }}
            disabled={busy || confirmedIds.length === 0}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-[var(--shadow-soft)] transition-all hover:bg-primary-dark active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="确认"
          >
            <Check size={18} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg hover:text-text active:scale-95"
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </>
      }
    >
      <div className="space-y-3 px-4 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleRecording}
            disabled={busy}
            className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
              recording ? 'bg-rose-500 text-white' : 'bg-primary text-white'
            } disabled:cursor-not-allowed disabled:opacity-60`}
            aria-label={recording ? '停止收音' : '开始收音'}
          >
            <Mic size={16} />
            {recording && (
              <span className="absolute inset-0 rounded-full border border-white/70" />
            )}
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            {recording && speechSupported ? (
              <>
                {Array.from({ length: 6 }).map((_, index) => (
                  <span
                    key={`${waveSeed}-${index}`}
                    className="w-1 rounded-full bg-primary"
                    style={{
                      height: `${10 + ((waveSeed + index * 7) % 14)}px`,
                      opacity: 0.45 + ((waveSeed + index) % 4) * 0.12,
                    }}
                  />
                ))}
              </>
            ) : (
              <span className="text-[10px] text-text-muted">
                {speechSupported ? '点击麦克风开始说话' : '当前浏览器不支持语音识别'}
              </span>
            )}
          </div>
        </div>

        <div className="rounded-[var(--radius-md)] bg-bg px-3 py-2.5">
          <p className="mb-1 text-[10px] font-medium text-text-muted">识别结果</p>
          <p className="text-xs leading-5 text-text">
            {displayedTranscript || transcript || '识别文本会显示在这里，支持后续剪辑定位。'}
          </p>
        </div>

        <div className="rounded-[var(--radius-md)] bg-bg px-3 py-2.5">
          <p className="mb-2 text-[10px] font-medium text-text-muted">风格建议</p>
          {stylePresetSuggestion ? (
            <div className="rounded-[12px] bg-white px-3 py-2.5">
              <p className="text-xs font-medium text-text">{stylePresetSuggestion.title}</p>
              <p className="mt-0.5 text-[10px] leading-5 text-text-secondary">
                滤镜：{stylePresetSuggestion.filter} · 特效：{stylePresetSuggestion.effect}
              </p>
              <p className="mt-0.5 text-[10px] leading-5 text-text-muted">{stylePresetSuggestion.hint}</p>
              <button
                type="button"
                onClick={() => {
                  setAppliedStyleIds((prev) => (prev.includes(stylePresetSuggestion.id) ? prev : [...prev, stylePresetSuggestion.id]))
                }}
                className={`mt-2 rounded-full px-3 py-1 text-[10px] font-medium transition-colors ${
                  isStyleApplied ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-primary text-white hover:bg-primary-dark'
                }`}
              >
                {isStyleApplied ? '已应用' : '应用风格'}
              </button>
            </div>
          ) : (
            <p className="text-xs text-text-muted">说出“日常 / 科技 / 怀旧片”等词，会自动展示对应滤镜和特效。</p>
          )}
        </div>

        <div className="rounded-[var(--radius-md)] bg-bg px-3 py-2.5">
          <p className="mb-2 text-[10px] font-medium text-text-muted">文字建议</p>
          {textAiLoading ? (
            <p className="text-xs text-text-muted">AI 正在生成文字建议…</p>
          ) : textSuggestion ? (
            <div className="rounded-[12px] bg-white px-3 py-2.5">
              <p className="text-xs font-medium text-text">标题：{textSuggestion.title}</p>
              <p className="mt-0.5 text-[10px] leading-5 text-text-secondary">文案：{textSuggestion.body}</p>
              <p className="mt-0.5 text-[10px] leading-5 text-text-muted">{textSuggestion.hint}</p>
              <button
                type="button"
                onClick={() => {
                  onApplyTextSuggestion?.({ title: textSuggestion.title, caption: textSuggestion.body })
                  setConfirmedIds((prev) => (prev.includes(textSuggestion.id) ? prev : [...prev, textSuggestion.id]))
                }}
                className={`mt-2 rounded-full px-3 py-1 text-[10px] font-medium transition-colors ${
                  confirmedIds.includes(textSuggestion.id) ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-primary text-white hover:bg-primary-dark'
                }`}
              >
                {confirmedIds.includes(textSuggestion.id) ? '已确认' : '确认'}
              </button>
            </div>
          ) : textAiError ? (
            <p className="text-xs text-rose-500">{textAiError}</p>
          ) : (
            <p className="text-xs text-text-muted">比如说“帮我做一个旅行标题”或“帮我写一个解说文案”。</p>
          )}
        </div>

        <div className="rounded-[var(--radius-md)] bg-bg px-3 py-2.5">
          <p className="mb-2 text-[10px] font-medium text-text-muted">剪辑建议</p>
          <div className="space-y-2.5 max-h-[26vh] overflow-y-auto pr-1">
            {commands.length > 0 ? (
              commands.map((item) => {
                const isConfirmed = confirmedIds.includes(item.id)
                return (
                  <div key={item.id} className="flex items-start gap-2 rounded-[12px] bg-white px-2.5 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs leading-5 text-text">{item.label}</p>
                      <p className="mt-0.5 text-[10px] text-text-muted">点确认后会应用到视频，点已确认可取消</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmedIds((prev) => {
                          const isOn = prev.includes(item.id)
                          return isOn ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                        })
                      }}
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                        isConfirmed ? 'bg-emerald-100 text-emerald-700' : 'bg-primary text-white'
                      }`}
                    >
                      {isConfirmed ? '已确认' : '确认'}
                    </button>
                  </div>
                )
              })
            ) : (
              suggestions.map((item) => {
                const isConfirmed = confirmedIds.includes(item)
                return (
                  <div key={item} className="flex items-start gap-2 rounded-[12px] bg-white px-2.5 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs leading-5 text-text">{item}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirmedIds((prev) => (prev.includes(item) ? prev : [...prev, item]))}
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                        isConfirmed ? 'bg-emerald-100 text-emerald-700' : 'bg-primary text-white'
                      }`}
                    >
                      {isConfirmed ? '已确认' : '确认'}
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </EditorToolPanelShell>
  )
}
