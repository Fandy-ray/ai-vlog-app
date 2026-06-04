import type { GardenVlogItem } from '@/data/memories'
import { GARDEN_VLOGS } from '@/data/memories'
import type { MediaLocation } from '@/types/mediaLocation'
import type { ExportResult } from '@/utils/export/exportVideo'
import {
  formatMediaLocationLabel,
  normalizeMediaLocation,
} from '@/utils/mediaLocation'

const DB_NAME = 'memento-garden'
const DB_VERSION = 1
const STORE = 'vlogs'
const MAX_USER_VLOGS = 48

export const GARDEN_CHANGED = 'memento-garden-changed'

interface GardenVlogRecord {
  id: string
  title: string
  coverDataUrl: string
  durationSec: number
  createdAt: number
  location: string
  theme: string
  description: string
  lat: number
  lng: number
  videoBlob: Blob
}

interface AddExportedVlogOptions {
  location?: MediaLocation | null
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error ?? new Error('无法打开记忆花园存储'))
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' })
        store.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }
  })
}

function notifyGardenChanged() {
  window.dispatchEvent(new Event(GARDEN_CHANGED))
}

function formatDurationLabel(seconds: number): string {
  const total = Math.max(0, Math.round(seconds))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatTimeLabel(date: Date): string {
  const hour = date.getHours()
  const minute = String(date.getMinutes()).padStart(2, '0')
  const period = hour < 6 ? '凌晨' : hour < 12 ? '上午' : hour < 18 ? '下午' : '晚上'
  const displayHour = hour < 6 ? hour : hour <= 12 ? hour : hour - 12
  return `${period} ${String(displayHour === 0 ? 12 : displayHour).padStart(2, '0')}:${minute}`
}

function coordsFromId(id: string): { lat: number; lng: number } {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 10_000
  }
  return {
    lat: 30.4 + (hash % 120) * 0.008,
    lng: 104.0 + ((hash * 17) % 120) * 0.01,
  }
}

function resolveGardenLocation(
  id: string,
  location?: MediaLocation | null,
): { lat: number; lng: number; label: string; hasRealLocation: boolean } {
  const normalized = normalizeMediaLocation(location)
  if (normalized) {
    return {
      lat: normalized.lat,
      lng: normalized.lng,
      label: normalized.label || formatMediaLocationLabel(normalized),
      hasRealLocation: true,
    }
  }

  const fallback = coordsFromId(id)
  return {
    ...fallback,
    label: '本地 · 我的创作',
    hasRealLocation: false,
  }
}

function recordToGardenItem(record: GardenVlogRecord): GardenVlogItem {
  const date = new Date(record.createdAt)
  const fallback = coordsFromId(record.id)
  const lat = Number.isFinite(record.lat) ? record.lat : fallback.lat
  const lng = Number.isFinite(record.lng) ? record.lng : fallback.lng
  return {
    id: record.id,
    title: record.title,
    cover: record.coverDataUrl,
    views: '—',
    duration: formatDurationLabel(record.durationSec),
    location: record.location,
    timeLabel: formatTimeLabel(date),
    date: formatDateKey(date),
    theme: record.theme,
    description: record.description,
    lat,
    lng,
    videoUrl: URL.createObjectURL(record.videoBlob),
  }
}

async function listUserRecords(): Promise<GardenVlogRecord[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => {
      const rows = (req.result as GardenVlogRecord[]) ?? []
      resolve(rows.sort((a, b) => b.createdAt - a.createdAt))
    }
    req.onerror = () => reject(req.error ?? new Error('读取记忆花园失败'))
  })
}

export async function loadUserGardenVlogs(): Promise<GardenVlogItem[]> {
  const records = await listUserRecords()
  return records.map(recordToGardenItem)
}

export async function loadAllGardenVlogs(): Promise<GardenVlogItem[]> {
  const userVlogs = await loadUserGardenVlogs()
  return [...userVlogs, ...GARDEN_VLOGS]
}

export async function getUserGardenVlogCount(): Promise<number> {
  const records = await listUserRecords()
  return records.length
}

export function revokeGardenVlogUrls(vlogs: GardenVlogItem[]) {
  for (const vlog of vlogs) {
    if (vlog.videoUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(vlog.videoUrl)
    }
  }
}

export async function addExportedVlogToGarden(
  result: ExportResult,
  options: AddExportedVlogOptions = {},
): Promise<GardenVlogItem> {
  const createdAt = Date.now()
  const id = `user-${createdAt}`
  const gardenLocation = resolveGardenLocation(id, options.location)
  const { lat, lng } = gardenLocation
  const record: GardenVlogRecord = {
    id,
    title: result.title?.trim() || '我的 Vlog',
    coverDataUrl: result.posterUrl,
    durationSec: result.duration,
    createdAt,
    location: '本地 · 我的创作',
    theme: '我的剪辑',
    description: `在 ${formatDateKey(new Date(createdAt))} 完成剪辑并导出的作品。`,
    lat,
    lng,
    videoBlob: result.blob,
  }
  record.location = gardenLocation.label
  record.lat = gardenLocation.lat
  record.lng = gardenLocation.lng
  if (gardenLocation.hasRealLocation) {
    record.description = `在 ${formatDateKey(new Date(createdAt))} 完成剪辑并标注到 ${gardenLocation.label}。`
  }

  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('保存到记忆花园失败'))
    tx.objectStore(STORE).put(record)
  })

  const records = await listUserRecords()
  if (records.length > MAX_USER_VLOGS) {
    const stale = records.slice(MAX_USER_VLOGS)
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error('清理旧回忆失败'))
      const store = tx.objectStore(STORE)
      for (const item of stale) store.delete(item.id)
    })
  }

  notifyGardenChanged()
  return recordToGardenItem(record)
}
