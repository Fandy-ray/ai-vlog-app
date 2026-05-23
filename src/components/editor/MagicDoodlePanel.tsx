import { Check, Eraser, Paintbrush, Sparkles, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { EditorToolPanelShell } from '@/components/editor/EditorToolPanelShell'

export type MagicDoodleMode = 'sticker' | 'scene' | 'style'

export interface MagicDoodleDraft {
  prompt: string
  mode: MagicDoodleMode
  size: string
  doodleImage: string | null
  hasDoodle: boolean
}

interface MagicDoodlePanelProps {
  busy: boolean
  backgroundImage?: string | null
  onGenerate: (draft: MagicDoodleDraft) => void
  onClose: () => void
}

const MODES: Array<{ id: MagicDoodleMode; label: string }> = [
  { id: 'sticker', label: '贴纸' },
  { id: 'scene', label: '融入' },
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
  onGenerate,
  onClose,
}: MagicDoodlePanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const [prompt, setPrompt] = useState('把涂鸦变成发光的魔法贴纸')
  const [mode, setMode] = useState<MagicDoodleMode>('sticker')
  const [brushColor, setBrushColor] = useState(COLORS[0])
  const [brushSize, setBrushSize] = useState(10)
  const [erasing, setErasing] = useState(false)
  const [size, setSize] = useState(SIZES[0])
  const [hasDoodle, setHasDoodle] = useState(false)

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

  const drawLine = useCallback(
    (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!ctx) return
      ctx.save()
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineWidth = erasing ? brushSize * 1.8 : brushSize
      ctx.globalCompositeOperation = erasing ? 'destination-out' : 'source-over'
      ctx.strokeStyle = brushColor
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.stroke()
      ctx.restore()
    },
    [brushColor, brushSize, erasing],
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
    const trimmed = prompt.trim()
    if (!trimmed || busy) return
    const canvas = canvasRef.current
    const doodleImage = canvas && hasDoodle ? canvas.toDataURL('image/png') : null
    onGenerate({ prompt: trimmed, mode, size, doodleImage, hasDoodle })
  }

  return (
    <EditorToolPanelShell
      title="魔法涂鸦"
      headerActions={
        <>
          <button
            type="button"
            onClick={clearCanvas}
            disabled={!hasDoodle || busy}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="清空涂鸦"
          >
            <Trash2 size={16} />
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!prompt.trim() || busy}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-[var(--shadow-soft)] transition-all hover:bg-primary-dark active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="生成"
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

        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
          <div className="flex rounded-full bg-bg p-0.5">
            <button
              type="button"
              onClick={() => setErasing(false)}
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                erasing ? 'text-text-muted' : 'bg-surface text-primary shadow-sm'
              }`}
              aria-label="画笔"
              aria-pressed={!erasing}
            >
              <Paintbrush size={15} />
            </button>
            <button
              type="button"
              onClick={() => setErasing(true)}
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                erasing ? 'bg-surface text-primary shadow-sm' : 'text-text-muted'
              }`}
              aria-label="橡皮"
              aria-pressed={erasing}
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
                  setBrushColor(color)
                  setErasing(false)
                }}
                className={`h-6 w-6 rounded-full border ${
                  brushColor === color && !erasing
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-border'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`颜色 ${color}`}
                aria-pressed={brushColor === color && !erasing}
              />
            ))}
          </div>

          <input
            type="range"
            min={4}
            max={28}
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-20 accent-primary"
            aria-label="画笔粗细"
          />
        </div>

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

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={2}
          className="w-full resize-none rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-xs leading-5 text-text outline-none transition-colors placeholder:text-text-muted focus:border-primary"
          placeholder="描述想生成的效果"
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
      </div>
    </EditorToolPanelShell>
  )
}
