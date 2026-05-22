const fs = require('fs')
const path = require('path')

let sharpModule = null

function getSharp() {
  if (sharpModule !== null) return sharpModule
  try {
    sharpModule = require('sharp')
  } catch {
    sharpModule = false
  }
  return sharpModule
}

function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function renderTextPng(text, outputPath, options = {}) {
  const sharp = getSharp()
  if (!sharp) {
    throw new Error('未安装 sharp，无法渲染字幕图片')
  }

  const variant = options.variant === 'title' ? 'title' : 'caption'
  const maxLen = variant === 'title' ? 24 : 48
  const line = escapeXml(text.slice(0, maxLen))
  const width = 1080
  const height = variant === 'title' ? 280 : 200
  const fontSize = variant === 'title' ? 58 : 44
  const y = variant === 'title' ? 150 : 120

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="none"/>
  <text x="540" y="${y}" text-anchor="middle"
    font-family="Arial, PingFang SC, Hiragino Sans GB, sans-serif"
    font-size="${fontSize}" font-weight="700"
    fill="#FFFFFF" stroke="#000000" stroke-width="5" paint-order="stroke">
    ${line}
  </text>
</svg>`

  await sharp(Buffer.from(svg)).png().toFile(outputPath)
}

async function renderSubtitlePng(text, outputPath) {
  return renderTextPng(text, outputPath, { variant: 'caption' })
}

async function renderTitlePng(text, outputPath, options = {}) {
  if (!options.cinematic) {
    return renderTextPng(text, outputPath, { variant: 'title' })
  }

  const sharp = getSharp()
  if (!sharp) throw new Error('未安装 sharp，无法渲染字幕图片')

  const line = escapeXml(text.slice(0, 22))
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="220">
  <defs>
    <filter id="blur"><feGaussianBlur stdDeviation="8"/></filter>
  </defs>
  <rect x="48" y="36" width="624" height="148" rx="20" fill="rgba(0,0,0,0.35)" filter="url(#blur)"/>
  <rect x="48" y="36" width="624" height="148" rx="20" fill="rgba(255,255,255,0.14)"/>
  <text x="360" y="128" text-anchor="middle"
    font-family="Arial, PingFang SC, Hiragino Sans GB, sans-serif"
    font-size="42" font-weight="600" letter-spacing="1"
    fill="#FFFFFF">
    ${line}
  </text>
</svg>`

  await sharp(Buffer.from(svg)).png().toFile(outputPath)
}

module.exports = { renderSubtitlePng, renderTitlePng, renderTextPng, getSharp }
