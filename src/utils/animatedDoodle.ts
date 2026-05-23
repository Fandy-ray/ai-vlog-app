import type { AnimatedDoodle, DoodleStroke } from '@/types/editorState'

export interface DoodleBrushSettings {
  color: string
  size: number
  erasing: boolean
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function drawStroke(
  ctx: CanvasRenderingContext2D,
  stroke: DoodleStroke,
  revealAt: number,
  width: number,
  height: number,
) {
  const first = stroke.points[0]
  if (!first || first.at > revealAt) return

  ctx.save()
  ctx.globalCompositeOperation = stroke.erasing ? 'destination-out' : 'source-over'
  ctx.strokeStyle = stroke.color
  ctx.lineWidth = (stroke.width / 100) * width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo((first.x / 100) * width, (first.y / 100) * height)

  let last = first
  let drewLine = false
  for (let index = 1; index < stroke.points.length; index += 1) {
    const point = stroke.points[index]
    if (point.at <= revealAt) {
      ctx.lineTo((point.x / 100) * width, (point.y / 100) * height)
      last = point
      drewLine = true
      continue
    }
    if (last.at < revealAt) {
      const ratio = clamp(
        (revealAt - last.at) / Math.max(point.at - last.at, 0.001),
        0,
        1,
      )
      const x = last.x + (point.x - last.x) * ratio
      const y = last.y + (point.y - last.y) * ratio
      ctx.lineTo((x / 100) * width, (y / 100) * height)
      drewLine = true
    }
    break
  }

  if (!drewLine) {
    ctx.lineTo((first.x / 100) * width, (first.y / 100) * height)
  }
  ctx.stroke()
  ctx.restore()
}

export function drawDoodleStrokes(
  ctx: CanvasRenderingContext2D,
  strokes: DoodleStroke[],
  revealAt: number,
  width: number,
  height: number,
) {
  for (const stroke of strokes) {
    drawStroke(ctx, stroke, revealAt, width, height)
  }
}

export function animatedDoodleAlpha(animation: AnimatedDoodle, localTime: number) {
  if (localTime < 0) return 0
  const fadeStart = animation.drawDuration + animation.holdDuration
  if (localTime <= fadeStart) return 1
  if (animation.fadeDuration <= 0) return 0
  return clamp(1 - (localTime - fadeStart) / animation.fadeDuration, 0, 1)
}

export function drawAnimatedDoodle(
  ctx: CanvasRenderingContext2D,
  animation: AnimatedDoodle,
  localTime: number,
  width: number,
  height: number,
) {
  const alpha = animatedDoodleAlpha(animation, localTime)
  if (alpha <= 0) return
  ctx.save()
  ctx.globalAlpha = alpha
  drawDoodleStrokes(ctx, animation.strokes, localTime, width, height)
  ctx.restore()
}
