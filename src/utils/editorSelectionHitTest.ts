import { TIMELINE_OVERLAY_CLIP_ATTR } from '@/components/editor/TimelineObjectBar'

/** 编辑页根容器（用于委托点击判断） */
export const EDITOR_PAGE_ROOT_ATTR = 'data-editor-page'

/** 时间轴区域 */
export const EDITOR_TIMELINE_ATTR = 'data-editor-timeline'

/** 预览画面区域 */
export const EDITOR_PREVIEW_ATTR = 'data-editor-preview'

export const PREVIEW_TEXT_OVERLAY_ATTR = 'data-preview-text-overlay'
export const PREVIEW_STICKER_OVERLAY_ATTR = 'data-preview-sticker-overlay'
export const OVERLAY_CONTEXT_MENU_ATTR = 'data-overlay-context-menu'
export const TIMELINE_PLAYHEAD_ATTR = 'data-timeline-playhead'
export const TIMELINE_VIDEO_CLIP_ATTR = 'data-timeline-video-clip'

function closestAttr(target: EventTarget | null, attr: string): boolean {
  return (
    target instanceof HTMLElement && Boolean(target.closest(`[${attr}]`))
  )
}

/** 点击目标为时间轴条块（含菜单按钮区域） */
export function isTimelineClipInteraction(target: EventTarget | null): boolean {
  return closestAttr(target, TIMELINE_OVERLAY_CLIP_ATTR)
}

/** 点击目标为预览区文字/贴纸 */
export function isPreviewOverlayInteraction(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return Boolean(
    target.closest(
      `[${PREVIEW_TEXT_OVERLAY_ATTR}], [${PREVIEW_STICKER_OVERLAY_ATTR}]`,
    ),
  )
}

export function isOverlayContextMenuInteraction(
  target: EventTarget | null,
): boolean {
  return closestAttr(target, OVERLAY_CONTEXT_MENU_ATTR)
}

export function isTimelinePlayheadInteraction(target: EventTarget | null): boolean {
  return closestAttr(target, TIMELINE_PLAYHEAD_ATTR)
}

/**
 * 是否应因「点击空白」而清除选中。
 * 在捕获阶段调用时，需配合条块/预览对象上的 stopPropagation。
 */
export function shouldClearSelectionOnClick(
  target: EventTarget | null,
  options: { isDraggingClip: boolean },
): boolean {
  if (options.isDraggingClip) return false
  if (!(target instanceof HTMLElement)) return false
  if (isOverlayContextMenuInteraction(target)) return false
  if (isTimelineClipInteraction(target)) return false
  if (isPreviewOverlayInteraction(target)) return false
  if (isTimelinePlayheadInteraction(target)) return false

  return Boolean(target.closest(`[${EDITOR_PAGE_ROOT_ATTR}]`))
}
