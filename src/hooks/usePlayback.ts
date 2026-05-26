import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react'
import { clamp } from '@/utils/formatTime'

export interface UsePlaybackOptions {
  /** 为 true 时由视频元素驱动时间轴，内部 RAF 不再推进时间 */
  videoClockRef?: RefObject<boolean>
}

export function usePlayback(
  duration: number,
  initialTime = 31,
  options?: UsePlaybackOptions,
) {
  const [currentTime, setCurrentTime] = useState(initialTime)
  const [isPlaying, setIsPlaying] = useState(false)
  const rafRef = useRef<number>(0)
  const lastTickRef = useRef<number>(0)
  const videoClockRef = options?.videoClockRef

  const seek = useCallback(
    (time: number) => {
      setCurrentTime(clamp(time, 0, duration))
    },
    [duration],
  )

  const syncTime = useCallback(
    (time: number) => {
      setCurrentTime(clamp(time, 0, duration))
    },
    [duration],
  )

  const togglePlay = useCallback(() => {
    setIsPlaying((p) => !p)
  }, [])

  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(rafRef.current)
      return
    }

    const tick = (now: number) => {
      if (videoClockRef?.current) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      if (!lastTickRef.current) lastTickRef.current = now
      const delta = (now - lastTickRef.current) / 1000
      lastTickRef.current = now

      setCurrentTime((t) => {
        const next = t + delta
        if (next >= duration) {
          setIsPlaying(false)
          return duration
        }
        return next
      })

      rafRef.current = requestAnimationFrame(tick)
    }

    lastTickRef.current = 0
    rafRef.current = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(rafRef.current)
  }, [isPlaying, duration, videoClockRef])

  return { currentTime, isPlaying, seek, syncTime, togglePlay, setIsPlaying }
}
