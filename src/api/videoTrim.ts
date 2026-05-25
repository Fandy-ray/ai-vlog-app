const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export async function trimVideoOnServer(
  file: Blob,
  startSec: number,
  endSec: number,
  fileName = 'clip.mp4',
): Promise<Blob> {
  const form = new FormData()
  form.append('video', file, fileName)
  form.append('startSec', String(startSec))
  form.append('endSec', String(endSec))

  const res = await fetch(`${API_BASE}/api/vlog/trim`, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    const text = await res.text()
    let msg = '裁剪失败'
    try {
      const j = JSON.parse(text) as { message?: string }
      if (j.message) msg = j.message
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }

  return res.blob()
}
