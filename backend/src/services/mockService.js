const { v4: uuidv4 } = require('uuid')
const { vlogTypes, styles, styleTemplates, materials } = require('../data/mockData')

const uploadedMaterials = []

const vlogAliases = {
  campus: 'campus',
  '校园': 'campus',
  study: 'study',
  '学习': 'study',
  daily: 'daily',
  '日常': 'daily',
  travel: 'travel',
  '旅行': 'travel',
  food: 'food',
  '美食': 'food'
}

const styleAliases = {
  japanese: 'japanese',
  jp: 'japanese',
  '日系': 'japanese',
  cinematic: 'cinematic',
  movie: 'cinematic',
  '电影感': 'cinematic',
  study: 'study',
  '学习': 'study'
}

const shotTemplates = {
  campus: [
    ['校园远景', '校门、教学楼或操场', '远景', '慢速横移', 5, '先交代地点，让观众知道今天的故事发生在哪里'],
    ['走路特写', '鞋子、书包、手持书本', '特写', '跟拍', 4, '用动作镜头把远景和人物状态接起来'],
    ['学习或活动片段', '教室、图书馆、操场活动', '中景', '固定机位', 6, '保留真实声音，后期可压低做环境音'],
    ['夕阳镜头', '操场、走廊、天空', '空镜', '轻微上摇', 5, '适合作为结尾，承接 BGM 情绪']
  ],
  study: [
    ['桌面全景', '书桌、电脑、笔记本', '全景', '固定机位', 5, '保持桌面整洁，画面里只留下必要学习物品'],
    ['敲键盘动作', '手部、键盘、屏幕边缘', '特写', '固定机位', 4, '可以拍 2-3 段短动作，后期按节奏切'],
    ['翻书或写字特写', '书页、笔尖、便签', '近景', '轻推', 4, '让动作从画面一侧进入，剪辑时更顺'],
    ['成果收尾', '完成的笔记、待办清单', '俯拍', '固定机位', 5, '给观众一个完成感']
  ],
  daily: [
    ['房间环境', '床边、窗台、桌面', '全景', '慢推', 5, '用自然光建立生活感'],
    ['整理物品', '包、钥匙、衣服', '特写', '固定机位', 4, '动作要完整，方便后期做节奏点'],
    ['出门转场', '门把手、电梯、路口', '中景', '跟拍', 4, '用推门、抬手遮镜等动作做自然转场']
  ],
  travel: [
    ['出发镜头', '车站、机票、行李', '中景', '跟拍', 5, '让路线信息清楚出现一次'],
    ['目的地远景', '街道、景点、自然风景', '远景', '横移', 6, '稳定拍摄，给画面留呼吸感'],
    ['当地细节', '招牌、食物、手作、路牌', '特写', '固定机位', 4, '多拍可被记住的小元素']
  ],
  food: [
    ['餐桌全景', '餐厅、餐桌、菜单', '全景', '固定机位', 4, '先交代环境和食物数量'],
    ['制作过程', '翻炒、倒入、摆盘', '近景', '跟拍', 5, '抓住声音和热气，会更有食欲'],
    ['成品特写', '主菜、饮品、甜点', '特写', '慢推', 4, '让主体在画面中心，背景保持干净']
  ]
}

function clone(data) {
  return JSON.parse(JSON.stringify(data))
}

function normalizeKey(value, aliases, fallback) {
  const key = String(value || fallback).trim().toLowerCase()
  return aliases[key] || key || fallback
}

function normalizeVlogType(type) {
  const normalized = normalizeKey(type, vlogAliases, 'study')
  return vlogTypes.some(item => item.type === normalized) ? normalized : 'study'
}

function normalizeStyle(style, type) {
  const fallback = getTypeMeta(type).defaultStyle || 'study'
  const normalized = normalizeKey(style, styleAliases, fallback)
  return styleTemplates.some(item => item.id === normalized) ? normalized : fallback
}

function getTypeMeta(type) {
  const normalizedType = normalizeVlogType(type)
  return vlogTypes.find(item => item.type === normalizedType) || vlogTypes[0]
}

function getStyleTemplate(style, type) {
  const normalizedStyle = normalizeStyle(style, type)
  return styleTemplates.find(item => item.id === normalizedStyle) || styleTemplates[0]
}

function getStyles() {
  return clone(styles)
}

function getVlogTypes() {
  return clone(vlogTypes)
}

function getStyleTemplates() {
  return clone(styleTemplates)
}

function getGuideByType(type) {
  return clone(getTypeMeta(type).guide)
}

function createShotPlan(options = {}) {
  const normalizedType = normalizeVlogType(options.type)
  const guide = getTypeMeta(normalizedType)
  const template = shotTemplates[normalizedType] || shotTemplates.study
  const shots = template.map((shot, index) => ({
    id: `${normalizedType}-shot-${index + 1}`,
    order: index + 1,
    title: `镜头${index + 1}：${shot[0]}`,
    scene: shot[1],
    view: shot[2],
    cameraMove: shot[3],
    duration: shot[4],
    tips: shot[5]
  }))

  return {
    type: normalizedType,
    name: guide.name,
    description: guide.description,
    guide: guide.guide,
    shots,
    scriptText: shots.map(shot => shot.title).join('\n'),
    estimatedDuration: shots.reduce((total, shot) => total + shot.duration, 0)
  }
}

function sortMaterials(list = []) {
  return clone(list).sort((prev, next) => {
    if (prev.sortWeight !== next.sortWeight) {
      return prev.sortWeight - next.sortWeight
    }

    return next.duration - prev.duration
  })
}

function getMaterials(params = {}) {
  const normalizedType = params.type ? normalizeVlogType(params.type) : ''
  const category = params.category || ''
  const style = params.style ? normalizeStyle(params.style, normalizedType) : ''

  let result = materials.concat(uploadedMaterials).filter(item => {
    const matchedType = !normalizedType || item.type === normalizedType
    const matchedCategory = !category || item.category === category
    const matchedStyle = !style || item.tags.indexOf(style) > -1 || item.type === style

    return matchedType && matchedCategory && matchedStyle
  })

  result = sortMaterials(result)

  if (params.limit) {
    result = result.slice(0, Number(params.limit))
  }

  return result
}

function registerUploadedMaterial(options = {}) {
  const type = normalizeVlogType(options.type)
  const id = options.id || `upload-${uuidv4().slice(0, 8)}`
  const name = options.name || options.filename || `上传素材 ${uploadedMaterials.length + 1}`
  const material = {
    id,
    type,
    category: options.category || 'custom',
    name,
    duration: Number(options.duration || 4),
    tags: ['upload', type].concat(options.tags || []),
    sortWeight: Number(options.sortWeight || 50 + uploadedMaterials.length),
    uri: options.uri || `mock://uploads/${id}`,
    source: options.source || 'upload'
  }

  uploadedMaterials.push(material)
  return clone(material)
}

function normalizeInputMaterials(inputMaterials = [], type) {
  if (!inputMaterials.length) {
    return getMaterials({ type, limit: 4 })
  }

  return inputMaterials.map((item, index) => ({
    id: item.id || `upload-${index + 1}`,
    type: normalizeVlogType(item.type || type),
    category: item.category || 'custom',
    name: item.name || item.filename || `素材${index + 1}`,
    duration: Number(item.duration || 4),
    tags: item.tags || [],
    sortWeight: Number(item.sortWeight || (index + 1) * 10),
    uri: item.uri || item.path || ''
  }))
}

function buildTimeline(inputMaterials, shotPlan, styleTemplate) {
  const transitions = styleTemplate.transitions || ['cut']

  return inputMaterials.map((material, index) => {
    const shot = shotPlan.shots[index % shotPlan.shots.length]

    return {
      order: index + 1,
      shotId: shot.id,
      shotTitle: shot.title,
      materialId: material.id,
      materialName: material.name,
      uri: material.uri,
      duration: material.duration,
      filter: styleTemplate.filter,
      transition: index === 0 ? 'none' : transitions[index % transitions.length],
      caption: shot.title.replace(/^镜头\d+：/, '')
    }
  })
}

function generateMockVlog(options = {}) {
  const payload = typeof options === 'string' ? { type: options } : options
  const type = normalizeVlogType(payload.type)
  const styleTemplate = getStyleTemplate(payload.style, type)
  const shotPlan = payload.shotPlan || createShotPlan({ type })
  const inputMaterials = sortMaterials(normalizeInputMaterials(payload.materials || [], type))
  const timeline = buildTimeline(inputMaterials, shotPlan, styleTemplate)
  const guide = getTypeMeta(type)

  return {
    id: `mock-vlog-${Date.now()}`,
    type,
    title: `${guide.name} - ${styleTemplate.name}`,
    narration:
      '阳光落在画面里，动作和环境声串起今天的节奏。那些认真生活的瞬间，也值得被认真记录。',
    shotPlan,
    materials: inputMaterials,
    timeline,
    style: styleTemplate,
    bgm: {
      id: styleTemplate.bgm,
      name: styleTemplate.bgmName
    },
    steps: [
      {
        name: '素材排序',
        status: 'done',
        count: inputMaterials.length
      },
      {
        name: '模板拼接',
        status: 'done',
        template: styleTemplate.name
      },
      {
        name: '自动配乐',
        status: 'done',
        bgm: styleTemplate.bgmName
      }
    ],
    exportConfig: {
      ratio: payload.ratio || '9:16',
      resolution: payload.resolution || '1080x1920',
      duration: timeline.reduce((total, item) => total + item.duration, 0)
    },
    coverUrl: '',
    videoUrl: ''
  }
}

module.exports = {
  getStyles,
  getVlogTypes,
  getStyleTemplates,
  getStyleTemplate,
  getGuideByType,
  createShotPlan,
  getMaterials,
  registerUploadedMaterial,
  generateMockVlog
}
