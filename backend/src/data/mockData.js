const vlogTypes = [
  {
    type: 'study',
    name: '学习 vlog',
    desc: '记录学习环境、专注动作和阶段性成果',
    description: '记录学习环境、专注动作和阶段性成果',
    recommend: '适合桌面、书本、键盘、阳光等画面',
    guide: ['拍摄桌面全景', '拍摄敲键盘动作', '拍摄翻书或写字特写', '拍摄完成任务后的收尾镜头'],
    defaultStyle: 'study'
  },
  {
    type: 'campus',
    name: '校园 vlog',
    desc: '记录校园空间、行走过程和傍晚氛围',
    description: '记录校园空间、行走过程和傍晚氛围',
    recommend: '适合操场、教室、图书馆等场景',
    guide: ['拍摄校园远景', '拍摄走路特写', '拍摄教学楼或操场空镜', '拍摄夕阳镜头'],
    defaultStyle: 'japanese'
  },
  {
    type: 'daily',
    name: '日常 vlog',
    desc: '记录起床、出门、生活片段与情绪瞬间',
    description: '记录起床、出门、生活片段与情绪瞬间',
    recommend: '适合房间、通勤、街角、生活细节',
    guide: ['拍摄房间环境', '拍摄整理物品动作', '拍摄出门转场', '拍摄一天结尾'],
    defaultStyle: 'cinematic'
  },
  {
    type: 'travel',
    name: '旅行 vlog',
    desc: '记录路线、风景、人物互动和目的地记忆点',
    description: '记录路线、风景、人物互动和目的地记忆点',
    recommend: '适合远景、路牌、人物背影、夕阳',
    guide: ['拍摄出发交通工具', '拍摄目的地远景', '拍摄行走跟拍', '拍摄当地细节特写'],
    defaultStyle: 'cinematic'
  },
  {
    type: 'food',
    name: '美食 vlog',
    desc: '记录餐厅环境、制作过程、成品和试吃反应',
    description: '记录餐厅环境、制作过程、成品和试吃反应',
    recommend: '适合近景、俯拍、食物特写',
    guide: ['拍摄店面或餐桌全景', '拍摄食物制作过程', '拍摄成品特写', '拍摄试吃反应'],
    defaultStyle: 'japanese'
  }
]

const styleTemplates = [
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
  },
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
  }
]

const materials = [
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

module.exports = {
  vlogTypes,
  styles: vlogTypes,
  styleTemplates,
  materials,
  guides: vlogTypes.reduce((result, item) => {
    result[item.type] = item.guide
    return result
  }, {})
}
