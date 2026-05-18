import type { VideoClip } from '@/data/mockProject'
import type { EditorSnapshot } from '@/types/editorState'
import {
  compositeFrameAt,
  disposeCompositeContext,
  prepareCompositeContext,
} from './compositeFrame'
import { prepareExportAudio } from './exportAudio'
import { chunkFrameCount, pickExportProfile } from './exportProfile'
import {
  cleanupWorkFiles,
  concatVideoSegments,
  encodeSegmentFromRaw,
  getFfmpeg,
  muxAudio,
} from './ffmpegClient'

export interface ExportProgress {
  phase: 'prepare' | 'render' | 'audio' | 'encode' | 'finalize'
  progress: number
  message: string
}

export interface ExportResult {
  blob: Blob
  url: string
  posterUrl: string
  mimeType: string
  duration: number
  title: string
}

const PROGRESS_EVERY = 6

export async function exportEditedVideo(
  clips: VideoClip[],
  duration: number,
  snapshot: EditorSnapshot,
  onProgress?: (p: ExportProgress) => void,
  isCancelled?: () => boolean,
): Promise<ExportResult> {
  if (!clips.length || duration <= 0) {
    throw new Error('没有可导出的视频素材')
  }

  const hasVideoSource = clips.some((c) => c.videoSrc)
  if (!hasVideoSource) {
    throw new Error('请先导入本地视频后再导出')
  }

  const profile = pickExportProfile(duration)
  const { width, height, fps } = profile
  const workId = `exp_${Date.now()}`
  const totalFrames = Math.max(1, Math.ceil(duration * fps))
  const frameBytes = width * height * 4
  const framesPerChunk = chunkFrameCount(profile)
  const chunkCount = Math.ceil(totalFrames / framesPerChunk)

  onProgress?.({
    phase: 'prepare',
    progress: 0.02,
    message: `加载编码器（${profile.label}，分 ${chunkCount} 段）…`,
  })
  await document.fonts.ready

  const ffmpeg = await getFfmpeg()
  if (isCancelled?.()) throw new Error('cancelled')

  const context = await prepareCompositeContext(clips, duration, snapshot)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) {
    disposeCompositeContext(context)
    throw new Error('无法创建画布')
  }

  const frameOpts = { width, height }
  const segmentNames: string[] = []
  let posterUrl = ''

  try {
    let clipIndex = 0
    let globalFrame = 0

    for (let chunk = 0; chunk < chunkCount; chunk++) {
      if (isCancelled?.()) throw new Error('cancelled')

      const chunkLen = Math.min(framesPerChunk, totalFrames - chunk * framesPerChunk)
      let chunkBuffer: Uint8Array

      try {
        chunkBuffer = new Uint8Array(chunkLen * frameBytes)
      } catch {
        throw new Error(
          '内存不足，请缩短视频时长或关闭其他标签页后重试',
        )
      }

      onProgress?.({
        phase: 'render',
        progress: 0.08 + (chunk / chunkCount) * 0.58,
        message: `合成画面 第 ${chunk + 1}/${chunkCount} 段…`,
      })

      for (let i = 0; i < chunkLen; i++) {
        if (isCancelled?.()) throw new Error('cancelled')

        const globalTime = globalFrame / fps

        while (
          clipIndex < clips.length - 1 &&
          globalTime >= clips[clipIndex].start + clips[clipIndex].duration
        ) {
          clipIndex++
        }

        await compositeFrameAt(ctx, context, globalTime, frameOpts)

        if (!posterUrl && globalFrame === 0) {
          posterUrl = canvas.toDataURL('image/jpeg', 0.75)
        }

        const imageData = ctx.getImageData(0, 0, width, height)
        chunkBuffer.set(imageData.data, i * frameBytes)

        globalFrame++

        if (i % PROGRESS_EVERY === 0 || i === chunkLen - 1) {
          const done = chunk * framesPerChunk + i + 1
          onProgress?.({
            phase: 'render',
            progress: 0.08 + (done / totalFrames) * 0.58,
            message: `合成画面 ${Math.round((done / totalFrames) * 100)}%`,
          })
        }
      }

      onProgress?.({
        phase: 'encode',
        progress: 0.66 + (chunk / chunkCount) * 0.12,
        message: `编码片段 ${chunk + 1}/${chunkCount}…`,
      })

      const segName = await encodeSegmentFromRaw(
        ffmpeg,
        workId,
        chunk,
        chunkBuffer,
        chunkLen,
        width,
        height,
        fps,
      )
      segmentNames.push(segName)
    }

    if (isCancelled?.()) throw new Error('cancelled')

    onProgress?.({ phase: 'audio', progress: 0.8, message: '正在混合音频…' })
    const audioFile = await prepareExportAudio(ffmpeg, workId, clips, duration, snapshot)

    if (isCancelled?.()) throw new Error('cancelled')

    onProgress?.({ phase: 'encode', progress: 0.86, message: '正在拼接并封装 MP4…' })

    const videoFile =
      segmentNames.length === 1
        ? segmentNames[0]
        : await concatVideoSegments(ffmpeg, workId, segmentNames)

    const mp4Data = await muxAudio(ffmpeg, workId, videoFile, audioFile)

    onProgress?.({ phase: 'finalize', progress: 0.98, message: '即将完成…' })

    const mp4Bytes = mp4Data.slice()
    const blob = new Blob([mp4Bytes], { type: 'video/mp4' })
    const url = URL.createObjectURL(blob)

    return {
      blob,
      url,
      posterUrl: posterUrl || canvas.toDataURL('image/jpeg', 0.75),
      mimeType: 'video/mp4',
      duration,
      title: snapshot.title,
    }
  } finally {
    disposeCompositeContext(context)
    await cleanupWorkFiles(ffmpeg, workId)
  }
}

export function downloadExportResult(result: ExportResult) {
  const ext = result.mimeType.includes('mp4') ? 'mp4' : 'webm'
  const safeName = result.title.replace(/[<>:"/\\|?*]/g, '_').trim() || 'memento-vlog'
  const anchor = document.createElement('a')
  anchor.href = result.url
  anchor.download = `${safeName}.${ext}`
  anchor.click()
}
