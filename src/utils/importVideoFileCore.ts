const MAX_BYTES = 120 * 1024 * 1024

export function pickVideoFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'video/*'
    input.onchange = () => {
      const file = input.files?.[0] ?? null
      resolve(file)
    }
    input.click()
  })
}

export function readVideoDurationMs(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      const ms =
        Number.isFinite(video.duration) && video.duration > 0
          ? Math.round(video.duration * 1000)
          : 3000
      URL.revokeObjectURL(url)
      resolve(ms)
    }
    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('无法读取视频时长'))
    }
    video.src = url
  })
}

export function validateFileMeta(file: File) {
  if (!file.type.startsWith('video/') && !/\.(mp4|mov|webm|m4v)$/i.test(file.name)) {
    throw new Error('请选择视频文件（mp4 / mov / webm）')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('视频过大，请选择 120MB 以内的文件')
  }
}
