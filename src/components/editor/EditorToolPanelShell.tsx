import type { ReactNode } from 'react'

interface EditorToolPanelShellProps {
  title: string
  headerActions: ReactNode
  children: ReactNode
}

/** 编辑工具面板外壳：固定标题栏 + 可滚动内容区，不占用底部工具栏空间 */
export function EditorToolPanelShell({
  title,
  headerActions,
  children,
}: EditorToolPanelShellProps) {
  return (
    <section className="flex max-h-[min(42vh,22rem)] min-h-0 shrink-0 flex-col border-t border-border/80 bg-surface shadow-[0_-4px_16px_rgb(44_62_80_/4%)]">
      <header className="flex shrink-0 items-center justify-between gap-2 px-4 pb-2 pt-3">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        <div className="flex items-center gap-1">{headerActions}</div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
    </section>
  )
}
