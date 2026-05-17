import { Check, Trash2, X } from 'lucide-react'
import { STICKER_PRESETS } from '@/data/stickers'
import type { StickerOverlay } from '@/types/editorState'

interface StickerPanelProps {
  draft: StickerOverlay | null
  onPick: (stickerId: string) => void
  onRemove: () => void
  onConfirm: () => void
  onClose: () => void
}

export function StickerPanel({
  draft,
  onPick,
  onRemove,
  onConfirm,
  onClose,
}: StickerPanelProps) {
  return (
    <section className="shrink-0 animate-slide-up border-t border-border/80 bg-surface shadow-[0_-4px_16px_rgb(44_62_80_/4%)]">
      <header className="flex items-center justify-between px-4 pb-2 pt-3">
        <h3 className="text-sm font-semibold text-text">贴纸</h3>
        <div className="flex items-center gap-2">
          {draft && (
            <button
              type="button"
              onClick={onRemove}
              className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-red-50 hover:text-red-500 active:scale-95"
              aria-label="移除贴纸"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-[var(--shadow-soft)] transition-all hover:bg-primary-dark active:scale-95"
            aria-label="确定"
          >
            <Check size={18} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg hover:text-text active:scale-95"
            aria-label="取消"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      <p className="px-4 pb-2 text-[10px] text-text-muted">
        选择贴纸后可在画面上拖动、缩放与旋转；确认后可再次打开继续添加
      </p>

      <ul className="grid grid-cols-6 gap-2 px-4 pb-4">
        {STICKER_PRESETS.map((sticker) => {
          const active = draft?.stickerId === sticker.id
          return (
            <li key={sticker.id}>
              <button
                type="button"
                onClick={() => onPick(sticker.id)}
                className={`flex aspect-square w-full flex-col items-center justify-center rounded-[var(--radius-md)] text-2xl transition-all active:scale-95 ${
                  active
                    ? 'bg-primary/15 ring-2 ring-primary'
                    : 'bg-bg ring-1 ring-border hover:bg-primary/5'
                }`}
                title={sticker.name}
                aria-label={sticker.name}
                aria-pressed={active}
              >
                {sticker.emoji}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
