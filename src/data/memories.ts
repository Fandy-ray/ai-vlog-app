export type MemoryVlog = {
  id: string;
  title: string;
  cover: string;
  duration: string;
  time: string;
  location: string;
  description: string;
  tags: string[];
};

export const memoryVlogs: MemoryVlog[] = [
  {
    id: 'sunset-bali',
    title: '巴厘岛日落慢游',
    cover:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    duration: '02:14',
    time: '2026-05-14 18:30',
    location: '巴厘岛 · 乌鲁瓦图',
    description: '海边日落、冲浪与晚霞的片段，剪成一支温柔的旅行 vlog。',
    tags: ['旅行', '日落', '海边'],
  },
  {
    id: 'city-night',
    title: '东京夜行街拍',
    cover:
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    duration: '01:48',
    time: '2026-05-20 21:05',
    location: '东京 · 涩谷',
    description: '霓虹、地铁与街头穿行的节奏感镜头。',
    tags: ['城市', '夜景', '街拍'],
  },
  {
    id: 'mountain-morning',
    title: '山间清晨记录',
    cover:
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    duration: '03:06',
    time: '2026-04-28 07:40',
    location: '云南 · 大理',
    description: '晨雾、风声和背包徒步的片段，轻盈又安静。',
    tags: ['清晨', '徒步', '自然'],
  },
  {
    id: 'home-weekend',
    title: '周末家居时光',
    cover:
      'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80',
    duration: '01:22',
    time: '2026-05-22 16:10',
    location: '上海 · 家',
    description: '做饭、整理房间和下午茶，记录轻松的日常。',
    tags: ['生活', '家居', '日常'],
  },
];
