import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getClipAtTime,
  PROJECT_DURATION,
  VIDEO_CLIPS,
  type VideoClip,
} from '@/data/mockProject'
import {
  getEditorSession,
  loadEditorSessionFromStorage,
  setEditorSession,
} from '@/state/editorSession'
import { setExportedVideo } from '@/state/exportedVideo'
import { getEditorProject, hasEditorProject } from '@/state/importedProject'
import { exportEditedVideo } from '@/utils/export/exportVideo'
import { PageShell } from '@/components/PageShell'
import { Toast } from '@/components/Toast'
import { AIFeatureBar } from '@/components/editor/AIFeatureBar'
import { AudioPanel } from '@/components/editor/AudioPanel'
import { NarrationPanel } from '@/components/editor/NarrationPanel'
import { BottomToolbar } from '@/components/editor/BottomToolbar'
import { EffectPanel } from '@/components/editor/EffectPanel'
import { FilterPanel } from '@/components/editor/FilterPanel'
import { StickerPanel } from '@/components/editor/StickerPanel'
import { TextPanel } from '@/components/editor/TextPanel'
import { Timeline } from '@/components/editor/Timeline'
import { ExportDialog } from '@/components/editor/ExportDialog'
import { TopBar } from '@/components/editor/TopBar'
import { VideoPreview, type StickerPreviewItem } from '@/components/editor/VideoPreview'
import { formatBgmLabel, getNetworkAudio } from '@/data/audioLibrary'
import { EFFECT_PRESETS } from '@/data/effects'
import { FILTER_PRESETS, getFilterCss } from '@/data/filters'
import { createDefaultStickerOverlay, getStickerPreset } from '@/data/stickers'
import { createDefaultTextOverlay } from '@/data/textStyles'
import { usePlayback } from '@/hooks/usePlayback'
import { useToast } from '@/hooks/useToast'
import { useUndoRedo } from '@/hooks/useUndoRedo'
import type { EditorSnapshot, StickerOverlay, TextOverlay } from '@/types/editorState'

function cloneOverlay(o: TextOverlay): TextOverlay {
  return { ...o }
}

function cloneSticker(o: StickerOverlay): StickerOverlay {
  return { ...o }
}

function cloneStickers(stickers: StickerOverlay[]): StickerOverlay[] {
  return stickers.map(cloneSticker)
}

loadEditorSessionFromStorage()

export function EditorPage() {
  const navigate = useNavigate()
  const imported = getEditorProject()
  const clips = imported?.clips ?? VIDEO_CLIPS
  const projectDuration = imported?.duration ?? PROJECT_DURATION
  const highlightAt = Math.min(projectDuration * 0.54, projectDuration - 1)

  useEffect(() => {
    if (!hasEditorProject()) {
      navigate('/create', { replace: true })
    }
  }, [navigate])

  const {
    state: snapshot,
    push: pushHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo<EditorSnapshot>(getEditorSession())

  useEffect(() => {
    setEditorSession(snapshot)
  }, [snapshot])

  const [titleDraft, setTitleDraft] = useState(snapshot.title)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [activeFeature, setActiveFeature] = useState<string | null>(null)
  const [activeTool, setActiveTool] = useState('cut')
  const [draftFilterId, setDraftFilterId] = useState(snapshot.filterId)
  const [draftIntensity, setDraftIntensity] = useState(snapshot.filterIntensity)
  const [draftEffectId, setDraftEffectId] = useState(snapshot.effectId ?? 'none')
  const [draftText, setDraftText] = useState<TextOverlay | null>(null)
  const [draftSticker, setDraftSticker] = useState<StickerOverlay | null>(null)
  const [draftKeepOriginalAudio, setDraftKeepOriginalAudio] = useState(
    snapshot.keepOriginalAudio,
  )
  const [draftBgmId, setDraftBgmId] = useState<string | null>(snapshot.bgmId)
  const [draftNarrationText, setDraftNarrationText] = useState(
    snapshot.narrationText ??
      '阳光落在画面里，那些认真生活的瞬间，也值得被认真记录。',
  )
  const [draftNarrationVoice, setDraftNarrationVoice] = useState(snapshot.narrationVoice)
  const [draftNarrationEngineId, setDraftNarrationEngineId] = useState(
    snapshot.narrationEngineId,
  )
  const [draftNarrationEnabled, setDraftNarrationEnabled] = useState(
    snapshot.narrationEnabled,
  )
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null)
  const [liveSticker, setLiveSticker] = useState<StickerOverlay | null>(null)
  const { message, show, visible } = useToast()
  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportMessage, setExportMessage] = useState('')
  const exportCancelledRef = useRef(false)

  const appliedFilterId = snapshot.filterId
  const appliedIntensity = snapshot.filterIntensity
  const appliedEffectId = snapshot.effectId ?? 'none'
  const appliedText = snapshot.textOverlay
  const appliedStickers = snapshot.stickerOverlays
  const appliedKeepOriginalAudio = snapshot.keepOriginalAudio
  const appliedBgmId = snapshot.bgmId
  const appliedNarrationText = snapshot.narrationText
  const appliedNarrationVoice = snapshot.narrationVoice
  const appliedNarrationEngineId = snapshot.narrationEngineId
  const appliedNarrationEnabled = snapshot.narrationEnabled
  const title = snapshot.title

  const narrationFields = useMemo(
    () => ({
      narrationText: appliedNarrationText,
      narrationVoice: appliedNarrationVoice,
      narrationEngineId: appliedNarrationEngineId,
      narrationEnabled: appliedNarrationEnabled,
    }),
    [
      appliedNarrationText,
      appliedNarrationVoice,
      appliedNarrationEngineId,
      appliedNarrationEnabled,
    ],
  )

  const showFilterPanel = activeTool === 'filter'
  const showAudioPanel = activeTool === 'audio'
  const showNarrationPanel = activeFeature === 'narration'
  const showEffectPanel = activeTool === 'effect'
  const showTextPanel = activeTool === 'text'
  const showStickerPanel = activeTool === 'sticker'
  const isTextEditing = showTextPanel && draftText != null
  const isStickerPanelEditing = showStickerPanel

  const previewFilterId = showFilterPanel ? draftFilterId : appliedFilterId
  const previewIntensity = showFilterPanel ? draftIntensity : appliedIntensity
  const previewEffectId = showEffectPanel ? draftEffectId : appliedEffectId
  const previewKeepOriginalAudio = showAudioPanel
    ? draftKeepOriginalAudio
    : appliedKeepOriginalAudio
  const previewBgmId = showAudioPanel ? draftBgmId : appliedBgmId
  const previewText = isTextEditing ? draftText : appliedText
  const previewStickerItems = useMemo((): StickerPreviewItem[] => {
    const items: StickerPreviewItem[] = appliedStickers.map((s) => {
      if (
        !isStickerPanelEditing &&
        selectedStickerId === s.id &&
        liveSticker
      ) {
        return { overlay: liveSticker, editable: true }
      }
      return { overlay: s, editable: false }
    })

    if (isStickerPanelEditing && draftSticker) {
      items.push({ overlay: draftSticker, editable: true })
    }

    return items
  }, [
    appliedStickers,
    isStickerPanelEditing,
    draftSticker,
    selectedStickerId,
    liveSticker,
  ])

  const { currentTime, isPlaying, seek, togglePlay, setIsPlaying } = usePlayback(
    projectDuration,
    0,
  )

  const activeClip = useMemo(
    () => getClipAtTime(currentTime, clips, projectDuration),
    [currentTime, clips, projectDuration],
  )

  const clipTime = Math.max(0, currentTime - activeClip.start)

  const handleClipSelect = useCallback(
    (clip: VideoClip) => {
      setIsPlaying(false)
      seek(clip.start)
    },
    [seek, setIsPlaying],
  )

  const handleSeekRatio = (ratio: number) => {
    seek(ratio * projectDuration)
  }

  const closeAllPanels = useCallback(() => {
    setActiveTool('cut')
    setActiveFeature(null)
  }, [])

  const syncDraftFromSnapshot = useCallback(() => {
    setDraftFilterId(snapshot.filterId)
    setDraftIntensity(snapshot.filterIntensity)
    setDraftEffectId(snapshot.effectId ?? 'none')
    setDraftKeepOriginalAudio(snapshot.keepOriginalAudio)
    setDraftBgmId(snapshot.bgmId)
    setDraftNarrationText(
      snapshot.narrationText ??
        '阳光落在画面里，那些认真生活的瞬间，也值得被认真记录。',
    )
    setDraftNarrationVoice(snapshot.narrationVoice)
    setDraftNarrationEngineId(snapshot.narrationEngineId)
    setDraftNarrationEnabled(snapshot.narrationEnabled)
    setTitleDraft(snapshot.title)
  }, [snapshot])

  useEffect(() => {
    if (!showFilterPanel && !showEffectPanel && !showAudioPanel) syncDraftFromSnapshot()
  }, [snapshot, showFilterPanel, showEffectPanel, showAudioPanel, syncDraftFromSnapshot])

  const openFilterPanel = () => {
    setDraftFilterId(appliedFilterId)
    setDraftIntensity(appliedIntensity)
    setActiveTool('filter')
  }

  const cancelFilterPanel = () => {
    setDraftFilterId(appliedFilterId)
    setDraftIntensity(appliedIntensity)
    closeAllPanels()
  }

  const openEffectPanel = () => {
    setDraftEffectId(appliedEffectId)
    setActiveTool('effect')
  }

  const cancelEffectPanel = () => {
    setDraftEffectId(appliedEffectId)
    closeAllPanels()
  }

  const openTextPanel = useCallback(() => {
    setDraftText(
      appliedText ? cloneOverlay(appliedText) : createDefaultTextOverlay(),
    )
    setActiveTool('text')
  }, [appliedText])

  const handleTextOverlayActivate = useCallback(() => {
    if (isTextEditing || !appliedText) return
    openTextPanel()
  }, [isTextEditing, appliedText, openTextPanel])

  const cancelTextPanel = () => {
    setDraftText(null)
    closeAllPanels()
  }

  const openStickerPanel = () => {
    setDraftSticker(null)
    setSelectedStickerId(null)
    setLiveSticker(null)
    setActiveTool('sticker')
  }

  const cancelStickerPanel = () => {
    setDraftSticker(null)
    setSelectedStickerId(null)
    setLiveSticker(null)
    closeAllPanels()
  }

  const openAudioPanel = () => {
    setDraftKeepOriginalAudio(appliedKeepOriginalAudio)
    setDraftBgmId(appliedBgmId)
    setActiveTool('audio')
  }

  const cancelAudioPanel = () => {
    setDraftKeepOriginalAudio(appliedKeepOriginalAudio)
    setDraftBgmId(appliedBgmId)
    closeAllPanels()
  }

  const confirmAudioPanel = () => {
    pushHistory({
      title,
      filterId: appliedFilterId,
      filterIntensity: appliedIntensity,
      effectId: appliedEffectId,
      textOverlay: appliedText ? cloneOverlay(appliedText) : null,
      stickerOverlays: cloneStickers(appliedStickers),
      keepOriginalAudio: draftKeepOriginalAudio,
      bgmId: draftBgmId,
      ...narrationFields,
    })
    closeAllPanels()
    const parts: string[] = []
    parts.push(draftKeepOriginalAudio ? '已保留原声' : '已关闭原声')
    if (draftBgmId) {
      const name = getNetworkAudio(draftBgmId)?.name ?? formatBgmLabel(draftBgmId)
      parts.push(`配乐「${name}」`)
    } else {
      parts.push('已移除配乐')
    }
    show(parts.join(' · '))
  }

  const openNarrationPanel = () => {
    setDraftNarrationText(
      appliedNarrationText ??
        '阳光落在画面里，那些认真生活的瞬间，也值得被认真记录。',
    )
    setDraftNarrationVoice(appliedNarrationVoice)
    setDraftNarrationEngineId(appliedNarrationEngineId)
    setDraftNarrationEnabled(appliedNarrationEnabled)
    setActiveFeature('narration')
  }

  const cancelNarrationPanel = () => {
    setDraftNarrationText(
      appliedNarrationText ??
        '阳光落在画面里，那些认真生活的瞬间，也值得被认真记录。',
    )
    setDraftNarrationVoice(appliedNarrationVoice)
    setDraftNarrationEngineId(appliedNarrationEngineId)
    setDraftNarrationEnabled(appliedNarrationEnabled)
    setActiveFeature(null)
  }

  const confirmNarrationPanel = () => {
    pushHistory({
      title,
      filterId: appliedFilterId,
      filterIntensity: appliedIntensity,
      effectId: appliedEffectId,
      textOverlay: appliedText ? cloneOverlay(appliedText) : null,
      stickerOverlays: cloneStickers(appliedStickers),
      keepOriginalAudio: appliedKeepOriginalAudio,
      bgmId: appliedBgmId,
      narrationText: draftNarrationText.trim() || null,
      narrationVoice: draftNarrationVoice,
      narrationEngineId: draftNarrationEngineId,
      narrationEnabled: draftNarrationEnabled,
    })
    setActiveFeature(null)
    show(draftNarrationEnabled ? '旁白设置已保存' : '已关闭旁白导出')
  }

  const handleStickerPick = (stickerId: string) => {
    setDraftSticker((prev) =>
      prev
        ? { ...prev, stickerId }
        : createDefaultStickerOverlay(stickerId, appliedStickers.length),
    )
  }

  const handleStickerChange = (id: string, patch: Partial<StickerOverlay>) => {
    if (isStickerPanelEditing && draftSticker?.id === id) {
      setDraftSticker((prev) => (prev ? { ...prev, ...patch } : prev))
      return
    }
    if (selectedStickerId === id) {
      setLiveSticker((prev) => (prev ? { ...prev, ...patch } : prev))
    }
  }

  const commitLiveSticker = useCallback(() => {
    if (!liveSticker || !selectedStickerId) return
    pushHistory({
      title,
      filterId: appliedFilterId,
      filterIntensity: appliedIntensity,
      effectId: appliedEffectId,
      textOverlay: appliedText ? cloneOverlay(appliedText) : null,
      stickerOverlays: appliedStickers.map((s) =>
        s.id === liveSticker.id ? cloneSticker(liveSticker) : cloneSticker(s),
      ),
      keepOriginalAudio: appliedKeepOriginalAudio,
      bgmId: appliedBgmId,
      ...narrationFields,
    })
  }, [
    liveSticker,
    selectedStickerId,
    pushHistory,
    title,
    appliedFilterId,
    appliedIntensity,
    appliedEffectId,
    appliedText,
    appliedStickers,
    appliedKeepOriginalAudio,
    appliedBgmId,
    narrationFields,
  ])

  const handleStickerActivate = useCallback(
    (id: string) => {
      if (isStickerPanelEditing) return
      const target = appliedStickers.find((s) => s.id === id)
      if (!target) return
      setSelectedStickerId(id)
      setLiveSticker(cloneSticker(target))
    },
    [isStickerPanelEditing, appliedStickers],
  )

  const handlePreviewBackgroundClick = useCallback(() => {
    if (selectedStickerId) {
      commitLiveSticker()
      setSelectedStickerId(null)
      setLiveSticker(null)
    }
  }, [selectedStickerId, commitLiveSticker])

  const handleToolSelect = (id: string, label: string) => {
    if (id === 'filter') {
      if (activeTool === 'filter') cancelFilterPanel()
      else openFilterPanel()
      return
    }
    if (id === 'effect') {
      if (activeTool === 'effect') cancelEffectPanel()
      else openEffectPanel()
      return
    }
    if (id === 'text') {
      if (activeTool === 'text') cancelTextPanel()
      else openTextPanel()
      return
    }
    if (id === 'sticker') {
      if (activeTool === 'sticker') cancelStickerPanel()
      else openStickerPanel()
      return
    }
    if (id === 'audio') {
      if (activeTool === 'audio') cancelAudioPanel()
      else openAudioPanel()
      return
    }
    closeAllPanels()
    setSelectedStickerId(null)
    setLiveSticker(null)
    setActiveTool(id)
    show(`已切换至「${label}」工具`)
  }

  const handleFilterSelect = (id: string) => {
    setDraftFilterId(id)
    if (id !== 'none') setDraftIntensity(100)
  }

  const confirmEffectPanel = () => {
    pushHistory({
      title,
      filterId: appliedFilterId,
      filterIntensity: appliedIntensity,
      effectId: draftEffectId,
      textOverlay: appliedText ? cloneOverlay(appliedText) : null,
      stickerOverlays: cloneStickers(appliedStickers),
      keepOriginalAudio: appliedKeepOriginalAudio,
      bgmId: appliedBgmId,
      ...narrationFields,
    })
    closeAllPanels()
    const name = EFFECT_PRESETS.find((e) => e.id === draftEffectId)?.name ?? ''
    if (draftEffectId === 'none') {
      show('已关闭特效')
    } else {
      show(`已应用「${name}」特效`)
    }
  }

  const confirmFilterPanel = () => {
    pushHistory({
      title,
      filterId: draftFilterId,
      filterIntensity: draftIntensity,
      effectId: appliedEffectId,
      textOverlay: appliedText ? cloneOverlay(appliedText) : null,
      stickerOverlays: cloneStickers(appliedStickers),
      keepOriginalAudio: appliedKeepOriginalAudio,
      bgmId: appliedBgmId,
      ...narrationFields,
    })
    closeAllPanels()
    const name = FILTER_PRESETS.find((f) => f.id === draftFilterId)?.name ?? ''
    if (draftFilterId === 'none') {
      show('已恢复为原图')
    } else {
      show(`已应用「${name}」滤镜 · 强度 ${draftIntensity}%`)
    }
  }

  const handleTextChange = (patch: Partial<TextOverlay>) => {
    setDraftText((prev) => (prev ? { ...prev, ...patch } : prev))
  }

  const confirmStickerPanel = () => {
    const nextStickers = draftSticker
      ? [...cloneStickers(appliedStickers), cloneSticker(draftSticker)]
      : cloneStickers(appliedStickers)

    pushHistory({
      title,
      filterId: appliedFilterId,
      filterIntensity: appliedIntensity,
      effectId: appliedEffectId,
      textOverlay: appliedText ? cloneOverlay(appliedText) : null,
      stickerOverlays: nextStickers,
      keepOriginalAudio: appliedKeepOriginalAudio,
      bgmId: appliedBgmId,
      ...narrationFields,
    })
    setDraftSticker(null)
    setSelectedStickerId(null)
    setLiveSticker(null)
    closeAllPanels()
    if (draftSticker) {
      const name = getStickerPreset(draftSticker.stickerId)?.name ?? '贴纸'
      show(`已添加「${name}」贴纸`)
    }
  }

  const confirmTextPanel = () => {
    if (!draftText) return
    const trimmed = draftText.content.trim()
    const nextOverlay = trimmed
      ? { ...draftText, content: trimmed }
      : null

    pushHistory({
      title,
      filterId: appliedFilterId,
      filterIntensity: appliedIntensity,
      effectId: appliedEffectId,
      textOverlay: nextOverlay,
      stickerOverlays: cloneStickers(appliedStickers),
      keepOriginalAudio: appliedKeepOriginalAudio,
      bgmId: appliedBgmId,
      ...narrationFields,
    })
    setDraftText(null)
    closeAllPanels()
    show(trimmed ? '文字已添加' : '已清除文字')
  }

  const handleToggleEditTitle = () => {
    if (isEditingTitle) {
      const trimmed = titleDraft.trim() || title
      setTitleDraft(trimmed)
      if (trimmed !== title) {
        pushHistory({
          title: trimmed,
          filterId: appliedFilterId,
          filterIntensity: appliedIntensity,
          effectId: appliedEffectId,
          textOverlay: appliedText ? cloneOverlay(appliedText) : null,
          stickerOverlays: cloneStickers(appliedStickers),
          keepOriginalAudio: appliedKeepOriginalAudio,
          bgmId: appliedBgmId,
          ...narrationFields,
        })
        show('标题已更新')
      }
      setIsEditingTitle(false)
    } else {
      setTitleDraft(title)
      setIsEditingTitle(true)
    }
  }

  const handleUndo = useCallback(() => {
    if (!canUndo) return
    closeAllPanels()
    setDraftText(null)
    setDraftSticker(null)
    setSelectedStickerId(null)
    setLiveSticker(null)
    undo()
    show('已撤回')
  }, [canUndo, closeAllPanels, undo, show])

  const handleRedo = useCallback(() => {
    if (!canRedo) return
    closeAllPanels()
    setDraftText(null)
    setDraftSticker(null)
    setSelectedStickerId(null)
    setLiveSticker(null)
    redo()
    show('已重做')
  }, [canRedo, closeAllPanels, redo, show])

  const buildExportSnapshot = useCallback((): EditorSnapshot => {
    let stickers = cloneStickers(appliedStickers)
    if (isStickerPanelEditing && draftSticker) {
      stickers = [...stickers, cloneSticker(draftSticker)]
    }

    let textOverlay = appliedText ? cloneOverlay(appliedText) : null
    if (isTextEditing && draftText) {
      const trimmed = draftText.content.trim()
      textOverlay = trimmed ? { ...draftText, content: trimmed } : null
    }

    return {
      title,
      filterId: showFilterPanel ? draftFilterId : appliedFilterId,
      filterIntensity: showFilterPanel ? draftIntensity : appliedIntensity,
      effectId: showEffectPanel ? draftEffectId : appliedEffectId,
      textOverlay,
      stickerOverlays: stickers,
      keepOriginalAudio: showAudioPanel ? draftKeepOriginalAudio : appliedKeepOriginalAudio,
      bgmId: showAudioPanel ? draftBgmId : appliedBgmId,
      narrationText: showNarrationPanel
        ? draftNarrationText.trim() || null
        : appliedNarrationText,
      narrationVoice: showNarrationPanel ? draftNarrationVoice : appliedNarrationVoice,
      narrationEngineId: showNarrationPanel
        ? draftNarrationEngineId
        : appliedNarrationEngineId,
      narrationEnabled: showNarrationPanel
        ? draftNarrationEnabled
        : appliedNarrationEnabled,
    }
  }, [
    title,
    appliedFilterId,
    appliedIntensity,
    appliedEffectId,
    appliedText,
    appliedStickers,
    appliedKeepOriginalAudio,
    appliedBgmId,
    showFilterPanel,
    draftFilterId,
    draftIntensity,
    showEffectPanel,
    draftEffectId,
    isTextEditing,
    draftText,
    isStickerPanelEditing,
    draftSticker,
    showAudioPanel,
    draftKeepOriginalAudio,
    draftBgmId,
    showNarrationPanel,
    draftNarrationText,
    draftNarrationVoice,
    draftNarrationEngineId,
    draftNarrationEnabled,
    appliedNarrationText,
    appliedNarrationVoice,
    appliedNarrationEngineId,
    appliedNarrationEnabled,
  ])

  const handleExport = useCallback(async () => {
    if (!hasEditorProject()) {
      show('请先导入视频素材')
      navigate('/create')
      return
    }

    const hasLocalVideo = clips.some((clip) => clip.videoSrc)
    if (!hasLocalVideo) {
      show('导出需要本地导入的视频素材')
      return
    }

    setIsPlaying(false)
    setExporting(true)
    setExportProgress(0)
    setExportMessage('准备导出…')
    exportCancelledRef.current = false

    const exportSnapshot = buildExportSnapshot()
    pushHistory(exportSnapshot)
    closeAllPanels()

    try {
      const result = await exportEditedVideo(
        clips,
        projectDuration,
        exportSnapshot,
        (p) => {
          setExportProgress(p.progress)
          setExportMessage(p.message)
        },
        () => exportCancelledRef.current,
      )

      setExportedVideo(result)
      show('成片已导出')
      navigate('/complete')
    } catch (error) {
      const msg = error instanceof Error ? error.message : ''
      if (msg !== 'cancelled') {
        const hint =
          msg.includes('内存') || msg.includes('Memory')
            ? '。建议缩短总时长或只保留 1～2 段短视频'
            : ''
        show((msg || '导出失败，请重试') + hint)
      }
    } finally {
      setExporting(false)
    }
  }, [
    clips,
    projectDuration,
    buildExportSnapshot,
    pushHistory,
    closeAllPanels,
    navigate,
    show,
    setIsPlaying,
  ])

  const handleCancelExport = () => {
    exportCancelledRef.current = true
    setExportMessage('正在取消…')
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
        e.preventDefault()
        handleRedo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleUndo, handleRedo])

  return (
    <PageShell>
      <TopBar
        title={isEditingTitle ? titleDraft : title}
        isEditingTitle={isEditingTitle}
        exporting={exporting}
        canUndo={canUndo}
        canRedo={canRedo}
        onBack={() => navigate('/')}
        onExport={handleExport}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onTitleChange={setTitleDraft}
        onToggleEditTitle={handleToggleEditTitle}
      />

      <VideoPreview
        poster={activeClip.poster}
        videoSrc={activeClip.videoSrc}
        clipTime={clipTime}
        currentTime={currentTime}
        duration={projectDuration}
        isPlaying={isPlaying}
        filterCss={getFilterCss(previewFilterId)}
        filterIntensity={previewIntensity}
        effectId={previewEffectId}
        textOverlay={previewText}
        textEditable={isTextEditing}
        onTextChange={isTextEditing ? handleTextChange : undefined}
        onTextActivate={handleTextOverlayActivate}
        stickerItems={previewStickerItems}
        onStickerChange={handleStickerChange}
        onStickerTransformEnd={
          selectedStickerId && !isStickerPanelEditing ? commitLiveSticker : undefined
        }
        onStickerActivate={handleStickerActivate}
        onPreviewBackgroundClick={handlePreviewBackgroundClick}
        onTogglePlay={togglePlay}
        onSeek={handleSeekRatio}
      />

      <AIFeatureBar
        activeId={activeFeature}
        onSelect={(id, label) => {
          if (id === 'narration') {
            openNarrationPanel()
            return
          }
          setActiveFeature(id)
          show(`${label} 功能即将接入 AI 引擎`)
        }}
      />

      <Timeline
        clips={clips}
        highlightAt={highlightAt}
        currentTime={currentTime}
        duration={projectDuration}
        keepOriginalAudio={previewKeepOriginalAudio}
        bgmId={previewBgmId}
        onSeek={seek}
        onClipSelect={handleClipSelect}
        onAudioClick={openAudioPanel}
      />

      {showEffectPanel && (
        <EffectPanel
          effects={EFFECT_PRESETS}
          selectedId={draftEffectId}
          filterCss={getFilterCss(previewFilterId)}
          onSelect={setDraftEffectId}
          onConfirm={confirmEffectPanel}
          onClose={cancelEffectPanel}
        />
      )}

      {showFilterPanel && (
        <FilterPanel
          filters={FILTER_PRESETS}
          selectedId={draftFilterId}
          intensity={draftIntensity}
          onSelect={handleFilterSelect}
          onIntensityChange={setDraftIntensity}
          onConfirm={confirmFilterPanel}
          onClose={cancelFilterPanel}
        />
      )}

      {showStickerPanel && (
        <StickerPanel
          draft={draftSticker}
          onPick={handleStickerPick}
          onRemove={() => setDraftSticker(null)}
          onConfirm={confirmStickerPanel}
          onClose={cancelStickerPanel}
        />
      )}

      {isTextEditing && draftText && (
        <TextPanel
          draft={draftText}
          onChange={handleTextChange}
          onConfirm={confirmTextPanel}
          onClose={cancelTextPanel}
        />
      )}

      {showAudioPanel && (
        <AudioPanel
          keepOriginalAudio={draftKeepOriginalAudio}
          selectedBgmId={draftBgmId}
          onKeepOriginalChange={setDraftKeepOriginalAudio}
          onBgmSelect={setDraftBgmId}
          onConfirm={confirmAudioPanel}
          onClose={cancelAudioPanel}
        />
      )}

      {showNarrationPanel && (
        <NarrationPanel
          text={draftNarrationText}
          voice={draftNarrationVoice}
          engineId={draftNarrationEngineId}
          enabled={draftNarrationEnabled}
          onTextChange={setDraftNarrationText}
          onVoiceChange={setDraftNarrationVoice}
          onEngineChange={setDraftNarrationEngineId}
          onEnabledChange={setDraftNarrationEnabled}
          onConfirm={confirmNarrationPanel}
          onClose={cancelNarrationPanel}
        />
      )}

      <BottomToolbar
        activeTool={activeTool}
        onSelect={handleToolSelect}
      />

      <ExportDialog
        open={exporting}
        progress={exportProgress}
        message={exportMessage}
        onCancel={handleCancelExport}
      />

      <Toast message={message} visible={visible} />
    </PageShell>
  )
}
