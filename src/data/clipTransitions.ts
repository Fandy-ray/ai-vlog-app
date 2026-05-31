import type { ClipTransitionKind } from '@/types/clipTransition'

export type TransitionPresetId = ClipTransitionKind | 'none'

export type TransitionPreset = {
  id: TransitionPresetId
  name: string
  hint: string
}

export const CLIP_TRANSITION_PRESETS: TransitionPreset[] = [
  { id: 'none', name: '无', hint: '硬切衔接' },
  { id: 'fade', name: '淡化', hint: '淡入淡出' },
  { id: 'dissolve', name: '叠化', hint: '画面交融' },
  { id: 'wipe', name: '划像', hint: '横向擦除' },
]
