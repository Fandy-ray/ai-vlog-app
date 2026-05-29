/** 片段衔接处的转场效果（预览淡入淡出，导出时按硬切保留切点） */
export type ClipTransitionKind = 'fade' | 'dissolve' | 'wipe'

export interface ClipTransition {
  kind: ClipTransitionKind
  /** 转场时长（秒） */
  duration: number
}

export const DEFAULT_TRANSITION_DURATION = 0.5

export function transitionKindLabel(kind: ClipTransitionKind): string {
  switch (kind) {
    case 'dissolve':
      return '叠化'
    case 'wipe':
      return '划像'
    default:
      return '淡化'
  }
}
