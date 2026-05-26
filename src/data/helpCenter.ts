export type HelpScenarioId = 'features' | 'account' | 'editor' | 'garden'

export interface HelpScenario {
  id: HelpScenarioId
  title: string
  gradient: string
  topics: string[]
  tabId: HelpFaqTabId
}

export type HelpFaqTabId = 'hot' | 'features' | 'account'

export interface HelpFaqTab {
  id: HelpFaqTabId
  label: string
}

export interface HelpFaqNode {
  id: string
  title: string
  tabIds: HelpFaqTabId[]
  keywords?: string[]
  children?: HelpFaqNode[]
  answer?: string
}

export const HELP_SEARCH_HISTORY_KEY = 'memento-help-search-history'
export const HELP_SEARCH_HISTORY_LIMIT = 8

export const POPULAR_QUESTIONS = [
  '如何恢复未保存的草稿？',
  '视频导出失败怎么办？',
  '如何登录与绑定手机号？',
  '记忆花园里的回忆如何搜索？',
  'AI 导演模式怎么使用？',
  '如何注销账号？',
]

export const CONSULTATION_SCENARIOS: HelpScenario[] = [
  {
    id: 'features',
    title: '功能使用',
    gradient: 'from-emerald-50 to-teal-50/80',
    topics: ['基础功能', '使用问题', '草稿恢复'],
    tabId: 'features',
  },
  {
    id: 'account',
    title: '账号管理',
    gradient: 'from-amber-50 to-orange-50/80',
    topics: ['账号登录', '账号换绑', '账号注销'],
    tabId: 'account',
  },
  {
    id: 'editor',
    title: '剪辑与导出',
    gradient: 'from-sky-50 to-blue-50/80',
    topics: ['视频剪辑', '导出分享', '配乐字幕'],
    tabId: 'features',
  },
  {
    id: 'garden',
    title: '记忆花园',
    gradient: 'from-violet-50 to-purple-50/80',
    topics: ['足迹地图', '日历浏览', '回忆搜索'],
    tabId: 'features',
  },
]

export const FAQ_TABS: HelpFaqTab[] = [
  { id: 'hot', label: '热门问题' },
  { id: 'features', label: '功能使用' },
  { id: 'account', label: '账号管理' },
]

export const FAQ_TREE: HelpFaqNode[] = [
  {
    id: 'draft-recovery',
    title: '如何恢复未保存的草稿？',
    tabIds: ['hot', 'features'],
    keywords: ['草稿', '恢复', '未保存'],
    children: [
      {
        id: 'draft-login',
        title: '登录后仍看不到草稿',
        tabIds: ['hot', 'features'],
        answer:
          '草稿保存在本机浏览器中。请确认使用同一设备与浏览器打开应用；清除缓存或无痕模式会导致草稿无法找回。',
      },
      {
        id: 'draft-exit',
        title: '退出采集页时没点保存',
        tabIds: ['hot', 'features'],
        answer:
          '在 Vlog 学习流程中，退出素材采集页前请点击「保存素材」。未保存的临时素材会在退出时被自动清理。',
      },
      {
        id: 'draft-editor',
        title: '编辑器里的进度丢失',
        tabIds: ['hot', 'features'],
        answer:
          '编辑器会定期将时间线写入本地存储。若页面异常关闭，可重新进入「我的 → 草稿」尝试继续未完成的项目。',
      },
    ],
  },
  {
    id: 'export-fail',
    title: '视频导出失败怎么办？',
    tabIds: ['hot', 'features'],
    keywords: ['导出', '失败', '视频'],
    children: [
      {
        id: 'export-material',
        title: '提示没有可导出素材',
        tabIds: ['hot', 'features'],
        answer: '请先在创建流程中导入或拍摄本地视频，并确保素材已成功加载到时间线后再导出。',
      },
      {
        id: 'export-memory',
        title: '导出时内存不足或卡住',
        tabIds: ['hot', 'features'],
        answer:
          '长视频或高分辨率素材占用较多内存。建议缩短成片时长、减少同时轨道的特效，或关闭其他标签页后重试。',
      },
      {
        id: 'export-browser',
        title: '浏览器不支持导出',
        tabIds: ['hot', 'features'],
        answer:
          '导出依赖 WebAssembly 与本地编解码能力。请使用最新版 Chrome、Edge 或 Safari，并允许站点使用必要的存储权限。',
      },
    ],
  },
  {
    id: 'ai-director',
    title: 'AI 导演模式怎么使用？',
    tabIds: ['hot', 'features'],
    keywords: ['AI', '导演', '分镜'],
    children: [
      {
        id: 'ai-theme',
        title: '如何选择主题与风格？',
        tabIds: ['hot', 'features'],
        answer:
          '在首页进入「AI 导演」，依次选择 Vlog 主题、视觉风格与分镜计划，系统会生成拍摄清单供你按场景录制。',
      },
      {
        id: 'ai-shoot',
        title: '拍摄清单可以跳过吗？',
        tabIds: ['hot', 'features'],
        answer:
          '可以。你仍可手动导入素材进入编辑器；拍摄清单用于引导分镜，跳过不影响后续剪辑。',
      },
    ],
  },
  {
    id: 'garden-search',
    title: '记忆花园里的回忆如何搜索？',
    tabIds: ['hot', 'features'],
    keywords: ['记忆花园', '搜索', '地图'],
    answer:
      '在记忆花园页使用顶部搜索框，可按标题、地点或日期关键词筛选；也可打开地图或日历视图按足迹浏览。',
  },
  {
    id: 'login',
    title: '如何登录与绑定手机号？',
    tabIds: ['hot', 'account'],
    keywords: ['登录', '手机号', '绑定'],
    children: [
      {
        id: 'login-sms',
        title: '收不到验证码',
        tabIds: ['hot', 'account'],
        answer:
          '请检查手机号是否输入正确、短信是否被拦截。演示环境下可使用页面提示的测试验证码完成登录。',
      },
      {
        id: 'login-bind',
        title: '更换绑定手机号',
        tabIds: ['account'],
        answer:
          '进入「我的 → 隐私与安全」（即将开放），按指引验证原手机号后绑定新号码。正式版将同步云端资料。',
      },
    ],
  },
  {
    id: 'logout-account',
    title: '如何注销账号？',
    tabIds: ['hot', 'account'],
    keywords: ['注销', '删除账号'],
    children: [
      {
        id: 'logout-data',
        title: '注销后数据会怎样？',
        tabIds: ['account'],
        answer:
          '账号注销后，云端昵称、头像与同步设置将被删除；本机草稿与已导出文件需你在设备上自行清理。',
      },
      {
        id: 'logout-how',
        title: '申请注销的步骤',
        tabIds: ['account'],
        answer:
          '在「我的 → 隐私与安全」提交注销申请，完成身份验证后进入 7 天冷静期，期间可撤销申请。',
      },
    ],
  },
  {
    id: 'privacy',
    title: '我的素材会上传到云端吗？',
    tabIds: ['hot', 'account'],
    keywords: ['隐私', '上传', '云端'],
    answer:
      '默认情况下，视频素材在本地浏览器中处理；仅在你主动登录并开启同步的相关功能时，才会上传必要的数据。',
  },
  {
    id: 'notification',
    title: '如何关闭消息通知？',
    tabIds: ['features'],
    keywords: ['通知', '推送'],
    answer: '进入「我的 → 通用设置」，在通知偏好中关闭营销或活动提醒，系统通知仍可能用于账号安全。',
  },
]

function nodeMatchesTab(node: HelpFaqNode, tabId: HelpFaqTabId) {
  return node.tabIds.includes(tabId)
}

export function getFaqRootsForTab(tabId: HelpFaqTabId): HelpFaqNode[] {
  return FAQ_TREE.filter((node) => nodeMatchesTab(node, tabId))
}

export function flattenSearchableQuestions(nodes: HelpFaqNode[] = FAQ_TREE): HelpFaqNode[] {
  const result: HelpFaqNode[] = []
  const walk = (list: HelpFaqNode[]) => {
    for (const node of list) {
      result.push(node)
      if (node.children?.length) walk(node.children)
    }
  }
  walk(nodes)
  return result
}

export function searchHelpQuestions(query: string): HelpFaqNode[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []

  return flattenSearchableQuestions().filter((node) => {
    const haystack = [node.title, node.answer, ...(node.keywords ?? [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(normalized)
  })
}

export function findFaqNodeById(id: string, nodes: HelpFaqNode[] = FAQ_TREE): HelpFaqNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children?.length) {
      const found = findFaqNodeById(id, node.children)
      if (found) return found
    }
  }
  return null
}

export function loadSearchHistory(): string[] {
  try {
    const raw = localStorage.getItem(HELP_SEARCH_HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === 'string').slice(0, HELP_SEARCH_HISTORY_LIMIT)
  } catch {
    return []
  }
}

export function saveSearchHistory(query: string) {
  const trimmed = query.trim()
  if (!trimmed) return
  const prev = loadSearchHistory().filter((item) => item !== trimmed)
  const next = [trimmed, ...prev].slice(0, HELP_SEARCH_HISTORY_LIMIT)
  localStorage.setItem(HELP_SEARCH_HISTORY_KEY, JSON.stringify(next))
}

export function clearSearchHistory() {
  localStorage.removeItem(HELP_SEARCH_HISTORY_KEY)
}
