/**
 * 网络音频库
 *
 * 标签维护原则：previewUrl 指向哪首曲子，tags/mood/bpm 就必须按该曲实际听感填写。
 * 当前 SoundHelix 条目仅作「开发示例」，标签为中性描述，避免「海边/雨天」等具体场景误导推荐。
 * 正式曲库请将 MP3 放入 public/audio/，见 public/audio/README.md
 */

export type AudioSource = 'soundhelix-demo' | 'local' | 'curated'

export interface NetworkAudio {
  id: string
  name: string
  /** 展示用：作者或曲库来源说明 */
  artist: string
  duration: string
  tags: string[]
  mood: string[]
  bpm: number
  scene: string
  previewUrl: string
  remoteUrl?: string
  coverFrom: string
  coverTo: string
  /** 曲库来源，便于后续过滤/替换 */
  source: AudioSource
}

const SOUNDHELIX = 'https://www.soundhelix.com/examples/mp3'

/** @param n SoundHelix 示例编号 1～16 */
function localBgm(id: string) {
  return `/bgm/${id}.mp3`
}

function helix(n: number) {
  return `${SOUNDHELIX}/SoundHelix-Song-${n}.mp3`
}

/**
 * SoundHelix：算法示例纯音乐，曲风与文件名无关。
 * 以下 mood/tags 仅为「中性器乐」分类，供开发调试；要准确匹配请换本地 curated 曲。
 */
const SOUNDHELIX_DEMOS: NetworkAudio[] = [
  {
    id: 'sunny-day',
    name: '示例曲目 01',
    artist: 'SoundHelix · 器乐示例',
    duration: '02:18',
    tags: ['器乐', '示例', 'vlog', '中性'],
    mood: ['轻松'],
    bpm: 92,
    scene: '通用',
    previewUrl: localBgm('sunny-day'),
    remoteUrl: helix(1),
    coverFrom: '#FFE8B8',
    coverTo: '#FFB357',
    source: 'soundhelix-demo',
  },
  {
    id: 'coastal-walk',
    name: '示例曲目 02',
    artist: 'SoundHelix · 器乐示例',
    duration: '02:45',
    tags: ['器乐', '示例', 'vlog', '中性'],
    mood: ['轻松'],
    bpm: 88,
    scene: '通用',
    previewUrl: localBgm('coastal-walk'),
    remoteUrl: helix(2),
    coverFrom: '#B8E8FF',
    coverTo: '#5E7CE0',
    source: 'soundhelix-demo',
  },
  {
    id: 'city-lights',
    name: '示例曲目 03',
    artist: 'SoundHelix · 器乐示例',
    duration: '02:02',
    tags: ['器乐', '示例', '节奏', '中性'],
    mood: ['活力'],
    bpm: 112,
    scene: '通用',
    previewUrl: localBgm('city-lights'),
    remoteUrl: helix(3),
    coverFrom: '#D4C4F0',
    coverTo: '#7B5EB8',
    source: 'soundhelix-demo',
  },
  {
    id: 'golden-hour',
    name: '示例曲目 04',
    artist: 'SoundHelix · 器乐示例',
    duration: '03:10',
    tags: ['器乐', '示例', 'vlog', '中性'],
    mood: ['治愈'],
    bpm: 80,
    scene: '通用',
    previewUrl: localBgm('golden-hour'),
    remoteUrl: helix(4),
    coverFrom: '#FFD4B8',
    coverTo: '#E88B5E',
    source: 'soundhelix-demo',
  },
  {
    id: 'morning-brew',
    name: '示例曲目 05',
    artist: 'SoundHelix · 器乐示例',
    duration: '01:58',
    tags: ['器乐', '示例', '慢节奏', '中性'],
    mood: ['安静'],
    bpm: 72,
    scene: '通用',
    previewUrl: localBgm('morning-brew'),
    remoteUrl: helix(5),
    coverFrom: '#E8D4C4',
    coverTo: '#A88B6E',
    source: 'soundhelix-demo',
  },
  {
    id: 'rainy-window',
    name: '示例曲目 06',
    artist: 'SoundHelix · 器乐示例',
    duration: '02:36',
    tags: ['器乐', '示例', '慢节奏', '中性'],
    mood: ['安静'],
    bpm: 68,
    scene: '通用',
    previewUrl: localBgm('rainy-window'),
    remoteUrl: helix(6),
    coverFrom: '#C4D4E8',
    coverTo: '#6E8BA8',
    source: 'soundhelix-demo',
  },
  {
    id: 'weekend-drive',
    name: '示例曲目 07',
    artist: 'SoundHelix · 器乐示例',
    duration: '02:22',
    tags: ['器乐', '示例', '节奏', '中性'],
    mood: ['活力'],
    bpm: 108,
    scene: '通用',
    previewUrl: localBgm('weekend-drive'),
    remoteUrl: helix(7),
    coverFrom: '#B8F0D4',
    coverTo: '#4AB88B',
    source: 'soundhelix-demo',
  },
  {
    id: 'starry-night',
    name: '示例曲目 08',
    artist: 'SoundHelix · 器乐示例',
    duration: '02:50',
    tags: ['器乐', '示例', '慢节奏', '中性'],
    mood: ['安静', '浪漫'],
    bpm: 76,
    scene: '通用',
    previewUrl: localBgm('starry-night'),
    remoteUrl: helix(8),
    coverFrom: '#1A2540',
    coverTo: '#5E7CE0',
    source: 'soundhelix-demo',
  },
  {
    id: 'helix-09',
    name: '示例曲目 09',
    artist: 'SoundHelix · 器乐示例',
    duration: '02:30',
    tags: ['器乐', '示例', 'vlog', '中性'],
    mood: ['轻松', '治愈'],
    bpm: 90,
    scene: '通用',
    previewUrl: helix(9),
    coverFrom: '#E8F4D4',
    coverTo: '#6EB88B',
    source: 'soundhelix-demo',
  },
  {
    id: 'helix-10',
    name: '示例曲目 10',
    artist: 'SoundHelix · 器乐示例',
    duration: '02:40',
    tags: ['器乐', '示例', '节奏', '中性'],
    mood: ['活力'],
    bpm: 115,
    scene: '通用',
    previewUrl: helix(10),
    coverFrom: '#F0E8B8',
    coverTo: '#C88B5E',
    source: 'soundhelix-demo',
  },
  {
    id: 'helix-11',
    name: '示例曲目 11',
    artist: 'SoundHelix · 器乐示例',
    duration: '02:15',
    tags: ['器乐', '示例', '慢节奏', '中性'],
    mood: ['安静', '治愈'],
    bpm: 70,
    scene: '通用',
    previewUrl: helix(11),
    coverFrom: '#D8E8F0',
    coverTo: '#7A9CB8',
    source: 'soundhelix-demo',
  },
  {
    id: 'helix-12',
    name: '示例曲目 12',
    artist: 'SoundHelix · 器乐示例',
    duration: '02:55',
    tags: ['器乐', '示例', 'vlog', '中性'],
    mood: ['温暖', '治愈'],
    bpm: 84,
    scene: '通用',
    previewUrl: helix(12),
    coverFrom: '#F4D8E8',
    coverTo: '#B87A9C',
    source: 'soundhelix-demo',
  },
  {
    id: 'helix-13',
    name: '示例曲目 13',
    artist: 'SoundHelix · 器乐示例',
    duration: '02:05',
    tags: ['器乐', '示例', '节奏', '中性'],
    mood: ['活力', '自由'],
    bpm: 118,
    scene: '通用',
    previewUrl: helix(13),
    coverFrom: '#B8D8F0',
    coverTo: '#4A7AC8',
    source: 'soundhelix-demo',
  },
  {
    id: 'helix-14',
    name: '示例曲目 14',
    artist: 'SoundHelix · 器乐示例',
    duration: '03:00',
    tags: ['器乐', '示例', '慢节奏', '中性'],
    mood: ['情绪', '安静'],
    bpm: 74,
    scene: '通用',
    previewUrl: helix(14),
    coverFrom: '#C8C8D8',
    coverTo: '#686878',
    source: 'soundhelix-demo',
  },
]

/**
 * 把 Mixkit 等下载的 MP3 放进 public/audio/ 后，在此追加（可先复制下面模板改文件名）。
 */
/** Mixkit 精选（脚本 scripts/fetch-mixkit-tracks.mjs 下载，Mixkit License） */
const CURATED_LOCAL: NetworkAudio[] = [
  {
    id: 'mixkit-travel-serene-view',
    name: 'Serene View',
    artist: 'Mixkit · Arulo',
    duration: '01:54',
    tags: ['旅行', '清新', '放松', 'vlog', '户外'],
    mood: ['清新', '自由', '轻松'],
    bpm: 90,
    scene: '旅行',
    previewUrl: '/audio/mixkit-travel-serene-view.mp3',
    coverFrom: '#B8E8FF',
    coverTo: '#5E7CE0',
    source: 'curated',
  },
  {
    id: 'mixkit-happy-tears-of-joy',
    name: 'Tears of Joy',
    artist: 'Mixkit · Michael Ramir C.',
    duration: '02:20',
    tags: ['日常', '快乐', '轻松', 'vlog', '阳光'],
    mood: ['轻松', '治愈'],
    bpm: 102,
    scene: '日常',
    previewUrl: '/audio/mixkit-happy-tears-of-joy.mp3',
    coverFrom: '#FFE8B8',
    coverTo: '#FFB357',
    source: 'curated',
  },
  {
    id: 'mixkit-calm-forest-walk',
    name: 'Forest Walk',
    artist: 'Mixkit · Eugenio Mininni',
    duration: '02:54',
    tags: ['安静', '自然', '慢生活', '户外', '治愈'],
    mood: ['安静', '治愈'],
    bpm: 78,
    scene: '慢生活',
    previewUrl: '/audio/mixkit-calm-forest-walk.mp3',
    coverFrom: '#B8F0D4',
    coverTo: '#4A8B6E',
    source: 'curated',
  },
  {
    id: 'mixkit-urban-night-sky',
    name: 'Night Sky Hip Hop',
    artist: 'Mixkit · Michael Ramir C.',
    duration: '04:17',
    tags: ['都市', '夜晚', '节奏', '街拍', '嘻哈'],
    mood: ['活力', '都市'],
    bpm: 95,
    scene: '都市',
    previewUrl: '/audio/mixkit-urban-night-sky.mp3',
    coverFrom: '#1A2540',
    coverTo: '#5E7CE0',
    source: 'curated',
  },
  {
    id: 'mixkit-upbeat-one-more-dance',
    name: 'One More Dance',
    artist: 'Mixkit · Arulo',
    duration: '01:40',
    tags: ['节奏', '活力', '快剪', 'vlog', '跳舞'],
    mood: ['活力', '轻松'],
    bpm: 118,
    scene: '卡点',
    previewUrl: '/audio/mixkit-upbeat-one-more-dance.mp3',
    coverFrom: '#F0B8E8',
    coverTo: '#B85E9C',
    source: 'curated',
  },
  {
    id: 'mixkit-cinematic-orchestral',
    name: 'Cinematic Orchestra',
    artist: 'Mixkit · Film',
    duration: '02:30',
    tags: ['温暖', '回忆', '电影感', '叙事', 'vlog'],
    mood: ['温暖', '情绪'],
    bpm: 84,
    scene: '回忆',
    previewUrl: '/audio/mixkit-cinematic-orchestral.mp3',
    coverFrom: '#FFD4B8',
    coverTo: '#A86E5E',
    source: 'curated',
  },
]

/** 精选曲在前，开发示例在后 */
export const NETWORK_AUDIOS: NetworkAudio[] = [...CURATED_LOCAL, ...SOUNDHELIX_DEMOS]

export function getCuratedAudios(): NetworkAudio[] {
  return NETWORK_AUDIOS.filter((a) => a.source !== 'soundhelix-demo')
}

export function hasCuratedAudios(): boolean {
  return getCuratedAudios().length > 0
}

/** 列表/搜索用：默认仅精选；无精选时回退显示全部以免空列表 */
export function getBrowsableAudios(options?: { includeDemoTracks?: boolean }): NetworkAudio[] {
  const curated = getCuratedAudios()
  if (options?.includeDemoTracks) return NETWORK_AUDIOS
  return curated.length > 0 ? curated : NETWORK_AUDIOS
}

export function searchNetworkAudios(
  query: string,
  options?: { includeDemoTracks?: boolean },
): NetworkAudio[] {
  const pool = getBrowsableAudios(options)
  const q = query.trim().toLowerCase()
  if (!q) return pool
  return pool.filter((audio) => {
    const haystack = [audio.name, audio.artist, audio.scene, ...audio.mood, ...audio.tags]
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
}

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

/** 非示例曲（本地/人工精选）优先用于推荐排序加权 */
export function isCuratedAudio(audio: NetworkAudio): boolean {
  return audio.source !== 'soundhelix-demo'
}
