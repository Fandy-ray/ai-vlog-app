import type { TimelineDisplayClip } from '@/types/timelineDisplay'

type ClipContextMenuTarget =
  | { kind: 'text'; id: string }
  | { kind: 'sticker'; id: string }
  | { kind: 'bgm' }
  | { kind: 'canvas' }

/** 条块是否应显示「用户选中」高亮（不含音频面板打开等被动高亮） */
export function isTimelineClipUserSelected(
  clip: Pick<TimelineDisplayClip, 'id' | 'kind'>,
  options: {
    selectedTimelineClipId: string | null
    selectedTextId: string | null
    selectedStickerId: string | null
    contextMenuTarget: ClipContextMenuTarget | null
  },
): boolean {
  const {
    selectedTimelineClipId,
    selectedTextId,
    selectedStickerId,
    contextMenuTarget,
  } = options

  if (selectedTimelineClipId === clip.id) return true
  if (clip.kind === 'text' && selectedTextId === clip.id) return true
  if (clip.kind === 'sticker' && selectedStickerId === clip.id) return true

  if (!contextMenuTarget || contextMenuTarget.kind === 'canvas') return false
  if (contextMenuTarget.kind === 'bgm') return clip.kind === 'bgm'
  if (contextMenuTarget.kind === 'text') {
    return clip.kind === 'text' && clip.id === contextMenuTarget.id
  }
  if (contextMenuTarget.kind === 'sticker') {
    return clip.kind === 'sticker' && clip.id === contextMenuTarget.id
  }
  return false
}
