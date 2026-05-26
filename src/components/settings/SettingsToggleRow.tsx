import type { ReactNode } from 'react'

interface SettingsToggleRowProps {
  label: string
  hint?: string
  icon?: ReactNode
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
  borderTop?: boolean
}

export function SettingsToggleRow({
  label,
  hint,
  icon,
  checked,
  disabled = false,
  onChange,
  borderTop = false,
}: SettingsToggleRowProps) {
  return (
    <div
      className={`flex w-full items-center gap-3 px-4 py-3.5 ${
        borderTop ? 'border-t border-border/80' : ''
      } ${disabled ? 'opacity-60' : ''}`}
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
      <label className="relative inline-flex shrink-0 cursor-pointer items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="h-7 w-12 rounded-full bg-border transition-colors peer-checked:bg-primary peer-disabled:opacity-50" />
        <span className="absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </label>
    </div>
  )
}
