import { ImagePlus, Loader2 } from 'lucide-react'
import { useCallback, type MouseEvent } from 'react'

interface SceneVideoImportButtonProps {
  importing?: boolean
  onImport: () => Promise<boolean>
  onSuccess?: () => void
  onError?: (message: string) => void
  variant?: 'chip' | 'row'
  className?: string
}

export function SceneVideoImportButton({
  importing,
  onImport,
  onSuccess,
  onError,
  variant = 'chip',
  className = '',
}: SceneVideoImportButtonProps) {
  const handleClick = useCallback(
    async (e: MouseEvent) => {
      e.stopPropagation()
      try {
        const ok = await onImport()
        if (ok) onSuccess?.()
      } catch (err) {
        onError?.(err instanceof Error ? err.message : '导入失败')
      }
    },
    [onImport, onSuccess, onError],
  )

  if (variant === 'row') {
    return (
      <button
        type="button"
        disabled={importing}
        onClick={(e) => void handleClick(e)}
        className={`flex shrink-0 items-center gap-1 rounded-lg bg-bg px-2.5 py-2 text-[10px] font-medium text-text-secondary ring-1 ring-border active:scale-95 disabled:opacity-50 ${className}`}
      >
        {importing ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <ImagePlus size={14} />
        )}
        导入
      </button>
    )
  }

  return (
    <button
      type="button"
      disabled={importing}
      onClick={(e) => void handleClick(e)}
      className={`inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-1 text-[10px] font-medium text-accent active:scale-95 disabled:opacity-50 ${className}`}
    >
      {importing ? (
        <Loader2 size={12} className="animate-spin" />
      ) : (
        <ImagePlus size={12} />
      )}
      从相册导入
    </button>
  )
}
