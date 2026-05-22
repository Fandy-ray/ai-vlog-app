const WebSocket = require('ws')
const { v4: uuidv4 } = require('uuid')

const TTS_HOST = 'wss://api-ai.vivo.com.cn/tts'

const SHORT_VOICES = [
  { id: 'vivoHelper', label: '奕雯' },
  { id: 'yunye', label: '云野-温柔' },
  { id: 'wanqing', label: '婉清-御姐' },
  { id: 'xiaofu', label: '晓芙-少女' },
  { id: 'yige_child', label: '小萌-女童' },
  { id: 'yige', label: '依格' },
  { id: 'yiyi', label: '依依' },
  { id: 'xiaoming', label: '小茗' }
]

const LONG_VOICES = [
  { id: 'x2_vivoHelper', label: '奕雯' },
  { id: 'x2_yige', label: '依格-甜美' },
  { id: 'x2_yunye', label: '云野-温柔' },
  { id: 'x2_F25', label: '倩倩-清甜' },
  { id: 'x2_F82', label: '英文女声' }
]

const HUMANOID_VOICES = [
  { id: 'F245_natural', label: '知性柔美' },
  { id: 'M24', label: '俊朗男声' },
  { id: 'YIGEXIAOV', label: '依格' },
  { id: 'FY_CANTONESE', label: '粤语' },
  { id: 'FY_SICHUANHUA', label: '四川话' }
]

const ENGINE_VOICES = {
  short_audio_synthesis_jovi: SHORT_VOICES,
  long_audio_synthesis_screen: LONG_VOICES,
  tts_humanoid_lam: HUMANOID_VOICES
}

function pcmToWav(pcm, sampleRate = 24000, channels = 1, bits = 16) {
  const blockAlign = channels * (bits / 8)
  const byteRate = sampleRate * blockAlign
  const header = Buffer.alloc(44)

  header.write('RIFF', 0)
  header.writeUInt32LE(36 + pcm.length, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(channels, 22)
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(byteRate, 28)
  header.writeUInt16LE(blockAlign, 32)
  header.writeUInt16LE(bits, 34)
  header.write('data', 36)
  header.writeUInt32LE(pcm.length, 40)

  return Buffer.concat([header, pcm])
}

function buildWsUrl(engineid) {
  const userId = uuidv4().replace(/-/g, '').slice(0, 32)
  const params = new URLSearchParams({
    engineid,
    system_time: String(Math.floor(Date.now() / 1000)),
    user_id: userId,
    model: 'unknown',
    product: 'unknown',
    package: 'com.memento.editor',
    client_version: '1.0.0',
    system_version: 'unknown',
    sdk_version: '1.0.0',
    android_version: 'unknown',
    requestId: uuidv4()
  })

  return `${TTS_HOST}?${params.toString()}`
}

function waitForOpen(ws, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('TTS 连接超时'))
    }, timeoutMs)

    ws.once('open', () => {
      clearTimeout(timer)
      resolve()
    })
    ws.once('error', err => {
      clearTimeout(timer)
      reject(err)
    })
  })
}

function waitForHandshake(ws, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('TTS 握手超时'))
    }, timeoutMs)

    ws.once('message', raw => {
      clearTimeout(timer)
      try {
        const payload = JSON.parse(String(raw))
        if (payload.error_code !== 0) {
          reject(new Error(payload.error_msg || `TTS 握手失败 (${payload.error_code})`))
          return
        }
        resolve(payload)
      } catch (error) {
        reject(error)
      }
    })

    ws.once('error', err => {
      clearTimeout(timer)
      reject(err)
    })
  })
}

function synthesizeOnSocket(ws, text, options = {}) {
  const {
    vcn = 'yige',
    speed = 50,
    volume = 50,
    aue = 0,
    timeoutMs = 120000
  } = options

  const payload = {
    aue,
    auf: 'audio/L16;rate=24000',
    vcn,
    speed,
    volume,
    sfl: 1,
    encoding: 'utf8',
    text: Buffer.from(text, 'utf8').toString('base64'),
    reqId: Date.now()
  }

  return new Promise((resolve, reject) => {
    const chunks = []
    const timer = setTimeout(() => {
      ws.close()
      reject(new Error('TTS 合成超时'))
    }, timeoutMs)

    ws.on('message', raw => {
      try {
        const message = JSON.parse(String(raw))
        if (message.error_code !== 0) {
          clearTimeout(timer)
          ws.close()
          reject(new Error(message.error_msg || `TTS 合成失败 (${message.error_code})`))
          return
        }

        if (!message.data || !message.data.audio) {
          return
        }

        chunks.push(Buffer.from(message.data.audio, 'base64'))

        if (message.data.status === 2) {
          clearTimeout(timer)
          ws.close()
          resolve(Buffer.concat(chunks))
        }
      } catch (error) {
        clearTimeout(timer)
        ws.close()
        reject(error)
      }
    })

    ws.on('error', err => {
      clearTimeout(timer)
      reject(err)
    })

    ws.send(JSON.stringify(payload))
  })
}

/**
 * @param {object} options
 * @param {string} options.text
 * @param {string} [options.vcn]
 * @param {string} [options.engineid]
 * @param {number} [options.speed]
 * @param {number} [options.volume]
 */
async function synthesizeSpeech(options = {}) {
  const appKey = process.env.VIVO_APP_KEY || process.env.APP_KEY
  if (!appKey) {
    throw new Error('未配置 VIVO_APP_KEY，请在 backend/.env 中设置')
  }

  const text = String(options.text || '').trim()
  if (!text) {
    throw new Error('旁白文本不能为空')
  }

  const engineid = options.engineid || 'short_audio_synthesis_jovi'
  const url = buildWsUrl(engineid)

  const ws = new WebSocket(url, {
    headers: {
      Authorization: `Bearer ${appKey}`,
      'X-AI-GATEWAY-SIGNATURE': 'developers-aigc',
      vaid: process.env.VIVO_VAID || '123456789'
    }
  })

  await waitForOpen(ws)
  await waitForHandshake(ws)

  const pcm = await synthesizeOnSocket(ws, text, {
    vcn: options.vcn || 'yige',
    speed: options.speed,
    volume: options.volume
  })

  if (!pcm.length) {
    throw new Error('TTS 未返回音频数据')
  }

  const wav = pcmToWav(pcm)
  const durationSec = pcm.length / (24000 * 2)

  return {
    wav,
    durationSec,
    mimeType: 'audio/wav',
    sampleRate: 24000
  }
}

function listVoices(engineid = 'short_audio_synthesis_jovi') {
  return ENGINE_VOICES[engineid] || SHORT_VOICES
}

function listEngines() {
  return [
    { id: 'short_audio_synthesis_jovi', label: '短文本（对话）', maxBytes: 2048 },
    { id: 'long_audio_synthesis_screen', label: '长文本（朗读）', maxBytes: null },
    { id: 'tts_humanoid_lam', label: '超拟人', maxBytes: null }
  ]
}

module.exports = {
  synthesizeSpeech,
  listVoices,
  listEngines,
  pcmToWav
}
