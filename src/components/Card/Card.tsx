import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'none' | 'sm' | 'md'
  hoverable?: boolean
}

const paddingClass = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
}

export function Card({
  children,
  padding = 'md',
  hoverable,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius-xl)] bg-surface shadow-[var(--shadow-card)] ${paddingClass[padding]} ${hoverable ? 'transition-shadow hover:shadow-[var(--shadow-soft)]' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
