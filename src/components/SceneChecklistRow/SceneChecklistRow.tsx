import { Camera, Check, ChevronRight } from 'lucide-react'
import type { VlogScene } from '@/data/vlogGuide'
import { SceneVideoImportButton } from '@/components/SceneVideoImportButton/SceneVideoImportButton'
import { useSceneVideoImport } from '@/hooks/useSceneVideoImport'
import type { VlogClipRecord } from '@/types/vlogMaterial'
import { formatDurationMs } from '@/utils/formatTime'

interface SceneChecklistRowProps {
  scene: VlogScene
  done: boolean
  recorded: boolean
  clip?: VlogClipRecord
  onToggle: () => void
  onShoot: () => void
  onToast: (msg: string) => void
}

export function SceneChecklistRow({
  scene,
  done,
  recorded,
  clip,
  onToggle,
  onShoot,
  onToast,
}: SceneChecklistRowProps) {
  const { importing, importFromGallery } = useSceneVideoImport(scene.id, scene.title)

  return (
    <li>
      <div
        className={`flex items-stretch overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] transition-all ${
          done ? 'bg-surface/80 ring-1 ring-primary/20' : 'bg-surface ring-1 ring-border'
        }`}
      >
        <button
          type="button"
          onClick={onToggle}
          className="flex w-12 shrink-0 items-center justify-center border-r border-border/80 active:bg-bg"
          aria-label={done ? `取消完成：${scene.title}` : `标记完成：${scene.title}`}
          aria-pressed={done}
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-colors ${
              done ? 'border-primary bg-primary text-white' : 'border-border bg-bg'
            }`}
          >
            {done && <Check size={14} strokeWidth={2.5} />}
          </span>
        </button>

        <button
          type="button"
          onClick={onShoot}
          className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left active:bg-bg/60"
        >
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Camera size={18} strokeWidth={1.75} />
            {recorded && (
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-surface" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span
                className={`text-sm font-semibold ${
                  done ? 'text-text-secondary line-through' : 'text-text'
                }`}
              >
                {scene.title}
              </span>
              {recorded && clip && (
                <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[9px] font-medium text-accent">
                  已有素材 {formatDurationMs(clip.durationMs)}
                </span>
              )}
            </span>
            <span className="mt-0.5 block text-[11px] leading-snug text-text-muted">
              {scene.subtitle}
            </span>
          </span>
          <ChevronRight size={18} className="shrink-0 text-text-muted" />
        </button>

        <div className="flex shrink-0 flex-col justify-center gap-1 border-l border-border/80 px-2 py-2">
          <SceneVideoImportButton
            variant="row"
            importing={importing}
            onImport={importFromGallery}
            onSuccess={() => {
              onToast(`已导入「${scene.title}」`)
            }}
            onError={onToast}
          />
        </div>
      </div>
    </li>
  )
}
