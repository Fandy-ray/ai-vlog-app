/** 视频上的文字图层 */
export interface TextOverlay {
  content: string
  color: string
  fontId: string
  /** 相对视频宽度，百分比 0–100 */
  x: number
  /** 相对视频高度，百分比 0–100 */
  y: number
  /** 文字框宽度（占视频宽度百分比） */
  width: number
  /** 文字框高度（占视频高度百分比） */
  height: number
  /** 旋转角度（度） */
  rotation: number
  /** 文字框背景色（十六进制） */
  backgroundColor?: string
  /** 文字框背景不透明度 0–100，0 为完全透明 */
  backgroundOpacity?: number
  /** @deprecated 旧版统一缩放，会自动转换为 width/height */
  scale?: number
}

/** 视频上的贴纸图层 */
export interface StickerOverlay {
  /** 实例唯一 id（同一预设可添加多次） */
  id: string
  stickerId: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
}

/** 可撤回/重做的剪辑状态快照 */
export interface EditorSnapshot {
  title: string
  filterId: string
  filterIntensity: number
  effectId: string
  textOverlay: TextOverlay | null
  stickerOverlays: StickerOverlay[]
  /** 是否保留视频原声 */
  keepOriginalAudio: boolean
  /** 所选网络配乐 id，null 表示无配乐 */
  bgmId: string | null
}

export const INITIAL_EDITOR_SNAPSHOT: EditorSnapshot = {
  title: '旅行的意义',
  filterId: 'none',
  filterIntensity: 100,
  effectId: 'none',
  textOverlay: null,
  stickerOverlays: [],
  keepOriginalAudio: true,
  bgmId: 'sunny-day',
}
