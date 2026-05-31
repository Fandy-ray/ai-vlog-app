import { useCallback, useEffect, useState } from 'react'
import {
  requestVerificationCode,
  verifyVerificationCode,
  type VerificationCodePurpose,
} from '@/utils/verificationCode'

export function useVerificationCode(purpose: VerificationCodePurpose) {
  const [countdown, setCountdown] = useState(0)
  const [hint, setHint] = useState('')

  useEffect(() => {
    if (countdown <= 0) return
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [countdown])

  const resetVerificationCode = useCallback(() => {
    setCountdown(0)
    setHint('')
  }, [])

  const requestCode = useCallback(
    (phone: string) => {
      const result = requestVerificationCode(phone, purpose)
      if (result.ok) {
        setCountdown(result.cooldownSeconds)
        setHint(`演示验证码：${result.code}，5 分钟内有效`)
      }
      return result
    },
    [purpose],
  )

  const verifyCode = useCallback(
    (phone: string, code: string) => verifyVerificationCode(phone, purpose, code),
    [purpose],
  )

  return {
    countdown,
    hint,
    requestCode,
    resetVerificationCode,
    verifyCode,
  }
}
