import { Scissors } from 'lucide-react'

interface TrimClipButtonProps {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'light' | 'dark' | 'surface'
  className?: string
}

export function TrimClipButton({
  onClick,
  disabled = false,
  loading = false,
  variant = 'surface',
  className = '',
}: TrimClipButtonProps) {
  const styles =
    variant === 'light'
      ? 'bg-white/15 text-white ring-1 ring-white/25'
      : variant === 'dark'
        ? 'bg-black/55 text-white backdrop-blur-sm'
        : 'bg-primary/10 text-primary ring-1 ring-primary/20'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-medium transition-transform active:scale-95 disabled:opacity-50 ${styles} ${className}`}
    >
      <Scissors size={14} />
      {loading ? '裁剪中…' : '裁剪片段'}
    </button>
  )
}
