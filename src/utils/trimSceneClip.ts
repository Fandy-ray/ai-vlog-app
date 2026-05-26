import { requestVideoTrim } from '@/utils/videoTrimFlow'
import { getClipBySceneId, saveClipForScene } from '@/utils/vlogMaterialStore'

/** 对已有场景素材打开裁剪（可选操作，非上传必经） */
export async function trimExistingSceneClip(
  sceneId: string,
  sceneTitle: string,
): Promise<boolean> {
  const clip = await getClipBySceneId(sceneId)
  if (!clip) return false

  const file = new File([clip.blob], clip.name || `${sceneTitle}.mp4`, {
    type: clip.mimeType || 'video/mp4',
  })

  const result = await requestVideoTrim({ file, sceneTitle })
  if (!result) return false

  await saveClipForScene(sceneId, sceneTitle, result.blob, result.durationMs)
  return true
}
