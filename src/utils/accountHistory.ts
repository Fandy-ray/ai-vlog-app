import type { UserProfile } from '@/types/user'

export interface StoredAccount extends UserProfile {
  lastUsedAt: number
}

const HISTORY_KEY = 'memento-account-history'
const MAX_HISTORY = 10

function loadHistoryRaw(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is StoredAccount =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as StoredAccount).phone === 'string' &&
        typeof (item as StoredAccount).nickname === 'string',
    )
  } catch {
    return []
  }
}

function persistHistory(accounts: StoredAccount[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(accounts.slice(0, MAX_HISTORY)))
  } catch {
    // ignore quota errors
  }
}

export function upsertAccountHistory(profile: UserProfile) {
  const now = Date.now()
  const entry: StoredAccount = {
    ...profile,
    lastUsedAt: now,
  }

  const rest = loadHistoryRaw().filter((item) => item.phone !== profile.phone)
  const next = [entry, ...rest].sort((a, b) => b.lastUsedAt - a.lastUsedAt)
  persistHistory(next)
}

export function getAccountHistory(): StoredAccount[] {
  return loadHistoryRaw().sort((a, b) => b.lastUsedAt - a.lastUsedAt)
}

export function getStoredAccountByPhone(phone: string): StoredAccount | null {
  return loadHistoryRaw().find((item) => item.phone === phone) ?? null
}

export function touchAccountHistory(phone: string) {
  const account = getStoredAccountByPhone(phone)
  if (!account) return
  upsertAccountHistory(account)
}
