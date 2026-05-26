const prompt = require('@system.prompt')

const VLOG_ALIASES = {
  campus: 'campus',
  '校园': 'campus',
  '校园vlog': 'campus',
  '校园 vlog': 'campus',
  study: 'study',
  '学习': 'study',
  '学习vlog': 'study',
  '学习 vlog': 'study',
  daily: 'daily',
  '日常': 'daily',
  travel: 'travel',
  '旅行': 'travel',
  food: 'food',
  '美食': 'food'
}

const STYLE_ALIASES = {
  japanese: 'japanese',
  jp: 'japanese',
  '日系': 'japanese',
  cinematic: 'cinematic',
  movie: 'cinematic',
  '电影感': 'cinematic',
  study: 'study',
  '学习': 'study',
  '学习 vlog': 'study'
}

const VLOG_TYPES = [
  {
    type: 'study',
    name: '学习 vlog',
    description: '记录学习环境、专注动作和阶段性成果',
    guide: ['拍摄桌面全景', '拍摄敲键盘动作', '拍摄翻书或写字特写', '拍摄完成任务后的收尾镜头'],
    defaultStyle: 'study'
  },
  {
    type: 'campus',
    name: '校园 vlog',
    description: '记录校园空间、行走过程和傍晚氛围',
    guide: ['拍摄校园远景', '拍摄走路特写', '拍摄教学楼或操场空镜', '拍摄夕阳镜头'],
    defaultStyle: 'japanese'
  },
  {
    type: 'daily',
    name: '日常 vlog',
    description: '记录起床、出门、生活片段与情绪瞬间',
    guide: ['拍摄房间环境', '拍摄整理物品动作', '拍摄出门转场', '拍摄一天结尾'],
    defaultStyle: 'cinematic'
  },
  {
    type: 'travel',
    name: '旅行 vlog',
    description: '记录路线、风景、人物互动和目的地记忆点',
    guide: ['拍摄出发交通工具', '拍摄目的地远景', '拍摄行走跟拍', '拍摄当地细节特写'],
    defaultStyle: 'cinematic'
  },
  {
    type: 'food',
    name: '美食 vlog',
    description: '记录餐厅环境、制作过程、成品和试吃反应',
    guide: ['拍摄店面或餐桌全景', '拍摄食物制作过程', '拍摄成品特写', '拍摄试吃反应'],
    defaultStyle: 'japanese'
  }
]

const STYLE_TEMPLATES = [
  {
    id: 'japanese',
    name: '日系',
    filter: 'warm-clean',
    filterName: '暖白清透',
    bgm: 'light-acoustic',
    bgmName: '轻快木吉他',
    transitions: ['fade', 'slide-left', 'flash-white'],
    color: '#f4b8a5',
    pace: 'medium',
    caption: '手写感短字幕'
  },
  {
    id: 'cinematic',
    name: '电影感',
    filter: 'teal-orange',
    filterName: '青橙对比',
    bgm: 'ambient-piano',
    bgmName: '氛围钢琴',
    transitions: ['cross-dissolve', 'blur', 'match-cut'],
    color: '#1f2937',
    pace: 'slow',
    caption: '简洁居中字幕'
  },
  {
    id: 'study',
    name: '学习 vlog',
    filter: 'soft-light',
    filterName: '柔光低饱和',
    bgm: 'lofi-study',
    bgmName: 'Lo-fi 学习节拍',
    transitions: ['cut', 'fade', 'speed-ramp'],
    color: '#8ba17f',
    pace: 'steady',
    caption: '时间轴式字幕'
  }
]

const MATERIALS = [
  {
    id: 'mat-campus-01',
    type: 'campus',
    category: 'wide',
    name: '校园远景',
    duration: 5,
    tags: ['opening', 'outdoor', 'japanese'],
    sortWeight: 10,
    uri: 'mock://materials/campus-wide.mp4'
  },
  {
    id: 'mat-campus-02',
    type: 'campus',
    category: 'close',
    name: '走路特写',
    duration: 4,
    tags: ['detail', 'motion'],
    sortWeight: 20,
    uri: 'mock://materials/walking-close.mp4'
  },
  {
    id: 'mat-campus-03',
    type: 'campus',
    category: 'atmosphere',
    name: '夕阳空镜',
    duration: 6,
    tags: ['ending', 'sunset', 'cinematic'],
    sortWeight: 90,
    uri: 'mock://materials/sunset.mp4'
  },
  {
    id: 'mat-study-01',
    type: 'study',
    category: 'wide',
    name: '桌面全景',
    duration: 5,
    tags: ['opening', 'desk', 'study'],
    sortWeight: 10,
    uri: 'mock://materials/desk-wide.mp4'
  },
  {
    id: 'mat-study-02',
    type: 'study',
    category: 'close',
    name: '敲键盘动作',
    duration: 4,
    tags: ['detail', 'typing', 'study'],
    sortWeight: 30,
    uri: 'mock://materials/typing.mp4'
  },
  {
    id: 'mat-study-03',
    type: 'study',
    category: 'result',
    name: '学习成果收尾',
    duration: 5,
    tags: ['ending', 'notebook', 'study'],
    sortWeight: 80,
    uri: 'mock://materials/study-result.mp4'
  },
  {
    id: 'mat-daily-01',
    type: 'daily',
    category: 'wide',
    name: '房间环境',
    duration: 5,
    tags: ['opening', 'indoor'],
    sortWeight: 10,
    uri: 'mock://materials/room.mp4'
  },
  {
    id: 'mat-food-01',
    type: 'food',
    category: 'close',
    name: '成品特写',
    duration: 4,
    tags: ['detail', 'food', 'japanese'],
    sortWeight: 40,
    uri: 'mock://materials/food-close.mp4'
  }
]

function cloneData(data) {
  if (data === undefined || data === null) {
    return data
  }

  return JSON.parse(JSON.stringify(data))
}

function normalizeKey(value, aliases, fallback) {
  const key = String(value || fallback).trim().toLowerCase()
  return aliases[key] || key || fallback
}

function normalizeVlogType(type) {
  return normalizeKey(type, VLOG_ALIASES, 'study')
}

function normalizeStyle(style) {
  return normalizeKey(style, STYLE_ALIASES, 'study')
}

function queryString(url, query = {}) {
  const str = []

  Object.keys(query).forEach(key => {
    const value = query[key]

    if (value === undefined || value === null || value === '') {
      return
    }

    str.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
  })

  const paramStr = str.join('&')
  return paramStr ? `${url}${url.indexOf('?') > -1 ? '&' : '?'}${paramStr}` : url
}

function showToast(message = '', duration = 0) {
  if (!message) return

  prompt.showToast({
    message,
    duration
  })
}

function mockRequest(data, delay = 120) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(cloneData(data))
    }, delay)
  })
}

function getVlogTypes() {
  return cloneData(VLOG_TYPES)
}

function getShootGuide(type = 'study') {
  const normalizedType = normalizeVlogType(type)
  const guide = VLOG_TYPES.find(item => item.type === normalizedType) || VLOG_TYPES[0]

  return cloneData(guide)
}

function getStyleTemplates() {
  return cloneData(STYLE_TEMPLATES)
}

function getStyleTemplate(style = 'study') {
  const normalizedStyle = normalizeStyle(style)
  const template =
    STYLE_TEMPLATES.find(item => item.id === normalizedStyle) || STYLE_TEMPLATES[0]

  return cloneData(template)
}

function getMaterialCategories(type) {
  const normalizedType = type ? normalizeVlogType(type) : ''
  const categories = MATERIALS.filter(item => !normalizedType || item.type === normalizedType).map(
    item => item.category
  )

  return Array.from(new Set(categories))
}

function sortMaterials(materials = []) {
  return cloneData(materials).sort((prev, next) => {
    if (prev.sortWeight !== next.sortWeight) {
      return prev.sortWeight - next.sortWeight
    }

    return next.duration - prev.duration
  })
}

function getMaterials(params = {}) {
  const normalizedType = params.type ? normalizeVlogType(params.type) : ''
  const category = params.category || ''
  const style = params.style ? normalizeStyle(params.style) : ''

  let materials = MATERIALS.filter(item => {
    const matchedType = !normalizedType || item.type === normalizedType
    const matchedCategory = !category || item.category === category
    const matchedStyle = !style || item.tags.indexOf(style) > -1 || item.type === style

    return matchedType && matchedCategory && matchedStyle
  })

  materials = sortMaterials(materials)

  if (params.limit) {
    materials = materials.slice(0, Number(params.limit))
  }

  return materials
}

export default {
  showToast,
  queryString,
  mockRequest,
  cloneData,
  normalizeVlogType,
  normalizeStyle,
  getVlogTypes,
  getShootGuide,
  getStyleTemplates,
  getStyleTemplate,
  getMaterialCategories,
  getMaterials,
  sortMaterials
}
