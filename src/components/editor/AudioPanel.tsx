import { Check, ChevronDown, Pause, Play, Search, Sparkles, Volume2, VolumeX, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { EditorToolPanelShell } from '@/components/editor/EditorToolPanelShell'
import { TimeRangeInputs } from '@/components/editor/TimeRangeInputs'
import {
  getNetworkAudio,
  hasCuratedAudios,
  searchNetworkAudios,
  type NetworkAudio,
} from '@/data/audioLibrary'
import {
  analyzeMusicApi,
  getMusicAnalyzeStatusLabel,
  type MusicAnalyzeSource,
} from '@/api/musicAnalyze'
import type { BgmRecommendCriteria, BgmRecommendResult } from '@/utils/bgmRecommend'
import { mockAnalyzeVlogDescription, recommendNetworkAudios } from '@/utils/bgmRecommend'
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
  const [vlogDescription, setVlogDescription] = useState('')
  const [vlogType, setVlogType] = useState('旅行')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzeSource, setAnalyzeSource] = useState<MusicAnalyzeSource | null>(null)
  const [analyzeReason, setAnalyzeReason] = useState<string | null>(null)
  const [recommendCriteria, setRecommendCriteria] = useState<BgmRecommendCriteria | null>(null)
  const [recommendResults, setRecommendResults] = useState<BgmRecommendResult[]>([])
  const [hasRecommended, setHasRecommended] = useState(false)
  const [smartRecommendOpen, setSmartRecommendOpen] = useState(true)
  const [showDemoTracks, setShowDemoTracks] = useState(false)
  const [previewingId, setPreviewingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const curatedReady = hasCuratedAudios()
  const filteredAudios = useMemo(
    () => searchNetworkAudios(query, { includeDemoTracks: showDemoTracks || !curatedReady }),
    [query, showDemoTracks, curatedReady],
  )
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

  const handleSmartRecommend = useCallback(async () => {
    setIsAnalyzing(true)
    setAnalyzeSource(null)
    setAnalyzeReason(null)

    let criteria: BgmRecommendCriteria
    let source: MusicAnalyzeSource = 'fallback'
    let reason: string | null = null

    try {
      const data = await analyzeMusicApi({
        description: vlogDescription,
        vlogType,
      })
      criteria = data.criteria
      source = data.source
      reason = data.reason
    } catch (err) {
      criteria = mockAnalyzeVlogDescription(vlogDescription)
      source = 'fallback'
      reason =
        err instanceof Error ? err.message : '无法连接分析服务，请确认后端已启动且 Vite 代理正常'
    }

    const results = recommendNetworkAudios(criteria)
    setRecommendCriteria(criteria)
    setRecommendResults(results)
    setHasRecommended(true)
    setAnalyzeSource(source)
    setAnalyzeReason(reason)
    setSmartRecommendOpen(true)
    setIsAnalyzing(false)
  }, [vlogDescription, vlogType])

  const analyzeStatusLabel = getMusicAnalyzeStatusLabel(analyzeSource, {
    loading: isAnalyzing,
  })

  const handleApplyRecommend = useCallback(
    (id: string) => {
      onBgmSelect(id)
      setSmartRecommendOpen(false)
    },
    [onBgmSelect],
  )

  const smartRecommendSubtitle = useMemo(() => {
    if (smartRecommendOpen || isAnalyzing) return null

    const appliedFromRecommend =
      selectedBgmId != null &&
      recommendResults.some((r) => r.audio.id === selectedBgmId)
    if (appliedFromRecommend && selectedAudio) {
      return `已选 ${selectedAudio.name}`
    }
    if (hasRecommended && recommendResults.length > 0) {
      return `已推荐 ${recommendResults.length} 首，点击展开`
    }
    return null
  }, [
    smartRecommendOpen,
    selectedBgmId,
    selectedAudio,
    recommendResults,
    hasRecommended,
    isAnalyzing,
  ])

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

      <section className="mx-4 mb-3 overflow-hidden rounded-[var(--radius-md)] border border-border/60 bg-bg/30">
        <p className="border-b border-border/50 px-3 py-2 text-xs font-medium text-text">选曲</p>

        <div className="border-b border-border/40">
          <button
            type="button"
            onClick={() => setSmartRecommendOpen((open) => !open)}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-bg/80"
            aria-expanded={smartRecommendOpen}
          >
            <Sparkles size={14} className="shrink-0 text-primary" />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-text">智能推荐</span>
                <span
                  className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                    analyzeSource === 'ai'
                      ? 'bg-primary/15 text-primary'
                      : analyzeSource === 'fallback'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-bg text-text-muted'
                  }`}
                >
                  {analyzeStatusLabel}
                </span>
              </span>
              {smartRecommendSubtitle && (
                <span className="block truncate text-[10px] text-text-muted">
                  {smartRecommendSubtitle}
                </span>
              )}
            </span>
            <ChevronDown
              size={16}
              className={`shrink-0 text-text-muted transition-transform ${
                smartRecommendOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {smartRecommendOpen && (
            <div className="space-y-2 border-t border-border/30 bg-bg/50 px-3 pb-3 pt-2">
              <div className="flex gap-2">
                <label className="sr-only" htmlFor="vlog-type-select">
                  Vlog 类型
                </label>
                <select
                  id="vlog-type-select"
                  value={vlogType}
                  onChange={(e) => setVlogType(e.target.value)}
                  disabled={isAnalyzing}
                  className="w-24 shrink-0 rounded-[var(--radius-md)] border border-border/80 bg-white px-2 py-2 text-xs text-text outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 disabled:opacity-60"
                >
                  <option value="旅行">旅行</option>
                  <option value="日常">日常</option>
                  <option value="美食">美食</option>
                  <option value="街拍">街拍</option>
                  <option value="其他">其他</option>
                </select>
                <textarea
                  value={vlogDescription}
                  onChange={(e) => setVlogDescription(e.target.value)}
                  disabled={isAnalyzing}
                  placeholder="描述你的 Vlog，例如：海边旅行、朋友出游、轻松治愈…"
                  rows={2}
                  className="min-w-0 flex-1 resize-none rounded-[var(--radius-md)] border border-border/80 bg-white px-3 py-2 text-xs text-text outline-none transition-colors placeholder:text-text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/15 disabled:opacity-60"
                />
              </div>
              <button
                type="button"
                onClick={() => void handleSmartRecommend()}
                disabled={isAnalyzing}
                className="w-full rounded-full bg-primary py-2 text-xs font-medium text-white shadow-[var(--shadow-soft)] transition-all hover:bg-primary-dark active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAnalyzing ? '分析中…' : '开始推荐'}
              </button>
              {hasRecommended && recommendCriteria && (
                <p className="text-[10px] leading-relaxed text-text-muted">
                  <span
                    className={
                      analyzeSource === 'ai' ? 'font-medium text-primary' : 'font-medium text-amber-800'
                    }
                  >
                    {analyzeSource === 'ai' ? 'AI 分析' : '本地回退'}
                  </span>
                  ：{recommendCriteria.mood.join('、')} · {recommendCriteria.tags.join('、')} · BPM{' '}
                  {recommendCriteria.bpmRange[0]}–{recommendCriteria.bpmRange[1]}
                  {analyzeSource === 'fallback' && analyzeReason && (
                    <span className="block text-[10px] text-amber-700/90">原因：{analyzeReason}</span>
                  )}
                </p>
              )}
              {hasRecommended && recommendResults.length > 0 && (
                <ul className="max-h-[112px] space-y-1.5 overflow-y-auto py-0.5">
                  {recommendResults.map(({ audio, matchHints }) => (
                    <li key={audio.id}>
                      <RecommendListItem
                        audio={audio}
                        matchHints={matchHints}
                        active={selectedBgmId === audio.id}
                        isPreviewing={previewingId === audio.id}
                        onUse={() => handleApplyRecommend(audio.id)}
                        onPreview={(e) => handlePreview(audio, e)}
                      />
                    </li>
                  ))}
                </ul>
              )}
              {hasRecommended && recommendResults.length === 0 && (
                <p className="text-center text-[10px] text-text-muted">暂无匹配配乐，请调整描述后重试</p>
              )}
            </div>
          )}
        </div>

        <div className="px-3 pt-2">
          <div className="relative mb-2">
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

          {!curatedReady && (
            <div className="mb-2 rounded-[var(--radius-md)] border border-amber-200/80 bg-amber-50/90 px-2.5 py-2 text-[10px] leading-relaxed text-amber-900">
              <p className="font-medium">还没有精选配乐</p>
              <p className="mt-0.5">
                1. 打开{' '}
                <a
                  href="https://mixkit.co/free-stock-music/"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  Mixkit
                </a>{' '}
                按场景下载 MP3 → 2. 放进项目{' '}
                <code className="rounded bg-white/80 px-1">public/audio/</code> → 3. 在{' '}
                <code className="rounded bg-white/80 px-1">src/data/audioLibrary.ts</code> 的{' '}
                <code className="rounded bg-white/80 px-1">CURATED_LOCAL</code> 里加一条（见{' '}
                <code className="rounded bg-white/80 px-1">public/audio/README.md</code>）
              </p>
            </div>
          )}
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <p className="text-[10px] text-text-muted">
              {curatedReady ? '精选配乐' : '开发示例曲（临时）'}
            </p>
            {curatedReady && (
              <label className="flex cursor-pointer items-center gap-1 text-[10px] text-text-muted">
                <input
                  type="checkbox"
                  checked={showDemoTracks}
                  onChange={(e) => setShowDemoTracks(e.target.checked)}
                  className="h-3 w-3 rounded border-border"
                />
                显示示例曲
              </label>
            )}
          </div>
        </div>

        <ul className="max-h-[128px] space-y-1.5 overflow-y-auto px-3 py-0.5 pb-2">
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
      </section>

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

function RecommendListItem({
  audio,
  matchHints,
  active,
  isPreviewing,
  onUse,
  onPreview,
}: {
  audio: NetworkAudio
  matchHints: string[]
  active: boolean
  isPreviewing: boolean
  onUse: () => void
  onPreview: (e: React.MouseEvent) => void
}) {
  const meta = [
    audio.mood.join('、'),
    audio.tags.slice(0, 3).join('、'),
    `BPM ${audio.bpm}`,
    audio.scene,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div
      className={`box-border flex w-full min-w-0 items-center gap-2 overflow-hidden rounded-[var(--radius-md)] border px-2 py-2 ${
        active
          ? 'border-primary/50 bg-primary/10'
          : 'border-transparent bg-white/80'
      }`}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
        style={{
          background: `linear-gradient(135deg, ${audio.coverFrom}, ${audio.coverTo})`,
        }}
      />
      <div className="min-w-0 flex-1">
        <p className={`truncate text-xs ${active ? 'font-medium text-primary' : 'text-text'}`}>
          {audio.name}
        </p>
        <p className="truncate text-[10px] text-text-muted">{meta}</p>
        {matchHints.length > 0 && (
          <p className="truncate text-[10px] text-primary/80">{matchHints.join(' · ')}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onPreview}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bg text-primary transition-colors hover:bg-primary/10 active:scale-95"
        aria-label={isPreviewing ? '停止试听' : '试听'}
      >
        {isPreviewing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
      </button>
      <button
        type="button"
        onClick={onUse}
        className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-[10px] font-medium text-white transition-colors hover:bg-primary-dark active:scale-95"
      >
        使用
      </button>
    </div>
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
      className={`box-border flex w-full min-w-0 items-center gap-3 rounded-[var(--radius-md)] border px-2 py-2 text-left transition-colors ${
        active
          ? 'border-primary/50 bg-primary/10'
          : 'border-transparent hover:bg-bg'
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
