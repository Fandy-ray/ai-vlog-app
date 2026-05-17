import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost' | 'soft'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  icon?: ReactNode
  children: ReactNode
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white shadow-[var(--shadow-soft)] hover:bg-primary-dark active:scale-[0.98]',
  accent:
    'bg-accent text-white shadow-[0_4px_16px_rgb(255_179_87/35%)] hover:brightness-105 active:scale-[0.98]',
  outline:
    'border border-border bg-surface text-text hover:border-primary/40 hover:text-primary',
  ghost: 'bg-transparent text-text-secondary hover:bg-white hover:text-text',
  soft: 'bg-primary/10 text-primary hover:bg-primary/15',
}

const sizeClass: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-full gap-1',
  md: 'px-4 py-2 text-sm rounded-full gap-1.5',
  lg: 'px-5 py-2.5 text-[15px] rounded-[var(--radius-lg)] gap-2',
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  icon,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center font-medium transition-all disabled:opacity-50 ${variantClass[variant]} ${sizeClass[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
