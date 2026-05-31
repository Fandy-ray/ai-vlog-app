import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  getClipAtTime,
  getClipPreviewSrc,
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
  deleteActiveEditorDraft,
  getActiveDraftId,
  hasMeaningfulDraftContent,
  saveEditorDraft,
} from '@/utils/editorDraftStore'
import {
  LAST_COMPLETE_FLOW_KEY,
  STUDIO_EXPORT_RESULT_KEY,
  type StudioExportResult,
} from '@/constants/projectFlow'
import { DEFAULT_CROP } from '@/types/clipTransform'
import type { NormalizedCrop } from '@/types/clipTransform'
import { refineCropToFillFrame } from '@/utils/videoFit'
import type { TimelineToolId } from '@/components/editor/TimelineToolbar'
import {
  deleteClipAt,
  deleteClipById,
  deleteClipRange,
  keepClipRange,
  rotateClip,
  rotateClipByDelta,
  setClipCrop,
  setClipPlaybackRate,
  applyTransitionAtJoinIndex,
  clearTransitionAtJoinIndex,
  findJoinIndexNearTime,
  listClipJoinPoints,
  splitClipAt,
  toggleClipMirror,
} from '@/utils/clipOperations'
import type { TransitionPresetId } from '@/data/clipTransitions'
import { transitionKindLabel } from '@/types/clipTransition'
import { DEFAULT_TRANSITION_DURATION } from '@/types/clipTransition'
import {
  resolveTransitionOpacityAtTime,
  resolveTransitionPreview,
} from '@/utils/transitionPreview'
import {
  applyVoiceTransition,
  voiceTransitionErrorMessage,
} from '@/utils/voiceTransition'
import {
  appendClipsFromImports,
  attachLocalVideosToClips,
  probeVideoFile,
} from '@/utils/videoImport'
import {
  countPendingCollabUploads,
  syncCollabClipsToCloud,
} from '@/utils/collabClipSync'
import { clipHasPlayableVideo } from '@/utils/collaborativeSnapshot'
import { exportEditedVideo } from '@/utils/export/exportVideo'
import { PageShell } from '@/components/PageShell'
import { Toast } from '@/components/Toast'
import { AIFeatureBar } from '@/components/editor/AIFeatureBar'
import { AudioPanel } from '@/components/editor/AudioPanel'
import {
  VoiceClipPanel,
  type VoiceCommandItem,
} from '@/components/editor/VoiceClipPanel'
import {
  MagicDoodlePanel,
  type MagicDoodleDraft,
  type MagicDoodleMode,
} from '@/components/editor/MagicDoodlePanel'
import { NarrationPanel } from '@/components/editor/NarrationPanel'
import { BottomToolbar } from '@/components/editor/BottomToolbar'
import { EffectPanel } from '@/components/editor/EffectPanel'
import { FilterPanel } from '@/components/editor/FilterPanel'
import { TransitionPanel } from '@/components/editor/TransitionPanel'
import { StickerPanel } from '@/components/editor/StickerPanel'
import { TextPanel } from '@/components/editor/TextPanel'
import { Timeline } from '@/components/editor/Timeline'
import { ExportDialog } from '@/components/editor/ExportDialog'
import { TopBar } from '@/components/editor/TopBar'
import { CollaborativeEditingSheet } from '@/components/editor/CollaborativeEditingSheet'
import {
  OverlayContextMenu,
  type OverlayMenuAction,
} from '@/components/editor/OverlayContextMenu'
import {
  VideoPreview,
  type VideoPreviewHandle,
  type StickerPreviewItem,
  type TextPreviewItem,
} from '@/components/editor/VideoPreview'
import { EFFECT_PRESETS } from '@/data/effects'
import { FILTER_PRESETS, getFilterCss } from '@/data/filters'
import {
  createDefaultStickerOverlay,
  createStickerId,
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
import {
  getCollaborativeUserId,
  useCollaborativeEditor,
} from '@/hooks/useCollaborativeEditor'
import { useUser } from '@/context/UserContext'
import type {
  DoodleStroke,
  EditorSnapshot,
  StickerOverlay,
  TextOverlay,
} from '@/types/editorState'
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
import { generateDoodleImage, storeDoodleAsset } from '@/api/doodle'
import { recommendBgmFromDescription } from '@/utils/recommendBgmFromDescription'
import { addExportedVlogToGarden } from '@/utils/gardenStore'
import { assertAiVisionAllowed, assertAlbumAccessAllowed } from '@/utils/privacySettings'
import {
  DEFAULT_DOODLE_PLACEMENT,
  isolateFlatBackground,
  resolveDoodlePlacement,
} from '@/utils/doodleForeground'
import type { DoodleBrushSettings } from '@/utils/animatedDoodle'

type OverlayMenuTarget =
  | { kind: 'text'; id: string }
  | { kind: 'sticker'; id: string }
  | { kind: 'bgm' }
  | { kind: 'canvas' }

type LegacyEditorSnapshot = EditorSnapshot & {
  textOverlay?: TextOverlay | null
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('图片读取失败'))
    img.src = src
  })
}

async function composeFrameAndDoodle(frameImage: string, doodleImage: string) {
  const [frame, doodle] = await Promise.all([
    loadImageElement(frameImage),
    loadImageElement(doodleImage),
  ])
  const canvas = document.createElement('canvas')
  canvas.width = frame.naturalWidth || 1280
  canvas.height = frame.naturalHeight || 720
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('画布不可用')
  ctx.drawImage(frame, 0, 0, canvas.width, canvas.height)
  ctx.drawImage(doodle, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.88)
}

function buildDoodlePrompt(draft: MagicDoodleDraft) {
  const base = draft.prompt.trim()
  if (draft.mode === 'sticker') {
    return `${base}。将参考涂鸦优化成清晰精致的 vlog 贴纸元素，主体居中完整，纯白背景，不添加文字。`
  }
  if (draft.mode === 'style') {
    return `${base}。参考图由当前视频帧和手绘涂鸦组成，请保持原始构图，把画面统一转换为指定风格，人物主体自然清晰。`
  }
  return `${base}。将参考涂鸦生成适合叠加到动态视频上的独立前景元素，主体完整，纯白背景，不包含道路、天空或原视频背景，不添加文字。`
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
  return overlayWithNormalizedRange(
    {
      ...o,
      animatedDoodle: o.animatedDoodle
        ? {
            ...o.animatedDoodle,
            strokes: o.animatedDoodle.strokes.map((stroke) => ({
              ...stroke,
              points: stroke.points.map((point) => ({ ...point })),
            })),
          }
        : undefined,
    },
    PROJECT_DURATION,
  )
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
  const [searchParams] = useSearchParams()
  const { user } = useUser()
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
    if (
      (!hasStudioEditorProject() || clips.length === 0) &&
      !searchParams.get('collab')
    ) {
      navigate('/create', { replace: true })
    }
  }, [navigate, searchParams, clips.length])

  const {
    state: snapshot,
    push: pushHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetHistory,
  } = useUndoRedo<EditorSnapshot>(createInitialEditorSnapshot(initialProject))

  useEffect(() => {
    setEditorSession(snapshot)
  }, [snapshot])

  const collaborativeUserId = getCollaborativeUserId(user?.id)
  const collaborativeUserName = user?.nickname ?? '访客'

  const handleRemoteCollaborativeSnapshot = useCallback(
    (remote: EditorSnapshot) => {
      const duration = remote.videoDuration ?? projectDuration
      const next = normalizeSnapshot(remote, duration)
      resetHistory(next)
      if (next.videoClips?.length) {
        setClips(next.videoClips)
        setProjectDuration(duration)
        updateEditorProject({ clips: next.videoClips, duration })
      }
      setTitleDraft(next.title)
    },
    [projectDuration, resetHistory],
  )

  const collaboration = useCollaborativeEditor({
    snapshot,
    clips,
    userId: collaborativeUserId,
    userName: collaborativeUserName,
    onRemoteSnapshot: handleRemoteCollaborativeSnapshot,
  })

  const collabInviteAttemptedRef = useRef(false)
  const [collabClipsSyncing, setCollabClipsSyncing] = useState(false)
  const collabSyncToastShownRef = useRef(false)

  const [titleDraft, setTitleDraft] = useState(snapshot.title)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [activeFeature, setActiveFeature] = useState<string | null>(null)
  const [showVoiceClipPanel, setShowVoiceClipPanel] = useState(false)
  const [doodleGenerating, setDoodleGenerating] = useState(false)
  const [doodleFramePreview, setDoodleFramePreview] = useState<string | null>(null)
  const [doodleMode, setDoodleMode] = useState<MagicDoodleMode>('sticker')
  const [draftDoodleRange, setDraftDoodleRange] = useState(() =>
    createDefaultTimeRange(projectDuration),
  )
  const [doodleBrushSettings, setDoodleBrushSettings] = useState<DoodleBrushSettings>({
    color: '#f59e0b',
    size: 10,
    erasing: false,
  })
  const [draftDoodleStrokes, setDraftDoodleStrokes] = useState<DoodleStroke[]>([])
  const [doodleRecordingStartTime, setDoodleRecordingStartTime] = useState<number | null>(
    null,
  )
  const [activeTool, setActiveTool] = useState('cut')
  const [draftFilterId, setDraftFilterId] = useState(snapshot.filterId)
  const [draftIntensity, setDraftIntensity] = useState(snapshot.filterIntensity)
  const [draftEffectId, setDraftEffectId] = useState(snapshot.effectId ?? 'none')
  const [draftTransitionJoinIndex, setDraftTransitionJoinIndex] = useState(0)
  const [draftTransitionKind, setDraftTransitionKind] =
    useState<TransitionPresetId>('fade')
  const [draftTransitionDuration, setDraftTransitionDuration] = useState(
    DEFAULT_TRANSITION_DURATION,
  )
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
  const videoPreviewRef = useRef<VideoPreviewHandle>(null)
  const { message, show, visible } = useToast(2200)

  useEffect(() => {
    const code = searchParams.get('collab')
    if (!code || collabInviteAttemptedRef.current || collaboration.active) return
    collabInviteAttemptedRef.current = true
    collaboration.setSheetOpen(true)
    void collaboration.joinWithCode(code).catch((error) => {
      collabInviteAttemptedRef.current = false
      show(error instanceof Error ? error.message : '加入协作失败')
    })
  }, [collaboration, searchParams, show])
  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportMessage, setExportMessage] = useState('')
  const exportCancelledRef = useRef(false)
  const exportedRef = useRef(false)
  const leaveConfirmedRef = useRef(false)
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false)
  const [savingDraftOnExit, setSavingDraftOnExit] = useState(false)
  const editorPersistRef = useRef({
    clips,
    projectDuration,
    buildExportSnapshot: () => snapshot as EditorSnapshot,
  })
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
  const showDoodlePanel = activeFeature === 'doodle'
  const showNarrationPanel = activeFeature === 'narration'
  const showEffectPanel = activeTool === 'effect'
  const showTextPanel = activeTool === 'text'
  const showStickerPanel = activeTool === 'sticker'
  const showTransitionPanel = activeTool === 'transition'
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
    if (!showDoodlePanel || doodleMode === 'scene') {
      setDoodleFramePreview(null)
      return
    }
    let cancelled = false
    void videoPreviewRef.current
      ?.captureFrame({ width: 640, height: 360, includeFilter: true })
      .then((image) => {
        if (!cancelled) setDoodleFramePreview(image)
      })
      .catch(() => {
        if (!cancelled) setDoodleFramePreview(null)
      })
    return () => {
      cancelled = true
    }
  }, [showDoodlePanel, doodleMode, currentTime, previewFilterId, previewIntensity])

  const resetDoodleRecording = useCallback(() => {
    setDraftDoodleStrokes([])
    setDoodleRecordingStartTime(null)
  }, [])

  useEffect(() => {
    resetDoodleRecording()
    if (showDoodlePanel && doodleMode === 'scene') {
      setIsPlaying(false)
    }
  }, [doodleMode, resetDoodleRecording, setIsPlaying, showDoodlePanel])

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
      const nextDuration = patch.videoDuration ?? duration
      pushHistory(
        buildSnapshot(
          snapshot,
          {
            ...patch,
            videoClips: patch.videoClips ?? clips,
            videoDuration: nextDuration,
          },
          nextDuration,
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

  const clipsForPreview = useMemo(() => {
    if (!showTransitionPanel) return clips
    if (draftTransitionKind === 'none') {
      return clearTransitionAtJoinIndex(clips, draftTransitionJoinIndex)
    }
    const result = applyTransitionAtJoinIndex(
      clips,
      draftTransitionJoinIndex,
      draftTransitionKind,
      draftTransitionDuration,
    )
    return result?.clips ?? clips
  }, [
    clips,
    draftTransitionDuration,
    draftTransitionJoinIndex,
    draftTransitionKind,
    showTransitionPanel,
  ])

  const activeClip = useMemo(() => {
    if (!clipsForPreview.length) {
      return {
        id: 'placeholder',
        start: 0,
        duration: Math.max(projectDuration, 1),
        thumb: '',
        poster: '',
      } satisfies VideoClip
    }
    return getClipAtTime(currentTime, clipsForPreview, projectDuration)
  }, [currentTime, clipsForPreview, projectDuration])

  previewVideoClockRef.current =
    Boolean(activeClip.videoSrc) && isPlaying

  const lastPreviewSyncMsRef = useRef(0)
  const transitionPreviewActiveRef = useRef(false)
  const handlePreviewTimelineSync = useCallback(
    (time: number) => {
      if (time >= projectDuration) {
        setIsPlaying(false)
        syncTime(projectDuration)
        return
      }
      const now = performance.now()
      const minGap = transitionPreviewActiveRef.current ? 16 : 40
      if (now - lastPreviewSyncMsRef.current < minGap) return
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

  const transitionPreviewFrame = useMemo(
    () => resolveTransitionPreview(clipsForPreview, activeClip, currentTime),
    [clipsForPreview, activeClip, currentTime],
  )

  const previewMediaOpacity =
    transitionPreviewFrame?.overOpacity ??
    resolveTransitionOpacityAtTime(clipsForPreview, currentTime)
  const previewMediaClipPath = transitionPreviewFrame?.overClipPath
  transitionPreviewActiveRef.current = Boolean(transitionPreviewFrame)

  const toolPanelPreviewSrc = useMemo(
    () =>
      getClipPreviewSrc(
        !activeClip.id || activeClip.id === 'placeholder' ? null : activeClip,
      ),
    [activeClip],
  )

  const transitionPanelScenes = useMemo(() => {
    const outClip = clips[draftTransitionJoinIndex]
    const inClip = clips[draftTransitionJoinIndex + 1]
    return {
      sceneOutSrc: getClipPreviewSrc(outClip, toolPanelPreviewSrc),
      sceneInSrc: getClipPreviewSrc(inClip, toolPanelPreviewSrc),
    }
  }, [clips, draftTransitionJoinIndex, toolPanelPreviewSrc])

  const clipJoinPoints = useMemo(
    () => listClipJoinPoints(showTransitionPanel ? clipsForPreview : clips),
    [clips, clipsForPreview, showTransitionPanel],
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
    (
      nextClips: VideoClip[],
      duration: number,
      extraPatch?: Partial<EditorSnapshot>,
    ) => {
      if (!nextClips.length) {
        show('操作后没有剩余视频片段，已取消')
        return false
      }
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
          ...extraPatch,
        },
        duration,
      )
      if (currentTime > duration) seek(duration)
      return true
    },
    [
      currentTime,
      seek,
      pushEditorHistory,
      projectDuration,
      snapshot.originalAudioRange,
      show,
    ],
  )

  useEffect(() => {
    const roomId = collaboration.room?.roomId
    if (
      !collaboration.active ||
      !collaboration.isOwner ||
      !roomId ||
      countPendingCollabUploads(clips) === 0
    ) {
      return
    }

    let cancelled = false
    setCollabClipsSyncing(true)
    void (async () => {
      try {
        const synced = await syncCollabClipsToCloud(roomId, clips)
        if (cancelled) return
        const uploaded = synced.filter(
          (clip, index) => clip.cloudVideoSrc && !clips[index]?.cloudVideoSrc,
        ).length
        if (uploaded > 0) {
          applyClipsUpdate(synced, projectDuration)
          if (!collabSyncToastShownRef.current) {
            collabSyncToastShownRef.current = true
            show(editorToasts.collabVideoSynced(uploaded))
          }
        }
      } catch {
        if (!cancelled) show(editorToasts.collabVideoSyncFailed)
      } finally {
        if (!cancelled) setCollabClipsSyncing(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [
    clips,
    collaboration.active,
    collaboration.isOwner,
    collaboration.room?.roomId,
    projectDuration,
    applyClipsUpdate,
    show,
  ])

  const handleImportClick = useCallback(() => {
    if (importingVideos) return
    try {
      assertAlbumAccessAllowed()
      importInputRef.current?.click()
    } catch (error) {
      show(error instanceof Error ? error.message : '无法访问相册')
    }
  }, [importingVideos, show])

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
        const missingLocal = clips.some((clip) => !clip.videoSrc)

        if (missingLocal) {
          const { clips: nextClips, duration, attachedCount, extraCount } =
            attachLocalVideosToClips(clips, imported)
          applyClipsUpdate(nextClips, duration)
          if (attachedCount > 0 && extraCount === 0) {
            show(editorToasts.collabVideoAttached(attachedCount))
          } else if (attachedCount > 0) {
            show(
              `已绑定 ${attachedCount} 个片段${extraCount > 0 ? `，并追加 ${extraCount} 个新片段` : ''}`,
            )
          } else {
            show(editorToasts.importSuccess(imported.length))
          }
        } else {
          const { clips: nextClips, duration } = appendClipsFromImports(clips, imported)
          applyClipsUpdate(nextClips, duration)
          show(editorToasts.importSuccess(imported.length))
        }
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

  const resolveVoiceTargetClipId = useCallback(
    (clipList: VideoClip[]) => {
      if (
        selectedVideoClipId &&
        clipList.some((clip) => clip.id === selectedVideoClipId)
      ) {
        return selectedVideoClipId
      }
      const atPlayhead = getClipAtTime(currentTime, clipList, projectDuration)
      return atPlayhead?.id ?? clipList[0]?.id ?? null
    },
    [selectedVideoClipId, currentTime, projectDuration],
  )

  const clampVoiceTimelineRange = useCallback(
    (start: number, end: number, duration: number) => {
      const minSpan = 0.35
      const s = Math.max(0, Math.min(start, duration - minSpan))
      const e = Math.max(s + minSpan, Math.min(end, duration))
      if (e <= s) return null
      return { start: s, end: e }
    },
    [],
  )

  const handleApplyVoiceCommands = useCallback(
    async (commandsToApply: VoiceCommandItem[]) => {
      try {
      const editableTypes = new Set([
        'speed',
        'delete',
        'keepRange',
        'rotate',
        'mirror',
        'bgm',
        'transition',
        'split',
        'filter',
        'effect',
        'seek',
        'muteOriginal',
        'unmuteOriginal',
        'crop',
        'narration',
        'openAudio',
      ])
      const editable = commandsToApply.filter((item) =>
        editableTypes.has(item.command),
      )
      if (!editable.length) {
        show('没有可应用的剪辑指令，请先确认识别出的剪辑建议')
        return
      }

      const bgmItems = editable.filter((item) => item.command === 'bgm')
      const snapshotItems = editable.filter((item) =>
        ['filter', 'effect', 'muteOriginal', 'unmuteOriginal'].includes(
          item.command,
        ),
      )
      const uiItems = editable.filter((item) =>
        ['seek', 'crop', 'narration', 'openAudio'].includes(item.command),
      )
      const clipCommandOrder: Record<string, number> = {
        delete: 0,
        keepRange: 1,
        split: 2,
        speed: 3,
        rotate: 4,
        mirror: 5,
        transition: 6,
      }
      const clipItems = editable
        .filter(
          (item) =>
            item.command !== 'bgm' &&
            !['filter', 'effect', 'muteOriginal', 'unmuteOriginal'].includes(
              item.command,
            ) &&
            !['seek', 'crop', 'narration', 'openAudio'].includes(item.command),
        )
        .sort(
          (a, b) =>
            (clipCommandOrder[a.command] ?? 99) -
            (clipCommandOrder[b.command] ?? 99),
        )

      let nextClips = clips
      let nextDuration = projectDuration
      const appliedLabels: string[] = []

      for (const item of clipItems) {
        if (item.command === 'speed') {
          const targetId = resolveVoiceTargetClipId(nextClips)
          if (!targetId) {
            continue
          }
          const result = setClipPlaybackRate(
            nextClips,
            targetId,
            item.payload?.rate ?? 1.5,
          )
          nextClips = result.clips
          nextDuration = result.duration
          appliedLabels.push(`${item.payload?.rate ?? 1.5} 倍速`)
          continue
        }

        if (item.command === 'delete') {
          const start = item.payload?.start
          const end = item.payload?.end
          if (
            typeof start === 'number' &&
            typeof end === 'number' &&
            end > start
          ) {
            const range = clampVoiceTimelineRange(start, end, nextDuration)
            if (!range) {
              continue
            }
            const result = deleteClipRange(
              nextClips,
              range.start,
              range.end,
            )
            if (!result) {
              show(
                `无法删除 ${range.start}–${range.end} 秒：成片约 ${Math.round(nextDuration)} 秒；若刚在切点加了转场，请先说删除再说转场，或把范围略缩到切点内侧（如 3–4.9 秒）`,
              )
              continue
            }
            nextClips = result.clips
            nextDuration = result.duration
            appliedLabels.push(`删除 ${range.start}–${range.end} 秒`)
          } else {
            const targetId = resolveVoiceTargetClipId(nextClips)
            const result = targetId
              ? deleteClipById(nextClips, targetId)
              : deleteClipAt(nextClips, currentTime)
            if (!result) {
              show(editorToasts.deleteNeedOne)
              continue
            }
            nextClips = result.clips
            nextDuration = result.duration
            appliedLabels.push('删除当前片段')
          }
          continue
        }

        if (item.command === 'keepRange') {
          const start = item.payload?.start ?? currentTime
          const end =
            item.payload?.end ?? Math.min(nextDuration, start + 5)
          const range = clampVoiceTimelineRange(start, end, nextDuration)
          if (!range) {
            show('保留时间段无效')
            continue
          }
          const result = keepClipRange(
            nextClips,
            range.start,
            range.end,
          )
          if (!result) {
            show('无法保留该时间段，请换更靠中间的起止秒数')
            continue
          }
          nextClips = result.clips
          nextDuration = result.duration
          appliedLabels.push(`保留 ${range.start}–${range.end} 秒`)
          continue
        }

        if (item.command === 'rotate') {
          const targetId = resolveVoiceTargetClipId(nextClips)
          if (!targetId) {
            continue
          }
          let delta = item.payload?.rotationDelta
          if (delta == null && item.payload?.rotationSteps != null) {
            const steps = item.payload.rotationSteps
            delta = steps === 3 ? -90 : 90
          }
          nextClips = rotateClipByDelta(nextClips, targetId, delta ?? 90)
          appliedLabels.push(item.label || '旋转片段')
          continue
        }

        if (item.command === 'mirror') {
          const targetId = resolveVoiceTargetClipId(nextClips)
          if (!targetId) {
            continue
          }
          nextClips = toggleClipMirror(nextClips, targetId)
          appliedLabels.push('镜像')
          continue
        }

        if (item.command === 'transition') {
          const outcome = applyVoiceTransition(nextClips, {
            joinIndex: item.payload?.joinIndex,
            joinTime: item.payload?.time,
            transitionKind: item.payload?.transitionKind,
            transitionDuration: item.payload?.transitionDuration,
          })
          if (!outcome.ok) {
            show(voiceTransitionErrorMessage(outcome))
            continue
          }
          nextClips = outcome.clips
          appliedLabels.push(outcome.appliedLabel)
          continue
        }

        if (item.command === 'split') {
          const at =
            item.payload?.time != null
              ? Math.max(0, Math.min(item.payload.time, nextDuration - 0.01))
              : currentTime
          const result = splitClipAt(nextClips, at)
          if (!result) {
            show(`无法在第 ${Math.round(at)} 秒分割，切点太靠近片段头尾`)
            continue
          }
          nextClips = result.clips
          nextDuration = result.duration
          appliedLabels.push(`在第 ${Math.round(at)} 秒分割`)
          continue
        }
      }

      const snapshotPatch: Partial<EditorSnapshot> = {}
      for (const item of snapshotItems) {
        if (item.command === 'filter' && item.payload?.filterId) {
          const id = item.payload.filterId
          setDraftFilterId(id)
          setDraftIntensity(100)
          snapshotPatch.filterId = id
          snapshotPatch.filterIntensity = 100
          const name =
            FILTER_PRESETS.find((f) => f.id === id)?.name ?? id
          appliedLabels.push(id === 'none' ? '关闭滤镜' : `滤镜 ${name}`)
        }
        if (item.command === 'effect' && item.payload?.effectId) {
          const id = item.payload.effectId
          setDraftEffectId(id)
          snapshotPatch.effectId = id
          const name =
            EFFECT_PRESETS.find((e) => e.id === id)?.name ?? id
          appliedLabels.push(id === 'none' ? '关闭特效' : `特效 ${name}`)
        }
        if (item.command === 'muteOriginal') {
          setDraftKeepOriginalAudio(false)
          snapshotPatch.keepOriginalAudio = false
          appliedLabels.push('已关闭原声')
        }
        if (item.command === 'unmuteOriginal') {
          setDraftKeepOriginalAudio(true)
          snapshotPatch.keepOriginalAudio = true
          appliedLabels.push('已保留原声')
        }
      }

      const hasSnapshotPatch = Object.keys(snapshotPatch).length > 0

      if (clipItems.length) {
        if (!nextClips.length) {
          show('操作后没有剩余视频片段，已取消')
          return
        }
        const ok = applyClipsUpdate(
          nextClips,
          nextDuration,
          hasSnapshotPatch ? snapshotPatch : undefined,
        )
        if (!ok) return
        const safeTime = Math.min(currentTime, Math.max(0, nextDuration - 0.001))
        const active = getClipAtTime(safeTime, nextClips, nextDuration)
        setSelectedVideoClipId(active?.id ?? nextClips[0]?.id ?? null)
        setIsPlaying(false)
        seek(safeTime)
      } else if (hasSnapshotPatch) {
        pushEditorHistory({
          ...snapshotPatch,
          videoClips: nextClips,
          videoDuration: nextDuration,
        })
      }

      for (const item of uiItems) {
        if (item.command === 'seek' && item.payload?.time != null) {
          const t = Math.max(
            0,
            Math.min(item.payload.time, projectDuration - 0.001),
          )
          setIsPlaying(false)
          seek(t)
          appliedLabels.push(`定位到 ${Math.round(t)} 秒`)
        }
        if (item.command === 'crop') {
          const targetId = resolveVoiceTargetClipId(nextClips)
          if (targetId) {
            setSelectedVideoClipId(targetId)
            setCropClipId(targetId)
            setIsCropMode(true)
            appliedLabels.push('进入裁剪')
          } else {
          }
        }
        if (item.command === 'narration') {
          const text = item.payload?.text?.trim()
          if (text && text.length > 2) {
            setDraftNarrationText(text)
          }
          setActiveFeature('narration')
          setShowVoiceClipPanel(false)
          appliedLabels.push('已打开旁白面板')
        }
        if (item.command === 'openAudio') {
          setShowVoiceClipPanel(false)
          setActiveFeature('music')
          setDraftKeepOriginalAudio(appliedKeepOriginalAudio)
          setDraftBgmId(appliedBgmId)
          setDraftOriginalAudioRange(appliedOriginalAudioRange)
          setDraftBgmRange(appliedBgmRange)
          setActiveTool('audio')
          appliedLabels.push('已打开音频面板')
        }
      }

      if (bgmItems.length) {
        const desc =
          bgmItems[0].payload?.text?.trim() ||
          '轻松愉快、适合 vlog 的背景音乐'
        setShowVoiceClipPanel(false)
        setActiveFeature('music')
        setDraftKeepOriginalAudio(appliedKeepOriginalAudio)
        setDraftBgmId(appliedBgmId)
        setDraftOriginalAudioRange(appliedOriginalAudioRange)
        setDraftBgmRange(appliedBgmRange)
        setActiveTool('audio')
        show('正在智能配乐…')
        try {
          const outcome = await recommendBgmFromDescription(desc)
          if (!outcome.picked) {
            show('未找到合适配乐，请在音频面板手动选曲')
            return
          }
          const fullRange = createDefaultTimeRange(projectDuration)
          const nextBgmId = outcome.picked.audio.id
          setDraftBgmId(nextBgmId)
          setDraftBgmRange(fullRange)
          pushEditorHistory({
            bgmId: nextBgmId,
            bgmRange: fullRange,
            videoClips: nextClips,
            videoDuration: nextDuration,
          })
          const tag =
            outcome.source === 'ai' ? 'AI 推荐' : '本地推荐'
          appliedLabels.push(`配乐·${outcome.picked.audio.name}（${tag}）`)
        } catch {
          show('配乐失败，请点「智能配乐」或底部「音频」手动选择')
        }
      } else {
        setShowVoiceClipPanel(false)
      }

      if (appliedLabels.length) {
        show(`已应用：${appliedLabels.join('、')}`)
      }
      } catch (error) {
        console.error('[voice-apply]', error)
        show(
          error instanceof Error
            ? `语音指令应用失败：${error.message}`
            : '语音指令应用失败，请刷新页面后重试',
        )
      }
    },
    [
      clips,
      currentTime,
      projectDuration,
      applyClipsUpdate,
      show,
      getClipAtTime,
      seek,
      setIsPlaying,
      resolveVoiceTargetClipId,
      clampVoiceTimelineRange,
      appliedKeepOriginalAudio,
      appliedBgmId,
      appliedOriginalAudioRange,
      appliedBgmRange,
      pushEditorHistory,
      setDraftFilterId,
      setDraftEffectId,
      setDraftIntensity,
      setDraftKeepOriginalAudio,
      setDraftNarrationText,
      setActiveFeature,
      setActiveTool,
      setCropClipId,
      setIsCropMode,
      setSelectedVideoClipId,
      setShowVoiceClipPanel,
    ],
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

  const applyTransitionDraftToClips = useCallback(
    (joinIndex: number, kind: TransitionPresetId, duration: number) => {
      let nextClips = clips
      if (kind === 'none') {
        nextClips = clearTransitionAtJoinIndex(clips, joinIndex)
      } else {
        const result = applyTransitionAtJoinIndex(clips, joinIndex, kind, duration)
        if (!result) return null
        nextClips = result.clips
      }
      return nextClips
    },
    [clips],
  )

  const openTransitionPanel = useCallback(() => {
    if (clips.length < 2) {
      show(editorToasts.transitionNeedClips)
      return
    }
    const joinIndex = Math.max(0, findJoinIndexNearTime(clips, currentTime))
    const join = listClipJoinPoints(clips).find((j) => j.joinIndex === joinIndex)
    setDraftTransitionJoinIndex(joinIndex)
    setDraftTransitionKind(join?.transition?.kind ?? 'none')
    setDraftTransitionDuration(
      join?.transition?.duration ?? DEFAULT_TRANSITION_DURATION,
    )
    setActiveTool('transition')
  }, [clips, currentTime, show])

  const cancelTransitionPanel = useCallback(() => {
    closeAllPanels()
  }, [])

  const confirmTransitionPanel = useCallback(() => {
    const join = listClipJoinPoints(clips).find(
      (j) => j.joinIndex === draftTransitionJoinIndex,
    )
    const nextClips = applyTransitionDraftToClips(
      draftTransitionJoinIndex,
      draftTransitionKind,
      draftTransitionDuration,
    )
    if (!nextClips) {
      show('无法在该衔接处设置转场')
      return
    }
    setClips(nextClips)
    updateEditorProject({ clips: nextClips, duration: projectDuration })
    pushEditorHistory({
      videoClips: nextClips,
      videoDuration: projectDuration,
    })
    closeAllPanels()
    if (draftTransitionKind === 'none') {
      show(editorToasts.transitionOff)
    } else if (join) {
      show(
        editorToasts.transitionOn(
          join.label,
          transitionKindLabel(draftTransitionKind),
          draftTransitionDuration,
        ),
      )
    }
  }, [
    applyTransitionDraftToClips,
    clips,
    draftTransitionDuration,
    draftTransitionJoinIndex,
    draftTransitionKind,
    projectDuration,
    pushEditorHistory,
    show,
  ])

  const handleTransitionJoinSelect = useCallback(
    (joinIndex: number, joinTime: number) => {
      const join = listClipJoinPoints(clips).find((j) => j.joinIndex === joinIndex)
      setDraftTransitionJoinIndex(joinIndex)
      setDraftTransitionKind(join?.transition?.kind ?? 'none')
      setDraftTransitionDuration(
        join?.transition?.duration ?? DEFAULT_TRANSITION_DURATION,
      )
      const duration = join?.transition?.duration ?? DEFAULT_TRANSITION_DURATION
      const previewAt = Math.max(
        0,
        Math.min(joinTime - duration * 0.5, projectDuration - 0.05),
      )
      seek(previewAt)
      setIsPlaying(false)
    },
    [clips, projectDuration, seek, setIsPlaying],
  )

  const handleTransitionKindSelect = useCallback((kind: TransitionPresetId) => {
    setDraftTransitionKind(kind)
  }, [])

  const handleTransitionDurationChange = useCallback((duration: number) => {
    setDraftTransitionDuration(duration)
  }, [])

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
          previewSourceAspect,
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

  const handleDoodleGenerate = useCallback(
    async (draft: MagicDoodleDraft) => {
      if (draft.mode === 'scene') return
      if (doodleGenerating) return
      try {
        assertAiVisionAllowed()
      } catch (error) {
        show(error instanceof Error ? error.message : 'AI 识图未授权')
        return
      }
      setDoodleGenerating(true)
      try {
        setIsPlaying(false)

        const frameImage =
          draft.mode === 'style'
            ? await videoPreviewRef.current?.captureFrame({
                width: 1280,
                height: 720,
                includeFilter: true,
              })
            : undefined
        let image: string | undefined

        if (draft.mode === 'style' && frameImage && draft.doodleImage) {
          image = await composeFrameAndDoodle(frameImage, draft.doodleImage)
        } else if (draft.mode === 'style') {
          image = frameImage
        } else {
          image = draft.doodleImage ?? undefined
        }

        const result = await generateDoodleImage({
          prompt: buildDoodlePrompt(draft),
          image,
          size: draft.size,
        })

        const fullFrame = draft.mode === 'style'
        let imageUrl = result.imageUrl
        let placement = DEFAULT_DOODLE_PLACEMENT
        if (draft.mode === 'sticker') {
          placement = await resolveDoodlePlacement(draft.doodleImage, previewSourceAspect)
          const foreground = await isolateFlatBackground(result.imageUrl).catch(() => null)
          if (foreground) {
            imageUrl = await storeDoodleAsset(foreground).catch(() => result.imageUrl)
          }
        }
        const overlay: StickerOverlay = {
          id: createStickerId(),
          stickerId: fullFrame ? 'magic-doodle-style' : 'magic-doodle-sticker',
          imageUrl,
          imageFit: fullFrame ? 'cover' : 'contain',
          name: fullFrame ? '魔法风格' : '魔法贴纸',
          x: fullFrame ? 50 : placement.x,
          y: fullFrame ? 50 : placement.y,
          width: fullFrame ? 100 : placement.width,
          height: fullFrame ? 100 : placement.height,
          rotation: 0,
          startTime: draft.range.startTime,
          endTime: draft.range.endTime,
        }

        pushEditorHistory({
          stickerOverlays: [...syncStickersFromLive(), overlay],
        })
        setDraftSticker(null)
        closeAllPanels()
        setActiveFeature(null)
        selectSticker(overlay)
        show(result.storeWarning ? '魔法涂鸦已生成，远程图临时使用' : '魔法涂鸦已生成')
      } catch (error) {
        const detail = error instanceof Error ? error.message : '请稍后重试'
        show(`魔法涂鸦失败：${detail}`)
      } finally {
        setDoodleGenerating(false)
      }
    },
    [
      closeAllPanels,
      doodleGenerating,
      previewSourceAspect,
      pushEditorHistory,
      selectSticker,
      setIsPlaying,
      show,
      syncStickersFromLive,
    ],
  )

  const handleDoodleRecordingStart = useCallback(() => {
    const start = currentTime >= projectDuration - 0.1 ? 0 : currentTime
    if (start !== currentTime) seek(start)
    setDoodleRecordingStartTime((existing) => existing ?? start)
    setIsPlaying(true)
    return doodleRecordingStartTime ?? start
  }, [
    currentTime,
    doodleRecordingStartTime,
    projectDuration,
    seek,
    setIsPlaying,
  ])

  const handleConfirmRecordedDoodle = useCallback(() => {
    if (!draftDoodleStrokes.length || doodleRecordingStartTime == null) return
    setIsPlaying(false)

    const timelineStart = Math.floor(doodleRecordingStartTime)
    const recordingOffset = doodleRecordingStartTime - timelineStart
    const strokes = draftDoodleStrokes.map((stroke) => ({
      ...stroke,
      points: stroke.points.map((point) => ({
        ...point,
        at: point.at + recordingOffset,
      })),
    }))
    const drawDuration = strokes.reduce(
      (latest, stroke) =>
        Math.max(latest, ...stroke.points.map((point) => point.at)),
      0,
    )
    const holdDuration = 0.6
    const fadeDuration = 0.45
    const endTime = Math.min(
      Math.floor(projectDuration),
      Math.max(timelineStart + 1, Math.ceil(timelineStart + drawDuration + holdDuration + fadeDuration)),
    )
    const overlay: StickerOverlay = {
      id: createStickerId(),
      stickerId: 'magic-doodle-drawing',
      name: '动态涂鸦',
      animatedDoodle: {
        strokes,
        drawDuration,
        holdDuration,
        fadeDuration,
      },
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      rotation: 0,
      startTime: timelineStart,
      endTime,
    }

    pushEditorHistory({
      stickerOverlays: [...syncStickersFromLive(), overlay],
    })
    resetDoodleRecording()
    closeAllPanels()
    setActiveFeature(null)
    seek(timelineStart)
    setIsPlaying(true)
    show('动态涂鸦已添加，播放后自动淡出')
  }, [
    closeAllPanels,
    doodleRecordingStartTime,
    draftDoodleStrokes,
    projectDuration,
    pushEditorHistory,
    resetDoodleRecording,
    seek,
    setIsPlaying,
    show,
    syncStickersFromLive,
  ])

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
      setShowVoiceClipPanel(false)
      return
    }
    if (id === 'narration') {
      setShowVoiceClipPanel(false)
      openNarrationPanel()
      return
    }
    if (id === 'doodle') {
      setShowVoiceClipPanel(false)
      if (activeFeature !== 'doodle') {
        setIsPlaying(false)
        setDraftDoodleRange(
          createDefaultTimeRangeFromPlayhead(projectDuration, currentTime),
        )
      }
      setDoodleMode('sticker')
      resetDoodleRecording()
      setActiveFeature((prev) => (prev === 'doodle' ? null : 'doodle'))
      closeAllPanels()
      return
    }
    if (id === 'voice') {
      setActiveFeature(null)
      setShowVoiceClipPanel((prev) => !prev)
      return
    }
    setShowVoiceClipPanel(false)
    setActiveFeature(id)
    show(editorToasts.featureDev(label))
  }

  const handleToolSelect = (id: string, _label: string) => {
    if (showDoodlePanel) setActiveFeature(null)
    if (activeTool === 'transition' && id !== 'transition') {
      cancelTransitionPanel()
    }
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
    if (id === 'transition') {
      if (activeTool === 'transition') cancelTransitionPanel()
      else openTransitionPanel()
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

  const handleApplyStylePreset = (preset: { filter: string; effect: string; title: string }) => {
    setDraftFilterId((FILTER_PRESETS.find((f) => f.name === preset.filter)?.id ?? 'none') as string)
    setDraftEffectId((EFFECT_PRESETS.find((e) => e.name === preset.effect)?.id ?? 'none') as string)
    setDraftIntensity(100)
    pushEditorHistory({
      filterId: FILTER_PRESETS.find((f) => f.name === preset.filter)?.id ?? 'none',
      filterIntensity: 100,
      effectId: EFFECT_PRESETS.find((e) => e.name === preset.effect)?.id ?? 'none',
    })
    show(`已应用风格：${preset.title} · 滤镜 ${preset.filter}，特效 ${preset.effect}`)
    closeAllPanels()
  }

  const handleApplyTextSuggestion = (suggestion: { title: string; caption: string }) => {
    const range = createDefaultTimeRangeFromPlayhead(projectDuration, currentTime)
    const base = createDefaultTextOverlay(projectDuration, range.startTime, appliedTexts.length)
    const titleText = cloneOverlay({
      ...base,
      content: suggestion.title,
      fontId: 'bold',
      color: '#FFFFFF',
      backgroundColor: '#000000',
      backgroundOpacity: 58,
      width: Math.max(base.width, 84),
      height: Math.max(base.height, 20),
      x: 50,
      y: 16,
      startTime: range.startTime,
      endTime: range.endTime,
    })
    const captionBase = createDefaultTextOverlay(projectDuration, range.startTime, appliedTexts.length + 1)
    const captionText = cloneOverlay({
      ...captionBase,
      content: suggestion.caption,
      fontId: 'serif',
      color: '#FFFFFF',
      backgroundColor: '#000000',
      backgroundOpacity: 38,
      width: Math.max(captionBase.width, 36),
      height: Math.max(captionBase.height, 10),
      x: 82,
      y: 82,
      startTime: range.startTime,
      endTime: range.endTime,
    })
    pushEditorHistory({ textOverlays: [...syncTextsFromLive(), titleText, captionText] })
    setDraftText(cloneOverlay(titleText))
    setSelectedTextId(titleText.id)
    setLiveText(cloneOverlay(titleText))
    show(`已添加文字：${suggestion.title}`)
    closeAllPanels()
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
      const name = draftSticker.name ?? getStickerPreset(draftSticker.stickerId)?.name ?? '贴纸'
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

  useEffect(() => {
    editorPersistRef.current = {
      clips,
      projectDuration,
      buildExportSnapshot,
    }
  }, [clips, projectDuration, buildExportSnapshot])

  const saveDraftNow = useCallback(async (): Promise<boolean> => {
    if (exportedRef.current) return false
    const { clips: currentClips, projectDuration: dur, buildExportSnapshot: build } =
      editorPersistRef.current
    if (!hasMeaningfulDraftContent(currentClips)) return false

    const exportSnapshot = build()
    await saveEditorDraft({
      snapshot: {
        ...exportSnapshot,
        videoClips: currentClips,
        videoDuration: dur,
      },
      clips: currentClips,
      duration: dur,
      draftId: getActiveDraftId(),
    })
    return true
  }, [])

  const persistDraftIfNeeded = useCallback(() => {
    if (leaveConfirmedRef.current) return
    void saveDraftNow()
  }, [saveDraftNow])

  useEffect(() => {
    const onPageHide = () => persistDraftIfNeeded()
    window.addEventListener('pagehide', onPageHide)
    return () => {
      window.removeEventListener('pagehide', onPageHide)
      persistDraftIfNeeded()
    }
  }, [persistDraftIfNeeded])

  const handleLeaveEditor = useCallback(() => {
    if (exporting) return
    const { clips: currentClips } = editorPersistRef.current
    if (hasMeaningfulDraftContent(currentClips)) {
      setExitConfirmOpen(true)
      return
    }
    navigate('/')
  }, [exporting, navigate])

  const handleConfirmExit = useCallback(async () => {
    setSavingDraftOnExit(true)
    try {
      const saved = await saveDraftNow()
      leaveConfirmedRef.current = true
      setExitConfirmOpen(false)
      if (saved) {
        show('已保存到草稿')
        await new Promise((resolve) => window.setTimeout(resolve, 2200))
      }
      navigate('/')
    } finally {
      setSavingDraftOnExit(false)
    }
  }, [navigate, saveDraftNow, show])

  const handleExport = useCallback(async () => {
    if (!hasStudioEditorProject()) {
      show(editorToasts.exportNeedProject)
      navigate('/create')
      return
    }

    const hasLocalVideo = clips.some((clip) => clipHasPlayableVideo(clip))
    if (!hasLocalVideo) {
      if (collaboration.active && collabClipsSyncing && collaboration.isOwner) {
        show(editorToasts.exportNeedLocalCollabOwner)
        return
      }
      show(
        collaboration.active
          ? editorToasts.exportNeedLocalCollab
          : editorToasts.exportNeedLocal,
      )
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
      let savedToGarden = false
      try {
        await addExportedVlogToGarden(result)
        savedToGarden = true
      } catch {
        /* 成片已导出，花园入库失败不阻断完成页 */
      }
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
        sessionStorage.setItem(LAST_COMPLETE_FLOW_KEY, 'studio')
      } catch {
        /* ignore quota */
      }
      exportedRef.current = true
      await deleteActiveEditorDraft()
      show(
        savedToGarden
          ? editorToasts.exportDone
          : '导出完成，但未能写入记忆花园',
      )
      navigate('/complete', { state: { flow: 'studio', savedToGarden } })
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
    collaboration.active,
    collabClipsSyncing,
    collaboration.isOwner,
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
        collaborativeActive={collaboration.active}
        collaborativeEnabled={collaboration.enabled}
        onBack={handleLeaveEditor}
        exporting={exporting}
        onExport={handleExport}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onTitleChange={setTitleDraft}
        onToggleEditTitle={handleToggleEditTitle}
        onOpenCollaboration={() => collaboration.setSheetOpen(true)}
      />

      {collaboration.active && !exporting && (
        <>
          {collaboration.isOwner && collabClipsSyncing && (
            <div className="mx-4 mb-2 rounded-[var(--radius-lg)] border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs leading-relaxed text-primary">
              {editorToasts.collabVideoSyncing}
            </div>
          )}
          {!collaboration.isOwner &&
            !clips.some((clip) => clipHasPlayableVideo(clip)) && (
              <div className="mx-4 mb-2 rounded-[var(--radius-lg)] border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-900">
                正在等待创建者同步视频片段，同步完成后即可预览与导出。
              </div>
            )}
        </>
      )}

      <div
        data-editor-page=""
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
      <VideoPreview
        ref={videoPreviewRef}
        poster={activeClip.poster}
        videoSrc={activeClip.videoSrc}
        clipTransform={previewClipTransform}
        clipTime={clipTime}
        clipTimelineStart={activeClip.start}
        clipSourceOffset={activeClip.sourceOffset ?? 0}
        playbackRate={activePlaybackRate}
        mediaOpacity={previewMediaOpacity}
        mediaClipPath={previewMediaClipPath}
        transitionUnderlay={transitionPreviewFrame?.underlay ?? null}
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
        doodleRecording={
          showDoodlePanel && doodleMode === 'scene'
            ? {
                strokes: draftDoodleStrokes,
                settings: doodleBrushSettings,
                startTime: doodleRecordingStartTime,
                onStart: handleDoodleRecordingStart,
                onChange: setDraftDoodleStrokes,
              }
            : null
        }
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
            previewSrc={toolPanelPreviewSrc}
            filterCss={getFilterCss(previewFilterId)}
            onSelect={setDraftEffectId}
            onConfirm={confirmEffectPanel}
            onClose={cancelEffectPanel}
          />
        )}

        {showTransitionPanel && clipJoinPoints.length > 0 && (
          <TransitionPanel
            joins={clipJoinPoints}
            selectedJoinIndex={draftTransitionJoinIndex}
            selectedKind={draftTransitionKind}
            duration={draftTransitionDuration}
            sceneOutSrc={transitionPanelScenes.sceneOutSrc}
            sceneInSrc={transitionPanelScenes.sceneInSrc}
            onJoinSelect={handleTransitionJoinSelect}
            onKindSelect={handleTransitionKindSelect}
            onDurationChange={handleTransitionDurationChange}
            onConfirm={confirmTransitionPanel}
            onClose={cancelTransitionPanel}
          />
        )}

        {showFilterPanel && (
          <FilterPanel
            filters={FILTER_PRESETS}
            selectedId={draftFilterId}
            intensity={draftIntensity}
            previewSrc={toolPanelPreviewSrc}
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

        {showVoiceClipPanel && (
          <VoiceClipPanel
            busy={false}
            onApplyCommands={handleApplyVoiceCommands}
            onApplyStylePreset={handleApplyStylePreset}
            onApplyTextSuggestion={handleApplyTextSuggestion}
            textApiEndpoint="/api/voice/text-suggestion"
            onConfirm={() => {
              setShowVoiceClipPanel(false)
            }}
            onClose={() => setShowVoiceClipPanel(false)}
          />
        )}

        {showDoodlePanel && (
          <MagicDoodlePanel
            busy={doodleGenerating}
            backgroundImage={doodleFramePreview}
            brushSettings={doodleBrushSettings}
            hasRecordedDoodle={draftDoodleStrokes.length > 0}
            range={draftDoodleRange}
            videoDuration={projectDuration}
            onGenerate={handleDoodleGenerate}
            onModeChange={setDoodleMode}
            onBrushSettingsChange={setDoodleBrushSettings}
            onRangeChange={setDraftDoodleRange}
            onClearRecordedDoodle={resetDoodleRecording}
            onConfirmRecordedDoodle={handleConfirmRecordedDoodle}
            onClose={() => {
              resetDoodleRecording()
              setActiveFeature(null)
            }}
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

      <CollaborativeEditingSheet
        open={collaboration.sheetOpen}
        onClose={() => collaboration.setSheetOpen(false)}
        isOwner={collaboration.isOwner}
        active={collaboration.active}
        enabled={collaboration.enabled}
        inviteCode={collaboration.room?.inviteCode ?? null}
        joinUrl={
          collaboration.room?.inviteCode
            ? collaboration.buildJoinUrl(collaboration.room.inviteCode)
            : null
        }
        presence={collaboration.presence}
        connectionState={collaboration.connectionState}
        error={collaboration.error}
        onEnable={async () => {
          await collaboration.enableCollaboration()
          show('共同编辑已开启')
        }}
        onToggleEnabled={collaboration.setCollaborationEnabled}
        onJoin={async (code) => {
          await collaboration.joinWithCode(code)
          show('已加入共同编辑')
        }}
        onLeave={collaboration.leaveCollaboration}
        onCloseRoom={async () => {
          await collaboration.closeCollaboration()
          show('共同编辑已结束')
        }}
      />

      {exitConfirmOpen ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="editor-exit-title"
        >
          <div className="w-full max-w-sm rounded-[var(--radius-2xl)] bg-surface p-5 shadow-[var(--shadow-card)]">
            <h3 id="editor-exit-title" className="text-base font-semibold text-text">
              确定要退出编辑吗？
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              当前项目尚未导出。退出后将自动保存到草稿，可稍后在「我的 → 草稿」中继续编辑。
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                disabled={savingDraftOnExit}
                onClick={() => setExitConfirmOpen(false)}
                className="flex-1 rounded-full border border-border py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg disabled:opacity-50"
              >
                继续编辑
              </button>
              <button
                type="button"
                disabled={savingDraftOnExit}
                onClick={() => void handleConfirmExit()}
                className="flex-1 rounded-full bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
              >
                {savingDraftOnExit ? '保存中…' : '确定退出'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <Toast message={message} visible={visible} className="z-[80]" />
      </div>
    </PageShell>
  )
}
