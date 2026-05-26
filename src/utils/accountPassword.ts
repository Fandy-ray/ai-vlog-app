const PASSWORDS_KEY = 'memento-account-passwords'

type PasswordMap = Record<string, string>

function loadPasswordMap(): PasswordMap {
  try {
    const raw = localStorage.getItem(PASSWORDS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as PasswordMap
  } catch {
    return {}
  }
}

function persistPasswordMap(map: PasswordMap) {
  try {
    localStorage.setItem(PASSWORDS_KEY, JSON.stringify(map))
  } catch {
    // ignore quota errors
  }
}

export function hasAccountPassword(phone: string): boolean {
  return Boolean(loadPasswordMap()[phone])
}

export function setAccountPassword(phone: string, password: string) {
  const map = loadPasswordMap()
  map[phone] = password
  persistPasswordMap(map)
}

export function verifyAccountPassword(phone: string, password: string): boolean {
  const stored = loadPasswordMap()[phone]
  if (!stored) return false
  return stored === password
}
