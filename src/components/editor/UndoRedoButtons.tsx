import { Redo2, Undo2 } from 'lucide-react'

interface UndoRedoButtonsProps {
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
}

export function UndoRedoButtons({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: UndoRedoButtonsProps) {
  const btnClass = (enabled: boolean) =>
    `flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-95 ${
      enabled
        ? 'text-text-secondary hover:bg-surface hover:text-text'
        : 'cursor-not-allowed text-text-muted/40'
    }`

  return (
    <section className="flex items-center gap-0.5" aria-label="撤回与重做">
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className={btnClass(canUndo)}
        aria-label="撤回"
        title="撤回"
      >
        <Undo2 size={20} strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        className={btnClass(canRedo)}
        aria-label="重做"
        title="重做"
      >
        <Redo2 size={20} strokeWidth={2} />
      </button>
    </section>
  )
}
