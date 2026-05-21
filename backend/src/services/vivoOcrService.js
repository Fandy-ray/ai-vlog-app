const axios = require('axios')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')

const BASE_URL = process.env.VIVO_AIGC_BASE_URL || 'https://api-ai.vivo.com.cn'
const OCR_PATH = '/ocr/general_recognition'

function getAppKey() {
  return process.env.VIVO_AIGC_APP_KEY || ''
}

function getAppId() {
  return process.env.VIVO_AIGC_APP_ID || ''
}

function isConfigured() {
  return !!getAppKey() && !!getAppId() && process.env.VIVO_OCR_ENABLED === 'true'
}

/**
 * 通用 OCR — 识别图片中的文字（可用于素材画面分析，当前默认关闭）
 */
async function recognizeImage(imagePath, options = {}) {
  if (!isConfigured()) {
    return { ok: false, reason: 'ocr_not_configured' }
  }

  const buffer = fs.readFileSync(imagePath)
  const image = buffer.toString('base64')
  const appId = getAppId()
  const pos = options.pos ?? 0

  const url = `${BASE_URL.replace(/\/$/, '')}${OCR_PATH}`
  const params = { requestId: uuidv4() }
  const data = new URLSearchParams({
    image,
    pos: String(pos),
    businessid: `aigc${appId}`,
    sessid: options.sessid || uuidv4(),
  })

  try {
    const res = await axios.post(url, data.toString(), {
      params,
      headers: {
        Authorization: `Bearer ${getAppKey()}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 15_000,
    })

    if (res.data?.error_code !== 0) {
      return {
        ok: false,
        reason: 'ocr_failed',
        message: res.data?.error_msg || 'OCR 识别失败',
      }
    }

    const words = extractWords(res.data?.result, pos)
    return { ok: true, words, raw: res.data }
  } catch (err) {
    return {
      ok: false,
      reason: 'request_failed',
      message: err.response?.data?.error_msg || err.message,
    }
  }
}

function extractWords(result, pos) {
  if (!result) return []
  if (pos === 0 && Array.isArray(result.words)) {
    return result.words.map((w) => w.words).filter(Boolean)
  }
  if (Array.isArray(result.OCR)) {
    return result.OCR.map((w) => w.words).filter(Boolean)
  }
  return []
}

module.exports = {
  isConfigured,
  recognizeImage,
}
