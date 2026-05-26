import { VLOG_SCENES, type VlogScene } from '@/data/vlogGuide'
import type { VlogStyleId } from '@/data/vlogStyles'
import {
  VLOG_DIRECTOR_SESSION_KEY,
  type VlogDirectorSession,
} from '@/types/vlogDirector'

export function loadDirectorSession(): VlogDirectorSession | null {
  try {
    const raw = sessionStorage.getItem(VLOG_DIRECTOR_SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as VlogDirectorSession
    if (!parsed?.scenes?.length) return null
    return parsed
  } catch {
    return null
  }
}

export function saveDirectorSession(session: Omit<VlogDirectorSession, 'createdAt'>) {
  const full: VlogDirectorSession = {
    ...session,
    createdAt: Date.now(),
  }
  sessionStorage.setItem(VLOG_DIRECTOR_SESSION_KEY, JSON.stringify(full))
}

export function clearDirectorSession() {
  sessionStorage.removeItem(VLOG_DIRECTOR_SESSION_KEY)
}

export function hasDirectorSession(): boolean {
  return !!loadDirectorSession()?.scenes?.length
}

/** 当前导拍场景：有 AI 方案用方案，否则回退默认学习清单 */
export function getActiveScenes(): VlogScene[] {
  const session = loadDirectorSession()
  return session?.scenes?.length ? session.scenes : VLOG_SCENES
}

export function getVlogScene(id: string): VlogScene | undefined {
  return getActiveScenes().find((s) => s.id === id)
}

export function getDirectorStyleId(): VlogStyleId {
  const session = loadDirectorSession()
  const id = session?.styleId
  if (id === 'cinematic' || id === 'japanese' || id === 'study') return id
  return 'cinematic'
}

export function getDirectorType(): string {
  return loadDirectorSession()?.type || 'daily'
}
