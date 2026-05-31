import {
  ArrowLeft,
  Download,
  Music2,
  Pause,
  Play,
  RefreshCw,
  Sparkles,
  Flower2,
  Wand2,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { PageShell } from '@/components/PageShell'
import { Toast } from '@/components/Toast'
import {
  LAST_COMPLETE_FLOW_KEY,
  STUDIO_EXPORT_RESULT_KEY,
  type ProjectFlow,
  type StudioExportResult,
} from '@/constants/projectFlow'
import { COMPLETE_VIDEO } from '@/data/recommendations'
import { useToast } from '@/hooks/useToast'
import { getExportedVideo } from '@/state/exportedVideo'
import { hasStudioEditorProject } from '@/state/importedProject'
import type { VlogGenerateManifest, VlogGenerateResult } from '@/types/vlogGenerate'
import {
  VLOG_GENERATE_MANIFEST_KEY,
  VLOG_GENERATE_RESULT_KEY,
} from '@/types/vlogGenerate'
import { getDirectorStyleId, getDirectorType } from '@/utils/vlogDirectorStore'
import { exportAllClipsForRegenerate } from '@/utils/vlogMaterialStore'
import { formatDurationMs, formatTime, clamp } from '@/utils/formatTime'
import { SaveToPhotosGuide } from '@/components/SaveToPhotosGuide/SaveToPhotosGuide'
import { resolveMediaUrl } from '@/utils/resolveMediaUrl'
import { downloadVideo, isLikelyIOS, shareVideoForPhotos } from '@/utils/saveVideo'

function loadGenerateResult(): VlogGenerateResult | null {
  try {
    const raw = sessionStorage.getItem(VLOG_GENERATE_RESULT_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as VlogGenerateResult
    return {
      ...data,
      videoUrl: resolveMediaUrl(data.videoUrl),
      coverUrl: resolveMediaUrl(data.coverUrl),
    }
  } catch {
    return null
  }
}

function loadStudioExport(): StudioExportResult | null {
  try {
    const raw = sessionStorage.getItem(STUDIO_EXPORT_RESULT_KEY)
    if (raw) {
      const data = JSON.parse(raw) as StudioExportResult
      return {
        ...data,
        videoUrl: resolveMediaUrl(data.videoUrl) || data.videoUrl,
        coverUrl: resolveMediaUrl(data.coverUrl) || data.coverUrl,
      }
    }
  } catch {
    /* ignore */
  }

  const exported = getExportedVideo()
  if (!exported?.url) return null
  return {
    title: exported.title || '我的 Vlog',
    videoUrl: exported.url,
    coverUrl: exported.posterUrl,
    durationSec: exported.duration,
  }
}

function resolvePageFlow(locationState: unknown): ProjectFlow {
  const fromState = (locationState as { flow?: ProjectFlow })?.flow
  if (fromState === 'studio' || fromState === 'director') return fromState
  try {
    const lastFlow = sessionStorage.getItem(LAST_COMPLETE_FLOW_KEY)
    if (lastFlow === 'studio' && sessionStorage.getItem(STUDIO_EXPORT_RESULT_KEY)) {
      return 'studio'
    }
    if (lastFlow === 'director' && sessionStorage.getItem(VLOG_GENERATE_RESULT_KEY)) {
      return 'director'
    }
    if (sessionStorage.getItem(STUDIO_EXPORT_RESULT_KEY)) return 'studio'
    if (sessionStorage.getItem(VLOG_GENERATE_RESULT_KEY)) return 'director'
  } catch {
    /* ignore */
  }
  if (getExportedVideo()?.url) return 'studio'
  return 'director'
}

export function CompletePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const flow = useMemo(
    () => resolvePageFlow(location.state),
    [location.state],
  )
  const isDirector = flow === 'director'

  const { message, show, visible } = useToast()
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [scrubbing, setScrubbing] = useState(false)
  const [videoDuration, setVideoDuration] = useState(0)
  const [videoError, setVideoError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveGuideOpen, setSaveGuideOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [studioExport] = useState(() =>
    flow === 'studio' ? loadStudioExport() : null,
  )
  const [generated] = useState(() =>
    flow === 'director' ? loadGenerateResult() : null,
  )
  const [regenerating, setRegenerating] = useState(false)

  const title = isDirector
    ? (generated?.title ?? COMPLETE_VIDEO.title)
    : (studioExport?.title ?? COMPLETE_VIDEO.title)
  const narration = isDirector
    ? generated?.ttsNarration || generated?.narration
    : undefined
  const videoUrl = isDirector ? generated?.videoUrl : studioExport?.videoUrl
  const coverUrl = isDirector
    ? generated?.coverUrl || COMPLETE_VIDEO.cover
    : studioExport?.coverUrl || COMPLETE_VIDEO.cover
  const durationLabel = useMemo(() => {
    if (isDirector && generated?.timeline?.length) {
      const sec = generated.timeline.reduce((s, t) => s + t.duration, 0)
      return formatDurationMs(sec * 1000)
    }
    if (!isDirector && studioExport?.durationSec) {
      return formatTime(studioExport.durationSec)
    }
    return COMPLETE_VIDEO.duration
  }, [generated, isDirector, studioExport?.durationSec])

  const pageTitle = isDirector ? 'AI 成片预览' : '成片预览'
  const savedToGarden =
    !isDirector &&
    ((location.state as { savedToGarden?: boolean } | null)?.savedToGarden ??
      true)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoUrl) return
    setVideoError(false)
    setProgress(0)
    setVideoDuration(0)
    const onTime = () => {
      if (scrubbing) return
      if (video.duration && Number.isFinite(video.duration)) {
        setProgress(video.currentTime / video.duration)
      }
    }
    const onMeta = () => {
      if (video.duration && Number.isFinite(video.duration)) {
        setVideoDuration(video.duration)
      }
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    video.addEventListener('timeupdate', onTime)
    video.addEventListener('loadedmetadata', onMeta)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    onMeta()
    void video.play().catch(() => {})
    return () => {
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('loadedmetadata', onMeta)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
    }
  }, [videoUrl, scrubbing])

  const seekRatioFromClientX = useCallback((clientX: number) => {
    const el = progressRef.current
    if (!el) return 0
    const { left, width } = el.getBoundingClientRect()
    if (width <= 0) return 0
    return clamp((clientX - left) / width, 0, 1)
  }, [])

  const seekToRatio = useCallback(
    (ratio: number) => {
      const video = videoRef.current
      if (!video || !videoUrl || videoError) return
      const duration = video.duration && Number.isFinite(video.duration)
        ? video.duration
        : videoDuration
      if (!duration) return
      const next = ratio * duration
      video.currentTime = next
      setProgress(ratio)
    },
    [videoDuration, videoError, videoUrl],
  )

  const handleProgressPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      const bar = e.currentTarget
      bar.setPointerCapture(e.pointerId)
      setScrubbing(true)
      seekToRatio(seekRatioFromClientX(e.clientX))

      const onMove = (ev: PointerEvent) => {
        seekToRatio(seekRatioFromClientX(ev.clientX))
      }
      const onUp = () => {
        setScrubbing(false)
        bar.releasePointerCapture(e.pointerId)
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
      }
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [seekRatioFromClientX, seekToRatio],
  )

  const playbackDurationSec =
    videoDuration > 0
      ? videoDuration
      : !isDirector && studioExport?.durationSec
        ? studioExport.durationSec
        : 0
  const currentTimeSec = playbackDurationSec * progress
  const progressTimeLabel =
    playbackDurationSec > 0
      ? `${formatTime(currentTimeSec)}/${formatTime(playbackDurationSec)}`
      : durationLabel

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video || !videoUrl || videoError) return
    if (playing) {
      video.pause()
    } else {
      void video.play().catch(() => {
        setVideoError(true)
        show('无法播放视频，请尝试保存到相册后查看')
      })
    }
  }, [playing, videoUrl, videoError, show])

  const filename = `${title || 'vlog'}.mp4`

  const runSaveToPhotos = useCallback(async () => {
    if (!videoUrl) return
    setSaving(true)
    try {
      if (isLikelyIOS()) {
        await shareVideoForPhotos(videoUrl, filename)
      } else {
        await downloadVideo(videoUrl, filename)
        show('已开始下载，请在下载文件夹中查看')
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        show('保存失败，请确认网络正常后重试')
      }
    } finally {
      setSaving(false)
      setSaveGuideOpen(false)
    }
  }, [videoUrl, filename, show])

  const handleSaveClick = useCallback(() => {
    if (!videoUrl) {
      show('暂无成片视频')
      return
    }
    if (isLikelyIOS()) {
      setSaveGuideOpen(true)
    } else {
      void runSaveToPhotos()
    }
  }, [videoUrl, show, runSaveToPhotos])

  const handleRegenerate = useCallback(async () => {
    if (!isDirector) return
    setRegenerating(true)
    try {
      const clips = await exportAllClipsForRegenerate()
      if (!clips.length) {
        show('本地没有素材，请回到清单重新拍摄或导入')
        navigate('/vlog-learn')
        return
      }
      let manifest: VlogGenerateManifest = {
        type: getDirectorType(),
        style: generated?.effects?.colorGrade || getDirectorStyleId(),
        scenes: clips.map((c) => ({
          clipId: c.id,
          sceneId: c.sceneId,
          sceneTitle: c.name.replace(/\.mp4$/, ''),
          duration: c.duration,
        })),
      }
      try {
        const raw = sessionStorage.getItem(VLOG_GENERATE_MANIFEST_KEY)
        if (raw) manifest = { ...manifest, ...JSON.parse(raw) }
      } catch {
        /* use default */
      }
      navigate('/vlog-learn/generate', { state: { clips, manifest } })
    } catch {
      show('无法读取本地素材')
    } finally {
      setRegenerating(false)
    }
  }, [generated?.effects?.colorGrade, isDirector, navigate, show])

  return (
    <PageShell scrollable className="pb-0">
      <header className="sticky top-0 z-10 flex items-center bg-bg/90 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface active:scale-95"
          aria-label="返回"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="flex-1 text-center text-[15px] font-semibold text-text">
          {pageTitle}
        </h1>
        <span className="w-9" />
      </header>

      <section className="flex-1 px-4 pb-4">
        <h2 className="mb-3 text-left text-[18px] font-semibold text-text">
          {title}
        </h2>

        <article className="relative mb-5 overflow-hidden rounded-[28px] bg-black shadow-[var(--shadow-card)]">
          <div className="relative aspect-[16/10] w-full bg-black sm:aspect-[16/9]">
            {videoUrl && !videoError ? (
              <video
                ref={videoRef}
                key={videoUrl}
                src={videoUrl}
                playsInline
                muted={false}
                preload="metadata"
                className="h-full w-full object-cover"
                onEnded={() => setPlaying(false)}
                onError={() => setVideoError(true)}
              />
            ) : (
              <img
                src={coverUrl}
                alt={title}
                className="h-full w-full object-cover"
                draggable={false}
              />
            )}
            {videoError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 px-4 text-center">
                <p className="text-xs text-white/90">
                  预览加载失败。请点下方「保存相册」，在系统分享里选「存储视频」查看。
                </p>
              </div>
            )}
            {!videoError && (
              <span
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent"
                aria-hidden
              />
            )}

            {isDirector && generated?.effects && !videoError && (
              <div className="absolute left-3 top-3 z-20 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-black/50 px-2 py-0.5 text-[9px] text-white/90 backdrop-blur">
                  {generated.effects.transition} 转场
                </span>
                <span className="rounded-full bg-black/50 px-2 py-0.5 text-[9px] text-white/90 backdrop-blur">
                  {generated.effects.colorGrade} 调色
                </span>
              </div>
            )}

            {videoUrl && !videoError && (
              <button
                type="button"
                onClick={togglePlay}
                className="absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-transform active:scale-90"
                aria-label={playing ? '暂停' : '播放'}
              >
                {playing ? (
                  <Pause size={24} fill="white" />
                ) : (
                  <Play size={24} fill="white" className="ml-1" />
                )}
              </button>
            )}

            <div className="absolute bottom-4 left-4 right-4 z-10">
              {narration && (
                <p className="line-clamp-2 text-sm font-semibold text-white drop-shadow">
                  {narration}
                </p>
              )}
              {isDirector && generated?.ai?.stitchNote && (
                <p className="mt-1 text-[10px] text-white/70">{generated.ai.stitchNote}</p>
              )}
              {videoUrl && !videoError && (
                <div className="mt-2 flex items-center gap-2">
                  <div
                    ref={progressRef}
                    role="slider"
                    aria-label="播放进度"
                    aria-valuemin={0}
                    aria-valuemax={Math.round(playbackDurationSec)}
                    aria-valuenow={Math.round(currentTimeSec)}
                    aria-valuetext={`${formatTime(currentTimeSec)} / ${formatTime(playbackDurationSec)}`}
                    className="group relative flex h-5 flex-1 cursor-pointer touch-none items-center"
                    onPointerDown={handleProgressPointerDown}
                  >
                    <div className="relative h-1 w-full rounded-full bg-white/30">
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full bg-white ${
                          scrubbing ? '' : 'transition-[width] duration-75'
                        }`}
                        style={{ width: `${progress * 100}%` }}
                      />
                      <div
                        className={`absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white shadow ${
                          scrubbing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                        style={{ left: `calc(${progress * 100}% - 6px)` }}
                      />
                    </div>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-white/80">
                    {progressTimeLabel}
                  </span>
                </div>
              )}
            </div>
          </div>
        </article>

        {isDirector && generated?.director && (
          <section className="mb-4 rounded-[var(--radius-lg)] bg-gradient-to-br from-primary/8 to-surface p-4 shadow-[var(--shadow-card)] ring-1 ring-primary/10">
            <p className="text-xs font-semibold text-primary">AI 导演 · 故事线</p>
            {generated.director.videoTitle && (
              <p className="mt-1 text-sm font-semibold text-text">
                片头：{generated.director.videoTitle}
              </p>
            )}
            {generated.director.storyArc && (
              <ul className="mt-2 space-y-1 text-[10px] leading-relaxed text-text-secondary">
                {generated.director.storyArc.opening && (
                  <li>开场 - {generated.director.storyArc.opening}</li>
                )}
                {generated.director.storyArc.climax && (
                  <li>高潮 - {generated.director.storyArc.climax}</li>
                )}
                {generated.director.storyArc.resolve && (
                  <li>收束 - {generated.director.storyArc.resolve}</li>
                )}
              </ul>
            )}
            {generated.director.chapters?.length ? (
              <p className="mt-2 text-[10px] text-text-muted">
                情绪章节：
                {generated.director.chapters.map((c) => c.name || c.mood).join(' / ')}
              </p>
            ) : null}
          </section>
        )}

        {isDirector && (generated?.effects?.hasTts || generated?.bgm) && (
          <section className="mb-4 flex items-center gap-3 rounded-[var(--radius-lg)] bg-surface p-3 shadow-[var(--shadow-card)]">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Music2 size={20} />
            </span>
            <div className="min-w-0 flex-1">
              {generated.effects?.hasTts ? (
                <>
                  <p className="text-xs font-semibold text-text">AI 配音 · vivo TTS</p>
                  <p className="line-clamp-3 text-[10px] text-text-muted">
                    {narration || '已根据旁白文案合成语音'}
                    {generated?.ttsNarration ? '（与配音一致）' : ''}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-semibold text-text">
                    BGM · {generated.bgm?.title}
                  </p>
                  <p className="text-[10px] text-text-muted">
                    {generated.bgm?.artist} · {generated.bgm?.bpm} BPM ·{' '}
                    {generated.bgm?.mood}
                  </p>
                </>
              )}
            </div>
            {(generated.effects?.hasTts || generated.effects?.hasBgm) && (
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium text-emerald-600">
                已混入成片
              </span>
            )}
          </section>
        )}

        {isDirector && generated?.analysis && (
          <section className="mb-4 rounded-[var(--radius-lg)] bg-surface p-3 shadow-[var(--shadow-card)]">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles size={14} className="text-primary" />
              <h3 className="text-xs font-semibold text-text">AI 镜头分析</h3>
            </div>
            <p className="mb-2 text-[11px] text-text-secondary">
              {generated.analysis.summary}
            </p>
            <ul className="space-y-1.5">
              {generated.analysis.clips
                .filter((c) => c.selected)
                .slice(0, 4)
                .map((c) => (
                  <li
                    key={c.sceneId}
                    className="flex items-center justify-between text-[10px] text-text-muted"
                  >
                    <span>
                      {c.sceneTitle} · {c.shotType}
                    </span>
                    <span className="font-medium text-accent">{c.qualityScore} 分</span>
                  </li>
                ))}
            </ul>
          </section>
        )}

        {isDirector && generated?.timeline && generated.timeline.length > 0 && (
          <section className="mb-5 rounded-[var(--radius-lg)] bg-surface p-3 shadow-[var(--shadow-card)]">
            <h3 className="mb-2 text-xs font-semibold text-text">AI 剪辑时间轴</h3>
            <ol className="space-y-2">
              {generated.timeline.map((item) => (
                <li key={item.order} className="text-[11px] text-text-secondary">
                  <span className="font-medium text-text">{item.shotTitle}</span>
                  <span className="text-text-muted"> · {item.materialName}</span>
                  {item.caption && (
                    <span className="mt-0.5 block text-text-muted">
                      字幕：{item.caption}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}

        {!isDirector && (
          <p className="mb-5 text-center text-xs text-text-muted">
            {savedToGarden
              ? '本片已自动存入记忆花园，可在「记忆花园」中随时回看。'
              : '本片由你在「开始智能创作」中导入的本地视频剪辑导出；若未出现在记忆花园，请重新导出一次。'}
          </p>
        )}

        <section className="grid grid-cols-2 gap-3">
          <Button
            variant="accent"
            size="lg"
            fullWidth
            icon={<Download size={18} />}
            disabled={!videoUrl || saving}
            onClick={handleSaveClick}
            className="h-12 rounded-2xl"
          >
            {saving ? '下载中…' : '下载成片'}
          </Button>
          <Button
            variant="outline"
            size="lg"
            fullWidth
            icon={<span className="text-lg leading-none">↗</span>}
            disabled={!videoUrl}
            onClick={handleSaveClick}
            className="h-12 rounded-2xl bg-white text-text shadow-sm"
          >
            分享
          </Button>
          {isDirector ? (
            <>
              <Button
                variant="soft"
                size="lg"
                fullWidth
                icon={<RefreshCw size={18} />}
                disabled={regenerating}
                onClick={() => void handleRegenerate()}
                className="h-12 rounded-2xl"
              >
                {regenerating ? '准备中…' : '重新生成'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                fullWidth
                icon={<Wand2 size={18} />}
                onClick={() => navigate('/vlog-learn')}
                className="h-12 rounded-2xl bg-white text-text shadow-sm"
              >
                返回拍摄清单
              </Button>
            </>
          ) : (
            <>
              {hasStudioEditorProject() && (
                <Button
                  variant="soft"
                  size="lg"
                  fullWidth
                  icon={<span className="text-lg leading-none">✂</span>}
                  onClick={() => navigate('/editor')}
                  className="h-12 rounded-2xl"
                >
                  继续剪辑
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
                fullWidth
                icon={<Flower2 size={18} />}
                onClick={() => navigate('/garden')}
                className="h-12 rounded-2xl bg-white text-text shadow-sm"
              >
                查看记忆花园
              </Button>
              <Button
                variant="soft"
                size="lg"
                fullWidth
                className="col-span-2 h-12 rounded-2xl"
                onClick={() => navigate('/create')}
              >
                再导入一组视频
              </Button>
            </>
          )}
        </section>

        <section className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-text-muted">你可能还喜欢</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[
              { title: '治愈旅行风', subtitle: '轻松配乐 · 慢节奏', cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop' },
              { title: '城市漫步', subtitle: '街景转场 · 文艺字幕', cover: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300&h=200&fit=crop' },
              { title: '海边日记', subtitle: '清新滤镜 · 浪花音效', cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=200&fit=crop' },
            ].map((item) => (
              <article key={item.title} className="w-[160px] shrink-0 overflow-hidden rounded-[22px] bg-white shadow-[var(--shadow-card)]">
                <div className="aspect-[4/3] bg-black">
                  <img src={item.cover} alt={item.title} className="h-full w-full object-cover" />
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-text">{item.title}</p>
                  <p className="mt-1 text-[11px] text-text-muted">{item.subtitle}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      <SaveToPhotosGuide
        open={saveGuideOpen}
        saving={saving}
        onClose={() => setSaveGuideOpen(false)}
        onConfirm={() => void runSaveToPhotos()}
      />

      <Toast message={message} visible={visible} />
    </PageShell>
  )
}
