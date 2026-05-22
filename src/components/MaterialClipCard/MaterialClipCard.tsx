import { Film, Trash2 } from 'lucide-react'
import { TrimClipButton } from '@/components/TrimClipButton'
import { useEffect, useRef } from 'react'
import { formatDurationMs } from '@/utils/formatTime'

export interface MaterialClipCardProps {
  sceneTitle: string
  sceneSubtitle?: string
  durationMs: number
  sizeBytes: number
  mimeType: string
  previewUrl: string
  index: number
  onDelete?: () => void
  onTrim?: () => void
  deleting?: boolean
  trimming?: boolean
}

export function MaterialClipCard({
  sceneTitle,
  sceneSubtitle,
  durationMs,
  sizeBytes,
  mimeType,
  previewUrl,
  index,
  onDelete,
  onTrim,
  deleting = false,
  trimming = false,
}: MaterialClipCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = videoRef.current
    if (!el || !previewUrl) return
    el.src = previewUrl
    return () => {
      el.removeAttribute('src')
      el.load()
    }
  }, [previewUrl])

  const sizeMb = (sizeBytes / 1024 / 1024).toFixed(1)

  return (
    <article className="overflow-hidden rounded-[var(--radius-lg)] bg-surface shadow-[var(--shadow-card)] ring-1 ring-border">
      <div className="relative aspect-[9/16] max-h-[min(52vh,420px)] w-full bg-black">
        <video
          ref={videoRef}
          className="h-full w-full object-contain"
          controls
          playsInline
          preload="metadata"
          aria-label={`${sceneTitle} 预览`}
        />
        <span className="absolute left-2 top-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
          {index}
        </span>
      </div>
      <div className="flex items-start gap-2.5 px-3 py-2.5">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Film size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text">{sceneTitle}</p>
          {sceneSubtitle ? (
            <p className="mt-0.5 line-clamp-2 text-[11px] text-text-muted">{sceneSubtitle}</p>
          ) : null}
          <p className="mt-1 text-[10px] text-text-muted">
            {formatDurationMs(durationMs)} · {sizeMb} MB · {mimeType.split('/')[1] || 'video'}
          </p>
          {onTrim ? (
            <div className="mt-2">
              <TrimClipButton
                loading={trimming}
                disabled={deleting}
                onClick={onTrim}
                className="!text-[11px]"
              />
            </div>
          ) : null}
        </div>
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-600 ring-1 ring-red-500/20 transition-colors hover:bg-red-500/10 active:scale-95 disabled:opacity-50"
            aria-label="删除此段素材"
            title="删除"
          >
            <Trash2 size={18} />
          </button>
        ) : null}
      </div>
    </article>
  )
}
