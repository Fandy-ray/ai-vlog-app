interface FilterIntensityControlProps {
  filterName: string
  intensity: number
  onChange: (value: number) => void
}

export function FilterIntensityControl({
  filterName,
  intensity,
  onChange,
}: FilterIntensityControlProps) {
  return (
    <article className="mx-4 mb-3 animate-slide-up rounded-[var(--radius-lg)] border border-primary/15 bg-bg px-4 py-3 shadow-[var(--shadow-card)]">
      <header className="mb-3 flex items-center justify-between">
        <section>
          <p className="text-xs text-text-muted">滤镜强度</p>
          <p className="text-sm font-semibold text-text">{filterName}</p>
        </section>
        <span className="tabular-nums text-lg font-bold text-primary">{intensity}%</span>
      </header>

      <section className="flex items-center gap-3">
        <span className="shrink-0 text-[10px] text-text-muted">弱</span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={intensity}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ '--slider-progress': `${intensity}%` } as React.CSSProperties}
          className="filter-intensity-slider h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full"
          aria-label="调节滤镜强度"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={intensity}
        />
        <span className="shrink-0 text-[10px] text-text-muted">强</span>
      </section>
    </article>
  )
}
