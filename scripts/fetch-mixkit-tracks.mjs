/**
 * 从 Mixkit 下载页解析直链并保存到 public/audio/
 * 用法: node scripts/fetch-mixkit-tracks.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const outDir = path.join(root, 'public', 'audio')

const TRACKS = [
  { id: 443, file: 'mixkit-travel-serene-view', category: 'travel' },
  { id: 839, file: 'mixkit-happy-tears-of-joy', category: 'happy' },
  { id: 607, file: 'mixkit-calm-forest-walk', category: 'calm' },
  { id: 970, file: 'mixkit-urban-night-sky', category: 'urban' },
  { id: 288, file: 'mixkit-upbeat-one-more-dance', category: 'upbeat' },
  { id: 724, file: 'mixkit-cinematic-orchestral', category: 'cinematic' },
]

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Referer: 'https://mixkit.co/free-stock-music/',
  Accept: '*/*',
}

async function resolveDownloadUrl(downloadId) {
  const pageUrl = `https://mixkit.co/free-stock-music/download/${downloadId}/`
  const res = await fetch(pageUrl, { headers: { ...headers, Accept: 'text/html' } })
  const html = await res.text()
  const patterns = [
    /https:\/\/assets\.mixkit\.co\/music\/download\/[^"'\s]+\.mp3/gi,
    /https:\/\/assets\.mixkit\.co\/music\/preview\/[^"'\s]+\.mp3/gi,
    /https:\/\/assets\.mixkit\.co\/[^"'\s]+\.mp3/gi,
  ]
  for (const re of patterns) {
    const m = html.match(re)
    if (m?.[0]) return m[0]
  }
  throw new Error(`未在页面解析到 MP3 链接: ${downloadId}`)
}

async function downloadFile(url, dest) {
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`下载失败 ${res.status}: ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 50_000) throw new Error(`文件过小 (${buf.length} bytes)，可能不是有效 MP3`)
  fs.writeFileSync(dest, buf)
  return buf.length
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true })
  const manifest = []

  for (const track of TRACKS) {
    const dest = path.join(outDir, `${track.file}.mp3`)
    process.stdout.write(`[${track.id}] ${track.file} ... `)
    try {
      const mp3Url = await resolveDownloadUrl(track.id)
      const bytes = await downloadFile(mp3Url, dest)
      console.log(`OK (${(bytes / 1024 / 1024).toFixed(2)} MB)`)
      manifest.push({ ...track, mp3Url, bytes, ok: true })
    } catch (err) {
      console.log(`FAIL: ${err.message}`)
      manifest.push({ ...track, ok: false, error: err.message })
    }
  }

  fs.writeFileSync(
    path.join(outDir, 'download-manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8',
  )
  const ok = manifest.filter((m) => m.ok).length
  console.log(`\n完成: ${ok}/${TRACKS.length} 首`)
  process.exit(ok > 0 ? 0 : 1)
}

main()
