import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = path.join(root, 'node_modules', '@ffmpeg', 'core', 'dist', 'esm')
const destDir = path.join(root, 'public', 'ffmpeg')
const files = ['ffmpeg-core.js', 'ffmpeg-core.wasm']

if (!fs.existsSync(srcDir)) {
  console.warn('[ffmpeg] @ffmpeg/core 未安装，跳过复制')
  process.exit(0)
}

fs.mkdirSync(destDir, { recursive: true })

for (const file of files) {
  const from = path.join(srcDir, file)
  const to = path.join(destDir, file)
  if (!fs.existsSync(from)) {
    console.warn(`[ffmpeg] 缺少 ${file}，跳过`)
    continue
  }
  fs.copyFileSync(from, to)
}

console.log('[ffmpeg] 已同步编码器到 public/ffmpeg')
