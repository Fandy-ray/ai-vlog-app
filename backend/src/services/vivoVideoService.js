const axios = require('axios')
const { v4: uuidv4 } = require('uuid')

const BASE_URL = process.env.VIVO_AIGC_BASE_URL || 'https://api-ai.vivo.com.cn'
const SUBMIT_PATH = '/api/v1/submit_task'
const QUERY_PATH = '/api/v1/query_task'
const MODEL = process.env.VIVO_VIDEO_MODEL || 'Doubao-Seedance-1.0-pro'

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

function buildUrlParams() {
  return {
    request_id: uuidv4(),
    system_time: Math.floor(Date.now() / 1000),
    module: 'aigc',
  }
}

function buildVlogVideoPrompt(scenes = [], narration = '') {
  const parts = scenes.map(
    (s, i) =>
      `镜头${i + 1}：${s.sceneTitle || s.title}，${s.subtitle || ''}，约${s.duration || 4}秒。`,
  )
  const sceneText = parts.length ? parts.join('') : '日常生活记录，温暖自然。'
  const voiceHint = narration ? `旁白氛围：${narration}。` : ''

  return `竖屏旅行 Vlog 风格，多个镜头自然衔接。${sceneText}${voiceHint}画面干净、有电影感，人物与环境协调，适合 9:16 短视频。 --ratio 9:16 --dur 5`
}

/**
 * 提交视频生成任务（文生视频）
 * 文档：https://api-ai.vivo.com.cn — 视频生成 submit_task
 */
async function submitVideoTask(prompt) {
  const url = `${BASE_URL.replace(/\/$/, '')}${SUBMIT_PATH}`
  const params = buildUrlParams()
  const body = {
    model: MODEL,
    content: [{ type: 'text', text: prompt }],
  }

  const res = await axios.post(url, body, {
    headers: buildAuthHeaders(),
    params,
    timeout: 60000,
  })

  const data = res.data || {}
  if (data.code !== 0) {
    const err = new Error(data.message || 'submit_task failed')
    err.code = data.code
    err.rateLimit = data.data?.rate_limit
    throw err
  }

  return {
    taskId: data.data?.id,
    traceId: data.trace_id,
    requestId: params.request_id,
  }
}

/**
 * 查询视频生成任务
 */
async function queryVideoTask(taskId) {
  const url = `${BASE_URL.replace(/\/$/, '')}${QUERY_PATH}`
  const params = {
    ...buildUrlParams(),
    task_id: taskId,
  }

  const res = await axios.get(url, {
    headers: buildAuthHeaders(),
    params,
    timeout: 30000,
  })

  return res.data || {}
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 轮询直到成功/失败/超时
 */
async function pollVideoTask(taskId, options = {}) {
  const maxAttempts = options.maxAttempts || 60
  const intervalMs = options.intervalMs || 5000

  for (let i = 0; i < maxAttempts; i++) {
    const data = await queryVideoTask(taskId)
    if (data.code !== 0) {
      const err = new Error(data.message || 'query_task failed')
      err.code = data.code
      throw err
    }

    const status = data.data?.status
    if (status === 'succeeded') {
      return {
        ok: true,
        videoUrl: data.data?.content?.video_url || '',
        taskId,
        raw: data.data,
      }
    }
    if (status === 'failed' || status === 'error') {
      return {
        ok: false,
        reason: 'task_failed',
        message: data.data?.error?.message || data.message || '视频生成失败',
        raw: data.data,
      }
    }

    await sleep(intervalMs)
  }

  return { ok: false, reason: 'timeout', message: '视频生成超时，请稍后在控制台查看任务' }
}

/**
 * 根据用户拍摄场景生成一条 AI 视频（消耗视频生成配额：每日 5 次）
 */
async function generateVlogVideo({ scenes = [], narration = '' }) {
  if (!isConfigured()) {
    return { ok: false, reason: 'vivo_not_configured' }
  }

  try {
    const prompt = buildVlogVideoPrompt(scenes, narration)
    const { taskId } = await submitVideoTask(prompt)
    if (!taskId) {
      return { ok: false, reason: 'no_task_id', message: '未返回 task_id' }
    }

    const polled = await pollVideoTask(taskId)
    if (polled.ok) {
      return {
        ok: true,
        videoUrl: polled.videoUrl,
        taskId,
        prompt,
        provider: 'Doubao-Seedance-1.0-pro',
      }
    }
    return polled
  } catch (error) {
    const rateLimit = error.rateLimit
    return {
      ok: false,
      reason: error.code === 1003 ? 'rate_limit' : 'api_error',
      message: error.message,
      rateLimit,
    }
  }
}

module.exports = {
  isConfigured,
  submitVideoTask,
  queryVideoTask,
  pollVideoTask,
  generateVlogVideo,
  buildVlogVideoPrompt,
}
