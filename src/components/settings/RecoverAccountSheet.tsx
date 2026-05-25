import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/Button'
import { useUser } from '@/context/UserContext'

interface RecoverAccountSheetProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

function isValidPhone(phone: string) {
  return /^1\d{10}$/.test(phone)
}

function isValidCode(code: string) {
  return /^\d{6}$/.test(code)
}

export function RecoverAccountSheet({ open, onClose, onSuccess }: RecoverAccountSheetProps) {
  const { login } = useUser()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setPhone('')
    setCode('')
    setError('')
    setCountdown(0)
  }, [open])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = window.setTimeout(() => setCountdown((v) => v - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [countdown])

  if (!open) return null

  const sendCode = () => {
    setError('')
    if (!isValidPhone(phone)) {
      setError('请输入注册时使用的手机号')
      return
    }
    setCountdown(60)
  }

  const handleSubmit = async () => {
    setError('')
    if (!isValidPhone(phone)) {
      setError('请输入注册时使用的手机号')
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
      onClose()
      if (!needsPasswordSetup) onSuccess?.()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recover-account-title"
      onClick={onClose}
    >
      <section
        className="w-full max-w-md rounded-[var(--radius-2xl)] bg-surface p-5 shadow-[var(--shadow-card)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="recover-account-title" className="text-lg font-semibold text-text">
              找回账号
            </h2>
            <p className="mt-1 text-xs text-text-muted">通过已绑定的手机号验证后恢复登录</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg text-text-muted"
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-text-secondary">手机号</span>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={11}
            value={phone}
            onChange={(event) => setPhone(event.target.value.replace(/\D/g, ''))}
            placeholder="请输入注册手机号"
            className="w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
          />
        </label>

        <label className="mt-3 block">
          <span className="mb-1.5 block text-xs font-medium text-text-secondary">验证码</span>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
              placeholder="6 位验证码"
              className="min-w-0 flex-1 rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
            />
            <Button
              variant="outline"
              size="md"
              className="shrink-0"
              disabled={countdown > 0}
              onClick={sendCode}
            >
              {countdown > 0 ? `${countdown}s` : '获取验证码'}
            </Button>
          </div>
        </label>

        {error ? <p className="mt-3 text-xs text-red-500">{error}</p> : null}

        <Button
          fullWidth
          size="lg"
          className="mt-5"
          disabled={submitting}
          onClick={() => void handleSubmit()}
        >
          {submitting ? '验证中…' : '找回并登录'}
        </Button>
      </section>
    </div>
  )
}
