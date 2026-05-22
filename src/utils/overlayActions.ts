import { createStickerId } from '@/data/stickers'
import { createTextId } from '@/data/textStyles'
import type { StickerOverlay, TextOverlay } from '@/types/editorState'
import { clamp } from '@/utils/formatTime'
import {
  shiftTimeRange,
  type TimeRange,
} from '@/utils/timeRange'

const OFFSET_PCT = 3
const TIME_OFFSET_SEC = 2

export function offsetDuplicateTimeRange(
  range: TimeRange,
  videoDuration: number,
): TimeRange {
  return shiftTimeRange(range, TIME_OFFSET_SEC, videoDuration)
}

export function offsetOverlayPosition<T extends { x: number; y: number }>(overlay: T): T {
  return {
    ...overlay,
    x: clamp(overlay.x + OFFSET_PCT, 5, 95),
    y: clamp(overlay.y + OFFSET_PCT, 8, 88),
  }
}

export function duplicateTextOverlay(
  overlay: TextOverlay,
  videoDuration: number,
): TextOverlay {
  const time = offsetDuplicateTimeRange(
    { startTime: overlay.startTime, endTime: overlay.endTime },
    videoDuration,
  )
  return {
    ...offsetOverlayPosition({ ...overlay }),
    id: createTextId(),
    startTime: time.startTime,
    endTime: time.endTime,
  }
}

export function duplicateStickerOverlay(
  overlay: StickerOverlay,
  videoDuration: number,
): StickerOverlay {
  const time = offsetDuplicateTimeRange(
    { startTime: overlay.startTime, endTime: overlay.endTime },
    videoDuration,
  )
  return {
    ...offsetOverlayPosition(overlay),
    id: createStickerId(),
    startTime: time.startTime,
    endTime: time.endTime,
  }
}

export type OverlayClipboard =
  | { type: 'text'; data: TextOverlay }
  | { type: 'sticker'; data: StickerOverlay }
  | { type: 'bgm'; data: { bgmId: string; bgmRange: TimeRange } }
