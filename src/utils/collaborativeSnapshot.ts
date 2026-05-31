import type { VideoClip } from '@/data/mockProject'
import type { EditorSnapshot } from '@/types/editorState'
import { resolveMediaUrl } from '@/utils/resolveMediaUrl'

/** 可跨设备同步的视频地址（非 blob） */
export function isSyncableVideoSrc(src?: string): boolean {
  if (!src) return false
  return !src.startsWith('blob:')
}

/** 解析片段可播放/可导出的 videoSrc（本地 blob 优先，否则云端 URL） */
export function resolveCollabClipVideoSrc(clip: VideoClip): string | undefined {
  if (clip.videoSrc?.startsWith('blob:')) return clip.videoSrc
  const cloud = clip.cloudVideoSrc ?? clip.videoSrc
  if (cloud && isSyncableVideoSrc(cloud)) return resolveMediaUrl(cloud)
  return clip.videoSrc
}

export function clipHasPlayableVideo(clip: VideoClip): boolean {
  return Boolean(resolveCollabClipVideoSrc(clip))
}

function mergeCollabClip(local: VideoClip | undefined, remoteClip: VideoClip): VideoClip {
  const cloudVideoSrc = remoteClip.cloudVideoSrc ?? local?.cloudVideoSrc
  let videoSrc: string | undefined
  if (local?.videoSrc?.startsWith('blob:')) {
    videoSrc = local.videoSrc
  } else if (cloudVideoSrc) {
    videoSrc = resolveMediaUrl(cloudVideoSrc)
  } else if (isSyncableVideoSrc(remoteClip.videoSrc)) {
    videoSrc = resolveMediaUrl(remoteClip.videoSrc!)
  } else {
    videoSrc = local?.videoSrc
  }

  return {
    ...remoteClip,
    cloudVideoSrc,
    videoSrc,
    thumb: local?.thumb ?? remoteClip.thumb,
    poster: local?.poster ?? remoteClip.poster,
  }
}

/** 同步时去掉 blob URL，保留云端/服务器地址 */
export function serializeSnapshotForCollab(snapshot: EditorSnapshot): EditorSnapshot {
  const videoClips = snapshot.videoClips?.map((clip) => {
    const cloudVideoSrc =
      clip.cloudVideoSrc ?? (isSyncableVideoSrc(clip.videoSrc) ? clip.videoSrc : undefined)
    return {
      ...clip,
      videoSrc: cloudVideoSrc,
      cloudVideoSrc,
    }
  })
  return {
    ...snapshot,
    videoClips,
  }
}

/** 合并远端片段元数据，保留本地 blob，并应用云端 videoSrc */
export function mergeRemoteSnapshot(
  localClips: VideoClip[],
  remote: EditorSnapshot,
): EditorSnapshot {
  const localById = new Map(localClips.map((clip) => [clip.id, clip]))
  const mergedClips = remote.videoClips?.map((remoteClip) => {
    const local = localById.get(remoteClip.id)
    return mergeCollabClip(local, remoteClip)
  })
  return {
    ...remote,
    videoClips: mergedClips ?? remote.videoClips,
  }
}

/** 将协作快照中的片段解析为可播放状态（用于加入协作时的初始加载） */
export function resolveCollabSnapshotClips(clips: VideoClip[]): VideoClip[] {
  return clips.map((clip) => ({
    ...clip,
    videoSrc: resolveCollabClipVideoSrc(clip),
  }))
}
