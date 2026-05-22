const fs = require('fs')
const path = require('path')
const { execFile } = require('child_process')
const { promisify } = require('util')
const { generateMoodBed } = require('./bgmSynthService')

const execFileAsync = promisify(execFile)
const EXEC_OPTS = { maxBuffer: 32 * 1024 * 1024 }

const MUSIC_ROOT = path.join(__dirname, '../../music')
const AUDIO_EXT = new Set(['.mp3', '.m4a', '.aac', '.wav', '.ogg', '.flac'])

let catalogCache = null

function loadCatalog() {
  if (catalogCache) return catalogCache
  try {
    const raw = fs.readFileSync(path.join(MUSIC_ROOT, 'catalog.json'), 'utf8')
    catalogCache = JSON.parse(raw)
  } catch {
    catalogCache = { moodFolders: {}, ambientGain: { default: 0.5 } }
  }
  return catalogCache
}

function listTracksInFolder(folderName) {
  const dir = path.join(MUSIC_ROOT, folderName)
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => AUDIO_EXT.has(path.extname(f).toLowerCase()))
    .map((f) => path.join(dir, f))
}

function pickSourceFile(mood) {
  const catalog = loadCatalog()
  const folders = catalog.moodFolders?.[mood] || ['chill', 'cinematic']
  const candidates = []
  for (const folder of folders) {
    candidates.push(...listTracksInFolder(folder))
  }
  if (!candidates.length) {
    for (const sub of fs.readdirSync(MUSIC_ROOT)) {
      const p = path.join(MUSIC_ROOT, sub)
      if (fs.statSync(p).isDirectory()) {
        candidates.push(...listTracksInFolder(sub))
      }
    }
  }
  if (!candidates.length) return null
  return candidates[Math.floor(Math.random() * candidates.length)]
}

async function trimOrLoopTrack(srcPath, durationSec, outputPath, volumeMul = 1) {
  const dur = Math.max(3, Number(durationSec) || 4)
  const fadeOut = Math.max(1, dur - 1.2).toFixed(2)
  const vol = Math.max(0.35, Math.min(1.1, volumeMul))

  await execFileAsync(
    'ffmpeg',
    [
      '-y',
      '-stream_loop',
      '3',
      '-i',
      srcPath,
      '-t',
      String(dur + 0.5),
      '-af',
      `volume=${vol},afade=t=in:d=0.6,afade=t=out:st=${fadeOut}:d=1.2,alimiter=limit=0.92`,
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      '-ar',
      '44100',
      '-ac',
      '2',
      outputPath,
    ],
    EXEC_OPTS,
  )
  return outputPath
}

/**
 * 从音乐库选取并裁切 BGM；无文件时回退 lavfi 垫乐
 */
async function resolveMoodAudio(mood, durationSec, outputPath, volumeMul = 1) {
  const src = pickSourceFile(mood)
  if (src) {
    try {
      await trimOrLoopTrack(src, durationSec, outputPath, volumeMul)
      return { path: outputPath, source: 'library', file: path.basename(src) }
    } catch (err) {
      console.warn('[music] 裁切失败，回退垫乐:', err.message)
    }
  }
  await generateMoodBed(mood, durationSec, outputPath, volumeMul)
  return { path: outputPath, source: 'synthetic' }
}

function getAmbientGain(mood) {
  const catalog = loadCatalog()
  return catalog.ambientGain?.[mood] ?? catalog.ambientGain?.default ?? 0.5
}

function hasLibraryTracks() {
  try {
    for (const sub of fs.readdirSync(MUSIC_ROOT)) {
      const p = path.join(MUSIC_ROOT, sub)
      if (fs.statSync(p).isDirectory() && listTracksInFolder(sub).length) return true
    }
  } catch {
    /* ignore */
  }
  return false
}

module.exports = {
  resolveMoodAudio,
  getAmbientGain,
  hasLibraryTracks,
  pickSourceFile,
  MUSIC_ROOT,
}
