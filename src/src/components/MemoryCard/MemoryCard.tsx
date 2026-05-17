import { Play } from 'lucide-react'

export interface MemoryItem {
  id: string
  title: string
  cover: string
  views: string
  duration?: string
}

interface MemoryCardProps {
  item: MemoryItem
  onClick?: () => void
}

export function MemoryCard({ item, onClick }: MemoryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full overflow-hidden rounded-[var(--radius-lg)] bg-surface text-left shadow-[var(--shadow-card)] transition-transform active:scale-[0.98]"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={item.cover}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        {item.duration && (
          <span className="absolute bottom-2 right-2 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            {item.duration}
          </span>
        )}
        <span className="absolute bottom-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-sm">
          <Play size={12} fill="white" />
        </span>
      </div>
      <div className="px-2.5 py-2">
        <p className="truncate text-sm font-medium text-text">{item.title}</p>
        <p className="mt-0.5 text-[11px] text-text-muted">{item.views} 次观看</p>
      </div>
    </button>
  )
}
