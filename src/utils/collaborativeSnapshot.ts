import type { VideoClip } from '@/data/mockProject'
import type { EditorSnapshot } from '@/types/editorState'

/** 同步时去掉 blob URL，避免跨设备无效数据 */
export function serializeSnapshotForCollab(snapshot: EditorSnapshot): EditorSnapshot {
  const videoClips = snapshot.videoClips?.map((clip) => ({
    ...clip,
    videoSrc: clip.videoSrc?.startsWith('blob:') ? undefined : clip.videoSrc,
  }))
  return {
    ...snapshot,
    videoClips,
  }
}

/** 合并远端片段元数据，保留本地 videoSrc */
export function mergeRemoteSnapshot(
  localClips: VideoClip[],
  remote: EditorSnapshot,
): EditorSnapshot {
  const localById = new Map(localClips.map((clip) => [clip.id, clip]))
  const mergedClips = remote.videoClips?.map((remoteClip) => {
    const local = localById.get(remoteClip.id)
    return {
      ...remoteClip,
      videoSrc: local?.videoSrc ?? remoteClip.videoSrc,
      thumb: local?.thumb ?? remoteClip.thumb,
      poster: local?.poster ?? remoteClip.poster,
    }
  })
  return {
    ...remote,
    videoClips: mergedClips ?? remote.videoClips,
  }
}
