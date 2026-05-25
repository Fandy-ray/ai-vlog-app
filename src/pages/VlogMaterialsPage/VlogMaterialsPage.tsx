import { ArrowLeft, FolderOpen } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MaterialClipCard } from '@/components/MaterialClipCard/MaterialClipCard'
import { PageShell } from '@/components/PageShell'
import { Toast } from '@/components/Toast'
import { getActiveScenes, getVlogScene } from '@/utils/vlogDirectorStore'
import { useVlogChecklist } from '@/hooks/useVlogChecklist'
import { useToast } from '@/hooks/useToast'
import { VLOG_MATERIALS_CHANGED } from '@/types/vlogMaterial'
import { formatDurationMs } from '@/utils/formatTime'
import {
  deleteClip,
  getAllClipMeta,
  loadAllClipsForPreview,
} from '@/utils/vlogMaterialStore'
import { trimExistingSceneClip } from '@/utils/trimSceneClip'

interface ClipPreviewItem {
  id: string
  sceneId: string
  sceneTitle: string
  sceneSubtitle: string
  durationMs: number
  sizeBytes: number
  mimeType: string
  previewUrl: string
  index: number
}

export function VlogMaterialsPage() {
  const navigate = useNavigate()
  const { markUndone } = useVlogChecklist()
  const { message, show, visible } = useToast()
  const [items, setItems] = useState<ClipPreviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [trimmingId, setTrimmingId] = useState<string | null>(null)

  const loadClips = useCallback(async (revokePrevious: string[]) => {
    revokePrevious.forEach((u) => URL.revokeObjectURL(u))
    setLoading(true)
    const urls: string[] = []
    try {
      const [clips, metas] = await Promise.all([loadAllClipsForPreview(), getAllClipMeta()])
      const metaById = new Map(metas.map((m) => [m.id, m]))
      const mapped: ClipPreviewItem[] = clips.map((c, i) => {
        const scene = getVlogScene(c.sceneId)
        const meta = metaById.get(c.id)
        const url = URL.createObjectURL(c.blob)
        urls.push(url)
        return {
          id: c.id,
          sceneId: c.sceneId,
          sceneTitle: scene?.title ?? c.name.replace(/\.mp4$/i, ''),
          sceneSubtitle: scene?.subtitle ?? '',
          durationMs: meta?.durationMs ?? c.duration * 1000,
          sizeBytes: meta?.sizeBytes ?? c.blob.size,
          mimeType: c.mimeType,
          previewUrl: url,
          index: i + 1,
        }
      })
      setItems(mapped)
      return urls
    } catch {
      show('读取本地素材失败')
      setItems([])
      return urls
    } finally {
      setLoading(false)
    }
  }, [show])

  useEffect(() => {
    let activeUrls: string[] = []
    const run = () => {
      void loadClips(activeUrls).then((urls) => {
        activeUrls = urls
      })
    }
    run()
    const onChange = () => run()
    window.addEventListener(VLOG_MATERIALS_CHANGED, onChange)
    return () => {
      window.removeEventListener(VLOG_MATERIALS_CHANGED, onChange)
      activeUrls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [loadClips])

  const handleTrimClip = useCallback(
    async (item: ClipPreviewItem) => {
      if (trimmingId || deletingId) return
      setTrimmingId(item.id)
      try {
        const ok = await trimExistingSceneClip(item.sceneId, item.sceneTitle)
        show(ok ? '已裁剪并更新该段素材' : '已取消裁剪')
      } catch {
        show('裁剪失败，请重试')
      } finally {
        setTrimmingId(null)
      }
    },
    [trimmingId, deletingId, show],
  )

  const handleDeleteClip = useCallback(
    async (item: ClipPreviewItem) => {
      if (deletingId) return
      const ok = window.confirm(`确定删除「${item.sceneTitle}」这段素材吗？`)
      if (!ok) return
      setDeletingId(item.id)
      try {
        await deleteClip(item.id)
        markUndone(item.sceneId)
        show('已删除该段素材')
      } catch {
        show('删除失败，请重试')
      } finally {
        setDeletingId(null)
      }
    },
    [deletingId, show, markUndone],
  )

  const totalDurationMs = items.reduce((s, c) => s + c.durationMs, 0)
  const totalSizeMb = items.reduce((s, c) => s + c.sizeBytes, 0) / 1024 / 1024

  const missingScenes = getActiveScenes().filter(
    (s) => !items.some((c) => c.sceneId === s.id),
  )

  return (
    <PageShell scrollable className="pb-8">
      <header className="sticky top-0 z-10 flex items-center bg-bg/90 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate('/vlog-learn')}
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface active:scale-95"
          aria-label="返回清单"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="flex-1 text-center text-[15px] font-semibold text-text">已采集素材</h1>
        <span className="w-9" />
      </header>

      <section className="space-y-4 px-4">
        <div className="rounded-[var(--radius-lg)] bg-primary/5 px-4 py-3 ring-1 ring-primary/15">
          <div className="flex items-center gap-2">
            <FolderOpen size={18} className="shrink-0 text-primary" />
            <p className="text-xs font-semibold text-text">
              {loading
                ? '正在加载…'
                : `共 ${items.length} 段 · ${formatDurationMs(totalDurationMs)} · 约 ${totalSizeMb.toFixed(1)} MB`}
            </p>
          </div>
          <p className="mt-1 text-[10px] leading-relaxed text-text-muted">
            可逐段播放确认；需要精剪时点「裁剪片段」。不需要的素材可点右侧删除。
          </p>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-text-muted">加载素材中…</p>
        ) : items.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] bg-surface px-4 py-10 text-center ring-1 ring-border">
            <p className="text-sm text-text-secondary">暂无素材</p>
            <button
              type="button"
              onClick={() => navigate('/vlog-learn')}
              className="mt-4 text-sm font-medium text-primary"
            >
              去拍摄或导入
            </button>
          </div>
        ) : (
          <ul className="space-y-4" role="list">
            {items.map((item) => (
              <li key={item.id}>
                <MaterialClipCard
                  sceneTitle={item.sceneTitle}
                  sceneSubtitle={item.sceneSubtitle}
                  durationMs={item.durationMs}
                  sizeBytes={item.sizeBytes}
                  mimeType={item.mimeType}
                  previewUrl={item.previewUrl}
                  index={item.index}
                  deleting={deletingId === item.id}
                  trimming={trimmingId === item.id}
                  onTrim={() => void handleTrimClip(item)}
                  onDelete={() => void handleDeleteClip(item)}
                />
              </li>
            ))}
          </ul>
        )}

        {!loading && missingScenes.length > 0 && items.length > 0 ? (
          <p className="text-center text-[10px] text-text-muted">
            尚有 {missingScenes.length} 个场景未采集：{missingScenes.map((s) => s.title).join('、')}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => navigate('/vlog-learn')}
          className="w-full rounded-[var(--radius-lg)] bg-surface py-3 text-sm font-medium text-text ring-1 ring-border active:scale-[0.99]"
        >
          返回拍摄清单
        </button>
      </section>

      <Toast message={message} visible={visible} />
    </PageShell>
  )
}
