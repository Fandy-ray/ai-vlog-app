const { chatCompletion } = require('./vivoChat')

function getAppKey() {
  return process.env.VIVO_AIGC_APP_KEY || process.env.VIVO_APP_KEY || ''
}

const DEFAULT_CRITERIA = {
  mood: ['轻松', '治愈'],
  tags: ['日常', '旅行'],
  bpmRange: [80, 120],
}

const SYSTEM_PROMPT = `你是 Vlog 背景音乐推荐助手。根据用户的 Vlog 类型与文字描述，分析适合的背景音乐特征。

你必须只返回一个 JSON 对象，不要 markdown 代码块、不要任何解释文字、不要前后缀说明。

JSON 格式严格如下：
{"mood":["情绪1","情绪2"],"tags":["标签1","标签2"],"bpmRange":[最小BPM,最大BPM]}

字段说明：
- mood：音乐情绪，1～4 个中文词，如 轻松、治愈、安静、活力、浪漫、温暖、清新、自由、情绪
- tags：场景/风格标签，2～6 个中文词，如 旅行、海边、朋友、日常、都市、雨天、咖啡、公路、夜晚
- bpmRange：必须是仅含两个整数的数组，表示合适 BPM 区间，范围建议 60～180，且第一个数小于第二个数`

function mockAnalyzeVlogDescription(description, vlogType = '') {
  const text = `${vlogType} ${description || ''}`.trim().toLowerCase()
  if (!text) {
    return { ...DEFAULT_CRITERIA, _source: 'mock' }
  }

  const moodSet = new Set()
  const tagSet = new Set()
  const moodRules = [
    [['轻松', '快乐', '开心', '阳光'], '轻松'],
    [['治愈', '温柔', '舒缓'], '治愈'],
    [['安静', '静谧', '雨天', '室内'], '安静'],
    [['浪漫', '夜晚', '星空'], '浪漫'],
    [['活力', '节奏', '都市', '快'], '活力'],
    [['自由', '公路', '开车'], '自由'],
    [['海边', '自然', '清新'], '清新'],
    [['温暖', '黄昏', '回忆'], '温暖'],
  ]
  const tagRules = [
    [['旅行', '出游', '度假', '海边'], '旅行'],
    [['日常', '生活', 'vlog', '记录'], '日常'],
    [['咖啡', '早晨', '早餐'], '咖啡'],
    [['都市', '城市', '夜景'], '都市'],
    [['雨天', '下雨'], '雨天'],
    [['开车', '自驾', '公路'], '公路'],
    [['夜晚', '星空'], '夜晚'],
    [['朋友', '聚会'], '朋友'],
  ]

  for (const [words, mood] of moodRules) {
    if (words.some((w) => text.includes(w))) moodSet.add(mood)
  }
  for (const [words, tag] of tagRules) {
    if (words.some((w) => text.includes(w))) tagSet.add(tag)
  }

  if (vlogType.includes('旅行')) tagSet.add('旅行')
  if (vlogType.includes('日常')) tagSet.add('日常')

  const mood = moodSet.size > 0 ? [...moodSet] : [...DEFAULT_CRITERIA.mood]
  const tags = tagSet.size > 0 ? [...tagSet] : [...DEFAULT_CRITERIA.tags]

  let bpmMin = 80
  let bpmMax = 120
  if (text.includes('慢') || text.includes('安静') || text.includes('治愈')) {
    bpmMin = 70
    bpmMax = 100
  }
  if (text.includes('快') || text.includes('节奏') || text.includes('活力')) {
    bpmMin = 100
    bpmMax = 130
  }

  return { mood, tags, bpmRange: [bpmMin, bpmMax], _source: 'mock' }
}

function extractJsonObject(text) {
  const trimmed = (text || '').trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced ? fenced[1].trim() : trimmed
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('响应中未找到 JSON')
  }
  return JSON.parse(candidate.slice(start, end + 1))
}

function normalizeCriteria(raw) {
  const mood = Array.isArray(raw?.mood)
    ? raw.mood.map((m) => String(m).trim()).filter(Boolean).slice(0, 4)
    : []
  const tags = Array.isArray(raw?.tags)
    ? raw.tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 8)
    : []

  let bpmMin = Number(raw?.bpmRange?.[0])
  let bpmMax = Number(raw?.bpmRange?.[1])
  if (!Number.isFinite(bpmMin)) bpmMin = DEFAULT_CRITERIA.bpmRange[0]
  if (!Number.isFinite(bpmMax)) bpmMax = DEFAULT_CRITERIA.bpmRange[1]
  bpmMin = Math.round(Math.min(180, Math.max(60, bpmMin)))
  bpmMax = Math.round(Math.min(180, Math.max(60, bpmMax)))
  if (bpmMin > bpmMax) [bpmMin, bpmMax] = [bpmMax, bpmMin]
  if (bpmMin === bpmMax) bpmMax = Math.min(180, bpmMin + 20)

  return {
    mood: mood.length > 0 ? mood : [...DEFAULT_CRITERIA.mood],
    tags: tags.length > 0 ? tags : [...DEFAULT_CRITERIA.tags],
    bpmRange: [bpmMin, bpmMax],
  }
}

function parseCriteriaFromLlmContent(content) {
  try {
    const raw = extractJsonObject(content)
    return normalizeCriteria(raw)
  } catch (err) {
    throw new Error(`解析大模型 JSON 失败: ${err.message}`)
  }
}

function buildUserPrompt(description, vlogType) {
  const typeLine = vlogType.trim() ? vlogType.trim() : '未指定'
  const descLine = description.trim() ? description.trim() : '（用户未填写具体描述）'
  return `Vlog 类型：${typeLine}\n用户 Vlog 描述：${descLine}\n\n请根据以上内容输出配乐推荐用的 JSON。`
}

/**
 * 使用蓝心大模型分析 Vlog；失败时回退本地 mock 或默认结果
 */
async function analyzeVlogDescription(description, vlogType = '') {
  const text = (description || '').trim()
  const type = (vlogType || '').trim()

  if (!getAppKey()) {
    const mock = mockAnalyzeVlogDescription(text, type)
    return {
      criteria: stripSource(mock),
      source: 'fallback',
      reason: '未配置 VIVO_AIGC_APP_KEY',
      fallbackReason: '未配置 VIVO_AIGC_APP_KEY',
    }
  }

  try {
    const content = await chatCompletion({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(text, type) },
      ],
    })

    const criteria = parseCriteriaFromLlmContent(content)
    return { criteria, source: 'ai', reason: null, fallbackReason: null }
  } catch (err) {
    console.warn('[music/analyze] LLM failed, fallback:', err.message)
    try {
      const mock = mockAnalyzeVlogDescription(text, type)
      return {
        criteria: stripSource(mock),
        source: 'fallback',
        reason: err.message,
        fallbackReason: err.message,
      }
    } catch {
      return {
        criteria: { ...DEFAULT_CRITERIA },
        source: 'fallback',
        reason: err.message,
        fallbackReason: err.message,
      }
    }
  }
}

function stripSource(obj) {
  const { _source, ...rest } = obj
  return rest
}

module.exports = {
  analyzeVlogDescription,
  DEFAULT_CRITERIA,
  mockAnalyzeVlogDescription: (d, t) => stripSource(mockAnalyzeVlogDescription(d, t)),
}
