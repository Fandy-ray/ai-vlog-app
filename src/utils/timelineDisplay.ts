import { formatBgmLabel, getNetworkAudio } from '@/data/audioLibrary'
import { getStickerPreset } from '@/data/stickers'
import type { EditorSnapshot, StickerOverlay, TextOverlay } from '@/types/editorState'
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

export function buildStickerClipLabel(stickerId: string, name?: string): string {
  if (name) return `贴纸 · ${name}`
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
    label: buildStickerClipLabel(overlay.stickerId, overlay.name),
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

export function bgmTimelineClipId(bgmId: string) {
  return `bgm-${bgmId}`
}

/** 从快照收集叠加轨 clip id（不含原声） */
export function collectOverlayTrackIds(snapshot: EditorSnapshot): string[] {
  const ids: string[] = []
  for (const t of snapshot.textOverlays) ids.push(t.id)
  for (const s of snapshot.stickerOverlays) ids.push(s.id)
  if (snapshot.bgmId) ids.push(bgmTimelineClipId(snapshot.bgmId))
  return ids
}

/** 合并保存的顺序与当前素材，新加的排在末尾 */
export function reconcileOverlayTrackOrder(snapshot: EditorSnapshot): string[] {
  const valid = new Set(collectOverlayTrackIds(snapshot))
  const order = (snapshot.overlayTrackOrder ?? []).filter((id) => valid.has(id))
  for (const id of valid) {
    if (!order.includes(id)) order.push(id)
  }
  return order
}

/** 原声轨置顶，其余按添加顺序每条一行 */
export function orderTimelineOverlayClips(
  clips: TimelineDisplayClip[],
  trackOrder: string[],
): TimelineDisplayClip[] {
  const original = clips.find((c) => c.kind === 'originalAudio')
  const byId = new Map(
    clips.filter((c) => c.kind !== 'originalAudio').map((c) => [c.id, c]),
  )
  const ordered: TimelineDisplayClip[] = []
  const seen = new Set<string>()

  for (const id of trackOrder) {
    const clip = byId.get(id)
    if (clip) {
      ordered.push(clip)
      seen.add(id)
    }
  }
  for (const clip of byId.values()) {
    if (!seen.has(clip.id)) ordered.push(clip)
  }

  return original ? [original, ...ordered] : ordered
}
