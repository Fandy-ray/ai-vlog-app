const ffmpegService = require('./ffmpegService')
const { guessMoodFromText } = require('../data/bgmMoodProfiles')

/**
 * 基于时长、文件大小、场景类型的启发式「AI 分析」
 * （真实视觉模型可后续替换）
 */
async function analyzeClips(materials, filePaths) {
  const items = await Promise.all(
    filePaths.map(async (filePath, index) => {
      const material = materials[index] || {}
      const duration = await ffmpegService.getVideoDuration(filePath)
      const meta = await ffmpegService.probeVideoMeta(filePath)
      const mood = guessMoodFromText(
        material.name,
        material.sceneId,
        material.sceneTitle,
      )
      let sizeScore = 0.5
      try {
        const fs = require('fs')
        const stat = fs.statSync(filePath)
        const mb = stat.size / (1024 * 1024)
        sizeScore = Math.min(1, Math.max(0.2, mb / 8))
      } catch {
        /* ignore */
      }

      const durationScore =
        duration >= 3 && duration <= 12 ? 1 : duration >= 2 && duration <= 20 ? 0.75 : 0.45

      const qualityScore = Math.round((durationScore * 0.65 + sizeScore * 0.35) * 100)

      const highlights = []
      if (duration >= 4) highlights.push('时长适中，适合作为叙事主镜头')
      if (qualityScore >= 80) highlights.push('画面信息量充足')
      if (material.sceneId === 'intro' || material.sceneId === 'landscape') {
        highlights.push('适合开场建立环境')
      }
      if (material.sceneId === 'motion') highlights.push('动感镜头，适合节奏高潮')
      if (!highlights.length) highlights.push('已纳入剪辑时间轴')

      return {
        sceneId: material.sceneId || `scene-${index}`,
        sceneTitle: material.name || `镜头 ${index + 1}`,
        durationSec: Math.round(duration * 10) / 10,
        qualityScore,
        shotType: guessShotType(material.sceneId, duration),
        orientation: meta.orientation,
        width: meta.width,
        height: meta.height,
        mood,
        highlights,
        selected: true,
      }
    }),
  )

  items.sort((a, b) => b.qualityScore - a.qualityScore)

  const MAX_KEEP = 8
  const MIN_KEEP = 6
  if (items.length > MAX_KEEP) {
    items.forEach((item, i) => {
      item.selected = i < MAX_KEEP
    })
  } else {
    items.forEach((item) => {
      item.selected = true
    })
  }

  const selectedCount = items.filter((i) => i.selected).length

  return {
    analyzedAt: Date.now(),
    clipCount: items.length,
    selectedCount,
    clips: items,
    summary: `已分析 ${items.length} 段素材，AI 精选 ${selectedCount} 个镜头（建议 ${MIN_KEEP}–${MAX_KEEP} 段）`,
  }
}

function guessShotType(sceneId, duration) {
  const map = {
    intro: '建立镜头',
    landscape: '远景',
    walk: '跟拍',
    food: '特写',
    dialogue: '中景',
    motion: '运动镜头',
  }
  if (map[sceneId]) return map[sceneId]
  if (duration <= 3) return '短切特写'
  if (duration >= 10) return '长镜头'
  return '中景'
}

function filterPathsBySelection(materials, filePaths, analysis) {
  const selectedIds = new Set(
    (analysis?.clips || []).filter((c) => c.selected).map((c) => c.sceneId),
  )
  if (!selectedIds.size) return { materials, filePaths }

  const pairs = materials
    .map((m, i) => ({ m, p: filePaths[i] }))
    .filter(({ m }) => selectedIds.has(m.sceneId))

  if (!pairs.length) return { materials, filePaths }

  return {
    materials: pairs.map((x) => x.m),
    filePaths: pairs.map((x) => x.p),
  }
}

module.exports = { analyzeClips, filterPathsBySelection }
