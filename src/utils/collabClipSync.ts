import type { VideoClip } from '@/data/mockProject'
import { uploadCollabClip } from '@/api/collaboration'

export function clipNeedsCloudUpload(clip: VideoClip): boolean {
  return Boolean(clip.videoSrc?.startsWith('blob:') && !clip.cloudVideoSrc)
}

/** 将创建者本地 blob 片段上传到协作房间，返回更新后的 clips */
export async function syncCollabClipsToCloud(
  roomId: string,
  clips: VideoClip[],
  onProgress?: (done: number, total: number) => void,
): Promise<VideoClip[]> {
  const pending = clips.filter(clipNeedsCloudUpload)
  if (!pending.length) return clips

  let next = clips
  let done = 0
  for (const clip of pending) {
    const blobUrl = clip.videoSrc!
    const { uri } = await uploadCollabClip(roomId, clip.id, blobUrl)
    next = next.map((item) =>
      item.id === clip.id ? { ...item, cloudVideoSrc: uri } : item,
    )
    done += 1
    onProgress?.(done, pending.length)
  }
  return next
}

export function countPendingCollabUploads(clips: VideoClip[]): number {
  return clips.filter(clipNeedsCloudUpload).length
}
