import { useEffect, useRef } from 'react'
import { getBgmPlayUrls } from '@/utils/bgmLoader'
import { isActiveAtTime, type TimeRange } from '@/utils/timeRange'

interface UsePreviewBgmOptions {
  bgmId: string | null
  bgmRange: TimeRange
  currentTime: number
  isPlaying: boolean
  /** 配乐轨音量 0–1 */
  volume: number
}

function loadBgmElement(
  audio: HTMLAudioElement,
  urls: string[],
  index: number,
): Promise<boolean> {
  return new Promise((resolve) => {
    if (index >= urls.length) {
      resolve(false)
      return
    }

    const onReady = () => {
      cleanup()
      resolve(true)
    }
    const onErr = () => {
      cleanup()
      void loadBgmElement(audio, urls, index + 1).then(resolve)
    }
    const cleanup = () => {
      audio.removeEventListener('loadedmetadata', onReady)
      audio.removeEventListener('error', onErr)
    }

    audio.src = urls[index]
    audio.load()
    audio.addEventListener('loadedmetadata', onReady)
    audio.addEventListener('error', onErr)
  })
}

/**
 * 剪辑预览：与时间轴同步播放所选配乐（在配乐时间范围内）。
 */
export function usePreviewBgm({
  bgmId,
  bgmRange,
  currentTime,
  isPlaying,
  volume,
}: UsePreviewBgmOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const loadedIdRef = useRef<string | null>(null)

  useEffect(() => {
    const audio = audioRef.current ?? new Audio()
    audioRef.current = audio
    audio.loop = true
    audio.preload = 'auto'

    if (!bgmId) {
      loadedIdRef.current = null
      audio.pause()
      audio.removeAttribute('src')
      return
    }

    if (loadedIdRef.current === bgmId) {
      audio.volume = volume
      return
    }

    let cancelled = false
    loadedIdRef.current = null
    audio.pause()

    void (async () => {
      const urls = getBgmPlayUrls(bgmId)
      const ok = await loadBgmElement(audio, urls, 0)
      if (cancelled) return
      if (ok) {
        loadedIdRef.current = bgmId
        audio.volume = volume
      } else {
        console.warn('[preview-bgm] 配乐加载失败', bgmId, urls)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [bgmId, volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !bgmId || loadedIdRef.current !== bgmId) return

    audio.volume = volume

    const inRange = isActiveAtTime(currentTime, bgmRange)
    const rangeOffset = Math.max(0, currentTime - bgmRange.startTime)
    const duration = audio.duration
    const targetTime =
      Number.isFinite(duration) && duration > 0
        ? rangeOffset % duration
        : rangeOffset

    if (isPlaying && inRange) {
      if (Math.abs(audio.currentTime - targetTime) > 0.2) {
        audio.currentTime = targetTime
      }
      void audio.play().catch(() => {})
      return
    }

    audio.pause()
    if (!inRange && Number.isFinite(duration)) {
      audio.currentTime = 0
    } else if (!isPlaying && inRange && Math.abs(audio.currentTime - targetTime) > 0.05) {
      audio.currentTime = targetTime
    }
  }, [bgmId, bgmRange, currentTime, isPlaying, volume])

  useEffect(() => {
    return () => {
      const audio = audioRef.current
      if (audio) {
        audio.pause()
        audio.removeAttribute('src')
      }
      audioRef.current = null
      loadedIdRef.current = null
    }
  }, [])
}
