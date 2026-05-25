import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '@/components/PageShell'
import {
  PRIVACY_POLICY_SECTIONS,
  PRIVACY_POLICY_VERSION,
} from '@/data/privacyPolicy'

export function PrivacyPolicyPage() {
  const navigate = useNavigate()

  return (
    <PageShell scrollable className="pb-8">
      <header className="sticky top-0 z-10 flex items-center bg-bg/90 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate('/settings/privacy')}
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface active:scale-95"
          aria-label="返回"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="flex-1 text-center text-[15px] font-semibold text-text">隐私政策</h1>
        <span className="w-9" />
      </header>

      <article className="flex-1 space-y-5 px-4 pt-2">
        <p className="text-xs text-text-muted">版本 {PRIVACY_POLICY_VERSION}</p>

        {PRIVACY_POLICY_SECTIONS.map((section) => (
          <section
            key={section.title}
            className="rounded-[var(--radius-xl)] bg-surface p-4 shadow-[var(--shadow-card)]"
          >
            <h2 className="text-sm font-semibold text-text">{section.title}</h2>
            <div className="mt-2 space-y-2">
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 24)}
                  className="text-xs leading-relaxed text-text-secondary"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </article>
    </PageShell>
  )
}
