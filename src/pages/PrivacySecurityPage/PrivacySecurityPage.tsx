import { ArrowLeft, FileText, SlidersHorizontal } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SettingsRow, SettingsSection } from '@/components/settings/SettingsRow'
import { PageShell } from '@/components/PageShell'
import { useUser } from '@/context/UserContext'

export function PrivacySecurityPage() {
  const navigate = useNavigate()
  const { isLoggedIn } = useUser()

  useEffect(() => {
    if (!isLoggedIn) navigate('/profile', { replace: true })
  }, [isLoggedIn, navigate])

  return (
    <PageShell scrollable className="pb-8">
      <header className="sticky top-0 z-10 flex items-center bg-bg/90 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface active:scale-95"
          aria-label="返回"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="flex-1 text-center text-[15px] font-semibold text-text">隐私与安全</h1>
        <span className="w-9" />
      </header>

      <div className="flex-1 space-y-5 px-4 pt-2">
        <p className="rounded-[var(--radius-lg)] bg-primary/5 px-4 py-3 text-xs leading-relaxed text-text-secondary ring-1 ring-primary/10">
          管理你的隐私偏好、查看政策说明，并了解本地素材与共同编辑的数据处理方式。
        </p>

        <SettingsSection title="隐私">
          <SettingsRow
            label="隐私政策"
            hint="了解我们如何收集与使用信息"
            icon={<FileText size={18} />}
            onClick={() => navigate('/settings/privacy/policy')}
          />
          <SettingsRow
            label="隐私设置"
            hint="数据收集、推荐与协作展示"
            icon={<SlidersHorizontal size={18} />}
            onClick={() => navigate('/settings/privacy/preferences')}
            borderTop
          />
        </SettingsSection>
      </div>
    </PageShell>
  )
}
