import type { ExportResult } from '@/utils/export/exportVideo'

let lastExport: ExportResult | null = null

export function setExportedVideo(result: ExportResult) {
  if (lastExport?.url && lastExport.url !== result.url) {
    URL.revokeObjectURL(lastExport.url)
  }
  lastExport = result
}

export function getExportedVideo(): ExportResult | null {
  return lastExport
}

export function clearExportedVideo() {
  if (lastExport?.url) {
    URL.revokeObjectURL(lastExport.url)
  }
  lastExport = null
}
