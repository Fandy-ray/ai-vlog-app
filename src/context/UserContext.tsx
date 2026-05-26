import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { SetPasswordSheet } from '@/components/profile/SetPasswordSheet'
import type { UserProfile } from '@/types/user'
import {
  getAccountHistory,
  getStoredAccountByPhone,
  upsertAccountHistory,
  type StoredAccount,
} from '@/utils/accountHistory'
import { hasAccountPassword, verifyAccountPassword } from '@/utils/accountPassword'

const STORAGE_KEY = 'memento-user-session'

function loadUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as UserProfile
    if (!parsed?.id || !parsed.phone || !parsed.nickname) return null
    return parsed
  } catch {
    return null
  }
}

function persistUser(user: UserProfile | null) {
  try {
    if (!user) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } catch {
    // ignore quota errors
  }
}

function createUserId() {
  return `user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function profileFromStored(stored: StoredAccount): UserProfile {
  const { lastUsedAt: _, ...profile } = stored
  return profile
}

function resolveProfile(phone: string, nickname?: string): UserProfile {
  const stored = getStoredAccountByPhone(phone)
  if (stored) {
    const profile = profileFromStored(stored)
    if (nickname?.trim()) {
      return { ...profile, nickname: nickname.trim() }
    }
    return profile
  }

  return {
    id: createUserId(),
    phone,
    nickname: nickname?.trim() || `忆眸用户${phone.slice(-4)}`,
    avatarUrl: null,
    createdAt: Date.now(),
  }
}

export interface LoginResult {
  profile: UserProfile
  needsPasswordSetup: boolean
}

export interface LoginOptions {
  /** 首次登录完成设置密码后调用 */
  onPasswordSetupComplete?: () => void
}

interface UserContextValue {
  user: UserProfile | null
  isLoggedIn: boolean
  accountHistory: StoredAccount[]
  pendingPasswordSetup: boolean
  login: (phone: string, nickname?: string, options?: LoginOptions) => LoginResult
  loginWithPassword: (phone: string, password: string) => UserProfile | null
  switchAccount: (phone: string) => UserProfile | null
  logout: () => void
  updateProfile: (patch: { nickname?: string; avatarUrl?: string | null }) => void
  refreshAccountHistory: () => void
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const session = loadUser()
    if (session) upsertAccountHistory(session)
    return session
  })
  const [accountHistory, setAccountHistory] = useState<StoredAccount[]>(() =>
    getAccountHistory(),
  )
  const [pendingPasswordPhone, setPendingPasswordPhone] = useState<string | null>(null)
  const passwordSetupCallbackRef = useRef<(() => void) | null>(null)

  const refreshAccountHistory = useCallback(() => {
    setAccountHistory(getAccountHistory())
  }, [])

  const applySession = useCallback(
    (profile: UserProfile) => {
      setUser(profile)
      persistUser(profile)
      upsertAccountHistory(profile)
      refreshAccountHistory()
      return profile
    },
    [refreshAccountHistory],
  )

  const login = useCallback(
    (phone: string, nickname?: string, options?: LoginOptions): LoginResult => {
      const needsPasswordSetup = !hasAccountPassword(phone)
      const next = applySession(resolveProfile(phone, nickname))

      if (needsPasswordSetup) {
        setPendingPasswordPhone(phone)
        passwordSetupCallbackRef.current = options?.onPasswordSetupComplete ?? null
      }

      return { profile: next, needsPasswordSetup }
    },
    [applySession],
  )

  const completePasswordSetup = useCallback(() => {
    setPendingPasswordPhone(null)
    const callback = passwordSetupCallbackRef.current
    passwordSetupCallbackRef.current = null
    callback?.()
  }, [])

  const loginWithPassword = useCallback(
    (phone: string, password: string) => {
      if (!verifyAccountPassword(phone, password)) return null
      const next = resolveProfile(phone)
      return applySession(next)
    },
    [applySession],
  )

  const switchAccount = useCallback(
    (phone: string) => {
      if (user?.phone === phone) return user

      const stored = getStoredAccountByPhone(phone)
      if (!stored) return null

      return applySession(profileFromStored(stored))
    },
    [applySession, user],
  )

  const logout = useCallback(() => {
    setUser(null)
    persistUser(null)
    setPendingPasswordPhone(null)
    passwordSetupCallbackRef.current = null
  }, [])

  const updateProfile = useCallback(
    (patch: { nickname?: string; avatarUrl?: string | null }) => {
      setUser((prev) => {
        if (!prev) return prev
        const next: UserProfile = {
          ...prev,
          ...(patch.nickname !== undefined ? { nickname: patch.nickname.trim() } : {}),
          ...(patch.avatarUrl !== undefined ? { avatarUrl: patch.avatarUrl } : {}),
        }
        persistUser(next)
        upsertAccountHistory(next)
        refreshAccountHistory()
        return next
      })
    },
    [refreshAccountHistory],
  )

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: !!user,
      accountHistory,
      pendingPasswordSetup: !!pendingPasswordPhone,
      login,
      loginWithPassword,
      switchAccount,
      logout,
      updateProfile,
      refreshAccountHistory,
    }),
    [
      user,
      accountHistory,
      pendingPasswordPhone,
      login,
      loginWithPassword,
      switchAccount,
      logout,
      updateProfile,
      refreshAccountHistory,
    ],
  )

  return (
    <UserContext.Provider value={value}>
      {children}
      <SetPasswordSheet
        open={!!pendingPasswordPhone}
        phone={pendingPasswordPhone ?? ''}
        onComplete={completePasswordSetup}
      />
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) {
    throw new Error('useUser must be used within UserProvider')
  }
  return ctx
}
