import { Check, Mic, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { EditorToolPanelShell } from '@/components/editor/EditorToolPanelShell'

interface VoiceClipPanelProps {
  busy?: boolean
  onClose: () => void
  onConfirm: () => void
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

export function VoiceClipPanel({ busy = false, onClose, onConfirm }: VoiceClipPanelProps) {
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [displayedTranscript, setDisplayedTranscript] = useState('')
  const [confirmed, setConfirmed] = useState<string[]>([])
  const [speechSupported] = useState(Boolean(SpeechRecognitionCtor))
  const [waveSeed, setWaveSeed] = useState(0)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const suggestions = useMemo(
    () => [
      '删除静音片段，保留口播高能部分',
      '在停顿处切镜头，让节奏更紧凑',
      '保留前 3 秒原声，后半段切入音乐',
    ],
    [],
  )

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
        setTranscript('识别结果：我想把这里的静音删掉，然后保留前面这段口播')
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
    setConfirmed([])
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
            onClick={onConfirm}
            disabled={busy}
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
            {suggestions.map((item) => {
              const isConfirmed = confirmed.includes(item)
              return (
                <div key={item} className="flex items-start gap-2 rounded-[12px] bg-white px-2.5 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-5 text-text">{item}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfirmed((prev) => (prev.includes(item) ? prev : [...prev, item]))}
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                      isConfirmed ? 'bg-emerald-100 text-emerald-700' : 'bg-primary text-white'
                    }`}
                  >
                    {isConfirmed ? '已确认' : '确认'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </EditorToolPanelShell>
  )
}
