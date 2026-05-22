import { X } from 'lucide-react'
import { Button } from '@/components/Button'

interface SaveToPhotosGuideProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  saving?: boolean
}

export function SaveToPhotosGuide({
  open,
  onClose,
  onConfirm,
  saving,
}: SaveToPhotosGuideProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-guide-title"
    >
      <article className="w-full max-w-sm rounded-[var(--radius-2xl)] bg-surface p-5 shadow-[var(--shadow-card)]">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h2 id="save-guide-title" className="text-base font-semibold text-text">
            如何保存到相册
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-muted hover:bg-bg"
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mb-3 text-xs leading-relaxed text-text-secondary">
          在 iPhone 的 Safari 里，网页不能像原生 App 那样直接写入相册，需要经过系统分享面板。
          这和「分享」不同：保存时请认准下面的选项。
        </p>

        <ol className="mb-4 space-y-2 text-xs text-text-secondary">
          <li className="rounded-lg bg-bg px-3 py-2">
            <span className="font-medium text-text">1.</span> 点下方「打开分享面板」
          </li>
          <li className="rounded-lg bg-bg px-3 py-2">
            <span className="font-medium text-text">2.</span> 在面板里向下滑动（不要只点隔空投送）
          </li>
          <li className="rounded-lg bg-accent/10 px-3 py-2 text-text">
            <span className="font-medium text-accent">3.</span> 选择「存储视频」或「存储到照片」
          </li>
        </ol>

        <p className="mb-4 text-[10px] text-text-muted">
          若只有隔空投送等选项，请先向上滑关闭面板，再重试；或使用 Mac 连线的「下载」方式。
        </p>

        <div className="flex flex-col gap-2">
          <Button fullWidth size="lg" disabled={saving} onClick={onConfirm}>
            {saving ? '准备视频中…' : '打开分享面板'}
          </Button>
          <Button fullWidth variant="ghost" size="md" onClick={onClose}>
            取消
          </Button>
        </div>
      </article>
    </div>
  )
}
