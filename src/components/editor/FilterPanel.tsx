import { Check, X } from 'lucide-react'
import type { FilterPreset } from '@/data/filters'
import { PREVIEW_POSTER } from '@/data/mockProject'
import { FilterIntensityControl } from './FilterIntensityControl'
import { FilteredMedia } from './FilteredMedia'

interface FilterPanelProps {
  filters: FilterPreset[]
  selectedId: string
  intensity: number
  onSelect: (id: string) => void
  onIntensityChange: (value: number) => void
  onConfirm: () => void
  onClose: () => void
}

export function FilterPanel({
  filters,
  selectedId,
  intensity,
  onSelect,
  onIntensityChange,
  onConfirm,
  onClose,
}: FilterPanelProps) {
  const selectedFilter = filters.find((f) => f.id === selectedId)
  const showIntensity = selectedId !== 'none' && selectedFilter

  return (
    <section className="shrink-0 animate-slide-up border-t border-border/80 bg-surface shadow-[0_-4px_16px_rgb(44_62_80_/4%)]">
      <header className="flex items-center justify-between px-4 pb-2 pt-3">
        <h3 className="text-sm font-semibold text-text">滤镜</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-[var(--shadow-soft)] transition-all hover:bg-primary-dark active:scale-95"
            aria-label="确定应用滤镜"
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

      <ul className="flex gap-3 overflow-x-auto px-4 pb-2 pt-1">
        {filters.map((filter) => {
          const active = selectedId === filter.id
          return (
            <li key={filter.id} className="shrink-0">
              <button
                type="button"
                onClick={() => onSelect(filter.id)}
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
                    filterCss={filter.css}
                    intensity={active && filter.id !== 'none' ? intensity : 100}
                    className="h-full w-full"
                  />
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
                  {filter.name}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {showIntensity && (
        <FilterIntensityControl
          filterName={selectedFilter.name}
          intensity={intensity}
          onChange={onIntensityChange}
        />
      )}
    </section>
  )
}
