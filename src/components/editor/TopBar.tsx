import { ArrowLeft, Pencil, Users } from 'lucide-react'
import { Button } from '@/components/Button'
import { UndoRedoButtons } from './UndoRedoButtons'

interface TopBarProps {
  title: string
  isEditingTitle: boolean
  exporting?: boolean
  canUndo: boolean
  canRedo: boolean
  collaborativeActive?: boolean
  collaborativeEnabled?: boolean
  onBack: () => void
  onExport: () => void
  onUndo: () => void
  onRedo: () => void
  onTitleChange: (value: string) => void
  onToggleEditTitle: () => void
  onOpenCollaboration?: () => void
}

export function TopBar({
  title,
  isEditingTitle,
  exporting = false,
  canUndo,
  canRedo,
  collaborativeActive = false,
  collaborativeEnabled = false,
  onBack,
  onExport,
  onUndo,
  onRedo,
  onTitleChange,
  onToggleEditTitle,
  onOpenCollaboration,
}: TopBarProps) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-1 px-4 py-3">
      <section className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-white hover:text-text active:scale-95"
          aria-label="返回"
        >
          <ArrowLeft size={20} strokeWidth={2} />
        </button>
        <UndoRedoButtons
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={onUndo}
          onRedo={onRedo}
        />
      </section>

      <section className="flex min-w-0 flex-1 items-center justify-center gap-1.5 px-1">
        {isEditingTitle ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            onBlur={onToggleEditTitle}
            onKeyDown={(e) => e.key === 'Enter' && onToggleEditTitle()}
            className="max-w-[180px] truncate rounded-lg border border-primary/30 bg-white px-2 py-1 text-center text-[15px] font-semibold text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        ) : (
          <h1 className="truncate text-[15px] font-semibold text-text">{title}</h1>
        )}
        <button
          type="button"
          onClick={onToggleEditTitle}
          className="shrink-0 text-text-muted transition-colors hover:text-primary"
          aria-label="编辑标题"
        >
          <Pencil size={14} strokeWidth={2} />
        </button>
      </section>

      <section className="flex shrink-0 items-center gap-1">
        {onOpenCollaboration && (
          <button
            type="button"
            onClick={onOpenCollaboration}
            className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-colors active:scale-95 ${
              collaborativeActive
                ? collaborativeEnabled
                  ? 'bg-primary/12 text-primary'
                  : 'bg-accent/15 text-accent'
                : 'text-text-secondary hover:bg-white hover:text-text'
            }`}
            aria-label="共同编辑"
          >
            <Users size={18} strokeWidth={2} />
            {collaborativeActive && collaborativeEnabled && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#3ecfae] ring-2 ring-white" />
            )}
          </button>
        )}
        <Button
          variant="primary"
          size="sm"
          onClick={onExport}
          disabled={exporting}
          className="shrink-0"
        >
          {exporting ? '导出中…' : '导出'}
        </Button>
      </section>
    </header>
  )
}
