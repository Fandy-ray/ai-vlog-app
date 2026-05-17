import { Check, X } from 'lucide-react'
import type { EffectPreset } from '@/data/effects'
import { PREVIEW_POSTER } from '@/data/mockProject'
import { EffectOverlay } from '@/components/editor/EffectOverlay'
import { FilteredMedia } from '@/components/editor/FilteredMedia'

interface EffectPanelProps {
  effects: EffectPreset[]
  selectedId: string
  filterCss?: string
  onSelect: (id: string) => void
  onConfirm: () => void
  onClose: () => void
}

export function EffectPanel({
  effects,
  selectedId,
  filterCss = 'none',
  onSelect,
  onConfirm,
  onClose,
}: EffectPanelProps) {
  return (
    <section className="shrink-0 animate-slide-up border-t border-border/80 bg-surface shadow-[0_-4px_16px_rgb(44_62_80_/4%)]">
      <header className="flex items-center justify-between px-4 pb-2 pt-3">
        <h3 className="text-sm font-semibold text-text">特效</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-[var(--shadow-soft)] transition-all hover:bg-primary-dark active:scale-95"
            aria-label="确定应用特效"
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

      <ul className="flex gap-3 overflow-x-auto px-4 pb-4 pt-1">
        {effects.map((effect) => {
          const active = selectedId === effect.id
          return (
            <li key={effect.id} className="shrink-0">
              <button
                type="button"
                onClick={() => onSelect(effect.id)}
                className="flex flex-col items-center gap-1.5 transition-transform active:scale-95"
              >
                <span
                  className={`relative block h-[72px] w-[72px] overflow-hidden rounded-[var(--radius-md)] bg-track-video ${
                    active
                      ? 'ring-2 ring-primary ring-offset-2'
                      : 'ring-1 ring-border/60'
                  }`}
                >
                  <FilteredMedia
                    src={PREVIEW_POSTER}
                    filterCss={filterCss}
                    intensity={100}
                    className="h-full w-full"
                  />
                  <EffectOverlay effectId={effect.id} />
                  {active && (
                    <span className="absolute right-1 top-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
                      <Check size={10} strokeWidth={3} />
                    </span>
                  )}
                </span>
                <span
                  className={`max-w-[72px] truncate text-[11px] ${
                    active ? 'font-medium text-primary' : 'text-text-secondary'
                  }`}
                >
                  {effect.name}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
