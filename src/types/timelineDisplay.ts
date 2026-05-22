export type TimelineOverlayKind =
  | 'originalAudio'
  | 'text'
  | 'sticker'
  | 'bgm'

export interface TimelineDisplayClip {
  id: string
  kind: TimelineOverlayKind
  label: string
  startTime: number
  endTime: number
  selected?: boolean
  /** 原声关闭等不可用态，条块半透明显示 */
  disabled?: boolean
}
