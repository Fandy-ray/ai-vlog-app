let narrationBlob: Blob | null = null
let narrationObjectUrl: string | null = null

export function setNarrationAudioBlob(blob: Blob) {
  if (narrationObjectUrl) {
    URL.revokeObjectURL(narrationObjectUrl)
  }
  narrationBlob = blob
  narrationObjectUrl = URL.createObjectURL(blob)
}

export function getNarrationAudioBlob(): Blob | null {
  return narrationBlob
}

export function getNarrationAudioUrl(): string | null {
  return narrationObjectUrl
}

export function clearNarrationAudio() {
  if (narrationObjectUrl) {
    URL.revokeObjectURL(narrationObjectUrl)
  }
  narrationBlob = null
  narrationObjectUrl = null
}

export function hasNarrationAudio(): boolean {
  return narrationBlob != null && narrationBlob.size > 0
}
