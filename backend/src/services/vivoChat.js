const axios = require('axios')
const { randomUUID } = require('crypto')

const DEFAULT_BASE_URL = 'https://api-ai.vivo.com.cn/v1'
const DEFAULT_MODEL = 'Doubao-Seed-2.0-mini'

/**
 * 调用 vivo 大模型 Chat Completions（OpenAI 兼容协议）
 * @see https://api-ai.vivo.com.cn/v1/chat/completions
 */
async function chatCompletion({ messages, model, maxTokens, temperature }) {
  const appKey = process.env.VIVO_APP_KEY
  if (!appKey) {
    throw new Error('未配置 VIVO_APP_KEY')
  }

  const baseUrl = (process.env.VIVO_CHAT_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '')
  const requestId = randomUUID()
  const modelName = model || process.env.VIVO_CHAT_MODEL || DEFAULT_MODEL

  const payload = {
    model: modelName,
    messages,
    stream: false,
    request_id: requestId,
    temperature: temperature ?? 0.3,
    max_tokens: maxTokens ?? 512,
  }

  if (modelName.startsWith('Doubao-Seed')) {
    payload.thinking = { type: 'disabled' }
  } else if (modelName === 'Volc-DeepSeek-V3.2') {
    payload.reasoning_effort = 'minimal'
  } else if (modelName === 'qwen3.5-plus') {
    payload.enable_thinking = false
  }

  const response = await axios.post(`${baseUrl}/chat/completions`, payload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${appKey}`,
    },
    params: { request_id: requestId },
    timeout: Number(process.env.VIVO_CHAT_TIMEOUT_MS) || 45000,
  })

  const choice = response.data?.choices?.[0]
  const content = choice?.message?.content
  if (typeof content === 'string' && content.trim()) {
    return content.trim()
  }

  const reasoning = choice?.message?.reasoning_content
  if (typeof reasoning === 'string' && reasoning.trim()) {
    return reasoning.trim()
  }

  throw new Error('大模型返回内容为空')
}

module.exports = { chatCompletion }
