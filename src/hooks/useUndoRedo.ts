import { useCallback, useReducer } from 'react'

interface UndoState<T> {
  history: T[]
  index: number
}

type UndoAction<T> =
  | { type: 'push'; payload: T }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'reset'; payload: T }

function undoReducer<T>(state: UndoState<T>, action: UndoAction<T>): UndoState<T> {
  switch (action.type) {
    case 'push': {
      const nextHistory = [
        ...state.history.slice(0, state.index + 1),
        action.payload,
      ]
      return { history: nextHistory, index: nextHistory.length - 1 }
    }
    case 'undo':
      return { ...state, index: Math.max(0, state.index - 1) }
    case 'redo':
      return {
        ...state,
        index: Math.min(state.history.length - 1, state.index + 1),
      }
    case 'reset':
      return { history: [action.payload], index: 0 }
    default:
      return state
  }
}

export function useUndoRedo<T>(initial: T) {
  const [{ history, index }, dispatch] = useReducer(undoReducer<T>, {
    history: [initial],
    index: 0,
  })

  const state = history[index]!
  const canUndo = index > 0
  const canRedo = index < history.length - 1

  const push = useCallback((next: T) => {
    dispatch({ type: 'push', payload: next })
  }, [])

  const undo = useCallback(() => {
    dispatch({ type: 'undo' })
  }, [])

  const redo = useCallback(() => {
    dispatch({ type: 'redo' })
  }, [])

  const reset = useCallback((next: T) => {
    dispatch({ type: 'reset', payload: next })
  }, [])

  return { state, push, undo, redo, canUndo, canRedo, reset }
}
