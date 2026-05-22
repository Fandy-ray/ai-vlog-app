import type { GridCell } from '@/data/vlogGuide'

interface CameraNineGridOverlayProps {
  subjectCells: GridCell[]
  accentCells?: GridCell[]
}

const ALL_CELLS: GridCell[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export function CameraNineGridOverlay({
  subjectCells,
  accentCells = [],
}: CameraNineGridOverlayProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3"
      aria-hidden
    >
      {ALL_CELLS.map((cell) => {
        const isSubject = subjectCells.includes(cell)
        const isAccent = accentCells.includes(cell)
        return (
          <div
            key={cell}
            className={`relative border border-white/35 ${
              isSubject ? 'bg-primary/30' : isAccent ? 'bg-accent/15' : ''
            }`}
          >
            <span
              className={`absolute left-1.5 top-1.5 text-[11px] font-semibold tabular-nums drop-shadow ${
                isSubject ? 'text-white' : 'text-white/60'
              }`}
            >
              {cell}
            </span>
            {isSubject && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="rounded-full border border-dashed border-white/80 bg-black/20 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                  主体
                </span>
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
