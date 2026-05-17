import type { GridCell } from '@/data/vlogGuide'
import { GRID_CELL_LABELS } from '@/data/vlogGuide'

interface NineGridGuideProps {
  subjectCells: GridCell[]
  accentCells?: GridCell[]
  className?: string
}

const ALL_CELLS: GridCell[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export function NineGridGuide({
  subjectCells,
  accentCells = [],
  className = '',
}: NineGridGuideProps) {
  return (
    <figure className={className}>
      <div
        className="relative aspect-[3/4] w-full overflow-hidden rounded-[var(--radius-xl)] bg-black shadow-[var(--shadow-card)]"
        aria-hidden
      >
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
          {ALL_CELLS.map((cell) => {
            const isSubject = subjectCells.includes(cell)
            const isAccent = accentCells.includes(cell)
            return (
              <div
                key={cell}
                className={`relative border border-white/25 ${
                  isSubject
                    ? 'bg-primary/45'
                    : isAccent
                      ? 'bg-accent/20'
                      : 'bg-white/5'
                }`}
              >
                <span
                  className={`absolute left-1 top-1 text-[9px] font-medium tabular-nums ${
                    isSubject ? 'text-white' : 'text-white/50'
                  }`}
                >
                  {cell}
                </span>
                {isSubject && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="rounded-full border-2 border-dashed border-white/70 px-2 py-0.5 text-[10px] font-medium text-white">
                      主体
                    </span>
                  </span>
                )}
                {isAccent && !isSubject && (
                  <span className="absolute bottom-1 right-1 text-[8px] text-white/70">
                    留白
                  </span>
                )}
                <span className="sr-only">{GRID_CELL_LABELS[cell]}</span>
              </div>
            )
          })}
        </div>
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
      </div>

      <figcaption className="mt-2 flex flex-wrap gap-3 text-[10px] text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-primary/45 ring-1 ring-primary/30" />
          放置主体
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-accent/20 ring-1 ring-accent/30" />
          留白 / 字幕区
        </span>
      </figcaption>
    </figure>
  )
}
