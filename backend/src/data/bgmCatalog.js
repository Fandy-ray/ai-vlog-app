const BGM_CATALOG = {
  cinematic: {
    id: 'cinematic',
    title: '晨曦漫步',
    artist: 'Memento AI',
    bpm: 88,
    mood: '电影感 · 慢节奏',
  },
  japanese: {
    id: 'japanese',
    title: '午后晴空',
    artist: 'Memento AI',
    bpm: 102,
    mood: '日系清新',
  },
  study: {
    id: 'study',
    title: '专注节拍',
    artist: 'Memento AI',
    bpm: 95,
    mood: '学习氛围',
  },
}

function pickBgm(style) {
  return BGM_CATALOG[style] || BGM_CATALOG.cinematic
}

module.exports = { BGM_CATALOG, pickBgm }
