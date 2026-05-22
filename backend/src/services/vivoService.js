const axios = require('axios')
const { v4: uuidv4 } = require('uuid')

const BASE_URL = process.env.VIVO_AIGC_BASE_URL || 'https://api-ai.vivo.com.cn'
const CHAT_PATH = process.env.VIVO_AIGC_CHAT_PATH || '/v1/chat/completions'
const CHAT_MODEL = process.env.VIVO_AIGC_CHAT_MODEL || 'Doubao-Seed-2.0-mini'

function getAppKey() {
  return process.env.VIVO_AIGC_APP_KEY || ''
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

/** 是否为 OpenAI 兼容大模型接口（文档：/v1/chat/completions） */
function isOpenAiChatApi() {
  const path = CHAT_PATH.toLowerCase()
  return path.includes('chat/completions') || path.startsWith('/v1/')
}

const STYLE_GUIDE = {
  cinematic: '电影感：青橙对比、氛围钢琴 BGM、慢节奏、留白转场、偏情绪叙事',
  japanese: '日系：暖白清透、轻快木吉他、柔和淡入淡出、生活感短字幕',
  study: '学习风：柔光低饱和、Lo-fi 节拍、干净时间轴字幕、专注沉稳',
}

function buildVlogPrompt(materials, scenes, options = {}) {
  const styleId = options.style || 'cinematic'
  const styleGuide = STYLE_GUIDE[styleId] || STYLE_GUIDE.cinematic

  const sceneLines = (scenes || []).map(
    (s, i) =>
      `${i + 1}. ${s.sceneTitle || s.title}（${s.sceneId}）— 时长约 ${s.duration || 4}s：${s.subtitle || ''}`,
  )
  const materialLines = (materials || []).map(
    (m, i) => `${i + 1}. ${m.name}（${m.sceneId || 'clip'}，${m.duration}s）`,
  )

  const themeHint = options.theme ? `\n【用户主题】${options.theme}` : ''
  const refineHint = options.refinement
    ? `\n【用户额外要求】${options.refinement}（若提到片头标题、字幕，必须体现在输出中）`
    : ''

  return `你是专业 Vlog 剪辑策划。用户已拍摄多段实拍素材，将按顺序拼接成片。
请根据所选风格生成旁白、片头标题与字幕方案。${themeHint}${refineHint}

【成片风格】${styleGuide}

【场景列表】
${sceneLines.join('\n')}

【素材文件】
${materialLines.join('\n')}

重要：
1. narration 将作为 TTS 配音原文逐字朗读，必须与各镜头内容一致，50-120 字，口语化中文，不要书面腔。
2. 若用户需要标题或片头字，设置 burnVideoTitle 为 true，并填写 videoTitle（8-16 字）。
3. 为每个场景指定 segmentMoods，用于匹配背景音乐氛围。

请严格只输出 JSON（不要 markdown），格式：
{
  "title": "成片标题",
  "videoTitle": "烧录在片头画面上的大标题",
  "burnVideoTitle": true,
  "narration": "TTS 将逐字朗读的旁白全文",
  "captions": [{"sceneId":"intro","text":"该镜头底部字幕"}],
  "segmentMoods": [{"sceneId":"intro","mood":"nature"}],
  "styleHint": "剪辑节奏建议一句话",
  "transition": "fade 或 smooth 或 wipe"
}

segmentMoods.mood 只能从以下选一：nature, concert, urban, food, calm, energetic, study`
}

function extractJson(text) {
  if (!text) return null
  const trimmed = String(text).trim()
  try {
    return JSON.parse(trimmed)
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/)
    if (!match) return null
    try {
      return JSON.parse(match[0])
    } catch {
      return null
    }
  }
}

function parseChatContent(data) {
  return (
    data?.choices?.[0]?.message?.content ||
    data?.content ||
    data?.data?.content ||
    data?.result?.content ||
    ''
  )
}

async function chatCompletionOpenAi(userPrompt, options = {}) {
  const requestId = uuidv4()
  const url = `${BASE_URL.replace(/\/$/, '')}${CHAT_PATH.startsWith('/') ? CHAT_PATH : `/${CHAT_PATH}`}`

  const body = {
    model: options.model || CHAT_MODEL,
    messages: [{ role: 'user', content: userPrompt }],
    stream: false,
    max_tokens: options.max_tokens ?? 4096,
    temperature: options.temperature ?? 0.7,
    thinking: { type: 'disabled' },
  }

  const res = await axios.post(url, body, {
    headers: buildAuthHeaders(),
    params: { request_id: requestId },
    timeout: options.timeout ?? 90000,
  })

  return { content: parseChatContent(res.data), raw: res.data, requestId }
}

/** 旧版蓝心 /vivogpt/v1/chat（部分账号已下线） */
async function chatCompletionLegacy(userPrompt) {
  const url = `${BASE_URL.replace(/\/$/, '')}${CHAT_PATH}`
  const body = {
    requestId: uuidv4(),
    sessionId: uuidv4(),
    messages: [{ role: 'user', content: userPrompt }],
  }

  const res = await axios.post(url, body, {
    headers: buildAuthHeaders(),
    params: {
      request_id: uuidv4(),
      system_time: Math.floor(Date.now() / 1000),
      module: 'aigc',
    },
    timeout: 60000,
  })

  return { content: parseChatContent(res.data), raw: res.data }
}

async function chatCompletion(userPrompt, options = {}) {
  if (isOpenAiChatApi()) {
    return chatCompletionOpenAi(userPrompt, options)
  }
  return chatCompletionLegacy(userPrompt)
}

async function generateVlogScript({
  materials = [],
  scenes = [],
  style = 'cinematic',
  theme = '',
  refinement = '',
}) {
  if (!isConfigured()) {
    return { ok: false, reason: 'vivo_not_configured' }
  }

  try {
    const prompt = buildVlogPrompt(materials, scenes, { style, theme, refinement })
    const { content } = await chatCompletion(prompt)
    const parsed = extractJson(content)

    if (!parsed) {
      return { ok: false, reason: 'parse_failed', raw: content }
    }

    return { ok: true, data: parsed }
  } catch (error) {
    const detail =
      error.response?.data?.message ||
      error.response?.data?.msg ||
      error.response?.data?.error?.message ||
      error.message
    return {
      ok: false,
      reason: 'api_error',
      message: detail,
      status: error.response?.status,
    }
  }
}

module.exports = {
  isConfigured,
  isOpenAiChatApi,
  generateVlogScript,
  chatCompletion,
  extractJson,
}
