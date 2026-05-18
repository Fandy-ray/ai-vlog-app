import { Loader2, X } from 'lucide-react'
import { Button } from '@/components/Button'

interface ExportDialogProps {
  open: boolean
  progress: number
  message: string
  onCancel?: () => void
}

export function ExportDialog({ open, progress, message, onCancel }: ExportDialogProps) {
  if (!open) return null

  const pct = Math.round(progress * 100)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-dialog-title"
    >
      <article className="w-full max-w-sm rounded-[var(--radius-xl)] bg-surface p-6 shadow-[var(--shadow-card)]">
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="export-dialog-title" className="text-base font-semibold text-text">
              正在导出成片
            </h2>
            <p className="mt-1 text-sm text-text-muted">{message}</p>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-muted hover:bg-bg"
              aria-label="取消"
            >
              <X size={18} />
            </button>
          )}
        </header>

        <div className="mb-4 flex items-center gap-3">
          <Loader2 size={22} className="animate-spin text-primary" />
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
            <span
              className="block h-full rounded-full bg-primary transition-[width] duration-200"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="w-10 text-right text-sm tabular-nums text-text-muted">{pct}%</span>
        </div>

        <p className="text-xs leading-relaxed text-text-muted">
          正在快速编码 MP4（自动按时长降低分辨率以加速），首次导出需加载编码器，请保持页面在前台。
        </p>

        {onCancel && (
          <Button variant="ghost" size="md" fullWidth className="mt-4" onClick={onCancel}>
            取消导出
          </Button>
        )}
      </article>
    </div>
  )
}
