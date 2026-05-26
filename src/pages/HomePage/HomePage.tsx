import { Camera, ChevronRight, CircleHelp, Clapperboard, Search, Sparkles, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { MemoryItem } from '@/components/MemoryCard'
import { BottomNav } from '@/components/BottomNav'
import { MemoryCard } from '@/components/MemoryCard'
import { PageShell } from '@/components/PageShell'
import { HERO_COVER, MEMORY_ITEMS, searchGardenVlogs } from '@/data/memories'
import { useGardenVlogs } from '@/hooks/useGardenVlogs'

function searchMemoryItems(items: MemoryItem[], query: string): MemoryItem[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return items

  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(normalized) ||
      item.views.toLowerCase().includes(normalized),
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const { vlogs: gardenVlogs } = useGardenVlogs()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  const isSearching = searchQuery.trim().length > 0

  const displayItems = useMemo((): MemoryItem[] => {
    if (!isSearching) return MEMORY_ITEMS

    const gardenResults = searchGardenVlogs(gardenVlogs, searchQuery)
    if (gardenResults.length > 0) return gardenResults

    return searchMemoryItems(MEMORY_ITEMS, searchQuery)
  }, [isSearching, searchQuery, gardenVlogs])

  useEffect(() => {
    if (!searchOpen) return
    const timer = window.setTimeout(() => searchInputRef.current?.focus(), 50)
    return () => window.clearTimeout(timer)
  }, [searchOpen])

  const openSearch = () => setSearchOpen(true)

  const closeSearch = () => {
    setSearchOpen(false)
    setSearchQuery('')
  }

  const handleMemoryClick = () => {
    if (isSearching) {
      navigate('/garden', { state: { searchQuery } })
      return
    }
    navigate('/create')
  }

  return (
    <PageShell scrollable className="pb-0">
      <header className="sticky top-0 z-10 bg-bg/90 px-4 py-3 backdrop-blur-md">
        {searchOpen ? (
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="搜索回忆、地点或主题…"
                className="w-full rounded-full border border-border bg-surface py-2 pl-9 pr-9 text-sm text-text shadow-[var(--shadow-card)] outline-none transition-colors placeholder:text-text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                aria-label="搜索回忆"
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
            <button
              type="button"
              onClick={closeSearch}
              className="shrink-0 text-sm font-medium text-primary"
            >
              取消
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Camera size={18} strokeWidth={1.75} />
              </span>
              <h1 className="text-lg font-bold tracking-tight text-text">忆眸</h1>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => navigate('/help')}
                className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface hover:text-primary active:scale-95"
                aria-label="帮助中心"
              >
                <CircleHelp size={20} />
              </button>
              <button
                type="button"
                onClick={openSearch}
                className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface active:scale-95"
                aria-label="打开搜索"
              >
                <Search size={20} />
              </button>
            </div>
          </div>
        )}
      </header>

      <section className="flex-1 px-4 pb-4">
        {!searchOpen && (
          <>
            <button
              type="button"
              onClick={() => navigate('/create')}
              className="group relative mb-6 w-full overflow-hidden rounded-[var(--radius-2xl)] text-left shadow-[var(--shadow-hero)] transition-transform active:scale-[0.99]"
            >
              <img
                src={HERO_COVER}
                alt=""
                className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-5">
                <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                  <Sparkles size={12} />
                  AI 智能创作
                </span>
                <h2 className="text-xl font-bold text-white">开始智能创作</h2>
                <p className="mt-1 text-sm text-white/85">让每一段旅途都成为电影</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate('/ai-director/theme')}
              className="mb-6 flex w-full items-center gap-3 rounded-[var(--radius-xl)] bg-gradient-to-r from-primary/8 via-surface to-accent/10 p-4 text-left shadow-[var(--shadow-card)] ring-1 ring-primary/15 transition-transform active:scale-[0.99]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-[var(--shadow-soft)]">
                <Clapperboard size={22} strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-text">AI 导拍</span>
                  <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[9px] font-medium text-accent">
                    定制主题
                  </span>
                </span>
                <span className="mt-0.5 block text-xs text-text-muted">
                  选主题与风格 · AI 生成九宫格拍摄指引
                </span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-text-muted" />
            </button>
          </>
        )}

        <section className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-text">
            {isSearching ? '搜索结果' : '回忆瞬间'}
          </h3>
          {!isSearching && (
            <button
              type="button"
              onClick={() => navigate('/garden')}
              className="flex items-center gap-0.5 text-xs text-text-muted transition-colors hover:text-primary"
              aria-label="查看全部回忆，前往记忆花园"
            >
              查看全部
              <ChevronRight size={14} />
            </button>
          )}
        </section>

        {isSearching && (
          <p className="mb-3 text-xs text-text-muted">
            共 {displayItems.length} 条结果
            {displayItems.length > 0 && ' · 点击进入记忆花园'}
          </p>
        )}

        {displayItems.length === 0 ? (
          <div className="rounded-[var(--radius-xl)] bg-surface px-4 py-10 text-center shadow-[var(--shadow-card)]">
            <Search size={28} className="mx-auto text-text-muted" />
            <p className="mt-3 text-sm font-medium text-text">没有找到匹配的回忆</p>
            <p className="mt-1 text-xs text-text-muted">试试地点（如「大理」）或主题关键字</p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-4 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              清除搜索
            </button>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3">
            {displayItems.map((item) => (
              <li key={item.id}>
                <MemoryCard item={item} onClick={handleMemoryClick} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <BottomNav
        active="home"
        gardenBadge={3}
        onChange={(tab) => {
          if (tab === 'create') navigate('/create')
          else if (tab === 'garden') navigate('/garden')
          else if (tab === 'profile') navigate('/profile')
        }}
      />
    </PageShell>
  )
}
