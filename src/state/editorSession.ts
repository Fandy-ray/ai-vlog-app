import type { EditorSnapshot } from '@/types/editorState'
import { INITIAL_EDITOR_SNAPSHOT } from '@/types/editorState'
import { clearNarrationAudio } from '@/state/narrationAudio'

const STORAGE_KEY = 'memento-editor-session'

let session: EditorSnapshot = cloneSnapshot(INITIAL_EDITOR_SNAPSHOT)

function cloneSnapshot(s: EditorSnapshot): EditorSnapshot {
  return {
    ...s,
    textOverlay: s.textOverlay ? { ...s.textOverlay } : null,
    stickerOverlays: s.stickerOverlays.map((st) => ({ ...st })),
  }
}

export function loadEditorSessionFromStorage() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as EditorSnapshot
    session = cloneSnapshot({ ...INITIAL_EDITOR_SNAPSHOT, ...parsed })
  } catch {
    // ignore
  }
}

export function persistEditorSession() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    // ignore quota errors
  }
}

export function getEditorSession(): EditorSnapshot {
  return cloneSnapshot(session)
}

export function setEditorSession(next: EditorSnapshot) {
  session = cloneSnapshot(next)
  persistEditorSession()
}

export function resetEditorSession() {
  session = cloneSnapshot(INITIAL_EDITOR_SNAPSHOT)
  clearNarrationAudio()
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
