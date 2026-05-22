function toAbsoluteUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url
  const path = url.startsWith('/') ? url : `/${url}`
  return `${window.location.origin}${path}`
}

async function fetchVideoBlob(url: string): Promise<Blob> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('无法获取视频文件')
  }
  return res.blob()
}

/** 桌面 / Android：直接触发浏览器下载 */
export async function downloadVideo(url: string, filename = 'memento-vlog.mp4'): Promise<void> {
  const blob = await fetchVideoBlob(url)
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(objectUrl), 2000)
}

/**
 * iOS / 移动端：调起系统分享面板，用户需选择「存储视频」才能进相册。
 * 网页无法像原生 App 一样直接写入系统相册。
 */
export async function shareVideoForPhotos(
  url: string,
  filename = 'memento-vlog.mp4',
): Promise<void> {
  const blob = await fetchVideoBlob(url)
  const type = blob.type || 'video/mp4'
  const file = new File([blob], filename, { type })

  if (!navigator.canShare?.({ files: [file] })) {
    await downloadVideo(url, filename)
    return
  }

  await navigator.share({
    files: [file],
    title: '忆眸 Vlog',
    text: '保存到相册：请在分享面板向下滑，点「存储视频」',
  })
}

/** 分享链接与文案（隔空投送、微信等），不强制分享视频文件 */
export async function shareVlogLink(options: {
  url: string
  title: string
  text?: string
}): Promise<'share' | 'copy'> {
  const absolute = toAbsoluteUrl(options.url)
  const payload = {
    title: options.title,
    text: options.text || '我用忆眸做了一支 Vlog',
    url: absolute,
  }

  if (navigator.share) {
    try {
      await navigator.share(payload)
      return 'share'
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        throw err
      }
    }
  }

  const line = `${payload.title}\n${payload.text}\n${absolute}`
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(line)
    return 'copy'
  }

  throw new Error('当前环境不支持分享')
}

export function isLikelyIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}
