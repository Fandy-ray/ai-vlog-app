import { ArrowLeft, KeyRound, Smartphone, UserCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EditProfileSheet } from '@/components/profile/EditProfileSheet'
import { SettingsRow, SettingsSection } from '@/components/settings/SettingsRow'
import { PageShell } from '@/components/PageShell'
import { Toast } from '@/components/Toast'
import { useUser } from '@/context/UserContext'
import { useToast } from '@/hooks/useToast'

function maskPhone(phone: string) {
  if (phone.length < 7) return phone
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`
}

export function SettingsPage() {
  const navigate = useNavigate()
  const { user, isLoggedIn } = useUser()
  const { message, show, visible } = useToast()
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) navigate('/profile', { replace: true })
  }, [isLoggedIn, navigate])

  if (!user) return null

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
        <h1 className="flex-1 text-center text-[15px] font-semibold text-text">通用设置</h1>
        <span className="w-9" />
      </header>

      <div className="flex-1 space-y-5 px-4 pt-2">
        <SettingsSection title="账号管理">
          <SettingsRow
            label="账号管理"
            hint="绑定、切换与找回账号"
            icon={<KeyRound size={18} />}
            onClick={() => navigate('/settings/account')}
          />
        </SettingsSection>

        <SettingsSection title="个人信息">
          <SettingsRow
            label="头像与昵称"
            hint="修改展示资料"
            icon={<UserCircle size={18} />}
            value={user.nickname}
            onClick={() => setEditOpen(true)}
          />
          <SettingsRow
            label="手机号"
            hint="登录与账号安全使用"
            icon={<Smartphone size={18} />}
            value={maskPhone(user.phone)}
            showChevron={false}
            borderTop
          />
        </SettingsSection>
      </div>

      <EditProfileSheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={() => show('资料已更新')}
      />

      <Toast message={message} visible={visible} />
    </PageShell>
  )
}
