import { useCallback, useEffect, useState } from 'react'

export function useToast(duration = 2200) {
  const [message, setMessage] = useState('')

  const show = useCallback((msg: string) => setMessage(msg), [])
  const hide = useCallback(() => setMessage(''), [])

  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(''), duration)
    return () => clearTimeout(t)
  }, [message, duration])

  return { message, show, hide, visible: !!message }
}
