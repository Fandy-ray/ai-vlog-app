import {
  ArrowLeft,
  CalendarDays,
  GalleryVertical,
  Map,
  MapPin,
  Play,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BottomNav } from '@/components/BottomNav'
import { PageShell } from '@/components/PageShell'
import {
  getGardenVlogCountByDate,
  searchGardenVlogs,
  type GardenVlogItem,
} from '@/data/memories'
import { useGardenVlogs } from '@/hooks/useGardenVlogs'
import { GardenCalendar } from './GardenCalendar'
import { GardenMap } from './GardenMap'
import { GardenTimeline } from './GardenTimeline'
import { GardenVlogViewer } from './GardenVlogViewer'

type SortKey = 'time' | 'location'
type TimeOrder = 'desc' | 'asc'

function formatDisplayDate(date: string) {
  const [year, month, day] = date.split('-')
  return `${year}年${Number(month)}月${Number(day)}日`
}

interface GardenLocationState {
  searchQuery?: string
}

export function GardenPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const initialSearch =
    (location.state as GardenLocationState | null)?.searchQuery?.trim() ?? ''

  const [sortBy, setSortBy] = useState<SortKey>('time')
  const [timeOrder, setTimeOrder] = useState<TimeOrder>('desc')
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)
  const [timelineOpen, setTimelineOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [playingVlog, setPlayingVlog] = useState<GardenVlogItem | null>(null)
  const { vlogs: allVlogs } = useGardenVlogs()

  useEffect(() => {
    if (!initialSearch) return
    navigate(location.pathname, { replace: true, state: null })
  }, [initialSearch, location.pathname, navigate])

  const vlogCountByDate = useMemo(() => getGardenVlogCountByDate(allVlogs), [allVlogs])
  const markedDates = useMemo(() => new Set(vlogCountByDate.keys()), [vlogCountByDate])

  const searchedVlogs = useMemo(
    () => searchGardenVlogs(allVlogs, searchQuery),
    [allVlogs, searchQuery],
  )

  const sortedVlogs = useMemo(() => {
    let list = [...searchedVlogs]
    if (selectedDate) {
      list = list.filter((item) => item.date === selectedDate)
    }
    if (sortBy === 'location') {
      return list.sort((a, b) => a.location.localeCompare(b.location, 'zh-Hans-CN'))
    }
    return list.sort((a, b) => {
      const dateDiff = a.date.localeCompare(b.date)
      const timeDiff = a.timeLabel.localeCompare(b.timeLabel, 'zh-Hans-CN')
      const combined = dateDiff || timeDiff
      return timeOrder === 'desc' ? -combined : combined
    })
  }, [searchedVlogs, sortBy, selectedDate, timeOrder])

  const handleSelectDate = (date: string) => {
    setSelectedDate(date)
    const vlogsOnDate = allVlogs.filter((item) => item.date === date)
    if (vlogsOnDate.length === 1) {
      setPlayingVlog(vlogsOnDate[0])
    }
  }

  return (
    <PageShell scrollable className="pb-0">
      <header className="sticky top-0 z-10 bg-bg/90 px-4 pb-4 pt-3 backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface"
            aria-label="返回"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Memory Garden</p>
            <h1 className="text-lg font-bold text-text">记忆花园</h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setCalendarOpen(false)
                setTimelineOpen(false)
                setMapOpen((open) => !open)
              }}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                mapOpen
                  ? 'bg-primary text-white shadow-[var(--shadow-soft)]'
                  : 'text-text-secondary hover:bg-surface'
              }`}
              aria-label="打开回忆地图"
            >
              <Map size={20} />
            </button>
            <button
              type="button"
              onClick={() => {
                setMapOpen(false)
                setTimelineOpen(false)
                setCalendarOpen((open) => !open)
              }}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                calendarOpen || selectedDate
                  ? 'bg-primary text-white shadow-[var(--shadow-soft)]'
                  : 'text-text-secondary hover:bg-surface'
              }`}
              aria-label="打开回忆日历"
            >
              <CalendarDays size={20} />
            </button>
            <button
              type="button"
              onClick={() => {
                setMapOpen(false)
                setCalendarOpen(false)
                setTimelineOpen((open) => !open)
              }}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                timelineOpen
                  ? 'bg-primary text-white shadow-[var(--shadow-soft)]'
                  : 'text-text-secondary hover:bg-surface'
              }`}
              aria-label="打开回忆时间轴"
            >
              <GalleryVertical size={20} />
            </button>
          </div>
        </div>

        <div className="rounded-[var(--radius-2xl)] bg-gradient-to-r from-primary via-[#6c63ff] to-accent p-4 text-white shadow-[var(--shadow-hero)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-medium backdrop-blur-sm">
                <Sparkles size={12} />
                已剪辑好的 vlog
              </span>
              <h2 className="text-xl font-bold">按时间或地点整理你的回忆</h2>
              <p className="mt-1 text-sm text-white/85">
                搜索关键字、地点或主题，也可通过地图、日历、时间轴浏览 vlog。
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCalendarOpen(false)
                  setTimelineOpen(false)
                  setMapOpen(true)
                }}
                className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm transition-transform active:scale-95"
                aria-label="打开回忆地图"
              >
                <Map size={22} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setMapOpen(false)
                  setTimelineOpen(false)
                  setCalendarOpen(true)
                }}
                className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm transition-transform active:scale-95"
                aria-label="打开回忆日历"
              >
                <CalendarDays size={22} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setMapOpen(false)
                  setCalendarOpen(false)
                  setTimelineOpen(true)
                }}
                className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm transition-transform active:scale-95"
                aria-label="打开回忆时间轴"
              >
                <GalleryVertical size={22} />
              </button>
            </div>
          </div>
        </div>

        <div className="relative mt-4">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="搜索标题、地点、主题或描述…"
            className="w-full rounded-full border border-border bg-surface py-2.5 pl-10 pr-10 text-sm text-text shadow-[var(--shadow-card)] outline-none transition-colors placeholder:text-text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
            aria-label="搜索 vlog"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg"
              aria-label="清除搜索"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setSortBy('time')}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              sortBy === 'time' ? 'bg-primary text-white shadow-[var(--shadow-soft)]' : 'bg-surface text-text-secondary'
            }`}
          >
            按时间
          </button>
          <button
            type="button"
            onClick={() => setSortBy('location')}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              sortBy === 'location' ? 'bg-primary text-white shadow-[var(--shadow-soft)]' : 'bg-surface text-text-secondary'
            }`}
          >
            按地点
          </button>
        </div>

        {sortBy === 'time' && (
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setTimeOrder('desc')}
              className={`flex-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                timeOrder === 'desc'
                  ? 'bg-primary/12 text-primary ring-1 ring-primary/20'
                  : 'bg-bg text-text-muted'
              }`}
            >
              时间倒序
            </button>
            <button
              type="button"
              onClick={() => setTimeOrder('asc')}
              className={`flex-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                timeOrder === 'asc'
                  ? 'bg-primary/12 text-primary ring-1 ring-primary/20'
                  : 'bg-bg text-text-muted'
              }`}
            >
              时间正序
            </button>
          </div>
        )}
      </header>

      <section className="flex-1 px-4 pb-4">
        {searchQuery && (
          <div className="mb-3 flex items-center justify-between rounded-[var(--radius-lg)] bg-accent/8 px-3 py-2 ring-1 ring-accent/15">
            <p className="text-sm text-text">
              搜索「<span className="font-semibold text-accent">{searchQuery}</span>」
              {' · '}
              {sortedVlogs.length} 支 vlog
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="inline-flex items-center gap-1 text-xs font-medium text-accent"
            >
              <X size={14} />
              清除
            </button>
          </div>
        )}

        {selectedDate && (
          <div className="mb-3 flex items-center justify-between rounded-[var(--radius-lg)] bg-primary/8 px-3 py-2 ring-1 ring-primary/15">
            <p className="text-sm text-text">
              正在查看 <span className="font-semibold text-primary">{formatDisplayDate(selectedDate)}</span>
              {' · '}
              {sortedVlogs.length} 支 vlog
            </p>
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary"
            >
              <X size={14} />
              清除
            </button>
          </div>
        )}

        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-text">{sortedVlogs.length} 支剪辑 vlog</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setCalendarOpen(false)
                setTimelineOpen(false)
                setMapOpen(true)
              }}
              className="text-xs text-primary"
            >
              地图浏览
            </button>
            <button
              type="button"
              onClick={() => {
                setMapOpen(false)
                setTimelineOpen(false)
                setCalendarOpen(true)
              }}
              className="text-xs text-primary"
            >
              日历筛选
            </button>
            <button
              type="button"
              onClick={() => {
                setMapOpen(false)
                setCalendarOpen(false)
                setTimelineOpen(true)
              }}
              className="text-xs text-primary"
            >
              时间轴
            </button>
          </div>
        </div>

        {sortedVlogs.length === 0 ? (
          <div className="rounded-[var(--radius-xl)] bg-surface px-4 py-10 text-center shadow-[var(--shadow-card)]">
            {searchQuery ? (
              <>
                <Search size={28} className="mx-auto text-text-muted" />
                <p className="mt-3 text-sm font-medium text-text">没有找到匹配的 vlog</p>
                <p className="mt-1 text-xs text-text-muted">
                  试试搜索地点（如「大理」）、主题（如「海边」）或标题关键字
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-4 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white"
                >
                  清除搜索
                </button>
              </>
            ) : selectedDate ? (
              <>
                <CalendarDays size={28} className="mx-auto text-text-muted" />
                <p className="mt-3 text-sm font-medium text-text">这一天还没有 vlog</p>
                <p className="mt-1 text-xs text-text-muted">试试选择其他有标注的日期</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate(null)
                    setCalendarOpen(true)
                  }}
                  className="mt-4 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white"
                >
                  打开日历
                </button>
              </>
            ) : (
              <>
                <Search size={28} className="mx-auto text-text-muted" />
                <p className="mt-3 text-sm font-medium text-text">暂无 vlog</p>
              </>
            )}
          </div>
        ) : (
          <ul className="space-y-3 pb-4">
            {sortedVlogs.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setPlayingVlog(item)}
                  className="flex w-full gap-3 rounded-[var(--radius-xl)] bg-surface p-3 text-left shadow-[var(--shadow-card)] transition-transform active:scale-[0.99]"
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-track-video">
                    <img
                      src={item.cover}
                      alt={item.title}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                    <span className="absolute bottom-2 left-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
                      <Play size={13} fill="white" />
                    </span>
                    <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      {item.duration}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate text-base font-semibold text-text">{item.title}</h3>
                      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">
                        {item.theme}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-text-muted">{item.description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-text-muted">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={12} />
                        {item.location}
                      </span>
                      <span>{formatDisplayDate(item.date)}</span>
                      <span>{item.timeLabel}</span>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <GardenMap
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        vlogs={searchedVlogs}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onPlayVlog={setPlayingVlog}
      />

      <GardenCalendar
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        markedDates={markedDates}
        vlogCountByDate={vlogCountByDate}
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        focusDate={selectedDate}
      />

      <GardenTimeline
        open={timelineOpen}
        onClose={() => setTimelineOpen(false)}
        vlogs={searchedVlogs}
        onPlayVlog={setPlayingVlog}
      />

      <GardenVlogViewer vlog={playingVlog} onClose={() => setPlayingVlog(null)} />

      <BottomNav
        active="garden"
        onChange={(tab) => {
          if (tab === 'home') navigate('/')
          else if (tab === 'create') navigate('/create')
          else if (tab === 'profile') navigate('/profile')
        }}
      />
    </PageShell>
  )
}
