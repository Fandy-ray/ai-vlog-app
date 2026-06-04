import type { VideoClip } from '@/data/mockProject'
import type { EditorSnapshot } from '@/types/editorState'

const DB_NAME = 'memento-editor-drafts'
const DB_VERSION = 1
const STORE = 'drafts'
const ACTIVE_DRAFT_KEY = 'memento-active-editor-draft-id'

interface StoredVideoClip extends Omit<VideoClip, 'videoSrc'> {
  blob?: Blob
}

export interface EditorDraftRecord {
  id: string
  title: string
  duration: number
  updatedAt: number
  snapshot: EditorSnapshot
  clips: StoredVideoClip[]
}

export interface EditorDraftSummary {
  id: string
  title: string
  duration: number
  updatedAt: number
  poster: string
  clipCount: number
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'))
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' })
        store.createIndex('updatedAt', 'updatedAt', { unique: false })
      }
    }
  })
}

export function getActiveDraftId(): string | null {
  try {
    return sessionStorage.getItem(ACTIVE_DRAFT_KEY)
  } catch {
    return null
  }
}

export function setActiveDraftId(id: string | null) {
  try {
    if (!id) sessionStorage.removeItem(ACTIVE_DRAFT_KEY)
    else sessionStorage.setItem(ACTIVE_DRAFT_KEY, id)
  } catch {
    // ignore
  }
}

export function clearActiveDraftId() {
  setActiveDraftId(null)
}

async function clipToStored(clip: VideoClip): Promise<StoredVideoClip> {
  const { videoSrc, ...rest } = clip
  let blob: Blob | undefined

  if (videoSrc?.startsWith('blob:')) {
    try {
      const response = await fetch(videoSrc)
      blob = await response.blob()
    } catch {
      // blob 可能已失效，仅保留元数据
    }
  }

  return { ...rest, blob }
}

function storedToClip(stored: StoredVideoClip): VideoClip {
  const { blob, ...clip } = stored
  const videoSrc = blob
    ? URL.createObjectURL(blob)
    : undefined
  return {
    ...clip,
    videoSrc,
  }
}

export function hasMeaningfulDraftContent(clips: VideoClip[]): boolean {
  return clips.some((clip) => Boolean(clip.videoSrc))
}

export async function saveEditorDraft(input: {
  snapshot: EditorSnapshot
  clips: VideoClip[]
  duration: number
  draftId?: string | null
}): Promise<string> {
  if (!hasMeaningfulDraftContent(input.clips)) {
    return getActiveDraftId() ?? ''
  }

  const id = input.draftId ?? getActiveDraftId() ?? `draft_${Date.now()}`
  const storedClips = await Promise.all(input.clips.map((clip) => clipToStored(clip)))
  const title =
    input.snapshot.title?.trim() ||
    `未命名草稿 · ${new Date().toLocaleDateString('zh-CN')}`

  const record: EditorDraftRecord = {
    id,
    title,
    duration: input.duration,
    updatedAt: Date.now(),
    snapshot: {
      ...input.snapshot,
      title,
      videoClips: input.clips.map(({ videoSrc: _, ...clip }) => clip),
      videoDuration: input.duration,
    },
    clips: storedClips,
  }

  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const req = tx.objectStore(STORE).put(record)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })

  setActiveDraftId(id)
  return id
}

export async function listEditorDrafts(): Promise<EditorDraftSummary[]> {
  const db = await openDb()
  const rows = await new Promise<EditorDraftRecord[]>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => resolve((req.result as EditorDraftRecord[]) ?? [])
    req.onerror = () => reject(req.error)
  })

  return rows
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((row) => ({
      id: row.id,
      title: row.title,
      duration: row.duration,
      updatedAt: row.updatedAt,
      poster: row.clips[0]?.poster ?? row.clips[0]?.thumb ?? '',
      clipCount: row.clips.length,
    }))
}

export async function loadEditorDraft(id: string): Promise<{
  snapshot: EditorSnapshot
  clips: VideoClip[]
  duration: number
} | null> {
  const db = await openDb()
  const row = await new Promise<EditorDraftRecord | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(id)
    req.onsuccess = () => resolve(req.result as EditorDraftRecord | undefined)
    req.onerror = () => reject(req.error)
  })

  if (!row) return null

  const clips = row.clips.map(storedToClip)
  return {
    snapshot: row.snapshot,
    clips,
    duration: row.duration,
  }
}

export async function deleteEditorDraft(id: string) {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const req = tx.objectStore(STORE).delete(id)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
  if (getActiveDraftId() === id) clearActiveDraftId()
}

export async function deleteActiveEditorDraft() {
  const id = getActiveDraftId()
  if (!id) return
  await deleteEditorDraft(id)
}
