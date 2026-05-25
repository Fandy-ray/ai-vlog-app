import { Minus, Plus, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import Globe, { type GlobeMethods } from 'react-globe.gl'
import type { GardenVlogItem } from '@/data/memories'

const EARTH_IMAGE = 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
const EARTH_BUMP = 'https://unpkg.com/three-globe/example/img/earth-topology.png'
const DEFAULT_POV = { lat: 20, lng: 0, altitude: 2.4 }
const MIN_ALTITUDE = 0.35
const MAX_ALTITUDE = 4.5

interface GardenGlobeProps {
  vlogs: GardenVlogItem[]
  activeId: string | null
  onSelectVlog: (id: string) => void
  open: boolean
}

export function GardenGlobe({ vlogs, activeId, onSelectVlog, open }: GardenGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!open) {
      setSize({ width: 0, height: 0 })
      return
    }

    const el = containerRef.current
    if (!el) return

    const updateSize = () => {
      const { width, height } = el.getBoundingClientRect()
      const w = Math.round(width)
      const h = Math.round(height)
      if (w > 0 && h > 0) {
        setSize((prev) => (prev.width === w && prev.height === h ? prev : { width: w, height: h }))
      }
    }

    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(el)

    const t1 = window.setTimeout(updateSize, 100)
    const t2 = window.setTimeout(updateSize, 280)

    return () => {
      observer.disconnect()
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [open])

  const zoomBy = useCallback((factor: number) => {
    const globe = globeRef.current
    if (!globe) return
    const pov = globe.pointOfView()
    const nextAltitude = Math.min(MAX_ALTITUDE, Math.max(MIN_ALTITUDE, pov.altitude * factor))
    globe.pointOfView({ altitude: nextAltitude }, 280)
  }, [])

  const resetView = useCallback(() => {
    globeRef.current?.pointOfView(DEFAULT_POV, 600)
  }, [])

  useEffect(() => {
    if (!open || size.width === 0 || size.height === 0) return
    const timer = window.setTimeout(() => {
      const globe = globeRef.current
      if (!globe) return
      globe.renderer().setSize(size.width, size.height)
      globe.pointOfView(DEFAULT_POV, 0)
    }, 60)
    return () => window.clearTimeout(timer)
  }, [open, size.width, size.height])

  useEffect(() => {
    if (!activeId || !globeRef.current) return
    const vlog = vlogs.find((item) => item.id === activeId)
    if (!vlog) return
    globeRef.current.pointOfView({ lat: vlog.lat, lng: vlog.lng, altitude: 1.05 }, 700)
  }, [activeId, vlogs])

  return (
    <div
      ref={containerRef}
      className="garden-globe-host relative h-full w-full overflow-hidden rounded-[inherit] bg-[#0b1220]"
    >
      {size.width > 0 && size.height > 0 && (
        <div className="garden-globe-canvas">
          <Globe
            ref={globeRef}
            width={size.width}
            height={size.height}
            globeOffset={[0, 0]}
            globeImageUrl={EARTH_IMAGE}
            bumpImageUrl={EARTH_BUMP}
        backgroundColor="rgba(11, 18, 32, 0)"
        showAtmosphere
        atmosphereColor="#818cf8"
        atmosphereAltitude={0.12}
        pointsData={vlogs}
        pointLat="lat"
        pointLng="lng"
        pointColor={(obj) => {
          const vlog = obj as GardenVlogItem
          return vlog.id === activeId ? '#6366f1' : '#14b8a6'
        }}
        pointAltitude={0.025}
        pointRadius={0.55}
        pointLabel={(obj) => {
          const vlog = obj as GardenVlogItem
          return `
          <div style="
            padding:6px 10px;
            border-radius:10px;
            background:rgba(255,255,255,0.95);
            color:#0f172a;
            font-size:12px;
            line-height:1.35;
            box-shadow:0 4px 16px rgba(15,23,42,0.2);
            max-width:180px;
          ">
            <strong style="display:block;font-size:13px;">${vlog.location}</strong>
            <span style="color:#64748b;">${vlog.title}</span>
          </div>
        `
        }}
            onPointClick={(obj) => onSelectVlog((obj as GardenVlogItem).id)}
            animateIn
          />
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#0b1220]/80 to-transparent" />

      <div className="pointer-events-none absolute right-3 top-3 z-[1000] flex w-9 flex-col gap-2">
        <div className="pointer-events-auto flex flex-col overflow-hidden rounded-xl bg-white/95 shadow-[var(--shadow-soft)] ring-1 ring-border backdrop-blur-sm">
          <button
            type="button"
            onClick={() => zoomBy(0.72)}
            className="flex h-9 w-9 items-center justify-center text-text-secondary transition-colors hover:bg-bg"
            aria-label="放大地球"
          >
            <Plus size={16} />
          </button>
          <div className="h-px bg-border" />
          <button
            type="button"
            onClick={() => zoomBy(1.38)}
            className="flex h-9 w-9 items-center justify-center text-text-secondary transition-colors hover:bg-bg"
            aria-label="缩小地球"
          >
            <Minus size={16} />
          </button>
        </div>
        <button
          type="button"
          onClick={resetView}
          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 text-text-secondary shadow-[var(--shadow-soft)] ring-1 ring-border backdrop-blur-sm transition-colors hover:bg-bg"
          aria-label="重置地球视角"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      <p className="pointer-events-none absolute bottom-2 left-0 right-0 text-center text-[10px] text-white/55">
        拖拽旋转 · 滚轮缩放 · 点击标注查看 vlog
      </p>
    </div>
  )
}
