import { Check, Mic, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { EditorToolPanelShell } from '@/components/editor/EditorToolPanelShell'

type VoiceCommandType = 'speed' | 'delete' | 'keepRange' | 'rotate' | 'mirror'

type VoiceCommandItem = {
  id: string
  command: VoiceCommandType
  label: string
  payload?: { rate?: number; start?: number; end?: number; rotationSteps?: number }
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

export function VoiceClipPanel({ busy = false, onClose, onConfirm, onApplyCommands, onToggleCommand }: VoiceClipPanelProps) {
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [displayedTranscript, setDisplayedTranscript] = useState('')
  const [commands, setCommands] = useState<VoiceCommandItem[]>([])
  const [confirmedIds, setConfirmedIds] = useState<string[]>([])
  const [appliedIds, setAppliedIds] = useState<string[]>([])
  const [speechSupported] = useState(Boolean(SpeechRecognitionCtor))
  const [waveSeed, setWaveSeed] = useState(0)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const parsedCommands = useMemo<VoiceCommandItem[]>(() => {
    if (!transcript) return []
    const text = transcript.replace(/^识别结果[:：\s]*/u, '').trim()
    const items: VoiceCommandItem[] = []
    const rateMatch = text.match(/([零一二两三四五六七八九十\d]+(?:\.\d+)?)\s*倍/u)
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
      const rangeLabel = rangeMatch ? `删除 ${rangeMatch.start} 到 ${rangeMatch.end} 秒` : '删除片段'
      items.push({
        id: 'delete',
        command: 'delete',
        label: rangeLabel,
        payload: rangeMatch ? { start: rangeMatch.start, end: rangeMatch.end } : undefined,
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
        setTranscript('识别结果：把这段速度调成 1.5 倍，然后删除 10 到 12 秒，保留 15 到 20 秒，向右旋转并镜像')
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
