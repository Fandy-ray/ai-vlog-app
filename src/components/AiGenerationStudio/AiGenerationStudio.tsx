import { Check, Loader2, Sparkles } from 'lucide-react'
import { AI_GENERATION_STEPS } from '@/data/aiGenerationSteps'

interface AiGenerationStudioProps {
  activeStepIndex: number
  progress: number
  clipCount: number
  elapsedSec?: number
  error?: string | null
  onBack?: () => void
}

export function AiGenerationStudio({
  activeStepIndex,
  progress,
  clipCount,
  elapsedSec = 0,
  error,
  onBack,
}: AiGenerationStudioProps) {
  const pct = Math.min(100, Math.max(0, Math.round(progress)))
  const onExportStep = activeStepIndex >= AI_GENERATION_STEPS.length - 1
  const exportHint =
    elapsedSec >= 90
      ? '渲染时间较长，请确认 Mac 上 backend 终端无报错；可先减少素材段数重试'
      : '导演级渲染中（素材较多约 2～5 分钟，请保持 backend 运行）'

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#0a0a0f] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgb(99 102 241 / 0.35), transparent), radial-gradient(ellipse 60% 40% at 100% 50%, rgb(255 179 87 / 0.12), transparent)',
        }}
      />

      <header className="relative z-10 px-5 pt-12 pb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
            <Sparkles size={18} className="text-amber-300" />
          </span>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-white/50">
              AI Director
            </p>
            <h1 className="text-lg font-semibold tracking-tight">
              {error ? '生成未完成' : 'AI 导演正在创作你的 Vlog'}
            </h1>
          </div>
        </div>
        <p className="mt-2 text-xs text-white/55">
          {error
            ? error
            : `已接收 ${clipCount} 段素材 · 故事线 · 章节配乐 · 电影感剪辑`}
        </p>
      </header>

      <section className="relative z-10 flex-1 px-5">
        <div className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between text-[10px] text-white/50">
            <span>渲染进度</span>
            <span className="tabular-nums">{pct}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-amber-400 transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          {!error && (
            <>
              <p className="mt-3 text-center text-xs text-white/70 animate-pulse">
                {AI_GENERATION_STEPS[activeStepIndex]?.label ?? '处理中…'}
              </p>
              <p className="mt-1 text-center text-[10px] tabular-nums text-white/45">
                已等待 {elapsedSec} 秒
                {onExportStep && !error ? ` · ${exportHint}` : ''}
              </p>
            </>
          )}
        </div>

        <ul className="space-y-2">
          {AI_GENERATION_STEPS.map((step, index) => {
            const done = !error && index < activeStepIndex
            const active = !error && index === activeStepIndex
            return (
              <li
                key={step.id}
                className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 transition-all duration-300 ${
                  active
                    ? 'border-amber-400/40 bg-amber-400/10 shadow-[0_0_24px_rgb(251_191_36/0.15)]'
                    : done
                      ? 'border-emerald-500/25 bg-emerald-500/5'
                      : 'border-white/5 bg-white/[0.02]'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    done
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : active
                        ? 'bg-amber-400/20 text-amber-300'
                        : 'bg-white/5 text-white/30'
                  }`}
                >
                  {done ? (
                    <Check size={14} strokeWidth={2.5} />
                  ) : active ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <span className="text-[10px] font-medium">{index + 1}</span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium ${
                      active ? 'text-white' : done ? 'text-white/80' : 'text-white/40'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p
                    className={`mt-0.5 text-[11px] leading-snug ${
                      active ? 'text-white/60' : 'text-white/30'
                    }`}
                  >
                    {step.detail}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      {error && onBack && (
        <footer className="relative z-10 p-5 pb-10">
          <button
            type="button"
            onClick={onBack}
            className="w-full rounded-2xl bg-white py-3.5 text-sm font-semibold text-black active:scale-[0.99]"
          >
            返回拍摄清单
          </button>
        </footer>
      )}

      <footer className="relative z-10 px-5 pb-8 pt-2 text-center text-[10px] text-white/35">
        CapCut 风格工作流 · 9:16 竖屏 · 章节 BGM · 蓝心 AI 导演
      </footer>
    </div>
  )
}
