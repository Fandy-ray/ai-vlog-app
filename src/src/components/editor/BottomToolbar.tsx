import {
  Blend,
  Music2,
  Scissors,
  Smile,
  Sparkles,
  Type,
} from 'lucide-react'

const TOOLS = [
  { id: 'cut', label: '剪辑', icon: Scissors },
  { id: 'filter', label: '滤镜', icon: Blend },
  { id: 'effect', label: '特效', icon: Sparkles },
  { id: 'text', label: '文字', icon: Type },
  { id: 'sticker', label: '贴纸', icon: Smile },
  { id: 'audio', label: '音频', icon: Music2 },
] as const

interface BottomToolbarProps {
  activeTool: string
  onSelect: (id: string, label: string) => void
}

export function BottomToolbar({ activeTool, onSelect }: BottomToolbarProps) {
  return (
    <nav className="shrink-0 border-t border-border/80 bg-surface/95 px-2 py-2 backdrop-blur-md">
      <ul className="flex items-center justify-around">
        {TOOLS.map(({ id, label, icon: Icon }) => {
          const active = activeTool === id
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onSelect(id, label)}
                className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-colors active:scale-95 ${
                  active ? 'text-primary' : 'text-text-secondary hover:text-text'
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.25 : 1.75} />
                <span className={`text-[10px] ${active ? 'font-medium' : ''}`}>{label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
