/**
 * npm install 后检查配乐；若 MP3 缺失则自动下载（clone 未带二进制时的兜底）
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const audioDir = path.join(__dirname, '..', 'public', 'audio')
const manifestPath = path.join(audioDir, 'download-manifest.json')

function expectedCount() {
  if (!fs.existsSync(manifestPath)) return 6
  try {
    const list = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    return Array.isArray(list) ? list.length : 6
  } catch {
    return 6
  }
}

const mp3Count = fs.existsSync(audioDir)
  ? fs.readdirSync(audioDir).filter((f) => f.endsWith('.mp3')).length
  : 0

const need = expectedCount()

if (mp3Count >= need) {
  console.log(`[audio] 已存在 ${mp3Count} 首配乐，跳过下载`)
  process.exit(0)
}

console.log(`[audio] 仅有 ${mp3Count}/${need} 首，正在执行 audio:fetch …`)
const r = spawnSync(process.execPath, ['scripts/fetch-mixkit-tracks.mjs'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
})
process.exit(r.status ?? 1)
