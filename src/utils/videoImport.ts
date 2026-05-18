import type { VideoClip } from '@/data/mockProject'

export interface ImportedVideoFile {
  id: string
  name: string
  objectUrl: string
  duration: number
  thumb: string
}

function waitForEvent<T extends EventTarget>(
  target: T,
  event: string,
  timeoutMs = 15000,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      cleanup()
      reject(new Error('timeout'))
    }, timeoutMs)

    const onOk = () => {
      cleanup()
      resolve()
    }
    const onErr = () => {
      cleanup()
      reject(new Error('media error'))
    }

    const cleanup = () => {
      window.clearTimeout(timer)
      target.removeEventListener(event, onOk)
      target.removeEventListener('error', onErr)
    }

    target.addEventListener(event, onOk, { once: true })
    target.addEventListener('error', onErr, { once: true })
  })
}

/** 读取本地视频时长并生成封面缩略图 */
export async function probeVideoFile(file: File): Promise<ImportedVideoFile> {
  const objectUrl = URL.createObjectURL(file)
  const video = document.createElement('video')
  video.preload = 'metadata'
  video.muted = true
  video.playsInline = true
  video.src = objectUrl

  await waitForEvent(video, 'loadedmetadata')

  const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 5
  const seekAt = Math.min(Math.max(duration * 0.1, 0.1), Math.max(duration - 0.1, 0.1))
  video.currentTime = seekAt

  let thumb = ''
  try {
    await waitForEvent(video, 'seeked')
    const canvas = document.createElement('canvas')
    const width = video.videoWidth || 320
    const height = video.videoHeight || 180
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0, width, height)
      thumb = canvas.toDataURL('image/jpeg', 0.72)
    }
  } catch {
    thumb = ''
  }

  return {
    id: `import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: file.name || '未命名视频',
    objectUrl,
    duration,
    thumb,
  }
}

export function buildClipsFromImports(items: ImportedVideoFile[]): {
  clips: VideoClip[]
  duration: number
} {
  let start = 0
  const clips: VideoClip[] = items.map((item, index) => {
    const clip: VideoClip = {
      id: item.id || String(index + 1),
      start,
      duration: item.duration,
      thumb: item.thumb || item.objectUrl,
      poster: item.thumb || item.objectUrl,
      videoSrc: item.objectUrl,
    }
    start += item.duration
    return clip
  })

  return {
    clips,
    duration: Math.max(start, 1),
  }
}

export async function importVideoFiles(files: FileList | File[]): Promise<{
  clips: VideoClip[]
  duration: number
}> {
  const list = Array.from(files).filter((file) => file.type.startsWith('video/'))
  if (!list.length) {
    throw new Error('no-video')
  }

  const imported = await Promise.all(list.map((file) => probeVideoFile(file)))
  return buildClipsFromImports(imported)
}
