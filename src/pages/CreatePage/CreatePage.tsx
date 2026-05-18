import { ArrowLeft, Film, Plus, Trash2, Upload } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { PageShell } from '@/components/PageShell'
import { Toast } from '@/components/Toast'
import { useToast } from '@/hooks/useToast'
import { resetEditorSession } from '@/state/editorSession'
import { setEditorProject } from '@/state/importedProject'
import { formatTime } from '@/utils/formatTime'
import {
  buildClipsFromImports,
  probeVideoFile,
  type ImportedVideoFile,
} from '@/utils/videoImport'

export function CreatePage() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<ImportedVideoFile[]>([])
  const [loading, setLoading] = useState(false)
  const { message, show, visible } = useToast()

  const totalDuration = items.reduce((sum, item) => sum + item.duration, 0)

  const addFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return

      setLoading(true)
      try {
        const imported = await Promise.all(
          Array.from(files)
            .filter((file) => file.type.startsWith('video/'))
            .map((file) => probeVideoFile(file)),
        )

        if (!imported.length) {
          show('请选择视频文件（mp4、mov 等）')
          return
        }

        setItems((prev) => [...prev, ...imported])
      } catch {
        show('读取视频失败，请换一个小一点的文件重试')
      } finally {
        setLoading(false)
        if (inputRef.current) inputRef.current.value = ''
      }
    },
    [show],
  )

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id)
      if (target?.objectUrl.startsWith('blob:')) {
        URL.revokeObjectURL(target.objectUrl)
      }
      return prev.filter((item) => item.id !== id)
    })
  }

  const startEdit = () => {
    if (!items.length) {
      show('请先导入至少一个视频')
      return
    }

    resetEditorSession()
    setEditorProject(buildClipsFromImports(items))
    navigate('/editor')
  }

  return (
    <PageShell scrollable className="pb-6">
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-bg/90 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface"
          aria-label="返回"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold text-text">导入素材</h1>
          <p className="text-xs text-text-muted">从本机选择视频，再进入智能剪辑</p>
        </div>
      </header>

      <section className="flex-1 px-4">
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />

        <button
          type="button"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
          className="mb-5 flex w-full flex-col items-center justify-center rounded-[var(--radius-xl)] border-2 border-dashed border-primary/35 bg-surface px-6 py-10 text-center shadow-[var(--shadow-card)] transition-colors hover:border-primary/60 hover:bg-primary/5 active:scale-[0.99] disabled:opacity-60"
        >
          <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {loading ? (
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <Upload size={28} strokeWidth={1.75} />
            )}
          </span>
          <span className="text-base font-semibold text-text">
            {loading ? '正在读取视频…' : '点击选择视频'}
          </span>
          <span className="mt-1 text-sm text-text-muted">支持多选 · mp4 / mov / webm 等</span>
        </button>

        {items.length > 0 && (
          <>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-text">
                已导入 {items.length} 个视频 · 总时长 {formatTime(totalDuration)}
              </p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary"
              >
                <Plus size={14} />
                继续添加
              </button>
            </div>

            <ul className="mb-6 space-y-3">
              {items.map((item, index) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-[var(--radius-lg)] bg-surface p-3 shadow-[var(--shadow-card)]"
                >
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-track-video">
                    {item.thumb ? (
                      <img
                        src={item.thumb}
                        alt=""
                        className="h-full w-full object-cover"
                        draggable={false}
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-text-muted">
                        <Film size={22} />
                      </span>
                    )}
                    <span className="absolute bottom-1 right-1 rounded bg-black/65 px-1 py-0.5 text-[10px] tabular-nums text-white">
                      {formatTime(item.duration)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">
                      {index + 1}. {item.name}
                    </p>
                    <p className="mt-0.5 text-xs text-text-muted">本地视频 · 已就绪</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-red-50 hover:text-red-500"
                    aria-label="移除"
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {items.length === 0 && !loading && (
          <p className="mb-6 text-center text-sm text-text-muted">
            导入的视频将按顺序拼接在时间轴上，可在剪辑页预览与编辑。
          </p>
        )}

        <Button fullWidth size="lg" disabled={!items.length || loading} onClick={startEdit}>
          开始智能剪辑
        </Button>
      </section>

      <Toast message={message} visible={visible} />
    </PageShell>
  )
}

