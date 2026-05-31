export type VerificationCodePurpose = 'login' | 'bind-account' | 'recover-account'

interface VerificationCodeRecord {
  phone: string
  purpose: VerificationCodePurpose
  code: string
  createdAt: number
  expiresAt: number
  attempts: number
}

interface RequestVerificationCodeSuccess {
  ok: true
  code: string
  expiresAt: number
  cooldownSeconds: number
  message: string
}

interface RequestVerificationCodeFailure {
  ok: false
  message: string
}

interface VerifyVerificationCodeSuccess {
  ok: true
}

interface VerifyVerificationCodeFailure {
  ok: false
  message: string
}

export type RequestVerificationCodeResult =
  | RequestVerificationCodeSuccess
  | RequestVerificationCodeFailure

export type VerifyVerificationCodeResult =
  | VerifyVerificationCodeSuccess
  | VerifyVerificationCodeFailure

const STORAGE_KEY = 'memento-verification-codes'
const CODE_TTL_MS = 5 * 60 * 1000
const CODE_COOLDOWN_MS = 60 * 1000
const MAX_ATTEMPTS = 5

export function isValidVerificationPhone(phone: string) {
  return /^1\d{10}$/.test(phone.trim())
}

function normalizePhone(phone: string) {
  return phone.trim()
}

function normalizeCode(code: string) {
  return code.replace(/\D/g, '')
}

function recordKey(phone: string, purpose: VerificationCodePurpose) {
  return `${purpose}:${normalizePhone(phone)}`
}

function isVerificationCodeRecord(value: unknown): value is VerificationCodeRecord {
  if (!value || typeof value !== 'object') return false
  const record = value as VerificationCodeRecord
  return (
    typeof record.phone === 'string' &&
    typeof record.code === 'string' &&
    typeof record.createdAt === 'number' &&
    typeof record.expiresAt === 'number' &&
    typeof record.attempts === 'number' &&
    ['login', 'bind-account', 'recover-account'].includes(record.purpose)
  )
}

function loadRecords(): Record<string, VerificationCodeRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}

    return Object.entries(parsed as Record<string, unknown>).reduce<
      Record<string, VerificationCodeRecord>
    >((acc, [key, value]) => {
      if (isVerificationCodeRecord(value)) acc[key] = value
      return acc
    }, {})
  } catch {
    return {}
  }
}

function persistRecords(records: Record<string, VerificationCodeRecord>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    // ignore quota errors
  }
}

function pruneExpiredRecords(
  records: Record<string, VerificationCodeRecord>,
  now: number,
) {
  return Object.entries(records).reduce<Record<string, VerificationCodeRecord>>(
    (acc, [key, record]) => {
      if (record.expiresAt > now) acc[key] = record
      return acc
    },
    {},
  )
}

function generateCode() {
  if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
    return String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0')
  }

  const bytes = new Uint32Array(1)
  crypto.getRandomValues(bytes)
  return String(bytes[0] % 1_000_000).padStart(6, '0')
}

export function requestVerificationCode(
  phoneValue: string,
  purpose: VerificationCodePurpose,
): RequestVerificationCodeResult {
  const phone = normalizePhone(phoneValue)
  if (!isValidVerificationPhone(phone)) {
    return { ok: false, message: '请输入正确的 11 位手机号' }
  }

  const now = Date.now()
  const key = recordKey(phone, purpose)
  const records = pruneExpiredRecords(loadRecords(), now)
  const current = records[key]

  if (current && current.createdAt + CODE_COOLDOWN_MS > now) {
    const cooldownSeconds = Math.ceil((current.createdAt + CODE_COOLDOWN_MS - now) / 1000)
    persistRecords(records)
    return {
      ok: true,
      code: current.code,
      expiresAt: current.expiresAt,
      cooldownSeconds,
      message: `验证码已发送，${cooldownSeconds} 秒后可重发`,
    }
  }

  const code = generateCode()
  const record: VerificationCodeRecord = {
    phone,
    purpose,
    code,
    createdAt: now,
    expiresAt: now + CODE_TTL_MS,
    attempts: 0,
  }
  records[key] = record
  persistRecords(records)

  return {
    ok: true,
    code,
    expiresAt: record.expiresAt,
    cooldownSeconds: CODE_COOLDOWN_MS / 1000,
    message: '验证码已发送',
  }
}

export function verifyVerificationCode(
  phoneValue: string,
  purpose: VerificationCodePurpose,
  codeValue: string,
): VerifyVerificationCodeResult {
  const phone = normalizePhone(phoneValue)
  const code = normalizeCode(codeValue)

  if (!isValidVerificationPhone(phone)) {
    return { ok: false, message: '请输入正确的 11 位手机号' }
  }
  if (!/^\d{6}$/.test(code)) {
    return { ok: false, message: '请输入 6 位验证码' }
  }

  const now = Date.now()
  const key = recordKey(phone, purpose)
  const records = pruneExpiredRecords(loadRecords(), now)
  const record = records[key]

  if (!record) {
    persistRecords(records)
    return { ok: false, message: '请先获取验证码' }
  }

  if (record.expiresAt <= now) {
    delete records[key]
    persistRecords(records)
    return { ok: false, message: '验证码已过期，请重新获取' }
  }

  if (record.code !== code) {
    const attempts = record.attempts + 1
    const remainingAttempts = MAX_ATTEMPTS - attempts

    if (remainingAttempts <= 0) {
      delete records[key]
      persistRecords(records)
      return { ok: false, message: '验证码错误次数过多，请重新获取' }
    }

    records[key] = { ...record, attempts }
    persistRecords(records)
    return { ok: false, message: `验证码错误，还可尝试 ${remainingAttempts} 次` }
  }

  delete records[key]
  persistRecords(records)
  return { ok: true }
}
