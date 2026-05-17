import { Flower2, Home, PlusCircle, User } from 'lucide-react'

export type TabId = 'home' | 'create' | 'garden' | 'profile'

interface BottomNavProps {
  active: TabId
  gardenBadge?: number
  onChange?: (tab: TabId) => void
}

const TABS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: 'home', label: '首页', icon: Home },
  { id: 'create', label: '创作', icon: PlusCircle },
  { id: 'garden', label: '记忆花园', icon: Flower2 },
  { id: 'profile', label: '我的', icon: User },
]

export function BottomNav({ active, gardenBadge = 0, onChange }: BottomNavProps) {
  return (
    <nav className="shrink-0 border-t border-border/80 bg-surface/95 px-2 pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur-md">
      <ul className="flex items-center justify-around">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onChange?.(id)}
                className={`relative flex flex-col items-center gap-0.5 px-4 py-2 transition-colors active:scale-95 ${
                  isActive ? 'text-primary' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.25 : 1.75} />
                <span className={`text-[10px] ${isActive ? 'font-medium' : ''}`}>{label}</span>
                {id === 'garden' && gardenBadge > 0 && (
                  <span className="absolute right-2 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-white">
                    {gardenBadge}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
