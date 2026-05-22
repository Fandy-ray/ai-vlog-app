import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { OVERLAY_CONTEXT_MENU_ATTR } from '@/utils/editorSelectionHitTest'

export type OverlayMenuAction = 'edit' | 'copy' | 'cut' | 'delete' | 'paste'

interface OverlayContextMenuProps {
  x: number
  y: number
  items: OverlayMenuAction[]
  onAction: (action: OverlayMenuAction) => void
  onClose: () => void
}

const MENU_LABELS: Record<OverlayMenuAction, string> = {
  edit: '编辑',
  copy: '复制',
  cut: '剪切',
  delete: '删除',
  paste: '粘贴',
}

export function OverlayContextMenu({ x, y, items, onAction, onClose }: OverlayContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ left: x, top: y })

  useLayoutEffect(() => {
    const el = menuRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const margin = 8
    let left = x
    let top = y
    if (left + rect.width > window.innerWidth - margin) {
      left = Math.max(margin, window.innerWidth - rect.width - margin)
    }
    if (top + rect.height > window.innerHeight - margin) {
      top = Math.max(margin, window.innerHeight - rect.height - margin)
    }
    setPosition({ left, top })
  }, [x, y])

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return
      onClose()
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('pointerdown', handlePointerDown, true)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, true)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return createPortal(
    <div
      {...{ [OVERLAY_CONTEXT_MENU_ATTR]: '' }}
      ref={menuRef}
      role="menu"
      className="fixed z-[200] min-w-[7.5rem] overflow-hidden rounded-[var(--radius-md)] border border-border/80 bg-surface py-1 shadow-[var(--shadow-card)]"
      style={{ left: position.left, top: position.top }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((action) => (
        <button
          key={action}
          type="button"
          role="menuitem"
          className={`block w-full px-3 py-2 text-left text-xs transition-colors hover:bg-bg active:bg-bg ${
            action === 'delete' ? 'text-red-600' : 'text-text'
          }`}
          onClick={() => {
            onAction(action)
            onClose()
          }}
        >
          {MENU_LABELS[action]}
        </button>
      ))}
    </div>,
    document.body,
  )
}
