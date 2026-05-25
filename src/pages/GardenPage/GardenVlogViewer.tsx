import { MapPin, X } from 'lucide-react'
import type { GardenVlogItem } from '@/data/memories'

interface GardenVlogViewerProps {
  vlog: GardenVlogItem | null
  onClose: () => void
}

function formatDisplayDate(date: string) {
  const [year, month, day] = date.split('-')
  return `${year}年${Number(month)}月${Number(day)}日`
}

export function GardenVlogViewer({ vlog, onClose }: GardenVlogViewerProps) {
  if (!vlog) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="garden-vlog-viewer-title"
      onClick={onClose}
    >
      <article
        className="w-full max-w-lg overflow-hidden rounded-[var(--radius-2xl)] bg-surface shadow-[var(--shadow-card)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative aspect-video bg-black">
          {vlog.videoUrl ? (
            <video
              key={vlog.id}
              src={vlog.videoUrl}
              poster={vlog.cover}
              controls
              playsInline
              className="h-full w-full object-contain"
            />
          ) : (
            <img src={vlog.cover} alt={vlog.title} className="h-full w-full object-cover" />
          )}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm"
            aria-label="关闭播放"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 id="garden-vlog-viewer-title" className="text-lg font-bold text-text">
                {vlog.title}
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                {formatDisplayDate(vlog.date)} · {vlog.timeLabel}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              {vlog.theme}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-text-secondary">{vlog.description}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} />
              {vlog.location}
            </span>
            <span>{vlog.duration}</span>
            <span>{vlog.views} 次观看</span>
          </div>
        </div>
      </article>
    </div>
  )
}
