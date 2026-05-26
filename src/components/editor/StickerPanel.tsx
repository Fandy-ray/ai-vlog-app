import { Check, Trash2, X } from 'lucide-react'
import { EditorToolPanelShell } from '@/components/editor/EditorToolPanelShell'
import { TimeRangeInputs } from '@/components/editor/TimeRangeInputs'
import { STICKER_PRESETS } from '@/data/stickers'
import type { StickerOverlay } from '@/types/editorState'
import { createDefaultTimeRangeFromPlayhead } from '@/utils/timeRange'
import type { TimeRange } from '@/utils/timeRange'

interface StickerPanelProps {
  draft: StickerOverlay | null
  videoDuration: number
  currentTime: number
  onPick: (stickerId: string) => void
  onRangeChange: (range: TimeRange) => void
  onRemove: () => void
  onConfirm: () => void
  onClose: () => void
}

export function StickerPanel({
  draft,
  videoDuration,
  currentTime,
  onPick,
  onRangeChange,
  onRemove,
  onConfirm,
  onClose,
}: StickerPanelProps) {
  const timeRange = draft
    ? { startTime: draft.startTime, endTime: draft.endTime }
    : createDefaultTimeRangeFromPlayhead(videoDuration, currentTime)

  return (
    <EditorToolPanelShell
      title="贴纸"
      headerActions={
        <>
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
        </>
      }
    >
      <p className="px-4 pb-2 text-[10px] text-text-muted">
        选择贴纸后可在画面上拖动、缩放与旋转；确认后可再次打开继续添加
      </p>

      <ul className="grid grid-cols-6 gap-2 px-4 pb-3">
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

      <section className="border-t border-border/50 px-4 pb-4 pt-3">
        <span className="mb-2 block text-xs font-medium text-text">存在时间范围</span>
        <TimeRangeInputs
          range={timeRange}
          videoDuration={videoDuration}
          onChange={onRangeChange}
          disabled={!draft}
        />
        {!draft && (
          <p className="mt-1.5 text-[10px] text-text-muted">请先选择贴纸后再设置存在时间</p>
        )}
      </section>
    </EditorToolPanelShell>
  )
}
