const { execFile } = require('child_process')
const path = require('path')
const { promisify } = require('util')
const { MOOD_PROFILES, STYLE_FALLBACK_MOOD } = require('../data/bgmMoodProfiles')
const { resolveMoodAudio } = require('./musicLibraryService')
const { generateMoodBed } = require('./bgmSynthService')

const execFileAsync = promisify(execFile)
const EXEC_OPTS = { maxBuffer: 32 * 1024 * 1024 }
const CROSSFADE = 1.4

/**
 * @param {{ mood: string, durationSec: number, volumeMul?: number }[]} segments
 */
async function buildSegmentBgmTrack(segments, workDir, style = 'cinematic', options = {}) {
  if (!segments?.length) return null

  const crossfade = options.crossfadeSec ?? CROSSFADE

  const normalized = segments.map((s) => ({
    mood: MOOD_PROFILES[s.mood] ? s.mood : STYLE_FALLBACK_MOOD[style] || 'calm',
    durationSec: Math.max(2, Number(s.durationSec) || 4),
    volumeMul: Number(s.volumeMul) > 0 ? Number(s.volumeMul) : 0.75,
  }))

  const segPaths = await Promise.all(
    normalized.map(async (seg, i) => {
      const p = path.join(workDir, `_bgm-seg-${i}-${seg.mood}.m4a`)
      await resolveMoodAudio(seg.mood, seg.durationSec, p, seg.volumeMul)
      return p
    }),
  )

  if (segPaths.length === 1) return segPaths[0]

  const outPath = path.join(workDir, `_bgm-multi-${Date.now()}.m4a`)
  const inputs = segPaths.flatMap((p) => ['-i', p])
  const parts = []
  let prev = '0:a'

  for (let i = 1; i < normalized.length; i++) {
    const label = i === normalized.length - 1 ? 'aout' : `am${i}`
    parts.push(
      `[${prev}][${i}:a]acrossfade=d=${crossfade}:c1=tri:c2=tri[${label}]`,
    )
    prev = label
  }

  await execFileAsync(
    'ffmpeg',
    [
      '-y',
      ...inputs,
      '-filter_complex',
      parts.join(';'),
      '-map',
      '[aout]',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      '-ar',
      '44100',
      outPath,
    ],
    EXEC_OPTS,
  )

  return outPath
}

module.exports = { generateMoodBed, buildSegmentBgmTrack, CROSSFADE }
