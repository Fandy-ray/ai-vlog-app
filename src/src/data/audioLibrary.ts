export interface NetworkAudio {
  id: string
  name: string
  artist: string
  duration: string
  /** 用于搜索匹配：风格、场景、情绪等 */
  tags: string[]
  /** 试听地址（网络音频） */
  previewUrl: string
  /** 封面渐变色，用于列表缩略图 */
  coverFrom: string
  coverTo: string
}

export const NETWORK_AUDIOS: NetworkAudio[] = [
  {
    id: 'sunny-day',
    name: 'Sunny Day',
    artist: '轻松治愈',
    duration: '02:18',
    tags: ['轻松', '治愈', '日常', 'vlog'],
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverFrom: '#FFE8B8',
    coverTo: '#FFB357',
  },
  {
    id: 'coastal-walk',
    name: 'Coastal Walk',
    artist: '旅行氛围',
    duration: '02:45',
    tags: ['旅行', '海边', '清新', 'vlog'],
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverFrom: '#B8E8FF',
    coverTo: '#5E7CE0',
  },
  {
    id: 'city-lights',
    name: 'City Lights',
    artist: '都市节奏',
    duration: '02:02',
    tags: ['都市', '节奏', '夜景', '街拍'],
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    coverFrom: '#D4C4F0',
    coverTo: '#7B5EB8',
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    artist: '温暖胶片',
    duration: '03:10',
    tags: ['温暖', '胶片', '黄昏', '回忆'],
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    coverFrom: '#FFD4B8',
    coverTo: '#E88B5E',
  },
  {
    id: 'morning-brew',
    name: 'Morning Brew',
    artist: '咖啡时光',
    duration: '01:58',
    tags: ['早晨', '咖啡', '慢生活', '安静'],
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    coverFrom: '#E8D4C4',
    coverTo: '#A88B6E',
  },
  {
    id: 'rainy-window',
    name: 'Rainy Window',
    artist: '雨天情绪',
    duration: '02:36',
    tags: ['雨天', '情绪', '安静', '室内'],
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    coverFrom: '#C4D4E8',
    coverTo: '#6E8BA8',
  },
  {
    id: 'weekend-drive',
    name: 'Weekend Drive',
    artist: '公路旅行',
    duration: '02:22',
    tags: ['公路', '旅行', '自由', '开车'],
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    coverFrom: '#B8F0D4',
    coverTo: '#4AB88B',
  },
  {
    id: 'starry-night',
    name: 'Starry Night',
    artist: '夜晚氛围',
    duration: '02:50',
    tags: ['夜晚', '星空', '浪漫', '慢节奏'],
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    coverFrom: '#1A2540',
    coverTo: '#5E7CE0',
  },
]

export function getNetworkAudio(id: string | null): NetworkAudio | undefined {
  if (!id) return undefined
  return NETWORK_AUDIOS.find((a) => a.id === id)
}

export function formatBgmLabel(bgmId: string | null): string {
  if (!bgmId) return '未添加配乐'
  const audio = getNetworkAudio(bgmId)
  if (!audio) return '未添加配乐'
  return `${audio.name} - ${audio.artist}`
}

export function searchNetworkAudios(query: string): NetworkAudio[] {
  const q = query.trim().toLowerCase()
  if (!q) return NETWORK_AUDIOS
  return NETWORK_AUDIOS.filter((audio) => {
    const haystack = [audio.name, audio.artist, ...audio.tags].join(' ').toLowerCase()
    return haystack.includes(q)
  })
}
