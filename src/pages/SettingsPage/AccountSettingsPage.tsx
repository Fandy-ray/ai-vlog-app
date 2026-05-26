import { ArrowLeft, Link2, RefreshCw, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BindAccountSheet } from '@/components/settings/BindAccountSheet'
import { RecoverAccountSheet } from '@/components/settings/RecoverAccountSheet'
import { SwitchAccountSheet } from '@/components/settings/SwitchAccountSheet'
import { LoginSheet } from '@/components/profile/LoginSheet'
import { SettingsRow, SettingsSection } from '@/components/settings/SettingsRow'
import { PageShell } from '@/components/PageShell'
import { Toast } from '@/components/Toast'
import { useUser } from '@/context/UserContext'
import { useToast } from '@/hooks/useToast'

function maskPhone(phone: string) {
  if (phone.length < 7) return phone
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`
}

export function AccountSettingsPage() {
  const navigate = useNavigate()
  const {
    user,
    isLoggedIn,
    accountHistory,
    switchAccount,
    refreshAccountHistory,
  } = useUser()
  const { message, show, visible } = useToast()
  const [bindOpen, setBindOpen] = useState(false)
  const [recoverOpen, setRecoverOpen] = useState(false)
  const [switchOpen, setSwitchOpen] = useState(false)
  const [switchLoginOpen, setSwitchLoginOpen] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) navigate('/profile', { replace: true })
  }, [isLoggedIn, navigate])

  useEffect(() => {
    if (switchOpen) refreshAccountHistory()
  }, [switchOpen, refreshAccountHistory])

  if (!user) return null

  const handleSelectHistoryAccount = (phone: string) => {
    const switched = switchAccount(phone)
    if (!switched) {
      show('该账号不可用，请重新登录')
      return
    }
    setSwitchOpen(false)
    show(`已切换至 ${maskPhone(phone)}`)
  }

  const handleLoginOther = () => {
    setSwitchOpen(false)
    setSwitchLoginOpen(true)
  }

  return (
    <PageShell scrollable className="pb-8">
      <header className="sticky top-0 z-10 flex items-center bg-bg/90 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface active:scale-95"
          aria-label="返回"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="flex-1 text-center text-[15px] font-semibold text-text">账号管理</h1>
        <span className="w-9" />
      </header>

      <div className="flex-1 px-4 pt-2">
        <p className="mb-4 rounded-[var(--radius-lg)] bg-primary/5 px-4 py-3 text-xs leading-relaxed text-text-secondary ring-1 ring-primary/10">
          当前登录：<span className="font-medium text-text">{maskPhone(user.phone)}</span>
        </p>

        <SettingsSection title="账号操作">
          <SettingsRow
            label="绑定账号"
            hint={`已绑定 ${maskPhone(user.phone)}，可换绑新手机号`}
            icon={<Link2 size={18} />}
            onClick={() => setBindOpen(true)}
          />
          <SettingsRow
            label="切换账号"
            hint="在当前账号与历史账号间快速切换"
            icon={<RefreshCw size={18} />}
            onClick={() => setSwitchOpen(true)}
            borderTop
          />
          <SettingsRow
            label="找回账号"
            hint="忘记登录方式时，通过手机号找回"
            icon={<Search size={18} />}
            onClick={() => setRecoverOpen(true)}
            borderTop
          />
        </SettingsSection>
      </div>

      <SwitchAccountSheet
        open={switchOpen}
        currentPhone={user.phone}
        accounts={accountHistory}
        onClose={() => setSwitchOpen(false)}
        onSelectAccount={handleSelectHistoryAccount}
        onLoginOther={handleLoginOther}
      />

      <BindAccountSheet
        open={bindOpen}
        onClose={() => setBindOpen(false)}
        onSuccess={() => show('账号绑定已更新')}
      />
      <RecoverAccountSheet
        open={recoverOpen}
        onClose={() => setRecoverOpen(false)}
        onSuccess={() => {
          show('账号已找回')
          navigate('/profile')
        }}
      />
      <LoginSheet
        open={switchLoginOpen}
        onClose={() => setSwitchLoginOpen(false)}
        onSuccess={() => {
          show('已登录新账号')
          setSwitchLoginOpen(false)
        }}
      />

      <Toast message={message} visible={visible} />
    </PageShell>
  )
}
