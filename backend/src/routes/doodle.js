const express = require('express')
const multer = require('multer')
const vivoImageService = require('../services/vivoImageService')

const router = express.Router()
const foregroundUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
})

function pickParameters(body) {
  const parameters = body.parameters && typeof body.parameters === 'object'
    ? body.parameters
    : {}
  const output = {}
  const size = typeof body.size === 'string' ? body.size : parameters.size
  if (typeof size === 'string' && size.trim()) {
    output.size = size.trim()
  }
  if (typeof parameters.watermark === 'boolean') {
    output.watermark = parameters.watermark
  }
  return output
}

router.post('/doodle/generate', async (req, res) => {
  if (!vivoImageService.isConfigured()) {
    res.status(503).json({
      code: 'vivo_not_configured',
      message: '未配置 VIVO_AIGC_APP_KEY',
    })
    return
  }

  const prompt = String(req.body.prompt || '').trim()
  if (!prompt) {
    res.status(400).json({ code: 'empty_prompt', message: '请输入生成描述' })
    return
  }

  const image = req.body.image
  const validImage =
    image == null ||
    (typeof image === 'string' && !!image.trim()) ||
    (Array.isArray(image) &&
      image.length > 0 &&
      image.every((item) => typeof item === 'string' && !!item.trim()))
  if (!validImage) {
    res.status(400).json({
      code: 'invalid_image',
      message: 'image 必须是图片 URL、base64 字符串或字符串数组',
    })
    return
  }

  const result = await vivoImageService.generateAndStoreImage({
    prompt,
    image,
    parameters: pickParameters(req.body),
  })

  if (!result.ok) {
    const status = result.reason === 'rate_limit' ? 429 : 502
    res.status(status).json({
      code: result.code || result.reason || 'doodle_failed',
      message: result.message || '图片生成失败',
      traceId: result.traceId,
      rateLimit: result.rateLimit,
    })
    return
  }

  res.json({
    code: 0,
    message: 'success',
    data: {
      imageUrl: result.imageUrl,
      providerUrl: result.providerUrl,
      images: result.images,
      size: result.size,
      provider: result.provider,
      traceId: result.traceId,
      requestId: result.requestId,
      storeWarning: result.storeWarning,
    },
  })
})

router.post('/doodle/assets', foregroundUpload.single('image'), async (req, res) => {
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  if (
    !req.file ||
    req.file.mimetype !== 'image/png' ||
    req.file.buffer.length < pngSignature.length ||
    !req.file.buffer.subarray(0, pngSignature.length).equals(pngSignature)
  ) {
    res.status(400).json({
      code: 'invalid_foreground',
      message: '仅支持保存 PNG 透明图层',
    })
    return
  }

  try {
    const stored = await vivoImageService.storeImageBuffer(
      req.file.buffer,
      req.file.mimetype,
    )
    res.json({
      code: 0,
      message: 'success',
      data: { imageUrl: stored.url },
    })
  } catch (error) {
    res.status(500).json({
      code: 'store_foreground_failed',
      message: error.message || '透明图保存失败',
    })
  }
})

module.exports = router
