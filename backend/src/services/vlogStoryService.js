const vivoService = require('./vivoService')
const { guessMoodFromText, MOOD_PROFILES } = require('../data/bgmMoodProfiles')

const ACTS = ['opening', 'build', 'climax', 'resolve']
const ALLOWED_MOODS = new Set(Object.keys(MOOD_PROFILES))

function wantsNarration(manifest = {}) {
  if (manifest.enableNarration === true) return true
  const text = String(manifest.refinement || '')
  return /需要.*旁白|要.*配音|生成.*旁白|加入.*旁白|旁白配音/i.test(text)
}

function normalizeMood(m) {
  const k = String(m || '').toLowerCase()
  return ALLOWED_MOODS.has(k) ? k : 'calm'
}

function normalizeAct(act, index, total) {
  const a = String(act || '').toLowerCase()
  if (ACTS.includes(a)) return a
  const ratio = index / Math.max(1, total - 1)
  if (ratio < 0.2) return 'opening'
  if (ratio < 0.55) return 'build'
  if (ratio < 0.8) return 'climax'
  return 'resolve'
}

function buildEditPlanPrompt(manifest, materials, directorScenes, analysis) {
  const theme = manifest.theme || manifest.type || 'Vlog'
  const style = manifest.stylePreference || manifest.style || 'cinematic'
  const refinement = manifest.refinement || ''
  const withNarration = wantsNarration(manifest)

  const directorLines = (directorScenes || []).map(
    (s, i) =>
      `${i + 1}. [${s.id}] ${s.title} — ${s.subtitle}（${s.aiPrompt || ''}）`,
  )

  const materialLines = materials.map((m, i) => {
    const clip = analysis?.clips?.find((c) => c.sceneId === m.sceneId)
    return `${i + 1}. sceneId=${m.sceneId} 名称=${m.name} 时长≈${m.duration}s 横竖屏=${clip?.orientation || 'unknown'} 氛围=${clip?.mood || 'calm'}`
  })

  return `你是荣获社交媒体奖项的 Vlog 导演与剪辑师。请为用户的实拍素材设计「有故事感、有情绪推进」的成片方案，而不是随机拼接。

【用户主题】${theme}
【视觉风格】${style}
【额外要求】${refinement || '无'}

【AI 导拍分镜（必须优先遵循此顺序与意图）】
${directorLines.join('\n') || '（按上传顺序）'}

【实拍素材】
${materialLines.join('\n')}

导演要求：
1. editOrder 必须按导拍分镜逻辑排列 sceneId，体现起承转合：opening 建立氛围 → build 推进 → climax 高潮 → resolve 收束。
2. ${withNarration ? 'narration 全文即 TTS 配音稿，50-120 字，口语化，与画面故事一致；' : '不要生成 narration，narration 必须为空字符串 ""；'}
3. videoTitle 为片头大标题（英文或中文，简洁高级，如 Seoul Vlog / 周末日记）。
4. burnVideoTitle 必须为 false；不要生成镜头字幕 caption（caption 一律留空 ""）。
5. editOrder 最多 8 个镜头、至少 6 个（若素材足够），体现起承转合，宁缺毋滥。
6. 每个镜头指定 mood（nature/concert/urban/food/calm/energetic/study）；演唱会/现场必须用 concert 或 energetic，自然风景用 nature。
7. chapters 将连续同 mood 的镜头归纳为 2-4 个「情绪章节」用于 BGM 切换。

只输出 JSON：
{
  "videoTitle": "片头标题",
  "burnVideoTitle": false,
  "title": "成片名",
  "narration": "TTS逐字朗读旁白",
  "storyArc": {
    "opening": "开场一句话",
    "build": "推进一句话",
    "climax": "高潮一句话",
    "resolve": "结尾一句话"
  },
  "editOrder": [
    { "sceneId": "scene-1", "act": "opening", "mood": "nature", "pacing": "slow", "caption": "" }
  ],
  "chapters": [
    { "name": "Chapter 1 · 旅途", "mood": "nature", "sceneIds": ["scene-1"] }
  ],
  "segmentMoods": [{ "sceneId": "scene-1", "mood": "nature" }],
  "transition": "fade",
  "styleHint": "剪辑节奏建议"
}`
}

function fallbackEditPlan(manifest, materials, directorScenes) {
  const withNarration = wantsNarration(manifest)
  const sceneList = directorScenes?.length
    ? directorScenes
    : materials.map((m) => ({ id: m.sceneId, title: m.name, subtitle: '' }))

  const editOrder = sceneList
    .map((scene, index) => {
      const material = materials.find((m) => m.sceneId === scene.id)
      if (!material) return null
      const mood = guessMoodFromText(
        scene.title,
        scene.subtitle,
        material.name,
        manifest.theme,
      )
      const act = normalizeAct(null, index, sceneList.length)
      return {
        sceneId: scene.id,
        act,
        mood,
        pacing: act === 'climax' ? 'fast' : act === 'opening' ? 'slow' : 'medium',
        caption: '',
      }
    })
    .filter(Boolean)

  const theme = manifest.theme || '我的 Vlog'
  return {
    videoTitle: `${theme}`.slice(0, 20),
    burnVideoTitle: false,
    title: theme,
    narration: withNarration
      ? `这是关于${theme}的一天。从清晨到夜晚，每一帧都值得被记住。`
      : '',
    storyArc: {
      opening: '建立氛围，带入故事',
      build: '节奏渐强，展开主线',
      climax: '情绪高点，留下记忆',
      resolve: '温柔收束，余韵回味',
    },
    editOrder,
    chapters: groupChapters(editOrder),
    segmentMoods: editOrder.map((e) => ({ sceneId: e.sceneId, mood: e.mood })),
    transition: 'fade',
    styleHint: '按导拍顺序剪辑，慢节奏开场，中段提速，结尾留白',
  }
}

function groupChapters(editOrder) {
  const chapters = []
  let current = null
  for (const item of editOrder) {
    if (!current || current.mood !== item.mood) {
      current = {
        name: `Chapter ${chapters.length + 1}`,
        mood: item.mood,
        sceneIds: [item.sceneId],
      }
      chapters.push(current)
    } else {
      current.sceneIds.push(item.sceneId)
    }
  }
  return chapters
}

function sanitizeEditPlan(plan, materials, directorScenes, manifest = {}) {
  const withNarration = wantsNarration(manifest)
  const materialIds = new Set(materials.map((m) => m.sceneId))
  const directorIds = (directorScenes || []).map((s) => s.id)

  let order = Array.isArray(plan.editOrder) ? plan.editOrder : []
  order = order.filter((o) => materialIds.has(o.sceneId))

  for (const id of directorIds) {
    if (!order.some((o) => o.sceneId === id) && materialIds.has(id)) {
      order.push({
        sceneId: id,
        act: 'build',
        mood: 'calm',
        pacing: 'medium',
        caption: '',
      })
    }
  }

  for (const m of materials) {
    if (!order.some((o) => o.sceneId === m.sceneId)) {
      order.push({
        sceneId: m.sceneId,
        act: 'build',
        mood: guessMoodFromText(m.name, manifest.theme),
        pacing: 'medium',
        caption: m.name?.slice(0, 14),
      })
    }
  }

  order = order.map((o, i) => ({
    sceneId: o.sceneId,
    act: normalizeAct(o.act, i, order.length),
    mood: normalizeMood(o.mood),
    pacing: ['slow', 'medium', 'fast'].includes(o.pacing) ? o.pacing : 'medium',
    caption: '',
  }))

  return {
    videoTitle: String(plan.videoTitle || plan.title || 'My Vlog').slice(0, 24),
    burnVideoTitle: false,
    title: String(plan.title || plan.videoTitle || 'Vlog').slice(0, 40),
    narration: withNarration ? String(plan.narration || '').trim() : '',
    storyArc: plan.storyArc || {},
    editOrder: order,
    chapters: Array.isArray(plan.chapters) ? plan.chapters : groupChapters(order),
    segmentMoods: order.map((o) => ({ sceneId: o.sceneId, mood: o.mood })),
    transition: plan.transition || 'fade',
    styleHint: plan.styleHint || '',
  }
}

function useFastStoryPlan() {
  return process.env.VIVO_FAST_VLOG !== 'false'
}

async function generateVlogEditPlan({ manifest, materials, directorScenes, analysis }) {
  if (useFastStoryPlan()) {
    return {
      ok: true,
      provider: 'director-fast',
      data: fallbackEditPlan(manifest, materials, directorScenes),
    }
  }

  if (vivoService.isConfigured()) {
    try {
      const prompt = buildEditPlanPrompt(manifest, materials, directorScenes, analysis)
      const { content } = await vivoService.chatCompletion(prompt, {
        max_tokens: 4096,
        temperature: 0.65,
      })
      const parsed = vivoService.extractJson(content)
      if (parsed?.editOrder?.length) {
        return {
          ok: true,
          provider: 'vivo-llm',
          data: sanitizeEditPlan(parsed, materials, directorScenes, manifest),
        }
      }
    } catch (err) {
      console.warn('[story] AI 剪辑方案失败，使用导演模板:', err.message)
    }
  }

  return {
    ok: true,
    provider: 'director-template',
    data: fallbackEditPlan(manifest, materials, directorScenes),
  }
}

function reorderMaterialsByEditPlan(materials, filePaths, editOrder) {
  const pathByScene = new Map(materials.map((m, i) => [m.sceneId, filePaths[i]]))
  const materialByScene = new Map(materials.map((m) => [m.sceneId, m]))

  const orderedMaterials = []
  const orderedPaths = []

  for (const item of editOrder) {
    const m = materialByScene.get(item.sceneId)
    const p = pathByScene.get(item.sceneId)
    if (m && p) {
      orderedMaterials.push({ ...m, directorAct: item.act, directorMood: item.mood, directorCaption: item.caption })
      orderedPaths.push(p)
    }
  }

  if (!orderedMaterials.length) {
    return { materials, filePaths }
  }

  return { materials: orderedMaterials, filePaths: orderedPaths }
}

module.exports = {
  generateVlogEditPlan,
  reorderMaterialsByEditPlan,
  groupChapters,
  normalizeMood,
  wantsNarration,
}
