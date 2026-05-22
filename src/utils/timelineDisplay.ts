import { formatBgmLabel, getNetworkAudio } from '@/data/audioLibrary'
import { getStickerPreset } from '@/data/stickers'
import type { StickerOverlay, TextOverlay } from '@/types/editorState'
import type { TimeRange } from '@/utils/timeRange'
import type {
  TimelineDisplayClip,
  TimelineOverlayKind,
} from '@/types/timelineDisplay'
import { normalizeTimeRange } from '@/utils/timeRange'

export function buildTextClipLabel(content: string): string {
  const t = content.trim()
  return `文字 · ${t || '未填写'}`
}

export function buildStickerClipLabel(stickerId: string): string {
  const preset = getStickerPreset(stickerId)
  const hint = preset ? `${preset.emoji} ${preset.name}` : stickerId
  return `贴纸 · ${hint}`
}

export function buildOriginalAudioClipLabel(enabled: boolean): string {
  return enabled ? '原声 · 视频原声' : '原声 · 已关闭'
}

export function buildBgmClipLabel(bgmId: string): string {
  const audio = getNetworkAudio(bgmId)
  const name = audio?.name ?? formatBgmLabel(bgmId).split(' - ')[0] ?? '配乐'
  return `配乐 · ${name}`
}

export function clipTimeRange(
  range: Partial<TimeRange> | undefined,
  duration: number,
): { startTime: number; endTime: number } {
  return normalizeTimeRange(range, duration).range
}

export function textToDisplayClip(
  overlay: TextOverlay,
  duration: number,
  selected = false,
): TimelineDisplayClip {
  const { startTime, endTime } = clipTimeRange(overlay, duration)
  return {
    id: overlay.id,
    kind: 'text',
    label: buildTextClipLabel(overlay.content),
    startTime,
    endTime,
    selected,
  }
}

export function stickerToDisplayClip(
  overlay: StickerOverlay,
  duration: number,
  selected = false,
): TimelineDisplayClip {
  const { startTime, endTime } = clipTimeRange(overlay, duration)
  return {
    id: overlay.id,
    kind: 'sticker',
    label: buildStickerClipLabel(overlay.stickerId),
    startTime,
    endTime,
    selected,
  }
}

export function originalAudioToDisplayClip(
  range: Partial<TimeRange> | undefined,
  duration: number,
  enabled: boolean,
  selected = false,
): TimelineDisplayClip {
  const { startTime, endTime } = clipTimeRange(range, duration)
  return {
    id: 'original-audio',
    kind: 'originalAudio',
    label: buildOriginalAudioClipLabel(enabled),
    startTime,
    endTime,
    selected,
    disabled: !enabled,
  }
}

export function bgmToDisplayClip(
  bgmId: string,
  range: Partial<TimeRange> | undefined,
  duration: number,
  selected = false,
): TimelineDisplayClip {
  const { startTime, endTime } = clipTimeRange(range, duration)
  return {
    id: `bgm-${bgmId}`,
    kind: 'bgm',
    label: buildBgmClipLabel(bgmId),
    startTime,
    endTime,
    selected,
  }
}

export type TimelineClipDragMode = 'move' | 'resize-start' | 'resize-end'

export const DRAGGABLE_CLIP_KINDS: TimelineOverlayKind[] = [
  'originalAudio',
  'text',
  'sticker',
  'bgm',
]

export function isDraggableClipKind(kind: TimelineOverlayKind): boolean {
  return (DRAGGABLE_CLIP_KINDS as TimelineOverlayKind[]).includes(kind)
}

/** 支持右键 / 三点快捷菜单的条块类型（不含原声） */
export const TIMELINE_MENU_CLIP_KINDS: TimelineOverlayKind[] = [
  'text',
  'sticker',
  'bgm',
]

export function hasTimelineClipMenu(kind: TimelineOverlayKind): boolean {
  return (TIMELINE_MENU_CLIP_KINDS as TimelineOverlayKind[]).includes(kind)
}

export const TIMELINE_CLIP_ROW_KINDS: TimelineOverlayKind[] = [
  'originalAudio',
  'text',
  'sticker',
  'bgm',
]
