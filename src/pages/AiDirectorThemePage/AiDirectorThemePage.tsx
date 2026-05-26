import { ChevronRight, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PromptStepLayout } from '@/components/PromptStepLayout'
import { Toast } from '@/components/Toast'
import { useToast } from '@/hooks/useToast'

const THEME_SUGGESTIONS = [
  '学习',
  '旅游',
  '美食vlog',
  '一天vlog',
  '校园日常',
  '周末咖啡',
]

export function AiDirectorThemePage() {
  const navigate = useNavigate()
  const { message, show, visible } = useToast()
  const [theme, setTheme] = useState('')

  const canNext = theme.trim().length >= 1

  const handleNext = () => {
    const value = theme.trim()
    if (!value) {
      show('请先填写想拍的 Vlog 主题')
      return
    }
    navigate('/ai-director/style', { state: { theme: value } })
  }

  return (
    <>
      <PromptStepLayout
        step={1}
        totalSteps={3}
        title="你想拍什么主题的 Vlog？"
        subtitle="用一句话描述今天想记录的内容，AI 会据此生成专属拍摄清单与九宫格构图指引。"
        onBack={() => navigate('/')}
        footer={
          <button
            type="button"
            disabled={!canNext}
            onClick={handleNext}
            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-gradient-to-r from-primary to-primary-light py-3.5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition-transform active:scale-[0.99] disabled:opacity-50"
          >
            下一步：选择风格
            <ChevronRight size={18} />
          </button>
        }
      >
        <div className="rounded-[var(--radius-xl)] bg-gradient-to-br from-primary/10 via-surface to-accent/10 p-4 shadow-[var(--shadow-card)]">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
              <Sparkles size={20} />
            </span>
            <p className="text-xs leading-relaxed text-text-secondary">
              例如：学习、旅游、美食探店、一天生活记录……越具体，导拍镜头越贴合你的故事。
            </p>
          </div>
        </div>

        <label className="block">
          <span className="mb-2 block text-xs font-medium text-text">你的主题</span>
          <textarea
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="输入想拍的 Vlog 主题…"
            rows={3}
            className="w-full resize-none rounded-[var(--radius-lg)] bg-surface px-4 py-3 text-sm text-text shadow-[var(--shadow-card)] ring-1 ring-border outline-none placeholder:text-text-muted focus:ring-2 focus:ring-primary/40"
          />
        </label>

        <div>
          <p className="mb-2 text-xs font-medium text-text-muted">试试这些灵感</p>
          <div className="flex flex-wrap gap-2">
            {THEME_SUGGESTIONS.map((s) => {
              const active = theme.trim() === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTheme(s)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                    active
                      ? 'bg-primary text-white shadow-[var(--shadow-soft)]'
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
