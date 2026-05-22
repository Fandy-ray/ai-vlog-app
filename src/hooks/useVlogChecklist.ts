import { useCallback, useEffect, useState } from 'react'
import { getActiveScenes } from '@/utils/vlogDirectorStore'
import {
  clearChecklist,
  markSceneDone,
  markSceneUndone,
  readChecklist,
  VLOG_CHECKLIST_CHANGED,
} from '@/utils/vlogChecklistStore'

export function useVlogChecklist() {
  const [completed, setCompleted] = useState<Record<string, boolean>>(readChecklist)

  const refresh = useCallback(() => {
    setCompleted(readChecklist())
  }, [])

  useEffect(() => {
    const onChange = () => refresh()
    window.addEventListener(VLOG_CHECKLIST_CHANGED, onChange)
    return () => window.removeEventListener(VLOG_CHECKLIST_CHANGED, onChange)
  }, [refresh])

  const isDone = useCallback((id: string) => !!completed[id], [completed])

  const toggle = useCallback((id: string) => {
    const data = readChecklist()
    if (data[id]) {
      markSceneUndone(id)
    } else {
      markSceneDone(id)
    }
    refresh()
  }, [refresh])

  const markDone = useCallback(
    (id: string) => {
      markSceneDone(id)
      refresh()
    },
    [refresh],
  )

  const markUndone = useCallback(
    (id: string) => {
      markSceneUndone(id)
      refresh()
    },
    [refresh],
  )

  const resetAll = useCallback(() => {
    clearChecklist()
    refresh()
  }, [refresh])

  const scenes = getActiveScenes()
  const doneCount = scenes.filter((s) => completed[s.id]).length
  const totalCount = scenes.length

  return {
    isDone,
    toggle,
    markDone,
    markUndone,
    resetAll,
    refresh,
    doneCount,
    totalCount,
  }
}

/** @deprecated 使用 clearChecklist */
export function clearVlogChecklistStorage(): void {
  clearChecklist()
}
