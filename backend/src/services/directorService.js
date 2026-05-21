const { ARCHETYPES, TYPE_ARCHETYPE_IDS } = require('../data/directorSceneArchetypes')
const vivoService = require('./vivoService')

const THEME_ALIASES = {
  study: 'study',
  学习: 'study',
  学习vlog: 'study',
  '学习 vlog': 'study',
  campus: 'campus',
  校园: 'campus',
  daily: 'daily',
  日常: 'daily',
  一天: 'daily',
  一天vlog: 'daily',
  '一天 vlog': 'daily',
  travel: 'travel',
  旅游: 'travel',
  旅行: 'travel',
  food: 'food',
  美食: 'food',
  美食vlog: 'food',
}

const STYLE_ALIASES = {
  cinematic: 'cinematic',
  电影: 'cinematic',
  电影感: 'cinematic',
  japanese: 'japanese',
  日系: 'japanese',
  清新: 'japanese',
  study: 'study',
  学习风: 'study',
  'lo-fi': 'study',
  lofi: 'study',
  治愈: 'japanese',
  轻快: 'japanese',
  活泼: 'japanese',
}

function normalizeTheme(theme) {
  const raw = String(theme || '').trim().toLowerCase()
  for (const [key, type] of Object.entries(THEME_ALIASES)) {
    if (raw.includes(key.toLowerCase())) return type
  }
  if (/旅|游|出行|景点/.test(raw)) return 'travel'
  if (/食|餐|吃|咖啡|探店/.test(raw)) return 'food'
  if (/学|课|书|桌|专注/.test(raw)) return 'study'
  if (/一天|日常|生活|起床|周末/.test(raw)) return 'daily'
  return 'daily'
}

function normalizeStyleId(styleText, fallbackType) {
  const raw = String(styleText || '').trim().toLowerCase()
  for (const [key, id] of Object.entries(STYLE_ALIASES)) {
    if (raw.includes(key.toLowerCase())) return id
  }
  const typeFallback = {
    study: 'study',
    travel: 'cinematic',
    food: 'japanese',
    daily: 'cinematic',
    campus: 'japanese',
  }
  return typeFallback[fallbackType] || 'cinematic'
}

function buildSceneFromArchetype(archetypeId, index, theme, styleText) {
  const base = ARCHETYPES[archetypeId]
  if (!base) return null

  const id = `scene-${index + 1}-${archetypeId}`
  const themeLabel = String(theme || 'Vlog').trim().slice(0, 24)

  return {
    id,
    title: base.title,
    subtitle: `${base.subtitle}（${themeLabel}）`,
    subjectCells: base.subjectCells,
    accentCells: base.accentCells,
    gridSummary: base.gridSummary,
    aiPrompt: `${base.aiPrompt} 本片主题：${themeLabel}；风格倾向：${styleText || '自然真实'}.`,
    steps: base.steps.map((step) =>
      step.replace(/今天/g, themeLabel).replace(/主题/g, themeLabel),
    ),
  }
}

function buildMockDirectorPlan(theme, stylePreference, refinement = '') {
  const type = normalizeTheme(theme)
  const styleId = normalizeStyleId(stylePreference, type)
  const archetypeIds = TYPE_ARCHETYPE_IDS[type] || TYPE_ARCHETYPE_IDS.daily
  const refineNote = String(refinement || '').trim()

  const scenes = archetypeIds
    .map((aid, i) => {
      const scene = buildSceneFromArchetype(aid, i, theme, stylePreference)
      if (scene && refineNote) {
        return {
          ...scene,
          subtitle: `${scene.subtitle}｜按你的要求：${refineNote.slice(0, 48)}`,
          aiPrompt: `${scene.aiPrompt} 补充：${refineNote.slice(0, 80)}`,
        }
      }
      return scene
    })
    .filter(Boolean)

  const typeTitles = {
    study: '学习记录',
    travel: '旅行日记',
    food: '美食探店',
    daily: '一天生活',
    campus: '校园日常',
  }

  return {
    projectTitle: `${String(theme).trim() || typeTitles[type]} · AI 导拍`,
    type,
    styleId,
    stylePreference: String(stylePreference || '').trim(),
    theme: String(theme || '').trim(),
    provider: 'mock',
    scenes,
  }
}

function buildDirectorPrompt(theme, stylePreference, options = {}) {
  const refinement = String(options.refinement || '').trim()
  const previousScenes = options.previousScenes || []

  let revisionBlock = ''
  if (refinement) {
    revisionBlock += `\n【用户补充要求（必须优先满足，可推翻上一版）】\n${refinement}\n`
  }
  if (previousScenes.length) {
    revisionBlock += `\n【上一版导拍场景（仅供参考，可按用户要求重写）】\n${previousScenes
      .map((s, i) => `${i + 1}. ${s.title}：${s.subtitle}`)
      .join('\n')}\n`
  }
  if (refinement) {
    revisionBlock +=
      '\n请根据补充要求重新设计 5–6 个场景，场景数量、标题、构图可与上一版不同。\n'
  }

  return `你是专业竖屏 Vlog 导演，擅长九宫格构图导拍。
用户想拍的主题：${theme}
用户喜欢的成片风格描述：${stylePreference}
${revisionBlock}
请设计 5–6 个拍摄场景，每个场景必须包含竖屏九宫格构图（格子编号 1–9，从左到右、从上到下）。
请严格只输出 JSON（不要 markdown），格式：
{
  "projectTitle": "本次拍摄项目名称",
  "styleId": "cinematic 或 japanese 或 study",
  "scenes": [
    {
      "id": "scene-1",
      "title": "场景标题",
      "subtitle": "一句话说明拍什么",
      "subjectCells": [4],
      "accentCells": [3, 6],
      "gridSummary": "九宫格构图说明",
      "aiPrompt": "给拍摄者的 AI 导播一句话",
      "steps": ["步骤1", "步骤2", "步骤3"]
    }
  ]
}`
}

function sanitizeScenes(scenes, theme, stylePreference) {
  if (!Array.isArray(scenes) || !scenes.length) return null

  return scenes.slice(0, 8).map((s, i) => ({
    id: String(s.id || `scene-${i + 1}`).replace(/[^a-zA-Z0-9-_]/g, '') || `scene-${i + 1}`,
    title: String(s.title || `场景 ${i + 1}`).slice(0, 40),
    subtitle: String(s.subtitle || '').slice(0, 80),
    subjectCells: Array.isArray(s.subjectCells) && s.subjectCells.length ? s.subjectCells : [5],
    accentCells: Array.isArray(s.accentCells) ? s.accentCells : undefined,
    gridSummary: String(s.gridSummary || '主体放在画面中心略偏下。').slice(0, 300),
    aiPrompt: String(s.aiPrompt || `围绕「${theme}」主题拍摄。风格：${stylePreference}`).slice(0, 400),
    steps: Array.isArray(s.steps) && s.steps.length
      ? s.steps.map((x) => String(x).slice(0, 120)).slice(0, 6)
      : ['稳定持机', '先构图再按快门', '连拍 4–6 秒'],
  }))
}

async function generateDirectorPlan({
  theme,
  stylePreference,
  refinement,
  previousScenes,
}) {
  const themeStr = String(theme || '').trim()
  const styleStr = String(stylePreference || '').trim()
  const refineStr = String(refinement || '').trim()
  const prevScenes = Array.isArray(previousScenes) ? previousScenes : []

  if (!themeStr) {
    return { ok: false, reason: 'theme_required', message: '请填写 Vlog 主题' }
  }

  if (vivoService.isConfigured()) {
    try {
      const prompt = buildDirectorPrompt(themeStr, styleStr, {
        refinement: refineStr,
        previousScenes: prevScenes,
      })
      const { content } = await vivoService.chatCompletion(prompt)
      const parsed = vivoService.extractJson(content)

      if (parsed?.scenes?.length) {
        const type = normalizeTheme(themeStr)
        const styleId = ['cinematic', 'japanese', 'study'].includes(parsed.styleId)
          ? parsed.styleId
          : normalizeStyleId(styleStr, type)

        return {
          ok: true,
          data: {
            projectTitle: String(parsed.projectTitle || `${themeStr} · AI 导拍`).slice(0, 60),
            type,
            styleId,
            stylePreference: styleStr,
            theme: themeStr,
            provider: 'vivo-bluelm-chat',
            scenes: sanitizeScenes(parsed.scenes, themeStr, styleStr),
          },
        }
      }
    } catch (err) {
      const status = err.response?.status
      const hint = status === 404 ? '（请确认 .env 使用 /v1/chat/completions）' : ''
      console.warn('[director] AI 导拍方案失败，使用本地模板:', err.message, hint)
    }
  }

  return {
    ok: true,
    data: buildMockDirectorPlan(themeStr, styleStr, refineStr),
    fallback: !vivoService.isConfigured(),
  }
}

module.exports = {
  generateDirectorPlan,
  normalizeTheme,
  normalizeStyleId,
}
