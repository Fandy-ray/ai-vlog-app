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
  const appKey = process.env.VIVO_APP_KEY
  if (!appKey) {
    return res.status(500).json({
      code: 500,
      message: '缺少 VIVO_APP_KEY 环境变量',
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

module.exports = router
