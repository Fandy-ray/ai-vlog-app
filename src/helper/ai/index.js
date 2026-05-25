import $utils from '../utils'

const SHOT_TEMPLATES = {
  campus: [
    {
      title: '校园远景',
      scene: '校门、教学楼或操场',
      view: '远景',
      cameraMove: '慢速横移',
      duration: 5,
      tips: '先交代地点，让观众知道今天的故事发生在哪里'
    },
    {
      title: '走路特写',
      scene: '鞋子、书包、手持书本',
      view: '特写',
      cameraMove: '跟拍',
      duration: 4,
      tips: '用动作镜头把远景和人物状态接起来'
    },
    {
      title: '学习或活动片段',
      scene: '教室、图书馆、操场活动',
      view: '中景',
      cameraMove: '固定机位',
      duration: 6,
      tips: '保留真实声音，后期可压低做环境音'
    },
    {
      title: '夕阳镜头',
      scene: '操场、走廊、天空',
      view: '空镜',
      cameraMove: '轻微上摇',
      duration: 5,
      tips: '适合作为结尾，承接 BGM 情绪'
    }
  ],
  study: [
    {
      title: '桌面全景',
      scene: '书桌、电脑、笔记本',
      view: '全景',
      cameraMove: '固定机位',
      duration: 5,
      tips: '保持桌面整洁，画面里只留下必要学习物品'
    },
    {
      title: '敲键盘动作',
      scene: '手部、键盘、屏幕边缘',
      view: '特写',
      cameraMove: '固定机位',
      duration: 4,
      tips: '可以拍 2-3 段短动作，后期按节奏切'
    },
    {
      title: '翻书或写字特写',
      scene: '书页、笔尖、便签',
      view: '近景',
      cameraMove: '轻推',
      duration: 4,
      tips: '让动作从画面一侧进入，剪辑时更顺'
    },
    {
      title: '成果收尾',
      scene: '完成的笔记、待办清单',
      view: '俯拍',
      cameraMove: '固定机位',
      duration: 5,
      tips: '给观众一个完成感'
    }
  ],
  daily: [
    {
      title: '房间环境',
      scene: '床边、窗台、桌面',
      view: '全景',
      cameraMove: '慢推',
      duration: 5,
      tips: '用自然光建立生活感'
    },
    {
      title: '整理物品',
      scene: '包、钥匙、衣服',
      view: '特写',
      cameraMove: '固定机位',
      duration: 4,
      tips: '动作要完整，方便后期做节奏点'
    },
    {
      title: '出门转场',
      scene: '门把手、电梯、路口',
      view: '中景',
      cameraMove: '跟拍',
      duration: 4,
      tips: '用推门、抬手遮镜等动作做自然转场'
    }
  ],
  travel: [
    {
      title: '出发镜头',
      scene: '车站、机票、行李',
      view: '中景',
      cameraMove: '跟拍',
      duration: 5,
      tips: '让路线信息清楚出现一次'
    },
    {
      title: '目的地远景',
      scene: '街道、景点、自然风景',
      view: '远景',
      cameraMove: '横移',
      duration: 6,
      tips: '稳定拍摄，给画面留呼吸感'
    },
    {
      title: '当地细节',
      scene: '招牌、食物、手作、路牌',
      view: '特写',
      cameraMove: '固定机位',
      duration: 4,
      tips: '多拍可被记住的小元素'
    }
  ],
  food: [
    {
      title: '餐桌全景',
      scene: '餐厅、餐桌、菜单',
      view: '全景',
      cameraMove: '固定机位',
      duration: 4,
      tips: '先交代环境和食物数量'
    },
    {
      title: '制作过程',
      scene: '翻炒、倒入、摆盘',
      view: '近景',
      cameraMove: '跟拍',
      duration: 5,
      tips: '抓住声音和热气，会更有食欲'
    },
    {
      title: '成品特写',
      scene: '主菜、饮品、甜点',
      view: '特写',
      cameraMove: '慢推',
      duration: 4,
      tips: '让主体在画面中心，背景保持干净'
    }
  ]
}

function createShotPlan(options = {}) {
  const type = typeof options === 'string' ? options : options.type
  const normalizedType = $utils.normalizeVlogType(type)
  const guide = $utils.getShootGuide(normalizedType)
  const template = SHOT_TEMPLATES[normalizedType] || SHOT_TEMPLATES.study
  const shots = template.map((shot, index) => ({
    id: `${normalizedType}-shot-${index + 1}`,
    order: index + 1,
    title: `镜头${index + 1}：${shot.title}`,
    scene: shot.scene,
    view: shot.view,
    cameraMove: shot.cameraMove,
    duration: shot.duration,
    tips: shot.tips
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

function normalizeInputMaterials(materials = [], type) {
  if (!materials.length) {
    return $utils.getMaterials({ type })
  }

  return materials.map((item, index) => ({
    id: item.id || `upload-${index + 1}`,
    type: item.type || type,
    category: item.category || 'custom',
    name: item.name || `素材${index + 1}`,
    duration: item.duration || 4,
    tags: item.tags || [],
    sortWeight: item.sortWeight || (index + 1) * 10,
    uri: item.uri || item.path || ''
  }))
}

function buildTimeline(materials, shotPlan, styleTemplate) {
  const transitions = styleTemplate.transitions || ['cut']

  return materials.map((material, index) => {
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

function generateVlog(options = {}) {
  const type = $utils.normalizeVlogType(options.type)
  const guide = $utils.getShootGuide(type)
  const styleId = $utils.normalizeStyle(options.style || guide.defaultStyle)
  const styleTemplate = $utils.getStyleTemplate(styleId)
  const shotPlan = createShotPlan({ type })
  const materials = $utils.sortMaterials(normalizeInputMaterials(options.materials || [], type))
  const timeline = buildTimeline(materials, shotPlan, styleTemplate)

  return {
    id: `mock-vlog-${type}-${styleTemplate.id}`,
    type,
    title: `${guide.name} - ${styleTemplate.name}`,
    shotPlan,
    materials,
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
        count: materials.length
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
      ratio: options.ratio || '9:16',
      resolution: options.resolution || '1080x1920',
      duration: timeline.reduce((total, item) => total + item.duration, 0)
    }
  }
}

function generateVlogAsync(options = {}, delay) {
  return $utils.mockRequest(generateVlog(options), delay)
}

export default {
  createShotPlan,
  getStyleTemplate: $utils.getStyleTemplate,
  getStyleTemplates: $utils.getStyleTemplates,
  generateVlog,
  generateVlogAsync
}
