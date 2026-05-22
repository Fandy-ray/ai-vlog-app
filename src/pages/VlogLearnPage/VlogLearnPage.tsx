import { ArrowLeft, Clapperboard, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GuideTip } from '@/components/GuideTip'
import { NineGridGuide } from '@/components/NineGridGuide'
import { PageShell } from '@/components/PageShell'
import { GRID_CELL_LABELS, VLOG_SCENES, type VlogScene } from '@/data/vlogGuide'

function formatCells(cells: VlogScene['subjectCells']) {
  return cells.map((c) => `\u7b2c ${c} \u683c\uff08${GRID_CELL_LABELS[c]}\uff09`).join('\u3001')
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export function VlogLearnPage() {
  const navigate = useNavigate()
  const [activeId, setActiveId] = useState(VLOG_SCENES[0].id)
  const scene = VLOG_SCENES.find((s) => s.id === activeId) ?? VLOG_SCENES[0]
  const scrollerRef = useRef<HTMLUListElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const tapScrolling = useRef(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const activeIndex = VLOG_SCENES.findIndex((s) => s.id === activeId)

  const updateScrollProgress = useCallback(() => {
    const container = scrollerRef.current
    if (!container) return
    const max = container.scrollWidth - container.clientWidth
    setScrollProgress(max > 0 ? container.scrollLeft / max : 0)
  }, [])

  const scrollToScene = useCallback((id: string, smooth = true) => {
    const container = scrollerRef.current
    if (!container) return
    const item = container.querySelector<HTMLElement>(`[data-scene-id="${id}"]`)
    if (!item) return
    const left = item.offsetLeft - (container.clientWidth - item.offsetWidth) / 2
    container.scrollTo({
      left: Math.max(0, left),
      behavior: smooth ? 'smooth' : 'auto',
    })
  }, [])

  const pickSceneFromScroll = useCallback(() => {
    const container = scrollerRef.current
    if (!container) return
    const center = container.scrollLeft + container.clientWidth / 2
    const items = container.querySelectorAll<HTMLElement>('[data-scene-id]')
    let bestId = activeId
    let bestDist = Infinity
    items.forEach((item) => {
      const itemCenter = item.offsetLeft + item.offsetWidth / 2
      const dist = Math.abs(itemCenter - center)
      if (dist < bestDist) {
        bestDist = dist
        bestId = item.dataset.sceneId ?? bestId
      }
    })
    setActiveId((prev) => (prev === bestId ? prev : bestId))
  }, [activeId])

  const seekScrollByRatio = useCallback(
    (ratio: number) => {
      const container = scrollerRef.current
      if (!container) return
      const max = container.scrollWidth - container.clientWidth
      container.scrollLeft = clamp(ratio, 0, 1) * max
      updateScrollProgress()
    },
    [updateScrollProgress],
  )

  const handleSceneScroll = useCallback(() => {
    updateScrollProgress()
    if (tapScrolling.current) return
    clearTimeout(scrollEndTimer.current)
    scrollEndTimer.current = setTimeout(pickSceneFromScroll, 80)
  }, [pickSceneFromScroll, updateScrollProgress])

  const handleTrackPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const track = trackRef.current
      if (!track) return
      e.preventDefault()
      track.setPointerCapture(e.pointerId)

      const seekFromPointer = (clientX: number) => {
        const rect = track.getBoundingClientRect()
        const ratio = (clientX - rect.left) / rect.width
        seekScrollByRatio(ratio)
      }

      seekFromPointer(e.clientX)

      const onMove = (ev: PointerEvent) => seekFromPointer(ev.clientX)
      const onUp = () => {
        track.releasePointerCapture(e.pointerId)
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        pickSceneFromScroll()
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [seekScrollByRatio, pickSceneFromScroll],
  )

  const handleSceneSelect = useCallback(
    (id: string) => {
      tapScrolling.current = true
      setActiveId(id)
      scrollToScene(id)
      setTimeout(() => {
        tapScrolling.current = false
      }, 350)
    },
    [scrollToScene],
  )

  useEffect(() => {
    updateScrollProgress()
    const container = scrollerRef.current
    if (!container) return
    const ro = new ResizeObserver(() => updateScrollProgress())
    ro.observe(container)
    return () => {
      ro.disconnect()
      clearTimeout(scrollEndTimer.current)
    }
  }, [updateScrollProgress])

  return (
    <PageShell scrollable className="pb-6">
      <header className="sticky top-0 z-10 flex items-center bg-bg/90 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface active:scale-95"
          aria-label={'\u8fd4\u56de'}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="flex-1 text-center text-[15px] font-semibold text-text">
          {'\u5b66\u4e60 Vlog'}
        </h1>
        <span className="w-9" />
      </header>

      <section className="flex-1 space-y-5 px-4">
        <section className="rounded-[var(--radius-xl)] bg-gradient-to-br from-primary/10 via-surface to-accent/10 p-4 shadow-[var(--shadow-card)]">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-[var(--shadow-soft)]">
              <Sparkles size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold text-text">{'AI \u5bfc\u62cd\u63d0\u793a'}</p>
              <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                {
                  '\u6253\u5f00\u624b\u673a\u76f8\u673a\u7f51\u683c\u7ebf\uff0c\u5bf9\u7167\u4e0b\u65b9\u4e5d\u5bab\u683c\u653e\u7f6e\u4eba\u7269\u6216\u666f\u7269\u3002\u7f16\u53f7\u4ece\u5de6\u5230\u53f3\u3001\u4ece\u4e0a\u5230\u4e0b\u4e3a 1-9\u3002'
                }
              </p>
            </div>
          </div>
        </section>

        <section className="-mx-4">
          <div className="mb-2 flex items-baseline justify-between px-4">
            <h2 className="text-sm font-semibold text-text">{'\u62cd\u6444\u573a\u666f'}</h2>
            <span className="text-[10px] text-text-muted">{'\u5de6\u53f3\u6ed1\u52a8\u9009\u62e9'}</span>
          </div>
          <ul
            ref={scrollerRef}
            onScroll={handleSceneScroll}
            className="h-scroll-snap flex gap-3 px-4 pb-2"
          >
            {VLOG_SCENES.map((s) => {
              const active = s.id === activeId
              return (
                <li
                  key={s.id}
                  data-scene-id={s.id}
                  className="w-[38vw] max-w-[148px] shrink-0 snap-center"
                >
                  <button
                    type="button"
                    onClick={() => handleSceneSelect(s.id)}
                    className={`flex h-full w-full flex-col rounded-[var(--radius-lg)] p-3 text-left transition-all active:scale-[0.98] ${
                      active
                        ? 'bg-primary text-white shadow-[var(--shadow-soft)] ring-2 ring-primary/30'
                        : 'bg-surface text-text shadow-[var(--shadow-card)] ring-1 ring-border'
                    }`}
                  >
                    <span
                      className={`text-sm font-semibold ${active ? 'text-white' : 'text-text'}`}
                    >
                      {s.title}
                    </span>
                    <span
                      className={`mt-1 line-clamp-2 text-[10px] leading-snug ${
                        active ? 'text-white/85' : 'text-text-muted'
                      }`}
                    >
                      {s.subtitle}
                    </span>
                  </button>
                </li>
              )
            })}
            <li className="w-4 shrink-0" aria-hidden />
          </ul>

          <div className="mt-3 space-y-2 px-4">
            <div
              ref={trackRef}
              role="slider"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(scrollProgress * 100)}
              aria-label={'\u62cd\u6444\u573a\u666f\u6ed1\u52a8\u6761'}
              onPointerDown={handleTrackPointerDown}
              className="scene-scroll-track"
            >
              <span
                className="scene-scroll-thumb"
                style={{
                  width: `${clamp(12 + scrollProgress * 88, 12, 100)}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-center gap-1.5">
              {VLOG_SCENES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSceneSelect(s.id)}
                  className={`rounded-full transition-all ${
                    i === activeIndex
                      ? 'h-1.5 w-5 bg-primary'
                      : 'h-1.5 w-1.5 bg-border hover:bg-primary/40'
                  }`}
                  aria-label={s.title}
                  aria-current={i === activeIndex}
                />
              ))}
            </div>
          </div>
        </section>

        <article className="rounded-[var(--radius-xl)] bg-surface p-4 shadow-[var(--shadow-card)]">
          <header className="mb-3 flex items-center gap-2">
            <Clapperboard size={16} className="text-primary" />
            <div>
              <h3 className="text-base font-semibold text-text">{scene.title}</h3>
              <p className="text-xs text-text-muted">{scene.subtitle}</p>
            </div>
          </header>

          <NineGridGuide
            subjectCells={scene.subjectCells}
            accentCells={scene.accentCells}
            className="mb-4"
          />

          <GuideTip title={'\u0041\u0049 \u5bfc\u64ad'} description={scene.aiPrompt} />

          <div className="mt-4 rounded-[var(--radius-md)] bg-bg px-3 py-2.5">
            <p className="text-xs font-medium text-text">{'\u6784\u56fe\u8981\u70b9'}</p>
            <p className="mt-1 text-xs leading-relaxed text-text-secondary">
              {scene.gridSummary}
            </p>
            <p className="mt-2 text-[10px] text-text-muted">
              {'\u5efa\u8bae\u4e3b\u4f53\uff1a'}
              {formatCells(scene.subjectCells)}
            </p>
          </div>

          <ol className="mt-4 space-y-2.5">
            {scene.steps.map((step, i) => (
              <li key={step} className="flex gap-2.5 text-xs leading-relaxed text-text-secondary">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </article>
      </section>
    </PageShell>
  )
}
