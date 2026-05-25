export const NETWORK_AUDIOS = [
  {
    id: 'sunny-day',
    name: 'Sunny Day',
    artist: '轻松治愈',
    duration: '02:18'
  },
  {
    id: 'coastal-walk',
    name: 'Coastal Walk',
    artist: '旅行氛围',
    duration: '02:45'
  },
  {
    id: 'city-lights',
    name: 'City Lights',
    artist: '都市节奏',
    duration: '02:02'
  },
  {
    id: 'morning-coffee',
    name: 'Morning Coffee',
    artist: '慵懒日常',
    duration: '01:58'
  }
]

export function getNetworkAudio(id) {
  return NETWORK_AUDIOS.find(item => item.id === id)
}

export default {
  NETWORK_AUDIOS,
  getNetworkAudio
}
