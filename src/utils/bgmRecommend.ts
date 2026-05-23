import {
  getBrowsableAudios,
  isCuratedAudio,
  type NetworkAudio,
} from '@/data/audioLibrary'

/** 智能推荐分析结果（本阶段为本地 mock，后续可接大模型） */
export interface BgmRecommendCriteria {
  mood: string[]
  tags: string[]
  bpmRange: [number, number]
}

export interface BgmRecommendResult {
  audio: NetworkAudio
  score: number
  matchHints: string[]
}

const DEFAULT_CRITERIA: BgmRecommendCriteria = {
  mood: ['轻松', '治愈'],
  tags: ['旅行', '日常', 'vlog'],
  bpmRange: [80, 120],
}

const MOOD_KEYWORDS: { words: string[]; mood: string }[] = [
  { words: ['轻松', '快乐', '开心', '阳光', '治愈', '温暖'], mood: '轻松' },
  { words: ['治愈', '温柔', '舒缓', '安静'], mood: '治愈' },
  { words: ['安静', '静谧', '独处', '雨天', '室内'], mood: '安静' },
  { words: ['浪漫', '夜晚', '星空', '爱情'], mood: '浪漫' },
  { words: ['活力', '节奏', '都市', '街拍', '快'], mood: '活力' },
  { words: ['自由', '公路', '开车', '冒险'], mood: '自由' },
  { words: ['清新', '海边', '自然'], mood: '清新' },
  { words: ['温暖', '黄昏', '回忆', '胶片'], mood: '温暖' },
  { words: ['情绪', '感性', '深沉'], mood: '情绪' },
]

const TAG_KEYWORDS: { words: string[]; tag: string }[] = [
  { words: ['旅行', '出游', '度假', '海边', '公路'], tag: '旅行' },
  { words: ['日常', '生活', 'vlog', '记录', '一天'], tag: '日常' },
  { words: ['咖啡', '早晨', '早餐', '慢生活'], tag: '咖啡' },
  { words: ['都市', '城市', '夜景', '街拍'], tag: '都市' },
  { words: ['雨天', '下雨', '窗户'], tag: '雨天' },
  { words: ['海边', '海岸', '沙滩'], tag: '海边' },
  { words: ['开车', '自驾', '公路'], tag: '公路' },
  { words: ['夜晚', '星空', '深夜'], tag: '夜晚' },
]

/**
 * 根据用户描述生成本地 mock 分析结果（关键词启发式，非真实大模型）。
 */
export function mockAnalyzeVlogDescription(description: string): BgmRecommendCriteria {
  const text = description.trim().toLowerCase()
  if (!text) {
    return { ...DEFAULT_CRITERIA }
  }

  const moodSet = new Set<string>()
  const tagSet = new Set<string>()

  for (const { words, mood } of MOOD_KEYWORDS) {
    if (words.some((w) => text.includes(w.toLowerCase()))) {
      moodSet.add(mood)
    }
  }
  for (const { words, tag } of TAG_KEYWORDS) {
    if (words.some((w) => text.includes(w.toLowerCase()))) {
      tagSet.add(tag)
    }
  }

  const mood = moodSet.size > 0 ? [...moodSet] : [...DEFAULT_CRITERIA.mood]
  const tags = tagSet.size > 0 ? [...tagSet, 'vlog'] : [...DEFAULT_CRITERIA.tags]

  let bpmMin = 80
  let bpmMax = 120
  if (text.includes('慢') || text.includes('安静') || text.includes('治愈')) {
    bpmMin = 70
    bpmMax = 100
  }
  if (text.includes('快') || text.includes('节奏') || text.includes('活力') || text.includes('都市')) {
    bpmMin = 100
    bpmMax = 130
  }

  return { mood, tags, bpmRange: [bpmMin, bpmMax] }
}

function scoreAudio(
  audio: NetworkAudio,
  criteria: BgmRecommendCriteria,
): { score: number; matchHints: string[] } {
  const hints: string[] = []
  let score = 0

  for (const m of criteria.mood) {
    if (audio.mood.includes(m)) {
      score += 3
      hints.push(`情绪·${m}`)
    }
  }

  for (const t of criteria.tags) {
    const normalized = t.toLowerCase()
    if (
      audio.tags.some(
        (at) => at.toLowerCase() === normalized || at.toLowerCase().includes(normalized),
      )
    ) {
      score += 2
      if (!hints.some((h) => h.includes(t))) {
        hints.push(`标签·${t}`)
      }
    }
  }

  const [bpmMin, bpmMax] = criteria.bpmRange
  if (audio.bpm >= bpmMin && audio.bpm <= bpmMax) {
    score += 2
    hints.push(`BPM ${audio.bpm}`)
  } else {
    const dist = Math.min(Math.abs(audio.bpm - bpmMin), Math.abs(audio.bpm - bpmMax))
    if (dist <= 15) {
      score += 1
      hints.push(`BPM 接近 ${audio.bpm}`)
    }
  }

  return { score, matchHints: hints }
}

/**
 * 从已有配乐库中按 mood / tags / bpmRange 打分排序，返回 3～5 首。
 */
export function recommendNetworkAudios(
  criteria: BgmRecommendCriteria,
  options?: { limit?: number; minResults?: number },
): BgmRecommendResult[] {
  const limit = clamp(options?.limit ?? 5, 3, 5)
  const minResults = options?.minResults ?? 3

  const pool = getBrowsableAudios()
  const ranked = pool.map((audio) => {
    const { score, matchHints } = scoreAudio(audio, criteria)
    const curatedBoost = isCuratedAudio(audio) ? 1 : 0
    return { audio, score: score + curatedBoost, matchHints }
  })
    .filter((r) => r.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(isCuratedAudio(b.audio)) - Number(isCuratedAudio(a.audio)) ||
        a.audio.name.localeCompare(b.audio.name),
    )

  let results = ranked.slice(0, limit)

  if (results.length < minResults) {
    const picked = new Set(results.map((r) => r.audio.id))
    for (const audio of pool) {
      if (picked.has(audio.id)) continue
      results.push({ audio, score: 0, matchHints: ['综合推荐'] })
      picked.add(audio.id)
      if (results.length >= minResults) break
    }
  }

  return results.slice(0, limit)
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}
