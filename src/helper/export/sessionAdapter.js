import { createDefaultTextOverlay } from '../data/textStyles'

/** 将快应用 session 规范为与 Web EditorSnapshot 一致的结构 */
export function normalizeSession(session = {}) {
  const stickerOverlays = Array.isArray(session.stickerOverlays)
    ? session.stickerOverlays.map(item => Object.assign({}, item))
    : []

  let textOverlay = session.textOverlay ? Object.assign({}, session.textOverlay) : null

  if (!textOverlay && session.textContent) {
    textOverlay = createDefaultTextOverlay(session.textContent)
  }

  return {
    title: session.title || '旅行的意义',
    filterId: session.filterId || 'none',
    filterIntensity: session.filterIntensity == null ? 100 : session.filterIntensity,
    effectId: session.effectId || 'none',
    textOverlay,
    stickerOverlays,
    keepOriginalAudio: session.keepOriginalAudio !== false,
    bgmId: session.bgmId == null ? 'sunny-day' : session.bgmId
  }
}

export default {
  normalizeSession
}
