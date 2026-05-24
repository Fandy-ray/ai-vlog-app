/** 智能创作（/create → /editor）与 AI 导拍（/vlog-learn）互不共用素材与成片状态 */

export type ProjectFlow = 'studio' | 'director'

export const STUDIO_EXPORT_RESULT_KEY = 'memento-studio-export-result'
export const LAST_COMPLETE_FLOW_KEY = 'memento-last-complete-flow'

export interface StudioExportResult {
  title: string
  videoUrl: string
  coverUrl: string
  durationSec: number
}
