import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { PageShell } from '@/components/PageShell'

interface PromptStepLayoutProps {
  step: number
  totalSteps: number
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
  onBack: () => void
}

export function PromptStepLayout({
  step,
  totalSteps,
  title,
  subtitle,
  children,
  footer,
  onBack,
}: PromptStepLayoutProps) {
  const progress = Math.round((step / totalSteps) * 100)

  return (
    <PageShell scrollable className="pb-6">
      <header className="sticky top-0 z-10 flex items-center bg-bg/90 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface active:scale-95"
          aria-label="返回"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="flex-1 text-center text-[15px] font-semibold text-text">AI 导拍</h1>
        <span className="w-9 text-right text-[10px] tabular-nums text-text-muted">
          {step}/{totalSteps}
        </span>
      </header>

      <section className="flex-1 space-y-5 px-4">
        <div className="h-1 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div>
          <h2 className="text-lg font-bold text-text">{title}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{subtitle}</p>
        </div>

        {children}
      </section>

      <div className="sticky bottom-0 border-t border-border/80 bg-bg/95 px-4 py-4 backdrop-blur-md">
        {footer}
      </div>
    </PageShell>
  )
}
