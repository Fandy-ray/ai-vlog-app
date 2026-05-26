const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const https = require('https')
const http = require('http')

const mkdir = promisify(fs.mkdir)
const writeFile = promisify(fs.writeFile)
const unlink = promisify(fs.unlink)
const access = promisify(fs.access)

const FILTER_EQ = {
  none: null,
  warm: 'eq=saturation=1.2:brightness=0.05:contrast=1.02',
  cool: 'eq=saturation=0.95:gamma=1.05',
  fresh: 'eq=saturation=1.15:brightness=0.08',
  vintage: 'eq=saturation=0.8:contrast=1.1:gamma=0.95',
  cinematic: 'eq=contrast=1.15:saturation=0.85:brightness=-0.05',
  vivid: 'eq=saturation=1.45:contrast=1.08',
  soft: 'eq=brightness=0.1:contrast=0.9',
  bw: 'hue=s=0'
}

const BGM_URLS = {
  'sunny-day': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'coastal-walk': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'city-lights': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'morning-coffee': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  'golden-hour': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  'morning-brew': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  'rainy-window': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  'weekend-drive': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  'starry-night': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
}

const STICKER_EMOJI = {
  heart: '❤️',
  star: '⭐',
  sparkle: '✨',
  fire: '🔥',
  sun: '☀️',
  rainbow: '🌈',
  camera: '📷',
  plane: '✈️',
  palm: '🌴',
  wave: '🌊',
  party: '🎉',
  music: '🎵'
}

function runFfmpeg(args, cwd) {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', args, { cwd, windowsHide: true })
    let stderr = ''

    proc.stderr.on('data', chunk => {
      stderr += chunk.toString()
    })

    proc.on('error', err => {
      if (err.code === 'ENOENT') {
        reject(new Error('未检测到 ffmpeg，请安装后重试'))
        return
      }
      reject(err)
    })

    proc.on('close', code => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(stderr.slice(-400) || `ffmpeg exit ${code}`))
    })
  })
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    const file = fs.createWriteStream(dest)
    client
      .get(url, res => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`download failed ${res.statusCode}`))
          return
        }
        res.pipe(file)
        file.on('finish', () => file.close(() => resolve(dest)))
      })
      .on('error', reject)
  })
}

function escapeDrawtext(value = '') {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/:/g, '\\:')
    .replace(/'/g, "\\'")
}

function buildDrawFilters(session, width = 1280, height = 720) {
  const filters = []
  const eq = FILTER_EQ[session.filterId]
  if (eq) {
    filters.push(eq)
  }

  if (session.textOverlay && session.textOverlay.content) {
    const t = session.textOverlay
    const x = Math.round((t.x / 100) * width)
    const y = Math.round((t.y / 100) * height)
    const size = Math.max(18, Math.round((t.height / 100) * height * 0.65))
    filters.push(
      `drawtext=text='${escapeDrawtext(t.content)}':fontsize=${size}:fontcolor=${t.color || 'white'}:x=${x}-text_w/2:y=${y}-text_h/2`
    )
  }

  ;(session.stickerOverlays || []).forEach(sticker => {
    const emoji = STICKER_EMOJI[sticker.stickerId] || '✨'
    const x = Math.round((sticker.x / 100) * width)
    const y = Math.round((sticker.y / 100) * height)
    const size = Math.max(24, Math.round((sticker.height / 100) * height))
    filters.push(
      `drawtext=text='${escapeDrawtext(emoji)}':fontsize=${size}:x=${x}-text_w/2:y=${y}-text_h/2`
    )
  })

  return filters.length ? filters.join(',') : null
}

async function ensureDir(dir) {
  try {
    await access(dir)
  } catch {
    await mkdir(dir, { recursive: true })
  }
}

async function cleanupFiles(files = []) {
  await Promise.all(
    files.map(file =>
      unlink(file).catch(() => {})
    )
  )
}

/**
 * @param {{ path: string, duration: number }[]} inputs
 * @param {object} session
 * @param {number} duration
 * @param {string} exportsDir
 */
async function exportVideo(inputs, session, duration, exportsDir) {
  await ensureDir(exportsDir)
  const workId = `job_${Date.now()}`
  const workDir = path.join(exportsDir, workId)
  await ensureDir(workDir)

  const tempFiles = []
  const segmentFiles = []

  try {
    for (let i = 0; i < inputs.length; i += 1) {
      const segOut = path.join(workDir, `seg_${i}.mp4`)
      const clipDuration = Math.max(0.5, Number(inputs[i].duration) || 5)
      await runFfmpeg(
        [
          '-y',
          '-i',
          inputs[i].path,
          '-t',
          String(clipDuration),
          '-c:v',
          'libx264',
          '-preset',
          'veryfast',
          '-crf',
          '23',
          '-c:a',
          'aac',
          '-b:a',
          '128k',
          segOut
        ],
        workDir
      )
      segmentFiles.push(segOut)
      tempFiles.push(segOut)
    }

    const listFile = path.join(workDir, 'concat.txt')
    const listBody = segmentFiles.map(f => `file '${f.replace(/'/g, "'\\''")}'`).join('\n')
    await writeFile(listFile, listBody, 'utf8')
    tempFiles.push(listFile)

    const merged = path.join(workDir, 'merged.mp4')
    await runFfmpeg(
      ['-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', merged],
      workDir
    )
    tempFiles.push(merged)

    const vf = buildDrawFilters(session)
    const filtered = path.join(workDir, 'filtered.mp4')
    const filterArgs = vf
      ? ['-y', '-i', merged, '-vf', vf, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-c:a', 'copy', filtered]
      : ['-y', '-i', merged, '-c', 'copy', filtered]

    try {
      await runFfmpeg(filterArgs, workDir)
    } catch (filterError) {
      console.warn('[export] filter overlay failed, using merged video', filterError.message)
      await runFfmpeg(['-y', '-i', merged, '-c', 'copy', filtered], workDir)
    }
    tempFiles.push(filtered)

    let output = filtered
    const bgmUrl = session.bgmId ? BGM_URLS[session.bgmId] : null

    if (bgmUrl) {
      const bgmPath = path.join(workDir, 'bgm.mp3')
      await downloadFile(bgmUrl, bgmPath)
      tempFiles.push(bgmPath)

      const finalOut = path.join(exportsDir, `${workId}.mp4`)

      const bgmOnlyArgs = [
        '-y',
        '-i',
        filtered,
        '-i',
        bgmPath,
        '-map',
        '0:v:0',
        '-map',
        '1:a:0',
        '-c:v',
        'copy',
        '-c:a',
        'aac',
        '-shortest',
        finalOut
      ]

      if (session.keepOriginalAudio) {
        try {
          await runFfmpeg(
            [
              '-y',
              '-i',
              filtered,
              '-i',
              bgmPath,
              '-filter_complex',
              '[0:a][1:a]amix=inputs=2:duration=first:dropout_transition=2[aout]',
              '-map',
              '0:v:0',
              '-map',
              '[aout]',
              '-c:v',
              'copy',
              '-c:a',
              'aac',
              '-shortest',
              finalOut
            ],
            workDir
          )
        } catch {
          await runFfmpeg(bgmOnlyArgs, workDir)
        }
      } else {
        await runFfmpeg(bgmOnlyArgs, workDir)
      }
      output = finalOut
    } else {
      const finalOut = path.join(exportsDir, `${workId}.mp4`)
      await runFfmpeg(['-y', '-i', filtered, '-c', 'copy', finalOut], workDir)
      output = finalOut
    }

    const publicName = path.basename(output)
    return {
      fileName: publicName,
      relativeUrl: `/exports/${publicName}`,
      duration: duration || inputs.reduce((sum, item) => sum + (item.duration || 0), 0),
      title: session.title || '旅行的意义'
    }
  } finally {
    await cleanupFiles(tempFiles)
    fs.rm(workDir, { recursive: true, force: true }, () => {})
  }
}

module.exports = {
  exportVideo
}
