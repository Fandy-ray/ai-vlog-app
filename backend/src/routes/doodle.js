const express = require('express')
const vivoImageService = require('../services/vivoImageService')

const router = express.Router()

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

module.exports = router
