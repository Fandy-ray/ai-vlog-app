import {
  Bot,
  Mic,
  MoreHorizontal,
  Music,
  Sparkles,
} from 'lucide-react'

const FEATURES = [
  { id: 'voice', label: '语音剪辑', icon: Mic, color: 'bg-primary/10 text-primary' },
  { id: 'doodle', label: '魔法涂鸦', icon: Sparkles, color: 'bg-accent/15 text-accent' },
  { id: 'music', label: '智能配乐', icon: Music, color: 'bg-primary/10 text-primary' },
  { id: 'narration', label: 'AI旁白', icon: Bot, color: 'bg-primary/10 text-primary' },
  { id: 'more', label: '更多', icon: MoreHorizontal, color: 'bg-border/60 text-text-secondary' },
] as const

interface AIFeatureBarProps {
  activeId: string | null
  onSelect: (id: string, label: string) => void
}

export function AIFeatureBar({ activeId, onSelect }: AIFeatureBarProps) {
  return (
    <section className="shrink-0 px-4 py-3">
      <div className="flex items-start justify-between gap-1">
        {FEATURES.map(({ id, label, icon: Icon, color }) => {
          const active = activeId === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id, label)}
              className="flex min-w-0 flex-1 flex-col items-center gap-1.5 transition-transform active:scale-95"
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-[var(--shadow-card)] transition-all ${color} ${
                  active ? 'ring-2 ring-primary ring-offset-2' : ''
                }`}
              >
                <Icon size={20} strokeWidth={1.75} />
              </span>
              <span
                className={`max-w-[56px] truncate text-[10px] leading-tight ${
                  active ? 'font-medium text-primary' : 'text-text-secondary'
                }`}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
