import { analyzeMusicApi } from '@/api/musicAnalyze'
import {
  mockAnalyzeVlogDescription,
  recommendNetworkAudios,
  type BgmRecommendResult,
} from '@/utils/bgmRecommend'

export interface RecommendBgmOutcome {
  results: BgmRecommendResult[]
  picked: BgmRecommendResult | null
  source: 'ai' | 'fallback'
  reason: string | null
}

/** 根据口语描述智能选配乐（优先后端 AI，失败则本地关键词） */
export async function recommendBgmFromDescription(
  description: string,
  vlogType = '旅行',
): Promise<RecommendBgmOutcome> {
  const text = description.trim() || '轻松愉快的 vlog 配乐'

  try {
    const data = await analyzeMusicApi({ description: text, vlogType })
    const results = recommendNetworkAudios(data.criteria)
    return {
      results,
      picked: results[0] ?? null,
      source: data.source,
      reason: data.reason,
    }
  } catch (err) {
    const criteria = mockAnalyzeVlogDescription(text)
    const results = recommendNetworkAudios(criteria)
    return {
      results,
      picked: results[0] ?? null,
      source: 'fallback',
      reason:
        err instanceof Error
          ? err.message
          : '无法连接分析服务，已使用本地推荐',
    }
  }
}
