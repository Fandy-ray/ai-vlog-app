import { Check, Loader2, Pause, Play, Sparkles, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  base64ToAudioBlob,
  fetchTtsEngines,
  fetchTtsVoices,
  synthesizeNarration,
  type TtsEngine,
  type TtsVoice,
} from '@/api/narration'
import {
  getNarrationAudioUrl,
  hasNarrationAudio,
  setNarrationAudioBlob,
} from '@/state/narrationAudio'

interface NarrationPanelProps {
  text: string
  voice: string
  engineId: string
  enabled: boolean
  onTextChange: (value: string) => void
  onVoiceChange: (value: string) => void
  onEngineChange: (value: string) => void
  onEnabledChange: (value: boolean) => void
  onConfirm: () => void
  onClose: () => void
}

export function NarrationPanel({
  text,
  voice,
  engineId,
  enabled,
  onTextChange,
  onVoiceChange,
  onEngineChange,
  onEnabledChange,
  onConfirm,
  onClose,
}: NarrationPanelProps) {
  const [engines, setEngines] = useState<TtsEngine[]>([])
  const [voices, setVoices] = useState<TtsVoice[]>([])
  const [loadingMeta, setLoadingMeta] = useState(true)
  const [synthesizing, setSynthesizing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(hasNarrationAudio())
  const [previewing, setPreviewing] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const engineList = await fetchTtsEngines()
        if (cancelled) return
        setEngines(engineList)
        const voiceList = await fetchTtsVoices(engineId)
        if (cancelled) return
        setVoices(voiceList)
        if (voiceList.length && !voiceList.some((item) => item.id === voice)) {
          onVoiceChange(voiceList[0].id)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : '加载 TTS 配置失败')
        }
      } finally {
        if (!cancelled) setLoadingMeta(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [engineId, onVoiceChange, voice])

  useEffect(() => {
    if (!engines.length) return
    fetchTtsVoices(engineId)
      .then((list) => {
        setVoices(list)
        if (list.length && !list.some((item) => item.id === voice)) {
          onVoiceChange(list[0].id)
        }
      })
      .catch(() => undefined)
  }, [engineId, engines.length, onVoiceChange, voice])

  const stopPreview = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setPreviewing(false)
  }, [])

  useEffect(() => () => stopPreview(), [stopPreview])

  const handleSynthesize = async () => {
    const trimmed = text.trim()
    if (!trimmed) {
      setError('请先输入旁白文案')
      return
    }

    setSynthesizing(true)
    setError(null)
    stopPreview()

    try {
      const result = await synthesizeNarration({
        text: trimmed,
        vcn: voice,
        engineid: engineId,
        speed: 50,
        volume: 55,
      })
      const blob = base64ToAudioBlob(result.audioBase64, result.mimeType)
      setNarrationAudioBlob(blob)
      setReady(true)
      onEnabledChange(true)
    } catch (e) {
      setReady(false)
      setError(
        e instanceof Error
          ? e.message
          : '合成失败，请确认 backend 已启动且配置了 VIVO_APP_KEY',
      )
    } finally {
      setSynthesizing(false)
    }
  }

  const handlePreview = () => {
    const url = getNarrationAudioUrl()
    if (!url) {
      setError('请先生成旁白音频')
      return
    }
    if (previewing) {
      stopPreview()
      return
    }
    const el = new Audio(url)
    audioRef.current = el
    setPreviewing(true)
    el.onended = () => setPreviewing(false)
    el.onerror = () => setPreviewing(false)
    el.play().catch(() => setPreviewing(false))
  }

  return (
    <section className="shrink-0 animate-slide-up border-t border-border/80 bg-surface shadow-[0_-4px_16px_rgb(44_62_80_/4%)]">
      <header className="flex items-center justify-between px-4 pb-2 pt-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-text">AI 旁白</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-[var(--shadow-soft)]"
            aria-label="确定"
          >
            <Check size={18} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:bg-bg"
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      <div className="space-y-3 px-4 pb-4">
        <textarea
          value={text}
          onChange={(e) => {
            setReady(false)
            onTextChange(e.target.value)
          }}
          rows={3}
          placeholder="输入要合成的旁白文案，例如：阳光落在画面里，值得被认真记录。"
          className="w-full resize-none rounded-[var(--radius-md)] border border-border/80 bg-bg px-3 py-2 text-xs text-text outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
        />

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-1 block text-[10px] text-text-muted">引擎</span>
            <select
              value={engineId}
              disabled={loadingMeta}
              onChange={(e) => onEngineChange(e.target.value)}
              className="w-full rounded-[var(--radius-md)] border border-border/80 bg-bg px-2 py-2 text-xs"
            >
              {engines.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] text-text-muted">发音人</span>
            <select
              value={voice}
              disabled={loadingMeta || !voices.length}
              onChange={(e) => onVoiceChange(e.target.value)}
              className="w-full rounded-[var(--radius-md)] border border-border/80 bg-bg px-2 py-2 text-xs"
            >
              {voices.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSynthesize}
            disabled={synthesizing}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-medium text-white disabled:opacity-60"
          >
            {synthesizing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            {synthesizing ? '合成中…' : '生成旁白'}
          </button>
          <button
            type="button"
            onClick={handlePreview}
            disabled={!ready || synthesizing}
            className="inline-flex items-center gap-1 rounded-full border border-border/80 px-3 py-2 text-xs text-text disabled:opacity-50"
          >
            {previewing ? <Pause size={14} /> : <Play size={14} />}
            试听
          </button>
          <label className="ml-auto flex items-center gap-2 text-[10px] text-text-muted">
            <input
              type="checkbox"
              checked={enabled}
              disabled={!ready}
              onChange={(e) => onEnabledChange(e.target.checked)}
            />
            导出时混入
          </label>
        </div>

        {error && <p className="text-[10px] text-red-500">{error}</p>}
        {!error && ready && (
          <p className="text-[10px] text-text-muted">旁白已生成，导出时将混入成片</p>
        )}
      </div>
    </section>
  )
}
