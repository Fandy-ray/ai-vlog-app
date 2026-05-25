import { Check, Eraser, Paintbrush, Sparkles, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { EditorToolPanelShell } from '@/components/editor/EditorToolPanelShell'
import { TimeRangeInputs } from '@/components/editor/TimeRangeInputs'
import type { DoodleBrushSettings } from '@/utils/animatedDoodle'
import type { TimeRange } from '@/utils/timeRange'

export type MagicDoodleMode = 'sticker' | 'scene' | 'style'

export interface MagicDoodleDraft {
  prompt: string
  mode: MagicDoodleMode
  size: string
  doodleImage: string | null
  hasDoodle: boolean
  range: TimeRange
}

interface MagicDoodlePanelProps {
  busy: boolean
  backgroundImage?: string | null
  brushSettings: DoodleBrushSettings
  hasRecordedDoodle: boolean
  range: TimeRange
  videoDuration: number
  onGenerate: (draft: MagicDoodleDraft) => void
  onModeChange: (mode: MagicDoodleMode) => void
  onBrushSettingsChange: (settings: DoodleBrushSettings) => void
  onRangeChange: (range: TimeRange) => void
  onClearRecordedDoodle: () => void
  onConfirmRecordedDoodle: () => void
  onClose: () => void
}

const MODES: Array<{ id: MagicDoodleMode; label: string }> = [
  { id: 'sticker', label: '贴纸' },
  { id: 'scene', label: '动态绘画' },
  { id: 'style', label: '风格' },
]

const PROMPT_PRESETS = ['烟花光效', '云朵贴纸', '爱心贴纸', '国风手绘']
const COLORS = ['#f59e0b', '#ffffff', '#7c8cff', '#22c55e', '#ef4444']
const SIZES = ['2K', '2048x2048', '2560x1440', '1440x2560']

function getCanvasPoint(canvas: HTMLCanvasElement, e: React.PointerEvent) {
  const rect = canvas.getBoundingClientRect()
  return {
    x: ((e.clientX - rect.left) / rect.width) * canvas.width,
    y: ((e.clientY - rect.top) / rect.height) * canvas.height,
  }
}

export function MagicDoodlePanel({
  busy,
  backgroundImage = null,
  brushSettings,
  hasRecordedDoodle,
  range,
  videoDuration,
  onGenerate,
  onModeChange,
  onBrushSettingsChange,
  onRangeChange,
  onClearRecordedDoodle,
  onConfirmRecordedDoodle,
  onClose,
}: MagicDoodlePanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState<MagicDoodleMode>('sticker')
  const [size, setSize] = useState(SIZES[0])
  const [hasDoodle, setHasDoodle] = useState(false)
  const interactive = mode === 'scene'
  const hasGenerationInput = hasDoodle || Boolean(prompt.trim())
  const canConfirm = interactive ? hasRecordedDoodle : hasGenerationInput

  useEffect(() => {
    onModeChange(mode)
  }, [mode, onModeChange])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = 640
    canvas.height = 360
  }, [])

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasDoodle(false)
  }, [])

  const clearActiveDrawing = useCallback(() => {
    if (interactive) {
      onClearRecordedDoodle()
      return
    }
    clearCanvas()
  }, [clearCanvas, interactive, onClearRecordedDoodle])

  const drawLine = useCallback(
    (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!ctx) return
      ctx.save()
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineWidth = brushSettings.erasing ? brushSettings.size * 1.8 : brushSettings.size
      ctx.globalCompositeOperation = brushSettings.erasing ? 'destination-out' : 'source-over'
      ctx.strokeStyle = brushSettings.color
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.stroke()
      ctx.restore()
    },
    [brushSettings],
  )

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (busy) return
    const canvas = e.currentTarget
    canvas.setPointerCapture(e.pointerId)
    const point = getCanvasPoint(canvas, e)
    drawingRef.current = true
    lastPointRef.current = point
    drawLine(point, point)
    setHasDoodle(true)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || busy) return
    const canvas = e.currentTarget
    const point = getCanvasPoint(canvas, e)
    const last = lastPointRef.current ?? point
    drawLine(last, point)
    lastPointRef.current = point
  }

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawingRef.current = false
    lastPointRef.current = null
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* pointer may already be released */
    }
  }

  const handleGenerate = () => {
    if (busy) return
    if (interactive) {
      onConfirmRecordedDoodle()
      return
    }
    const trimmed = prompt.trim()
    if (!hasGenerationInput) return
    const canvas = canvasRef.current
    const doodleImage = canvas && hasDoodle ? canvas.toDataURL('image/png') : null
    const fallbackPrompt =
      mode === 'style' ? '将手绘区域转换为自然统一的画面风格' : '将手绘内容生成精致贴纸'
    onGenerate({
      prompt: trimmed || fallbackPrompt,
      mode,
      size,
      doodleImage,
      hasDoodle,
      range,
    })
  }

  return (
    <EditorToolPanelShell
      title="魔法涂鸦"
      headerActions={
        <>
          <button
            type="button"
            onClick={clearActiveDrawing}
            disabled={!(interactive ? hasRecordedDoodle : hasDoodle) || busy}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="清空涂鸦"
          >
            <Trash2 size={16} />
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canConfirm || busy}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-[var(--shadow-soft)] transition-all hover:bg-primary-dark active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={interactive ? '保存动态绘画' : '生成魔法涂鸦'}
          >
            {busy ? <Sparkles size={16} /> : <Check size={18} strokeWidth={2.5} />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg hover:text-text active:scale-95"
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </>
      }
    >
      <div className="space-y-3 px-4 pb-4">
        {interactive ? (
          <>
            <div className="rounded-[var(--radius-md)] bg-primary/5 px-3 py-2.5 text-xs leading-5 text-text-secondary ring-1 ring-primary/10">
              请直接在上方视频画面拖动鼠标绘制。第一笔开始播放并记录笔迹，保存后会按绘制速度回放，完成后自动淡出。
            </div>
            <p className="text-[10px] leading-4 text-text-muted">
              保存后会创建“涂鸦 · 动态手绘”时间轴轨道，可拖动或调整两端控制出现时间。
            </p>
          </>
        ) : (
          <div className="relative aspect-video overflow-hidden rounded-[var(--radius-md)] bg-zinc-950 ring-1 ring-border">
            {backgroundImage && (
              <img
                src={backgroundImage}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-70"
                draggable={false}
              />
            )}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 h-full w-full touch-none cursor-crosshair"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={stopDrawing}
              onPointerCancel={stopDrawing}
              aria-label="魔法涂鸦画布"
            />
          </div>
        )}

        {interactive && (
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
            <div className="flex rounded-full bg-bg p-0.5">
              <button
                type="button"
                onClick={() => onBrushSettingsChange({ ...brushSettings, erasing: false })}
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  brushSettings.erasing ? 'text-text-muted' : 'bg-surface text-primary shadow-sm'
                }`}
                aria-label="画笔"
                aria-pressed={!brushSettings.erasing}
              >
                <Paintbrush size={15} />
              </button>
              <button
                type="button"
                onClick={() => onBrushSettingsChange({ ...brushSettings, erasing: true })}
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  brushSettings.erasing ? 'bg-surface text-primary shadow-sm' : 'text-text-muted'
                }`}
                aria-label="橡皮"
                aria-pressed={brushSettings.erasing}
              >
                <Eraser size={15} />
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    onBrushSettingsChange({
                      ...brushSettings,
                      color,
                      erasing: false,
                    })
                  }}
                  className={`h-6 w-6 rounded-full border ${
                    brushSettings.color === color && !brushSettings.erasing
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-border'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`颜色 ${color}`}
                  aria-pressed={brushSettings.color === color && !brushSettings.erasing}
                />
              ))}
            </div>

            <input
              type="range"
              min={4}
              max={28}
              value={brushSettings.size}
              onChange={(e) =>
                onBrushSettingsChange({
                  ...brushSettings,
                  size: Number(e.target.value),
                })
              }
              className="w-20 accent-primary"
              aria-label="画笔粗细"
            />
          </div>
        )}

        <div className="flex gap-1.5">
          {MODES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              className={`h-8 flex-1 rounded-full text-xs font-medium transition-colors ${
                mode === item.id
                  ? 'bg-primary text-white'
                  : 'bg-bg text-text-secondary hover:bg-primary/10 hover:text-primary'
              }`}
              aria-pressed={mode === item.id}
            >
              {item.label}
            </button>
          ))}
        </div>

        {!interactive && (
          <>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-xs leading-5 text-text outline-none transition-colors placeholder:text-text-muted focus:border-primary"
              placeholder={
                mode === 'style'
                  ? '描述希望呈现的画面风格，也可直接在画面上绘制'
                  : '描述想要的贴纸，也可直接在画面上绘制'
              }
              maxLength={220}
            />

            <div className="flex flex-wrap gap-1.5">
              {PROMPT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setPrompt(preset)}
                  className="rounded-full bg-bg px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  {preset}
                </button>
              ))}
              {SIZES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSize(item)}
                  className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                    size === item
                      ? 'bg-accent/20 text-accent'
                      : 'bg-bg text-text-secondary hover:bg-accent/10 hover:text-accent'
                  }`}
                  aria-pressed={size === item}
                >
                  {item}
                </button>
              ))}
            </div>

            <section className="border-t border-border/50 pt-3">
              <span className="mb-2 block text-xs font-medium text-text">存在时间范围</span>
              <TimeRangeInputs
                range={range}
                videoDuration={videoDuration}
                onChange={onRangeChange}
                disabled={!hasGenerationInput || busy}
              />
              {!hasGenerationInput && (
                <p className="mt-1.5 text-[10px] text-text-muted">
                  请先输入描述或绘制内容后再设置时间范围
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </EditorToolPanelShell>
  )
}
