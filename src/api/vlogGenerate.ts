import type { VlogGenerateManifest, VlogGenerateResult } from '@/types/vlogGenerate'
import type { ClipForUpload } from '@/utils/vlogMaterialStore'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

async function parseApiJson(response: Response) {
  const text = await response.text()
  if (!text) {
    throw new Error('服务器返回空内容，请确认后端已启动（cd backend && npm run dev）')
  }
  try {
    return JSON.parse(text) as { code?: number; message?: string; data?: VlogGenerateResult }
  } catch {
    if (text.trimStart().startsWith('<')) {
      throw new Error(
        '接口返回了网页而不是 JSON。请确认：① 终端1 已运行 backend；② 终端2 在项目根目录运行 npm run dev（不是只在 backend 里）',
      )
    }
    throw new Error(`服务器响应无法解析：${text.slice(0, 120)}`)
  }
}

export async function generateVlogFromClips(
  clips: ClipForUpload[],
  manifest: VlogGenerateManifest,
): Promise<VlogGenerateResult> {
  const form = new FormData()
  form.append('manifest', JSON.stringify(manifest))

  for (const clip of clips) {
    const ext =
      clip.mimeType.includes('mp4') || clip.mimeType.includes('avc')
        ? 'mp4'
        : 'webm'
    form.append('clips', clip.blob, `${clip.sceneId}.${ext}`)
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 6 * 60 * 1000)

  let response: Response
  try {
    response = await fetch(`${API_BASE}/api/vlog/generate`, {
      method: 'POST',
      body: form,
      signal: controller.signal,
    })
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error('生成超时，请减少素材数量后重试')
    }
    throw new Error('无法连接后端，请确认 backend 在运行且手机与电脑同一 Wi-Fi')
  } finally {
    clearTimeout(timeout)
  }

  const payload = await parseApiJson(response)
  if (!response.ok || payload.code !== 0) {
    throw new Error(payload.message || `生成失败（HTTP ${response.status}）`)
  }
  if (!payload.data) {
    throw new Error('服务器未返回成片数据')
  }

  return payload.data
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/health`, { method: 'GET' })
    const text = await res.text()
    const data = JSON.parse(text) as { ok?: boolean }
    return !!data.ok
  } catch {
    return false
  }
}
