import { Star, VolumeX } from 'lucide-react'
import { useCallback, useRef } from 'react'
import { formatBgmLabel } from '@/data/audioLibrary'
import {
  HIGHLIGHT_AT,
  PREVIEW_POSTER,
  VIDEO_CLIPS,
  type VideoClip,
} from '@/data/mockProject'
import { formatTime } from '@/utils/formatTime'
import { generateWaveform } from '@/utils/waveform'
import { Waveform } from './Waveform'

const RULER_MARKS = [20, 30, 40]
const AUDIO_WAVE = generateWaveform(120, 2)
const MUSIC_WAVE = generateWaveform(120, 5)

interface TimelineProps {
  currentTime: number
  duration: number
  keepOriginalAudio?: boolean
  bgmId?: string | null
  onSeek: (time: number) => void
  onClipSelect?: (clip: VideoClip) => void
  onAudioClick?: () => void
}

function isClipActive(clip: VideoClip, time: number) {
  return time >= clip.start && time < clip.start + clip.duration
}

export function Timeline({
  currentTime,
  duration,
  keepOriginalAudio = true,
  bgmId = 'sunny-day',
  onSeek,
  onClipSelect,
  onAudioClick,
}: TimelineProps) {
  const bgmLabel = formatBgmLabel(bgmId ?? null)
  const trackRef = useRef<HTMLDivElement>(null)
  const playheadPct = (currentTime / duration) * 100
  const highlightPct = (HIGHLIGHT_AT / duration) * 100

  const seekFromEvent = useCallback(
    (clientX: number) => {
      const el = trackRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      onSeek(ratio * duration)
    },
    [duration, onSeek],
  )

  const handlePointerDown = (e: React.PointerEvent) => {
    const el = trackRef.current
    if (!el) return
    el.setPointerCapture(e.pointerId)
    seekFromEvent(e.clientX)

    const onMove = (ev: PointerEvent) => seekFromEvent(ev.clientX)
    const onUp = () => {
      el.releasePointerCapture(e.pointerId)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-2">
      <article
        ref={trackRef}
        className="relative flex min-h-0 flex-1 cursor-pointer flex-col overflow-hidden rounded-[var(--radius-lg)] bg-surface shadow-[var(--shadow-card)]"
        onPointerDown={handlePointerDown}
      >
        {/* 时间刻度 */}
        <header className="relative flex h-6 shrink-0 items-end border-b border-border/60 px-2 pb-0.5">
          {RULER_MARKS.map((sec) => (
            <span
              key={sec}
              className="absolute bottom-0.5 -translate-x-1/2 text-[10px] tabular-nums text-text-muted"
              style={{ left: `${(sec / duration) * 100}%` }}
            >
              {formatTime(sec)}
            </span>
          ))}
        </header>

        {/* 视频轨道 */}
        <section className="relative shrink-0 px-1 py-1.5">
          <ul className="flex h-14 gap-0.5 overflow-hidden rounded-lg">
            {VIDEO_CLIPS.map((clip) => {
              const active = isClipActive(clip, currentTime)
              return (
                <li
                  key={clip.id}
                  className="h-full flex-1"
                  style={{ flex: clip.duration }}
                >
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation()
                      onClipSelect?.(clip)
                    }}
                    className={`h-full w-full overflow-hidden rounded-md bg-track-video transition-all active:scale-[0.98] ${
                      active
                        ? 'ring-2 ring-primary ring-offset-1 ring-offset-surface'
                        : 'opacity-90 hover:opacity-100'
                    }`}
                    aria-label={`片段 ${clip.id}`}
                    aria-pressed={active}
                  >
                    <img
                      src={clip.thumb}
                      alt=""
                      className="h-full w-full object-cover"
                      draggable={false}
                      loading="lazy"
                      onError={(e) => {
                        const img = e.currentTarget
                        if (img.dataset.fallbackApplied) return
                        img.dataset.fallbackApplied = '1'
                        img.src = PREVIEW_POSTER
                      }}
                    />
                  </button>
                </li>
              )
            })}
          </ul>

          {/* 高光时刻标记 */}
          <span
            className="pointer-events-none absolute -top-1 z-10 flex -translate-x-1/2 items-center gap-0.5 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-medium text-white shadow-sm"
            style={{ left: `${highlightPct}%` }}
          >
            <Star size={8} fill="white" />
            高光时刻
          </span>
        </section>

        {/* 原声音频轨道 */}
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onAudioClick?.()
          }}
          className={`relative mx-1 mb-1 block h-8 w-[calc(100%-0.5rem)] shrink-0 overflow-hidden rounded-md text-left transition-all active:scale-[0.99] ${
            keepOriginalAudio ? 'bg-primary/8 ring-1 ring-transparent' : 'bg-track-video/80 opacity-60 ring-1 ring-border/40'
          }`}
          aria-label="编辑原声音频"
        >
          <Waveform data={AUDIO_WAVE} color={keepOriginalAudio ? '#5E7CE0' : '#8E9AAB'} height={32} />
          {!keepOriginalAudio && (
            <span className="absolute inset-0 flex items-center justify-center gap-1 bg-surface/60 text-[9px] font-medium text-text-muted">
              <VolumeX size={10} />
              原声已关闭
            </span>
          )}
        </button>

        {/* 配乐轨道 */}
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onAudioClick?.()
          }}
          className="relative mx-1 mb-2 block w-[calc(100%-0.5rem)] shrink-0 text-left transition-all active:scale-[0.99]"
          aria-label="编辑配乐"
        >
          <p className="mb-0.5 truncate px-1 text-[9px] text-text-muted">{bgmLabel}</p>
          <article
            className={`h-5 overflow-hidden rounded-md ${
              bgmId ? 'bg-accent/10' : 'bg-track-video/60'
            }`}
          >
            <Waveform
              data={MUSIC_WAVE}
              color={bgmId ? '#FFB357' : '#8E9AAB'}
              height={20}
              opacity={bgmId ? 0.9 : 0.5}
            />
          </article>
        </button>

        {/* 播放头 */}
        <span
          className="pointer-events-none absolute bottom-0 top-6 z-20 w-0.5 -translate-x-1/2 bg-primary shadow-[0_0_6px_rgba(94,124,224,0.6)]"
          style={{ left: `${playheadPct}%` }}
        >
          <span className="absolute -left-1.5 -top-1 h-3 w-3 rounded-full border-2 border-white bg-primary shadow-sm" />
        </span>
      </article>
    </section>
  )
}
