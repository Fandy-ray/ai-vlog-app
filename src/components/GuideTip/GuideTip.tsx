import { Lightbulb, X } from 'lucide-react'

interface GuideTipProps {
  title: string
  description: string
  onClose?: () => void
}

/** 导拍提示框 — 用于 AI 导拍页 */
export function GuideTip({ title, description, onClose }: GuideTipProps) {
  return (
    <div className="flex gap-3 rounded-[var(--radius-lg)] border border-primary/15 bg-primary/5 p-3 shadow-[var(--shadow-card)]">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Lightbulb size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-text">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">{description}</p>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-text-muted hover:text-text"
          aria-label="关闭"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
