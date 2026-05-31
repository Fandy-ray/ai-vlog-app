import { Check, X } from 'lucide-react'
import { EditorToolPanelShell } from '@/components/editor/EditorToolPanelShell'
import { TransitionPresetPreview } from '@/components/editor/TransitionPresetPreview'
import {
  CLIP_TRANSITION_PRESETS,
  type TransitionPresetId,
} from '@/data/clipTransitions'
import type { ClipJoinPoint } from '@/utils/clipOperations'
import { transitionKindLabel } from '@/types/clipTransition'

interface TransitionPanelProps {
  joins: ClipJoinPoint[]
  selectedJoinIndex: number
  selectedKind: TransitionPresetId
  duration: number
  sceneOutSrc: string
  sceneInSrc: string
  onJoinSelect: (joinIndex: number, joinTime: number) => void
  onKindSelect: (kind: TransitionPresetId) => void
  onDurationChange: (seconds: number) => void
  onConfirm: () => void
  onClose: () => void
}

function formatJoinTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)} 秒`
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function TransitionPanel({
  joins,
  selectedJoinIndex,
  selectedKind,
  duration,
  sceneOutSrc,
  sceneInSrc,
  onJoinSelect,
  onKindSelect,
  onDurationChange,
  onConfirm,
  onClose,
}: TransitionPanelProps) {
  const showDuration = selectedKind !== 'none'

  return (
    <EditorToolPanelShell
      title="转场"
      headerActions={
        <>
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-[var(--shadow-soft)] transition-all hover:bg-primary-dark active:scale-95"
            aria-label="确定应用转场"
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
      <div className="px-4 pb-1">
        <p className="mb-1.5 text-[10px] font-medium text-text-muted">片段衔接</p>
        <ul className="flex gap-2 overflow-x-auto pb-1 pt-0.5">
          {joins.map((join) => {
            const active = join.joinIndex === selectedJoinIndex
            const hasTransition = Boolean(join.transition)
            return (
              <li key={join.joinIndex} className="shrink-0">
                <button
                  type="button"
                  onClick={() => onJoinSelect(join.joinIndex, join.joinTime)}
                  className={`rounded-full px-2.5 py-1 text-left transition-colors active:scale-95 ${
                    active
                      ? 'bg-primary text-white'
                      : 'bg-bg text-text-secondary hover:bg-primary/10 hover:text-text'
                  }`}
                >
                  <span className="block text-[11px] font-medium leading-tight">
                    {join.label}
                  </span>
                  <span
                    className={`mt-0.5 block text-[10px] leading-tight ${
                      active ? 'text-white/85' : 'text-text-muted'
                    }`}
                  >
                    {formatJoinTime(join.joinTime)}
                    {hasTransition
                      ? ` · ${transitionKindLabel(join.transition!.kind)}`
                      : ' · 无'}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <p className="px-4 pb-1 pt-0.5 text-[10px] font-medium text-text-muted">转场效果</p>
      <ul className="flex gap-3 overflow-x-auto px-4 pb-2 pt-2">
        {CLIP_TRANSITION_PRESETS.map((preset) => {
          const active = selectedKind === preset.id
          return (
            <li key={preset.id} className="shrink-0 pt-0.5">
              <button
                type="button"
                onClick={() => onKindSelect(preset.id)}
                className="flex flex-col items-center gap-1.5 transition-transform active:scale-95"
                title={preset.hint}
              >
                <span
                  className={`relative block rounded-[var(--radius-md)] ${
                    active
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface'
                      : 'ring-1 ring-border/60'
                  }`}
                >
                  <span className="relative block h-[72px] w-[72px] overflow-hidden rounded-[var(--radius-md)] bg-track-video">
                    <TransitionPresetPreview
                      kind={preset.id}
                      sceneOutSrc={sceneOutSrc}
                      sceneInSrc={sceneInSrc}
                    />
                    {active && (
                      <span className="absolute right-1 top-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                  </span>
                </span>
                <span
                  className={`max-w-[72px] truncate text-[11px] ${
                    active ? 'font-medium text-primary' : 'text-text-secondary'
                  }`}
                >
                  {preset.name}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {showDuration && (
        <article className="mx-4 mb-3 rounded-[var(--radius-lg)] border border-primary/15 bg-bg px-3 py-2.5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-medium text-text-secondary">转场时长</p>
            <span className="tabular-nums text-sm font-semibold text-primary">
              {duration.toFixed(1)} 秒
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-[10px] text-text-muted">0.25s</span>
            <input
              type="range"
              min={0.25}
              max={1.2}
              step={0.05}
              value={duration}
              onChange={(e) => onDurationChange(Number(e.target.value))}
              className="h-1.5 min-w-0 flex-1 cursor-pointer accent-primary"
              aria-label="转场时长"
            />
            <span className="shrink-0 text-[10px] text-text-muted">1.2s</span>
          </div>
        </article>
      )}
    </EditorToolPanelShell>
  )
}
