import { useCallback, useEffect, useState } from 'react'
import type { VlogClipRecord } from '@/types/vlogMaterial'
import { VLOG_MATERIALS_CHANGED } from '@/types/vlogMaterial'
import {
  getAllClipMeta,
  getClipBySceneId,
  isClipCommitted,
} from '@/utils/vlogMaterialStore'

export function useVlogMaterials() {
  const [clips, setClips] = useState<VlogClipRecord[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setClips(await getAllClipMeta())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const onChange = () => refresh()
    window.addEventListener(VLOG_MATERIALS_CHANGED, onChange)
    return () => window.removeEventListener(VLOG_MATERIALS_CHANGED, onChange)
  }, [refresh])

  const hasSceneClip = useCallback(
    (sceneId: string) => clips.some((c) => c.sceneId === sceneId),
    [clips],
  )

  const committedClips = clips.filter((c) => isClipCommitted(c))
  const hasUnsavedDrafts = clips.some((c) => !isClipCommitted(c))
  const allMaterialsSaved =
    clips.length > 0 && committedClips.length > 0 && !hasUnsavedDrafts

  return {
    clips,
    committedClips,
    loading,
    refresh,
    hasSceneClip,
    clipCount: clips.length,
    committedCount: committedClips.length,
    hasUnsavedDrafts,
    allMaterialsSaved,
  }
}

export function useSceneClip(sceneId: string | undefined) {
  const [clip, setClip] = useState<(VlogClipRecord & { blob: Blob }) | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!sceneId) {
      setClip(null)
      return
    }
    const row = await getClipBySceneId(sceneId)
    setClip(row)
  }, [sceneId])

  useEffect(() => {
    refresh()
    const onChange = () => refresh()
    window.addEventListener(VLOG_MATERIALS_CHANGED, onChange)
    return () => window.removeEventListener(VLOG_MATERIALS_CHANGED, onChange)
  }, [refresh])

  useEffect(() => {
    if (!clip?.blob) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(clip.blob)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [clip])

  return { clip, previewUrl, refresh }
}
