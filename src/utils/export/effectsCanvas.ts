/** 在 Canvas 上绘制与预览一致的特效层 */

export function drawEffectOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  effectId: string,
  timeSec: number,
  fastMode = false,
) {
  if (!effectId || effectId === 'none') return

  ctx.save()

  switch (effectId) {
    case 'vignette': {
      const g = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        width * 0.15,
        width * 0.5,
        height * 0.45,
        width * 0.55,
      )
      g.addColorStop(0, 'rgba(0,0,0,0)')
      g.addColorStop(1, 'rgba(0,0,0,0.45)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, width, height)
      break
    }
    case 'film': {
      const top = ctx.createLinearGradient(0, 0, 0, height)
      top.addColorStop(0, 'rgba(255,220,180,0.18)')
      top.addColorStop(0.28, 'rgba(255,220,180,0)')
      top.addColorStop(0.72, 'rgba(20,40,80,0)')
      top.addColorStop(1, 'rgba(20,40,80,0.22)')
      ctx.fillStyle = top
      ctx.fillRect(0, 0, width, height)
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.lineWidth = 1
      ctx.strokeRect(0.5, 0.5, width - 1, height - 1)
      break
    }
    case 'grain': {
      if (fastMode) {
        ctx.globalAlpha = 0.18
        for (let i = 0; i < 120; i++) {
          const x = Math.random() * width
          const y = Math.random() * height
          const g = 120 + Math.random() * 80
          ctx.fillStyle = `rgba(${g},${g},${g},0.35)`
          ctx.fillRect(x, y, 1.5, 1.5)
        }
        ctx.globalAlpha = 1
      } else {
        const imageData = ctx.getImageData(0, 0, width, height)
        const data = imageData.data
        for (let i = 0; i < data.length; i += 4) {
          const noise = (Math.random() - 0.5) * 28
          data[i] = Math.min(255, Math.max(0, data[i] + noise))
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise))
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise))
        }
        ctx.putImageData(imageData, 0, 0)
      }
      break
    }
    case 'light': {
      const g = ctx.createLinearGradient(0, 0, width, height)
      g.addColorStop(0, 'rgba(255,160,90,0.42)')
      g.addColorStop(0.42, 'rgba(255,160,90,0)')
      g.addColorStop(0.58, 'rgba(120,180,255,0)')
      g.addColorStop(1, 'rgba(120,180,255,0.28)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, width, height)
      break
    }
    case 'dream': {
      const g = ctx.createRadialGradient(
        width * 0.5,
        height * 0.4,
        0,
        width * 0.5,
        height * 0.4,
        width * 0.55,
      )
      g.addColorStop(0, 'rgba(255,200,255,0.28)')
      g.addColorStop(1, 'rgba(255,200,255,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, width, height)
      ctx.shadowColor = 'rgba(180,200,255,0.25)'
      ctx.shadowBlur = 48
      ctx.strokeStyle = 'rgba(180,200,255,0.15)'
      ctx.strokeRect(0, 0, width, height)
      ctx.shadowBlur = 0
      break
    }
    case 'sparkle': {
      const shift = (timeSec * 0.45) % 1
      const g = ctx.createLinearGradient(
        width * (shift - 0.2),
        0,
        width * (shift + 0.2),
        height,
      )
      g.addColorStop(0, 'rgba(255,255,255,0)')
      g.addColorStop(0.5, 'rgba(255,255,255,0.55)')
      g.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, width, height)
      break
    }
    case 'snow': {
      const count = 80
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      for (let i = 0; i < count; i++) {
        const seed = i * 9973
        const x = ((seed * 17 + timeSec * 40) % width)
        const y = ((seed * 31 + timeSec * 55) % height)
        const r = 1 + (i % 3)
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }
      break
    }
    default:
      break
  }

  ctx.restore()
}
