import type { VideoClip } from '@/data/mockProject'
import { getNetworkAudio } from '@/data/audioLibrary'
import type { EditorSnapshot } from '@/types/editorState'
import { fetchBgmBuffer } from '@/utils/bgmLoader'
import { getNarrationAudioBlob } from '@/state/narrationAudio'
import type { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import { audioBufferToWav } from './audioWav'

const SAMPLE_RATE = 48000

function extFromBlob(blob: Blob) {
  if (blob.type.includes('webm')) return 'webm'
  if (blob.type.includes('quicktime') || blob.type.includes('mov')) return 'mov'
  return 'mp4'
}

function copyBufferToOffline(
  offline: OfflineAudioContext,
  decoded: AudioBuffer,
  maxSamples: number,
) {
  const len = Math.min(decoded.length, maxSamples)
  const buf = offline.createBuffer(2, len, SAMPLE_RATE)
  for (let ch = 0; ch < 2; ch++) {
    const srcCh = decoded.getChannelData(Math.min(ch, decoded.numberOfChannels - 1))
    buf.copyToChannel(srcCh.subarray(0, len), ch, 0)
  }
  return buf
}

async function decodeWavBytes(wav: Uint8Array): Promise<AudioBuffer> {
  const ctx = new AudioContext()
  const copy = wav.slice().buffer
  const decoded = await ctx.decodeAudioData(copy)
  await ctx.close()
  return decoded
}

async function extractClipAudio(
  ffmpeg: FFmpeg,
  workId: string,
  clip: VideoClip,
  index: number,
): Promise<AudioBuffer | null> {
  if (!clip.videoSrc) return null

  const response = await fetch(clip.videoSrc)
  const blob = await response.blob()
  const ext = extFromBlob(blob)
  const inName = `${workId}_acin_${index}.${ext}`
  const outName = `${workId}_aout_${index}.wav`

  await ffmpeg.writeFile(inName, await fetchFile(blob))

  try {
    await ffmpeg.exec([
      '-i', inName,
      '-vn', '-ac', '2', '-ar', String(SAMPLE_RATE),
      '-acodec', 'pcm_s16le',
      '-t', String(Math.max(0.1, clip.duration)),
      '-y', outName,
    ])
    const wav = await ffmpeg.readFile(outName)
    if (!(wav instanceof Uint8Array)) return null
    return await decodeWavBytes(wav)
  } catch {
    return null
  }
}

/** 浏览器混音 + ffmpeg 提取原声，生成完整 WAV */
async function renderFullAudio(
  ffmpeg: FFmpeg,
  workId: string,
  clips: VideoClip[],
  duration: number,
  snapshot: EditorSnapshot,
): Promise<Uint8Array | null> {
  const length = Math.max(1, Math.ceil(duration * SAMPLE_RATE))
  const offline = new OfflineAudioContext(2, length, SAMPLE_RATE)
  let hasTrack = false
  let timelineOffset = 0

  if (snapshot.keepOriginalAudio) {
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i]
      const decoded = await extractClipAudio(ffmpeg, workId, clip, i)
      if (decoded) {
        const clipBuf = copyBufferToOffline(
          offline,
          decoded,
          Math.ceil(clip.duration * SAMPLE_RATE),
        )
        const src = offline.createBufferSource()
        src.buffer = clipBuf
        const gain = offline.createGain()
        gain.gain.value = 1
        src.connect(gain)
        gain.connect(offline.destination)
        src.start(timelineOffset)
        timelineOffset += clip.duration
        hasTrack = true
      }
    }
  }

  if (snapshot.narrationEnabled) {
    const narrationBlob = getNarrationAudioBlob()
    if (narrationBlob) {
      const ab = await narrationBlob.arrayBuffer()
      const ctx = new AudioContext()
      const decoded = await ctx.decodeAudioData(ab.slice(0))
      await ctx.close()

      const src = offline.createBufferSource()
      src.buffer = decoded
      const gain = offline.createGain()
      gain.gain.value = 1
      src.connect(gain)
      gain.connect(offline.destination)
      src.start(0, 0, Math.min(decoded.duration, duration))
      hasTrack = true
    } else if (snapshot.narrationText?.trim()) {
      throw new Error('已启用旁白导出但未生成音频，请打开 AI 旁白并点击「生成旁白」')
    }
  }

  if (snapshot.bgmId) {
    const bgm = getNetworkAudio(snapshot.bgmId)
    if (bgm) {
      const ab = await fetchBgmBuffer(snapshot.bgmId)
      const ctx = new AudioContext()
      const decoded = await ctx.decodeAudioData(ab.slice(0))
      await ctx.close()

      const src = offline.createBufferSource()
      src.buffer = decoded
      src.loop = true
      const gain = offline.createGain()
      gain.gain.value = snapshot.keepOriginalAudio ? 0.48 : 0.95
      src.connect(gain)
      gain.connect(offline.destination)
      src.start(0, 0, duration)
      hasTrack = true
    }
  }

  if (!hasTrack) {
    if (snapshot.bgmId) {
      throw new Error(
        snapshot.keepOriginalAudio
          ? '配乐未能混入成片，请运行 npm run bgm:fetch 下载本地配乐后重试'
          : '仅配乐模式下无法加载所选音乐，请运行 npm run bgm:fetch 或开启「保留视频原声」',
      )
    }
    return null
  }

  const rendered = await offline.startRendering()
  return audioBufferToWav(rendered)
}

export async function prepareExportAudio(
  ffmpeg: FFmpeg,
  workId: string,
  clips: VideoClip[],
  duration: number,
  snapshot: EditorSnapshot,
): Promise<string | null> {
  const outName = `${workId}_audio.wav`

  const wav = await renderFullAudio(ffmpeg, workId, clips, duration, snapshot)
  if (wav && wav.byteLength > 44) {
    await ffmpeg.writeFile(outName, wav)
    return outName
  }

  if (snapshot.bgmId || snapshot.keepOriginalAudio || snapshot.narrationEnabled) {
    throw new Error('音频轨生成失败，请确认配乐、原声或旁白设置')
  }

  return null
}
