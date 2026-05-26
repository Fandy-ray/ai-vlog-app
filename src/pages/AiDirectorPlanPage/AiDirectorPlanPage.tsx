import { Loader2, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { fetchDirectorPlan } from '@/api/vlogDirector'
import { PageShell } from '@/components/PageShell'
import { Toast } from '@/components/Toast'
import { useToast } from '@/hooks/useToast'
import { saveDirectorSession } from '@/utils/vlogDirectorStore'

interface LocationState {
  theme?: string
  stylePreference?: string
}

export function AiDirectorPlanPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { message, show, visible } = useToast()
  const started = useRef(false)
  const [status, setStatus] = useState('正在理解你的主题与风格…')

  const theme = (location.state as LocationState)?.theme?.trim() || ''
  const stylePreference = (location.state as LocationState)?.stylePreference?.trim() || ''

  useEffect(() => {
    if (!theme || !stylePreference) {
      navigate('/ai-director/theme', { replace: true })
    }
  }, [theme, stylePreference, navigate])

  useEffect(() => {
    if (!theme || !stylePreference) return
    if (started.current) return
    started.current = true

    const run = async () => {
      try {
        setStatus('AI 正在生成专属拍摄场景…')
        const plan = await fetchDirectorPlan(theme, stylePreference)

        saveDirectorSession({
          theme: plan.theme,
          stylePreference: plan.stylePreference,
          styleId: plan.styleId,
          type: plan.type,
          projectTitle: plan.projectTitle,
          provider: plan.provider,
          scenes: plan.scenes,
        })

        setStatus('导拍方案已就绪')
        navigate('/vlog-learn', { replace: true })
      } catch (err) {
        const msg = err instanceof Error ? err.message : '生成失败'
        show(msg)
        setStatus('生成失败，请返回重试')
        setTimeout(() => navigate('/ai-director/style', { state: { theme, stylePreference } }), 1800)
      }
    }

    void run()
  }, [theme, stylePreference, navigate, show])

  return (
    <PageShell className="items-center justify-center px-6">
      <div className="flex max-w-xs flex-col items-center text-center">
        <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles size={32} className="animate-pulse" />
        </span>
        <Loader2 size={28} className="mb-4 animate-spin text-primary" />
        <h2 className="text-base font-semibold text-text">AI 导拍方案生成中</h2>
        <p className="mt-2 text-sm text-text-secondary">{status}</p>
        <p className="mt-4 text-[10px] leading-relaxed text-text-muted">
          主题：{theme || '—'}
          <br />
          风格：{stylePreference || '—'}
        </p>
      </div>
      <Toast message={message} visible={visible} />
    </PageShell>
  )
}
