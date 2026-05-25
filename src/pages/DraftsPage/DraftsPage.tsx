import { ArrowLeft, FilePenLine, Film, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '@/components/PageShell'
import { Toast } from '@/components/Toast'
import { useToast } from '@/hooks/useToast'
import { setEditorSession } from '@/state/editorSession'
import { setStudioEditorProject } from '@/state/importedProject'
import {
  deleteEditorDraft,
  listEditorDrafts,
  loadEditorDraft,
  setActiveDraftId,
  type EditorDraftSummary,
} from '@/utils/editorDraftStore'
import { formatTime } from '@/utils/formatTime'

function formatRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp
  if (diff < 60_000) return '刚刚编辑'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`
  return `${Math.floor(diff / 86_400_000)} 天前`
}

export function DraftsPage() {
  const navigate = useNavigate()
  const { message, show, visible } = useToast()
  const [drafts, setDrafts] = useState<EditorDraftSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [openingId, setOpeningId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setDrafts(await listEditorDrafts())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const handleOpen = async (id: string) => {
    setOpeningId(id)
    try {
      const loaded = await loadEditorDraft(id)
      if (!loaded) {
        show('草稿不存在或已损坏')
        void refresh()
        return
      }

      setActiveDraftId(id)
      setStudioEditorProject({
        clips: loaded.clips,
        duration: loaded.duration,
      })
      setEditorSession(loaded.snapshot)
      navigate('/editor')
    } catch {
      show('打开草稿失败，请重试')
    } finally {
      setOpeningId(null)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteEditorDraft(id)
      setDrafts((prev) => prev.filter((item) => item.id !== id))
      show('已删除草稿')
    } catch {
      show('删除失败')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <PageShell scrollable className="pb-8">
      <header className="sticky top-0 z-10 flex items-center bg-bg/90 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface active:scale-95"
          aria-label="返回"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="flex-1 text-center text-[15px] font-semibold text-text">草稿</h1>
        <span className="w-9" />
      </header>

      <div className="flex-1 px-4 pt-2">
        <p className="mb-4 rounded-[var(--radius-lg)] bg-primary/5 px-4 py-3 text-xs leading-relaxed text-text-secondary ring-1 ring-primary/10">
          编辑到一半、尚未导出的项目会保存在本机。点击可继续剪辑。
        </p>

        {loading ? (
          <p className="py-12 text-center text-sm text-text-muted">加载中…</p>
        ) : drafts.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-bg text-text-muted">
              <FilePenLine size={28} strokeWidth={1.5} />
            </span>
            <p className="mt-4 text-sm font-medium text-text">暂无草稿</p>
            <p className="mt-1 max-w-[240px] text-xs text-text-muted">
              在编辑器中导入视频并剪辑后退出，未导出的作品会出现在这里
            </p>
            <button
              type="button"
              onClick={() => navigate('/create')}
              className="mt-5 text-sm font-medium text-primary"
            >
              去创建 Vlog
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {drafts.map((draft) => (
              <li
                key={draft.id}
                className="overflow-hidden rounded-[var(--radius-xl)] bg-surface shadow-[var(--shadow-card)]"
              >
                <button
                  type="button"
                  onClick={() => void handleOpen(draft.id)}
                  disabled={openingId === draft.id}
                  className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-bg/60 active:bg-bg disabled:opacity-60"
                >
                  <div className="relative h-[72px] w-[108px] shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-bg">
                    {draft.poster ? (
                      <img
                        src={draft.poster}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-text-muted">
                        <Film size={24} />
                      </span>
                    )}
                    <span className="absolute bottom-1 right-1 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      {formatTime(draft.duration)}
                    </span>
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-sm font-semibold text-text">
                      {draft.title}
                    </span>
                    <span className="mt-1 block text-[11px] text-text-muted">
                      {draft.clipCount} 段素材 · {formatRelativeTime(draft.updatedAt)}
                    </span>
                    <span className="mt-1 block text-[11px] text-primary">
                      {openingId === draft.id ? '正在打开…' : '继续编辑'}
                    </span>
                  </span>
                </button>
                <div className="flex border-t border-border/80">
                  <button
                    type="button"
                    onClick={() => void handleDelete(draft.id)}
                    disabled={deletingId === draft.id}
                    className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs text-text-muted transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    {deletingId === draft.id ? '删除中…' : '删除草稿'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Toast message={message} visible={visible} />
    </PageShell>
  )
}
