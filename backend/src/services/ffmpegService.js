const { execFile } = require('child_process')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const { renderSubtitlePng, renderTitlePng } = require('./subtitleRenderService')

const execFileAsync = promisify(execFile)

const OUT_W = 720
const OUT_H = 1280
const OUT_FPS = 30
const ENCODE_PRESET = 'veryfast'
const ENCODE_CRF = '24'

const PORTRAIT_VF =
  `scale=${OUT_W}:${OUT_H}:force_original_aspect_ratio=decrease,pad=${OUT_W}:${OUT_H}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${OUT_FPS},format=yuv420p`

/** 横屏：低分辨率模糊底 + 居中清晰主体，避免强行拉伸 */
const LANDSCAPE_VF =
  `split=2[fg][tmp];[tmp]scale=${OUT_W}:${OUT_H}:force_original_aspect_ratio=increase,crop=${OUT_W}:${OUT_H},scale=360:640,boxblur=8:4,scale=${OUT_W}:${OUT_H}[bg];[fg]scale=680:-2:force_original_aspect_ratio=decrease[ov];[bg][ov]overlay=(W-w)/2:(H-h)/2,setsar=1,fps=${OUT_FPS},format=yuv420p`

/** FFmpeg 8.x curves 仅支持: none, lighter, darker, vintage 等，勿用已废弃的 soft_knee / linear */
const STYLE_FILTERS = {
  cinematic:
    'eq=contrast=1.12:brightness=0.02:saturation=1.12,curves=preset=lighter,vignette=angle=PI/5',
  japanese: 'eq=brightness=0.06:saturation=0.9:gamma=1.06,curves=preset=lighter',
  study: 'eq=contrast=1.06:brightness=0.05:saturation=0.82,curves=preset=linear_contrast',
}

const STYLE_FILTERS_FALLBACK = {
  cinematic: 'eq=contrast=1.12:brightness=0.02:saturation=1.12',
  japanese: 'eq=brightness=0.06:saturation=0.9:gamma=1.06',
  study: 'eq=contrast=1.06:brightness=0.05:saturation=0.82',
}

const TRANSITIONS = {
  fade: 'fade',
  smooth: 'smoothleft',
  wipe: 'wiperight',
}

const EXEC_OPTS = { maxBuffer: 48 * 1024 * 1024 }
const XFADE_SEC = 0.45

async function checkFfmpeg() {
  try {
    await execFileAsync('ffmpeg', ['-version'], EXEC_OPTS)
    return true
  } catch {
    return false
  }
}

function trimExecError(err) {
  const stderr = err.stderr || err.stdout || err.message || ''
  const lines = String(stderr).split('\n').filter((l) => l.trim())
  const last = lines.slice(-3).join(' ')
  return last.slice(0, 200) || 'ffmpeg 处理失败'
}

async function probeVideoMeta(filePath) {
  try {
    const { stdout } = await execFileAsync(
      'ffprobe',
      [
        '-v',
        'error',
        '-select_streams',
        'v:0',
        '-show_entries',
        'stream=width,height',
        '-of',
        'csv=p=0:s=x',
        filePath,
      ],
      EXEC_OPTS,
    )
    const parts = String(stdout).trim().split('x')
    const width = parseInt(parts[0], 10) || 1080
    const height = parseInt(parts[1], 10) || 1920
    const orientation = width > height * 1.08 ? 'landscape' : 'portrait'
    return { width, height, orientation }
  } catch {
    return { width: 1080, height: 1920, orientation: 'portrait' }
  }
}

async function getVideoDuration(filePath) {
  try {
    const { stdout } = await execFileAsync(
      'ffprobe',
      [
        '-v',
        'error',
        '-show_entries',
        'format=duration',
        '-of',
        'default=noprint_wrappers=1:nokey=1',
        filePath,
      ],
      EXEC_OPTS,
    )
    const sec = parseFloat(String(stdout).trim())
    return Number.isFinite(sec) && sec > 0 ? sec : 4
  } catch {
    return 4
  }
}

function colorGradeFilter(style) {
  const key = STYLE_FILTERS[style] ? style : 'cinematic'
  return STYLE_FILTERS_FALLBACK[key] || STYLE_FILTERS_FALLBACK.cinematic
}

async function transcodeClipToMp4(inputPath, outputPath, style = 'cinematic') {
  const meta = await probeVideoMeta(inputPath)
  const isLandscape = meta.orientation === 'landscape'
  const grade = colorGradeFilter(style)
  const layoutVf = isLandscape ? LANDSCAPE_VF : PORTRAIT_VF
  const vf = `${layoutVf},${grade},format=yuv420p`

  const baseArgs = [
    '-y',
    '-fflags',
    '+genpts+igndts',
    '-err_detect',
    'ignore_err',
    '-i',
    inputPath,
    '-c:v',
    'libx264',
    '-preset',
    ENCODE_PRESET,
    '-crf',
    ENCODE_CRF,
    '-movflags',
    '+faststart',
  ]

  const withVideo = [...baseArgs, '-vf', vf]

  try {
    await execFileAsync(
      'ffmpeg',
      [...withVideo, '-c:a', 'aac', '-b:a', '128k', '-ar', '44100', '-ac', '2', '-shortest', outputPath],
      EXEC_OPTS,
    )
  } catch {
    await execFileAsync('ffmpeg', [...withVideo, '-an', outputPath], EXEC_OPTS)
  }

  if (!(await probeHasAudio(outputPath))) {
    const tmpA = `${outputPath}.silent.mp4`
    try {
      await execFileAsync(
        'ffmpeg',
        [
          '-y',
          '-i',
          outputPath,
          '-f',
          'lavfi',
          '-i',
          'anullsrc=r=44100:cl=stereo',
          '-c:v',
          'copy',
          '-c:a',
          'aac',
          '-b:a',
          '128k',
          '-shortest',
          tmpA,
        ],
        EXEC_OPTS,
      )
      fs.copyFileSync(tmpA, outputPath)
    } finally {
      if (fs.existsSync(tmpA)) fs.unlinkSync(tmpA)
    }
  }
}

async function runStyleEncode(inputPath, outputPath, vf, withAudio) {
  const args = [
    '-y',
    '-i',
    inputPath,
    '-vf',
    vf,
    '-c:v',
    'libx264',
    '-preset',
    ENCODE_PRESET,
    '-crf',
    ENCODE_CRF,
    '-movflags',
    '+faststart',
    outputPath,
  ]
  if (withAudio) {
    args.splice(-1, 0, '-c:a', 'aac', '-b:a', '128k')
  } else {
    args.splice(-1, 0, '-an')
  }
  await execFileAsync('ffmpeg', args, EXEC_OPTS)
}

async function applyStyleAndFinalize(inputPath, outputPath, style) {
  const key = STYLE_FILTERS[style] ? style : 'cinematic'
  const vfPrimary = `${STYLE_FILTERS[key]},format=yuv420p`
  const vfFallback = `${STYLE_FILTERS_FALLBACK[key] || STYLE_FILTERS_FALLBACK.cinematic},format=yuv420p`

  try {
    await runStyleEncode(inputPath, outputPath, vfPrimary, true)
  } catch {
    try {
      await runStyleEncode(inputPath, outputPath, vfPrimary, false)
    } catch {
      try {
        await runStyleEncode(inputPath, outputPath, vfFallback, true)
      } catch {
        await runStyleEncode(inputPath, outputPath, vfFallback, false)
      }
    }
  }
}

async function concatWithXfade(inputPaths, outputPath, transitionName) {
  const t = TRANSITIONS[transitionName] || TRANSITIONS.fade
  const durations = await Promise.all(inputPaths.map((p) => getVideoDuration(p)))
  const inputs = inputPaths.flatMap((p) => ['-i', p])

  const filter =
    inputPaths.length === 2
      ? `[0:v][1:v]xfade=transition=${t}:duration=${XFADE_SEC}:offset=${Math.max(0.1, durations[0] - XFADE_SEC).toFixed(3)}[vout];[0:a][1:a]acrossfade=d=${XFADE_SEC}[aout]`
      : buildMultiXfade(inputPaths.length, durations, t)

  try {
    await execFileAsync(
      'ffmpeg',
      [
        '-y',
        ...inputs,
        '-filter_complex',
        filter,
        '-map',
        '[vout]',
        '-map',
        '[aout]',
        '-c:v',
        'libx264',
        '-preset',
        ENCODE_PRESET,
        '-crf',
        ENCODE_CRF,
        '-c:a',
        'aac',
        '-movflags',
        '+faststart',
        outputPath,
      ],
      EXEC_OPTS,
    )
  } catch (err) {
    console.warn('[ffmpeg] xfade 失败，改用 concat 拼接:', trimExecError(err))
    const listPath = `${outputPath}.list.txt`
    const listContent = inputPaths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n')
    fs.writeFileSync(listPath, listContent, 'utf8')
    try {
      await execFileAsync(
        'ffmpeg',
        ['-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-c', 'copy', '-movflags', '+faststart', outputPath],
        EXEC_OPTS,
      )
    } finally {
      if (fs.existsSync(listPath)) fs.unlinkSync(listPath)
    }
  }

  return outputPath
}

function buildMultiXfade(n, durations, transition) {
  const parts = []
  let vPrevLabel = '0:v'
  let offset = durations[0] - XFADE_SEC

  for (let i = 1; i < n; i++) {
    const vOut = i === n - 1 ? 'vout' : `vx${i}`
    parts.push(
      `[${vPrevLabel}][${i}:v]xfade=transition=${transition}:duration=${XFADE_SEC}:offset=${Math.max(0.1, offset).toFixed(3)}[${vOut}]`,
    )
    vPrevLabel = vOut
    offset += durations[i] - XFADE_SEC
  }

  const aParts = Array.from({ length: n }, (_, i) => `[${i}:a]`).join('')
  parts.push(`${aParts}concat=n=${n}:v=0:a=1[aout]`)
  return parts.join(';')
}

/** 多段顺序拼接（-c copy，最稳定） */
async function concatClipsDemuxer(inputPaths, outputPath) {
  const listPath = `${outputPath}.list.txt`
  const listContent = inputPaths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n')
  fs.writeFileSync(listPath, listContent, 'utf8')
  try {
    await execFileAsync(
      'ffmpeg',
      [
        '-y',
        '-f',
        'concat',
        '-safe',
        '0',
        '-i',
        listPath,
        '-c',
        'copy',
        '-movflags',
        '+faststart',
        outputPath,
      ],
      EXEC_OPTS,
    )
  } finally {
    if (fs.existsSync(listPath)) fs.unlinkSync(listPath)
  }
  return outputPath
}

/**
 * 转码 → 拼接 → 风格调色
 */
async function concatClips(inputPaths, outputPath, options = {}) {
  if (!inputPaths.length) {
    throw new Error('没有可拼接的视频文件')
  }

  const style = options.style || 'cinematic'
  const transition = options.transition || 'fade'
  const workDir = path.dirname(outputPath)
  const tempMp4s = new Array(inputPaths.length)

  try {
    await Promise.all(
      inputPaths.map(async (inputPath, i) => {
        const tempOut = path.join(
          workDir,
          `_part-${i}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}.mp4`,
        )
        await transcodeClipToMp4(inputPath, tempOut, style)
        tempMp4s[i] = tempOut
      }),
    )

    if (tempMp4s.length === 1) {
      fs.copyFileSync(tempMp4s[0], outputPath)
    } else {
      try {
        await concatWithXfade(tempMp4s, outputPath, transition)
      } catch (err) {
        console.warn('[ffmpeg] xfade 失败，改用顺序拼接:', trimExecError(err))
        await concatClipsDemuxer(tempMp4s, outputPath)
      }
    }

    return outputPath
  } finally {
    tempMp4s.forEach((p) => {
      if (fs.existsSync(p)) fs.unlinkSync(p)
    })
  }
}

const FONT_CANDIDATES = [
  '/Library/Fonts/Arial Unicode.ttf',
  '/System/Library/Fonts/Supplemental/Arial Unicode.ttf',
  '/System/Library/Fonts/STHeiti Light.ttc',
  '/System/Library/Fonts/Hiragino Sans GB.ttc',
  '/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc',
]

function resolveFontFile() {
  for (const p of FONT_CANDIDATES) {
    if (fs.existsSync(p)) return p
  }
  return null
}

async function probeHasAudio(filePath) {
  try {
    const { stdout } = await execFileAsync(
      'ffprobe',
      [
        '-v',
        'error',
        '-select_streams',
        'a',
        '-show_entries',
        'stream=codec_type',
        '-of',
        'csv=p=0',
        filePath,
      ],
      EXEC_OPTS,
    )
    return String(stdout).trim().length > 0
  } catch {
    return false
  }
}

async function ensureBgmTrack(style, durationSec, workDir) {
  const dur = Math.ceil(durationSec) + 8
  const bgmPath = path.join(workDir, `_bgm-${style}-${dur}s.m4a`)

  const profiles = {
    cinematic: [196, 246.94, 293.66],
    japanese: [220, 277.18, 329.63],
    study: [174.61, 220, 261.63],
  }
  const freqs = profiles[style] || profiles.cinematic
  const fadeOut = Math.max(2, dur - 3)

  await execFileAsync(
    'ffmpeg',
    [
      '-y',
      '-f',
      'lavfi',
      '-i',
      `sine=frequency=${freqs[0]}:duration=${dur},volume=0.55,tremolo=f=2.5:d=0.35`,
      '-f',
      'lavfi',
      '-i',
      `sine=frequency=${freqs[1]}:duration=${dur},volume=0.42,tremolo=f=3.2:d=0.4`,
      '-f',
      'lavfi',
      '-i',
      `sine=frequency=${freqs[2]}:duration=${dur},volume=0.32,tremolo=f=1.8:d=0.3`,
      '-f',
      'lavfi',
      '-i',
      `anoisesrc=duration=${dur}:color=pink:sample_rate=44100:amplitude=0.06`,
      '-filter_complex',
      `[0:a][1:a][2:a][3:a]amix=inputs=4:duration=first:dropout_transition=0,volume=2.2,lowpass=f=2800,afade=t=in:d=2,afade=t=out:st=${fadeOut}:d=2,alimiter=limit=0.92`,
      '-c:a',
      'aac',
      '-b:a',
      '160k',
      '-ar',
      '44100',
      bgmPath,
    ],
    EXEC_OPTS,
  )

  return bgmPath
}

async function mixBgm(videoPath, outputPath, style) {
  const duration = await getVideoDuration(videoPath)
  const workDir = path.dirname(outputPath)
  const bgmPath = await ensureBgmTrack(style, duration, workDir)
  const hasAudio = await probeHasAudio(videoPath)
  const fadeOut = Math.max(1, duration - 2).toFixed(2)

  if (hasAudio) {
    await execFileAsync(
      'ffmpeg',
      [
        '-y',
        '-i',
        videoPath,
        '-i',
        bgmPath,
        '-filter_complex',
        `[1:a]aloop=loop=-1:size=2e+09,atrim=0:${duration.toFixed(3)},volume=0.85,afade=t=in:d=1,afade=t=out:st=${fadeOut}:d=2[bgm];[0:a]volume=1[orig];[orig][bgm]amix=inputs=2:duration=first:dropout_transition=2:weights=1 1.2:normalize=1[aout]`,
        '-map',
        '0:v',
        '-map',
        '[aout]',
        '-c:v',
        'copy',
        '-c:a',
        'aac',
        '-b:a',
        '160k',
        '-movflags',
        '+faststart',
        '-shortest',
        outputPath,
      ],
      EXEC_OPTS,
    )
  } else {
    await execFileAsync(
      'ffmpeg',
      [
        '-y',
        '-i',
        videoPath,
        '-i',
        bgmPath,
        '-filter_complex',
        `[1:a]atrim=0:${duration.toFixed(3)},volume=1.1,afade=t=in:d=1,afade=t=out:st=${fadeOut}:d=2[bgm]`,
        '-map',
        '0:v',
        '-map',
        '[bgm]',
        '-c:v',
        'copy',
        '-c:a',
        'aac',
        '-b:a',
        '160k',
        '-movflags',
        '+faststart',
        '-shortest',
        outputPath,
      ],
      EXEC_OPTS,
    )
  }

  return outputPath
}

function buildSubtitleCues(timeline) {
  if (!timeline?.length) return []

  let start = 0
  const cues = []
  for (const item of timeline) {
    const dur = Math.max(0.5, Number(item.duration) || 4)
    const end = start + dur
    const text = String(item.caption || '').trim()
    if (text) {
      cues.push({ start, end, text })
    }
    start = end
  }
  return cues
}

function buildOverlayCues(timeline, titleText, titleDurationSec = 4, titleFadeSec = 1.2) {
  const cues = []
  if (titleText) {
    cues.push({
      start: 0,
      end: Math.max(2, titleDurationSec),
      text: titleText,
      variant: 'title',
      y: 120,
      fadeSec: titleFadeSec,
    })
  }
  const titleEnd = titleText ? Math.max(2, titleDurationSec) : 0
  const captionCues = buildSubtitleCues(timeline)
    .map((c) => ({
      ...c,
      start: Math.max(c.start, titleEnd),
      variant: 'caption',
      y: null,
    }))
    .filter((c) => c.end > c.start + 0.2)
  return cues.concat(captionCues)
}

async function burnVideoOverlays(videoPath, outputPath, options = {}) {
  const timeline = options.timeline || []
  const titleText = String(options.titleText || '').trim()
  const cues = buildOverlayCues(
    timeline,
    titleText,
    options.titleDurationSec ?? 3.5,
    options.titleFadeSec ?? 1.2,
  )

  if (!cues.length) {
    fs.copyFileSync(videoPath, outputPath)
    return false
  }

  const workDir = path.dirname(outputPath)
  const temps = []
  let current = videoPath
  const hasAudio = await probeHasAudio(videoPath)

  try {
    for (let i = 0; i < cues.length; i++) {
      const cue = cues[i]
      const pngPath = path.join(workDir, `_ovl-${Date.now()}-${i}.png`)
      const passOut =
        i === cues.length - 1 ? outputPath : path.join(workDir, `_ovlpass-${Date.now()}-${i}.mp4`)

      if (cue.variant === 'title') {
        await renderTitlePng(cue.text, pngPath, {
          cinematic: options.cinematicTitle !== false,
        })
      } else {
        await renderSubtitlePng(cue.text, pngPath)
      }
      temps.push(pngPath)

      const yPos = cue.variant === 'title' ? cue.y ?? 120 : 'H-h-100'
      const enable = `between(t,${cue.start.toFixed(3)},${cue.end.toFixed(3)})`
      const fadeIn = cue.fadeSec || 1
      const fadeOutStart = Math.max(cue.start + fadeIn, cue.end - fadeIn)
      const overlayFilter =
        cue.variant === 'title'
          ? `[1:v]fade=t=in:st=0:d=${fadeIn}:alpha=1,fade=t=out:st=${(fadeOutStart - cue.start).toFixed(2)}:d=${fadeIn}:alpha=1[ov];[0:v][ov]overlay=(W-w)/2:${yPos}:enable='${enable}'[vout]`
          : `[0:v][1:v]overlay=(W-w)/2:${yPos}:enable='${enable}'[vout]`

      const args = [
        '-y',
        '-i',
        current,
        '-i',
        pngPath,
        '-filter_complex',
        overlayFilter,
        '-map',
        '[vout]',
      ]
      if (hasAudio) {
        args.push('-map', '0:a', '-c:a', 'copy')
      } else {
        args.push('-an')
      }
      args.push(
        '-c:v',
        'libx264',
        '-preset',
        'ultrafast',
        '-crf',
        '23',
        '-movflags',
        '+faststart',
        passOut,
      )

      await execFileAsync('ffmpeg', args, EXEC_OPTS)

      if (current !== videoPath && current !== outputPath) {
        temps.push(current)
      }
      current = passOut
    }

    return true
  } finally {
    temps.forEach((p) => {
      if (fs.existsSync(p) && p !== outputPath && p !== videoPath) {
        try {
          fs.unlinkSync(p)
        } catch {
          /* ignore */
        }
      }
    })
  }
}

async function burnSubtitles(videoPath, outputPath, timeline) {
  const cues = buildSubtitleCues(timeline)
  if (!cues.length) {
    fs.copyFileSync(videoPath, outputPath)
    return false
  }

  const workDir = path.dirname(outputPath)
  const temps = []
  let current = videoPath
  const hasAudio = await probeHasAudio(videoPath)

  try {
    for (let i = 0; i < cues.length; i++) {
      const cue = cues[i]
      const pngPath = path.join(workDir, `_sub-${Date.now()}-${i}.png`)
      const passOut =
        i === cues.length - 1 ? outputPath : path.join(workDir, `_subpass-${Date.now()}-${i}.mp4`)

      await renderSubtitlePng(cue.text, pngPath)
      temps.push(pngPath)

      const enable = `between(t,${cue.start.toFixed(3)},${cue.end.toFixed(3)})`
      const args = [
        '-y',
        '-i',
        current,
        '-i',
        pngPath,
        '-filter_complex',
        `[0:v][1:v]overlay=(W-w)/2:H-h-100:enable='${enable}'[vout]`,
        '-map',
        '[vout]',
      ]
      if (hasAudio) {
        args.push('-map', '0:a', '-c:a', 'copy')
      } else {
        args.push('-an')
      }
      args.push(
        '-c:v',
        'libx264',
        '-preset',
        'ultrafast',
        '-crf',
        '23',
        '-movflags',
        '+faststart',
        passOut,
      )

      await execFileAsync('ffmpeg', args, EXEC_OPTS)

      if (current !== videoPath && current !== outputPath) {
        temps.push(current)
      }
      current = passOut
    }

    return true
  } finally {
    temps.forEach((p) => {
      if (fs.existsSync(p) && p !== outputPath && p !== videoPath) {
        try {
          fs.unlinkSync(p)
        } catch {
          /* ignore */
        }
      }
    })
  }
}

async function muxBgmTrack(videoPath, bgmPath, outputPath, options = {}) {
  const duration = await getVideoDuration(videoPath)
  const fadeOut = Math.max(1, duration - 2).toFixed(2)
  const hasAudio = await probeHasAudio(videoPath)

  const filter = hasAudio
    ? `[1:a]aloop=loop=-1:size=2e+09,atrim=0:${duration.toFixed(3)},volume=${options.bgmVolume ?? 0.72},afade=t=in:d=1,afade=t=out:st=${fadeOut}:d=2[bgm];[0:a]volume=0.35[orig];[orig][bgm]amix=inputs=2:duration=first:dropout_transition=2:weights=0.8 1.2:normalize=1[aout]`
    : `[1:a]atrim=0:${duration.toFixed(3)},volume=0.85,afade=t=in:d=1,afade=t=out:st=${fadeOut}:d=2[aout]`

  await execFileAsync(
    'ffmpeg',
    [
      '-y',
      '-i',
      videoPath,
      '-i',
      bgmPath,
      '-filter_complex',
      filter,
      '-map',
      '0:v',
      '-map',
      '[aout]',
      '-c:v',
      'copy',
      '-c:a',
      'aac',
      '-b:a',
      '160k',
      '-movflags',
      '+faststart',
      '-shortest',
      outputPath,
    ],
    EXEC_OPTS,
  )

  return outputPath
}

async function muxNarrationAudio(videoPath, narrationWav, outputPath, options = {}) {
  const duration = await getVideoDuration(videoPath)
  const bgmPath = options.bgmPath

  if (bgmPath && fs.existsSync(bgmPath)) {
    const fadeOut = Math.max(1, duration - 2).toFixed(2)
    await execFileAsync(
      'ffmpeg',
      [
        '-y',
        '-i',
        videoPath,
        '-i',
        narrationWav,
        '-i',
        bgmPath,
        '-filter_complex',
        `[2:a]aloop=loop=-1:size=2e+09,atrim=0:${duration.toFixed(3)},volume=${options.bgmVolume ?? 0.72},afade=t=in:d=1,afade=t=out:st=${fadeOut}:d=2[bgm];[1:a]volume=0.92,acompressor=threshold=-18dB:ratio=3:attack=5:release=80[nar];[bgm][nar]amix=inputs=2:duration=first:dropout_transition=2:weights=1.35 1:normalize=1[aout]`,
        '-map',
        '0:v',
        '-map',
        '[aout]',
        '-c:v',
        'copy',
        '-c:a',
        'aac',
        '-b:a',
        '160k',
        '-movflags',
        '+faststart',
        '-shortest',
        outputPath,
      ],
      EXEC_OPTS,
    )
  } else {
    await execFileAsync(
      'ffmpeg',
      [
        '-y',
        '-i',
        videoPath,
        '-i',
        narrationWav,
        '-map',
        '0:v',
        '-map',
        '1:a',
        '-c:v',
        'copy',
        '-c:a',
        'aac',
        '-b:a',
        '160k',
        '-movflags',
        '+faststart',
        '-shortest',
        outputPath,
      ],
      EXEC_OPTS,
    )
  }

  return outputPath
}

/**
 * 拼接 →（vivo TTS 旁白 + 可选轻 BGM）→ 不烧录字幕
 */
async function produceFinalVlog(inputPaths, outputPath, options = {}) {
  const rawPath = `${outputPath}.stitched.mp4`
  const withAudioPath = `${outputPath}.audio.mp4`
  const meta = { hasBgm: false, hasTts: false, hasSubtitles: false }
  const skipPremixAudio = options.skipPremixAudio === true

  await concatClips(inputPaths, rawPath, {
    style: options.style || 'cinematic',
    transition: options.transition || 'fade',
  })

  const style = options.style || 'cinematic'
  const narrationWav = options.narrationAudioPath

  if (narrationWav && fs.existsSync(narrationWav)) {
    let bgmPath = null
    if (options.includeBgm !== false) {
      try {
        const duration = await getVideoDuration(rawPath)
        bgmPath = await ensureBgmTrack(style, duration, path.dirname(outputPath))
      } catch {
        /* optional bed */
      }
    }
    try {
      await muxNarrationAudio(rawPath, narrationWav, withAudioPath, {
        bgmPath,
        bgmVolume: 0.72,
      })
      meta.hasTts = true
      meta.hasBgm = !!bgmPath
      console.log('[ffmpeg] vivo TTS 旁白已混入', bgmPath ? '+ BGM(约72%垫音)' : '')
    } catch (err) {
      console.error('[ffmpeg] TTS 混音失败:', trimExecError(err))
      fs.copyFileSync(rawPath, withAudioPath)
    }
  } else if (skipPremixAudio) {
    fs.copyFileSync(rawPath, withAudioPath)
    console.log('[ffmpeg] 仅拼接画面，等待 TTS 再混音')
  } else {
    try {
      await mixBgm(rawPath, withAudioPath, style)
      meta.hasBgm = true
      console.log('[ffmpeg] 氛围 BGM 混入成功')
    } catch (err) {
      console.error('[ffmpeg] BGM 混入失败:', trimExecError(err))
      fs.copyFileSync(rawPath, withAudioPath)
    }
  }

  fs.copyFileSync(withAudioPath, outputPath)

  if (fs.existsSync(rawPath)) fs.unlinkSync(rawPath)
  if (fs.existsSync(withAudioPath) && withAudioPath !== outputPath) {
    fs.unlinkSync(withAudioPath)
  }

  return { outputPath, ...meta }
}

/** 在已拼接成片上叠加 TTS 旁白（可选轻 BGM） */
async function remixWithNarration(videoPath, narrationWav, outputPath, options = {}) {
  const style = options.style || 'cinematic'
  const workDir = path.dirname(outputPath)
  let bgmPath = options.bgmPath || null

  if (!bgmPath && options.includeBgm !== false) {
    try {
      const duration = await getVideoDuration(videoPath)
      bgmPath = await ensureBgmTrack(style, duration, workDir)
    } catch (err) {
      console.error('[ffmpeg] BGM 轨生成失败:', trimExecError(err))
    }
  }

  const tmp = `${outputPath}.remix.tmp.mp4`
  await muxNarrationAudio(videoPath, narrationWav, tmp, { bgmPath, bgmVolume: 0.72 })
  fs.copyFileSync(tmp, outputPath)
  if (fs.existsSync(tmp)) fs.unlinkSync(tmp)

  const bgmNote = options.bgmSegmented ? '(分段 BGM 已叠加)' : '(BGM 轨已叠加)'
  console.log('[ffmpeg] TTS+BGM 混音完成', bgmPath ? bgmNote : '(无 BGM 轨)')
  return { hasTts: true, hasBgm: !!bgmPath }
}

/**
 * 混音：保留环境声 + 章节 BGM（侧链压低）+ 可选 TTS
 */
async function muxDirectorFinalAudio(videoPath, outputPath, options = {}) {
  const duration = await getVideoDuration(videoPath)
  const hasOrig = await probeHasAudio(videoPath)
  const bgmPath = options.bgmPath
  const narrationPath = options.narrationPath
  const ambientGain = Math.max(0.2, Math.min(1, options.ambientGain ?? 0.52))
  const bgmGain = options.bgmGain ?? 0.62
  const fadeOut = Math.max(1, duration - 1.5).toFixed(2)

  if (!bgmPath && !narrationPath) {
    fs.copyFileSync(videoPath, outputPath)
    return { hasBgm: false, hasTts: false, hasAmbient: hasOrig }
  }

  if (!hasOrig && bgmPath && fs.existsSync(bgmPath) && !narrationPath) {
    const fadeOut = Math.max(1, duration - 1.5).toFixed(2)
    await execFileAsync(
      'ffmpeg',
      [
        '-y',
        '-i',
        videoPath,
        '-i',
        bgmPath,
        '-filter_complex',
        `[1:a]aloop=loop=-1:size=2e+09,atrim=0:${duration.toFixed(3)},volume=${Math.min(1.1, bgmGain + 0.15)},afade=t=in:d=0.8,afade=t=out:st=${fadeOut}:d=1.5[bgm]`,
        '-map',
        '0:v',
        '-map',
        '[bgm]',
        '-c:v',
        'copy',
        '-c:a',
        'aac',
        '-b:a',
        '128k',
        '-movflags',
        '+faststart',
        '-shortest',
        outputPath,
      ],
      EXEC_OPTS,
    )
    return { hasBgm: true, hasTts: false, hasAmbient: false }
  }

  const inputs = ['-i', videoPath]
  const filters = []
  let idx = 1
  let mixInputs = []

  if (hasOrig) {
    filters.push(`[0:a]volume=${ambientGain},highpass=f=80,lowpass=f=12000[amb]`)
    mixInputs.push('[amb]')
  }

  if (bgmPath && fs.existsSync(bgmPath)) {
    inputs.push('-i', bgmPath)
    filters.push(
      `[${idx}:a]aloop=loop=-1:size=2e+09,atrim=0:${duration.toFixed(3)},volume=${bgmGain},afade=t=in:d=0.8,afade=t=out:st=${fadeOut}:d=1.5[bgm]`,
    )
    mixInputs.push('[bgm]')
    idx += 1
  }

  if (narrationPath && fs.existsSync(narrationPath)) {
    inputs.push('-i', narrationPath)
    filters.push(
      `[${idx}:a]volume=0.95,acompressor=threshold=-20dB:ratio=3:attack=5:release=80[nar]`,
    )
    mixInputs.push('[nar]')
    idx += 1
  }

  if (!mixInputs.length) {
    fs.copyFileSync(videoPath, outputPath)
    return { hasBgm: false, hasTts: false, hasAmbient: false }
  }

  const weights =
    mixInputs.length === 2 && mixInputs[0] === '[amb]' && mixInputs[1] === '[bgm]'
      ? 'weights=0.55 1.45'
      : ''
  filters.push(
    `${mixInputs.join('')}amix=inputs=${mixInputs.length}:duration=first:dropout_transition=2:normalize=1${weights ? `:${weights}` : ''}[aout]`,
  )

  await execFileAsync(
    'ffmpeg',
    [
      '-y',
      ...inputs,
      '-filter_complex',
      filters.join(';'),
      '-map',
      '0:v',
      '-map',
      '[aout]',
      '-c:v',
      'copy',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      '-movflags',
      '+faststart',
      '-shortest',
      outputPath,
    ],
    EXEC_OPTS,
  )

  return {
    hasBgm: !!(bgmPath && fs.existsSync(bgmPath)),
    hasTts: !!(narrationPath && fs.existsSync(narrationPath)),
    hasAmbient: hasOrig,
  }
}

function escapeDrawtext(s) {
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/:/g, '\\:')
    .replace(/'/g, "\\'")
}

/** 片头标题：PNG 叠加（兼容无 drawtext 的 ffmpeg 构建） */
async function burnTitleOverlay(videoPath, outputPath, titleText, durationSec = 3.2) {
  const text = String(titleText || '').trim()
  if (!text) {
    fs.copyFileSync(videoPath, outputPath)
    return false
  }

  try {
    const duration = await getVideoDuration(videoPath)
    const ok = await burnVideoOverlays(videoPath, outputPath, {
      titleText: text,
      titleDurationSec: durationSec,
      titleFadeSec: 1,
      timeline: [{ duration, caption: '', shotTitle: '' }],
      cinematicTitle: true,
    })
    return ok
  } catch (err) {
    console.warn('[ffmpeg] 片头标题跳过:', trimExecError(err))
    fs.copyFileSync(videoPath, outputPath)
    return false
  }
}

/**
 * AI Director 快速导出：并行预处理 → 一次拼接 → 混音(copy) → 可选片头
 */
async function produceDirectorExport(inputPaths, outputPath, options = {}) {
  const workDir = path.dirname(outputPath)
  const stitched = path.join(workDir, `_dir-stitch-${Date.now()}.mp4`)
  const mixed = path.join(workDir, `_dir-mix-${Date.now()}.mp4`)

  await concatClips(inputPaths, stitched, {
    style: options.style || 'cinematic',
    transition: options.transition || 'fade',
  })

  const moods = options.moods || []
  let ambientGain = 0.52
  if (moods.includes('concert') || moods.includes('energetic')) ambientGain = 0.82
  else if (moods.includes('nature')) ambientGain = 0.62
  else if (moods.includes('urban')) ambientGain = 0.55

  const audioMeta = await muxDirectorFinalAudio(stitched, mixed, {
    bgmPath: options.bgmPath,
    narrationPath: options.narrationPath,
    ambientGain,
    bgmGain: moods.includes('concert') ? 0.42 : 0.62,
  })

  fs.copyFileSync(mixed, outputPath)

  let hasBurnedTitle = false
  if (options.titleText) {
    const titled = `${outputPath}.title.mp4`
    hasBurnedTitle = await burnTitleOverlay(
      outputPath,
      titled,
      options.titleText,
      options.titleDurationSec ?? 3.2,
    )
    if (hasBurnedTitle && fs.existsSync(titled)) {
      fs.copyFileSync(titled, outputPath)
      try {
        fs.unlinkSync(titled)
      } catch {
        /* ignore */
      }
    }
  }

  if (fs.existsSync(stitched)) fs.unlinkSync(stitched)
  if (fs.existsSync(mixed) && mixed !== outputPath) {
    try {
      fs.unlinkSync(mixed)
    } catch {
      /* ignore */
    }
  }

  return { ...audioMeta, hasBurnedTitle }
}

module.exports = {
  checkFfmpeg,
  concatClips,
  produceFinalVlog,
  remixWithNarration,
  muxBgmTrack,
  burnVideoOverlays,
  probeVideoMeta,
  getVideoDuration,
  trimExecError,
  produceDirectorExport,
  muxDirectorFinalAudio,
  burnTitleOverlay,
  concatClipsDemuxer,
  STYLE_FILTERS,
  OUT_W,
  OUT_H,
}
