import { GalleryVertical, MapPin, Play, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { groupGardenVlogsByDate, type GardenVlogItem } from '@/data/memories'

type TimeOrder = 'desc' | 'asc'

function formatDisplayDate(date: string) {
  const [year, month, day] = date.split('-')
  return `${year}年${Number(month)}月${Number(day)}日`
}

function buildTimelineGroups(vlogs: GardenVlogItem[], order: TimeOrder) {
  const grouped = groupGardenVlogsByDate(vlogs)
  const dates = Array.from(grouped.keys()).sort()
  if (order === 'desc') dates.reverse()

  return dates.map((date) => {
    const items = [...(grouped.get(date) ?? [])]
    items.sort((a, b) => a.timeLabel.localeCompare(b.timeLabel, 'zh-Hans-CN'))
    if (order === 'desc') items.reverse()
    return { date, vlogs: items }
  })
}

interface GardenTimelineProps {
  open: boolean
  onClose: () => void
  vlogs: GardenVlogItem[]
  onPlayVlog: (vlog: GardenVlogItem) => void
}

export function GardenTimeline({ open, onClose, vlogs, onPlayVlog }: GardenTimelineProps) {
  const [timeOrder, setTimeOrder] = useState<TimeOrder>('desc')

  const groups = useMemo(() => buildTimelineGroups(vlogs, timeOrder), [vlogs, timeOrder])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="garden-timeline-title"
      onClick={onClose}
    >
      <article
        className="flex max-h-[min(88vh,640px)] w-full max-w-md flex-col overflow-hidden rounded-[var(--radius-2xl)] bg-surface shadow-[var(--shadow-card)]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <p className="text-xs font-medium text-primary">按时间浏览</p>
            <h2 id="garden-timeline-title" className="text-lg font-bold text-text">
              回忆时间轴
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg"
            aria-label="关闭时间轴"
          >
            <X size={18} />
          </button>
        </header>

        <div className="shrink-0 border-b border-border px-5 py-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTimeOrder('desc')}
              className={`flex-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                timeOrder === 'desc'
                  ? 'bg-primary text-white shadow-[var(--shadow-soft)]'
                  : 'bg-bg text-text-muted'
              }`}
            >
              时间倒序
            </button>
            <button
              type="button"
              onClick={() => setTimeOrder('asc')}
              className={`flex-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                timeOrder === 'asc'
                  ? 'bg-primary text-white shadow-[var(--shadow-soft)]'
                  : 'bg-bg text-text-muted'
              }`}
            >
              时间正序
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {groups.length === 0 ? (
            <div className="py-10 text-center">
              <GalleryVertical size={28} className="mx-auto text-text-muted" />
              <p className="mt-3 text-sm font-medium text-text">暂无 vlog</p>
              <p className="mt-1 text-xs text-text-muted">完成剪辑后，回忆会出现在时间轴上</p>
            </div>
          ) : (
            <ol className="relative space-y-0">
              <span
                className="pointer-events-none absolute bottom-2 left-[11px] top-2 w-px bg-border"
                aria-hidden
              />
              {groups.map((group, groupIndex) => (
                <li key={group.date} className="relative pb-6 last:pb-0">
                  <div className="flex items-start gap-3">
                    <span
                      className={`relative z-[1] mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-4 ring-surface ${
                        groupIndex === 0 ? 'bg-primary text-white' : 'bg-primary/15 text-primary'
                      }`}
                      aria-hidden
                    >
                      <span className="h-2 w-2 rounded-full bg-current" />
                    </span>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-sm font-semibold text-text">{formatDisplayDate(group.date)}</p>
                      <p className="text-[11px] text-text-muted">{group.vlogs.length} 支 vlog</p>
                    </div>
                  </div>

                  <ul className="ml-9 mt-3 space-y-2">
                    {group.vlogs.map((vlog) => (
                      <li key={vlog.id}>
                        <button
                          type="button"
                          onClick={() => {
                            onPlayVlog(vlog)
                            onClose()
                          }}
                          className="flex w-full gap-3 rounded-[var(--radius-xl)] bg-bg p-2.5 text-left ring-1 ring-border transition-transform active:scale-[0.99]"
                        >
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-track-video">
                            <img
                              src={vlog.cover}
                              alt={vlog.title}
                              className="h-full w-full object-cover"
                              draggable={false}
                            />
                            <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-sm">
                                <Play size={12} fill="white" />
                              </span>
                            </span>
                            <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 py-0.5 text-[9px] font-medium text-white">
                              {vlog.duration}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-text">{vlog.title}</p>
                            <p className="mt-0.5 line-clamp-1 text-xs text-text-muted">{vlog.description}</p>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-text-muted">
                              <span>{vlog.timeLabel}</span>
                              <span className="inline-flex items-center gap-0.5">
                                <MapPin size={10} />
                                {vlog.location}
                              </span>
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="shrink-0 border-t border-border px-5 py-3 text-xs text-text-muted">
          共 {vlogs.length} 支 vlog · 点击条目播放
        </div>
      </article>
    </div>
  )
}
