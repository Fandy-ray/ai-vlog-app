import { useCallback, useEffect, useState } from 'react'
import type { VlogScene } from '@/data/vlogGuide'
import type { VlogDirectorSession } from '@/types/vlogDirector'
import {
  getActiveScenes,
  getDirectorStyleId,
  loadDirectorSession,
} from '@/utils/vlogDirectorStore'

export function useVlogDirector() {
  const [session, setSession] = useState<VlogDirectorSession | null>(null)
  const [scenes, setScenes] = useState<VlogScene[]>([])

  const refresh = useCallback(() => {
    const s = loadDirectorSession()
    setSession(s)
    setScenes(getActiveScenes())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    session,
    scenes,
    styleId: getDirectorStyleId(),
    hasSession: !!session?.scenes?.length,
    refresh,
  }
}
