import {
  ArrowLeft,
  Download,
  Music2,
  Pause,
  Play,
  RefreshCw,
  Sparkles,
  Flower2,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { PageShell } from '@/components/PageShell'
import { Toast } from '@/components/Toast'
import {
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
import { formatDurationMs, formatTime } from '@/utils/formatTime'
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
  const [videoError, setVideoError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveGuideOpen, setSaveGuideOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
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

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoUrl) return
    setVideoError(false)
    const onTime = () => {
      if (video.duration && Number.isFinite(video.duration)) {
        setProgress(video.currentTime / video.duration)
      }
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    video.addEventListener('timeupdate', onTime)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    void video.play().catch(() => {})
    return () => {
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
    }
  }, [videoUrl])

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
                controls
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

            <div className="absolute left-4 bottom-4 right-4">
              {narration && (
                <p className="line-clamp-2 text-sm font-semibold text-white drop-shadow">
                  {narration}
                </p>
              )}
              {isDirector && generated?.ai?.stitchNote && (
                <p className="mt-1 text-[10px] text-white/70">{generated.ai.stitchNote}</p>
              )}
            </div>
          </div>
        </article>


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
            {saving ? '下载成片' : '下载成片'}
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
          <Button
            variant="outline"
            size="lg"
            fullWidth
            icon={<Flower2 size={18} />}
            onClick={() => navigate('/create')}
            className="h-12 rounded-2xl bg-white text-text shadow-sm"
          >
            加入记忆花园
          </Button>
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
