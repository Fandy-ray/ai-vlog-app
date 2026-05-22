export interface AiGenerationStep {
  id: string
  label: string
  detail: string
}

/** AI Director 成片阶段 */
export const AI_GENERATION_STEPS: AiGenerationStep[] = [
  {
    id: 'analyze',
    label: '正在分析故事情绪',
    detail: '识别场景氛围、横竖屏与镜头质量…',
  },
  {
    id: 'story',
    label: '正在识别高光片段',
    detail: '精选 6–8 个镜头，编排起承转合与情绪章节…',
  },
  {
    id: 'music',
    label: '正在匹配章节音乐',
    detail: '从音乐库按情绪选曲，演唱会保留现场感…',
  },
  {
    id: 'edit',
    label: '正在优化镜头节奏',
    detail: '统一分辨率 · 拼接导出（无调色）…',
  },
  {
    id: 'mix',
    label: '正在保留环境氛围',
    detail: '环境声 + 章节 BGM 平滑过渡，不盖掉现场声…',
  },
  {
    id: 'finalize',
    label: '正在封装成片',
    detail: '混音完成 · 即将导出…',
  },
]

export const STEP_PHASE_MAP: Record<string, number> = {
  analyze: 0,
  story: 1,
  script: 1,
  music: 2,
  tts: 2,
  edit: 3,
  mix: 4,
  overlay: 5,
  finalize: 5,
}
