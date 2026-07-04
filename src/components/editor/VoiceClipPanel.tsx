import { Check, Mic, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fetchVoiceCommandsFromAi } from '@/api/voiceParse'
import { EditorToolPanelShell } from '@/components/editor/EditorToolPanelShell'
import {
  hasTextGenerationIntent,
  isFeatureNavigationIntent,
  mapAiErrorMessage,
} from '@/utils/aiInputIntent'
import {
  mergeVoiceCommands,
  normalizeVoiceTranscript,
  parseVoiceCommands,
} from '@/utils/voiceCommandParser'

export type VoiceCommandType =
  | 'speed'
  | 'delete'
  | 'keepRange'
  | 'rotate'
  | 'mirror'
  | 'bgm'
  | 'preset'
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

export type VoiceCommandItem = {
  id: string
  command: VoiceCommandType
  label: string
  payload?: {
    rate?: number
    start?: number
    end?: number
    time?: number
    rotationSteps?: number
    rotationDelta?: number
    text?: string
    filterId?: string
    effectId?: string
    transitionKind?: 'fade' | 'dissolve' | 'wipe'
    transitionDuration?: number
    joinIndex?: number
  }
}

export type StylePresetSuggestion = {
  id: string
  title: string
  filter: string
  effect: string
  hint: string
  keywords: RegExp
}

type TextAISuggestion = {
  title: string
  caption: string
}

const STYLE_PRESET_SUGGESTIONS: StylePresetSuggestion[] = [
  { id: 'daily', title: '日常', filter: '原图', effect: '无', hint: '自然真实，适合普通日常记录', keywords: /(日常|日记|vlog|记录|生活感)/u },
  { id: 'outdoor', title: '户外活动 / 运动', filter: '暖阳', effect: '无', hint: '温暖明亮，适合户外和运动', keywords: /(户外|运动|跑步|骑行|活动|出行|旅行|爬山|徒步)/u },
  { id: 'tech', title: '科技 / 讲解 / 产品', filter: '冷调', effect: '暗角', hint: '干净克制，突出主体和内容信息', keywords: /(科技|讲解|产品|测评|教程|拆解|发布|数码|开箱)/u },
  { id: 'low', title: '低落情绪片', filter: '黑白', effect: '胶片', hint: '情绪化、克制、有回忆感', keywords: /(低落|难过|失落|emo|情绪|回忆|伤感|孤独|安静)/u },
  { id: 'hype', title: '高能片段 / 短视频节奏点', filter: '电影', effect: '暗角', hint: '节奏更集中，适合高光和转折', keywords: /(高能|燃|节奏|卡点|高光|爆点|转场|热血|冲击)/u },
  { id: 'warm', title: '温暖情绪片', filter: '柔光', effect: '光晕', hint: '柔和发亮，适合温柔表达', keywords: /(温暖|治愈|柔和|光晕|温柔|暖心|阳光|甜蜜)/u },
  { id: 'nostalgia', title: '怀旧片', filter: '复古', effect: '胶片', hint: '复古怀旧，适合回忆和故事感', keywords: /(怀旧|复古|回忆|老照片|年代感|往事|旧时光)/u },
  { id: 'creative', title: '创意梦幻', filter: '柔光', effect: '梦幻', hint: '艺术感、梦幻氛围', keywords: /(插画|创意|梦幻|艺术感|抽象)/u },
  { id: 'food', title: '美食探店', filter: '暖阳', effect: '光晕', hint: '暖色调，适合美食与探店内容', keywords: /(美食|探店|吃饭|餐厅|好吃|料理|咖啡)/u },
  { id: 'night', title: '夜景都市', filter: '电影', effect: '暗角', hint: '适合城市夜景与霓虹氛围', keywords: /(夜景|都市|城市|霓虹|深夜|街头)/u },
]

function getStylePresetSuggestion(text: string): StylePresetSuggestion | null {
  return STYLE_PRESET_SUGGESTIONS.find((item) => item.keywords.test(text)) ?? null
}

interface VoiceClipPanelProps {
  busy?: boolean
  onClose: () => void
  onConfirm: () => void
  onApplyCommands?: (commands: VoiceCommandItem[]) => void
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

function mapSpeechRecognitionError(code: string): string {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return '麦克风权限被拒绝，请在地址栏或系统设置中允许本站使用麦克风'
    case 'no-speech':
      return '未检测到语音，请靠近麦克风并提高音量后再试一次'
    case 'network':
      return '语音识别需连接 Google 语音服务（Chrome 内置），请检查网络或换用可访问外网的环境'
    case 'aborted':
      return '识别已中断，请重新点击麦克风'
    case 'audio-capture':
      return '无法打开麦克风，请检查系统是否已连接并授权'
    case 'language-not-supported':
      return '当前环境不支持中文语音识别，请换用 Chrome 桌面版'
    default:
      return code
        ? mapAiErrorMessage(`语音识别失败（${code}）`)
        : '语音识别失败，请重试'
  }
}

function collectTranscriptFromEvent(event: SpeechRecognitionEvent): string {
  let text = ''
  for (let i = 0; i < event.results.length; i += 1) {
    text += event.results[i]?.[0]?.transcript ?? ''
  }
  return text.trim()
}

function createSpeechRecognition(): SpeechRecognition | null {
  if (!SpeechRecognitionCtor) return null
  const recognition = new SpeechRecognitionCtor()
  recognition.lang = 'zh-CN'
  recognition.interimResults = true
  recognition.continuous = true
  recognition.maxAlternatives = 1
  return recognition
}

const VOICE_USAGE_TIPS = [
  '删除：「把 12 到 13 秒删掉」',
  '分割：「在第 8 秒切开」',
  '滤镜/特效：「加柔光滤镜」「加光晕特效」',
  '转场：「第 1 和第 2 段之间加叠化」',
  '原声：「关掉原声」· 倍速：「二倍速」',
]

const EDITABLE_VOICE_COMMANDS = new Set<VoiceCommandType>([
  'speed',
  'delete',
  'keepRange',
  'rotate',
  'mirror',
  'bgm',
  'transition',
  'split',
  'filter',
  'effect',
  'seek',
  'muteOriginal',
  'unmuteOriginal',
  'crop',
  'narration',
  'openAudio',
])

export function VoiceClipPanel({
  busy = false,
  onClose,
  onConfirm,
  onApplyCommands,
  onApplyStylePreset,
  onApplyTextSuggestion,
  textApiEndpoint,
}: VoiceClipPanelProps) {
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [displayedTranscript, setDisplayedTranscript] = useState('')
  const [speechError, setSpeechError] = useState('')
  const [commands, setCommands] = useState<VoiceCommandItem[]>([])
  const [confirmedIds, setConfirmedIds] = useState<string[]>([])
  const [appliedStyleIds, setAppliedStyleIds] = useState<string[]>([])
  const [speechSupported] = useState(Boolean(SpeechRecognitionCtor))
  const [secureContext] = useState(
    () => typeof window === 'undefined' || window.isSecureContext,
  )
  const [waveSeed, setWaveSeed] = useState(0)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const wantRecordingRef = useRef(false)
  const transcriptRef = useRef('')
  transcriptRef.current = transcript
  const [aiCommands, setAiCommands] = useState<VoiceCommandItem[]>([])
  const [aiParsing, setAiParsing] = useState(false)
  const [aiStyleSuggestion, setAiStyleSuggestion] = useState<StylePresetSuggestion | null>(null)

  const localCommands = useMemo(
    () => parseVoiceCommands(transcript) as VoiceCommandItem[],
    [transcript],
  )

  const parsedCommands = useMemo<VoiceCommandItem[]>(() => {
    return mergeVoiceCommands(
      localCommands,
      aiCommands as VoiceCommandItem[],
    ) as VoiceCommandItem[]
  }, [localCommands, aiCommands])

  const normalizedForStyle = useMemo(
    () => normalizeVoiceTranscript(transcript),
    [transcript],
  )

  useEffect(() => {
    const text = normalizeVoiceTranscript(transcript)
    if (text.length < 2) {
      setAiCommands([])
      setAiStyleSuggestion(null)
      setAiParsing(false)
      return
    }

    let cancelled = false
    const controller = new AbortController()
    const abortTimer = window.setTimeout(() => controller.abort(), 20_000)

    const timer = window.setTimeout(() => {
      setAiParsing(true)
      void fetchVoiceCommandsFromAi(text, controller.signal)
        .then(({ commands, style }) => {
          if (cancelled) return
          setAiCommands(commands as VoiceCommandItem[])
          setAiStyleSuggestion(style)
        })
        .catch(() => {
          if (!cancelled) {
            setAiCommands([])
            setAiStyleSuggestion(null)
          }
        })
        .finally(() => {
          window.clearTimeout(abortTimer)
          if (!cancelled) setAiParsing(false)
        })
    }, 500)

    return () => {
      cancelled = true
      controller.abort()
      window.clearTimeout(timer)
      window.clearTimeout(abortTimer)
      setAiParsing(false)
    }
  }, [transcript])

  const [textAiSuggestion, setTextAiSuggestion] = useState<TextAISuggestion | null>(null)
  const [textAiLoading, setTextAiLoading] = useState(false)
  const [textAiError, setTextAiError] = useState('')
  const stylePresetSuggestion = useMemo(() => {
    if (!normalizedForStyle) return null
    return getStylePresetSuggestion(normalizedForStyle) ?? aiStyleSuggestion
  }, [normalizedForStyle, aiStyleSuggestion])
  const isStyleApplied = Boolean(stylePresetSuggestion && appliedStyleIds.includes(stylePresetSuggestion.id))
  const canConfirm =
    confirmedIds.length > 0 || appliedStyleIds.length > 0 || Boolean(stylePresetSuggestion)
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
    if (
      !textApiEndpoint ||
      !input ||
      !hasTextGenerationIntent(input) ||
      isFeatureNavigationIntent(input)
    ) {
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
          setTextAiError(
            mapAiErrorMessage(error instanceof Error ? error.message : 'AI 请求失败'),
          )
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

  useEffect(() => {
    setCommands(parsedCommands)
  }, [parsedCommands])

  const bindRecognitionHandlers = useCallback((recognition: SpeechRecognition) => {
    recognition.onresult = (event) => {
      const text = collectTranscriptFromEvent(event)
      if (text) {
        setTranscript(text)
        setSpeechError('')
      }
    }
    recognition.onend = () => {
      if (wantRecordingRef.current) {
        try {
          recognition.start()
        } catch {
          wantRecordingRef.current = false
          setRecording(false)
        }
        return
      }
      setRecording(false)
    }
    recognition.onerror = (event) => {
      const code = event.error || ''
      if (code === 'no-speech' && transcriptRef.current) return
      if (code !== 'aborted') {
        setSpeechError(mapSpeechRecognitionError(code))
      }
      if (code === 'not-allowed' || code === 'service-not-allowed' || code === 'network') {
        wantRecordingRef.current = false
        setRecording(false)
      }
    }
  }, [])

  useEffect(() => {
    if (!SpeechRecognitionCtor) return
    const recognition = createSpeechRecognition()
    if (!recognition) return
    bindRecognitionHandlers(recognition)
    recognitionRef.current = recognition
    return () => {
      wantRecordingRef.current = false
      recognition.onresult = null
      recognition.onend = null
      recognition.onerror = null
      try {
        recognition.stop()
      } catch {
        /* ignore */
      }
      recognitionRef.current = null
    }
  }, [bindRecognitionHandlers])

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

    if (!speechSupported) {
      setSpeechError('当前浏览器不支持语音识别，请使用 Chrome 或 Edge 桌面版')
      if (!recording && !transcript) {
        setTranscript(
          '识别结果：日常，删除 10 到 12 秒，保留 15 到 20 秒，科技，低落情绪片，怀旧片，高能片段，温暖情绪片，户外活动',
        )
      }
      setRecording((prev) => !prev)
      return
    }

    if (!secureContext) {
      setSpeechError('请用 https:// 或 http://localhost:5173 打开页面，局域网 IP 地址下麦克风识别通常不可用')
      return
    }

    let recognition = recognitionRef.current
    if (!recognition) {
      recognition = createSpeechRecognition()
      if (!recognition) {
        setSpeechError('无法初始化语音识别，请刷新页面后重试')
        return
      }
      bindRecognitionHandlers(recognition)
      recognitionRef.current = recognition
    }

    if (recording) {
      wantRecordingRef.current = false
      try {
        recognition.stop()
      } catch {
        /* ignore */
      }
      setRecording(false)
      return
    }

    setSpeechError('')
    setTranscript('')
    setDisplayedTranscript('')
    wantRecordingRef.current = true
    setRecording(true)
    try {
      recognition.start()
    } catch {
      wantRecordingRef.current = false
      setRecording(false)
      setSpeechError('无法开始录音，请稍等 1 秒后再点麦克风')
    }
  }

  const reset = () => {
    if (busy) return
    wantRecordingRef.current = false
    try {
      recognitionRef.current?.stop()
    } catch {
      /* ignore */
    }
    setRecording(false)
    setTranscript('')
    setDisplayedTranscript('')
    setSpeechError('')
    setCommands([])
    setConfirmedIds([])
    setAppliedStyleIds([])
    setAiCommands([])
    setAiStyleSuggestion(null)
    setAiParsing(false)
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
              void (async () => {
                if (stylePresetSuggestion && !isStyleApplied) {
                  onApplyStylePreset?.(stylePresetSuggestion)
                }
                const selected = commands.filter(
                  (item) =>
                    confirmedIds.includes(item.id) &&
                    EDITABLE_VOICE_COMMANDS.has(item.command),
                )
                if (selected.length > 0) {
                  try {
                    await onApplyCommands?.(selected)
                  } catch (error) {
                    console.error('[voice-apply]', error)
                  }
                }
                onConfirm()
              })()
            }}
            disabled={busy || !canConfirm}
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
                {speechSupported
                  ? secureContext
                    ? '点击麦克风开始说话（需允许麦克风）'
                    : '请用 localhost 打开本页后再试'
                  : '当前浏览器不支持语音识别'}
              </span>
            )}
          </div>
        </div>

        {speechError ? (
          <p className="rounded-[var(--radius-md)] bg-rose-50 px-3 py-2 text-[11px] leading-5 text-rose-600">
            {speechError}
          </p>
        ) : null}

        <div className="rounded-[var(--radius-md)] bg-bg px-3 py-2.5">
          <p className="mb-1 text-[10px] font-medium text-text-muted">识别结果</p>
          <p className="text-xs leading-5 text-text">
            {displayedTranscript || transcript || '识别文本会显示在这里，支持后续剪辑定位。'}
          </p>
          {transcript && normalizedForStyle !== transcript.trim() ? (
            <p className="mt-1.5 text-[10px] leading-5 text-text-muted">
              已纠错：{normalizedForStyle}
            </p>
          ) : null}
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
                  onApplyStylePreset?.(stylePresetSuggestion)
                  setAppliedStyleIds((prev) =>
                    prev.includes(stylePresetSuggestion.id)
                      ? prev
                      : [...prev, stylePresetSuggestion.id],
                  )
                  const styleConfirmId = `style-${stylePresetSuggestion.id}`
                  setConfirmedIds((prev) =>
                    prev.includes(styleConfirmId) ? prev : [...prev, styleConfirmId],
                  )
                }}
                className={`mt-2 rounded-full px-3 py-1 text-[10px] font-medium transition-colors ${
                  isStyleApplied ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-primary text-white hover:bg-primary-dark'
                }`}
              >
                {isStyleApplied ? '已应用' : '应用风格'}
              </button>
            </div>
          ) : (
            <p className="text-xs text-text-muted">
              比如说「海边旅行」「电影感」「怀旧片」。
            </p>
          )}
        </div>

        <div className="rounded-[var(--radius-md)] bg-bg px-3 py-2.5">
          <p className="mb-2 text-[10px] font-medium text-text-muted">文字建议</p>
          {textAiLoading ? (
            <p className="text-xs text-text-muted">正在生成文字建议…</p>
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
            <p className="text-xs text-text-muted">
              比如说「帮我写一个旅行标题」或「生成一段解说文案」。
            </p>
          )}
        </div>

        <div className="rounded-[var(--radius-md)] bg-bg px-3 py-2.5">
          <p className="mb-2 text-[10px] font-medium text-text-muted">剪辑建议</p>
          {aiParsing ? (
            <p className="mb-2 text-[10px] text-primary">正在解析指令…</p>
          ) : null}
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
              <ul className="space-y-1.5 text-[11px] leading-5 text-text-muted">
                {VOICE_USAGE_TIPS.map((tip) => (
                  <li key={tip}>· {tip}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </EditorToolPanelShell>
  )
}
