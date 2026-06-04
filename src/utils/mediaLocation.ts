import type { VideoClip } from '@/data/mockProject'
import type { MediaLocation } from '@/types/mediaLocation'
import { isLocationTaggingAllowed } from '@/utils/privacySettings'

const LOCATION_TIMEOUT_MS = 4500
const LOCATION_MAX_AGE_MS = 5 * 60 * 1000
const GROUP_PRECISION = 5

function roundCoordinate(value: number): number {
  return Number(value.toFixed(6))
}

function locationKey(location: MediaLocation): string {
  return [
    location.lat.toFixed(GROUP_PRECISION),
    location.lng.toFixed(GROUP_PRECISION),
    location.label.trim(),
  ].join('|')
}

export function formatMediaLocationLabel(
  location: Pick<MediaLocation, 'lat' | 'lng'>,
  prefix = '当前位置',
): string {
  return `${prefix} · ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
}

export function normalizeMediaLocation(
  location: MediaLocation | null | undefined,
): MediaLocation | null {
  if (!location) return null
  if (!Number.isFinite(location.lat) || !Number.isFinite(location.lng)) return null
  if (location.lat < -90 || location.lat > 90) return null
  if (location.lng < -180 || location.lng > 180) return null

  const lat = roundCoordinate(location.lat)
  const lng = roundCoordinate(location.lng)
  return {
    ...location,
    lat,
    lng,
    label: location.label.trim() || formatMediaLocationLabel({ lat, lng }),
  }
}

export async function captureCurrentMediaLocation(): Promise<MediaLocation | null> {
  if (!isLocationTaggingAllowed()) return null
  if (typeof navigator === 'undefined' || !navigator.geolocation) return null

  return new Promise((resolve) => {
    let settled = false

    const finish = (location: MediaLocation | null) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      resolve(normalizeMediaLocation(location))
    }

    const timer = window.setTimeout(() => finish(null), LOCATION_TIMEOUT_MS)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        finish({
          lat: latitude,
          lng: longitude,
          label: formatMediaLocationLabel({ lat: latitude, lng: longitude }),
          accuracy,
          capturedAt: Date.now(),
        })
      },
      () => finish(null),
      {
        enableHighAccuracy: false,
        maximumAge: LOCATION_MAX_AGE_MS,
        timeout: LOCATION_TIMEOUT_MS,
      },
    )
  })
}

export function getDominantClipLocation(clips: VideoClip[]): MediaLocation | null {
  const groups = new Map<string, { location: MediaLocation; weight: number }>()

  for (const clip of clips) {
    const location = normalizeMediaLocation(clip.location)
    if (!location) continue

    const key = locationKey(location)
    const current = groups.get(key)
    groups.set(key, {
      location,
      weight: (current?.weight ?? 0) + Math.max(clip.duration, 0),
    })
  }

  let best: { location: MediaLocation; weight: number } | null = null
  for (const group of groups.values()) {
    if (!best || group.weight > best.weight) best = group
  }

  return best?.location ?? null
}
