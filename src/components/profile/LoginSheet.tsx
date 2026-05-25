import { Eye, EyeOff, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/Button'
import { useUser } from '@/context/UserContext'
import { hasAccountPassword } from '@/utils/accountPassword'

interface LoginSheetProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

type LoginMode = 'sms' | 'password'

function isValidPhone(phone: string) {
  return /^1\d{10}$/.test(phone)
}

function isValidCode(code: string) {
  return /^\d{6}$/.test(code)
}

function isValidPassword(password: string) {
  return password.length >= 6
}

export function LoginSheet({ open, onClose, onSuccess }: LoginSheetProps) {
  const { login, loginWithPassword } = useUser()
  const [mode, setMode] = useState<LoginMode>('sms')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setError('')
    setMode('sms')
    setPassword('')
    setShowPassword(false)
  }, [open])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [countdown])

  if (!open) return null

  const resetForm = () => {
    setPhone('')
    setCode('')
    setPassword('')
  }

  const finishLogin = (needsPasswordSetup: boolean) => {
    onClose()
    resetForm()
    if (!needsPasswordSetup) {
      onSuccess?.()
    }
  }

  const sendCode = () => {
    setError('')
    if (!isValidPhone(phone)) {
      setError('请输入正确的 11 位手机号')
      return
    }
    setCountdown(60)
  }

  const handleSmsSubmit = async () => {
    setError('')
    if (!isValidPhone(phone)) {
      setError('请输入正确的 11 位手机号')
      return
    }
    if (!isValidCode(code)) {
      setError('请输入 6 位验证码')
      return
    }

    setSubmitting(true)
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 400))
      const { needsPasswordSetup } = login(phone, undefined, {
        onPasswordSetupComplete: () => onSuccess?.(),
      })
      finishLogin(needsPasswordSetup)
    } finally {
      setSubmitting(false)
    }
  }

  const handlePasswordSubmit = async () => {
    setError('')
    if (!isValidPhone(phone)) {
      setError('请输入正确的 11 位手机号')
      return
    }
    if (!isValidPassword(password)) {
      setError('密码至少 6 位')
      return
    }
    if (!hasAccountPassword(phone)) {
      setError('该手机号尚未设置密码，请先用验证码登录')
      return
    }

    setSubmitting(true)
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 400))
      const profile = loginWithPassword(phone, password)
      if (!profile) {
        setError('手机号或密码错误')
        return
      }
      finishLogin(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = () => {
    if (mode === 'sms') void handleSmsSubmit()
    else void handlePasswordSubmit()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-sheet-title"
      onClick={onClose}
    >
      <section
        className="w-full max-w-md rounded-[var(--radius-2xl)] bg-surface p-5 shadow-[var(--shadow-card)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="login-sheet-title" className="text-lg font-semibold text-text">
              登录忆眸
            </h2>
            <p className="mt-1 text-xs text-text-muted">登录后可同步资料与个性化设置</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg text-text-muted hover:text-text"
            aria-label="关闭登录"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 flex rounded-full bg-bg p-1">
          <button
            type="button"
            onClick={() => {
              setMode('sms')
              setError('')
            }}
            className={`flex-1 rounded-full py-2 text-xs font-medium transition-colors ${
              mode === 'sms'
                ? 'bg-surface text-primary shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            验证码登录
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('password')
              setError('')
            }}
            className={`flex-1 rounded-full py-2 text-xs font-medium transition-colors ${
              mode === 'password'
                ? 'bg-surface text-primary shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            密码登录
          </button>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-text-secondary">手机号</span>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={11}
              value={phone}
              onChange={(event) => setPhone(event.target.value.replace(/\D/g, ''))}
              placeholder="请输入手机号"
              className="w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
            />
          </label>

          {mode === 'sms' ? (
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-text-secondary">验证码</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                  placeholder="6 位验证码"
                  className="min-w-0 flex-1 rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                />
                <button
                  type="button"
                  disabled={countdown > 0}
                  onClick={sendCode}
                  className="shrink-0 rounded-[var(--radius-md)] border border-primary/30 bg-primary/10 px-3 text-xs font-medium text-primary transition-colors disabled:opacity-50"
                >
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-text-muted">
                演示环境：任意 6 位数字即可登录；首次登录需设置密码
              </p>
            </label>
          ) : (
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-text-secondary">密码</span>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="请输入登录密码"
                  className="w-full rounded-[var(--radius-md)] border border-border bg-bg py-2.5 pl-3 pr-10 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') void handlePasswordSubmit()
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-text-muted hover:bg-surface"
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-text-muted">
                须先使用验证码完成首次登录并设置密码
              </p>
            </label>
          )}
        </div>

        {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

        <Button
          fullWidth
          size="lg"
          className="mt-5"
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting ? '登录中…' : '登录'}
        </Button>
      </section>
    </div>
  )
}
