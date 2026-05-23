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
import {
  getEditorProject,
  hasStudioEditorProject,
  updateEditorProject,
} from '@/state/importedProject'
import {
  STUDIO_EXPORT_RESULT_KEY,
  type StudioExportResult,
} from '@/constants/projectFlow'
import { DEFAULT_CROP } from '@/types/clipTransform'
import type { NormalizedCrop } from '@/types/clipTransform'
import { refineCropToFillFrame } from '@/utils/videoFit'
import type { TimelineToolId } from '@/components/editor/TimelineToolbar'
import {
  deleteClipById,
  rotateClip,
  setClipCrop,
  setClipPlaybackRate,
  splitClipAt,
  toggleClipMirror,
} from '@/utils/clipOperations'
import {
  appendClipsFromImports,
  probeVideoFile,
} from '@/utils/videoImport'
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
import {
  OverlayContextMenu,
  type OverlayMenuAction,
} from '@/components/editor/OverlayContextMenu'
import {
  VideoPreview,
  type StickerPreviewItem,
  type TextPreviewItem,
} from '@/components/editor/VideoPreview'
import { EFFECT_PRESETS } from '@/data/effects'
import { FILTER_PRESETS, getFilterCss } from '@/data/filters'
import {
  createDefaultStickerOverlay,
  getStickerPreset,
} from '@/data/stickers'
import { createDefaultTextOverlay } from '@/data/textStyles'
import {
  DEFAULT_NARRATION_DRAFT_TEXT,
  EXPORT_MESSAGE_CANCELLING,
  EXPORT_MESSAGE_PREPARING,
} from '@/constants/editorDefaults'
import { editorToasts } from '@/constants/editorToasts'
import { usePlayback } from '@/hooks/usePlayback'
import { usePreviewBgm } from '@/hooks/usePreviewBgm'
import {
  getPreviewBgmVolume,
  getPreviewVideoVolume,
} from '@/utils/previewAudioMix'
import { useToast } from '@/hooks/useToast'
import { useUndoRedo } from '@/hooks/useUndoRedo'
import type { EditorSnapshot, StickerOverlay, TextOverlay } from '@/types/editorState'
import type { TimelineDisplayClip } from '@/types/timelineDisplay'
import {
  bgmToDisplayClip,
  hasTimelineClipMenu,
  isDraggableClipKind,
  originalAudioToDisplayClip,
  orderTimelineOverlayClips,
  reconcileOverlayTrackOrder,
  stickerToDisplayClip,
  textToDisplayClip,
  type TimelineClipDragMode,
} from '@/utils/timelineDisplay'
import {
  duplicateStickerOverlay,
  duplicateTextOverlay,
  type OverlayClipboard,
} from '@/utils/overlayActions'
import { shouldClearSelectionOnClick } from '@/utils/editorSelectionHitTest'
import {
  buildClipDragSnapTargets,
  collectSnapTargetTimes,
  snapPlayheadTime,
  snapRangeToTargetTimes,
  snapThresholdSecFromPx,
  TIMELINE_SNAP_THRESHOLD_PX,
  type PlayheadSnapEdge,
} from '@/utils/playheadSnap'
import { isTimelineClipUserSelected } from '@/utils/timelineClipSelection'
import { timeDeltaFromPointerDrag } from '@/utils/timelineRuler'
import {
  createDefaultTimeRange,
  createDefaultTimeRangeFromPlayhead,
  isActiveAtTime,
  normalizeTimeRange,
  overlayWithNormalizedRange,
  resizeTimeRange,
  scaleTimeRangeForProjectDuration,
  shiftTimeRange,
  type TimeRange,
} from '@/utils/timeRange'

type OverlayMenuTarget =
  | { kind: 'text'; id: string }
  | { kind: 'sticker'; id: string }
  | { kind: 'bgm' }
  | { kind: 'canvas' }

type LegacyEditorSnapshot = EditorSnapshot & {
  textOverlay?: TextOverlay | null
}

function ensureTextId(text: TextOverlay, index: number): TextOverlay {
  if (text.id) return text
  return { ...text, id: `text-migrated-${index}-${Date.now()}` }
}

function resolveTextOverlays(s: LegacyEditorSnapshot): TextOverlay[] {
  if (Array.isArray(s.textOverlays)) return s.textOverlays
  if (s.textOverlay) return [s.textOverlay]
  return []
}

interface OverlayContextMenuState {
  x: number
  y: number
  target: OverlayMenuTarget
}

const OBJECT_MENU_ITEMS: OverlayMenuAction[] = ['edit', 'copy', 'cut', 'delete']

function clipSelectedForDisplay(
  clip: Pick<TimelineDisplayClip, 'id' | 'kind'>,
  state: {
    selectedTimelineClipId: string | null
    selectedTextId: string | null
    selectedStickerId: string | null
    contextMenu: OverlayContextMenuState | null
  },
): boolean {
  return isTimelineClipUserSelected(clip, {
    selectedTimelineClipId: state.selectedTimelineClipId,
    selectedTextId: state.selectedTextId,
    selectedStickerId: state.selectedStickerId,
    contextMenuTarget: state.contextMenu?.target ?? null,
  })
}

type ClipDragPreview = {
  id: string
  kind: 'originalAudio' | 'text' | 'sticker' | 'bgm'
  startTime: number
  endTime: number
}

function normalizeSnapshot(
  s: EditorSnapshot,
  duration: number = PROJECT_DURATION,
): EditorSnapshot {
  const legacy = s as LegacyEditorSnapshot
  const fallback = createDefaultTimeRange(duration)
  const { textOverlay: _legacyText, ...base } = legacy
  const normalized: EditorSnapshot = {
    ...base,
    originalAudioRange: normalizeTimeRange(
      legacy.originalAudioRange ?? fallback,
      duration,
    ).range,
    bgmRange: normalizeTimeRange(legacy.bgmRange ?? fallback, duration).range,
    textOverlays: resolveTextOverlays(legacy).map((t, i) =>
      overlayWithNormalizedRange(ensureTextId(t, i), duration),
    ),
    stickerOverlays: legacy.stickerOverlays.map((st) =>
      overlayWithNormalizedRange({ ...st }, duration),
    ),
  }
  return {
    ...normalized,
    overlayTrackOrder: reconcileOverlayTrackOrder(normalized),
  }
}

function buildSnapshot(
  base: EditorSnapshot,
  patch: Partial<EditorSnapshot>,
  duration: number = PROJECT_DURATION,
): EditorSnapshot {
  return normalizeSnapshot({ ...base, ...patch }, duration)
}

function createInitialEditorSnapshot(
  project: ReturnType<typeof getEditorProject>,
): EditorSnapshot {
  const session = normalizeSnapshot(getEditorSession())
  const isStudio = project?.flow === 'studio'
  const clips = isStudio ? project.clips : (project?.clips ?? VIDEO_CLIPS)
  const duration = isStudio
    ? project.duration
    : (project?.duration ?? PROJECT_DURATION)
  return normalizeSnapshot(
    {
      ...session,
      videoClips: isStudio
        ? clips
        : session.videoClips?.length
          ? session.videoClips
          : clips,
      videoDuration: isStudio ? duration : (session.videoDuration ?? duration),
    },
    duration,
  )
}

function cloneOverlay(o: TextOverlay): TextOverlay {
  return overlayWithNormalizedRange({ ...o }, PROJECT_DURATION)
}

function cloneSticker(o: StickerOverlay): StickerOverlay {
  return overlayWithNormalizedRange({ ...o }, PROJECT_DURATION)
}

function cloneStickers(stickers: StickerOverlay[]): StickerOverlay[] {
  return stickers.map(cloneSticker)
}

function cloneTexts(texts: TextOverlay[]): TextOverlay[] {
  return texts.map(cloneOverlay)
}

loadEditorSessionFromStorage()

export function EditorPage() {
  const navigate = useNavigate()
  const initialProject = getEditorProject()
  const studioProject =
    initialProject?.flow === 'studio' ? initialProject : null
  const [clips, setClips] = useState<VideoClip[]>(
    () => studioProject?.clips ?? [],
  )
  const [projectDuration, setProjectDuration] = useState(
    () => studioProject?.duration ?? 1,
  )
  const highlightAt = Math.min(projectDuration * 0.54, projectDuration - 1)
  const importInputRef = useRef<HTMLInputElement>(null)
  const [importingVideos, setImportingVideos] = useState(false)
  const [isCropMode, setIsCropMode] = useState(false)
  const [draftCrop, setDraftCrop] = useState<NormalizedCrop>(DEFAULT_CROP)
  const [cropClipId, setCropClipId] = useState<string | null>(null)
  const [selectedVideoClipId, setSelectedVideoClipId] = useState<string | null>(
    null,
  )
  /** ? true ???????????? false ??????? */
  const [highlightFollowsPlayhead, setHighlightFollowsPlayhead] =
    useState(false)
  const [previewSourceAspect, setPreviewSourceAspect] = useState(16 / 9)

  useEffect(() => {
    if (
      selectedVideoClipId &&
      !clips.some((c) => c.id === selectedVideoClipId)
    ) {
      setSelectedVideoClipId(null)
    }
  }, [clips, selectedVideoClipId])

  useEffect(() => {
    if (!hasStudioEditorProject()) {
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
  } = useUndoRedo<EditorSnapshot>(createInitialEditorSnapshot(initialProject))

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
  const [draftOriginalAudioRange, setDraftOriginalAudioRange] = useState(
    snapshot.originalAudioRange,
  )
  const [draftBgmRange, setDraftBgmRange] = useState(snapshot.bgmRange)
  const [draftNarrationText, setDraftNarrationText] = useState(
    snapshot.narrationText ?? DEFAULT_NARRATION_DRAFT_TEXT,
  )
  const [draftNarrationVoice, setDraftNarrationVoice] = useState(snapshot.narrationVoice)
  const [draftNarrationEngineId, setDraftNarrationEngineId] = useState(
    snapshot.narrationEngineId,
  )
  const [draftNarrationEnabled, setDraftNarrationEnabled] = useState(
    snapshot.narrationEnabled,
  )
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null)
  const [liveText, setLiveText] = useState<TextOverlay | null>(null)
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null)
  const [liveSticker, setLiveSticker] = useState<StickerOverlay | null>(null)
  const [contextMenu, setContextMenu] = useState<OverlayContextMenuState | null>(null)
  const [selectedTimelineClipId, setSelectedTimelineClipId] = useState<string | null>(
    null,
  )
  const [draggingClipId, setDraggingClipId] = useState<string | null>(null)
  const [playheadSnapEdge, setPlayheadSnapEdge] = useState<PlayheadSnapEdge | null>(
    null,
  )
  const [playheadSeekSnapped, setPlayheadSeekSnapped] = useState(false)
  const [clipDragPreview, setClipDragPreview] = useState<ClipDragPreview | null>(
    null,
  )
  const clipDragSessionRef = useRef<{
    clip: TimelineDisplayClip
    mode: TimelineClipDragMode
    originStart: number
    originEnd: number
    startClientX: number
  } | null>(null)
  const clipboardRef = useRef<OverlayClipboard | null>(null)
  const { message, show, visible } = useToast()
  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportMessage, setExportMessage] = useState('')
  const exportCancelledRef = useRef(false)
  const timelineContentWidthPxRef = useRef(320)

  const closeContextMenu = useCallback(() => setContextMenu(null), [])

  const appliedFilterId = snapshot.filterId
  const appliedIntensity = snapshot.filterIntensity
  const appliedEffectId = snapshot.effectId ?? 'none'
  const appliedTexts = snapshot.textOverlays
  const appliedStickers = snapshot.stickerOverlays
  const appliedKeepOriginalAudio = snapshot.keepOriginalAudio
  const appliedBgmId = snapshot.bgmId
  const appliedOriginalAudioRange = snapshot.originalAudioRange
  const appliedBgmRange = snapshot.bgmRange
  const appliedNarrationText = snapshot.narrationText
  const appliedNarrationVoice = snapshot.narrationVoice
  const appliedNarrationEngineId = snapshot.narrationEngineId
  const appliedNarrationEnabled = snapshot.narrationEnabled
  const title = snapshot.title

  const showFilterPanel = activeTool === 'filter'
  const showAudioPanel = activeTool === 'audio'
  const showNarrationPanel = activeFeature === 'narration'
  const showEffectPanel = activeTool === 'effect'
  const showTextPanel = activeTool === 'text'
  const showStickerPanel = activeTool === 'sticker'
  const isTextPanelEditing = showTextPanel
  const isStickerPanelEditing = showStickerPanel

  const previewFilterId = showFilterPanel ? draftFilterId : appliedFilterId
  const previewIntensity = showFilterPanel ? draftIntensity : appliedIntensity
  const previewEffectId = showEffectPanel ? draftEffectId : appliedEffectId
  const previewKeepOriginalAudio = showAudioPanel
    ? draftKeepOriginalAudio
    : appliedKeepOriginalAudio
  const previewBgmId = showAudioPanel ? draftBgmId : appliedBgmId
  const previewBgmRange = showAudioPanel ? draftBgmRange : appliedBgmRange
  const effectiveBgmRange = useMemo((): TimeRange => {
    if (clipDragPreview?.kind === 'bgm') {
      return {
        startTime: clipDragPreview.startTime,
        endTime: clipDragPreview.endTime,
      }
    }
    return previewBgmRange
  }, [clipDragPreview, previewBgmRange])
  const previewOriginalAudioRange = showAudioPanel
    ? draftOriginalAudioRange
    : appliedOriginalAudioRange
  const effectiveOriginalAudioRange = useMemo((): TimeRange => {
    if (clipDragPreview?.kind === 'originalAudio') {
      return {
        startTime: clipDragPreview.startTime,
        endTime: clipDragPreview.endTime,
      }
    }
    return previewOriginalAudioRange
  }, [clipDragPreview, previewOriginalAudioRange])
  const previewVideoClockRef = useRef(false)

  const { currentTime, isPlaying, seek, syncTime, togglePlay, setIsPlaying } =
    usePlayback(projectDuration, 31, { videoClockRef: previewVideoClockRef })

  useEffect(() => {
    if (isPlaying) setHighlightFollowsPlayhead(true)
  }, [isPlaying])

  const previewHasBgm = Boolean(previewBgmId)
  const previewBgmInRange =
    previewHasBgm && isActiveAtTime(currentTime, effectiveBgmRange)
  const previewMixWithBgm =
    previewHasBgm && previewKeepOriginalAudio && previewBgmInRange

  const previewBgmVolume = useMemo(
    () => getPreviewBgmVolume(previewHasBgm, previewKeepOriginalAudio),
    [previewHasBgm, previewKeepOriginalAudio],
  )

  const previewVideoVolume = useMemo(
    () => getPreviewVideoVolume(previewKeepOriginalAudio, previewMixWithBgm),
    [previewKeepOriginalAudio, previewMixWithBgm],
  )
  const previewNarrationActive =
    showNarrationPanel ? draftNarrationEnabled : appliedNarrationEnabled

  usePreviewBgm({
    bgmId: previewBgmId,
    bgmRange: effectiveBgmRange,
    currentTime,
    isPlaying,
    volume: previewBgmVolume,
    narrationActive: previewNarrationActive,
  })

  const pushEditorHistory = useCallback(
    (patch: Partial<EditorSnapshot>, duration: number = projectDuration) => {
      pushHistory(
        buildSnapshot(
          snapshot,
          {
            videoClips: clips,
            videoDuration: duration,
            ...patch,
          },
          duration,
        ),
      )
    },
    [snapshot, clips, projectDuration, pushHistory],
  )

  const syncClipsFromSnapshot = useCallback(() => {
    if (!snapshot.videoClips?.length) return
    setClips(snapshot.videoClips)
    const dur = snapshot.videoDuration ?? projectDuration
    setProjectDuration(dur)
    updateEditorProject({ clips: snapshot.videoClips, duration: dur })
    if (currentTime > dur) seek(dur)
  }, [
    snapshot.videoClips,
    snapshot.videoDuration,
    projectDuration,
    currentTime,
    seek,
  ])

  useEffect(() => {
    syncClipsFromSnapshot()
  }, [syncClipsFromSnapshot])

  const previewTextItems = useMemo((): TextPreviewItem[] => {
    const editingDraftId = isTextPanelEditing && draftText ? draftText.id : null

    const items: TextPreviewItem[] = appliedTexts
      .filter((t) => t.id !== editingDraftId)
      .map((t) => {
        if (
          !isTextPanelEditing &&
          selectedTextId === t.id &&
          liveText &&
          liveText.content.trim()
        ) {
          return { overlay: liveText, editable: true }
        }
        return { overlay: t, editable: false }
      })

    if (isTextPanelEditing && draftText) {
      items.push({ overlay: draftText, editable: true })
    }

    if (clipDragPreview?.kind !== 'text') return items
    return items.map((item) =>
      item.overlay.id === clipDragPreview.id
        ? {
            ...item,
            overlay: {
              ...item.overlay,
              startTime: clipDragPreview.startTime,
              endTime: clipDragPreview.endTime,
            },
          }
        : item,
    )
  }, [
    appliedTexts,
    isTextPanelEditing,
    draftText,
    selectedTextId,
    liveText,
    clipDragPreview,
  ])

  const previewStickerItems = useMemo((): StickerPreviewItem[] => {
    const editingDraftId =
      isStickerPanelEditing && draftSticker ? draftSticker.id : null

    const items: StickerPreviewItem[] = appliedStickers
      .filter((s) => s.id !== editingDraftId)
      .map((s) => {
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

    if (clipDragPreview?.kind !== 'sticker') return items
    return items.map((item) =>
      item.overlay.id === clipDragPreview.id
        ? {
            ...item,
            overlay: {
              ...item.overlay,
              startTime: clipDragPreview.startTime,
              endTime: clipDragPreview.endTime,
            },
          }
        : item,
    )
  }, [
    appliedStickers,
    isStickerPanelEditing,
    draftSticker,
    selectedStickerId,
    liveSticker,
    clipDragPreview,
  ])

  const clipSelectionState = useMemo(
    () => ({
      selectedTimelineClipId,
      selectedTextId,
      selectedStickerId,
      contextMenu,
    }),
    [
      selectedTimelineClipId,
      selectedTextId,
      selectedStickerId,
      contextMenu,
    ],
  )

  const timelineOverlayClips = useMemo((): TimelineDisplayClip[] => {
    const selected = (clip: Pick<TimelineDisplayClip, 'id' | 'kind'>) =>
      clipSelectedForDisplay(clip, clipSelectionState)

    const clips: TimelineDisplayClip[] = [
      originalAudioToDisplayClip(
        effectiveOriginalAudioRange,
        projectDuration,
        previewKeepOriginalAudio,
        selected({ id: 'original-audio', kind: 'originalAudio' }),
      ),
    ]

    for (const item of previewTextItems) {
      const o = item.overlay
      clips.push(
        textToDisplayClip(o, projectDuration, selected({ id: o.id, kind: 'text' })),
      )
    }

    for (const item of previewStickerItems) {
      const o = item.overlay
      clips.push(
        stickerToDisplayClip(
          o,
          projectDuration,
          selected({ id: o.id, kind: 'sticker' }),
        ),
      )
    }

    if (previewBgmId) {
      clips.push(
        bgmToDisplayClip(
          previewBgmId,
          effectiveBgmRange,
          projectDuration,
          selected({ id: `bgm-${previewBgmId}`, kind: 'bgm' }),
        ),
      )
    }

    const trackOrder = reconcileOverlayTrackOrder({
      ...snapshot,
      textOverlays: previewTextItems.map((item) => item.overlay),
      stickerOverlays: previewStickerItems.map((item) => item.overlay),
      bgmId: previewBgmId,
    })

    return orderTimelineOverlayClips(clips, trackOrder)
  }, [
    effectiveOriginalAudioRange,
    previewKeepOriginalAudio,
    previewTextItems,
    previewStickerItems,
    previewBgmId,
    effectiveBgmRange,
    clipSelectionState,
    projectDuration,
    snapshot,
  ])

  const activeClip = useMemo(
    () => getClipAtTime(currentTime, clips, projectDuration),
    [currentTime, clips, projectDuration],
  )

  previewVideoClockRef.current =
    Boolean(activeClip.videoSrc) && isPlaying

  const lastPreviewSyncMsRef = useRef(0)
  const handlePreviewTimelineSync = useCallback(
    (time: number) => {
      if (time >= projectDuration) {
        setIsPlaying(false)
        syncTime(projectDuration)
        return
      }
      const now = performance.now()
      if (now - lastPreviewSyncMsRef.current < 40) return
      lastPreviewSyncMsRef.current = now
      syncTime(time)
    },
    [projectDuration, syncTime, setIsPlaying],
  )

  const activePlaybackRate = activeClip.playbackRate ?? 1

  const clipTime = Math.max(
    0,
    (activeClip.sourceOffset ?? 0) +
      (currentTime - activeClip.start) * activePlaybackRate,
  )

  const selectedVideoClip = useMemo(
    () => clips.find((c) => c.id === selectedVideoClipId) ?? null,
    [clips, selectedVideoClipId],
  )

  const canSplitSelectedClip = useMemo(() => {
    if (!selectedVideoClip) return false
    const t = currentTime
    return (
      t > selectedVideoClip.start + 0.35 &&
      t < selectedVideoClip.start + selectedVideoClip.duration - 0.35
    )
  }, [selectedVideoClip, currentTime])

  const canDeleteSelectedClip = clips.length > 1 && !!selectedVideoClipId

  const selectedClipPlaybackRate = selectedVideoClip?.playbackRate ?? 1

  const previewClipTransform = useMemo(() => {
    if (isCropMode && cropClipId === activeClip.id) {
      return { ...activeClip.transform, crop: DEFAULT_CROP }
    }
    return activeClip.transform
  }, [activeClip.id, activeClip.transform, cropClipId, isCropMode])

  useEffect(() => {
    if (isCropMode && cropClipId && cropClipId !== activeClip.id) {
      setIsCropMode(false)
      setCropClipId(null)
    }
  }, [activeClip.id, cropClipId, isCropMode])

  const applyClipsUpdate = useCallback(
    (nextClips: VideoClip[], duration: number) => {
      const oldDuration = projectDuration
      const durationChanged = Math.abs(duration - oldDuration) > 0.001
      const nextOriginalAudioRange = durationChanged
        ? scaleTimeRangeForProjectDuration(
            snapshot.originalAudioRange,
            oldDuration,
            duration,
          )
        : snapshot.originalAudioRange

      if (durationChanged) {
        setDraftOriginalAudioRange((prev) =>
          scaleTimeRangeForProjectDuration(prev, oldDuration, duration),
        )
      }

      setClips(nextClips)
      setProjectDuration(duration)
      updateEditorProject({ clips: nextClips, duration })
      pushEditorHistory(
        {
          videoClips: nextClips,
          videoDuration: duration,
          ...(durationChanged
            ? { originalAudioRange: nextOriginalAudioRange }
            : {}),
        },
        duration,
      )
      if (currentTime > duration) seek(duration)
    },
    [
      currentTime,
      seek,
      pushEditorHistory,
      projectDuration,
      snapshot.originalAudioRange,
    ],
  )

  const handleImportClick = useCallback(() => {
    if (!importingVideos) importInputRef.current?.click()
  }, [importingVideos])

  const handleImportFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return

      setImportingVideos(true)
      try {
        const list = Array.from(files).filter((file) => file.type.startsWith('video/'))
        if (!list.length) {
          show(editorToasts.importVideoOnly)
          return
        }

        const imported = await Promise.all(list.map((file) => probeVideoFile(file)))
        const { clips: nextClips, duration } = appendClipsFromImports(clips, imported)

        applyClipsUpdate(nextClips, duration)
        show(editorToasts.importSuccess(imported.length))
      } catch {
        show(editorToasts.importFailed)
      } finally {
        setImportingVideos(false)
        if (importInputRef.current) importInputRef.current.value = ''
      }
    },
    [clips, show, applyClipsUpdate],
  )

  const handleCropConfirm = useCallback(() => {
    if (!cropClipId) return
    const clip = clips.find((c) => c.id === cropClipId)
    const refined = refineCropToFillFrame(
      draftCrop,
      previewSourceAspect,
      16 / 9,
      clip?.transform?.rotation ?? 0,
    )
    const next = setClipCrop(clips, cropClipId, refined)
    applyClipsUpdate(next, projectDuration)
    setIsCropMode(false)
    setCropClipId(null)
    show(editorToasts.cropApplied)
  }, [
    cropClipId,
    clips,
    draftCrop,
    previewSourceAspect,
    projectDuration,
    show,
    applyClipsUpdate,
  ])

  const handleCropCancel = useCallback(() => {
    setIsCropMode(false)
    setCropClipId(null)
  }, [])

  const playheadSnapTargetTimes = useMemo(
    () =>
      collectSnapTargetTimes(timelineOverlayClips, {
        durationSec: projectDuration,
        includeRuler: true,
      }),
    [timelineOverlayClips, projectDuration],
  )

  const seekWithPlayheadSnap = useCallback(
    (time: number) => {
      const thresholdSec = snapThresholdSecFromPx(
        TIMELINE_SNAP_THRESHOLD_PX,
        timelineContentWidthPxRef.current,
        projectDuration,
      )
      const { time: snapped, snapped: didSnap } = snapPlayheadTime(
        time,
        playheadSnapTargetTimes,
        projectDuration,
        thresholdSec,
      )
      setPlayheadSeekSnapped(didSnap)
      seek(snapped)
    },
    [playheadSnapTargetTimes, seek, projectDuration],
  )

  const clearPlayheadSeekSnap = useCallback(() => {
    setPlayheadSeekSnapped(false)
  }, [])

  const handleClipSelect = useCallback(
    (clip: VideoClip) => {
      setSelectedVideoClipId(clip.id)
      setHighlightFollowsPlayhead(false)
      setIsPlaying(false)
      seek(clip.start)
    },
    [seek, setIsPlaying],
  )

  const handleTimelineEditTool = useCallback(
    (tool: TimelineToolId) => {
      if (!selectedVideoClipId) return

      switch (tool) {
        case 'split': {
          const result = splitClipAt(clips, currentTime, selectedVideoClipId)
          if (!result) {
            show(editorToasts.splitNeedPlayhead)
            return
          }
          applyClipsUpdate(result.clips, result.duration)
          setSelectedVideoClipId(result.secondId)
          show(editorToasts.splitDone)
          break
        }
        case 'delete': {
          const result = deleteClipById(clips, selectedVideoClipId)
          if (!result) {
            show(editorToasts.deleteNeedOne)
            return
          }
          applyClipsUpdate(result.clips, result.duration)
          setSelectedVideoClipId(null)
          show(editorToasts.deleteDone)
          break
        }
        case 'mirror': {
          const next = toggleClipMirror(clips, selectedVideoClipId)
          applyClipsUpdate(next, projectDuration)
          break
        }
        case 'rotate': {
          const next = rotateClip(clips, selectedVideoClipId)
          applyClipsUpdate(next, projectDuration)
          break
        }
        case 'crop': {
          const clip = clips.find((c) => c.id === selectedVideoClipId)
          if (!clip) return
          setIsPlaying(false)
          seek(clip.start)
          setDraftCrop(clip.transform?.crop ?? DEFAULT_CROP)
          setCropClipId(selectedVideoClipId)
          setIsCropMode(true)
          break
        }
      }
    },
    [
      selectedVideoClipId,
      clips,
      currentTime,
      applyClipsUpdate,
      projectDuration,
      show,
      seek,
      setIsPlaying,
    ],
  )

  const handleClipPlaybackRateChange = useCallback(
    (rate: number) => {
      if (!selectedVideoClipId) return
      const { clips: nextClips, duration } = setClipPlaybackRate(
        clips,
        selectedVideoClipId,
        rate,
      )
      applyClipsUpdate(nextClips, duration)
    },
    [selectedVideoClipId, clips, applyClipsUpdate],
  )

  const handleSeekRatio = useCallback(
    (ratio: number) => {
      setIsPlaying(false)
      seekWithPlayheadSnap(
        Math.max(0, Math.min(1, ratio)) * projectDuration,
      )
    },
    [seekWithPlayheadSnap, projectDuration, setIsPlaying],
  )

  const closeAllPanels = useCallback(() => {
    setActiveTool('cut')
  }, [])

  const syncDraftFromSnapshot = useCallback(() => {
    setDraftFilterId(snapshot.filterId)
    setDraftIntensity(snapshot.filterIntensity)
    setDraftEffectId(snapshot.effectId ?? 'none')
    setDraftKeepOriginalAudio(snapshot.keepOriginalAudio)
    setDraftBgmId(snapshot.bgmId)
    setDraftOriginalAudioRange(snapshot.originalAudioRange)
    setDraftBgmRange(snapshot.bgmRange)
    setDraftNarrationText(
      snapshot.narrationText ?? DEFAULT_NARRATION_DRAFT_TEXT,
    )
    setDraftNarrationVoice(snapshot.narrationVoice)
    setDraftNarrationEngineId(snapshot.narrationEngineId)
    setDraftNarrationEnabled(snapshot.narrationEnabled)
    setTitleDraft(snapshot.title)
  }, [snapshot])

  useEffect(() => {
    if (!showFilterPanel && !showEffectPanel && !showAudioPanel && !showNarrationPanel) {
      syncDraftFromSnapshot()
    }
  }, [
    snapshot,
    showFilterPanel,
    showEffectPanel,
    showAudioPanel,
    showNarrationPanel,
    syncDraftFromSnapshot,
  ])

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
    if (selectedTextId && liveText) {
      setDraftText(cloneOverlay(liveText))
      setSelectedTextId(null)
      setLiveText(null)
    } else {
      setDraftText(null)
    }
    setActiveTool('text')
  }, [selectedTextId, liveText])

  const cancelTextPanel = () => {
    setDraftText(null)
    setSelectedTextId(null)
    setLiveText(null)
    closeAllPanels()
  }

  const openStickerPanel = () => {
    if (selectedStickerId && liveSticker) {
      setDraftSticker(cloneSticker(liveSticker))
      setSelectedStickerId(null)
      setLiveSticker(null)
    } else {
      setDraftSticker(null)
    }
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
    setDraftOriginalAudioRange(appliedOriginalAudioRange)
    setDraftBgmRange(appliedBgmRange)
    setActiveTool('audio')
  }

  const cancelAudioPanel = () => {
    setDraftKeepOriginalAudio(appliedKeepOriginalAudio)
    setDraftBgmId(appliedBgmId)
    setDraftOriginalAudioRange(appliedOriginalAudioRange)
    setDraftBgmRange(appliedBgmRange)
    setActiveFeature((prev) => (prev === 'music' ? null : prev))
    closeAllPanels()
  }

  const confirmAudioPanel = () => {
    const changed =
      draftKeepOriginalAudio !== appliedKeepOriginalAudio ||
      draftBgmId !== appliedBgmId ||
      draftOriginalAudioRange.startTime !== appliedOriginalAudioRange.startTime ||
      draftOriginalAudioRange.endTime !== appliedOriginalAudioRange.endTime ||
      draftBgmRange.startTime !== appliedBgmRange.startTime ||
      draftBgmRange.endTime !== appliedBgmRange.endTime

    pushEditorHistory({
      keepOriginalAudio: draftKeepOriginalAudio,
      bgmId: draftBgmId,
      originalAudioRange: draftOriginalAudioRange,
      bgmRange: draftBgmRange,
    })
    closeAllPanels()
    if (changed) {
      show(editorToasts.audioSaved)
    }
  }

  const openNarrationPanel = () => {
    setDraftNarrationText(
      appliedNarrationText ?? DEFAULT_NARRATION_DRAFT_TEXT,
    )
    setDraftNarrationVoice(appliedNarrationVoice)
    setDraftNarrationEngineId(appliedNarrationEngineId)
    setDraftNarrationEnabled(appliedNarrationEnabled)
    setActiveFeature('narration')
  }

  const cancelNarrationPanel = () => {
    setDraftNarrationText(
      appliedNarrationText ?? DEFAULT_NARRATION_DRAFT_TEXT,
    )
    setDraftNarrationVoice(appliedNarrationVoice)
    setDraftNarrationEngineId(appliedNarrationEngineId)
    setDraftNarrationEnabled(appliedNarrationEnabled)
    setActiveFeature(null)
  }

  const confirmNarrationPanel = () => {
    pushEditorHistory(
      {
        narrationText: draftNarrationText.trim() || null,
        narrationVoice: draftNarrationVoice,
        narrationEngineId: draftNarrationEngineId,
        narrationEnabled: draftNarrationEnabled,
      },
      projectDuration,
    )
    setActiveFeature(null)
    show(
      draftNarrationEnabled
        ? editorToasts.narrationOn
        : editorToasts.narrationOff,
    )
  }

  const handleStickerPick = (stickerId: string) => {
    setDraftSticker((prev) => {
      if (prev) return { ...prev, stickerId }
      const range = createDefaultTimeRangeFromPlayhead(projectDuration, currentTime)
      return {
        ...createDefaultStickerOverlay(
          stickerId,
          appliedStickers.length,
          projectDuration,
          range.startTime,
        ),
        startTime: range.startTime,
        endTime: range.endTime,
      }
    })
  }

  const handleTextChange = (id: string, patch: Partial<TextOverlay>) => {
    if (isTextPanelEditing && draftText?.id === id) {
      setDraftText((prev) => (prev ? { ...prev, ...patch } : prev))
      return
    }
    if (selectedTextId === id) {
      setLiveText((prev) => (prev ? { ...prev, ...patch } : prev))
    }
  }

  const commitLiveText = useCallback(() => {
    if (!liveText || !selectedTextId) return
    pushEditorHistory({
      textOverlays: appliedTexts.map((t) =>
        t.id === liveText.id ? cloneOverlay(liveText) : cloneOverlay(t),
      ),
    })
  }, [liveText, selectedTextId, pushEditorHistory, appliedTexts])

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
    pushEditorHistory({
      stickerOverlays: appliedStickers.map((s) =>
        s.id === liveSticker.id ? cloneSticker(liveSticker) : cloneSticker(s),
      ),
    })
  }, [liveSticker, selectedStickerId, pushEditorHistory, appliedStickers])

  const resolveTextOverlay = useCallback(
    (id: string): TextOverlay | null => {
      if (draftText?.id === id) return draftText
      if (liveText?.id === id) return liveText
      return appliedTexts.find((t) => t.id === id) ?? null
    },
    [draftText, liveText, appliedTexts],
  )

  const resolveStickerOverlay = useCallback(
    (id: string): StickerOverlay | null => {
      if (draftSticker?.id === id) return draftSticker
      if (liveSticker?.id === id) return liveSticker
      return appliedStickers.find((s) => s.id === id) ?? null
    },
    [draftSticker, liveSticker, appliedStickers],
  )

  const clearTextSelection = useCallback(() => {
    setSelectedTextId(null)
    setLiveText(null)
  }, [])

  const clearStickerSelection = useCallback(() => {
    setSelectedStickerId(null)
    setLiveSticker(null)
  }, [])

  const selectText = useCallback(
    (text: TextOverlay) => {
      setSelectedTextId(text.id)
      setLiveText(cloneOverlay(text))
      clearStickerSelection()
    },
    [clearStickerSelection],
  )

  const selectSticker = useCallback(
    (sticker: StickerOverlay) => {
      setSelectedStickerId(sticker.id)
      setLiveSticker(cloneSticker(sticker))
      clearTextSelection()
    },
    [clearTextSelection],
  )

  const handleTextContextMenu = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault()
      e.stopPropagation()
      const text = resolveTextOverlay(id)
      if (!text) return
      if (selectedStickerId) commitLiveSticker()
      clearStickerSelection()
      selectText(text)
      setContextMenu({ x: e.clientX, y: e.clientY, target: { kind: 'text', id } })
    },
    [
      resolveTextOverlay,
      selectedStickerId,
      commitLiveSticker,
      clearStickerSelection,
      selectText,
    ],
  )

  const handleStickerContextMenu = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault()
      e.stopPropagation()
      const sticker = resolveStickerOverlay(id)
      if (!sticker) return
      if (selectedTextId) commitLiveText()
      clearTextSelection()
      selectSticker(sticker)
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        target: { kind: 'sticker', id },
      })
    },
    [resolveStickerOverlay, selectSticker, selectedTextId, commitLiveText, clearTextSelection],
  )

  const openTextEditPanel = useCallback(
    (source: TextOverlay) => {
      setDraftText(cloneOverlay(source))
      clearTextSelection()
      setActiveTool('text')
      closeContextMenu()
    },
    [clearTextSelection, closeContextMenu],
  )

  const openStickerEditPanel = useCallback(
    (source: StickerOverlay) => {
      setDraftSticker(cloneSticker(source))
      clearStickerSelection()
      setActiveTool('sticker')
      closeContextMenu()
    },
    [clearStickerSelection, closeContextMenu],
  )

  const syncTextsFromLive = useCallback((): TextOverlay[] => {
    let texts = cloneTexts(appliedTexts)
    if (liveText && selectedTextId) {
      const exists = texts.some((t) => t.id === liveText.id)
      if (exists) {
        texts = texts.map((t) =>
          t.id === liveText.id ? cloneOverlay(liveText) : t,
        )
      }
    }
    return texts
  }, [appliedTexts, liveText, selectedTextId])

  const syncStickersFromLive = useCallback((): StickerOverlay[] => {
    let stickers = cloneStickers(appliedStickers)
    if (liveSticker && selectedStickerId) {
      const exists = stickers.some((s) => s.id === liveSticker.id)
      if (exists) {
        stickers = stickers.map((s) =>
          s.id === liveSticker.id ? cloneSticker(liveSticker) : s,
        )
      }
    }
    return stickers
  }, [appliedStickers, liveSticker, selectedStickerId])

  const pasteFromClipboard = useCallback(() => {
    const clip = clipboardRef.current
    if (!clip) {
      show(editorToasts.clipboardEmpty)
      return
    }

    if (clip.type === 'bgm') {
      pushEditorHistory({
        bgmId: clip.data.bgmId,
        bgmRange: clip.data.bgmRange,
      })
      setDraftBgmId(clip.data.bgmId)
      setDraftBgmRange(clip.data.bgmRange)
      openAudioPanel()
      show(editorToasts.pasted)
      return
    }
    closeAllPanels()
    setDraftText(null)
    setDraftSticker(null)

    if (clip.type === 'sticker') {
      const dup = duplicateStickerOverlay(cloneSticker(clip.data), projectDuration)
      pushEditorHistory({
        stickerOverlays: [...syncStickersFromLive(), dup],
      })
      selectSticker(dup)
      show(editorToasts.pasted)
      return
    }

    const dup = duplicateTextOverlay(cloneOverlay(clip.data), projectDuration)
    pushEditorHistory({
      textOverlays: [...syncTextsFromLive(), cloneOverlay(dup)],
    })
    selectText(dup)
    show(editorToasts.pasted)
  }, [
    closeAllPanels,
    pushHistory,
    snapshot,
    show,
    syncStickersFromLive,
    syncTextsFromLive,
    selectSticker,
    selectText,
    openAudioPanel,
  ])

  const copyTextObject = useCallback(
    (text: TextOverlay) => {
      const source = cloneOverlay(text)
      clipboardRef.current = { type: 'text', data: source }

      let texts = syncTextsFromLive()
      if (!texts.some((t) => t.id === source.id)) {
        texts = [...texts, source]
      }
      const dup = duplicateTextOverlay(source, projectDuration)
      pushEditorHistory({
        textOverlays: [...texts, cloneOverlay(dup)],
      })
      setDraftText(null)
      closeAllPanels()
      selectText(dup)
      show(editorToasts.copied)
    },
    [syncTextsFromLive, pushHistory, snapshot, closeAllPanels, selectText, show],
  )

  const copyStickerObject = useCallback(
    (sticker: StickerOverlay) => {
      const source = cloneSticker(sticker)
      clipboardRef.current = { type: 'sticker', data: source }

      let stickers = syncStickersFromLive()
      if (!stickers.some((s) => s.id === source.id)) {
        stickers = [...stickers, source]
      }
      const dup = duplicateStickerOverlay(source, projectDuration)
      pushEditorHistory({
        stickerOverlays: [...stickers, dup],
      })
      setDraftSticker(null)
      closeAllPanels()
      selectSticker(dup)
      show(editorToasts.copied)
    },
    [
      syncStickersFromLive,
      pushHistory,
      snapshot,
      closeAllPanels,
      selectSticker,
      show,
    ],
  )

  const copyBgmObject = useCallback(() => {
    const bgmId = showAudioPanel ? draftBgmId : appliedBgmId
    const bgmRange = showAudioPanel ? draftBgmRange : appliedBgmRange
    if (!bgmId) return
    clipboardRef.current = {
      type: 'bgm',
      data: { bgmId, bgmRange: { ...bgmRange } },
    }
    show(editorToasts.cutDone)
  }, [showAudioPanel, draftBgmId, appliedBgmId, draftBgmRange, appliedBgmRange, show])

  const handleOverlayMenuAction = useCallback(
    (action: OverlayMenuAction, target: OverlayMenuTarget) => {
      if (action === 'paste' || target.kind === 'canvas') {
        pasteFromClipboard()
        return
      }

      if (target.kind === 'text') {
        const text = resolveTextOverlay(target.id)
        if (!text) return

        if (action === 'edit') {
          openTextEditPanel(text)
          return
        }

        if (action === 'copy') {
          copyTextObject(text)
          return
        }

        if (action === 'cut') {
          clipboardRef.current = { type: 'text', data: cloneOverlay(text) }
          let texts = syncTextsFromLive()
          texts = texts.filter((t) => t.id !== text.id)
          pushEditorHistory({ textOverlays: texts })
          if (draftText?.id === text.id) setDraftText(null)
          clearTextSelection()
          closeAllPanels()
          show(editorToasts.cutDone)
          return
        }

        if (action === 'delete') {
          let texts = syncTextsFromLive()
          texts = texts.filter((t) => t.id !== text.id)
          pushEditorHistory({ textOverlays: texts })
          if (draftText?.id === text.id) setDraftText(null)
          clearTextSelection()
          closeAllPanels()
          show(editorToasts.deleted)
        }
        return
      }

      if (target.kind === 'bgm') {
        const bgmId = showAudioPanel ? draftBgmId : appliedBgmId
        const bgmRange = showAudioPanel ? draftBgmRange : appliedBgmRange
        if (!bgmId) return

        if (action === 'edit') {
          openAudioPanel()
          return
        }

        if (action === 'copy') {
          copyBgmObject()
          return
        }

        if (action === 'cut') {
          clipboardRef.current = {
            type: 'bgm',
            data: { bgmId, bgmRange: { ...bgmRange } },
          }
          pushEditorHistory({ bgmId: null })
          setDraftBgmId(null)
          closeAllPanels()
          show(editorToasts.cutDone)
          return
        }

        if (action === 'delete') {
          pushEditorHistory({ bgmId: null })
          setDraftBgmId(null)
          closeAllPanels()
          show(editorToasts.deleted)
        }
        return
      }

      if (target.kind === 'sticker') {
        const sticker = resolveStickerOverlay(target.id)
        if (!sticker) return

        if (action === 'edit') {
          openStickerEditPanel(sticker)
          return
        }

        if (action === 'copy') {
          copyStickerObject(sticker)
          return
        }

        if (action === 'cut') {
          clipboardRef.current = { type: 'sticker', data: cloneSticker(sticker) }
          let stickers = syncStickersFromLive()
          stickers = stickers.filter((s) => s.id !== sticker.id)
          pushEditorHistory({ stickerOverlays: stickers })
          if (draftSticker?.id === sticker.id) setDraftSticker(null)
          clearStickerSelection()
          closeAllPanels()
          show(editorToasts.cutDone)
          return
        }

        if (action === 'delete') {
          let stickers = syncStickersFromLive()
          stickers = stickers.filter((s) => s.id !== sticker.id)
          pushEditorHistory({ stickerOverlays: stickers })
          if (draftSticker?.id === sticker.id) setDraftSticker(null)
          clearStickerSelection()
          closeAllPanels()
          show(editorToasts.deleted)
        }
      }
    },
    [
      pasteFromClipboard,
      resolveTextOverlay,
      resolveStickerOverlay,
      openTextEditPanel,
      openStickerEditPanel,
      openAudioPanel,
      copyTextObject,
      copyStickerObject,
      copyBgmObject,
      syncTextsFromLive,
      draftText,
      clearTextSelection,
      pushHistory,
      snapshot,
      show,
      closeAllPanels,
      syncStickersFromLive,
      draftSticker,
      clearStickerSelection,
      showAudioPanel,
      draftBgmId,
      appliedBgmId,
      draftBgmRange,
      appliedBgmRange,
    ],
  )

  const handlePreviewContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!clipboardRef.current) return
      if (selectedTextId) {
        commitLiveText()
        clearTextSelection()
      }
      if (selectedStickerId) {
        commitLiveSticker()
        clearStickerSelection()
      }
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        target: { kind: 'canvas' },
      })
    },
    [commitLiveText, commitLiveSticker, clearTextSelection, clearStickerSelection],
  )

  const handleContextMenuAction = useCallback(
    (action: OverlayMenuAction) => {
      if (!contextMenu) return
      handleOverlayMenuAction(action, contextMenu.target)
    },
    [contextMenu, handleOverlayMenuAction],
  )

  const copySelection = useCallback(() => {
    if (selectedTextId) {
      const text = resolveTextOverlay(selectedTextId)
      if (text?.content.trim()) copyTextObject(text)
      return
    }
    if (selectedStickerId) {
      const sticker = resolveStickerOverlay(selectedStickerId)
      if (sticker) copyStickerObject(sticker)
    }
  }, [
    selectedTextId,
    selectedStickerId,
    resolveTextOverlay,
    resolveStickerOverlay,
    copyTextObject,
    copyStickerObject,
  ])

  const cutSelection = useCallback(() => {
    if (selectedTextId) {
      handleOverlayMenuAction('cut', { kind: 'text', id: selectedTextId })
      return
    }
    if (selectedStickerId) {
      handleOverlayMenuAction('cut', { kind: 'sticker', id: selectedStickerId })
    }
  }, [selectedTextId, selectedStickerId, handleOverlayMenuAction])

  const clearAllOverlaySelection = useCallback(() => {
    closeContextMenu()
    setSelectedTimelineClipId(null)
    if (selectedTextId) {
      commitLiveText()
      clearTextSelection()
    }
    if (selectedStickerId) {
      commitLiveSticker()
      clearStickerSelection()
    }
  }, [
    closeContextMenu,
    selectedTextId,
    selectedStickerId,
    commitLiveText,
    commitLiveSticker,
    clearTextSelection,
    clearStickerSelection,
  ])

  const handlePreviewBackgroundClick = clearAllOverlaySelection

  useEffect(() => {
    const onDocumentPointerDown = (e: PointerEvent) => {
      if (
        !shouldClearSelectionOnClick(e.target, {
          isDraggingClip: draggingClipId !== null,
        })
      ) {
        return
      }
      clearAllOverlaySelection()
    }
    document.addEventListener('pointerdown', onDocumentPointerDown)
    return () => document.removeEventListener('pointerdown', onDocumentPointerDown)
  }, [clearAllOverlaySelection, draggingClipId])

  const handleTextActivate = useCallback(
    (id: string) => {
      const target = appliedTexts.find((t) => t.id === id)
      if (!target) return
      closeContextMenu()
      if (isTextPanelEditing) {
        setDraftText(cloneOverlay(target))
        clearTextSelection()
        return
      }
      selectText(target)
      setSelectedTimelineClipId(id)
    },
    [appliedTexts, isTextPanelEditing, selectText, clearTextSelection, closeContextMenu],
  )

  const handleStickerActivate = useCallback(
    (id: string) => {
      const target = appliedStickers.find((s) => s.id === id)
      if (!target) return
      if (selectedTextId) commitLiveText()
      clearTextSelection()
      closeContextMenu()
      if (isStickerPanelEditing) {
        setDraftSticker(cloneSticker(target))
        clearStickerSelection()
        return
      }
      selectSticker(target)
      setSelectedTimelineClipId(id)
    },
    [
      isStickerPanelEditing,
      appliedStickers,
      selectedTextId,
      commitLiveText,
      clearTextSelection,
      selectSticker,
      clearStickerSelection,
      closeContextMenu,
    ],
  )

  const applyClipDragPreview = useCallback(
    (clip: TimelineDisplayClip, range: TimeRange) => {
      const { range: normalized } = normalizeTimeRange(range, projectDuration)
      setClipDragPreview({
        id: clip.id,
        kind: clip.kind as ClipDragPreview['kind'],
        startTime: normalized.startTime,
        endTime: normalized.endTime,
      })

      if (clip.kind === 'text') {
        if (isTextPanelEditing && draftText?.id === clip.id) {
          setDraftText((prev) => (prev ? { ...prev, ...normalized } : prev))
        } else if (liveText?.id === clip.id) {
          setLiveText((prev) => (prev ? { ...prev, ...normalized } : prev))
        }
      } else if (clip.kind === 'sticker') {
        if (isStickerPanelEditing && draftSticker?.id === clip.id) {
          setDraftSticker((prev) => (prev ? { ...prev, ...normalized } : prev))
        } else if (liveSticker?.id === clip.id) {
          setLiveSticker((prev) => (prev ? { ...prev, ...normalized } : prev))
        }
      } else if (clip.kind === 'originalAudio' && showAudioPanel) {
        setDraftOriginalAudioRange(normalized)
      } else if (clip.kind === 'bgm' && showAudioPanel) {
        setDraftBgmRange(normalized)
      }
    },
    [
      isTextPanelEditing,
      draftText?.id,
      liveText,
      isStickerPanelEditing,
      draftSticker?.id,
      liveSticker,
      showAudioPanel,
    ],
  )

  const resolveDragRange = useCallback(
    (
      clientX: number,
      trackWidthPx: number,
    ): { range: TimeRange; snapEdge: PlayheadSnapEdge | null } | null => {
      const session = clipDragSessionRef.current
      if (!session) return null
      const deltaPx = clientX - session.startClientX
      const deltaSec = timeDeltaFromPointerDrag(
        deltaPx,
        trackWidthPx,
        projectDuration,
      )
      const origin = {
        startTime: session.originStart,
        endTime: session.originEnd,
      }
      let range: TimeRange | null = null
      if (session.mode === 'move') {
        range = shiftTimeRange(origin, deltaSec, projectDuration)
      } else if (session.mode === 'resize-start') {
        range = resizeTimeRange(origin, 'start', deltaSec, projectDuration)
      } else if (session.mode === 'resize-end') {
        range = resizeTimeRange(origin, 'end', deltaSec, projectDuration)
      }
      if (!range) return null

      const thresholdSec = snapThresholdSecFromPx(
        TIMELINE_SNAP_THRESHOLD_PX,
        trackWidthPx,
        projectDuration,
      )
      const targets = buildClipDragSnapTargets(
        timelineOverlayClips,
        currentTime,
        projectDuration,
        session.clip.id,
      )
      const snapped = snapRangeToTargetTimes(
        range,
        targets,
        projectDuration,
        session.mode,
        thresholdSec,
      )
      const playheadAligned =
        snapped.snapped != null &&
        (Math.abs(snapped.range.startTime - Math.round(currentTime)) < 0.01 ||
          Math.abs(snapped.range.endTime - Math.round(currentTime)) < 0.01)
      return {
        range: snapped.range,
        snapEdge: playheadAligned ? snapped.snapped : null,
      }
    },
    [currentTime, projectDuration, timelineOverlayClips],
  )

  const commitClipDrag = useCallback(
    (clip: TimelineDisplayClip, range: TimeRange) => {
      const { range: normalized } = normalizeTimeRange(range, projectDuration)

      if (clip.kind === 'text') {
        const inApplied = appliedTexts.some((t) => t.id === clip.id)
        if (isTextPanelEditing && draftText?.id === clip.id && !inApplied) {
          setDraftText((prev) => (prev ? { ...prev, ...normalized } : prev))
        } else {
          const nextTexts = appliedTexts.map((t) =>
            t.id === clip.id
              ? overlayWithNormalizedRange({ ...t, ...normalized }, projectDuration)
              : t,
          )
          pushEditorHistory({ textOverlays: nextTexts })
          if (selectedTextId === clip.id) {
            const updated = nextTexts.find((t) => t.id === clip.id)
            if (updated) setLiveText(cloneOverlay(updated))
          }
        }
      } else if (clip.kind === 'sticker') {
        const inApplied = appliedStickers.some((s) => s.id === clip.id)
        if (isStickerPanelEditing && draftSticker?.id === clip.id && !inApplied) {
          setDraftSticker((prev) => (prev ? { ...prev, ...normalized } : prev))
        } else {
          const nextStickers = appliedStickers.map((s) =>
            s.id === clip.id
              ? overlayWithNormalizedRange({ ...s, ...normalized }, projectDuration)
              : s,
          )
          pushEditorHistory({ stickerOverlays: nextStickers })
          if (selectedStickerId === clip.id) {
            const updated = nextStickers.find((s) => s.id === clip.id)
            if (updated) setLiveSticker(cloneSticker(updated))
          }
        }
      } else if (clip.kind === 'originalAudio') {
        pushEditorHistory({ originalAudioRange: normalized })
        setDraftOriginalAudioRange(normalized)
      } else if (clip.kind === 'bgm') {
        pushEditorHistory({ bgmRange: normalized })
        setDraftBgmRange(normalized)
      }
    },
    [
      appliedTexts,
      appliedStickers,
      isTextPanelEditing,
      draftText?.id,
      isStickerPanelEditing,
      draftSticker?.id,
      selectedTextId,
      selectedStickerId,
      pushHistory,
      snapshot,
    ],
  )

  const handleOverlayClipDragStart = useCallback(
    (
      clip: TimelineDisplayClip,
      clientX: number,
      mode: TimelineClipDragMode,
    ) => {
      if (!isDraggableClipKind(clip.kind)) return
      setIsPlaying(false)
      clipDragSessionRef.current = {
        clip,
        mode,
        originStart: clip.startTime,
        originEnd: clip.endTime,
        startClientX: clientX,
      }
      setDraggingClipId(clip.id)
      setPlayheadSnapEdge(null)
    },
    [setIsPlaying],
  )

  const handleOverlayClipDragMove = useCallback(
    (clip: TimelineDisplayClip, clientX: number, trackWidthPx: number) => {
      const resolved = resolveDragRange(clientX, trackWidthPx)
      if (!resolved) return
      setPlayheadSnapEdge(resolved.snapEdge)
      applyClipDragPreview(clip, resolved.range)
    },
    [resolveDragRange, applyClipDragPreview],
  )

  const handleOverlayClipDragEnd = useCallback(
    (clip: TimelineDisplayClip, clientX: number, trackWidthPx: number) => {
      const resolved = resolveDragRange(clientX, trackWidthPx)
      if (resolved) commitClipDrag(clip, resolved.range)
      clipDragSessionRef.current = null
      setDraggingClipId(null)
      setPlayheadSnapEdge(null)
      setClipDragPreview(null)
    },
    [resolveDragRange, commitClipDrag],
  )

  const handleTimelineClipOpenMenu = useCallback(
    (clip: TimelineDisplayClip, x: number, y: number) => {
      if (!hasTimelineClipMenu(clip.kind)) return
      setIsPlaying(false)
      if (selectedTextId && clip.kind !== 'text') commitLiveText()
      if (selectedStickerId && clip.kind !== 'sticker') commitLiveSticker()
      const target: OverlayMenuTarget =
        clip.kind === 'text'
          ? { kind: 'text', id: clip.id }
          : clip.kind === 'sticker'
            ? { kind: 'sticker', id: clip.id }
            : { kind: 'bgm' }
      setContextMenu({ x, y, target })
    },
    [
      commitLiveText,
      commitLiveSticker,
      selectedTextId,
      selectedStickerId,
      setIsPlaying,
    ],
  )

  const handleTimelineClipClick = useCallback(
    (clip: TimelineDisplayClip) => {
      closeContextMenu()
      setSelectedTimelineClipId(clip.id)

      if (clip.kind === 'text') {
        const text = resolveTextOverlay(clip.id)
        if (!text) return
        if (selectedStickerId) {
          commitLiveSticker()
          clearStickerSelection()
        }
        selectText(text)
        return
      }

      if (clip.kind === 'sticker') {
        const sticker = resolveStickerOverlay(clip.id)
        if (!sticker) return
        if (selectedTextId) {
          commitLiveText()
          clearTextSelection()
        }
        selectSticker(sticker)
        return
      }

      if (selectedTextId) {
        commitLiveText()
        clearTextSelection()
      }
      if (selectedStickerId) {
        commitLiveSticker()
        clearStickerSelection()
      }
    },
    [
      closeContextMenu,
      resolveTextOverlay,
      resolveStickerOverlay,
      selectText,
      selectSticker,
      selectedTextId,
      selectedStickerId,
      commitLiveText,
      commitLiveSticker,
      clearTextSelection,
      clearStickerSelection,
    ],
  )

  const handleTimelineClipDoubleClick = useCallback(
    (clip: TimelineDisplayClip) => {
      if (clip.kind === 'text') {
        const text = resolveTextOverlay(clip.id)
        if (text) openTextEditPanel(text)
        return
      }
      if (clip.kind === 'sticker') {
        const sticker = resolveStickerOverlay(clip.id)
        if (sticker) openStickerEditPanel(sticker)
        return
      }
      if (clip.kind === 'originalAudio' || clip.kind === 'bgm') {
        openAudioPanel()
      }
    },
    [
      resolveTextOverlay,
      resolveStickerOverlay,
      openTextEditPanel,
      openStickerEditPanel,
      openAudioPanel,
    ],
  )

  const handleFeatureSelect = (id: string, label: string) => {
    if (id === 'music') {
      if (activeTool === 'audio') {
        cancelAudioPanel()
      } else {
        setActiveFeature('music')
        openAudioPanel()
      }
      return
    }
    if (id === 'narration') {
      openNarrationPanel()
      return
    }
    setActiveFeature(id)
    show(editorToasts.featureDev(label))
  }

  const handleToolSelect = (id: string, _label: string) => {
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
    clearTextSelection()
    clearStickerSelection()
    setActiveTool(id)
  }

  const handleFilterSelect = (id: string) => {
    setDraftFilterId(id)
    if (id !== 'none') setDraftIntensity(100)
  }

  const confirmEffectPanel = () => {
    pushEditorHistory({ effectId: draftEffectId })
    closeAllPanels()
    const name = EFFECT_PRESETS.find((e) => e.id === draftEffectId)?.name ?? ''
    if (draftEffectId === 'none') {
      show(editorToasts.effectOff)
    } else {
      show(editorToasts.effectOn(name))
    }
  }

  const confirmFilterPanel = () => {
    pushEditorHistory({
      filterId: draftFilterId,
      filterIntensity: draftIntensity,
    })
    closeAllPanels()
    const name = FILTER_PRESETS.find((f) => f.id === draftFilterId)?.name ?? ''
    if (draftFilterId === 'none') {
      show(editorToasts.filterOff)
    } else {
      show(editorToasts.filterOn(name, draftIntensity))
    }
  }

  const handleDraftTextChange = (patch: Partial<TextOverlay>) => {
    setDraftText((prev) => {
      if (prev) return { ...prev, ...patch }
      const range = createDefaultTimeRangeFromPlayhead(projectDuration, currentTime)
      return {
        ...createDefaultTextOverlay(
          projectDuration,
          range.startTime,
          appliedTexts.length,
        ),
        startTime: range.startTime,
        endTime: range.endTime,
        ...patch,
      }
    })
  }

  const confirmStickerPanel = () => {
    let nextStickers = cloneStickers(appliedStickers)
    if (draftSticker) {
      const idx = nextStickers.findIndex((s) => s.id === draftSticker.id)
      if (idx >= 0) {
        nextStickers = nextStickers.map((s, i) =>
          i === idx ? cloneSticker(draftSticker) : s,
        )
      } else {
        nextStickers = [...nextStickers, cloneSticker(draftSticker)]
      }
    }

    pushEditorHistory({ stickerOverlays: nextStickers })
    setDraftSticker(null)
    setSelectedStickerId(null)
    setLiveSticker(null)
    closeAllPanels()
    if (draftSticker) {
      const name = getStickerPreset(draftSticker.stickerId)?.name ?? '??'
      show(editorToasts.stickerOn(name))
    }
  }

  const confirmTextPanel = () => {
    if (!draftText) return
    const trimmed = draftText.content.trim()
    if (!trimmed) {
      setDraftText(null)
      closeAllPanels()
      return
    }

    let nextTexts = cloneTexts(appliedTexts)
    const idx = nextTexts.findIndex((t) => t.id === draftText.id)
    const saved = cloneOverlay({ ...draftText, content: trimmed })
    if (idx >= 0) {
      nextTexts = nextTexts.map((t, i) => (i === idx ? saved : t))
    } else {
      nextTexts = [...nextTexts, saved]
    }

    pushEditorHistory({ textOverlays: nextTexts })
    setDraftText(null)
    setSelectedTextId(null)
    setLiveText(null)
    closeAllPanels()
    show(editorToasts.textSaved)
  }


  const buildExportSnapshot = useCallback((): EditorSnapshot => {
    let textOverlays = syncTextsFromLive()
    if (isTextPanelEditing && draftText) {
      const trimmed = draftText.content.trim()
      const idx = textOverlays.findIndex((t) => t.id === draftText.id)
      if (trimmed) {
        const next = cloneOverlay({ ...draftText, content: trimmed })
        if (idx >= 0) textOverlays = textOverlays.map((t, i) => (i === idx ? next : t))
        else textOverlays = [...textOverlays, next]
      } else if (idx >= 0) {
        textOverlays = textOverlays.filter((t) => t.id !== draftText.id)
      }
    }

    let stickerOverlays = syncStickersFromLive()
    if (isStickerPanelEditing && draftSticker) {
      const idx = stickerOverlays.findIndex((s) => s.id === draftSticker.id)
      if (idx >= 0) {
        stickerOverlays = stickerOverlays.map((s, i) =>
          i === idx ? cloneSticker(draftSticker) : s,
        )
      } else {
        stickerOverlays = [...stickerOverlays, cloneSticker(draftSticker)]
      }
    }

    return buildSnapshot(
      snapshot,
      {
        title,
        filterId: showFilterPanel ? draftFilterId : appliedFilterId,
        filterIntensity: showFilterPanel ? draftIntensity : appliedIntensity,
        effectId: showEffectPanel ? draftEffectId : appliedEffectId,
        textOverlays,
        stickerOverlays,
        keepOriginalAudio: showAudioPanel ? draftKeepOriginalAudio : appliedKeepOriginalAudio,
        bgmId: showAudioPanel ? draftBgmId : appliedBgmId,
        originalAudioRange: showAudioPanel ? draftOriginalAudioRange : appliedOriginalAudioRange,
        bgmRange: showAudioPanel ? draftBgmRange : appliedBgmRange,
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
      },
      projectDuration,
    )
  }, [
    snapshot,
    title,
    appliedFilterId,
    appliedIntensity,
    appliedEffectId,
    appliedKeepOriginalAudio,
    appliedBgmId,
    appliedOriginalAudioRange,
    appliedBgmRange,
    showFilterPanel,
    draftFilterId,
    draftIntensity,
    showEffectPanel,
    draftEffectId,
    isTextPanelEditing,
    draftText,
    isStickerPanelEditing,
    draftSticker,
    showAudioPanel,
    draftKeepOriginalAudio,
    draftBgmId,
    draftOriginalAudioRange,
    draftBgmRange,
    showNarrationPanel,
    draftNarrationText,
    draftNarrationVoice,
    draftNarrationEngineId,
    draftNarrationEnabled,
    appliedNarrationText,
    appliedNarrationVoice,
    appliedNarrationEngineId,
    appliedNarrationEnabled,
    syncTextsFromLive,
    syncStickersFromLive,
    projectDuration,
  ])

  const handleExport = useCallback(async () => {
    if (!hasStudioEditorProject()) {
      show(editorToasts.exportNeedProject)
      navigate('/create')
      return
    }

    const hasLocalVideo = clips.some((clip) => clip.videoSrc)
    if (!hasLocalVideo) {
      show(editorToasts.exportNeedLocal)
      return
    }

    setIsPlaying(false)
    setExporting(true)
    setExportProgress(0)
    setExportMessage(EXPORT_MESSAGE_PREPARING)
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
      const studioPayload: StudioExportResult = {
        title: result.title || '我的 Vlog',
        videoUrl: result.url,
        coverUrl: result.posterUrl,
        durationSec: result.duration,
      }
      try {
        sessionStorage.setItem(
          STUDIO_EXPORT_RESULT_KEY,
          JSON.stringify(studioPayload),
        )
      } catch {
        /* ignore quota */
      }
      show(editorToasts.exportDone)
      navigate('/complete', { state: { flow: 'studio' } })
    } catch (error) {
      const msg = error instanceof Error ? error.message : ''
      if (msg !== 'cancelled') {
        const hint =
          msg.includes('\u5185\u5b58') || msg.includes('Memory')
            ? editorToasts.exportMemHint
            : ''
        show((msg || editorToasts.exportFailed) + hint)
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
    setExportMessage(EXPORT_MESSAGE_CANCELLING)
  }

  const handleToggleEditTitle = () => {
    if (isEditingTitle) {
      const trimmed = titleDraft.trim() || title
      setTitleDraft(trimmed)
      if (trimmed !== title) {
        pushEditorHistory({ title: trimmed })
        show(editorToasts.titleUpdated)
      }
      setIsEditingTitle(false)
    } else {
      setTitleDraft(title)
      setIsEditingTitle(true)
    }
  }

  const handleUndo = useCallback(() => {
    if (!canUndo) return
    closeContextMenu()
    closeAllPanels()
    setDraftText(null)
    setDraftSticker(null)
    clearTextSelection()
    clearStickerSelection()
    undo()
    show(editorToasts.undo)
  }, [canUndo, closeAllPanels, clearTextSelection, clearStickerSelection, closeContextMenu, undo, show])

  const handleRedo = useCallback(() => {
    if (!canRedo) return
    closeContextMenu()
    closeAllPanels()
    setDraftText(null)
    setDraftSticker(null)
    clearTextSelection()
    clearStickerSelection()
    redo()
    show(editorToasts.redo)
  }, [canRedo, closeAllPanels, clearTextSelection, clearStickerSelection, closeContextMenu, redo, show])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey
      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
        return
      }
      if (mod && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        e.preventDefault()
        handleRedo()
        return
      }
      if (!mod) return
      const key = e.key.toLowerCase()
      if (key === 'c') {
        e.preventDefault()
        copySelection()
      } else if (key === 'v') {
        e.preventDefault()
        pasteFromClipboard()
      } else if (key === 'x') {
        e.preventDefault()
        cutSelection()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleUndo, handleRedo, copySelection, pasteFromClipboard, cutSelection])

  return (
    <PageShell>
      <TopBar
        title={isEditingTitle ? titleDraft : title}
        isEditingTitle={isEditingTitle}
        canUndo={canUndo}
        canRedo={canRedo}
        onBack={() => navigate('/')}
        exporting={exporting}
        onExport={handleExport}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onTitleChange={setTitleDraft}
        onToggleEditTitle={handleToggleEditTitle}
      />

      <div
        data-editor-page=""
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
      <VideoPreview
        poster={activeClip.poster}
        videoSrc={activeClip.videoSrc}
        clipTransform={previewClipTransform}
        clipTime={clipTime}
        clipTimelineStart={activeClip.start}
        clipSourceOffset={activeClip.sourceOffset ?? 0}
        playbackRate={activePlaybackRate}
        onTimelineSync={handlePreviewTimelineSync}
        isCropMode={isCropMode}
        cropDraft={draftCrop}
        onCropChange={setDraftCrop}
        onCropConfirm={handleCropConfirm}
        onCropCancel={handleCropCancel}
        currentTime={currentTime}
        duration={projectDuration}
        isPlaying={isPlaying}
        filterCss={getFilterCss(previewFilterId)}
        filterIntensity={previewIntensity}
        effectId={previewEffectId}
        textItems={previewTextItems}
        onTextChange={handleTextChange}
        onTextTransformEnd={
          selectedTextId && !isTextPanelEditing ? commitLiveText : undefined
        }
        onTextActivate={handleTextActivate}
        stickerItems={previewStickerItems}
        onStickerChange={handleStickerChange}
        onStickerTransformEnd={
          selectedStickerId && !isStickerPanelEditing ? commitLiveSticker : undefined
        }
        onStickerActivate={handleStickerActivate}
        onPreviewBackgroundClick={handlePreviewBackgroundClick}
        onPreviewContextMenu={handlePreviewContextMenu}
        selectedTextId={selectedTextId}
        selectedStickerId={selectedStickerId}
        onTextContextMenu={handleTextContextMenu}
        onStickerContextMenu={handleStickerContextMenu}
        onTogglePlay={togglePlay}
        onSeek={handleSeekRatio}
        onSourceAspectChange={setPreviewSourceAspect}
        previewMuted={
          !previewKeepOriginalAudio ||
          !activeClip.videoSrc ||
          !isActiveAtTime(currentTime, effectiveOriginalAudioRange)
        }
        previewVolume={previewVideoVolume}
      />

      {contextMenu && (
        <OverlayContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={
            contextMenu.target.kind === 'canvas'
              ? ['paste']
              : OBJECT_MENU_ITEMS
          }
          onClose={closeContextMenu}
          onAction={handleContextMenuAction}
        />
      )}

      <input
        ref={importInputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={(e) => void handleImportFiles(e.target.files)}
      />

      <AIFeatureBar activeId={activeFeature} onSelect={handleFeatureSelect} />

      <Timeline
        clips={clips}
        highlightAt={highlightAt}
        currentTime={currentTime}
        duration={projectDuration}
        isPlaying={isPlaying}
        highlightFollowsPlayhead={highlightFollowsPlayhead}
        onImportClick={handleImportClick}
        importLoading={importingVideos}
        onOverlayTracksWidthChange={(width) => {
          if (width > 0) timelineContentWidthPxRef.current = width
        }}
        overlayClips={timelineOverlayClips}
        draggingClipId={draggingClipId}
        playheadSnapActive={playheadSnapEdge !== null || playheadSeekSnapped}
        playheadSnapEdge={playheadSnapEdge}
        onSeek={seekWithPlayheadSnap}
        onPlayheadSeekEnd={clearPlayheadSeekSnap}
        onClipSelect={handleClipSelect}
        selectedVideoClipId={selectedVideoClipId}
        onEditTool={handleTimelineEditTool}
        canSplitClip={canSplitSelectedClip}
        canDeleteClip={canDeleteSelectedClip}
        clipPlaybackRate={selectedClipPlaybackRate}
        onClipPlaybackRateChange={handleClipPlaybackRateChange}
        activeEditTool={isCropMode ? 'crop' : null}
        onOverlayClipClick={handleTimelineClipClick}
        onOverlayClipDoubleClick={handleTimelineClipDoubleClick}
        onOverlayClipOpenMenu={handleTimelineClipOpenMenu}
        onOverlayClipDragStart={handleOverlayClipDragStart}
        onOverlayClipDragMove={handleOverlayClipDragMove}
        onOverlayClipDragEnd={handleOverlayClipDragEnd}
      />

      <div className="flex shrink-0 flex-col">
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
            videoDuration={projectDuration}
            currentTime={currentTime}
            onPick={handleStickerPick}
            onRangeChange={(range) => {
              setDraftSticker((prev) =>
                prev
                  ? {
                      ...prev,
                      startTime: range.startTime,
                      endTime: range.endTime,
                    }
                  : prev,
              )
            }}
            onRemove={() => setDraftSticker(null)}
            onConfirm={confirmStickerPanel}
            onClose={cancelStickerPanel}
          />
        )}

        {showTextPanel && (
          <TextPanel
            draft={draftText}
            videoDuration={projectDuration}
            currentTime={currentTime}
            onChange={handleDraftTextChange}
            onRemove={() => setDraftText(null)}
            onConfirm={confirmTextPanel}
            onClose={cancelTextPanel}
          />
        )}

        {showAudioPanel && (
          <AudioPanel
            keepOriginalAudio={draftKeepOriginalAudio}
            selectedBgmId={draftBgmId}
            originalAudioRange={draftOriginalAudioRange}
            bgmRange={draftBgmRange}
            videoDuration={projectDuration}
            onKeepOriginalChange={setDraftKeepOriginalAudio}
            onBgmSelect={setDraftBgmId}
            onOriginalRangeChange={setDraftOriginalAudioRange}
            onBgmRangeChange={setDraftBgmRange}
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

        <BottomToolbar activeTool={activeTool} onSelect={handleToolSelect} />
      </div>

      <ExportDialog
        open={exporting}
        progress={exportProgress}
        message={exportMessage}
        onCancel={handleCancelExport}
      />

      <Toast message={message} visible={visible} />
      </div>
    </PageShell>
  )
}
