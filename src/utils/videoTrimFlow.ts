export interface VideoTrimRequest {
  file: File
  sceneTitle?: string
}

export interface VideoTrimResult {
  blob: Blob
  durationMs: number
  startSec: number
  endSec: number
}

type TrimListener = (req: VideoTrimRequest) => void

let pendingListener: TrimListener | null = null
let pendingResolver: ((r: VideoTrimResult | null) => void) | null = null

export function registerVideoTrimListener(listener: TrimListener) {
  pendingListener = listener
  return () => {
    if (pendingListener === listener) pendingListener = null
  }
}

/** 打开裁剪界面，用户确认后返回片段；取消返回 null */
export function requestVideoTrim(req: VideoTrimRequest): Promise<VideoTrimResult | null> {
  return new Promise((resolve) => {
    pendingResolver = resolve
    pendingListener?.(req)
  })
}

export function resolveVideoTrim(result: VideoTrimResult | null) {
  pendingResolver?.(result)
  pendingResolver = null
}
