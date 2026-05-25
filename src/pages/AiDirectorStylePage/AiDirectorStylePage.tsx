import { ChevronRight, Palette } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PromptStepLayout } from '@/components/PromptStepLayout'
import { Toast } from '@/components/Toast'
import { useToast } from '@/hooks/useToast'

const STYLE_SUGGESTIONS = [
  '电影感',
  '日系清新',
  '学习风 Lo-fi',
  '轻快活泼',
  '治愈慢节奏',
  '真实纪实',
]

interface LocationState {
  theme?: string
}

export function AiDirectorStylePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { message, show, visible } = useToast()
  const theme = (location.state as LocationState)?.theme?.trim() || ''
  const [stylePreference, setStylePreference] = useState('')

  useEffect(() => {
    if (!theme) navigate('/ai-director/theme', { replace: true })
  }, [theme, navigate])

  if (!theme) return null

  const canNext = stylePreference.trim().length >= 1

  const handleNext = () => {
    const value = stylePreference.trim()
    if (!value) {
      show('请描述你喜欢的成片风格')
      return
    }
    navigate('/ai-director/plan', { state: { theme, stylePreference: value } })
  }

  return (
    <>
      <PromptStepLayout
        step={2}
        totalSteps={3}
        title="你喜欢什么风格？"
        subtitle={`主题「${theme}」已记下。再告诉我们你想要的画面与节奏感觉，AI 会生成匹配的导拍与成片风格。`}
        onBack={() => navigate('/ai-director/theme', { state: { theme } })}
        footer={
          <button
            type="button"
            disabled={!canNext}
            onClick={handleNext}
            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-gradient-to-r from-primary to-primary-light py-3.5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition-transform active:scale-[0.99] disabled:opacity-50"
          >
            生成 AI 导拍方案
            <ChevronRight size={18} />
          </button>
        }
      >
        <div className="rounded-[var(--radius-lg)] bg-surface px-3 py-2.5 ring-1 ring-border">
          <p className="text-[10px] text-text-muted">当前主题</p>
          <p className="mt-0.5 text-sm font-semibold text-text">{theme}</p>
        </div>

        <div className="rounded-[var(--radius-xl)] bg-accent/10 p-4 ring-1 ring-accent/20">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent">
              <Palette size={20} />
            </span>
            <p className="text-xs leading-relaxed text-text-secondary">
              可写色调、节奏、音乐感觉，如「暖色日系、慢节奏、生活感字幕」。
            </p>
          </div>
        </div>

        <label className="block">
          <span className="mb-2 block text-xs font-medium text-text">风格描述</span>
          <textarea
            value={stylePreference}
            onChange={(e) => setStylePreference(e.target.value)}
            placeholder="描述你喜欢的 Vlog 风格…"
            rows={3}
            className="w-full resize-none rounded-[var(--radius-lg)] bg-surface px-4 py-3 text-sm text-text shadow-[var(--shadow-card)] ring-1 ring-border outline-none placeholder:text-text-muted focus:ring-2 focus:ring-primary/40"
          />
        </label>

        <div>
          <p className="mb-2 text-xs font-medium text-text-muted">常用风格提示</p>
          <div className="flex flex-wrap gap-2">
            {STYLE_SUGGESTIONS.map((s) => {
              const active = stylePreference.trim() === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStylePreference(s)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                    active
                      ? 'bg-accent text-white shadow-[var(--shadow-soft)]'
                      : 'bg-surface text-text-secondary ring-1 ring-border'
                  }`}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>
      </PromptStepLayout>

      <Toast message={message} visible={visible} />
    </>
  )
}
