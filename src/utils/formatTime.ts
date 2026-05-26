export function formatDurationMs(ms: number): string {
  return formatTime(Math.floor(ms / 1000))
}

export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`
}

/** 解析 mm:ss 或纯秒数字符串，失败返回 null */
export function parseTimeInput(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  const colonMatch = trimmed.match(/^(\d+):(\d{1,2})$/)
  if (colonMatch) {
    const minutes = Number(colonMatch[1])
    const secs = Number(colonMatch[2])
    if (secs >= 60 || Number.isNaN(minutes) || Number.isNaN(secs)) return null
    return minutes * 60 + secs
  }

  if (/^\d+$/.test(trimmed)) {
    const n = Number(trimmed)
    return Number.isNaN(n) ? null : n
  }

  return null
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
