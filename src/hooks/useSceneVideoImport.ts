import { useCallback, useState } from 'react'
import { pickVideoForImport } from '@/utils/importVideoFile'
import { saveClipForScene } from '@/utils/vlogMaterialStore'

export function useSceneVideoImport(sceneId: string, sceneTitle: string) {
  const [importing, setImporting] = useState(false)

  const importFromGallery = useCallback(async (): Promise<boolean> => {
    setImporting(true)
    try {
      const prepared = await pickVideoForImport()
      if (!prepared) return false

      await saveClipForScene(sceneId, sceneTitle, prepared.blob, prepared.durationMs)
      return true
    } finally {
      setImporting(false)
    }
  }, [sceneId, sceneTitle])

  return { importing, importFromGallery }
}
