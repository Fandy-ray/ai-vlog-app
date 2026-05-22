/** 成片风格（对应后端 mockData.styleTemplates） */
export const VLOG_STYLES = [
  {
    id: 'cinematic',
    name: '电影感',
    desc: '青橙色调、氛围钢琴、慢节奏转场',
    color: '#5E7CE0',
  },
  {
    id: 'japanese',
    name: '日系',
    desc: '暖白清透、轻快木吉他、柔和转场',
    color: '#FFB357',
  },
  {
    id: 'study',
    name: '学习风',
    desc: '柔光低饱和、Lo-fi 节拍、干净字幕',
    color: '#8ba17f',
  },
] as const

export type VlogStyleId = (typeof VLOG_STYLES)[number]['id']
