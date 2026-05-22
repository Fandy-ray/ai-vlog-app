import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Circle,
  RefreshCw,
  Square,
  Trash2,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CameraNineGridOverlay } from '@/components/CameraNineGridOverlay'
import { GuideTip } from '@/components/GuideTip'
import { PageShell } from '@/components/PageShell'
import { formatSubjectCells } from '@/data/vlogGuide'
import { getVlogScene } from '@/utils/vlogDirectorStore'
import { useCamera } from '@/hooks/useCamera'
import { useSceneClip } from '@/hooks/useVlogMaterials'
import { useVideoRecorder } from '@/hooks/useVideoRecorder'
import { useVlogChecklist } from '@/hooks/useVlogChecklist'
import { formatDurationMs } from '@/utils/formatTime'
import { SceneVideoImportButton } from '@/components/SceneVideoImportButton/SceneVideoImportButton'
import { useSceneVideoImport } from '@/hooks/useSceneVideoImport'
import { TrimClipButton } from '@/components/TrimClipButton'
import { deleteClip, saveClipForScene } from '@/utils/vlogMaterialStore'
import { trimExistingSceneClip } from '@/utils/trimSceneClip'

export function VlogShootPage() {
  const { sceneId } = useParams<{ sceneId: string }>()
  const navigate = useNavigate()
  const { isDone, markDone, markUndone } = useVlogChecklist()
  const [tipsExpanded, setTipsExpanded] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveHint, setSaveHint] = useState<string | null>(null)
  const [viewPlayback, setViewPlayback] = useState(false)
  const [trimming, setTrimming] = useState(false)
  const playbackRef = useRef<HTMLVideoElement>(null)
  const stoppingRef = useRef(false)

  const scene = sceneId ? getVlogScene(sceneId) : undefined
  const done = scene ? isDone(scene.id) : false
  const { videoRef, stream, ready, error, retry } = useCamera(!!scene)
  const { clip, previewUrl, refresh: refreshClip } = useSceneClip(scene?.id)
  const { recording, elapsedMs, start, stop, maxMs } = useVideoRecorder(stream)
  const { importing, importFromGallery } = useSceneVideoImport(
    scene?.id ?? '',
    scene?.title ?? '',
  )

  useEffect(() => {
    if (!scene) {
      navigate('/vlog-learn', { replace: true })
    }
  }, [scene, navigate])

  const finishRecording = useCallback(async () => {
    if (stoppingRef.current || !scene) return
    stoppingRef.current = true
    setSaving(true)
    try {
      const recorded = await stop()
      if (!recorded.blob || recorded.blob.size < 1) {
        setSaveHint('录像过短，请重新拍摄')
        return
      }
      const meta = await saveClipForScene(
        scene.id,
        scene.title,
        recorded.blob,
        recorded.durationMs,
      )
      setSaveHint(
        `已保存片段 ${formatDurationMs(meta.durationMs)}，返回清单后请点「保存素材」`,
      )
      markDone(scene.id)
      setViewPlayback(true)
      await refreshClip()
    } finally {
      setSaving(false)
      stoppingRef.current = false
    }
  }, [scene, stop, markDone, refreshClip])

  useEffect(() => {
    if (recording && elapsedMs >= maxMs) {
      void finishRecording()
    }
  }, [recording, elapsedMs, maxMs, finishRecording])

  const handleRecordToggle = useCallback(() => {
    if (saving || stoppingRef.current) return
    if (recording) {
      void finishRecording()
    } else {
      setSaveHint(null)
      setViewPlayback(false)
      start()
    }
  }, [recording, saving, finishRecording, start])

  const handleTrimClip = useCallback(async () => {
    if (!scene || !clip || trimming) return
    setTrimming(true)
    try {
      const ok = await trimExistingSceneClip(scene.id, scene.title)
      if (ok) {
        setSaveHint('已裁剪并更新本段素材')
        await refreshClip()
      }
    } finally {
      setTrimming(false)
    }
  }, [scene, clip, trimming, refreshClip])

  const handleDeleteClip = useCallback(async () => {
    if (!clip || !scene) return
    await deleteClip(clip.id)
    markUndone(scene.id)
    setSaveHint(null)
    setViewPlayback(false)
    await refreshClip()
  }, [clip, scene, refreshClip, markUndone])

  useEffect(() => {
    if (viewPlayback && previewUrl && playbackRef.current) {
      playbackRef.current.src = previewUrl
      void playbackRef.current.play().catch(() => {})
    }
  }, [viewPlayback, previewUrl])

  const handleComplete = useCallback(() => {
    if (!scene) return
    if (clip) markDone(scene.id)
    navigate('/vlog-learn')
  }, [scene, clip, markDone, navigate])

  if (!scene) return null

  const showLive = !viewPlayback || recording
  const recordDisabled = !ready || !!error || saving

  return (
    <PageShell className="bg-black pb-0">
      <header className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent px-4 py-3">
        <button
          type="button"
          onClick={() => navigate('/vlog-learn')}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm active:scale-95"
          aria-label="返回"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-white">{scene.title}</p>
          <p className="text-[10px] text-white/75">{scene.subtitle}</p>
        </div>
        <span className="w-9" />
      </header>

      <section className="relative flex min-h-0 flex-1 flex-col">
        <div className="relative min-h-[52vh] flex-1 overflow-hidden bg-zinc-900">
          {showLive ? (
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`absolute inset-0 h-full w-full object-cover ${
                ready ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ) : (
            previewUrl && (
              <video
                ref={playbackRef}
                playsInline
                controls
                className="absolute inset-0 h-full w-full object-cover"
              />
            )
          )}

          {error && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-zinc-900/95 px-6 text-center">
              <p className="text-sm font-medium text-white">无法访问相机</p>
              <p className="text-xs leading-relaxed text-white/75">{error.message}</p>
              {error.kind === 'insecure' && (
                <p className="rounded-lg bg-white/10 px-3 py-2 text-[10px] leading-relaxed text-white/80">
                  请使用 <span className="font-mono text-accent">https://</span> 地址打开，并允许摄像头与麦克风。
                </p>
              )}
              <button
                type="button"
                onClick={retry}
                className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white active:scale-95"
              >
                <RefreshCw size={14} />
                重试打开相机
              </button>
            </div>
          )}

          {!ready && !error && showLive && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
              <p className="text-xs text-white/60">正在启动相机…</p>
            </div>
          )}

          {showLive && (
            <CameraNineGridOverlay
              subjectCells={scene.subjectCells}
              accentCells={scene.accentCells}
            />
          )}

          {recording && (
            <div className="absolute left-4 top-16 z-20 flex items-center gap-2 rounded-full bg-red-600/90 px-3 py-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
              <span className="text-xs font-semibold tabular-nums text-white">
                {formatDurationMs(elapsedMs)}
              </span>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-2 px-4">
            {saveHint && (
              <p className="rounded-full bg-black/55 px-3 py-1 text-[10px] text-white backdrop-blur-sm">
                {saveHint}
              </p>
            )}
            {clip && !recording && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewPlayback((v) => !v)}
                  className="rounded-full bg-black/55 px-3 py-1 text-[10px] text-white backdrop-blur-sm active:scale-95"
                >
                  {viewPlayback ? '返回实时画面' : `查看已录 (${formatDurationMs(clip.durationMs)})`}
                </button>
                <TrimClipButton
                  variant="dark"
                  loading={trimming}
                  onClick={() => void handleTrimClip()}
                />
                <button
                  type="button"
                  onClick={() => void handleDeleteClip()}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white/90 active:scale-95"
                  aria-label="删除本段录像"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}

            <button
              type="button"
              disabled={recordDisabled}
              onClick={handleRecordToggle}
              className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-white bg-white/10 backdrop-blur-sm transition-transform active:scale-95 disabled:opacity-40"
              aria-label={recording ? '停止录像' : '开始录像'}
            >
              {recording ? (
                <Square size={28} className="fill-red-500 text-red-500" />
              ) : (
                <Circle size={56} className="fill-red-500 text-red-500" strokeWidth={3} />
              )}
            </button>
            <p className="text-[10px] text-white/70">
              {saving
                ? '正在处理…'
                : recording
                  ? '点击停止并保存'
                  : '点击开始录像（最长 60 秒），保存后可点「裁剪片段」'}
            </p>
            {!recording && (
              <SceneVideoImportButton
                importing={importing}
                onImport={importFromGallery}
                onSuccess={async () => {
                  setSaveHint('已从相册导入，返回清单后请点「保存素材」')
                  setViewPlayback(true)
                  await refreshClip()
                }}
                onError={(msg) => setSaveHint(msg)}
                className="!bg-white/15 !text-white ring-1 ring-white/25"
              />
            )}
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        <div className="max-h-[40vh] shrink-0 overflow-y-auto rounded-t-[var(--radius-xl)] bg-bg">
          <button
            type="button"
            onClick={() => setTipsExpanded((v) => !v)}
            className="flex w-full items-center justify-center gap-1 py-2 text-[10px] text-text-muted"
            aria-expanded={tipsExpanded}
          >
            {tipsExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            {tipsExpanded ? '收起提示' : '展开 AI 导拍提示'}
          </button>

          {tipsExpanded && (
            <div className="space-y-4 px-4 pb-4">
              <GuideTip title="AI 导播" description={scene.aiPrompt} />

              <div className="rounded-[var(--radius-md)] bg-surface px-3 py-2.5 shadow-[var(--shadow-card)]">
                <p className="text-xs font-medium text-text">构图要点</p>
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                  {scene.gridSummary}
                </p>
                <p className="mt-2 text-[10px] text-text-muted">
                  建议主体：{formatSubjectCells(scene.subjectCells)}
                </p>
              </div>

              <ol className="space-y-2.5">
                {scene.steps.map((step, i) => (
                  <li
                    key={step}
                    className="flex gap-2.5 text-xs leading-relaxed text-text-secondary"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>

              <button
                type="button"
                onClick={handleComplete}
                className={`flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] py-3 text-sm font-semibold transition-transform active:scale-[0.99] ${
                  done || clip
                    ? 'bg-primary text-white shadow-[var(--shadow-soft)]'
                    : 'bg-surface text-text ring-1 ring-border'
                }`}
              >
                <Check size={18} />
                {clip ? '返回清单' : '暂不录像，返回清单'}
              </button>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  )
}
