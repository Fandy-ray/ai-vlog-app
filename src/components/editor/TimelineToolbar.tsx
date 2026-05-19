import {
  Crop,
  FlipHorizontal2,
  RotateCw,
  Scissors,
  Trash2,
} from 'lucide-react'

export type TimelineToolId = 'split' | 'delete' | 'mirror' | 'rotate' | 'crop'

const TOOLS: {
  id: TimelineToolId
  label: string
  icon: typeof Scissors
}[] = [
  { id: 'split', label: '分割', icon: Scissors },
  { id: 'delete', label: '删除', icon: Trash2 },
  { id: 'mirror', label: '镜像', icon: FlipHorizontal2 },
  { id: 'rotate', label: '旋转', icon: RotateCw },
  { id: 'crop', label: '裁剪', icon: Crop },
]

interface TimelineToolbarProps {
  onTool: (id: TimelineToolId) => void
  canSplit?: boolean
  canDelete?: boolean
  activeTool?: TimelineToolId | null
}

export function TimelineToolbar({
  onTool,
  canSplit = true,
  canDelete = true,
  activeTool = null,
}: TimelineToolbarProps) {
  return (
    <nav
      className="mb-1.5 flex shrink-0 items-center justify-center gap-0.5 rounded-full bg-primary/12 px-1.5 py-0.5 ring-1 ring-primary/20"
      aria-label="剪辑工具"
    >
      {TOOLS.map(({ id, label, icon: Icon }) => {
        const disabled =
          (id === 'split' && !canSplit) || (id === 'delete' && !canDelete)
        const active = activeTool === id
        return (
          <button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => onTool(id)}
            title={label}
            aria-label={label}
            aria-pressed={active}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 ${
              active
                ? 'bg-primary text-white shadow-sm'
                : 'text-primary hover:bg-primary/15'
            }`}
          >
            <Icon size={15} strokeWidth={1.85} />
          </button>
        )
      })}
    </nav>
  )
}
