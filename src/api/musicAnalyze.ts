import type { BgmRecommendCriteria } from '@/utils/bgmRecommend'

/** 与后端 /api/music/analyze 一致 */
export type MusicAnalyzeSource = 'ai' | 'fallback'

export interface MusicAnalyzeResponse {
  criteria: BgmRecommendCriteria
  source: MusicAnalyzeSource
  reason: string | null
}

interface ApiEnvelope {
  code: number
  message: string
  data?: {
    criteria: BgmRecommendCriteria
    source?: string
    reason?: string | null
    fallbackReason?: string | null
  }
}

export interface MusicAnalyzeRequest {
  description: string
  vlogType?: string
}

export function normalizeMusicAnalyzeSource(raw: string | undefined): MusicAnalyzeSource {
  if (raw === 'ai' || raw === 'llm') return 'ai'
  return 'fallback'
}

export function getMusicAnalyzeStatusLabel(
  source: MusicAnalyzeSource | null,
  options?: { loading?: boolean },
): string {
  if (options?.loading) return '正在请求 AI 分析…'
  if (source === 'ai') return 'AI 分析'
  if (source === 'fallback') return '本地回退'
  return '蓝心 AI'
}

export async function analyzeMusicApi(
  payload: MusicAnalyzeRequest,
): Promise<MusicAnalyzeResponse> {
  const res = await fetch('/api/music/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description: payload.description,
      vlogType: payload.vlogType ?? '',
    }),
  })

  let body: ApiEnvelope
  try {
    body = (await res.json()) as ApiEnvelope
  } catch {
    throw new Error('分析接口返回格式错误')
  }

  if (!res.ok || body.code !== 0 || !body.data?.criteria) {
    throw new Error(body.message || `分析失败（${res.status}）`)
  }

  const { criteria, source: rawSource, reason, fallbackReason } = body.data
  return {
    criteria: {
      mood: criteria.mood,
      tags: criteria.tags,
      bpmRange: [
        Number(criteria.bpmRange[0]),
        Number(criteria.bpmRange[1]),
      ] as [number, number],
    },
    source: normalizeMusicAnalyzeSource(rawSource),
    reason: reason ?? fallbackReason ?? null,
  }
}
