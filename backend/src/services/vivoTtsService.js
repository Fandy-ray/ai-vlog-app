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

const ENGINE_VOICES = {
  short_audio_synthesis_jovi: [
    { id: 'vivoHelper', label: '奕雯' },
    { id: 'wanqing', label: '婉清-御姐' },
    { id: 'xiaofu', label: '晓芙-少女' },
    { id: 'yige', label: '依格' },
  ],
  long_audio_synthesis_screen: [
    { id: 'x2_vivoHelper', label: '奕雯' },
    { id: 'x2_yige', label: '依格-甜美' },
  ],
  tts_humanoid_lam: [{ id: 'F245_natural', label: '知性柔美' }],
}

function getAppKey() {
  return process.env.VIVO_AIGC_APP_KEY || process.env.VIVO_APP_KEY || ''
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
function buildWsUrl(engineidOverride) {
  const userId = uuidv4().replace(/-/g, '').slice(0, 32)
  const params = new URLSearchParams({
    engineid:
      engineidOverride || process.env.VIVO_TTS_ENGINEID || 'short_audio_synthesis_jovi',
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

  const url = buildWsUrl(options.engineid)
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

function encodePcmAsWav(pcm, sampleRate = 24000) {
  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + pcm.length, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(1, 22)
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(sampleRate * 2, 28)
  header.writeUInt16LE(2, 32)
  header.writeUInt16LE(16, 34)
  header.write('data', 36)
  header.writeUInt32LE(pcm.length, 40)
  return Buffer.concat([header, pcm])
}

async function synthesizeSpeech(options = {}) {
  const text = String(options.text || '').trim()
  if (!text) throw new Error('旁白文本不能为空')
  if (!isConfigured()) throw new Error('未配置 VIVO_AIGC_APP_KEY')

  const result = await synthesizePcm(text, {
    vcn: options.vcn,
    speed: options.speed,
    volume: options.volume,
    engineid: options.engineid,
  })
  if (!result.ok || !result.pcm?.length) {
    throw new Error(result.message || result.reason || 'TTS 合成失败')
  }

  const sampleRate = 24000
  return {
    wav: encodePcmAsWav(result.pcm, sampleRate),
    durationSec: result.pcm.length / (sampleRate * 2),
    mimeType: 'audio/wav',
    sampleRate,
  }
}

function listVoices(engineid = 'short_audio_synthesis_jovi') {
  return ENGINE_VOICES[engineid] || ENGINE_VOICES.short_audio_synthesis_jovi
}

function listEngines() {
  return [
    { id: 'short_audio_synthesis_jovi', label: '短文本（对话）', maxBytes: 2048 },
    { id: 'long_audio_synthesis_screen', label: '长文本（朗读）', maxBytes: null },
    { id: 'tts_humanoid_lam', label: '超拟人', maxBytes: null },
  ]
}

module.exports = {
  isConfigured,
  synthesizePcm,
  synthesizeToWav,
  synthesizeSpeech,
  listVoices,
  listEngines,
  pickVoice,
  VOICE_BY_STYLE,
}
