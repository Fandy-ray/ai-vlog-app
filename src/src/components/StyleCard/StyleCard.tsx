import { Sparkles } from 'lucide-react'

export interface StyleItem {
  id: string
  title: string
  subtitle: string
  cover: string
  tag?: string
}

interface StyleCardProps {
  item: StyleItem
  onClick?: () => void
}

export function StyleCard({ item, onClick }: StyleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-[140px] shrink-0 overflow-hidden rounded-[var(--radius-lg)] bg-surface text-left shadow-[var(--shadow-card)] transition-transform active:scale-[0.98]"
    >
      <div className="relative h-24 overflow-hidden">
        <img
          src={item.cover}
          alt={item.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {item.tag && (
          <span className="absolute left-2 top-2 flex items-center gap-0.5 rounded-full bg-accent/90 px-1.5 py-0.5 text-[9px] font-medium text-white">
            <Sparkles size={8} />
            {item.tag}
          </span>
        )}
      </div>
      <div className="p-2">
        <p className="truncate text-xs font-semibold text-text">{item.title}</p>
        <p className="mt-0.5 truncate text-[10px] text-text-muted">{item.subtitle}</p>
      </div>
    </button>
  )
}
