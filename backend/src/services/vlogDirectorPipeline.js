const fs = require('fs')
const ffmpegService = require('./ffmpegService')
const { buildSegmentBgmTrack } = require('./bgmSegmentService')
const {
  generateVlogEditPlan,
  reorderMaterialsByEditPlan,
  wantsNarration,
} = require('./vlogStoryService')

const ACT_VOLUME = {
  opening: 0.55,
  build: 0.68,
  climax: 0.82,
  resolve: 0.58,
}

const MAX_SHOTS = 8
const MIN_SHOTS = 6

/** 按实际成片镜头顺序生成章节 BGM（与 filePaths 一一对应） */
function groupChapterBgmFromMaterials(materials, durations, editOrder) {
  const moodByScene = new Map(
    (editOrder || []).map((o) => [o.sceneId, { mood: o.mood, act: o.act }]),
  )
  const groups = []
  for (let i = 0; i < materials.length; i++) {
    const m = materials[i]
    const meta = moodByScene.get(m.sceneId) || { mood: 'calm', act: 'build' }
    const dur = Math.max(2, durations[i] || 4)
    const last = groups[groups.length - 1]
    if (last && last.mood === meta.mood) {
      last.durationSec += dur
      last.volumeMul = Math.max(last.volumeMul, ACT_VOLUME[meta.act] || 0.7)
    } else {
      groups.push({
        mood: meta.mood || 'calm',
        durationSec: dur,
        volumeMul: ACT_VOLUME[meta.act] || 0.7,
      })
    }
  }
  return groups
}

function trimEditOrderToLimit(plan, materials, maxShots = MAX_SHOTS) {
  if (!plan.editOrder?.length || plan.editOrder.length <= maxShots) return plan
  const materialIds = new Set(materials.map((m) => m.sceneId))
  const acts = ['opening', 'build', 'climax', 'resolve']
  const picked = []
  for (const act of acts) {
    const inAct = plan.editOrder.filter((o) => o.act === act && materialIds.has(o.sceneId))
    picked.push(...inAct.slice(0, 2))
  }
  for (const o of plan.editOrder) {
    if (picked.length >= maxShots) break
    if (!picked.some((p) => p.sceneId === o.sceneId) && materialIds.has(o.sceneId)) {
      picked.push(o)
    }
  }
  return { ...plan, editOrder: picked.slice(0, maxShots) }
}

/**
 * AI 导演成片管线（性能优先：并行任务 + 最少重编码）
 */
async function produceDirectorVlog(ctx) {
  const {
    workPaths: initialPaths,
    workMaterials: initialMaterials,
    manifest,
    outPath,
    uploadDir,
    style,
  } = ctx

  const onPhase = ctx.onPhase || (() => {})
  const log = ctx.log || ((msg) => console.log(`[director] ${msg}`))
  const directorScenes = manifest.directorScenes || manifest.scenes || []

  onPhase('analyze', '正在分析故事情绪与镜头质量…')

  const storyPromise = generateVlogEditPlan({
    manifest,
    materials: initialMaterials,
    directorScenes,
    analysis: ctx.analysis,
  })

  const durationProbePromise = Promise.all(
    initialPaths.map((p) => ffmpegService.getVideoDuration(p)),
  )

  const story = await storyPromise
  let plan = trimEditOrderToLimit(story.data, initialMaterials, MAX_SHOTS)
  if (plan.editOrder.length < MIN_SHOTS && story.data.editOrder.length >= MIN_SHOTS) {
    plan = { ...plan, editOrder: story.data.editOrder.slice(0, MIN_SHOTS) }
  }

  onPhase('story', '正在编排起承转合与 6–8 个高光镜头…')

  const reordered = reorderMaterialsByEditPlan(
    initialMaterials,
    initialPaths,
    plan.editOrder,
  )

  let materials = reordered.materials
  let filePaths = reordered.filePaths

  if (filePaths.length < initialPaths.length) {
    log(
      `剪辑顺序匹配 ${filePaths.length}/${initialPaths.length} 段，按上传顺序补全`,
    )
    const used = new Set(materials.map((m) => m.sceneId))
    for (let i = 0; i < initialMaterials.length; i++) {
      if (!used.has(initialMaterials[i].sceneId)) {
        materials.push(initialMaterials[i])
        filePaths.push(initialPaths[i])
        used.add(initialMaterials[i].sceneId)
      }
    }
  }

  if (filePaths.length < initialPaths.length) {
    materials = initialMaterials
    filePaths = initialPaths
    log('剪辑顺序无效，使用上传顺序合成全部素材')
  }

  log(`实际合成 ${filePaths.length} 段素材`)

  const enableNarration = wantsNarration(manifest)
  const narrationText = enableNarration ? plan.narration : ''
  const burnTitle =
    plan.burnVideoTitle !== false ||
    /标题|片头|title/i.test(String(manifest.refinement || ''))
  const videoTitle = plan.videoTitle || plan.title

  const durations = await Promise.all(filePaths.map((p) => ffmpegService.getVideoDuration(p)))
  const moods = materials.map((m) => {
    const item = plan.editOrder.find((o) => o.sceneId === m.sceneId)
    return item?.mood || 'calm'
  })
  let chapterBgm = groupChapterBgmFromMaterials(materials, durations, plan.editOrder)
  if (!chapterBgm.length) {
    const totalDur = durations.reduce((s, d) => s + d, 0) || 30
    chapterBgm = [{ mood: moods[0] || 'calm', durationSec: totalDur, volumeMul: 0.7 }]
  }
  log(`章节 BGM：${chapterBgm.length} 段，moods=${moods.join(',')}`)

  onPhase('music', '正在匹配章节音乐并保留环境氛围…')

  const bgmPromise = buildSegmentBgmTrack(chapterBgm, uploadDir, style, {
    crossfadeSec: 1.6,
  }).catch((err) => {
    console.warn('[director] 章节 BGM 失败:', err.message)
    return null
  })

  let ttsPromise = Promise.resolve({ ok: false, reason: 'skipped' })
  if (enableNarration && narrationText && ctx.hasTts) {
    onPhase('tts', '正在并行合成 AI 配音…')
    ttsPromise = ctx.runTts(narrationText)
  }

  const safeTransition = ['fade', 'smooth', 'wipe'].includes(plan.transition)
    ? plan.transition
    : 'fade'

  onPhase('edit', '正在一次性渲染 720p 电影感成片…')

  const segmentBgmPath = await bgmPromise
  const tts = await ttsPromise
  log(
    `BGM 轨：${segmentBgmPath ? '已生成' : '未生成（将仅保留环境声）'}，TTS：${tts?.ok ? '有' : '无'}`,
  )

  const exportResult = await ffmpegService.produceDirectorExport(filePaths, outPath, {
    style,
    transition: safeTransition,
    bgmPath: segmentBgmPath,
    narrationPath: tts?.ok && tts.path ? tts.path : null,
    titleText: burnTitle ? videoTitle : '',
    titleDurationSec: 3.2,
    moods,
  })

  onPhase('finalize', '正在封装成片…')

  const timeline = materials.map((m, index) => {
    const item = plan.editOrder.find((o) => o.sceneId === m.sceneId) || {
      sceneId: m.sceneId,
      act: 'build',
      mood: moods[index],
    }
    return {
      order: index + 1,
      shotTitle: m?.name || item.sceneId,
      materialName: m?.name,
      duration: Math.round((durations[index] || 4) * 10) / 10,
      transition: index === 0 ? 'none' : safeTransition,
      act: item.act,
      mood: item.mood || moods[index],
      sceneId: m.sceneId,
    }
  })

  return {
    plan,
    storyProvider: story.provider,
    materials,
    filePaths,
    timeline,
    narrationText,
    videoTitle,
    burnTitle,
    safeTransition,
    segmentBgmPath: !!segmentBgmPath,
    hasTts: !!(tts?.ok && tts.path),
    ttsVcn: tts?.vcn,
    hasBurnedTitle: exportResult.hasBurnedTitle,
    hasBurnedSubtitles: false,
    shotCount: timeline.length,
    chapterCount: chapterBgm.length,
  }
}

module.exports = {
  produceDirectorVlog,
  ACT_VOLUME,
  MAX_SHOTS,
  groupChapterBgmFromMaterials,
}
