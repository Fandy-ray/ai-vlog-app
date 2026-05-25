import { Globe2, Map as MapIcon, MapPin, Minus, Play, Plus, RotateCcw, Search, X } from 'lucide-react'
import L from 'leaflet'
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { GARDEN_VLOGS, type GardenVlogItem } from '@/data/memories'

const GardenGlobe = lazy(() =>
  import('./GardenGlobe').then((module) => ({ default: module.GardenGlobe })),
)

type MapViewMode = 'flat' | 'globe'

interface GardenMapProps {
  open: boolean
  onClose: () => void
  vlogs?: GardenVlogItem[]
  searchQuery?: string
  onSearchQueryChange?: (query: string) => void
  onPlayVlog: (vlog: GardenVlogItem) => void
}

const WORLD_CENTER: L.LatLngExpression = [20, 0]
const WORLD_ZOOM = 2
const MIN_ZOOM = 1
const MAX_ZOOM = 18

function formatDisplayDate(date: string) {
  const [year, month, day] = date.split('-')
  return `${year}年${Number(month)}月${Number(day)}日`
}

function createMarkerIcon(isActive: boolean) {
  const pinColor = isActive ? '#6366f1' : '#14b8a6'

  return L.divIcon({
    className: 'garden-map-marker',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);">
        <span style="
          display:flex;
          align-items:center;
          justify-content:center;
          width:36px;
          height:36px;
          border-radius:9999px;
          background:${pinColor};
          color:white;
          box-shadow:0 4px 14px rgba(15,23,42,0.18);
          border:2px solid white;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  })
}

function MapRefBridge({ mapRef }: { mapRef: React.RefObject<L.Map | null> }) {
  const map = useMap()

  useEffect(() => {
    mapRef.current = map
    return () => {
      mapRef.current = null
    }
  }, [map, mapRef])

  return null
}

function MapResizeHandler({ open }: { open: boolean }) {
  const map = useMap()

  useEffect(() => {
    if (!open) return

    const timer = window.setTimeout(() => {
      map.invalidateSize()
    }, 120)

    return () => window.clearTimeout(timer)
  }, [map, open])

  return null
}

function MapControlsOverlay({ mapRef }: { mapRef: React.RefObject<L.Map | null> }) {
  return (
    <div className="pointer-events-none absolute right-3 top-3 z-[1000] flex flex-col gap-2">
      <div className="pointer-events-auto flex flex-col overflow-hidden rounded-xl bg-white/95 shadow-[var(--shadow-soft)] ring-1 ring-border backdrop-blur-sm">
        <button
          type="button"
          onClick={() => mapRef.current?.zoomIn()}
          className="flex h-9 w-9 items-center justify-center text-text-secondary transition-colors hover:bg-bg"
          aria-label="放大地图"
        >
          <Plus size={16} />
        </button>
        <div className="h-px bg-border" />
        <button
          type="button"
          onClick={() => mapRef.current?.zoomOut()}
          className="flex h-9 w-9 items-center justify-center text-text-secondary transition-colors hover:bg-bg"
          aria-label="缩小地图"
        >
          <Minus size={16} />
        </button>
      </div>
      <button
        type="button"
        onClick={() => mapRef.current?.setView(WORLD_CENTER, WORLD_ZOOM)}
        className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 text-text-secondary shadow-[var(--shadow-soft)] ring-1 ring-border backdrop-blur-sm transition-colors hover:bg-bg"
        aria-label="重置为世界视图"
      >
        <RotateCcw size={15} />
      </button>
    </div>
  )
}

export function GardenMap({
  open,
  onClose,
  vlogs = GARDEN_VLOGS,
  searchQuery = '',
  onSearchQueryChange,
  onPlayVlog,
}: GardenMapProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<MapViewMode>('globe')
  const mapRef = useRef<L.Map | null>(null)

  const activeVlog = useMemo(
    () => vlogs.find((item) => item.id === activeId) ?? null,
    [activeId, vlogs],
  )

  useEffect(() => {
    if (!open) {
      setActiveId(null)
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="garden-map-title"
      onClick={onClose}
    >
      <article
        className="flex w-full max-w-2xl flex-col overflow-hidden rounded-[var(--radius-2xl)] bg-surface shadow-[var(--shadow-card)]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <p className="text-xs font-medium text-primary">按地点浏览</p>
            <h2 id="garden-map-title" className="text-lg font-bold text-text">
              世界回忆地图
            </h2>
            <p className="mt-0.5 text-xs text-text-muted">
              {viewMode === 'globe'
                ? '拖拽旋转地球，滚轮或按钮可缩放'
                : '滚轮或按钮可缩放，拖拽可平移'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="flex rounded-full bg-bg p-0.5 ring-1 ring-border"
              role="tablist"
              aria-label="地图视图模式"
            >
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'globe'}
                onClick={() => setViewMode('globe')}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === 'globe'
                    ? 'bg-primary text-white shadow-[var(--shadow-soft)]'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                <Globe2 size={14} />
                3D 地球
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'flat'}
                onClick={() => setViewMode('flat')}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === 'flat'
                    ? 'bg-primary text-white shadow-[var(--shadow-soft)]'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                <MapIcon size={14} />
                平面
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg"
              aria-label="关闭地图"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {onSearchQueryChange && (
          <div className="relative mx-4 mt-3">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="搜索标题、地点、主题或描述…"
              className="w-full rounded-full border border-border bg-bg py-2 pl-9 pr-9 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
              aria-label="搜索 vlog"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchQueryChange('')}
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface"
                aria-label="清除搜索"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}

        <div className="relative mx-4 mt-4 h-[min(52vh,360px)] overflow-hidden rounded-[var(--radius-xl)] ring-1 ring-border">
          {viewMode === 'globe' ? (
            <Suspense
              fallback={
                <div className="flex h-full w-full items-center justify-center bg-[#0b1220] text-sm text-white/70">
                  正在加载 3D 地球…
                </div>
              }
            >
              <GardenGlobe
                vlogs={vlogs}
                activeId={activeId}
                onSelectVlog={setActiveId}
                open={open}
              />
            </Suspense>
          ) : (
            <>
              <MapContainer
                center={WORLD_CENTER}
                zoom={WORLD_ZOOM}
                minZoom={MIN_ZOOM}
                maxZoom={MAX_ZOOM}
                scrollWheelZoom
                zoomControl={false}
                className="h-full w-full z-0"
                attributionControl
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapRefBridge mapRef={mapRef} />
                <MapResizeHandler open={open} />
                {vlogs.map((vlog) => (
                  <Marker
                    key={vlog.id}
                    position={[vlog.lat, vlog.lng]}
                    icon={createMarkerIcon(activeId === vlog.id)}
                    eventHandlers={{
                      click: () => setActiveId(vlog.id),
                    }}
                    title={`${vlog.location}，${vlog.title}`}
                  />
                ))}
              </MapContainer>
              <MapControlsOverlay mapRef={mapRef} />
            </>
          )}
        </div>

        <div className="px-4 pb-4 pt-3">
          {activeVlog ? (
            <button
              type="button"
              onClick={() => {
                onPlayVlog(activeVlog)
                onClose()
              }}
              className="flex w-full gap-3 rounded-[var(--radius-xl)] bg-bg p-3 text-left ring-1 ring-border transition-transform active:scale-[0.99]"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-track-video">
                <img
                  src={activeVlog.cover}
                  alt={activeVlog.title}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-sm">
                    <Play size={14} fill="white" />
                  </span>
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-base font-semibold text-text">{activeVlog.title}</h3>
                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">
                    {activeVlog.theme}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-text-muted">{activeVlog.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={12} />
                    {activeVlog.location}
                  </span>
                  <span>{formatDisplayDate(activeVlog.date)}</span>
                </div>
              </div>
            </button>
          ) : vlogs.length === 0 ? (
            <div className="rounded-[var(--radius-xl)] bg-bg px-4 py-6 text-center ring-1 ring-border">
              <Search size={24} className="mx-auto text-primary" />
              <p className="mt-2 text-sm font-medium text-text">没有匹配的 vlog</p>
              <p className="mt-1 text-xs text-text-muted">试试其他关键字或清除搜索</p>
            </div>
          ) : (
            <div className="rounded-[var(--radius-xl)] bg-bg px-4 py-6 text-center ring-1 ring-border">
              <MapPin size={24} className="mx-auto text-primary" />
              <p className="mt-2 text-sm font-medium text-text">
                {viewMode === 'globe' ? '点击地球上的标注' : '点击地图上的标注'}
              </p>
              <p className="mt-1 text-xs text-text-muted">查看该地点的 vlog 并播放</p>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white">
                <MapPin size={10} fill="currentColor" />
              </span>
              vlog 地点
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
                <MapPin size={10} fill="currentColor" />
              </span>
              当前选中
            </span>
            <span>{vlogs.length} 个地点</span>
          </div>
        </div>
      </article>
    </div>
  )
}
