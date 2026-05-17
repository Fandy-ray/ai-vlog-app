interface ToastProps {
  message: string
  visible: boolean
}

export function Toast({ message, visible }: ToastProps) {
  if (!visible) return null

  return (
    <section className="pointer-events-none fixed left-1/2 top-20 z-50 -translate-x-1/2 animate-slide-up">
      <span className="inline-block rounded-full bg-text/90 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm">
        {message}
      </span>
    </section>
  )
}
