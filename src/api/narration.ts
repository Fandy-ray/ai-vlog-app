export interface TtsEngine {
  id: string
  label: string
  maxBytes: number | null
}

export interface TtsVoice {
  id: string
  label: string
}

export interface SynthesizeResult {
  audioBase64: string
  mimeType: string
  duration: number
  sampleRate: number
}

async function parseResponse<T>(res: Response): Promise<T> {
  const json = await res.json()
  if (!res.ok || (json.code !== undefined && json.code !== 0)) {
    throw new Error(json.message || `请求失败 (${res.status})`)
  }
  return json.data as T
}

export async function fetchTtsEngines(): Promise<TtsEngine[]> {
  const res = await fetch('/api/narration/engines')
  return parseResponse<TtsEngine[]>(res)
}

export async function fetchTtsVoices(engineid: string): Promise<TtsVoice[]> {
  const res = await fetch(`/api/narration/voices?engineid=${encodeURIComponent(engineid)}`)
  return parseResponse<TtsVoice[]>(res)
}

export async function synthesizeNarration(body: {
  text: string
  vcn: string
  engineid: string
  speed?: number
  volume?: number
}): Promise<SynthesizeResult> {
  const res = await fetch('/api/narration/synthesize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return parseResponse<SynthesizeResult>(res)
}

export function base64ToAudioBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new Blob([bytes], { type: mimeType })
}
