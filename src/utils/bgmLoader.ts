import { getNetworkAudio } from '@/data/audioLibrary'

const bgmBufferCache = new Map<string, ArrayBuffer>()

/** 本地静态配乐（public/bgm/{id}.mp3），导出与试听优先使用 */
export function getLocalBgmUrl(bgmId: string): string {
  return `/bgm/${bgmId}.mp3`
}

/** 试听可依次尝试的地址 */
export function getBgmPlayUrls(bgmId: string): string[] {
  const audio = getNetworkAudio(bgmId)
  const urls = [getLocalBgmUrl(bgmId)]
  if (audio?.remoteUrl) {
    urls.push(audio.remoteUrl)
  }
  return urls
}

/** 拉取配乐二进制，带内存缓存 */
export async function fetchBgmBuffer(bgmId: string): Promise<ArrayBuffer> {
  const cached = bgmBufferCache.get(bgmId)
  if (cached) return cached.slice(0)

  const audio = getNetworkAudio(bgmId)
  if (!audio) {
    throw new Error('未找到所选配乐')
  }

  const urls = getBgmPlayUrls(bgmId)
  let lastError: unknown

  for (const url of urls) {
    try {
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      const buffer = await res.arrayBuffer()
      if (buffer.byteLength < 1024) {
        throw new Error('配乐文件无效')
      }
      bgmBufferCache.set(bgmId, buffer)
      return buffer.slice(0)
    } catch (error) {
      lastError = error
      console.warn('[bgm] fetch failed', url, error)
    }
  }

  throw new Error(
    lastError instanceof Error
      ? `配乐加载失败：${lastError.message}。请运行 npm run bgm:fetch 下载本地配乐`
      : '配乐加载失败，请运行 npm run bgm:fetch 后重试',
  )
}

export function primeBgmCache(bgmId: string, buffer: ArrayBuffer) {
  bgmBufferCache.set(bgmId, buffer.slice(0))
}
