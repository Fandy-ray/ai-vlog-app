const { styles, guides } = require('../data/mockData')

function getStyles() {
  return styles
}

function getGuideByType(type) {
  return guides[type] || guides.study
}

function generateMockVlog(type = 'study') {
  const guide = getGuideByType(type)

  return {
    id: Date.now().toString(),
    type,
    title: type === 'study' ? '今天也在认真变好' : '属于今天的生活片段',
    style: type === 'study' ? '学习 vlog / 温暖 / 清爽' : '生活 vlog / 自然 / 轻快',
    guide,
    narration:
      '阳光落在书页上，键盘声和翻书声交织成今天努力的节奏。那些安静坚持的瞬间，也值得被认真记录。',
    editSuggestions: [
      '开头使用环境远景建立场景',
      '中段加入动作特写增强节奏',
      '结尾使用人物情绪镜头完成收束'
    ],
    bgm: '轻快、安静、温暖的 lo-fi 音乐',
    filter: '清爽暖色滤镜',
    transition: '淡入淡出转场',
    coverUrl: '',
    videoUrl: ''
  }
}

module.exports = {
  getStyles,
  getGuideByType,
  generateMockVlog
}