import {
  ArrowLeft,
  Download,
  Music2,
  Pause,
  Play,
  RefreshCw,
  Sparkles,
  Wand2,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { PageShell } from '@/components/PageShell'
import { Toast } from '@/components/Toast'
import { COMPLETE_VIDEO } from '@/data/recommendations'
import { useToast } from '@/hooks/useToast'
import type { VlogGenerateManifest, VlogGenerateResult } from '@/types/vlogGenerate'
import {
  VLOG_GENERATE_MANIFEST_KEY,
  VLOG_GENERATE_RESULT_KEY,
} from '@/types/vlogGenerate'
import { getDirectorStyleId, getDirectorType } from '@/utils/vlogDirectorStore'
import { exportAllClipsForRegenerate } from '@/utils/vlogMaterialStore'
import { formatDurationMs } from '@/utils/formatTime'
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

export function CompletePage() {
  const navigate = useNavigate()
  const { message, show, visible } = useToast()
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [videoError, setVideoError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveGuideOpen, setSaveGuideOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [generated] = useState(loadGenerateResult)
  const [regenerating, setRegenerating] = useState(false)

  const title = generated?.title ?? COMPLETE_VIDEO.title
  const narration = generated?.ttsNarration || generated?.narration
  const videoUrl = generated?.videoUrl
  const coverUrl = generated?.coverUrl || COMPLETE_VIDEO.cover
  const durationLabel = useMemo(() => {
    if (generated?.timeline?.length) {
      const sec = generated.timeline.reduce((s, t) => s + t.duration, 0)
      return formatDurationMs(sec * 1000)
    }
    return COMPLETE_VIDEO.duration
  }, [generated])

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
  }, [generated?.effects?.colorGrade, navigate, show])

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
        <h1 className="flex-1 text-center text-[15px] font-semibold text-text">AI 成片预览</h1>
        <span className="w-9" />
      </header>

      <section className="flex-1 px-4 pb-4">
        <article className="relative mb-5 overflow-hidden rounded-[var(--radius-2xl)] bg-black shadow-[var(--shadow-card)]">
          {videoUrl && !videoError ? (
            <video
              ref={videoRef}
              key={videoUrl}
              src={videoUrl}
              playsInline
              muted={false}
              controls
              preload="metadata"
              className="aspect-[9/16] max-h-[min(70vh,520px)] w-full bg-black object-contain"
              onEnded={() => setPlaying(false)}
              onError={() => setVideoError(true)}
            />
          ) : (
            <img
              src={coverUrl}
              alt={title}
              className="aspect-video w-full object-cover"
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
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
              aria-hidden
            />
          )}


          {generated?.effects && !videoError && (
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

          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
            <h2 className="text-lg font-bold text-white drop-shadow">{title}</h2>
            {narration && (
              <p className="mt-1 line-clamp-2 text-xs text-white/90 drop-shadow">{narration}</p>
            )}
            {generated?.ai?.stitchNote && (
              <p className="mt-1 text-[10px] text-white/70">{generated.ai.stitchNote}</p>
            )}
            {videoUrl && !videoError && (
              <div className="mt-2 flex items-center gap-2">
                <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
                  <span
                    className="block h-full rounded-full bg-white transition-all"
                    style={{ width: `${progress * 100}%` }}
                  />
                </span>
                <span className="text-xs tabular-nums text-white/80">{durationLabel}</span>
              </div>
            )}
          </div>
        </article>

        {generated?.director && (
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
                  <li>开场 — {generated.director.storyArc.opening}</li>
                )}
                {generated.director.storyArc.climax && (
                  <li>高潮 — {generated.director.storyArc.climax}</li>
                )}
                {generated.director.storyArc.resolve && (
                  <li>收束 — {generated.director.storyArc.resolve}</li>
                )}
              </ul>
            )}
            {generated.director.chapters?.length ? (
              <p className="mt-2 text-[10px] text-text-muted">
                情绪章节：{generated.director.chapters.map((c) => c.name || c.mood).join(' → ')}
              </p>
            ) : null}
          </section>
        )}

        {(generated?.effects?.hasTts || generated?.bgm) && (
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
                  <p className="text-xs font-semibold text-text">BGM · {generated.bgm?.title}</p>
                  <p className="text-[10px] text-text-muted">
                    {generated.bgm?.artist} · {generated.bgm?.bpm} BPM · {generated.bgm?.mood}
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

        {generated?.analysis && (
          <section className="mb-4 rounded-[var(--radius-lg)] bg-surface p-3 shadow-[var(--shadow-card)]">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles size={14} className="text-primary" />
              <h3 className="text-xs font-semibold text-text">AI 镜头分析</h3>
            </div>
            <p className="mb-2 text-[11px] text-text-secondary">{generated.analysis.summary}</p>
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

        {generated?.timeline && generated.timeline.length > 0 && (
          <section className="mb-5 rounded-[var(--radius-lg)] bg-surface p-3 shadow-[var(--shadow-card)]">
            <h3 className="mb-2 text-xs font-semibold text-text">AI 剪辑时间轴</h3>
            <ol className="space-y-2">
              {generated.timeline.map((item) => (
                <li key={item.order} className="text-[11px] text-text-secondary">
                  <span className="font-medium text-text">{item.shotTitle}</span>
                  <span className="text-text-muted"> · {item.materialName}</span>
                  {item.caption && (
                    <span className="mt-0.5 block text-text-muted">字幕：{item.caption}</span>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="mb-8 flex flex-col gap-3">
          <Button
            variant="accent"
            size="lg"
            fullWidth
            icon={<Download size={18} />}
            disabled={!videoUrl || saving}
            onClick={handleSaveClick}
          >
            {saving ? '导出中…' : '导出视频'}
          </Button>
          <Button
            variant="outline"
            size="lg"
            fullWidth
            icon={<RefreshCw size={18} />}
            disabled={regenerating}
            onClick={() => void handleRegenerate()}
          >
            {regenerating ? '准备中…' : '重新生成'}
          </Button>
          <Button
            variant="soft"
            size="lg"
            fullWidth
            icon={<Wand2 size={18} />}
            onClick={() => navigate('/vlog-learn')}
          >
            返回拍摄清单
          </Button>
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
