import type { ReactNode } from 'react'

interface PageShellProps {
  children: ReactNode
  scrollable?: boolean
  className?: string
}

export function PageShell({ children, scrollable, className = '' }: PageShellProps) {
  return (
    <main
      className={`mx-auto flex h-full w-full max-w-[430px] flex-col bg-bg ${scrollable ? 'page-scroll' : 'overflow-hidden'} ${className}`}
    >
      {children}
    </main>
  )
}
