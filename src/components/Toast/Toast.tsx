interface ToastProps {
  message: string
  visible: boolean
  className?: string
}

export function Toast({ message, visible, className = '' }: ToastProps) {
  if (!visible) return null

  return (
    <section
      className={`pointer-events-none fixed left-1/2 top-20 z-50 -translate-x-1/2 animate-slide-up ${className}`}
    >
      <span className="inline-block rounded-full bg-text/90 px-3.5 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-sm">
        {message}
      </span>
    </section>
  )
}
