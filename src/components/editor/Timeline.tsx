import { Plus, Star } from 'lucide-react'

import { useMemo, useRef } from 'react'

import {

  HIGHLIGHT_AT,

  PREVIEW_POSTER,

  VIDEO_CLIPS,

  type VideoClip,

} from '@/data/mockProject'

import type { TimelineDisplayClip } from '@/types/timelineDisplay'

import type { PlayheadSnapEdge } from '@/utils/playheadSnap'

import type { TimelineClipDragMode } from '@/utils/timelineDisplay'

import { EDITOR_TIMELINE_ATTR } from '@/utils/editorSelectionHitTest'

import {

  contentRangeStyle,

  TIMELINE_ADD_CLIP_BUTTON_CLASS,

  TIMELINE_INSET_PCT,

  TIMELINE_MODULE_CLASS,

  TIMELINE_PANEL_CLASS,

  TIMELINE_RULER_ROW_CLASS,

  TIMELINE_TOOLBAR_MODULE_CLASS,

  TIMELINE_VIDEO_CLIP_ROW_CLASS,

  TIMELINE_VIDEO_TRACK_SECTION_CLASS,

  timeToContentPercent,

} from '@/utils/timelineRuler'

import { TimelineObjectTracks } from './TimelineObjectTracks'

import { TimelinePlayhead } from './TimelinePlayhead'

import { TimelineRuler } from './TimelineRuler'

import {

  TimelineToolbar,

  type TimelineToolId,

} from './TimelineToolbar'



interface TimelineProps {

  clips?: VideoClip[]

  highlightAt?: number

  currentTime: number

  duration: number

  isPlaying?: boolean

  /** 为 true 时（播放中或暂停在播放位置）：高亮跟指针；为 false 时仅跟手动选中 */
  highlightFollowsPlayhead?: boolean

  overlayClips?: TimelineDisplayClip[]

  draggingClipId?: string | null

  playheadSnapActive?: boolean

  playheadSnapEdge?: PlayheadSnapEdge | null

  onSeek: (time: number) => void

  onPlayheadSeekEnd?: () => void

  onClipSelect?: (clip: VideoClip) => void

  selectedVideoClipId?: string | null

  onEditTool?: (id: TimelineToolId) => void

  canSplitClip?: boolean

  canDeleteClip?: boolean

  clipPlaybackRate?: number

  onClipPlaybackRateChange?: (rate: number) => void

  activeEditTool?: TimelineToolId | null

  onImportClick?: () => void

  importLoading?: boolean

  onOverlayTracksWidthChange?: (widthPx: number) => void

  onOverlayClipClick?: (clip: TimelineDisplayClip) => void

  onOverlayClipDoubleClick?: (clip: TimelineDisplayClip) => void

  onOverlayClipOpenMenu?: (clip: TimelineDisplayClip, x: number, y: number) => void

  onOverlayClipDragStart?: (

    clip: TimelineDisplayClip,

    clientX: number,

    mode: TimelineClipDragMode,

  ) => void

  onOverlayClipDragMove?: (

    clip: TimelineDisplayClip,

    clientX: number,

    trackWidthPx: number,

  ) => void

  onOverlayClipDragEnd?: (

    clip: TimelineDisplayClip,

    clientX: number,

    trackWidthPx: number,

  ) => void

}



function isClipActive(clip: VideoClip, time: number) {

  return time >= clip.start && time < clip.start + clip.duration

}

/** 播放/暂停在播放位置：只高亮指针所在；未运行：只高亮手动选中 */
function isClipHighlighted(
  selected: boolean,
  atPlayhead: boolean,
  isPlaying: boolean,
  highlightFollowsPlayhead: boolean,
) {
  if (isPlaying || highlightFollowsPlayhead) return atPlayhead
  return selected
}

const CLIP_TRIM_HANDLE =
  'pointer-events-none absolute inset-y-0 w-[12px] border-[3px] border-solid border-primary transition-[opacity,transform] duration-200 ease-out'

function ClipTrimHighlight() {
  return (
    <>
      <span
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-primary/[0.06] transition-opacity duration-200 ease-out"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(94,124,224,0.65)] transition-shadow duration-200 ease-out"
        aria-hidden
      />
      <span
        className={`${CLIP_TRIM_HANDLE} left-0 rounded-l-[inherit] border-l-primary border-t-primary border-b-primary border-r-transparent`}
        aria-hidden
      />
      <span
        className={`${CLIP_TRIM_HANDLE} right-0 rounded-r-[inherit] border-r-primary border-t-primary border-b-primary border-l-transparent`}
        aria-hidden
      />
    </>
  )
}

function videoClipButtonClass(highlighted: boolean) {
  return [
    'group relative h-full w-full overflow-hidden rounded-md bg-track-video',
    'transition-[opacity,filter,transform] duration-200 ease-out',
    'active:scale-[0.98]',
    highlighted ? 'opacity-100' : 'opacity-[0.58] hover:opacity-[0.78]',
  ].join(' ')
}



function getHighlightCenterPercent(

  duration: number,

  clips: VideoClip[],

  highlightAt: number,

): number {

  const clip =

    clips.find((c) => highlightAt >= c.start && highlightAt < c.start + c.duration) ??

    clips[0]

  if (!clip || duration <= 0) return 0

  return timeToContentPercent(clip.start + clip.duration / 2, duration)

}



export function Timeline({

  clips = VIDEO_CLIPS,

  highlightAt = HIGHLIGHT_AT,

  currentTime,

  duration,

  isPlaying = false,

  highlightFollowsPlayhead = false,

  overlayClips = [],

  draggingClipId = null,

  playheadSnapActive = false,

  playheadSnapEdge = null,

  onSeek,

  onPlayheadSeekEnd,

  onClipSelect,

  selectedVideoClipId = null,

  onEditTool,

  canSplitClip = false,

  canDeleteClip = false,

  clipPlaybackRate = 1,

  onClipPlaybackRateChange,

  activeEditTool = null,

  onImportClick,

  importLoading = false,

  onOverlayTracksWidthChange,

  onOverlayClipClick,

  onOverlayClipDoubleClick,

  onOverlayClipOpenMenu,

  onOverlayClipDragStart,

  onOverlayClipDragMove,

  onOverlayClipDragEnd,

}: TimelineProps) {

  const timelineAreaRef = useRef<HTMLDivElement>(null)

  const timeContentRef = useRef<HTMLDivElement>(null)

  const highlightCenterPct = useMemo(

    () => getHighlightCenterPercent(duration, clips, highlightAt),

    [duration, clips, highlightAt],

  )

  const playheadLeftPct = timeToContentPercent(currentTime, duration)

  const showAddColumn = Boolean(onImportClick)



  return (

    <section

      {...{ [EDITOR_TIMELINE_ATTR]: '' }}

      className={TIMELINE_MODULE_CLASS}

    >

      {onEditTool && (
        <div className={TIMELINE_TOOLBAR_MODULE_CLASS}>
          <TimelineToolbar
            onTool={onEditTool}
            disabled={!selectedVideoClipId}
            canSplit={canSplitClip}
            canDelete={canDeleteClip}
            playbackRate={clipPlaybackRate}
            onPlaybackRateChange={onClipPlaybackRateChange}
            activeTool={activeEditTool}
          />
        </div>
      )}

      <article className={TIMELINE_PANEL_CLASS}>

        <div

          ref={timelineAreaRef}

          className="relative flex min-h-0 flex-1 flex-col overflow-hidden"

        >

          <div

            className="flex min-h-0 flex-1 flex-col"

            style={{

              marginLeft: `${TIMELINE_INSET_PCT}%`,

              marginRight: `${TIMELINE_INSET_PCT}%`,

            }}

          >

            <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden px-2 pb-2 pt-1.5">

              <div

                className={`flex min-h-0 flex-1 ${showAddColumn ? 'gap-0.5' : ''} overflow-x-hidden overflow-y-visible`}

              >

              <div

                ref={timeContentRef}

                className="relative flex min-w-0 flex-1 flex-col overflow-visible"

              >

                <TimelineRuler

                  duration={duration}

                  contentArea

                  onSeek={onSeek}

                  onPlayheadSeekEnd={onPlayheadSeekEnd}

                />



                <section className={TIMELINE_VIDEO_TRACK_SECTION_CLASS}>

                  <div className={TIMELINE_VIDEO_CLIP_ROW_CLASS}>

                    {clips.map((clip) => {

                      const atPlayhead = isClipActive(clip, currentTime)

                      const selected = selectedVideoClipId === clip.id

                      const highlighted = isClipHighlighted(
                        selected,
                        atPlayhead,
                        isPlaying,
                        highlightFollowsPlayhead,
                      )

                      const range = contentRangeStyle(

                        clip.start,

                        clip.start + clip.duration,

                        duration,

                      )

                      return (

                        <div

                          key={clip.id}

                          className="absolute top-0 bottom-0 min-w-[2px]"

                          style={range}

                        >

                          <button
                            type="button"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation()
                              onClipSelect?.(clip)
                            }}
                            className={videoClipButtonClass(highlighted)}
                            aria-label={`片段 ${clip.id}`}
                            aria-pressed={selected}
                            aria-current={atPlayhead ? 'true' : undefined}
                          >
                            <img
                              src={clip.thumb}
                              alt=""
                              className={`h-full w-full object-cover transition-[filter] duration-200 ease-out ${
                                highlighted
                                  ? 'brightness-[1.05] saturate-[1.04]'
                                  : 'brightness-[0.92] group-hover:brightness-[1.02]'
                              }`}
                              draggable={false}
                              loading="lazy"
                              onError={(e) => {
                                const img = e.currentTarget
                                if (img.dataset.fallbackApplied) return
                                img.dataset.fallbackApplied = '1'
                                img.src = PREVIEW_POSTER
                              }}
                            />
                            {!highlighted && (
                              <span
                                className="pointer-events-none absolute inset-0 bg-white/0 transition-colors duration-200 ease-out group-hover:bg-white/[0.07]"
                                aria-hidden
                              />
                            )}
                            {highlighted && <ClipTrimHighlight />}
                          </button>

                        </div>

                      )

                    })}

                  </div>



                  <span

                    className="pointer-events-none absolute -top-1 z-10 flex -translate-x-1/2 items-center gap-0.5 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-medium text-white shadow-sm"

                    style={{ left: `${highlightCenterPct}%` }}

                  >

                    <Star size={8} fill="white" />

                    高光时刻

                  </span>

                </section>



                <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden">

                <TimelineObjectTracks

                  clips={overlayClips}

                  duration={duration}

                  draggingClipId={draggingClipId}

                  playheadSnapEdge={playheadSnapActive ? playheadSnapEdge : null}

                  onTracksWidthChange={onOverlayTracksWidthChange}

                  onClipClick={onOverlayClipClick}

                  onClipDoubleClick={onOverlayClipDoubleClick}

                  onClipOpenMenu={onOverlayClipOpenMenu}

                  onClipDragStart={onOverlayClipDragStart}

                  onClipDragMove={onOverlayClipDragMove}

                  onClipDragEnd={onOverlayClipDragEnd}

                />

                </div>



                {playheadSnapActive && (

                  <span

                    className="pointer-events-none absolute top-0 bottom-0 z-[25] w-px -translate-x-1/2 bg-primary shadow-[0_0_8px_rgba(94,124,224,0.85)]"

                    style={{ left: `${playheadLeftPct}%` }}

                    aria-hidden

                  />

                )}



                <TimelinePlayhead

                  currentTime={currentTime}

                  duration={duration}

                  areaRef={timeContentRef}

                  contentArea

                  snapActive={playheadSnapActive}

                  onSeek={onSeek}

                  onSeekEnd={onPlayheadSeekEnd}

                />

              </div>



              {showAddColumn && (

                <aside

                  className="flex w-11 shrink-0 flex-col"

                  aria-label="添加素材"

                >

                  <div

                    className={`${TIMELINE_RULER_ROW_CLASS} pointer-events-none shrink-0`}

                    aria-hidden

                  />

                  <div className={TIMELINE_VIDEO_TRACK_SECTION_CLASS}>

                    <div className={TIMELINE_VIDEO_CLIP_ROW_CLASS}>

                      <button

                        type="button"

                        disabled={importLoading}

                        onPointerDown={(e) => e.stopPropagation()}

                        onClick={(e) => {

                          e.stopPropagation()

                          onImportClick?.()

                        }}

                        className={TIMELINE_ADD_CLIP_BUTTON_CLASS}

                        aria-label="添加视频素材"

                      >

                        {importLoading ? (

                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />

                        ) : (

                          <Plus size={20} strokeWidth={2} />

                        )}

                      </button>

                    </div>

                  </div>

                </aside>

              )}

              </div>

            </div>

          </div>

        </div>

      </article>

    </section>

  )

}


