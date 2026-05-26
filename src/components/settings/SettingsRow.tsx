import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

interface SettingsRowProps {
  label: string
  hint?: string
  value?: string
  icon?: ReactNode
  onClick?: () => void
  showChevron?: boolean
  borderTop?: boolean
}

export function SettingsRow({
  label,
  hint,
  value,
  icon,
  onClick,
  showChevron = true,
  borderTop = false,
}: SettingsRowProps) {
  const interactive = Boolean(onClick)

  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors ${
        borderTop ? 'border-t border-border/80' : ''
      } ${interactive ? 'hover:bg-bg/80 active:bg-bg' : 'cursor-default'}`}
    >
      {icon ? (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-text">{label}</span>
        {hint ? (
          <span className="mt-0.5 block text-[11px] text-text-muted">{hint}</span>
        ) : null}
      </span>
      {value ? (
        <span className="max-w-[45%] truncate text-xs text-text-muted">{value}</span>
      ) : null}
      {showChevron && interactive ? (
        <ChevronRight size={18} className="shrink-0 text-text-muted" />
      ) : null}
    </button>
  )
}

export function SettingsSection({
  title,
  children,
  className = '',
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={className}>
      <h2 className="mb-2 px-1 text-xs font-medium text-text-muted">{title}</h2>
      <div className="overflow-hidden rounded-[var(--radius-xl)] bg-surface shadow-[var(--shadow-card)]">
        {children}
      </div>
    </section>
  )
}
