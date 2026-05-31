const express = require('express')
const axios = require('axios')
const { randomUUID } = require('crypto')

const router = express.Router()

const DEFAULT_MODEL = 'Doubao-Seed-2.0-mini'
const VIVO_API_URL = 'https://api-ai.vivo.com.cn/v1/chat/completions'

function extractJson(text) {
  if (!text) return null
  const trimmed = String(text).trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced?.[1]?.trim() ?? trimmed
  try {
    const parsed = JSON.parse(candidate)
    if (parsed && typeof parsed === 'object') return parsed
  } catch {}
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(candidate.slice(start, end + 1))
    } catch {}
  }
  return null
}

router.post('/voice/text-suggestion', async (req, res) => {
  const appKey = process.env.VIVO_AIGC_APP_KEY || process.env.VIVO_APP_KEY
  if (!appKey) {
    return res.status(500).json({
      code: 500,
      message: '缺少 VIVO_AIGC_APP_KEY 或 VIVO_APP_KEY 环境变量',
    })
  }

  const userInput = String(req.body?.input || req.body?.text || '').trim()
  if (!userInput) {
    return res.status(400).json({
      code: 400,
      message: 'input 不能为空',
    })
  }

  const requestId = randomUUID()
  const systemPrompt = [
    '你是一个短视频文案助手。',
    '根据用户的口语化需求，生成适合短视频画面上的简短文字建议。',
    '要求：',
    '1. 文案简短，适合放在视频上',
    '2. 标题不超过16个字',
    '3. 解说不超过30个字',
    '4. 语气自然、符合短视频表达',
    '5. 输出必须是 JSON，包含 title 和 caption 两个字段',
  ].join('\n')

  try {
    const response = await axios.post(
      VIVO_API_URL,
      {
        model: process.env.VIVO_TEXT_MODEL || DEFAULT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userInput },
        ],
        stream: false,
        temperature: 0.7,
        max_tokens: 512,
        reasoning_effort: 'minimal',
      },
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${appKey}`,
        },
        params: { request_id: requestId },
        timeout: 45000,
      },
    )

    const content = response.data?.choices?.[0]?.message?.content ?? ''
    const parsed = extractJson(content) || {}
    const title = typeof parsed.title === 'string' ? parsed.title.trim() : ''
    const caption = typeof parsed.caption === 'string' ? parsed.caption.trim() : ''

    return res.json({
      code: 0,
      message: 'ok',
      data: {
        requestId,
        title,
        caption,
        raw: content,
      },
    })
  } catch (error) {
    const status = error?.response?.status || 500
    const data = error?.response?.data
    return res.status(status).json({
      code: status,
      message: data?.message || error.message || '调用 AI 接口失败',
      detail: data || null,
    })
  }
})

router.post('/voice/parse-commands', async (req, res) => {
  const appKey = process.env.VIVO_AIGC_APP_KEY || process.env.VIVO_APP_KEY
  if (!appKey) {
    return res.status(500).json({
      code: 500,
      message: '缺少 VIVO_AIGC_APP_KEY 或 VIVO_APP_KEY 环境变量',
    })
  }

  const userInput = String(req.body?.text || req.body?.input || '').trim()
  if (!userInput) {
    return res.status(400).json({ code: 400, message: 'text 不能为空' })
  }

  const requestId = randomUUID()
  const systemPrompt = [
    '你是短视频剪辑语音助手。把用户的口语指令解析为 JSON。',
    '只输出 JSON，不要解释。格式：',
    '{"commands":[{"type":"delete|keep|speed|rotate|mirror|bgm|music|transition|split|filter|effect|seek|mute|unmute|crop|narration|audio","start":12,"end":13,"time":10,"clipFrom":1,"clipTo":2,"rate":2,"direction":"left|right","text":"描述","filterId":"soft","effectId":"light","transition":"fade","transitionDuration":0.5}]}',
    '规则：',
    '- type=delete：删除时间段，需要 start/end（秒）',
    '- type=keep：只保留时间段',
    '- type=speed：倍速，rate 为数字（二倍速=2）',
    '- type=rotate：direction 为 left 或 right；可选 rate 表示角度（默认 90）',
    '- type=mirror：镜像',
    '- type=bgm 或 music：给视频配乐，text 为用户想要的音乐风格描述',
    '- type=transition：仅在已有片段衔接处加转场，禁止依赖播放头，禁止在中途切开。须二选一且必填其一：① time=衔接点秒数（必须是两段视频的交界秒数）；② clipFrom+clipTo=相邻片段序号（clipTo 必须等于 clipFrom+1，如第1与第2段之间则 clipFrom=1, clipTo=2）。若用户未说明衔接点秒数也未说明相邻片段序号，不要输出 transition 指令',
    '- 示例：「第10秒加叠化转场」→ time=10, transition=dissolve；「第1和第2个片段之间加划像」→ clipFrom=1, clipTo=2, transition=wipe；只说「加转场」而无位置 → 不要输出',
    '- type=split：在 time 处分割片段',
    '- type=filter：filterId 为 warm|cool|soft|bw|cinematic|vintage|fresh|vivid|none',
    '- type=effect：effectId 为 vignette|film|grain|light|dream|sparkle|snow|none',
    '- type=seek：跳转到 time 秒',
    '- type=mute：关闭原声；type=unmute：保留原声',
    '- type=crop：进入裁剪；type=narration：旁白，text 为文稿',
    '- type=audio：打开音频面板选曲',
    '- 无法理解的不要编造，commands 可为空数组',
  ].join('\n')

  try {
    const response = await axios.post(
      VIVO_API_URL,
      {
        model: process.env.VIVO_TEXT_MODEL || DEFAULT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userInput },
        ],
        stream: false,
        temperature: 0.2,
        max_tokens: 512,
        reasoning_effort: 'minimal',
      },
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${appKey}`,
        },
        params: { request_id: requestId },
        timeout: 45000,
      },
    )

    const content = response.data?.choices?.[0]?.message?.content ?? ''
    const parsed = extractJson(content) || {}
    const commands = Array.isArray(parsed.commands) ? parsed.commands : []

    return res.json({
      code: 0,
      message: 'ok',
      data: { requestId, commands, raw: content },
    })
  } catch (error) {
    const status = error?.response?.status || 500
    const data = error?.response?.data
    return res.status(status).json({
      code: status,
      message: data?.message || error.message || '解析指令失败',
      detail: data || null,
    })
  }
})

module.exports = router
