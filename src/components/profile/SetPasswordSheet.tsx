import { Eye, EyeOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/Button'
import { setAccountPassword } from '@/utils/accountPassword'

interface SetPasswordSheetProps {
  open: boolean
  phone: string
  onComplete: () => void
}

function maskPhone(phone: string) {
  if (phone.length < 7) return phone
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`
}

function isValidPassword(password: string) {
  return password.length >= 6
}

export function SetPasswordSheet({ open, phone, onComplete }: SetPasswordSheetProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setPassword('')
    setConfirmPassword('')
    setError('')
    setShowPassword(false)
    setShowConfirm(false)
  }, [open, phone])

  if (!open) return null

  const handleSubmit = async () => {
    setError('')
    if (!isValidPassword(password)) {
      setError('密码至少 6 位')
      return
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    setSubmitting(true)
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 300))
      setAccountPassword(phone, password)
      onComplete()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="set-password-title"
    >
      <section
        className="w-full max-w-md rounded-[var(--radius-2xl)] bg-surface p-5 shadow-[var(--shadow-card)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="set-password-title" className="text-lg font-semibold text-text">
              设置登录密码
            </h2>
            <p className="mt-1 text-xs text-text-muted">
              为账号 {maskPhone(phone)} 设置密码，之后可使用密码快速登录
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-text-secondary">新密码</span>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="至少 6 位"
                className="w-full rounded-[var(--radius-md)] border border-border bg-bg py-2.5 pl-3 pr-10 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-text-muted"
                aria-label={showPassword ? '隐藏密码' : '显示密码'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-text-secondary">确认密码</span>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="再次输入密码"
                className="w-full rounded-[var(--radius-md)] border border-border bg-bg py-2.5 pl-3 pr-10 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void handleSubmit()
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-text-muted"
                aria-label={showConfirm ? '隐藏密码' : '显示密码'}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>
        </div>

        {error ? <p className="mt-3 text-xs text-red-500">{error}</p> : null}

        <Button
          fullWidth
          size="lg"
          className="mt-5"
          disabled={submitting}
          onClick={() => void handleSubmit()}
        >
          {submitting ? '保存中…' : '完成设置'}
        </Button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => onComplete()}
          className="mt-3 w-full py-2 text-center text-sm text-text-muted transition-colors hover:text-primary disabled:opacity-50"
        >
          稍后设置
        </button>
      </section>
    </div>
  )
}
