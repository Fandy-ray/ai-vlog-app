const fs = require('fs')
const path = require('path')
const { execFile } = require('child_process')
const { promisify } = require('util')
const WebSocket = require('ws')
const { v4: uuidv4 } = require('uuid')

const execFileAsync = promisify(execFile)
const TTS_WS_BASE = 'wss://api-ai.vivo.com.cn/tts'
const TTS_TIMEOUT_MS = 45_000

const VOICE_BY_STYLE = {
  cinematic: 'wanqing',
  japanese: 'xiaofu',
  study: 'vivoHelper',
}

function getAppKey() {
  return process.env.VIVO_AIGC_APP_KEY || ''
}

function isConfigured() {
  return !!getAppKey() && process.env.VIVO_TTS_ENABLED !== 'false'
}

function pickVoice(style) {
  const custom = process.env.VIVO_TTS_VCN
  if (custom) return custom
  return VOICE_BY_STYLE[style] || VOICE_BY_STYLE.cinematic
}

/** vivo TTS 要求 URL 带齐机型参数，全 unknown 会握手 400 */
function buildWsUrl() {
  const userId = uuidv4().replace(/-/g, '').slice(0, 32)
  const params = new URLSearchParams({
    engineid: process.env.VIVO_TTS_ENGINEID || 'short_audio_synthesis_jovi',
    system_time: String(Math.floor(Date.now() / 1000)),
    user_id: userId,
    model: process.env.VIVO_TTS_MODEL || 'V1809A',
    product: process.env.VIVO_TTS_PRODUCT || 'PD1809',
    package: process.env.VIVO_TTS_PACKAGE || 'com.vivo.agent',
    client_version: process.env.VIVO_TTS_CLIENT_VERSION || '47405',
    system_version: process.env.VIVO_TTS_SYSTEM_VERSION || 'PD1809_A_7.6.22',
    sdk_version: process.env.VIVO_TTS_SDK_VERSION || '1.1.2.1',
    android_version: process.env.VIVO_TTS_ANDROID_VERSION || '9',
    requestId: uuidv4(),
  })
  return `${TTS_WS_BASE}?${params.toString()}`
}

function buildWsHeaders(appKey) {
  return {
    Authorization: `Bearer ${appKey}`,
    'X-AI-GATEWAY-SIGNATURE': process.env.VIVO_TTS_GATEWAY_SIGNATURE || 'developers-aigc',
    vaid: process.env.VIVO_TTS_VAID || '123456789',
  }
}

function synthesizePcm(text, options = {}) {
  const appKey = getAppKey()
  if (!appKey) {
    return Promise.resolve({ ok: false, reason: 'vivo_not_configured' })
  }

  const trimmed = String(text || '').trim()
  if (!trimmed) {
    return Promise.resolve({ ok: false, reason: 'empty_text' })
  }

  const url = buildWsUrl()
  const vcn = options.vcn || pickVoice(options.style)

  return new Promise((resolve) => {
    const chunks = []
    let settled = false
    let sentText = false
    let ws

    const finish = (result) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      try {
        ws?.close()
      } catch {
        /* ignore */
      }
      resolve(result)
    }

    const sendText = () => {
      if (sentText) return
      sentText = true
      const req = {
        aue: 0,
        auf: 'audio/L16;rate=24000',
        vcn,
        speed: Number(options.speed) || 52,
        volume: Number(options.volume) || 58,
        text: Buffer.from(trimmed, 'utf8').toString('base64'),
        encoding: 'utf8',
        sfl: 1,
        reqId: Date.now(),
      }
      ws.send(JSON.stringify(req))
    }

    try {
      ws = new WebSocket(url, { headers: buildWsHeaders(appKey) })
    } catch (err) {
      finish({ ok: false, reason: 'ws_error', message: err.message })
      return
    }

    const timer = setTimeout(() => {
      if (chunks.length > 0) {
        finish({ ok: true, pcm: Buffer.concat(chunks), vcn })
        return
      }
      finish({ ok: false, reason: 'timeout', message: 'TTS 合成超时' })
    }, TTS_TIMEOUT_MS)

    ws.on('error', (err) => {
      console.error('[tts] ws error:', err.message)
      finish({ ok: false, reason: 'ws_error', message: err.message })
    })

    ws.on('close', () => {
      if (chunks.length > 0 && !settled) {
        finish({ ok: true, pcm: Buffer.concat(chunks), vcn })
      }
    })

    ws.on('message', (raw) => {
      let payload
      try {
        payload = JSON.parse(raw.toString())
      } catch {
        return
      }

      if (payload.error_code !== 0) {
        finish({
          ok: false,
          reason: 'api_error',
          message: payload.error_msg || `TTS error ${payload.error_code}`,
        })
        return
      }

      if (!sentText && !payload.data) {
        sendText()
        return
      }

      if (payload.data?.audio) {
        const part = Buffer.from(payload.data.audio, 'base64')
        if (part.length) chunks.push(part)
      }

      const status = payload.data?.status
      if (status === 2 || status === '2') {
        if (chunks.length) {
          finish({ ok: true, pcm: Buffer.concat(chunks), vcn })
        } else {
          finish({ ok: false, reason: 'empty_audio', message: 'TTS 返回空音频' })
        }
      }
    })
  })
}

async function pcmToWav(pcmBuffer, wavPath) {
  const pcmPath = `${wavPath}.pcm`
  fs.writeFileSync(pcmPath, pcmBuffer)
  try {
    await execFileAsync(
      'ffmpeg',
      ['-y', '-f', 's16le', '-ar', '24000', '-ac', '1', '-i', pcmPath, wavPath],
      { maxBuffer: 16 * 1024 * 1024 },
    )
  } finally {
    if (fs.existsSync(pcmPath)) fs.unlinkSync(pcmPath)
  }
}

async function synthesizeToWav(text, wavPath, options = {}) {
  const result = await synthesizePcm(text, options)
  if (!result.ok || !result.pcm?.length) {
    return result
  }

  try {
    fs.mkdirSync(path.dirname(wavPath), { recursive: true })
    await pcmToWav(result.pcm, wavPath)
    return { ok: true, path: wavPath, vcn: result.vcn }
  } catch (err) {
    return { ok: false, reason: 'wav_encode_failed', message: err.message }
  }
}

module.exports = {
  isConfigured,
  synthesizePcm,
  synthesizeToWav,
  pickVoice,
  VOICE_BY_STYLE,
}
