const { execFile } = require('child_process')
const { promisify } = require('util')
const { MOOD_PROFILES } = require('../data/bgmMoodProfiles')

const execFileAsync = promisify(execFile)
const EXEC_OPTS = { maxBuffer: 32 * 1024 * 1024 }

/** lavfi 垫乐（音乐库无文件时的后备） */
async function generateMoodBed(mood, durationSec, outputPath, volumeMul = 1) {
  const profile = MOOD_PROFILES[mood] || MOOD_PROFILES.calm
  const dur = Math.max(3, Math.ceil(durationSec) + 2)
  const fadeOut = Math.max(1.5, dur - 2)
  const [f0, f1, f2] = profile.freqs
  const [t0, t1, t2] = profile.tremolo
  const [v0, v1, v2] = profile.volumes
  const gain = profile.volumeMul * Math.max(0.35, Math.min(1.2, volumeMul))

  await execFileAsync(
    'ffmpeg',
    [
      '-y',
      '-f',
      'lavfi',
      '-i',
      `sine=frequency=${f0}:duration=${dur},volume=${v0},tremolo=f=${t0}:d=0.4`,
      '-f',
      'lavfi',
      '-i',
      `sine=frequency=${f1}:duration=${dur},volume=${v1},tremolo=f=${t1}:d=0.45`,
      '-f',
      'lavfi',
      '-i',
      `sine=frequency=${f2}:duration=${dur},volume=${v2},tremolo=f=${t2}:d=0.35`,
      '-f',
      'lavfi',
      '-i',
      `anoisesrc=duration=${dur}:color=pink:sample_rate=44100:amplitude=${profile.noise}`,
      '-filter_complex',
      `[0:a][1:a][2:a][3:a]amix=inputs=4:duration=first,volume=${gain},lowpass=f=${profile.lowpass},afade=t=in:d=0.8,afade=t=out:st=${fadeOut}:d=1.5,alimiter=limit=0.9`,
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      '-ar',
      '44100',
      outputPath,
    ],
    EXEC_OPTS,
  )

  return outputPath
}

module.exports = { generateMoodBed }
