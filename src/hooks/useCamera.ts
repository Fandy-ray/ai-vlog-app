import { useCallback, useEffect, useRef, useState } from 'react'

export type CameraErrorKind = 'insecure' | 'denied' | 'unavailable' | 'unknown'

export interface CameraError {
  kind: CameraErrorKind
  message: string
}

function isSecureContext() {
  return (
    window.isSecureContext ||
    location.protocol === 'https:' ||
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1'
  )
}

function mapMediaError(err: unknown): CameraError {
  const name = err instanceof DOMException ? err.name : ''
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return {
      kind: 'denied',
      message: '浏览器拒绝了摄像头权限。请在系统设置或地址栏中允许摄像头后重试。',
    }
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return {
      kind: 'unavailable',
      message: '未检测到可用摄像头，请确认设备摄像头正常。',
    }
  }
  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return {
      kind: 'unavailable',
      message: '摄像头正被其他应用占用，请关闭后重试。',
    }
  }
  return {
    kind: 'unknown',
    message: '无法启动相机，请检查权限或稍后重试。',
  }
}

async function requestVideoStream(): Promise<MediaStream> {
  const attempts: MediaStreamConstraints[] = [
    { video: { facingMode: { ideal: 'environment' } }, audio: true },
    { video: { facingMode: 'user' }, audio: true },
    { video: true, audio: true },
    { video: { facingMode: { ideal: 'environment' } }, audio: false },
    { video: true, audio: false },
  ]

  let lastError: unknown
  for (const constraints of attempts) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints)
    } catch (e) {
      lastError = e
    }
  }
  throw lastError
}

export function useCamera(enabled: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<CameraError | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  const retry = useCallback(() => {
    setError(null)
    setReady(false)
    setRetryKey((k) => k + 1)
  }, [])

  useEffect(() => {
    if (!enabled) return

    let stream: MediaStream | null = null
    let cancelled = false

    const start = async () => {
      setReady(false)
      setError(null)
      setStream(null)

      if (!navigator.mediaDevices?.getUserMedia) {
        setError({
          kind: 'unavailable',
          message: '当前浏览器不支持摄像头 API。',
        })
        return
      }

      if (!isSecureContext()) {
        setError({
          kind: 'insecure',
          message:
            '手机通过局域网 HTTP 访问时，浏览器通常禁止相机。请改用 HTTPS 地址（开发时请运行 npm run dev，并用 https:// 开头的 Network 地址打开）。',
        })
        return
      }

      try {
        stream = await requestVideoStream()
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        video.setAttribute('playsinline', 'true')
        video.setAttribute('webkit-playsinline', 'true')
        await video.play()
        if (!cancelled) {
          setStream(stream)
          setReady(true)
        }
      } catch (e) {
        if (!cancelled) setError(mapMediaError(e))
      }
    }

    start()

    return () => {
      cancelled = true
      stream?.getTracks().forEach((t) => t.stop())
      setStream(null)
    }
  }, [enabled, retryKey])

  return { videoRef, stream, ready, error, retry }
}
