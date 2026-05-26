import {
  ChevronRight,
  CircleHelp,
  FilePenLine,
  Flower2,
  LogOut,
  Pencil,
  Settings,
  Shield,
  User,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomNav } from '@/components/BottomNav'
import { Button } from '@/components/Button'
import { EditProfileSheet } from '@/components/profile/EditProfileSheet'
import { LoginSheet } from '@/components/profile/LoginSheet'
import { PageShell } from '@/components/PageShell'
import { Toast } from '@/components/Toast'
import { useUser } from '@/context/UserContext'
import { useToast } from '@/hooks/useToast'

function maskPhone(phone: string) {
  if (phone.length < 7) return phone
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, isLoggedIn, logout } = useUser()
  const { message, show, visible } = useToast()
  const [loginOpen, setLoginOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const menuItems = [
    { icon: FilePenLine, label: '草稿', hint: '继续未完成的剪辑' },
    { icon: Flower2, label: '记忆花园', hint: '浏览回忆足迹' },
    { icon: Settings, label: '通用设置', hint: '通知与偏好' },
    { icon: Shield, label: '隐私与安全', hint: '账号与数据' },
  ]

  return (
    <PageShell scrollable className="pb-0">
      <header className="sticky top-0 z-10 bg-bg/90 px-4 py-3 backdrop-blur-md">
        <div className="relative flex items-center justify-center">
          <h1 className="text-lg font-semibold text-text">我的</h1>
          <button
            type="button"
            onClick={() => navigate('/help')}
            className="absolute right-0 flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface hover:text-primary active:bg-border/40"
            aria-label="帮助中心"
          >
            <CircleHelp size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 px-4 pb-4">
        <section className="rounded-[var(--radius-2xl)] bg-surface p-5 shadow-[var(--shadow-card)]">
          {isLoggedIn && user ? (
            <div className="flex flex-col items-center text-center">
              <div className="h-20 w-20 overflow-hidden rounded-full bg-gradient-to-br from-primary/25 to-primary/5 ring-2 ring-primary/15">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-2xl font-semibold text-primary">
                    {user.nickname.slice(0, 1)}
                  </span>
                )}
              </div>
              <h2 className="mt-3 text-lg font-semibold text-text">{user.nickname}</h2>
              <p className="mt-1 text-xs text-text-muted">{maskPhone(user.phone)}</p>
              <Button
                variant="soft"
                size="sm"
                className="mt-4"
                icon={<Pencil size={14} />}
                onClick={() => setEditOpen(true)}
              >
                编辑资料
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-bg text-text-muted ring-1 ring-border">
                <User size={36} strokeWidth={1.5} />
              </div>
              <p className="mt-3 text-sm text-text-secondary">登录后查看头像与昵称</p>
              <p className="mt-1 text-xs text-text-muted">同步你的回忆与个性化设置</p>
              <Button size="lg" className="mt-4" onClick={() => setLoginOpen(true)}>
                立即登录
              </Button>
            </div>
          )}
        </section>

        <section className="mt-4 overflow-hidden rounded-[var(--radius-xl)] bg-surface shadow-[var(--shadow-card)]">
          <ul>
            {menuItems.map(({ icon: Icon, label, hint }, index) => (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => {
                    if (label === '记忆花园') {
                      navigate('/garden')
                      return
                    }
                    if (label === '通用设置') {
                      navigate('/settings')
                      return
                    }
                    if (label === '草稿') {
                      navigate('/drafts')
                      return
                    }
                    if (label === '隐私与安全') {
                      navigate('/settings/privacy')
                      return
                    }
                    if (!isLoggedIn && label !== '记忆花园' && label !== '草稿') {
                      setLoginOpen(true)
                      return
                    }
                    show(`${label}即将开放`)
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-bg/80 active:bg-bg ${
                    index > 0 ? 'border-t border-border/80' : ''
                  }`}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-text">{label}</span>
                    <span className="block text-[11px] text-text-muted">{hint}</span>
                  </span>
                  <ChevronRight size={18} className="shrink-0 text-text-muted" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        {isLoggedIn && (
          <Button
            variant="outline"
            fullWidth
            className="mt-4"
            icon={<LogOut size={16} />}
            onClick={() => {
              logout()
              show('已退出登录')
            }}
          >
            退出登录
          </Button>
        )}
      </div>

      <BottomNav
        active="profile"
        gardenBadge={3}
        onChange={(tab) => {
          if (tab === 'home') navigate('/')
          else if (tab === 'create') navigate('/create')
          else if (tab === 'garden') navigate('/garden')
        }}
      />

      <LoginSheet
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={() => show('登录成功')}
      />
      <EditProfileSheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={() => show('资料已更新')}
      />

      <Toast message={message} visible={visible} />
    </PageShell>
  )
}
