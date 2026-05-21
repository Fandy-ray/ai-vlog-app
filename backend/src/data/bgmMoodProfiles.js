/** 按镜头氛围生成不同垫乐（lavfi），用于分段 BGM */
const MOOD_PROFILES = {
  nature: {
    label: '自然氛围',
    freqs: [174.61, 261.63, 392],
    tremolo: [1.2, 1.8, 2.2],
    volumes: [0.5, 0.38, 0.28],
    noise: 0.04,
    lowpass: 2400,
    volumeMul: 2.0,
  },
  concert: {
    label: '现场律动',
    freqs: [110, 164.81, 220],
    tremolo: [5.5, 6.2, 4.8],
    volumes: [0.62, 0.55, 0.45],
    noise: 0.08,
    lowpass: 4200,
    volumeMul: 2.4,
  },
  urban: {
    label: '城市漫步',
    freqs: [196, 293.66, 369.99],
    tremolo: [3, 3.5, 2.8],
    volumes: [0.48, 0.4, 0.32],
    noise: 0.06,
    lowpass: 3200,
    volumeMul: 2.1,
  },
  food: {
    label: '温暖生活',
    freqs: [220, 277.18, 329.63],
    tremolo: [2.2, 2.8, 2],
    volumes: [0.52, 0.42, 0.34],
    noise: 0.05,
    lowpass: 3000,
    volumeMul: 2.15,
  },
  energetic: {
    label: '轻快节奏',
    freqs: [130.81, 196, 261.63],
    tremolo: [4.5, 5, 4.2],
    volumes: [0.58, 0.5, 0.4],
    noise: 0.07,
    lowpass: 3800,
    volumeMul: 2.3,
  },
  calm: {
    label: '治愈慢节奏',
    freqs: [196, 246.94, 293.66],
    tremolo: [1.5, 2, 1.8],
    volumes: [0.45, 0.35, 0.28],
    noise: 0.04,
    lowpass: 2600,
    volumeMul: 1.95,
  },
  study: {
    label: '专注 Lo-fi',
    freqs: [174.61, 220, 261.63],
    tremolo: [2, 2.4, 1.6],
    volumes: [0.42, 0.34, 0.26],
    noise: 0.05,
    lowpass: 2200,
    volumeMul: 1.9,
  },
}

const STYLE_FALLBACK_MOOD = {
  cinematic: 'calm',
  japanese: 'calm',
  study: 'study',
}

function guessMoodFromText(...parts) {
  const raw = parts.filter(Boolean).join(' ').toLowerCase()
  if (/演唱|演唱会|live|舞台|蹦迪|音乐节|乐队|吉他弹唱|rap/.test(raw)) return 'concert'
  if (/自然|山|海|森林|湖|草原|日落|星空|户外|风景|徒步/.test(raw)) return 'nature'
  if (/美食|餐厅|咖啡|做饭|烹饪|探店|甜品/.test(raw)) return 'food'
  if (/街|城市|通勤|地铁|商场|夜景|建筑/.test(raw)) return 'urban'
  if (/运动|跑步|骑行|健身|卡点|快剪/.test(raw)) return 'energetic'
  if (/学习|书桌|专注|图书馆|办公/.test(raw)) return 'study'
  return 'calm'
}

module.exports = { MOOD_PROFILES, STYLE_FALLBACK_MOOD, guessMoodFromText }
