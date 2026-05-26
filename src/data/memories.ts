import type { MemoryItem } from '@/components/MemoryCard'

export interface GardenVlogItem extends MemoryItem {
  location: string
  timeLabel: string
  date: string
  theme: string
  description: string
  /** 纬度，回忆地图标注用 */
  lat: number
  /** 经度，回忆地图标注用 */
  lng: number
  /** 可选成片地址，记忆花园播放用 */
  videoUrl?: string
}

export const HERO_COVER =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop'

export const MEMORY_ITEMS: MemoryItem[] = [
  {
    id: '1',
    title: '大理的慢时光',
    cover: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop',
    views: '1.2k',
    duration: '01:24',
  },
  {
    id: '2',
    title: '西湖边的午后',
    cover: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&h=300&fit=crop',
    views: '856',
    duration: '00:58',
  },
  {
    id: '3',
    title: '厦门的海风',
    cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
    views: '2.3k',
    duration: '02:10',
  },
  {
    id: '4',
    title: '京都秋色',
    cover: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop',
    views: '643',
    duration: '01:05',
  },
]

export const GARDEN_VLOGS: GardenVlogItem[] = [
  {
    id: 'garden-1',
    title: '大理的晨雾与洱海',
    cover: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop',
    views: '1.8k',
    duration: '02:14',
    location: '云南 · 大理',
    timeLabel: '清晨 07:20',
    date: '2026-05-18',
    theme: '旅途治愈',
    lat: 25.6065,
    lng: 100.2679,
    description: '洱海边的日出、骑行和早餐，拼成一段很安静的 vlog。',
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    id: 'garden-2',
    title: '上海夜色散步',
    cover: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop',
    views: '965',
    duration: '01:36',
    location: '上海 · 外滩',
    timeLabel: '晚上 20:10',
    date: '2026-05-20',
    theme: '城市夜景',
    lat: 31.24,
    lng: 121.49,
    description: '外滩、江风、霓虹灯，把晚上的城市氛围完整保留下来。',
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  },
  {
    id: 'garden-3',
    title: '海边的午后慢镜头',
    cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
    views: '2.5k',
    duration: '02:42',
    location: '福建 · 厦门',
    timeLabel: '下午 15:45',
    date: '2026-05-10',
    theme: '海边日常',
    lat: 24.4798,
    lng: 118.0894,
    description: '把海风、脚步声和浪花节奏剪成一支轻松的夏日 vlog。',
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  },
  {
    id: 'garden-4',
    title: '京都红叶漫步',
    cover: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop',
    views: '731',
    duration: '01:08',
    location: '日本 · 京都',
    timeLabel: '午后 13:30',
    date: '2026-04-28',
    theme: '四季色彩',
    lat: 35.0116,
    lng: 135.7681,
    description: '寺院、枫叶和街道慢镜头，适合做成一段安静的回忆。',
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  },
]

export function groupGardenVlogsByDate(
  vlogs: GardenVlogItem[] = GARDEN_VLOGS,
): Map<string, GardenVlogItem[]> {
  const map = new Map<string, GardenVlogItem[]>()
  for (const vlog of vlogs) {
    const list = map.get(vlog.date) ?? []
    list.push(vlog)
    map.set(vlog.date, list)
  }
  return map
}

export function getGardenVlogCountByDate(
  vlogs: GardenVlogItem[] = GARDEN_VLOGS,
): Map<string, number> {
  const counts = new Map<string, number>()
  for (const vlog of vlogs) {
    counts.set(vlog.date, (counts.get(vlog.date) ?? 0) + 1)
  }
  return counts
}

function formatGardenVlogSearchDate(date: string) {
  const [year, month, day] = date.split('-')
  return `${year}年${Number(month)}月${Number(day)}日`
}

function getGardenVlogSearchText(vlog: GardenVlogItem): string {
  return [
    vlog.title,
    vlog.description,
    vlog.location,
    vlog.theme,
    vlog.timeLabel,
    vlog.date,
    formatGardenVlogSearchDate(vlog.date),
    vlog.views,
    vlog.duration ?? '',
  ]
    .join(' ')
    .toLowerCase()
}

/** 按标题、描述、地点、主题等特点搜索 vlog */
export function searchGardenVlogs(
  vlogs: GardenVlogItem[] = GARDEN_VLOGS,
  query: string,
): GardenVlogItem[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return vlogs

  const tokens = normalized.split(/\s+/).filter(Boolean)
  return vlogs.filter((vlog) => {
    const haystack = getGardenVlogSearchText(vlog)
    return tokens.every((token) => haystack.includes(token))
  })
}

export interface MapBounds {
  north: number
  south: number
  west: number
  east: number
}

export function getGardenMapBounds(vlogs: GardenVlogItem[] = GARDEN_VLOGS): MapBounds {
  if (vlogs.length === 0) {
    return { north: 40, south: 20, west: 100, east: 140 }
  }

  let north = vlogs[0].lat
  let south = vlogs[0].lat
  let west = vlogs[0].lng
  let east = vlogs[0].lng

  for (const vlog of vlogs) {
    north = Math.max(north, vlog.lat)
    south = Math.min(south, vlog.lat)
    west = Math.min(west, vlog.lng)
    east = Math.max(east, vlog.lng)
  }

  const latPad = Math.max((north - south) * 0.25, 2)
  const lngPad = Math.max((east - west) * 0.25, 2)

  return {
    north: north + latPad,
    south: south - latPad,
    west: west - lngPad,
    east: east + lngPad,
  }
}

export function projectGardenVlog(
  vlog: GardenVlogItem,
  bounds: MapBounds,
): { x: number; y: number } {
  const x = ((vlog.lng - bounds.west) / (bounds.east - bounds.west)) * 100
  const y = ((bounds.north - vlog.lat) / (bounds.north - bounds.south)) * 100
  return { x, y }
}
