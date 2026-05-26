import {
  ArrowLeft,
  ChevronRight,
  CircleHelp,
  MessageSquare,
  PenLine,
  Search,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '@/components/PageShell'
import { Toast } from '@/components/Toast'
import {
  clearSearchHistory,
  CONSULTATION_SCENARIOS,
  FAQ_TABS,
  findFaqNodeById,
  getFaqRootsForTab,
  loadSearchHistory,
  POPULAR_QUESTIONS,
  saveSearchHistory,
  searchHelpQuestions,
  type HelpFaqNode,
  type HelpFaqTabId,
  type HelpScenarioId,
} from '@/data/helpCenter'
import { useToast } from '@/hooks/useToast'
import { useUser } from '@/context/UserContext'

const HOT_RANK_COLORS = ['text-rose-500', 'text-orange-500', 'text-amber-500'] as const

function FaqBranchList({
  nodes,
  depth,
  expandedId,
  onToggle,
  onSelectLeaf,
}: {
  nodes: HelpFaqNode[]
  depth: number
  expandedId: string | null
  onToggle: (node: HelpFaqNode) => void
  onSelectLeaf: (node: HelpFaqNode) => void
}) {
  return (
    <ul className={depth > 0 ? 'ml-3 border-l border-border/80 pl-3' : ''}>
      {nodes.map((node, index) => {
        const hasChildren = Boolean(node.children?.length)
        const isExpanded = expandedId === node.id
        const isLeaf = !hasChildren
        const hotRankClass =
          depth === 0 && index < HOT_RANK_COLORS.length
            ? HOT_RANK_COLORS[index]
            : 'text-primary'

        return (
          <li
            key={node.id}
            className={index > 0 ? 'border-t border-border/60' : ''}
          >
            <button
              type="button"
              onClick={() => {
                if (hasChildren) onToggle(node)
                else onSelectLeaf(node)
              }}
              className="flex w-full items-start gap-2 py-3.5 text-left transition-colors hover:bg-bg/60 active:bg-bg"
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-[13px] font-bold ${
                  depth === 0 ? hotRankClass : 'text-text-muted'
                }`}
              >
                {depth === 0 ? index + 1 : '·'}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-text">{node.title}</span>
                {isLeaf && node.answer && (
                  <span className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-text-muted">
                    {node.answer}
                  </span>
                )}
              </span>
              {hasChildren ? (
                <ChevronRight
                  size={16}
                  className={`mt-0.5 shrink-0 text-text-muted transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                />
              ) : null}
            </button>
            {hasChildren && isExpanded && node.children ? (
              <FaqBranchList
                nodes={node.children}
                depth={depth + 1}
                expandedId={expandedId}
                onToggle={onToggle}
                onSelectLeaf={onSelectLeaf}
              />
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

export function HelpPage() {
  const navigate = useNavigate()
  const { user } = useUser()
  const { message, show, visible } = useToast()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [searchFocused, setSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>(() => loadSearchHistory())
  const [activeTab, setActiveTab] = useState<HelpFaqTabId>('hot')
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null)
  const [answerSheet, setAnswerSheet] = useState<HelpFaqNode | null>(null)

  const trimmedQuery = searchQuery.trim()
  const isSearching = trimmedQuery.length > 0

  const searchResults = useMemo(
    () => (isSearching ? searchHelpQuestions(trimmedQuery) : []),
    [isSearching, trimmedQuery],
  )

  const faqRoots = useMemo(() => getFaqRootsForTab(activeTab), [activeTab])

  const showSearchPanel = searchFocused && !isSearching

  useEffect(() => {
    if (!searchFocused) return
    const timer = window.setTimeout(() => searchInputRef.current?.focus(), 50)
    return () => window.clearTimeout(timer)
  }, [searchFocused])

  const commitSearch = useCallback(
    (query: string) => {
      const value = query.trim()
      if (!value) return
      setSearchQuery(value)
      saveSearchHistory(value)
      setSearchHistory(loadSearchHistory())
    },
    [],
  )

  const handleFaqToggle = (node: HelpFaqNode) => {
    setExpandedFaqId((prev) => (prev === node.id ? null : node.id))
  }

  const handleSelectLeaf = (node: HelpFaqNode) => {
    if (node.answer) {
      setAnswerSheet(node)
      return
    }
    show('该问题详情即将补充')
  }

  const handleScenarioClick = (scenarioId: HelpScenarioId, tabId: HelpFaqTabId) => {
    setActiveTab(tabId)
    setExpandedFaqId(null)
    const section = document.getElementById('help-faq-section')
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (scenarioId === 'account') {
      setExpandedFaqId('login')
    } else if (scenarioId === 'features') {
      setExpandedFaqId('draft-recovery')
    } else if (scenarioId === 'editor') {
      setExpandedFaqId('export-fail')
    } else {
      setExpandedFaqId('garden-search')
    }
  }

  const handlePopularClick = (question: string) => {
    commitSearch(question)
    const match = searchHelpQuestions(question)[0]
    if (match?.children?.length) {
      setExpandedFaqId(match.id)
      setActiveTab(match.tabIds[0] ?? 'hot')
    } else if (match?.answer) {
      setAnswerSheet(match)
    }
  }

  const handleSearchResultClick = (node: HelpFaqNode) => {
    commitSearch(node.title)
    if (node.answer) {
      setAnswerSheet(node)
      return
    }
    if (node.children?.length) {
      setActiveTab(node.tabIds[0] ?? 'hot')
      setExpandedFaqId(node.id)
    } else if (node.tabIds[0]) {
      setActiveTab(node.tabIds[0])
    }
    setSearchFocused(false)
  }

  const displayName = user?.nickname ?? '旅人'

  return (
    <PageShell scrollable className="bg-gradient-to-b from-violet-50/90 via-bg to-bg pb-8">
      <header className="sticky top-0 z-20 bg-gradient-to-b from-violet-50/95 via-violet-50/80 to-transparent px-4 pb-3 pt-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface active:bg-border/40"
            aria-label="返回"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="flex-1 text-center text-lg font-semibold text-text">帮助中心</h1>
          <button
            type="button"
            onClick={() => show('反馈历史即将开放')}
            className="shrink-0 text-xs text-text-secondary transition-colors hover:text-primary"
          >
            反馈历史
          </button>
        </div>

        <div className="relative mt-3">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-text-muted"
          />
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => {
              window.setTimeout(() => setSearchFocused(false), 150)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commitSearch(searchQuery)
            }}
            placeholder="描述您遇到的问题"
            className="w-full rounded-full border border-border bg-surface py-2.5 pl-9 pr-9 text-sm text-text shadow-[var(--shadow-card)] outline-none transition-colors placeholder:text-text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
            aria-label="搜索帮助问题"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-text-muted hover:bg-bg"
              aria-label="清空搜索"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>

        {showSearchPanel ? (
          <div className="mt-3 rounded-[var(--radius-xl)] bg-surface p-4 shadow-[var(--shadow-card)]">
            {searchHistory.length > 0 ? (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-text-secondary">历史搜索</span>
                  <button
                    type="button"
                    onClick={() => {
                      clearSearchHistory()
                      setSearchHistory([])
                    }}
                    className="text-[11px] text-text-muted hover:text-primary"
                  >
                    清空
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handlePopularClick(item)}
                      className="rounded-full bg-bg px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-text-muted">暂无搜索记录</p>
            )}

            <div className={searchHistory.length > 0 ? 'mt-4' : ''}>
              <span className="text-xs font-medium text-text-secondary">热门问题</span>
              <ul className="mt-2 space-y-1">
                {POPULAR_QUESTIONS.map((question) => (
                  <li key={question}>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handlePopularClick(question)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-text transition-colors hover:bg-bg"
                    >
                      <span className="text-[11px] font-medium text-accent">热</span>
                      <span className="flex-1">{question}</span>
                      <ChevronRight size={14} className="text-text-muted" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        {isSearching ? (
          <div className="mt-3 rounded-[var(--radius-xl)] bg-surface p-2 shadow-[var(--shadow-card)]">
            {searchResults.length > 0 ? (
              <ul>
                {searchResults.map((node) => (
                  <li key={node.id} className="border-t border-border/60 first:border-0">
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleSearchResultClick(node)}
                      className="flex w-full items-center gap-2 px-3 py-3 text-left text-sm text-text hover:bg-bg/80"
                    >
                      <Search size={14} className="shrink-0 text-text-muted" />
                      <span className="flex-1">{node.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-3 py-4 text-center text-sm text-text-muted">未找到相关问题</p>
            )}
          </div>
        ) : null}
      </header>

      <div className="flex-1 px-4">
        {!searchFocused && !isSearching ? (
          <>
            <section className="rounded-[var(--radius-2xl)] bg-gradient-to-br from-primary/8 via-surface to-accent/5 p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <CircleHelp size={20} />
                </span>
                <div>
                  <p className="text-base font-semibold text-text">
                    Hi，{displayName}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">很高兴为您服务，请选择下方场景或常见问题</p>
                </div>
              </div>
            </section>

            <section className="mt-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-text">咨询场景</h2>
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('help-faq-section')?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    })
                  }}
                  className="flex items-center gap-0.5 text-xs text-text-muted transition-colors hover:text-primary"
                >
                  更多
                  <ChevronRight size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {CONSULTATION_SCENARIOS.map((scenario) => (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => handleScenarioClick(scenario.id, scenario.tabId)}
                    className={`rounded-[var(--radius-xl)] bg-gradient-to-br ${scenario.gradient} p-3.5 text-left shadow-[var(--shadow-card)] ring-1 ring-white/80 transition-transform active:scale-[0.98]`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-semibold text-text">{scenario.title}</span>
                      <ChevronRight size={14} className="shrink-0 text-text-muted" />
                    </div>
                    <ul className="mt-2.5 space-y-1">
                      {scenario.topics.map((topic) => (
                        <li key={topic} className="text-[11px] text-text-secondary">
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
            </section>

            <section id="help-faq-section" className="mt-5 rounded-[var(--radius-xl)] bg-surface shadow-[var(--shadow-card)]">
              <div className="border-b border-border/80 px-2 pt-2">
                <div className="flex gap-1 overflow-x-auto scrollbar-none">
                  {FAQ_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id)
                        setExpandedFaqId(null)
                      }}
                      className={`shrink-0 rounded-t-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'border-b-2 border-primary text-primary'
                          : 'text-text-muted hover:text-text-secondary'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="px-3 pb-2">
                <FaqBranchList
                  nodes={faqRoots}
                  depth={0}
                  expandedId={expandedFaqId}
                  onToggle={handleFaqToggle}
                  onSelectLeaf={handleSelectLeaf}
                />
              </div>
            </section>

            <section className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => show('意见反馈即将开放')}
                className="flex flex-col items-center gap-2 rounded-[var(--radius-xl)] bg-surface py-4 shadow-[var(--shadow-card)] transition-colors hover:bg-bg/80"
              >
                <PenLine size={22} className="text-primary" />
                <span className="text-sm font-medium text-text">意见反馈</span>
              </button>
              <button
                type="button"
                onClick={() => show('在线客服即将开放')}
                className="flex flex-col items-center gap-2 rounded-[var(--radius-xl)] bg-surface py-4 shadow-[var(--shadow-card)] transition-colors hover:bg-bg/80"
              >
                <MessageSquare size={22} className="text-primary" />
                <span className="text-sm font-medium text-text">在线客服</span>
              </button>
            </section>

            <p className="mt-4 pb-2 text-center text-[11px] leading-relaxed text-text-muted">
              客服热线：400-888-2024（每日 8:30 ~ 22:00）
            </p>
          </>
        ) : null}
      </div>

      {answerSheet ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="help-answer-title"
          onClick={() => setAnswerSheet(null)}
        >
          <div
            className="w-full max-w-[430px] rounded-[var(--radius-2xl)] bg-surface p-5 shadow-[var(--shadow-hero)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 id="help-answer-title" className="text-base font-semibold text-text">
                {answerSheet.title}
              </h3>
              <button
                type="button"
                onClick={() => setAnswerSheet(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-muted hover:bg-bg"
                aria-label="关闭"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              {answerSheet.answer ??
                findFaqNodeById(answerSheet.id)?.answer ??
                '暂无详细说明，请联系在线客服。'}
            </p>
            <button
              type="button"
              onClick={() => setAnswerSheet(null)}
              className="mt-5 w-full rounded-full bg-primary py-2.5 text-sm font-medium text-white"
            >
              知道了
            </button>
          </div>
        </div>
      ) : null}

      <Toast message={message} visible={visible} />
    </PageShell>
  )
}
