import type { VlogScene } from '@/data/vlogGuide'
import type { VlogStyleId } from '@/data/vlogStyles'

export interface VlogDirectorSession {
  theme: string
  stylePreference: string
  styleId: VlogStyleId
  type: string
  projectTitle: string
  provider: string
  scenes: VlogScene[]
  /** 最近一次「调整导拍」时用户写的补充说明 */
  lastRefinement?: string
  createdAt: number
}

export const VLOG_DIRECTOR_SESSION_KEY = 'memento-vlog-director-session'
