const STORAGE_KEY = 'memento-vlog-checklist'

export const VLOG_CHECKLIST_CHANGED = 'memento-vlog-checklist-changed'

export function readChecklist(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, boolean>
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

function writeChecklist(data: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  window.dispatchEvent(new CustomEvent(VLOG_CHECKLIST_CHANGED))
}

export function markSceneDone(sceneId: string) {
  if (!sceneId) return
  const data = readChecklist()
  if (data[sceneId]) return
  data[sceneId] = true
  writeChecklist(data)
}

export function markSceneUndone(sceneId: string) {
  if (!sceneId) return
  const data = readChecklist()
  if (!data[sceneId]) return
  delete data[sceneId]
  writeChecklist(data)
}

export function clearChecklist() {
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new CustomEvent(VLOG_CHECKLIST_CHANGED))
}
