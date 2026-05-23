import { markSceneDone, markSceneUndone } from '@/utils/vlogChecklistStore'
import { getActiveScenes } from '@/utils/vlogDirectorStore'
import type { VlogClipRecord, VlogMaterialExport } from '@/types/vlogMaterial'
import { VLOG_MATERIALS_CHANGED } from '@/types/vlogMaterial'

const DB_NAME = 'memento-vlog-materials'
const DB_VERSION = 1
const STORE = 'clips'

interface StoredClip extends VlogClipRecord {
  blob: Blob
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
        store.createIndex('sceneId', 'sceneId', { unique: false })
        store.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }
  })
}

function notifyChanged() {
  window.dispatchEvent(new CustomEvent(VLOG_MATERIALS_CHANGED))
}

function isDirectorClip(row: VlogClipRecord): boolean {
  return row.source === 'director' || row.source === undefined
}

function sortWeightForScene(sceneId: string) {
  const scenes = getActiveScenes()
  const index = scenes.findIndex((s) => s.id === sceneId)
  return (index >= 0 ? index : 99) * 10 + 10
}

export async function saveClipForScene(
  sceneId: string,
  sceneTitle: string,
  blob: Blob,
  durationMs: number,
): Promise<VlogClipRecord> {
  const existing = await getClipBySceneId(sceneId)
  if (existing) {
    await deleteClip(existing.id)
  }

  const record: StoredClip = {
    id: `clip-${sceneId}-${Date.now()}`,
    source: 'director',
    sceneId,
    sceneTitle,
    name: `${sceneTitle}.mp4`,
    mimeType: blob.type || 'video/mp4',
    durationMs,
    sizeBytes: blob.size,
    createdAt: Date.now(),
    committed: false,
    blob,
  }

  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const req = tx.objectStore(STORE).put(record)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })

  notifyChanged()
  markSceneDone(sceneId)
  const { blob: _b, ...meta } = record
  return meta
}

export async function getClipBySceneId(
  sceneId: string,
): Promise<(VlogClipRecord & { blob: Blob }) | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).index('sceneId').getAll(sceneId)
    req.onsuccess = () => {
      const rows = (req.result as StoredClip[]) ?? []
      if (!rows.length) {
        resolve(null)
        return
      }
      rows.sort((a, b) => b.createdAt - a.createdAt)
      resolve(rows[0])
    }
    req.onerror = () => reject(req.error)
  })
}

export async function getAllClipMeta(): Promise<VlogClipRecord[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => {
      const rows = ((req.result as StoredClip[]) ?? []).filter(isDirectorClip)
      resolve(
        rows
          .map(({ blob: _b, ...meta }) => meta)
          .sort((a, b) => sortWeightForScene(a.sceneId) - sortWeightForScene(b.sceneId)),
      )
    }
    req.onerror = () => reject(req.error)
  })
}

export async function deleteClip(id: string): Promise<void> {
  const db = await openDb()
  let sceneId: string | undefined
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    const getReq = store.get(id)
    getReq.onsuccess = () => {
      sceneId = (getReq.result as StoredClip | undefined)?.sceneId
      const delReq = store.delete(id)
      delReq.onsuccess = () => resolve()
      delReq.onerror = () => reject(delReq.error)
    }
    getReq.onerror = () => reject(getReq.error)
  })
  if (sceneId) markSceneUndone(sceneId)
  notifyChanged()
}

export function isClipCommitted(record: { committed?: boolean }): boolean {
  return record.committed === true
}

/** 将当前所有素材标记为已保存（用户点击「保存素材」） */
/** 重新生成 / 上传：导出全部本地素材（含已保存的） */
export async function exportAllClipsForRegenerate(): Promise<ClipForUpload[]> {
  return loadAllClipsForPreview()
}

export async function commitAllClips(): Promise<number> {
  const db = await openDb()
  const count = await new Promise<number>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    const req = store.getAll()
    req.onsuccess = () => {
      const rows = (req.result as StoredClip[]) ?? []
      let n = 0
      for (const row of rows) {
        if (!isClipCommitted(row)) {
          row.committed = true
          store.put(row)
          markSceneDone(row.sceneId)
          n += 1
        }
      }
      resolve(n)
    }
    req.onerror = () => reject(req.error)
  })
  if (count > 0) notifyChanged()
  return count
}

/** 丢弃未保存的草稿素材 */
export async function discardUncommittedClips(): Promise<number> {
  const db = await openDb()
  const removed = await new Promise<number>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    const req = store.getAll()
    req.onsuccess = () => {
      const rows = (req.result as StoredClip[]) ?? []
      let n = 0
      for (const row of rows) {
        if (!isClipCommitted(row)) {
          store.delete(row.id)
          n += 1
        }
      }
      resolve(n)
    }
    req.onerror = () => reject(req.error)
  })
  if (removed > 0) notifyChanged()
  return removed
}

export async function clearAllClips(): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const req = tx.objectStore(STORE).clear()
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
  notifyChanged()
}

export interface ClipForUpload {
  id: string
  sceneId: string
  name: string
  mimeType: string
  duration: number
  blob: Blob
}

/** 列出全部本地素材（含草稿），供素材预览页 */
export async function loadAllClipsForPreview(): Promise<ClipForUpload[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => {
      const rows = ((req.result as StoredClip[]) ?? []).filter(isDirectorClip)
      resolve(
        rows
          .sort((a, b) => sortWeightForScene(a.sceneId) - sortWeightForScene(b.sceneId))
          .map((row) => ({
            id: row.id,
            sceneId: row.sceneId,
            name: row.name,
            mimeType: row.mimeType,
            duration: Math.max(1, Math.round(row.durationMs / 1000)),
            blob: row.blob,
          })),
      )
    }
    req.onerror = () => reject(req.error)
  })
}

/** 成片生成成功后清空全部本地素材 */
export async function clearMaterialsAfterVlogGenerated(): Promise<void> {
  await clearAllClips()
}

/** 导出素材及 Blob（上传用，避免 Safari 对 blob URL 再 fetch） */
export async function exportClipsForUpload(): Promise<ClipForUpload[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => {
      const rows = ((req.result as StoredClip[]) ?? []).filter(isDirectorClip)
      resolve(
        rows
          .filter((row) => isClipCommitted(row))
          .sort((a, b) => sortWeightForScene(a.sceneId) - sortWeightForScene(b.sceneId))
          .map((row) => ({
            id: row.id,
            sceneId: row.sceneId,
            name: row.name,
            mimeType: row.mimeType,
            duration: Math.max(1, Math.round(row.durationMs / 1000)),
            blob: row.blob,
          })),
      )
    }
    req.onerror = () => reject(req.error)
  })
}

/** 导出全部本地素材，供后续上传 / AI 合成 */
export async function exportMaterialsForAI(): Promise<VlogMaterialExport[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => {
      const rows = ((req.result as StoredClip[]) ?? []).filter(isDirectorClip)
      const exports: VlogMaterialExport[] = rows
        .sort((a, b) => sortWeightForScene(a.sceneId) - sortWeightForScene(b.sceneId))
        .map((row) => ({
          id: row.id,
          sceneId: row.sceneId,
          name: row.name,
          category: 'video' as const,
          duration: Math.max(1, Math.round(row.durationMs / 1000)),
          tags: ['vlog-learn', row.sceneId],
          sortWeight: sortWeightForScene(row.sceneId),
          mimeType: row.mimeType,
          sizeBytes: row.sizeBytes,
          createdAt: row.createdAt,
          objectUrl: URL.createObjectURL(row.blob),
        }))
      resolve(exports)
    }
    req.onerror = () => reject(req.error)
  })
}
