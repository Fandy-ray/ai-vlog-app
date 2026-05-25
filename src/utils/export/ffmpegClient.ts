import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

const CORE_SOURCES = [
  '/ffmpeg',
  'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm',
  'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm',
]

let ffmpegInstance: FFmpeg | null = null
let loadPromise: Promise<FFmpeg> | null = null

async function loadFfmpegCore(ffmpeg: FFmpeg) {
  let lastError: unknown
  for (const base of CORE_SOURCES) {
    try {
      await ffmpeg.load({
        coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm'),
      })
      return
    } catch (error) {
      lastError = error
    }
  }
  throw lastError
}

export async function getFfmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    const ffmpeg = new FFmpeg()
    try {
      await loadFfmpegCore(ffmpeg)
    } catch (error) {
      loadPromise = null
      throw new Error(
        '编码器加载失败，请检查网络或刷新页面后重试（需加载 FFmpeg WebAssembly）',
        { cause: error },
      )
    }
    ffmpegInstance = ffmpeg
    return ffmpeg
  })()

  return loadPromise
}

export async function cleanupWorkFiles(ffmpeg: FFmpeg, workId: string) {
  try {
    const entries = await ffmpeg.listDir('.')
    await Promise.all(
      entries
        .filter((entry) => !entry.isDir && entry.name.startsWith(workId))
        .map((entry) => ffmpeg.deleteFile(entry.name)),
    )
  } catch {
    // ignore cleanup errors
  }
}

function evenDimension(value: number) {
  return value % 2 === 0 ? value : value - 1
}

function attachFfmpegLog(ffmpeg: FFmpeg) {
  const logs: string[] = []
  const handler = ({ message }: { message: string }) => {
    logs.push(message)
    if (logs.length > 12) logs.shift()
  }
  ffmpeg.on('log', handler)
  return () => {
    ffmpeg.off('log', handler)
    return logs
  }
}

async function runSegmentEncode(
  ffmpeg: FFmpeg,
  args: string[],
): Promise<void> {
  await ffmpeg.exec(args)
}

/** 将一小块原始帧编码为无音频的 MP4 片段 */
export async function encodeSegmentFromRaw(
  ffmpeg: FFmpeg,
  workId: string,
  chunkIndex: number,
  rawBuffer: Uint8Array,
  frameCount: number,
  width: number,
  height: number,
  fps: number,
): Promise<string> {
  const rawName = `${workId}_c${chunkIndex}.raw`
  const segName = `${workId}_seg${chunkIndex}.mp4`
  const encodeWidth = evenDimension(width)
  const encodeHeight = evenDimension(height)

  await ffmpeg.writeFile(rawName, rawBuffer)
  const stopLogCapture = attachFfmpegLog(ffmpeg)

  const inputArgs = [
    '-f',
    'rawvideo',
    '-pix_fmt',
    'rgba',
    '-s',
    `${encodeWidth}x${encodeHeight}`,
    '-r',
    String(fps),
    '-i',
    rawName,
    '-frames:v',
    String(frameCount),
  ]
  const outputArgs = ['-an', '-pix_fmt', 'yuv420p', '-y', segName]

  try {
    try {
      await runSegmentEncode(ffmpeg, [
        ...inputArgs,
        '-c:v',
        'libx264',
        '-preset',
        'ultrafast',
        '-tune',
        'fastdecode',
        '-crf',
        '20',
        ...outputArgs,
      ])
    } catch {
      await runSegmentEncode(ffmpeg, [
        ...inputArgs,
        '-c:v',
        'mpeg4',
        '-q:v',
        '4',
        ...outputArgs,
      ])
    }
  } catch (error) {
    const logs = stopLogCapture()
    const tail = logs.length ? `（${logs[logs.length - 1]}）` : ''
    throw new Error(
      `视频编码失败（第 ${chunkIndex + 1} 段），请关闭其他标签页、缩短时长或刷新后重试${tail}`,
      { cause: error },
    )
  } finally {
    stopLogCapture()
  }

  await ffmpeg.deleteFile(rawName)
  return segName
}

/** 拼接视频片段 */
export async function concatVideoSegments(
  ffmpeg: FFmpeg,
  workId: string,
  segmentNames: string[],
): Promise<string> {
  const listFile = `${workId}_seglist.txt`
  const videoOnly = `${workId}_video.mp4`

  await ffmpeg.writeFile(
    listFile,
    segmentNames.map((name) => `file '${name}'`).join('\n'),
  )

  await ffmpeg.exec([
    '-f',
    'concat',
    '-safe',
    '0',
    '-i',
    listFile,
    '-c',
    'copy',
    '-y',
    videoOnly,
  ])

  return videoOnly
}

/** 为无声视频混入音频轨 */
export async function muxAudio(
  ffmpeg: FFmpeg,
  workId: string,
  videoFile: string,
  audioFile: string | null,
): Promise<Uint8Array> {
  const output = `${workId}_out.mp4`

  if (!audioFile) {
    const data = await ffmpeg.readFile(videoFile)
    if (data instanceof Uint8Array) return data.slice()
    return new TextEncoder().encode(String(data))
  }

  await ffmpeg.exec([
    '-i',
    videoFile,
    '-i',
    audioFile,
    '-map',
    '0:v:0',
    '-map',
    '1:a:0',
    '-c:v',
    'copy',
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    '-shortest',
    '-movflags',
    '+faststart',
    '-y',
    output,
  ])

  const data = await ffmpeg.readFile(output)
  if (data instanceof Uint8Array) return data.slice()
  return new TextEncoder().encode(String(data))
}
