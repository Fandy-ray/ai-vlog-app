import { ArrowLeft, Film, Plus, Trash2, Upload, Users } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchCollaborationRoomByCode } from '@/api/collaboration'
import { Button } from '@/components/Button'
import { PageShell } from '@/components/PageShell'
import { Toast } from '@/components/Toast'
import { useToast } from '@/hooks/useToast'
import { resetEditorSession } from '@/state/editorSession'
import { clearActiveDraftId } from '@/utils/editorDraftStore'
import {
  revokeEditorProject,
  setStudioEditorProject,
} from '@/state/importedProject'
import { STUDIO_EXPORT_RESULT_KEY } from '@/constants/projectFlow'
import { resolveCollabSnapshotClips } from '@/utils/collaborativeSnapshot'
import type { VideoClip } from '@/data/mockProject'
import type { EditorSnapshot } from '@/types/editorState'
import { formatTime } from '@/utils/formatTime'
import { assertAlbumAccessAllowed } from '@/utils/privacySettings'
import {
  buildClipsFromImports,
  probeVideoFile,
  type ImportedVideoFile,
} from '@/utils/videoImport'

type CreateMode = 'import' | 'join'

function studioProjectFromCollabSnapshot(snapshot: EditorSnapshot): {
  clips: VideoClip[]
  duration: number
} {
  const clips = resolveCollabSnapshotClips(snapshot.videoClips ?? [])
  const duration =
    snapshot.videoDuration ??
    (clips.reduce((sum, clip) => sum + clip.duration, 0) || 1)

  if (clips.length) return { clips, duration }

  const placeholder: VideoClip = {
    id: 'collab-placeholder',
    start: 0,
    duration: Math.max(1, duration),
    thumb: '',
    poster: '',
  }
  return { clips: [placeholder], duration: Math.max(1, duration) }
}

export function CreatePage() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<CreateMode>('import')
  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [items, setItems] = useState<ImportedVideoFile[]>([])
  const [loading, setLoading] = useState(false)
  const { message, show, visible } = useToast()

  useEffect(() => {
    revokeEditorProject()
  }, [])

  const totalDuration = items.reduce((sum, item) => sum + item.duration, 0)

  const openFilePicker = useCallback(() => {
    try {
      assertAlbumAccessAllowed()
      inputRef.current?.click()
    } catch (error) {
      show(error instanceof Error ? error.message : '无法访问相册')
    }
  }, [show])

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
    clearActiveDraftId()
    try {
      sessionStorage.removeItem(STUDIO_EXPORT_RESULT_KEY)
    } catch {
      /* ignore */
    }
    setStudioEditorProject(buildClipsFromImports(items))
    navigate('/editor')
  }

  const joinCollaboration = useCallback(async () => {
    const code = joinCode.trim().toUpperCase()
    if (!code) {
      show('请输入共同编辑邀请码')
      return
    }

    setJoining(true)
    try {
      const { room, canJoin, snapshot } = await fetchCollaborationRoomByCode(code)
      if (!canJoin) {
        show('创建者已关闭共同编辑')
        return
      }

      const { clips, duration } = studioProjectFromCollabSnapshot(snapshot)

      resetEditorSession()
      clearActiveDraftId()
      try {
        sessionStorage.removeItem(STUDIO_EXPORT_RESULT_KEY)
      } catch {
        /* ignore */
      }
      setStudioEditorProject({ clips, duration })
      navigate(`/editor?collab=${encodeURIComponent(room.inviteCode)}`)
    } catch (error) {
      show(error instanceof Error ? error.message : '加入共同编辑失败')
    } finally {
      setJoining(false)
    }
  }, [joinCode, navigate, show])

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
        <div
          className="mb-5 grid grid-cols-2 gap-2 rounded-[var(--radius-lg)] bg-surface p-1 ring-1 ring-border"
          role="tablist"
          aria-label="导入方式"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'import'}
            onClick={() => setMode('import')}
            className={`rounded-[var(--radius-md)] py-2.5 text-sm font-medium transition-colors ${
              mode === 'import'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text'
            }`}
          >
            导入本地视频
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'join'}
            onClick={() => setMode('join')}
            className={`inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-md)] py-2.5 text-sm font-medium transition-colors ${
              mode === 'join'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text'
            }`}
          >
            <Users size={15} />
            加入共同编辑
          </button>
        </div>

        {mode === 'join' ? (
          <div className="mb-6 rounded-[var(--radius-xl)] border border-primary/20 bg-primary/5 p-5 shadow-[var(--shadow-card)]">
            <p className="text-sm font-semibold text-text">输入共同编辑邀请码</p>
            <p className="mt-1 text-xs leading-relaxed text-text-muted">
              向创建者索取邀请码后加入。创建者的视频将自动同步，滤镜、文字、贴纸等设置也会实时同步。
            </p>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="例如 A1B2C3"
              className="mt-4 w-full rounded-[var(--radius-md)] border border-border bg-white px-3 py-2.5 text-sm uppercase tracking-widest outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              autoComplete="off"
              spellCheck={false}
            />
            <Button
              fullWidth
              size="lg"
              className="mt-4"
              disabled={joining || !joinCode.trim()}
              onClick={() => void joinCollaboration()}
            >
              {joining ? '正在加入…' : '加入并进入剪辑'}
            </Button>
          </div>
        ) : (
          <>
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
          onClick={openFilePicker}
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
                onClick={openFilePicker}
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
          </>
        )}
      </section>

      <Toast message={message} visible={visible} />
    </PageShell>
  )
}

