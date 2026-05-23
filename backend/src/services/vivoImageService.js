const fs = require('fs')
const path = require('path')
const axios = require('axios')
const { v4: uuidv4 } = require('uuid')

const BASE_URL = process.env.VIVO_AIGC_BASE_URL || 'https://api-ai.vivo.com.cn'
const IMAGE_PATH = process.env.VIVO_IMAGE_PATH || '/api/v1/image_generation'
const MODEL = process.env.VIVO_IMAGE_MODEL || 'Doubao-Seedream-4.5'

const uploadDir = path.join(__dirname, '../../uploads/doodles')
fs.mkdirSync(uploadDir, { recursive: true })

function getAppKey() {
  return process.env.VIVO_AIGC_APP_KEY || process.env.VIVO_APP_KEY || ''
}

function isConfigured() {
  return !!getAppKey()
}

function buildAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAppKey()}`,
  }
}

function buildUrlParams() {
  return {
    request_id: uuidv4(),
    system_time: Math.floor(Date.now() / 1000),
    module: 'aigc',
  }
}

function normalizeParameters(parameters = {}) {
  const normalized = {}
  if (typeof parameters.size === 'string' && parameters.size.trim()) {
    normalized.size = parameters.size.trim()
  }
  if (typeof parameters.watermark === 'boolean') {
    normalized.watermark = parameters.watermark
  }
  return normalized
}

function inferSize(data) {
  if (typeof data?.size === 'string') return data.size
  if (data?.usage?.width && data?.usage?.height) {
    return `${data.usage.width}x${data.usage.height}`
  }
  return ''
}

function fromBase64(value) {
  return typeof value === 'string' && value
    ? `data:image/png;base64,${value}`
    : ''
}

function normalizeImageEntry(entry, fallbackSize = '') {
  if (typeof entry === 'string' && entry) {
    return { url: entry, size: fallbackSize }
  }
  if (!entry || typeof entry !== 'object') return null
  const url = entry.url || entry.image_url || entry.imageUrl
  if (typeof url === 'string' && url) {
    return { url, size: entry.size || fallbackSize }
  }
  const base64 = entry.b64_json || entry.base64
  const dataUrl = fromBase64(base64)
  return dataUrl ? { url: dataUrl, size: entry.size || fallbackSize } : null
}

function normalizeImages(data) {
  const fallbackSize = inferSize(data)
  const imageLists = [
    data?.images,
    data?.image_urls,
    data?.imageUrls,
    data?.output_images,
  ]
  for (const list of imageLists) {
    if (Array.isArray(list)) {
      const images = list
        .map((entry) => normalizeImageEntry(entry, fallbackSize))
        .filter(Boolean)
      if (images.length) return images
    }
  }

  if (Array.isArray(data?.binary_data_base64)) {
    const images = data.binary_data_base64
      .map((value) => fromBase64(value))
      .filter(Boolean)
      .map((url) => ({ url, size: fallbackSize }))
    if (images.length) return images
  }

  const single = normalizeImageEntry(
    data?.image || data?.url || data?.image_url || data?.imageUrl,
    fallbackSize,
  )
  if (single) return [single]

  const base64 = fromBase64(data?.b64_json || data?.base64)
  if (base64) {
    return [{ url: base64, size: fallbackSize }]
  }
  return []
}

function extensionFromContentType(contentType = '') {
  if (contentType.includes('png')) return '.png'
  if (contentType.includes('webp')) return '.webp'
  if (contentType.includes('jpeg') || contentType.includes('jpg')) return '.jpg'
  return '.png'
}

async function writeGeneratedImage(buffer, contentType) {
  const ext = extensionFromContentType(contentType)
  const filename = `${Date.now()}-${uuidv4().slice(0, 8)}${ext}`
  const filePath = path.join(uploadDir, filename)
  await fs.promises.writeFile(filePath, buffer)
  return {
    filePath,
    filename,
    url: `/uploads/doodles/${filename}`,
  }
}

async function downloadGeneratedImage(imageUrl) {
  const dataUrl = /^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/s.exec(imageUrl)
  if (dataUrl) {
    return writeGeneratedImage(Buffer.from(dataUrl[2], 'base64'), dataUrl[1])
  }

  const response = await axios.get(imageUrl, {
    responseType: 'arraybuffer',
    timeout: 60000,
  })
  const contentType = response.headers['content-type'] || ''
  if (!contentType.startsWith('image/')) {
    throw new Error('图片服务返回的下载地址不是图像资源')
  }
  return writeGeneratedImage(response.data, contentType)
}

async function generateImage({ prompt, image, parameters = {}, model = MODEL }) {
  if (!isConfigured()) {
    return { ok: false, reason: 'vivo_not_configured' }
  }

  const cleanPrompt = String(prompt || '').trim()
  if (!cleanPrompt) {
    return { ok: false, reason: 'empty_prompt', message: '请输入生成描述' }
  }

  const url = `${BASE_URL.replace(/\/$/, '')}${IMAGE_PATH}`
  const params = buildUrlParams()
  const body = {
    model,
    prompt: cleanPrompt,
  }
  if (image) body.image = image

  const extra = normalizeParameters(parameters)
  if (Object.keys(extra).length) body.parameters = extra

  try {
    const response = await axios.post(url, body, {
      headers: buildAuthHeaders(),
      params,
      timeout: 90000,
      maxBodyLength: Infinity,
    })
    const result = response.data || {}
    if (result.code !== 0) {
      return {
        ok: false,
        reason: result.code === 1003 ? 'rate_limit' : 'api_error',
        code: result.code,
        message: result.message || '图片生成失败',
        traceId: result.trace_id,
        rateLimit: result.data?.rate_limit,
      }
    }

    return {
      ok: true,
      traceId: result.trace_id,
      requestId: params.request_id,
      provider: model,
      images: normalizeImages(result.data),
      raw: result.data,
    }
  } catch (error) {
    const detail =
      error.response?.data?.message ||
      error.response?.data?.error?.message ||
      error.response?.data?.msg ||
      error.message
    return {
      ok: false,
      reason: 'api_error',
      message: detail,
      status: error.response?.status,
    }
  }
}

async function generateAndStoreImage(input) {
  const generated = await generateImage(input)
  if (!generated.ok) return generated

  const first = generated.images[0]
  if (!first?.url) {
    return {
      ok: false,
      reason: 'empty_result',
      message: '图片生成成功但未返回图片地址',
      traceId: generated.traceId,
    }
  }

  try {
    const stored = await downloadGeneratedImage(first.url)
    return {
      ...generated,
      imageUrl: stored.url,
      providerUrl: first.url,
      filename: stored.filename,
      size: first.size || '',
    }
  } catch (error) {
    return {
      ...generated,
      imageUrl: first.url,
      providerUrl: first.url,
      storeWarning: error.message,
      size: first.size || '',
    }
  }
}

module.exports = {
  isConfigured,
  generateImage,
  generateAndStoreImage,
  storeImageBuffer: writeGeneratedImage,
}
