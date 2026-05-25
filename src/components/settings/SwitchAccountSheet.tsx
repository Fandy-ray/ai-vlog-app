import { Check, Plus, X } from 'lucide-react'
import { useMemo } from 'react'
import { Button } from '@/components/Button'
import type { StoredAccount } from '@/utils/accountHistory'

function maskPhone(phone: string) {
  if (phone.length < 7) return phone
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`
}

interface SwitchAccountSheetProps {
  open: boolean
  currentPhone: string
  accounts: StoredAccount[]
  onClose: () => void
  onSelectAccount: (phone: string) => void
  onLoginOther: () => void
}

function AccountOption({
  account,
  isCurrent,
  onSelect,
}: {
  account: StoredAccount
  isCurrent: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isCurrent}
      className={`flex w-full items-center gap-3 rounded-[var(--radius-lg)] px-3 py-3 text-left transition-colors ${
        isCurrent
          ? 'cursor-default bg-primary/8 ring-1 ring-primary/20'
          : 'hover:bg-bg active:bg-bg'
      }`}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-base font-semibold text-primary">
        {account.avatarUrl ? (
          <img src={account.avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          account.nickname.slice(0, 1)
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-text">{account.nickname}</span>
        <span className="mt-0.5 block text-xs text-text-muted">{maskPhone(account.phone)}</span>
      </span>
      {isCurrent ? (
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
          <Check size={12} />
          当前
        </span>
      ) : (
        <span className="shrink-0 text-xs text-primary">切换</span>
      )}
    </button>
  )
}

export function SwitchAccountSheet({
  open,
  currentPhone,
  accounts,
  onClose,
  onSelectAccount,
  onLoginOther,
}: SwitchAccountSheetProps) {
  const { currentAccount, historyAccounts } = useMemo(() => {
    const current =
      accounts.find((item) => item.phone === currentPhone) ??
      accounts[0] ??
      null
    const history = accounts.filter((item) => item.phone !== currentPhone)
    return { currentAccount: current, historyAccounts: history }
  }, [accounts, currentPhone])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="switch-account-title"
      onClick={onClose}
    >
      <section
        className="flex max-h-[min(85vh,640px)] w-full max-w-md flex-col rounded-[var(--radius-2xl)] bg-surface shadow-[var(--shadow-card)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border/80 p-5 pb-4">
          <div>
            <h2 id="switch-account-title" className="text-lg font-semibold text-text">
              切换账号
            </h2>
            <p className="mt-1 text-xs text-text-muted">
              选择历史账号可快速切换，无需再次验证
            </p>
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

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {currentAccount ? (
            <div>
              <h3 className="mb-2 text-xs font-medium text-text-muted">当前登录</h3>
              <AccountOption
                account={currentAccount}
                isCurrent
                onSelect={() => undefined}
              />
            </div>
          ) : null}

          {historyAccounts.length > 0 ? (
            <div className={currentAccount ? 'mt-5' : ''}>
              <h3 className="mb-2 text-xs font-medium text-text-muted">历史登录</h3>
              <div className="space-y-2">
                {historyAccounts.map((account) => (
                  <AccountOption
                    key={account.phone}
                    account={account}
                    isCurrent={false}
                    onSelect={() => onSelectAccount(account.phone)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-center text-xs text-text-muted">
              暂无其他历史账号，可使用新手机号登录
            </p>
          )}
        </div>

        <div className="border-t border-border/80 p-5 pt-4">
          <Button
            variant="outline"
            fullWidth
            icon={<Plus size={16} />}
            onClick={onLoginOther}
          >
            使用其他账号登录
          </Button>
        </div>
      </section>
    </div>
  )
}
