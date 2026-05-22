import type { VlogScene } from '@/data/vlogGuide'
import type { VlogStyleId } from '@/data/vlogStyles'

export interface DirectorPlanResponse {
  projectTitle: string
  type: string
  styleId: VlogStyleId
  stylePreference: string
  theme: string
  provider: string
  scenes: VlogScene[]
}

export interface FetchDirectorPlanOptions {
  refinement?: string
  previousScenes?: VlogScene[]
}

export async function fetchDirectorPlan(
  theme: string,
  stylePreference: string,
  options?: FetchDirectorPlanOptions,
): Promise<DirectorPlanResponse> {
  const res = await fetch('/api/director/plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      theme,
      stylePreference,
      refinement: options?.refinement?.trim() || undefined,
      previousScenes: options?.previousScenes,
    }),
  })

  const json = await res.json()
  if (!res.ok || json.code !== 0) {
    throw new Error(json.message || '生成导拍方案失败')
  }

  return json.data as DirectorPlanResponse
}
