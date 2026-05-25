import type { ReactNode } from 'react'

interface EditorToolPanelShellProps {
  title: string
  headerActions: ReactNode
  children: ReactNode
}

/** 编辑工具面板：与滤镜/特效条统一视觉，内容区滚动，为底部六宫格工具栏预留空间 */
export function EditorToolPanelShell({
  title,
  headerActions,
  children,
}: EditorToolPanelShellProps) {
  return (
    <section className="relative z-30 flex max-h-[min(38dvh,15.5rem)] min-h-0 shrink-0 flex-col animate-slide-up border-t border-border/80 bg-surface shadow-[0_-4px_16px_rgb(44_62_80_/4%)]">
      <header className="flex shrink-0 items-center justify-between gap-2 px-4 pb-2 pt-3">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        <div className="flex items-center gap-1">{headerActions}</div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-1">{children}</div>
    </section>
  )
}
