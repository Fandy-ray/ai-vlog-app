import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'public', 'bgm')

const tracks = {
  'sunny-day': 1,
  'coastal-walk': 2,
  'city-lights': 3,
  'golden-hour': 4,
  'morning-brew': 5,
  'rainy-window': 6,
  'weekend-drive': 7,
  'starry-night': 8,
}

fs.mkdirSync(outDir, { recursive: true })

for (const [id, n] of Object.entries(tracks)) {
  const dest = path.join(outDir, `${id}.mp3`)
  if (fs.existsSync(dest) && fs.statSync(dest).size > 100_000) {
    console.log(`skip ${id} (exists)`)
    continue
  }
  const url = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`
  console.log(`download ${id}…`)
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`${id}: HTTP ${res.status}`)
  }
  const buf = Buffer.from(await res.arrayBuffer())
  fs.writeFileSync(dest, buf)
  console.log(`  -> ${(buf.length / 1024 / 1024).toFixed(1)} MB`)
}

console.log('done:', outDir)
