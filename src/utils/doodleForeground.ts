export interface DoodlePlacement {
  x: number
  y: number
  width: number
  height: number
}

export const DEFAULT_DOODLE_PLACEMENT: DoodlePlacement = {
  x: 50,
  y: 50,
  width: 34,
  height: 34,
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('图片读取失败'))
    image.src = src
  })
}

function toPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('透明图生成失败'))
    }, 'image/png')
  })
}

export async function resolveDoodlePlacement(
  doodleImage: string | null,
): Promise<DoodlePlacement> {
  if (!doodleImage) return DEFAULT_DOODLE_PLACEMENT

  const image = await loadImage(doodleImage)
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return DEFAULT_DOODLE_PLACEMENT

  ctx.drawImage(image, 0, 0)
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  let minX = canvas.width
  let minY = canvas.height
  let maxX = -1
  let maxY = -1

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      if (data[(y * canvas.width + x) * 4 + 3] < 10) continue
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
  }

  if (maxX < minX || maxY < minY) return DEFAULT_DOODLE_PLACEMENT

  const pad = Math.max(18, Math.round(Math.max(maxX - minX, maxY - minY) * 0.12))
  const left = clamp(minX - pad, 0, canvas.width)
  const top = clamp(minY - pad, 0, canvas.height)
  const right = clamp(maxX + pad, 0, canvas.width)
  const bottom = clamp(maxY + pad, 0, canvas.height)

  return {
    x: ((left + right) / 2 / canvas.width) * 100,
    y: ((top + bottom) / 2 / canvas.height) * 100,
    width: clamp(((right - left) / canvas.width) * 100, 18, 50),
    height: clamp(((bottom - top) / canvas.height) * 100, 18, 50),
  }
}

type Rgb = [number, number, number]

function cornerAverage(data: Uint8ClampedArray, width: number, height: number): Rgb {
  const sampleSize = Math.max(2, Math.min(12, Math.round(Math.min(width, height) * 0.015)))
  const samples: Rgb[] = []
  const corners = [
    [0, 0],
    [width - sampleSize, 0],
    [0, height - sampleSize],
    [width - sampleSize, height - sampleSize],
  ]

  for (const [startX, startY] of corners) {
    let red = 0
    let green = 0
    let blue = 0
    let count = 0
    for (let y = startY; y < startY + sampleSize; y += 1) {
      for (let x = startX; x < startX + sampleSize; x += 1) {
        const index = (y * width + x) * 4
        red += data[index]
        green += data[index + 1]
        blue += data[index + 2]
        count += 1
      }
    }
    samples.push([red / count, green / count, blue / count])
  }

  return [
    samples.reduce((sum, sample) => sum + sample[0], 0) / samples.length,
    samples.reduce((sum, sample) => sum + sample[1], 0) / samples.length,
    samples.reduce((sum, sample) => sum + sample[2], 0) / samples.length,
  ]
}

function colorDistance(data: Uint8ClampedArray, index: number, background: Rgb) {
  return Math.max(
    Math.abs(data[index] - background[0]),
    Math.abs(data[index + 1] - background[1]),
    Math.abs(data[index + 2] - background[2]),
  )
}

/**
 * AI 前景按纯色背景生成后，从边界向内去除连通背景。
 * 对复杂背景保持原图，避免误删主体。
 */
export async function isolateFlatBackground(imageUrl: string): Promise<Blob | null> {
  const image = await loadImage(imageUrl)
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null

  ctx.drawImage(image, 0, 0)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const { data } = imageData
  const background = cornerAverage(data, canvas.width, canvas.height)
  const cornerIndices = [
    0,
    (canvas.width - 1) * 4,
    (canvas.height - 1) * canvas.width * 4,
    (canvas.width * canvas.height - 1) * 4,
  ]
  if (cornerIndices.some((index) => colorDistance(data, index, background) > 36)) {
    return null
  }

  const width = canvas.width
  const height = canvas.height
  const total = width * height
  const seen = new Uint8Array(total)
  const queue = new Int32Array(total)
  let head = 0
  let tail = 0
  let removed = 0

  const addIfBackground = (pixel: number) => {
    if (seen[pixel]) return
    seen[pixel] = 1
    const index = pixel * 4
    if (data[index + 3] === 0 || colorDistance(data, index, background) <= 58) {
      queue[tail] = pixel
      tail += 1
    }
  }

  for (let x = 0; x < width; x += 1) {
    addIfBackground(x)
    addIfBackground((height - 1) * width + x)
  }
  for (let y = 1; y < height - 1; y += 1) {
    addIfBackground(y * width)
    addIfBackground(y * width + width - 1)
  }

  while (head < tail) {
    const pixel = queue[head]
    head += 1
    data[pixel * 4 + 3] = 0
    removed += 1
    const x = pixel % width
    const y = Math.floor(pixel / width)
    if (x > 0) addIfBackground(pixel - 1)
    if (x < width - 1) addIfBackground(pixel + 1)
    if (y > 0) addIfBackground(pixel - width)
    if (y < height - 1) addIfBackground(pixel + width)
  }

  if (removed < total * 0.05) return null

  let left = width
  let top = height
  let right = -1
  let bottom = -1
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] < 8) continue
      left = Math.min(left, x)
      top = Math.min(top, y)
      right = Math.max(right, x)
      bottom = Math.max(bottom, y)
    }
  }
  if (right < left || bottom < top) return null

  ctx.putImageData(imageData, 0, 0)
  const pad = 4
  const cropLeft = Math.max(0, left - pad)
  const cropTop = Math.max(0, top - pad)
  const cropWidth = Math.min(width, right + pad + 1) - cropLeft
  const cropHeight = Math.min(height, bottom + pad + 1) - cropTop
  const output = document.createElement('canvas')
  output.width = cropWidth
  output.height = cropHeight
  output
    .getContext('2d')
    ?.drawImage(canvas, cropLeft, cropTop, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight)
  return toPngBlob(output)
}
