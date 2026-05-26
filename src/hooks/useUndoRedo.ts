import { useCallback, useState } from 'react'

export function useUndoRedo<T>(initial: T) {
  const [history, setHistory] = useState<T[]>([initial])
  const [index, setIndex] = useState(0)

  const state = history[index]!
  const canUndo = index > 0
  const canRedo = index < history.length - 1

  const push = useCallback(
    (next: T) => {
      setHistory((h) => [...h.slice(0, index + 1), next])
      setIndex((i) => i + 1)
    },
    [index],
  )

  const undo = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : i))
  }, [])

  const redo = useCallback(() => {
    setIndex((i) => (i < history.length - 1 ? i + 1 : i))
  }, [history.length])

  const reset = useCallback((next: T) => {
    setHistory([next])
    setIndex(0)
  }, [])

  return { state, push, undo, redo, canUndo, canRedo, reset }
}
