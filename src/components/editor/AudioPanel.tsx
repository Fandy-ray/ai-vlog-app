import { Check, ChevronDown, Pause, Play, Search, Volume2, VolumeX, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { EditorToolPanelShell } from '@/components/editor/EditorToolPanelShell'
import { TimeRangeInputs } from '@/components/editor/TimeRangeInputs'
import { getNetworkAudio, searchNetworkAudios, type NetworkAudio } from '@/data/audioLibrary'
import type { TimeRange } from '@/utils/timeRange'
import { fetchBgmBuffer, getBgmPlayUrls, primeBgmCache } from '@/utils/bgmLoader'

interface AudioPanelProps {
  keepOriginalAudio: boolean
  selectedBgmId: string | null
  originalAudioRange: TimeRange
  bgmRange: TimeRange
  videoDuration: number
  onKeepOriginalChange: (value: boolean) => void
  onBgmSelect: (id: string | null) => void
  onOriginalRangeChange: (range: TimeRange) => void
  onBgmRangeChange: (range: TimeRange) => void
  onConfirm: () => void
  onClose: () => void
}

export function AudioPanel({
  keepOriginalAudio,
  selectedBgmId,
  originalAudioRange,
  bgmRange,
  videoDuration,
  onKeepOriginalChange,
  onBgmSelect,
  onOriginalRangeChange,
  onBgmRangeChange,
  onConfirm,
  onClose,
}: AudioPanelProps) {
  const [query, setQuery] = useState('')
  const [previewingId, setPreviewingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const filteredAudios = useMemo(() => searchNetworkAudios(query), [query])
  const selectedAudio = getNetworkAudio(selectedBgmId)

  const dropdownAudios = useMemo(() => {
    if (!selectedAudio) return filteredAudios
    if (filteredAudios.some((a) => a.id === selectedAudio.id)) return filteredAudios
    return [selectedAudio, ...filteredAudios]
  }, [filteredAudios, selectedAudio])

  const stopPreview = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setPreviewingId(null)
  }, [])

  const playFromUrl = useCallback(
    (audio: NetworkAudio, url: string, urls: string[], index: number) => {
      const el = new Audio(url)
      el.volume = 0.6
      audioRef.current = el
      setPreviewingId(audio.id)
      el.onended = () => setPreviewingId(null)
      el.onerror = () => {
        const next = urls[index + 1]
        if (next) {
          playFromUrl(audio, next, urls, index + 1)
          return
        }
        setPreviewingId(null)
      }
      el.play().catch(() => {
        const next = urls[index + 1]
        if (next) {
          playFromUrl(audio, next, urls, index + 1)
          return
        }
        setPreviewingId(null)
      })
    },
    [],
  )

  const handlePreview = useCallback(
    (audio: NetworkAudio, e: React.MouseEvent) => {
      e.stopPropagation()
      if (previewingId === audio.id) {
        stopPreview()
        return
      }
      stopPreview()
      const urls = getBgmPlayUrls(audio.id)
      playFromUrl(audio, urls[0], urls, 0)
      fetchBgmBuffer(audio.id)
        .then((buffer) => primeBgmCache(audio.id, buffer))
        .catch(() => undefined)
    },
    [previewingId, stopPreview, playFromUrl],
  )

  useEffect(() => () => stopPreview(), [stopPreview])

  return (
    <EditorToolPanelShell
      title="音频"
      headerActions={<PanelActions onConfirm={onConfirm} onClose={onClose} />}
    >
      <div className="mx-4 mb-3 flex items-center justify-between rounded-[var(--radius-md)] bg-bg px-3 py-2.5">
        <div className="flex items-center gap-2">
          {keepOriginalAudio ? (
            <Volume2 size={18} className="text-primary" />
          ) : (
            <VolumeX size={18} className="text-text-muted" />
          )}
          <div>
            <p className="text-xs font-medium text-text">保留视频原声</p>
            <p className="text-[10px] text-text-muted">
              {keepOriginalAudio ? '原声与配乐可同时播放' : '仅播放所选配乐'}
            </p>
          </div>
        </div>
        <ToggleSwitch
          checked={keepOriginalAudio}
          onChange={onKeepOriginalChange}
          ariaLabel="保留视频原声"
        />
      </div>

      <div className="relative mx-4 mb-2">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索配乐名称、风格或场景…"
          className="w-full rounded-full border border-border/80 bg-bg py-2 pl-9 pr-3 text-xs text-text outline-none transition-colors placeholder:text-text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
        />
      </div>

      <div className="relative mx-4 mb-2">
        <select
          value={selectedBgmId ?? ''}
          onChange={(e) => {
            const v = e.target.value
            onBgmSelect(v === '' ? null : v)
          }}
          className="w-full appearance-none rounded-[var(--radius-md)] border border-border bg-bg py-2 pl-3 pr-9 text-xs text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
          aria-label="快速选择配乐"
        >
          <option value="">无配乐</option>
          {dropdownAudios.length === 0 ? (
            <option value="" disabled>
              未找到匹配的音频
            </option>
          ) : (
            dropdownAudios.map((audio) => (
              <option key={audio.id} value={audio.id}>
                {audio.name} · {audio.artist}
              </option>
            ))
          )}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted"
        />
      </div>

      <p className="px-4 pb-1.5 text-[10px] text-text-muted">网络音频库</p>

      <ul className="max-h-[200px] space-y-1 overflow-y-auto px-4 pb-3">
        <li>
          <AudioListItem
            active={selectedBgmId === null}
            title="无配乐"
            subtitle="不添加背景音乐"
            onSelect={() => onBgmSelect(null)}
          />
        </li>
        {filteredAudios.length === 0 ? (
          <li className="py-6 text-center text-xs text-text-muted">未找到匹配的音频</li>
        ) : (
          filteredAudios.map((audio) => (
            <li key={audio.id}>
              <AudioListItem
                active={selectedBgmId === audio.id}
                title={audio.name}
                subtitle={`${audio.artist} · ${audio.duration}`}
                coverFrom={audio.coverFrom}
                coverTo={audio.coverTo}
                isPreviewing={previewingId === audio.id}
                onSelect={() => onBgmSelect(audio.id)}
                onPreview={(e) => handlePreview(audio, e)}
              />
            </li>
          ))
        )}
      </ul>

      <section className="space-y-3 border-t border-border/50 px-4 pb-4 pt-3">
        <div>
          <span className="mb-2 block text-xs font-medium text-text">原声存在时间范围</span>
          <TimeRangeInputs
            range={originalAudioRange}
            videoDuration={videoDuration}
            onChange={onOriginalRangeChange}
            disabled={!keepOriginalAudio}
          />
          {!keepOriginalAudio && (
            <p className="mt-1.5 text-[10px] text-text-muted">
              请先开启「保留视频原声」后再设置存在时间
            </p>
          )}
        </div>
        <div>
          <span className="mb-2 block text-xs font-medium text-text">配乐存在时间范围</span>
          <TimeRangeInputs
            range={bgmRange}
            videoDuration={videoDuration}
            onChange={onBgmRangeChange}
            disabled={selectedBgmId === null}
          />
          {selectedBgmId === null && (
            <p className="mt-1.5 text-[10px] text-text-muted">请先选择配乐后再设置存在时间</p>
          )}
        </div>
      </section>
    </EditorToolPanelShell>
  )
}

function PanelActions({
  onConfirm,
  onClose,
}: {
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <>
      <button
        type="button"
        onClick={onConfirm}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-[var(--shadow-soft)] transition-all hover:bg-primary-dark active:scale-95"
        aria-label="确定"
      >
        <Check size={18} strokeWidth={2.5} />
      </button>
      <button
        type="button"
        onClick={onClose}
        className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg hover:text-text active:scale-95"
        aria-label="取消"
      >
        <X size={18} />
      </button>
    </>
  )
}

function ToggleSwitch({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-border'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

function AudioListItem({
  active,
  title,
  subtitle,
  coverFrom,
  coverTo,
  isPreviewing,
  onSelect,
  onPreview,
}: {
  active: boolean
  title: string
  subtitle: string
  coverFrom?: string
  coverTo?: string
  isPreviewing?: boolean
  onSelect: () => void
  onPreview?: (e: React.MouseEvent) => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-[var(--radius-md)] px-2 py-2 text-left transition-colors active:scale-[0.99] ${
        active ? 'bg-primary/10 ring-1 ring-primary/40' : 'hover:bg-bg'
      }`}
    >
      {coverFrom && coverTo ? (
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
          style={{ background: `linear-gradient(135deg, ${coverFrom}, ${coverTo})` }}
        >
          {active && <Check size={14} className="text-white drop-shadow" strokeWidth={3} />}
        </span>
      ) : (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-track-video text-[10px] text-text-muted">
          无
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-xs ${active ? 'font-medium text-primary' : 'text-text'}`}
        >
          {title}
        </span>
        <span className="block truncate text-[10px] text-text-muted">{subtitle}</span>
      </span>
      {onPreview && (
        <span
          role="button"
          tabIndex={0}
          onClick={onPreview}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onPreview(e as unknown as React.MouseEvent)
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg text-primary transition-colors hover:bg-primary/10 active:scale-95"
          aria-label={isPreviewing ? '停止试听' : '试听'}
        >
          {isPreviewing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </span>
      )}
    </button>
  )
}
