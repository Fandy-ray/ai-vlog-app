/** 时间轴内容区左右留白（百分比），刻度数字与播放指针均在此范围内 */
export const TIMELINE_INSET_PCT = 5

/** 相邻刻度标签最小水平间距（占时间轴全宽的百分比），用于避免文字重叠 */
export const MIN_RULER_LABEL_GAP_PCT = 7

export type RulerLabelAlign = 'start' | 'center' | 'end'

export interface RulerTickDisplay {
  sec: number
  align: RulerLabelAlign
  showLabel: boolean
}

const TICK_STEPS_SEC = [5, 10, 15, 30, 60, 120, 300, 600] as const

/** 根据总时长选择主刻度间隔（秒），避免刻度过密 */
export function getRulerIntervalSec(durationSec: number): number {
  if (durationSec <= 0) return 5
  const maxLabels = 10
  for (const step of TICK_STEPS_SEC) {
    const labelCount = Math.floor(durationSec / step) + 1 + (durationSec % step > 0 ? 1 : 0)
    if (labelCount <= maxLabels) return step
  }
  return TICK_STEPS_SEC[TICK_STEPS_SEC.length - 1]
}

/** 生成主刻度时间点（秒），含 0 与结束时间 */
export function getRulerTicks(durationSec: number): number[] {
  const duration = Math.max(0, Math.floor(durationSec))
  if (duration === 0) return [0]

  const step = getRulerIntervalSec(duration)
  const ticks: number[] = [0]

  for (let t = step; t < duration; t += step) {
    ticks.push(t)
  }

  if (ticks[ticks.length - 1] !== duration) {
    ticks.push(duration)
  }

  return ticks
}

/**
 * 计算刻度展示：锚点位置仍为真实时间；过近时隐藏普通主刻度标签，保留起止时间。
 */
export function getRulerTicksForDisplay(durationSec: number): RulerTickDisplay[] {
  const ticks = getRulerTicks(durationSec)
  const duration = Math.max(0, Math.floor(durationSec))

  const positions = ticks.map((sec) => ({
    sec,
    pct: timeToTimelinePercent(sec, durationSec),
    isStart: sec === 0,
    isEnd: duration > 0 && sec === duration,
  }))

  const showLabel = positions.map(() => true)

  if (positions.length > 0) {
    const startPct = positions[0].pct
    for (let i = 1; i < positions.length; i++) {
      if (positions[i].isEnd) break
      if (positions[i].pct - startPct < MIN_RULER_LABEL_GAP_PCT) {
        showLabel[i] = false
      } else {
        break
      }
    }
  }

  const endIdx = positions.findIndex((p) => p.isEnd)
  if (endIdx > 0) {
    const endPct = positions[endIdx].pct
    for (let i = endIdx - 1; i >= 0; i--) {
      if (endPct - positions[i].pct < MIN_RULER_LABEL_GAP_PCT) {
        showLabel[i] = false
      } else {
        break
      }
    }
  }

  let lastShownPct = positions[0]?.pct ?? 0
  for (let i = 1; i < positions.length; i++) {
    if (positions[i].isStart || positions[i].isEnd) continue
    if (!showLabel[i]) continue
    if (positions[i].pct - lastShownPct < MIN_RULER_LABEL_GAP_PCT) {
      showLabel[i] = false
    } else {
      lastShownPct = positions[i].pct
    }
  }

  return positions.map((p, i) => ({
    sec: p.sec,
    align: p.isStart ? 'start' : p.isEnd ? 'end' : 'center',
    showLabel: showLabel[i],
  }))
}

/** 根据内容区上的水平拖动像素换算为时间偏移（秒） */
export function timeDeltaFromPointerDrag(
  deltaPx: number,
  contentWidthPx: number,
  durationSec: number,
): number {
  if (contentWidthPx <= 0 || durationSec <= 0) return 0
  return (deltaPx / contentWidthPx) * durationSec
}

/**
 * 将秒数映射到「已应用 TIMELINE_INSET 留白」的内容区内的水平位置（0–100）。
 * 用于视频轨下方的轨道条块，勿与 timeToTimelinePercent 混用（后者含留白偏移）。
 */
export function timeToContentPercent(timeSec: number, durationSec: number): number {
  if (durationSec <= 0) return 0
  const ratio = Math.max(0, Math.min(1, timeSec / durationSec))
  return ratio * 100
}

/** 内容区内条块 left / width（百分比字符串） */
export function contentRangeStyle(
  startTime: number,
  endTime: number,
  durationSec: number,
): { left: string; width: string } {
  const leftPct = timeToContentPercent(startTime, durationSec)
  const rightPct = timeToContentPercent(endTime, durationSec)
  const widthPct = Math.max(0, rightPct - leftPct)
  return {
    left: `${leftPct}%`,
    width: `${widthPct}%`,
  }
}

/** 将秒数映射到时间轴整体（含左右留白）的水平位置（0–100） */
export function timeToTimelinePercent(timeSec: number, durationSec: number): number {
  if (durationSec <= 0) return TIMELINE_INSET_PCT
  const inset = TIMELINE_INSET_PCT
  const usable = 100 - inset * 2
  const ratio = Math.max(0, Math.min(1, timeSec / durationSec))
  return inset + ratio * usable
}

/** 将内容区水平位置（0–100）反算为秒 */
export function timelinePercentToTime(
  percent: number,
  durationSec: number,
): number {
  if (durationSec <= 0) return 0
  const inset = TIMELINE_INSET_PCT
  const usable = 100 - inset * 2
  const ratio = Math.max(0, Math.min(1, (percent - inset) / usable))
  return ratio * durationSec
}

/** 根据指针在元素内的 clientX 计算时间（秒） */
export function timeFromPointer(
  clientX: number,
  element: HTMLElement,
  durationSec: number,
): number {
  const rect = element.getBoundingClientRect()
  const ratio = rect.width > 0 ? (clientX - rect.left) / rect.width : 0
  const percent = Math.max(0, Math.min(100, ratio * 100))
  return timelinePercentToTime(percent, durationSec)
}

/** 指针在「纯时间内容区」（无左右 inset、无右侧添加列）内换算为秒 */
export function timeFromContentPointer(
  clientX: number,
  element: HTMLElement,
  durationSec: number,
): number {
  const rect = element.getBoundingClientRect()
  const ratio =
    rect.width > 0
      ? Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      : 0
  return ratio * Math.max(0, durationSec)
}

/** 右侧「添加素材」列宽度（Tailwind class） */
export const TIMELINE_ADD_COLUMN_CLASS = 'w-11'

/** 时间刻度尺行（与右侧添加列占位同高同线） */
export const TIMELINE_RULER_ROW_CLASS =
  'relative flex h-7 shrink-0 items-end overflow-visible border-b border-border/60 pb-1'

/** 视频素材轨单行高度（与右侧添加按钮一致） */
export const TIMELINE_VIDEO_CLIP_ROW_CLASS = 'relative h-14 w-full overflow-hidden rounded-lg'

/** 视频素材轨区块（含上下间距） */
export const TIMELINE_VIDEO_TRACK_SECTION_CLASS =
  'relative shrink-0 overflow-visible py-1.5'

/** 时间轴模块外层（独立工具栏 + 白面板，纵向占满剩余空间） */
export const TIMELINE_MODULE_CLASS =
  'flex min-h-0 flex-1 flex-col gap-2 px-3 pb-2 pt-1'

/** 独立全宽剪辑工具栏模块（与上方 AI 功能条同宽） */
export const TIMELINE_TOOLBAR_MODULE_CLASS =
  'w-full shrink-0 rounded-xl bg-primary/[0.09] px-3 py-2.5 ring-1 ring-primary/10'

/** 下方白色圆角编辑面板 */
export const TIMELINE_PANEL_CLASS =
  'relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-surface shadow-[0_2px_14px_rgba(44,62,80,0.07)] ring-1 ring-border/35'

/** 添加素材：浅蓝底 + 深蓝实线圆角框（与 playhead 同色系） */
export const TIMELINE_ADD_CLIP_BUTTON_CLASS =
  'box-border flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--color-primary-dark)] bg-primary/10 text-primary transition-[color,background-color,border-color,transform] duration-200 hover:border-[#3a4fa3] hover:bg-primary/[0.16] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60'
