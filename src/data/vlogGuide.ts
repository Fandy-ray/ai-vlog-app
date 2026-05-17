/** 九宫格编号：从左到右、从上到下 1–9 */
export type GridCell = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export interface VlogScene {
  id: string
  title: string
  subtitle: string
  /** 建议放置主体的格子 */
  subjectCells: GridCell[]
  /** 可留白 / 放字幕的格子 */
  accentCells?: GridCell[]
  gridSummary: string
  aiPrompt: string
  steps: string[]
}

export const GRID_CELL_LABELS: Record<GridCell, string> = {
  1: '左上',
  2: '中上',
  3: '右上',
  4: '左中',
  5: '正中',
  6: '右中',
  7: '左下',
  8: '中下',
  9: '右下',
}

export const VLOG_SCENES: VlogScene[] = [
  {
    id: 'intro',
    title: '人物开场',
    subtitle: '对着镜头介绍行程、打招呼',
    subjectCells: [4],
    accentCells: [6, 3],
    gridSummary: '人物放在第 4 格（左中），视线朝向右侧留白；字幕可放在第 3、6 格区域。',
    aiPrompt:
      '将人物置于画面左侧三分线（第 4 格），头部接近上三分之一线，右侧留出 1/3 空间用于字幕或 B-roll。',
    steps: [
      '手机竖屏持稳，与眼睛平齐或略低 10°',
      '人物占画面高度约 1/2，不要顶满上沿',
      '看镜头时身体略侧，给右侧留出「呼吸感」',
      '连拍 3–5 秒，后期可接地图或车票转场',
    ],
  },
  {
    id: 'landscape',
    title: '风景转场',
    subtitle: '山川、海景、城市天际线',
    subjectCells: [7, 8, 9],
    accentCells: [1, 2, 3],
    gridSummary: '地平线压在第 7–9 格上沿（下方 1/3）；天空占第 1–3 格，避免天空过少。',
    aiPrompt:
      '地平线对齐下方三分之一线（第 7 格上沿），主体景物落在 7–9 格；若有大面积天空，让云层分布在 1–3 格。',
    steps: [
      '开启网格线，先找地平线再按快门',
      '避免地平线切在正中间（第 5 格横线）',
      '前景（礁石、栏杆）可占 8–9 格增加层次',
      '横屏拍摄更适合风光，竖屏可上下缓慢摇镜',
    ],
  },
  {
    id: 'walk',
    title: '行走跟拍',
    subtitle: '边走边聊、街景漫步',
    subjectCells: [5, 8],
    accentCells: [2],
    gridSummary: '人物在 5、8 格略偏下；头顶保留第 2 格空间，避免裁切发际。',
    aiPrompt:
      '人物居中略偏下（第 5、8 格），上方第 2 格留空；镜头与人物保持 1.5 米，缓慢后退跟拍。',
    steps: [
      '后置镜头 + 稳定器或双手握持肘部贴身体',
      '人物走路方向朝向画面一侧，不要直冲镜头',
      '背景线条（街道、廊柱）尽量与网格线平行',
      '每段 8–12 秒，后期用速度曲线做轻微慢动作',
    ],
  },
  {
    id: 'food',
    title: '美食 / 物品特写',
    subtitle: '餐桌、咖啡、手作、纪念品',
    subjectCells: [5, 8],
    accentCells: [2, 6],
    gridSummary: '主体放在第 5 或 8 格正中偏下；手部、蒸汽等动势可占 4 或 6 格作陪体。',
    aiPrompt:
      '将食物或物品中心对准第 5 格，盘沿或杯口可压在第 8 格下沿；侧光时阴影朝向 4 或 6 格。',
    steps: [
      '俯拍 45° 时主体对准第 5 格，桌角露出一角增加现场感',
      '靠近窗户侧光，避免手机阴影盖住主体',
      '先对焦主体再构图，浅景深突出质感',
      '插入 1–2 秒手部入镜（第 4 或 6 格）更有生活感',
    ],
  },
  {
    id: 'dialogue',
    title: '双人对话',
    subtitle: '与朋友同框、采访式交流',
    subjectCells: [4, 6],
    accentCells: [5],
    gridSummary: '两人分别站在第 4、6 格；中间第 5 格留作对话空间，不要让人物挤在一起。',
    aiPrompt:
      '两位人物分别占据左中（第 4 格）与右中（第 6 格），视线朝向第 5 格中心交流，头顶各留一格空间。',
    steps: [
      '横屏或竖屏均可，竖屏时人物可略靠下占 4、6、7、9 格',
      '镜头与两人距离 2–2.5 米，避免广角畸变',
      '拍过肩镜头时，前景肩膀占 4 或 6 格一角即可',
      '交替特写单人占 4 或 6 格，剪辑时更有节奏',
    ],
  },
  {
    id: 'motion',
    title: '运动 / 动态跟拍',
    subtitle: '骑行、跑步、车内窗外',
    subjectCells: [3, 6],
    accentCells: [1, 2],
    gridSummary: '运动主体放在第 3 或 6 格，前进方向一侧留白；前方天空/道路占 1–2 格预示去向。',
    aiPrompt:
      '主体位于第 3 格（右上）或第 6 格（右中），面朝左侧留白；道路延伸线汇聚至 1–2 格增强纵深感。',
    steps: [
      '主体前进方向一侧必须留白，避免「撞墙」构图',
      '利用道路、栏杆引导线指向 1 或 2 格',
      '车内拍窗外时，窗框贴 4 或 6 格边缘作前景',
      '高速运动降低快门或后期加动态模糊，更电影感',
    ],
  },
]

export function getVlogScene(id: string): VlogScene | undefined {
  return VLOG_SCENES.find((s) => s.id === id)
}
