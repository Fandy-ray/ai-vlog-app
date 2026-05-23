export interface DoodleGeneratePayload {
  prompt: string
  image?: string
  size?: string
  parameters?: {
    watermark?: boolean
  }
}

export interface DoodleGeneratedImage {
  url: string
  size?: string
}

export interface DoodleGenerateResult {
  imageUrl: string
  providerUrl?: string
  images: DoodleGeneratedImage[]
  size?: string
  provider?: string
  traceId?: string
  requestId?: string
  storeWarning?: string
}

async function readErrorMessage(response: Response) {
  try {
    const data = await response.json()
    return data.message || data.error || response.statusText
  } catch {
    return response.statusText
  }
}

export async function generateDoodleImage(
  payload: DoodleGeneratePayload,
): Promise<DoodleGenerateResult> {
  const response = await fetch('/api/doodle/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  const data = await response.json()
  if (data.code !== 0) {
    throw new Error(data.message || '图片生成失败')
  }
  return data.data
}

export async function storeDoodleAsset(image: Blob): Promise<string> {
  const form = new FormData()
  form.append('image', image, 'magic-doodle-foreground.png')
  const response = await fetch('/api/doodle/assets', {
    method: 'POST',
    body: form,
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  const data = await response.json()
  if (data.code !== 0 || !data.data?.imageUrl) {
    throw new Error(data.message || '透明图保存失败')
  }
  return data.data.imageUrl
}
