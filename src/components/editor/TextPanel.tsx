import { Check, X } from 'lucide-react'
import { TEXT_BG_COLORS, TEXT_COLORS, TEXT_FONTS } from '@/data/textStyles'
import type { TextOverlay } from '@/types/editorState'

interface TextPanelProps {
  draft: TextOverlay
  onChange: (patch: Partial<TextOverlay>) => void
  onConfirm: () => void
  onClose: () => void
}

export function TextPanel({ draft, onChange, onConfirm, onClose }: TextPanelProps) {
  const bgOpacity = draft.backgroundOpacity ?? 0
  const bgColor = draft.backgroundColor ?? '#000000'
  const bgTransparent = bgOpacity <= 0

  return (
    <section className="shrink-0 animate-slide-up border-t border-border/80 bg-surface shadow-[0_-4px_16px_rgb(44_62_80_/4%)]">
      <header className="flex items-center justify-between px-4 pb-2 pt-3">
        <h3 className="text-sm font-semibold text-text">文字</h3>
        <section className="flex items-center gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-[var(--shadow-soft)] transition-all hover:bg-primary-dark active:scale-95"
            aria-label="确定"
          >
            <Check size={18} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg hover:text-text active:scale-95"
            aria-label="取消"
          >
            <X size={18} />
          </button>
        </section>
      </header>

      <section className="space-y-3 px-4 pb-4">
        <label className="block">
          <span className="mb-1.5 block text-xs text-text-muted">文字内容</span>
          <textarea
            value={draft.content}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder="输入要显示的文字…"
            rows={2}
            className="w-full resize-none rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </label>

        <section>
          <span className="mb-2 block text-xs text-text-muted">颜色</span>
          <ul className="flex flex-wrap gap-2.5">
            {TEXT_COLORS.map((c) => {
              const active = draft.color === c.value
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onChange({ color: c.value })}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-transform active:scale-95 ${
                      active ? 'border-primary scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.value }}
                    aria-label={c.label}
                    title={c.label}
                  >
                    {active && (
                      <span className="h-2 w-2 rounded-full bg-white shadow-sm" />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-text-muted">背景</span>
            <span className="tabular-nums text-xs font-medium text-text-secondary">
              {bgTransparent ? '透明' : `${bgOpacity}%`}
            </span>
          </div>
          <ul className="mb-3 flex flex-wrap gap-2.5">
            <li>
              <button
                type="button"
                onClick={() => onChange({ backgroundOpacity: 0 })}
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-[10px] font-medium transition-transform active:scale-95 ${
                  bgTransparent
                    ? 'border-primary scale-110 bg-bg text-primary'
                    : 'border-border bg-bg text-text-muted hover:text-text'
                }`}
                aria-label="透明背景"
                title="透明"
              >
                无
              </button>
            </li>
            {TEXT_BG_COLORS.map((c) => {
              const active = !bgTransparent && bgColor === c.value
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        backgroundColor: c.value,
                        backgroundOpacity: bgTransparent ? 45 : bgOpacity,
                      })
                    }
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-transform active:scale-95 ${
                      active ? 'border-primary scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.value }}
                    aria-label={`背景${c.label}`}
                    title={c.label}
                  >
                    {active && (
                      <span className="h-2 w-2 rounded-full bg-white shadow-sm" />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
          <label className="flex items-center gap-3">
            <span className="shrink-0 text-[10px] text-text-muted">透明度</span>
            <input
              type="range"
              min={0}
              max={100}
              value={bgOpacity}
              onChange={(e) =>
                onChange({ backgroundOpacity: Number(e.target.value) })
              }
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-primary"
            />
          </label>
        </section>

        <section>
          <span className="mb-2 block text-xs text-text-muted">字体</span>
          <ul className="flex gap-2 overflow-x-auto pb-1">
            {TEXT_FONTS.map((font) => {
              const active = draft.fontId === font.id
              return (
                <li key={font.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => onChange({ fontId: font.id })}
                    className={`rounded-full px-3 py-1.5 text-sm transition-all active:scale-95 ${
                      active
                        ? 'bg-primary font-medium text-white shadow-[var(--shadow-soft)]'
                        : 'bg-bg text-text-secondary ring-1 ring-border hover:text-text'
                    }`}
                    style={{ fontFamily: font.family }}
                  >
                    {font.name}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        <p className="text-center text-[10px] leading-relaxed text-text-muted">
          拖动移动 · 四边/四角拖拽调节大小 · 上方旋钮旋转
        </p>
      </section>
    </section>
  )
}
