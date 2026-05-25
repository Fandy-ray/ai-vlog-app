import { Check, Copy, Users, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/Button'
import type { CollaborativeUser } from '@/types/collaborative'

interface CollaborativeEditingSheetProps {
  open: boolean
  onClose: () => void
  isOwner: boolean
  active: boolean
  enabled: boolean
  inviteCode: string | null
  joinUrl: string | null
  presence: CollaborativeUser[]
  connectionState: string
  error: string | null
  onEnable: () => Promise<void>
  onToggleEnabled: (enabled: boolean) => Promise<void>
  onJoin: (code: string) => Promise<void>
  onLeave: () => Promise<void>
  onCloseRoom: () => Promise<void>
}

export function CollaborativeEditingSheet({
  open,
  onClose,
  isOwner,
  active,
  enabled,
  inviteCode,
  joinUrl,
  presence,
  connectionState,
  error,
  onEnable,
  onToggleEnabled,
  onJoin,
  onLeave,
  onCloseRoom,
}: CollaborativeEditingSheetProps) {
  const [joinCode, setJoinCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (!open) return
    setJoinCode('')
    setLocalError('')
    setCopied(null)
  }, [open])

  if (!open) return null

  const run = async (task: () => Promise<void>) => {
    setBusy(true)
    setLocalError('')
    try {
      await task()
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : '操作失败')
    } finally {
      setBusy(false)
    }
  }

  const copyText = async (text: string, kind: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(kind)
      window.setTimeout(() => setCopied(null), 1600)
    } catch {
      setLocalError('复制失败，请手动复制')
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="共同编辑"
        className="w-full max-w-[430px] rounded-[var(--radius-2xl)] bg-surface p-5 shadow-[var(--shadow-hero)]"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-text">
              <Users size={18} className="text-primary" />
              共同编辑
            </h2>
            <p className="mt-1 text-xs text-text-muted">
              开启后，他人可通过邀请码进入并同步编辑滤镜、文字、贴纸等设置
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:bg-bg"
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </div>

        {(error || localError) && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
            {localError || error}
          </p>
        )}

        {!active ? (
          <div className="space-y-4">
            <section className="rounded-[var(--radius-lg)] bg-bg p-4">
              <p className="text-sm font-medium text-text">我是创建者</p>
              <p className="mt-1 text-xs text-text-muted">
                开启共同编辑权限，生成邀请码供他人加入
              </p>
              <Button
                fullWidth
                className="mt-3"
                disabled={busy}
                onClick={() => void run(onEnable)}
              >
                开启共同编辑
              </Button>
            </section>

            <section className="rounded-[var(--radius-lg)] border border-border p-4">
              <p className="text-sm font-medium text-text">我是协作者</p>
              <p className="mt-1 text-xs text-text-muted">输入邀请码加入他人项目</p>
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="例如 A1B2C3"
                className="mt-3 w-full rounded-[var(--radius-md)] border border-border bg-white px-3 py-2 text-sm uppercase tracking-widest outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
              <Button
                variant="outline"
                fullWidth
                className="mt-3"
                disabled={busy || !joinCode.trim()}
                onClick={() => void run(() => onJoin(joinCode.trim()))}
              >
                加入协作
              </Button>
            </section>
          </div>
        ) : (
          <div className="space-y-4">
            <section className="rounded-[var(--radius-lg)] bg-primary/5 p-4 ring-1 ring-primary/10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-text">
                    {isOwner ? '共同编辑权限' : '协作状态'}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {connectionState === 'connected' ? '已连接' : '连接中…'}
                    {isOwner && ` · ${enabled ? '已开放' : '已关闭'}`}
                  </p>
                </div>
                {isOwner && (
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={enabled}
                      disabled={busy}
                      onChange={(e) => void run(() => onToggleEnabled(e.target.checked))}
                    />
                    <span className="h-7 w-12 rounded-full bg-border transition-colors peer-checked:bg-primary" />
                    <span className="absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                  </label>
                )}
              </div>
            </section>

            {inviteCode && (
              <section className="space-y-2">
                <p className="text-xs font-medium text-text-secondary">邀请码</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-[var(--radius-md)] bg-bg px-3 py-2 text-center text-lg font-semibold tracking-[0.3em] text-primary">
                    {inviteCode}
                  </code>
                  <button
                    type="button"
                    onClick={() => void copyText(inviteCode, 'code')}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-bg text-text-secondary hover:text-primary"
                    aria-label="复制邀请码"
                  >
                    {copied === 'code' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                {joinUrl && (
                  <Button
                    variant="soft"
                    fullWidth
                    onClick={() => void copyText(joinUrl, 'link')}
                  >
                    {copied === 'link' ? '链接已复制' : '复制邀请链接'}
                  </Button>
                )}
              </section>
            )}

            <section>
              <p className="mb-2 text-xs font-medium text-text-secondary">
                在线协作者（{presence.length}）
              </p>
              <ul className="space-y-2">
                {presence.map((user) => (
                  <li
                    key={user.userId}
                    className="flex items-center justify-between rounded-[var(--radius-md)] bg-bg px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-text">{user.userName}</span>
                    <span className="text-xs text-text-muted">
                      {user.role === 'owner' ? '创建者' : '协作者'}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <div className="flex gap-2 pt-1">
              {isOwner ? (
                <Button
                  variant="outline"
                  fullWidth
                  disabled={busy}
                  onClick={() => void run(onCloseRoom)}
                >
                  结束协作
                </Button>
              ) : (
                <Button
                  variant="outline"
                  fullWidth
                  disabled={busy}
                  onClick={() => void run(onLeave)}
                >
                  退出协作
                </Button>
              )}
              {isOwner && (
                <Button
                  variant="ghost"
                  fullWidth
                  disabled={busy}
                  onClick={() => void run(() => onToggleEnabled(false))}
                >
                  仅关闭权限
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
