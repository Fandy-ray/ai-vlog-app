/** 素材来源：仅 AI 导拍流程写入 IndexedDB */
export type VlogMaterialSource = 'director'

/** 本地持久化的拍摄片段（IndexedDB 存 blob，元数据同库） */
export interface VlogClipRecord {
  id: string
  /** 固定为 director，与智能创作本地上传隔离 */
  source?: VlogMaterialSource
  sceneId: string
  sceneTitle: string
  name: string
  mimeType: string
  durationMs: number
  sizeBytes: number
  createdAt: number
  /** false = 草稿，退出采集页未点保存会被清理 */
  committed?: boolean
}

/** 供后续 AI 合成接口使用的素材描述（含可访问的 objectUrl） */
export interface VlogMaterialExport {
  id: string
  sceneId: string
  name: string
  category: 'video'
  duration: number
  tags: string[]
  sortWeight: number
  mimeType: string
  sizeBytes: number
  createdAt: number
  /** 浏览器内临时 URL，上传后应 revoke */
  objectUrl: string
}

export const VLOG_MATERIALS_CHANGED = 'memento-vlog-materials-changed'
