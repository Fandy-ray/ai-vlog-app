import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Eye,
  Film,
  Loader2,
  MessageSquarePlus,
  RefreshCw,
  Save,
  Sparkles,
  Wand2,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '@/components/PageShell'
import { Toast } from '@/components/Toast'
import { useToast } from '@/hooks/useToast'
import { useVlogChecklist } from '@/hooks/useVlogChecklist'
import { useVlogDirector } from '@/hooks/useVlogDirector'
import { useVlogMaterials } from '@/hooks/useVlogMaterials'
import type { VlogGenerateManifest } from '@/types/vlogGenerate'
import { formatDurationMs } from '@/utils/formatTime'
import { SceneChecklistRow } from '@/components/SceneChecklistRow/SceneChecklistRow'
import { fetchDirectorPlan } from '@/api/vlogDirector'
import {
  clearDirectorSession,
  getDirectorType,
  hasDirectorSession,
  saveDirectorSession,
} from '@/utils/vlogDirectorStore'
import {
  commitAllClips,
  discardUncommittedClips,
  exportClipsForUpload,
} from '@/utils/vlogMaterialStore'
import { markSceneDone } from '@/utils/vlogChecklistStore'

const REFINE_SUGGESTIONS = [
  '多拍风景空镜，少拍人物正脸',
  '增加美食特写和制作过程',
  '只要 4 个场景，节奏更快',
  '更治愈慢节奏，多用手持跟拍',
  '突出学习专注，桌面俯拍为主',
]

export function VlogLearnPage() {
  const navigate = useNavigate()
  const { isDone, toggle, doneCount, totalCount } = useVlogChecklist()
  const {
    clips,
    hasSceneClip,
    clipCount,
    hasUnsavedDrafts,
    allMaterialsSaved,
    refresh: refreshMaterials,
  } = useVlogMaterials()
  const { session, scenes, styleId, hasSession, refresh: refreshDirector } = useVlogDirector()
  const { message, show, visible } = useToast()
  const [generating, setGenerating] = useState(false)
  const [refineOpen, setRefineOpen] = useState(false)
  const [refinement, setRefinement] = useState('')
  const [refining, setRefining] = useState(false)
  const [savingMaterials, setSavingMaterials] = useState(false)
  const [wantNarration, setWantNarration] = useState(false)
  const [materialsSaved, setMaterialsSaved] = useState(false)
  const leavingForGenerate = useRef(false)

  useEffect(() => {
    leavingForGenerate.current = false
  }, [])

  useEffect(() => {
    if (!hasDirectorSession()) {
      navigate('/ai-director/theme', { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    setMaterialsSaved(allMaterialsSaved)
  }, [allMaterialsSaved])

  useEffect(() => {
    for (const c of clips) {
      markSceneDone(c.sceneId)
    }
  }, [clips])

  useEffect(() => {
    return () => {
      const path = window.location.pathname
      if (path.startsWith('/vlog-learn') || leavingForGenerate.current) return
      void discardUncommittedClips()
    }
  }, [])

  const handleSaveMaterials = useCallback(async () => {
    if (clipCount < 1) {
      show('暂无素材可保存')
      return
    }
    setSavingMaterials(true)
    try {
      await commitAllClips()
      await refreshMaterials()
      setMaterialsSaved(true)
      show('素材已保存，可选择成片风格并生成 Vlog')
    } catch {
      show('保存失败，请重试')
    } finally {
      setSavingMaterials(false)
    }
  }, [clipCount, show, refreshMaterials])

  const handleGenerateVlog = useCallback(async () => {
    if (clipCount < 1) {
      show('请先拍摄或导入至少一个场景素材')
      return
    }
    if (!materialsSaved && hasUnsavedDrafts) {
      show('请先点击「保存素材」，再生成成片')
      return
    }
    setGenerating(true)
    try {
      await commitAllClips()
      const clips = await exportClipsForUpload()
      const manifest: VlogGenerateManifest = {
        type: getDirectorType(),
        style: styleId,
        theme: session?.theme,
        stylePreference: session?.stylePreference,
        refinement: session?.lastRefinement,
        enableNarration: wantNarration,
        projectTitle: session?.projectTitle,
        directorScenes: session?.scenes?.map((s) => ({
          id: s.id,
          title: s.title,
          subtitle: s.subtitle,
          aiPrompt: s.aiPrompt,
        })),
        scenes: clips.map((c) => {
          const sceneMeta = scenes.find((s) => s.id === c.sceneId)
          return {
            clipId: c.id,
            sceneId: c.sceneId,
            sceneTitle: sceneMeta?.title ?? c.name.replace(/\.mp4$/, ''),
            subtitle: sceneMeta?.subtitle,
            duration: c.duration,
          }
        }),
      }
      leavingForGenerate.current = true
      navigate('/vlog-learn/generate', { state: { clips, manifest } })
    } catch {
      show('读取本地素材失败')
    } finally {
      setGenerating(false)
    }
  }, [
    clipCount,
    navigate,
    show,
    styleId,
    scenes,
    session,
    materialsSaved,
    hasUnsavedDrafts,
    wantNarration,
  ])

  const totalDurationMs = clips.reduce((sum, c) => sum + c.durationMs, 0)
  const totalSizeMb = clips.reduce((sum, c) => sum + c.sizeBytes, 0) / 1024 / 1024

  const pageTitle = session?.projectTitle || 'AI 导拍'

  const handleRefinePlan = useCallback(async () => {
    if (!session) return
    const text = refinement.trim()
    if (text.length < 4) {
      show('请具体说明你想怎么改（至少 4 个字）')
      return
    }
    setRefining(true)
    try {
      const plan = await fetchDirectorPlan(session.theme, session.stylePreference, {
        refinement: text,
        previousScenes: scenes,
      })
      saveDirectorSession({
        theme: plan.theme,
        stylePreference: plan.stylePreference,
        styleId: plan.styleId,
        type: plan.type,
        projectTitle: plan.projectTitle,
        provider: plan.provider,
        scenes: plan.scenes,
        lastRefinement: text,
      })
      refreshDirector()
      setRefineOpen(false)
      setRefinement('')
      show('导拍方案已按你的要求更新')
    } catch (err) {
      show(err instanceof Error ? err.message : '重新生成失败')
    } finally {
      setRefining(false)
    }
  }, [session, refinement, scenes, show, refreshDirector])

  return (
    <PageShell scrollable className="pb-6">
      <header className="sticky top-0 z-10 flex items-center bg-bg/90 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface active:scale-95"
          aria-label="返回"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="flex-1 truncate px-2 text-center text-[15px] font-semibold text-text">
          {pageTitle}
        </h1>
        <button
          type="button"
          onClick={() => {
            clearDirectorSession()
            navigate('/ai-director/theme')
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface active:scale-95"
          aria-label="重新设定主题"
          title="重新设定主题"
        >
          <RefreshCw size={18} />
        </button>
      </header>

      <section className="flex-1 space-y-5 px-4">
        <section className="rounded-[var(--radius-xl)] bg-gradient-to-br from-primary/10 via-surface to-accent/10 p-4 shadow-[var(--shadow-card)]">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-[var(--shadow-soft)]">
              <Sparkles size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text">AI 专属导拍清单</p>
              {hasSession && session ? (
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                  主题：{session.theme}
                  <br />
                  风格：{session.stylePreference}
                  {session.lastRefinement ? (
                    <>
                      <br />
                      <span className="text-text-muted">
                        已按你的要求调整：{session.lastRefinement.slice(0, 40)}
                        {session.lastRefinement.length > 40 ? '…' : ''}
                      </span>
                    </>
                  ) : null}
                  {session.provider === 'mock' ? (
                    <span className="text-text-muted"> · 本地智能模板</span>
                  ) : null}
                </p>
              ) : (
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                  每个场景可现场拍摄，也可从相册导入。素材保存在本机。
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setRefineOpen((v) => !v)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-surface py-2.5 text-xs font-semibold text-text ring-1 ring-border transition-transform active:scale-[0.99]"
          >
            <MessageSquarePlus size={16} className="text-primary" />
            {refineOpen ? '收起调整' : '导拍不满意？补充要求重新生成'}
            {refineOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {refineOpen && (
            <div className="mt-3 space-y-3 rounded-[var(--radius-md)] bg-surface/80 p-3 ring-1 ring-border">
              <p className="text-[10px] leading-relaxed text-text-muted">
                说明你想改什么，例如镜头数量、多拍/少拍某类画面、构图偏好。AI 会结合当前主题与风格重新生成清单。
                {clipCount > 0 ? ' 已拍素材会保留，但场景名称可能对不上新清单。' : ''}
              </p>
              <textarea
                value={refinement}
                onChange={(e) => setRefinement(e.target.value)}
                placeholder="例如：不要人物开场，改成从咖啡店外景开始；增加 2 个美食特写…"
                rows={4}
                className="w-full resize-none rounded-[var(--radius-md)] bg-bg px-3 py-2.5 text-sm text-text ring-1 ring-border outline-none placeholder:text-text-muted focus:ring-2 focus:ring-primary/40"
              />
              <div className="flex flex-wrap gap-1.5">
                {REFINE_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRefinement((prev) => (prev ? `${prev}；${s}` : s))}
                    className="rounded-full bg-bg px-2.5 py-1 text-[10px] text-text-secondary ring-1 ring-border active:scale-95"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={refining || refinement.trim().length < 4}
                onClick={() => void handleRefinePlan()}
                className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary py-2.5 text-xs font-semibold text-white shadow-[var(--shadow-soft)] disabled:opacity-50"
              >
                {refining ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    AI 正在重新生成…
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    按补充要求重新生成导拍
                  </>
                )}
              </button>
            </div>
          )}
        </section>

        {clipCount > 0 && (
          <section className="rounded-[var(--radius-lg)] bg-primary/5 px-4 py-3 ring-1 ring-primary/15">
            <div className="flex items-center gap-3">
              <Film size={18} className="shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-text">
                  已采集 {clipCount} 段素材
                </p>
                <p className="mt-0.5 text-[10px] text-text-muted">
                  总时长 {formatDurationMs(totalDurationMs)} · 约 {totalSizeMb.toFixed(1)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/vlog-learn/materials')}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-surface py-2.5 text-xs font-semibold text-primary ring-1 ring-primary/25 transition-transform active:scale-[0.99]"
            >
              <Eye size={16} />
              查看已上传素材
            </button>
            <button
              type="button"
              disabled={savingMaterials}
              onClick={() => void handleSaveMaterials()}
              className={`mt-2 flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] py-2.5 text-xs font-semibold transition-transform active:scale-[0.99] disabled:opacity-50 ${
                materialsSaved
                  ? 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/25'
                  : 'bg-primary text-white shadow-[var(--shadow-soft)]'
              }`}
            >
              {savingMaterials ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  保存中…
                </>
              ) : (
                <>
                  <Save size={16} />
                  {materialsSaved ? '素材已保存' : '保存素材'}
                </>
              )}
            </button>
            {hasUnsavedDrafts && !materialsSaved ? (
              <p className="mt-2 text-center text-[10px] text-amber-700">
                未保存的素材在离开本页时会被清理
              </p>
            ) : null}
          </section>
        )}

        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-text">拍摄场景</h2>
            <span className="text-[10px] text-text-muted">
              已完成 {doneCount}/{totalCount}
            </span>
          </div>

          <ul className="space-y-2.5" role="list">
            {scenes.map((s) => (
              <SceneChecklistRow
                key={s.id}
                scene={s}
                done={isDone(s.id)}
                recorded={hasSceneClip(s.id)}
                clip={clips.find((c) => c.sceneId === s.id)}
                onToggle={() => toggle(s.id)}
                onShoot={() => navigate(`/vlog-learn/shoot/${s.id}`)}
                onToast={show}
              />
            ))}
          </ul>

          {materialsSaved && (
            <>
              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] bg-surface px-3 py-3 ring-1 ring-border">
                <input
                  type="checkbox"
                  checked={wantNarration}
                  onChange={(e) => setWantNarration(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="min-w-0">
                  <span className="text-xs font-semibold text-text">需要 AI 旁白配音</span>
                  <span className="mt-0.5 block text-[10px] leading-relaxed text-text-muted">
                    不勾选则仅章节配乐与环境声，不自动生成旁白与字幕
                  </span>
                </span>
              </label>

              <button
                type="button"
                disabled={generating || clipCount < 1}
                onClick={() => void handleGenerateVlog()}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-gradient-to-r from-primary to-primary-light py-3.5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition-transform active:scale-[0.99] disabled:opacity-50"
              >
                <Wand2 size={18} />
                {generating ? '准备素材中…' : 'AI 自动生成 Vlog 成片'}
              </button>
              <p className="mt-2 text-center text-[10px] text-text-muted">
                AI 精选 6–8 镜 · 章节 BGM · 720p 快编（约 1–2 分钟）
              </p>
            </>
          )}

          {clipCount > 0 && !materialsSaved ? (
            <p className="mt-4 text-center text-[10px] text-text-muted">
              保存素材后即可 AI 生成 Vlog
            </p>
          ) : null}

          {clipCount < 1 ? (
            <p className="mt-2 text-center text-[10px] text-text-muted">
              按上方场景完成拍摄或导入至少一段素材
            </p>
          ) : null}
        </section>
      </section>

      <Toast message={message} visible={visible} />
    </PageShell>
  )
}
