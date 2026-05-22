import {
  ArrowLeft,
  Download,
  Flower2,
  Pause,
  Play,
  Scissors,
  Share2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomNav } from '@/components/BottomNav'
import { Button } from '@/components/Button'
import { PageShell } from '@/components/PageShell'
import { StyleCard } from '@/components/StyleCard'
import { Toast } from '@/components/Toast'
import { COMPLETE_VIDEO, RECOMMENDATIONS } from '@/data/recommendations'
import { useToast } from '@/hooks/useToast'
import { getExportedVideo } from '@/state/exportedVideo'
import { downloadExportResult } from '@/utils/export/exportVideo'
import { formatTime } from '@/utils/formatTime'

export function CompletePage() {
  const navigate = useNavigate()
  const { message, show, visible } = useToast()
  const exported = getExportedVideo()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  const title = exported?.title ?? COMPLETE_VIDEO.title
  const cover = exported?.posterUrl ?? COMPLETE_VIDEO.cover
  const durationLabel = exported
    ? formatTime(exported.duration)
    : COMPLETE_VIDEO.duration
  const videoUrl = exported?.url

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onTime = () => {
      if (!video.duration) return
      setProgress(video.currentTime / video.duration)
    }
    const onEnded = () => setPlaying(false)

    video.addEventListener('timeupdate', onTime)
    video.addEventListener('ended', onEnded)
    return () => {
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('ended', onEnded)
    }
  }, [videoUrl])

  const togglePlay = async () => {
    const video = videoRef.current
    if (!video || !videoUrl) {
      show('请先在剪辑页导出成片')
      return
    }

    if (playing) {
      video.pause()
      setPlaying(false)
      return
    }

    try {
      await video.play()
      setPlaying(true)
    } catch {
      show('无法播放视频')
    }
  }

  const handleDownload = () => {
    if (!exported) {
      show('请先在剪辑页点击「导出」生成成片')
      return
    }
    downloadExportResult(exported)
    show('已开始下载')
  }

  const handleShare = async () => {
    if (!exported) {
      show('请先导出成片')
      return
    }

    if (navigator.share) {
      try {
        const ext = exported.mimeType.includes('mp4') ? 'mp4' : 'webm'
        const file = new File([exported.blob], `${exported.title}.${ext}`, {
          type: exported.mimeType,
        })
        await navigator.share({
          title: exported.title,
          files: [file],
        })
        return
      } catch {
        // fallback
      }
    }

    handleDownload()
    show('已触发下载，可手动分享文件')
  }

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
        <h1 className="flex-1 text-center text-[15px] font-semibold text-text">创作完成</h1>
        <span className="w-9" />
      </header>

      <section className="flex-1 px-4 pb-4">
        <article className="relative mb-5 overflow-hidden rounded-[var(--radius-2xl)] shadow-[var(--shadow-card)]">
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              poster={cover}
              className="aspect-video w-full object-cover"
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              src={cover}
              alt={title}
              className="aspect-video w-full object-cover"
              draggable={false}
            />
          )}
          <span
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
            aria-hidden
          />

          <button
            type="button"
            onClick={togglePlay}
            className="absolute left-1/2 top-[42%] flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-md transition-transform active:scale-90"
            aria-label={playing ? '暂停' : '播放'}
          >
            {playing ? (
              <Pause size={24} fill="white" />
            ) : (
              <Play size={24} fill="white" className="ml-1" />
            )}
          </button>

          <div className="absolute inset-x-0 bottom-0 p-4">
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
                <span
                  className="block h-full rounded-full bg-white transition-all"
                  style={{ width: `${progress * 100}%` }}
                />
              </span>
              <span className="text-xs tabular-nums text-white/80">{durationLabel}</span>
            </div>
          </div>
        </article>

        {!exported && (
          <p className="mb-4 rounded-[var(--radius-lg)] bg-surface px-3 py-2 text-center text-sm text-text-muted">
            在剪辑页完成编辑后，点击右上角「导出」即可生成带滤镜、文字与贴纸的成片。
          </p>
        )}

        <section className="mb-6 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="lg"
            fullWidth
            icon={<Download size={18} />}
            onClick={handleDownload}
          >
            下载成片
          </Button>
          <Button
            variant="accent"
            size="lg"
            fullWidth
            icon={<Share2 size={18} />}
            onClick={handleShare}
          >
            分享
          </Button>
          <Button
            variant="soft"
            size="lg"
            fullWidth
            icon={<Scissors size={18} />}
            onClick={() => navigate('/editor')}
          >
            继续剪辑
          </Button>
          <Button
            variant="outline"
            size="lg"
            fullWidth
            icon={<Flower2 size={18} className="text-accent" />}
            onClick={() => show('已加入记忆花园')}
          >
            加入记忆花园
          </Button>
        </section>

        <section>
          <h3 className="mb-3 text-base font-semibold text-text">你可能还喜欢</h3>
          <ul className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {RECOMMENDATIONS.map((item) => (
              <li key={item.id}>
                <StyleCard item={item} onClick={() => show(`应用风格「${item.title}」`)} />
              </li>
            ))}
          </ul>
        </section>
      </section>

      <BottomNav
        active="create"
        gardenBadge={3}
        onChange={(tab) => {
          if (tab === 'home') navigate('/')
          else if (tab === 'create') navigate('/create')
          else show('功能即将开放')
        }}
      />

      <Toast message={message} visible={visible} />
    </PageShell>
  )
}

