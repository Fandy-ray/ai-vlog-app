const path = require('path')
const fs = require('fs')
const express = require('express')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
const { generateMockVlog, registerUploadedMaterial } = require('../services/mockService')
const vivoVideoService = require('../services/vivoVideoService')
const ffmpegService = require('../services/ffmpegService')
const vlogAnalysisService = require('../services/vlogAnalysisService')
const vivoTtsService = require('../services/vivoTtsService')
const { produceDirectorVlog } = require('../services/vlogDirectorPipeline')
const { pickBgm } = require('../data/bgmCatalog')

const PHASE_LOGS = {
  analyze: '正在分析故事情绪…',
  story: '正在识别高光镜头与起承转合…',
  script: '正在撰写旁白…',
  music: '正在匹配章节音乐并保留环境声…',
  tts: '正在合成配音…',
  edit: '正在一次性渲染 720p 成片…',
  mix: '正在混音…',
  overlay: '正在添加片头…',
  finalize: '正在导出…',
}

const USE_VIDEO_GEN = process.env.VIVO_USE_VIDEO_GEN === 'true'

const router = express.Router()

const uploadDir = path.join(__dirname, '../../uploads')
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm'
    cb(null, `${Date.now()}-${uuidv4().slice(0, 8)}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 120 * 1024 * 1024 },
})

function parseManifest(raw) {
  if (!raw) return { type: 'study', style: 'cinematic', scenes: [] }
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw
  } catch {
    return { type: 'study', style: 'cinematic', scenes: [] }
  }
}

router.post('/vlog/generate', upload.array('clips', 12), async (req, res) => {
  const t0 = Date.now()
  const log = (msg) => console.log(`[vlog] +${((Date.now() - t0) / 1000).toFixed(1)}s ${msg}`)

  try {
    const manifest = parseManifest(req.body.manifest)
    const files = req.files || []
    log(`收到 ${files.length} 个素材，开始处理`)
    const materials = files.map((file, index) => {
      const sceneMeta = manifest.scenes?.[index] || {}
      const meta = registerUploadedMaterial({
        id: sceneMeta.clipId || `clip-${index + 1}`,
        type: manifest.type || 'study',
        name: sceneMeta.sceneTitle || file.originalname,
        duration: Number(sceneMeta.duration || 4),
        tags: ['vlog-learn', sceneMeta.sceneId || 'scene'].filter(Boolean),
        sortWeight: (index + 1) * 10,
        uri: `/uploads/${file.filename}`,
        source: 'vlog-learn',
        sceneId: sceneMeta.sceneId,
      })
      return { ...meta, filePath: file.path }
    })

    let analysis = null
    let workMaterials = materials
    let workPaths = materials.map((m) => m.filePath)

    if (files.length > 0) {
      analysis = await vlogAnalysisService.analyzeClips(
        materials.map(({ filePath, ...m }) => m),
        workPaths,
      )
      const filtered = vlogAnalysisService.filterPathsBySelection(
        materials.map(({ filePath, ...m }) => m),
        workPaths,
        analysis,
      )
      workMaterials = filtered.materials.map((m, i) => ({
        ...m,
        filePath: filtered.filePaths[i],
      }))
      workPaths = filtered.filePaths
    }

    let result = generateMockVlog({
      type: manifest.type,
      style: manifest.style,
      materials: workMaterials.map(({ filePath, ...m }) => m),
    })

    result.analysis = analysis

    let stitchedUrl = ''
    let stitchNote = ''
    let hasBgm = false
    let hasTts = false
    let hasBurnedSubtitles = false
    let hasBurnedTitle = false
    let ttsNote = ''
    let bgmSegmented = false
    let narrationText = (result.narration || '').trim()
    let safeTransition = 'fade'
    let directorOutput = null

    if (files.length > 0 && workPaths.length > 0) {
      const hasFfmpeg = await ffmpegService.checkFfmpeg()
      if (hasFfmpeg) {
        const outName = `vlog-${Date.now()}.mp4`
        const outPath = path.join(uploadDir, outName)
        try {
          const ttsWavPath = path.join(uploadDir, `tts-${Date.now()}.wav`)

          directorOutput = await produceDirectorVlog({
            workPaths,
            workMaterials,
            manifest,
            outPath,
            uploadDir,
            style: manifest.style || 'cinematic',
            analysis,
            hasTts: vivoTtsService.isConfigured(),
            onPhase: (phase) => log(PHASE_LOGS[phase] || phase),
            log: (msg) => log(msg),
            runTts: async (text) => {
              if (!vivoTtsService.isConfigured() || !text) {
                return { ok: false, reason: 'skipped' }
              }
              return vivoTtsService.synthesizeToWav(text, ttsWavPath, {
                style: manifest.style || 'cinematic',
              })
            },
          })

          const { plan } = directorOutput
          result.title = plan.title
          result.narration = directorOutput.narrationText
          narrationText = directorOutput.narrationText
          result.timeline = directorOutput.timeline
          safeTransition = directorOutput.safeTransition
          hasTts = directorOutput.hasTts
          hasBgm = directorOutput.segmentBgmPath
          bgmSegmented = directorOutput.segmentBgmPath
          hasBurnedTitle = directorOutput.hasBurnedTitle
          hasBurnedSubtitles = directorOutput.hasBurnedSubtitles
          ttsNote = directorOutput.hasTts ? `TTS(${directorOutput.ttsVcn || 'xiaofu'})` : ''

          log(
            `旁白（TTS 原文）：${narrationText.slice(0, 100)}${narrationText.length > 100 ? '…' : ''}`,
          )

          stitchedUrl = `/uploads/${outName}`
          const extras = [
            'AI导演剪辑',
            `${manifest.style || 'cinematic'} 调色`,
            safeTransition + ' 转场',
            hasTts ? ttsNote : '无 TTS',
            hasBgm ? '章节BGM' : '',
            hasBurnedTitle ? `片头「${plan.videoTitle}」` : '',
            hasBurnedSubtitles ? '电影字幕' : '',
          ]
            .filter(Boolean)
            .join(' · ')
          stitchNote = `已按导拍故事线合成 ${directorOutput.filePaths.length} 段：${extras}`
          log(stitchNote)
        } catch (ffmpegErr) {
          const detail =
            ffmpegErr.message || ffmpegService.trimExecError(ffmpegErr)
          console.error('[ffmpeg]', ffmpegErr.stderr || ffmpegErr.message || ffmpegErr)
          const salvageCandidates = fs
            .readdirSync(uploadDir)
            .filter((f) => f.startsWith('_dir-mix-') && f.endsWith('.mp4'))
            .map((f) => path.join(uploadDir, f))
            .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)
          if (salvageCandidates[0]) {
            const salvaged = `vlog-salvage-${Date.now()}.mp4`
            const salvagedPath = path.join(uploadDir, salvaged)
            fs.copyFileSync(salvageCandidates[0], salvagedPath)
            stitchedUrl = `/uploads/${salvaged}`
            stitchNote = `导出收尾失败，已使用已混音成片（${detail}）`
            log(stitchNote)
          } else {
            stitchNote = `合成失败，使用首段预览：${detail}`
            result.ai = result.ai || {}
            result.ai.stitchFailed = true
            result.ai.stitchError = detail
          }
        }
      } else {
        stitchNote = '服务器未安装 ffmpeg，使用首段素材预览（请在本机执行 brew install ffmpeg）'
      }
    }

    const bgm = pickBgm(manifest.style || 'cinematic')
    result.bgm = bgm

    let subtitleStart = 0
    result.subtitles = result.timeline.map((item, index) => {
      const cue = {
        startSec: subtitleStart,
        endSec: subtitleStart + item.duration,
        text: item.caption || item.shotTitle,
        sceneId: workMaterials[index]?.sceneId,
      }
      subtitleStart += item.duration
      return cue
    })

    result.effects = {
      colorGrade: manifest.style || 'cinematic',
      transition: ['fade', 'smooth', 'wipe'].includes(safeTransition) ? safeTransition : 'fade',
      hasBurnedSubtitles,
      hasBurnedTitle,
      hasBgm,
      hasTts,
      bgmSegmented,
    }
    result.ttsNarration = narrationText || result.narration

    if (directorOutput?.plan) {
      result.director = {
        provider: directorOutput.storyProvider,
        videoTitle: directorOutput.plan.videoTitle,
        storyArc: directorOutput.plan.storyArc,
        chapters: directorOutput.plan.chapters,
        styleHint: directorOutput.plan.styleHint,
        editOrder: directorOutput.plan.editOrder.map((e) => ({
          sceneId: e.sceneId,
          act: e.act,
          mood: e.mood,
          caption: e.caption,
        })),
      }
      result.ai = {
        provider: 'ai-director',
        style: manifest.style,
        styleHint: directorOutput.plan.styleHint,
        transition: safeTransition,
        stitchNote,
      }
    } else {
      result.ai = {
        provider: 'mock',
        style: manifest.style,
        stitchNote,
        message: '导演管线未完成，已回退预览',
      }
    }

    result.userClips = materials.map((m) => ({
      name: m.name,
      uri: m.uri,
      sceneId: m.sceneId,
    }))
    result.videoUrl = stitchedUrl || materials[0]?.uri || ''
    result.coverUrl = result.videoUrl

    if (USE_VIDEO_GEN && vivoVideoService.isConfigured()) {
      const videoGen = await vivoVideoService.generateVlogVideo({
        scenes: manifest.scenes || [],
        narration: result.narration,
      })
      if (videoGen.ok && videoGen.videoUrl) {
        result.aiVideoUrl = videoGen.videoUrl
        result.ai.demoVideoUrl = videoGen.videoUrl
        result.ai.videoGenNote = '（可选 demo）AI 生成片段，未替换实拍成片'
      } else if (videoGen.reason === 'rate_limit') {
        result.ai.videoGenError = '视频生成配额已用尽'
      }
    }

    log(`全部完成，总耗时 ${((Date.now() - t0) / 1000).toFixed(1)}s`)

    res.json({
      code: 0,
      message: 'vlog generated',
      data: result,
    })
  } catch (error) {
    console.error(error)
    const raw = error.message || '生成失败'
    const message = raw.length > 300 ? `${raw.slice(0, 300)}…` : raw
    res.status(500).json({
      code: 500,
      message,
    })
  }
})

module.exports = router
