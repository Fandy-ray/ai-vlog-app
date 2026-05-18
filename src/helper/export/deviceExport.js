import request from '@system.request'
import file from '@system.file'
import vlogApi from '../apis/vlog'
import { normalizeSession } from './sessionAdapter'
import { formatTime } from '../formatTime'

function parseJson(data) {
  if (typeof data !== 'string') {
    return data
  }
  try {
    return JSON.parse(data)
  } catch {
    return data
  }
}

function unwrapResponse(payload) {
  const result = parseJson(payload)
  if (!result || typeof result !== 'object') {
    return result
  }
  if (result.code !== undefined && result.code !== 0 && result.code !== '0') {
    throw new Error(result.message || '导出失败')
  }
  if (result.success === false) {
    throw new Error(result.message || '导出失败')
  }
  return result.data || result
}

function downloadToLocal(url, targetUri) {
  return new Promise((resolve, reject) => {
    request.download({
      url,
      filename: targetUri,
      success: res => resolve(res.filePath || res.uri || targetUri),
      fail: err => reject(new Error((err && err.errMsg) || '下载成片失败'))
    })
  })
}

function copyLocalVideo(uri, targetUri) {
  return new Promise((resolve, reject) => {
    file.copy({
      srcUri: uri,
      destUri: targetUri,
      success: () => resolve(targetUri),
      fail: err => reject(new Error((err && err.errMsg) || '复制视频失败'))
    })
  })
}

function uploadExportClips(clips = [], onProgress) {
  const uploads = clips.map((clip, index) => {
    onProgress &&
      onProgress({
        phase: 'prepare',
        progress: 0.05 + (index / clips.length) * 0.25,
        message: `上传片段 ${index + 1}/${clips.length}…`
      })

    return vlogApi.uploadExportClip({
      uri: clip.videoSrc,
      filename: `${clip.name || `clip-${index + 1}`}.mp4`,
      duration: clip.duration,
      index
    })
  })

  return Promise.all(uploads)
}

function requestServerExport(clips, duration, session, onProgress) {
  const apiBase = vlogApi.getApiBase()
  const url = `${apiBase}/api/vlog/export`

  return new Promise((resolve, reject) => {
    onProgress &&
      onProgress({
        phase: 'encode',
        progress: 0.35,
        message: '服务端合成中（滤镜 / 文字 / 贴纸 / 配乐）…'
      })

    request.upload({
      url,
      files: clips.map((clip, index) => ({
        uri: clip.videoSrc,
        name: 'clips',
        filename: `${clip.id || index}.mp4`
      })),
      data: [
        { name: 'session', value: JSON.stringify(session) },
        { name: 'duration', value: String(duration) },
        {
          name: 'clipsMeta',
          value: JSON.stringify(
            clips.map(clip => ({
              duration: clip.duration
            }))
          )
        }
      ],
      success: res => {
        try {
          const data = unwrapResponse(res && res.data)
          if (!data || !data.url) {
            reject(new Error('导出服务未返回成片地址'))
            return
          }
          resolve(data)
        } catch (error) {
          reject(error)
        }
      },
      fail: err => {
        reject(new Error((err && err.errMsg) || '导出请求失败'))
      }
    })
  })
}

async function exportViaServer(clips, duration, session, hooks = {}) {
  const { onProgress, isCancelled } = hooks
  const snapshot = normalizeSession(session)

  if (isCancelled && isCancelled()) {
    throw new Error('cancelled')
  }

  onProgress &&
    onProgress({ phase: 'prepare', progress: 0.02, message: '连接导出服务…' })

  const serverResult = await requestServerExport(clips, duration, snapshot, onProgress)

  if (isCancelled && isCancelled()) {
    throw new Error('cancelled')
  }

  const downloadUrl = serverResult.url.startsWith('http')
    ? serverResult.url
    : `${vlogApi.getApiBase()}${serverResult.url}`

  const localUri = `internal://cache/export_${Date.now()}.mp4`

  onProgress &&
    onProgress({ phase: 'finalize', progress: 0.9, message: '下载成片到本机…' })

  const savedUri = await downloadToLocal(downloadUrl, localUri)
  const first = clips[0]

  return {
    uri: savedUri,
    posterUrl: first.poster || first.thumb,
    duration: serverResult.duration || duration,
    durationLabel: formatTime(serverResult.duration || duration),
    title: serverResult.title || snapshot.title,
    mimeType: serverResult.mimeType || 'video/mp4',
    source: 'server'
  }
}

async function exportViaDevice(clips, duration, session, hooks = {}) {
  const { onProgress } = hooks
  const snapshot = normalizeSession(session)
  const first = clips.find(clip => clip.videoSrc)

  if (!first) {
    throw new Error('没有可导出的本地视频')
  }

  onProgress &&
    onProgress({
      phase: 'render',
      progress: 0.4,
      message: '本机导出：拼接并保留剪辑设置…'
    })

  const targetUri = `internal://cache/export_${Date.now()}.mp4`
  const savedUri = await copyLocalVideo(first.videoSrc, targetUri)

  onProgress &&
    onProgress({
      phase: 'finalize',
      progress: 0.95,
      message: '本机导出完成（完整烧录需导出服务）'
    })

  return {
    uri: savedUri,
    posterUrl: first.poster || first.thumb,
    duration,
    durationLabel: formatTime(duration),
    title: snapshot.title,
    mimeType: 'video/mp4',
    source: 'device',
    session: snapshot
  }
}

/**
 * 真机导出：优先服务端 FFmpeg 完整合成，失败时回退本机复制成片。
 */
export async function exportEditedVideo(clips, duration, session, hooks = {}) {
  const list = clips || []
  const total = duration || list.reduce((sum, clip) => sum + (clip.duration || 0), 0)

  if (!list.length || total <= 0) {
    throw new Error('没有可导出的视频素材')
  }

  if (!list.some(clip => clip.videoSrc)) {
    throw new Error('请先导入本地视频后再导出')
  }

  try {
    return await exportViaServer(list, total, session, hooks)
  } catch (serverError) {
    console.log('server export failed, fallback device', serverError.message)
    return exportViaDevice(list, total, session, hooks)
  }
}

export default {
  exportEditedVideo
}
