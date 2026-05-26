export { readVideoDurationMs, pickVideoFile, validateFileMeta } from '@/utils/importVideoFileCore'
import { readVideoDurationMs, pickVideoFile, validateFileMeta } from '@/utils/importVideoFileCore'
import { assertAlbumAccessAllowed } from '@/utils/privacySettings'

/** 从相册选视频并直接导入（不自动裁剪） */
export async function pickVideoForImport(): Promise<{
  blob: Blob
  durationMs: number
} | null> {
  assertAlbumAccessAllowed()
  const file = await pickVideoFile()
  if (!file) return null

  validateFileMeta(file)
  const durationMs = await readVideoDurationMs(file)
  if (durationMs < 500) {
    throw new Error('视频过短，请选择至少 0.5 秒的视频')
  }

  return { blob: file, durationMs }
}
