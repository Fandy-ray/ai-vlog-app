import { Camera, ChevronRight, GraduationCap, Search, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BottomNav } from '@/components/BottomNav'
import { MemoryCard } from '@/components/MemoryCard'
import { PageShell } from '@/components/PageShell'
import { Toast } from '@/components/Toast'
import { HERO_COVER, MEMORY_ITEMS } from '@/data/memories'
import { useToast } from '@/hooks/useToast'

export function HomePage() {
  const navigate = useNavigate()
  const { message, show, visible } = useToast()

  return (
    <PageShell scrollable className="pb-0">
      {/* 顶栏 */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-bg/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Camera size={18} strokeWidth={1.75} />
          </span>
          <h1 className="text-lg font-bold tracking-tight text-text">忆眸</h1>
        </div>
        <button
          type="button"
          onClick={() => show('搜索功能开发中')}
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface active:scale-95"
          aria-label="搜索"
        >
          <Search size={20} />
        </button>
      </header>

      <section className="flex-1 px-4 pb-4">
        {/* 智能创作入口 */}
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

        {/* 学习 Vlog */}
        <button
          type="button"
          onClick={() => navigate('/vlog-learn')}
          className="mb-6 flex w-full items-center gap-3 rounded-[var(--radius-xl)] bg-surface p-4 text-left shadow-[var(--shadow-card)] transition-transform active:scale-[0.99]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <GraduationCap size={22} strokeWidth={1.75} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-text">学习 Vlog</span>
              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                AI 导拍
              </span>
            </span>
            <span className="mt-0.5 block text-xs text-text-muted">
              九宫格构图 · 人物该放哪一格
            </span>
          </span>
          <ChevronRight size={18} className="shrink-0 text-text-muted" />
        </button>

        {/* 回忆瞬间 */}
        <section className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-text">回忆瞬间</h3>
          <button
            type="button"
            onClick={() => show('查看全部回忆')}
            className="flex items-center gap-0.5 text-xs text-text-muted transition-colors hover:text-primary"
          >
            查看全部
            <ChevronRight size={14} />
          </button>
        </section>

        <ul className="grid grid-cols-2 gap-3">
          {MEMORY_ITEMS.map((item) => (
            <li key={item.id}>
              <MemoryCard
                item={item}
                onClick={() => navigate('/create')}
              />
            </li>
          ))}
        </ul>
      </section>

      <BottomNav
        active="home"
        gardenBadge={3}
        onChange={(tab) => {
          if (tab === 'create') navigate('/create')
          else show(`${tab === 'garden' ? '记忆花园' : tab === 'profile' ? '我的' : '首页'}即将开放`)
        }}
      />

      <Toast message={message} visible={visible} />
    </PageShell>
  )
}
