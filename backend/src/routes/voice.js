const express = require('express')
const { randomUUID } = require('crypto')
const { chatCompletion } = require('../services/vivoChat')

const router = express.Router()

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

function mapAiErrorMessage(message = '') {
  const msg = String(message).trim()
  if (/invalid input context/i.test(msg)) {
    return '暂未理解这句描述，请说明具体画面、风格或剪辑需求'
  }
  if (/content.?filter|safety|违规|敏感/i.test(msg)) {
    return '描述可能包含不适用内容，请调整措辞后重试'
  }
  return msg || '调用 AI 接口失败'
}

function getAppKey() {
  return process.env.VIVO_AIGC_APP_KEY || process.env.VIVO_APP_KEY || ''
}

router.post('/voice/text-suggestion', async (req, res) => {
  if (!getAppKey()) {
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
    '你是短视频文案助手。用户会用自然语言描述想要的标题或解说文案。',
    '即使用户描述很简短、口语化，也要尽量理解其意图并给出合理文案。',
    '不要拒绝输入，不要输出错误说明，始终返回 JSON。',
    '要求：',
    '1. title 不超过 16 个字，适合作为视频片头标题',
    '2. caption 不超过 30 个字，适合作为画面解说或字幕',
    '3. 语气自然，符合短视频表达',
    '4. 只输出 JSON：{"title":"...","caption":"..."}',
  ].join('\n')

  try {
    const content = await chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `用户需求：${userInput}\n\n请输出 title 和 caption 的 JSON。`,
        },
      ],
      temperature: 0.7,
      maxTokens: 512,
    })

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
    return res.status(status).json({
      code: status,
      message: mapAiErrorMessage(error?.response?.data?.message || error.message),
      detail: error?.response?.data || null,
    })
  }
})

router.post('/voice/parse-commands', async (req, res) => {
  if (!getAppKey()) {
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
    '你是短视频剪辑语音助手。用户用口语描述剪辑需求，可能不规范、有方言、多意图混合、或缺少具体秒数。',
    '你的任务是尽可能理解真实意图，输出可执行的 JSON，不要局限于固定词表。',
    '只输出 JSON，不要解释。格式：',
    '{"commands":[{"type":"...","start":12,"end":13,"time":10,"clipFrom":1,"clipTo":2,"rate":2,"direction":"left|right","text":"描述","filterId":"soft","effectId":"light","transition":"fade","transitionDuration":0.5}],"style":{"filterId":"warm","effectId":"light","title":"风格名","hint":"说明"}}',
    '',
    'commands.type 可选：',
    'delete, keep, speed, rotate, mirror, bgm, music, transition, split,',
    'filter, effect, seek, mute, unmute, crop, narration, audio',
    '',
    '理解原则：',
    '- 一句话可含多条 commands，全部提取出来',
    '- 「太长了」「前面不要了」「切掉开头几秒」→ 推断 delete 或 split（合理估计秒数，无法确定则不编造）',
    '- 「快点」「慢放」「二倍速」→ speed',
    '- 「加柔光/电影感/黑白/复古」→ filter；「光晕/暗角/飘雪」→ effect',
    '- 「海边旅行/低落/科技测评/我激动」等氛围 → filter+effect 和/或 style 字段',
    '- 「配音乐/来首轻松的」→ bgm/music，text 保留用户原话',
    '- 「旁白/配音」→ narration；「手动选曲/音频面板」→ audio',
    '- 不要输出「打开某某面板」类指令，滤镜特效应直接给出 filterId/effectId',
    '',
    '字段说明：',
    '- filterId: warm|cool|soft|bw|cinematic|vintage|fresh|vivid|none',
    '- effectId: vignette|film|grain|light|dream|sparkle|snow|none',
    '- transition: 必须有衔接点 time 或 clipFrom+clipTo(clipTo=clipFrom+1)，否则不输出',
    '- style: 当用户描述整体风格/情绪/题材时使用，含 filterId/effectId/title/hint',
    '- 无法确定数值时不要编造；commands 可为空数组，但仍可只给 style',
  ].join('\n')

  try {
    const content = await chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `用户原话：${userInput}\n\n请解析为 JSON。`,
        },
      ],
      temperature: 0.35,
      maxTokens: 1024,
    })

    const parsed = extractJson(content) || {}
    const commands = Array.isArray(parsed.commands) ? parsed.commands : []
    const style =
      parsed.style && typeof parsed.style === 'object' ? parsed.style : null

    return res.json({
      code: 0,
      message: 'ok',
      data: { requestId, commands, style, raw: content },
    })
  } catch (error) {
    const status = error?.response?.status || 500
    return res.status(status).json({
      code: status,
      message: mapAiErrorMessage(error?.response?.data?.message || error.message),
      detail: error?.response?.data || null,
    })
  }
})

module.exports = router
