const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { exportVideo } = require('../services/videoExportService')

const router = express.Router()
const exportsDir = path.join(__dirname, '../../exports')
const uploadDir = path.join(exportsDir, 'uploads')

;[exportsDir, uploadDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
})

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 120 * 1024 * 1024 }
})

router.post('/vlog/export', upload.array('clips', 12), async (req, res) => {
  try {
    const session = JSON.parse(req.body.session || '{}')
    const duration = Number(req.body.duration || 0)
    const files = req.files || []

    if (!files.length) {
      return res.status(400).json({ code: 400, message: '请上传至少一个视频片段' })
    }

    const inputs = files.map((file, index) => {
      let clipDuration = 5
      try {
        const meta = JSON.parse(req.body.clipsMeta || '[]')
        if (meta[index] && meta[index].duration) {
          clipDuration = Number(meta[index].duration)
        }
      } catch {
        // ignore
      }

      return {
        path: file.path,
        duration: clipDuration
      }
    })

    const result = await exportVideo(inputs, session, duration, exportsDir)

    res.json({
      code: 0,
      data: {
        url: result.relativeUrl,
        title: result.title,
        duration: result.duration,
        mimeType: 'video/mp4'
      }
    })
  } catch (error) {
    console.error('[export]', error)
    res.status(500).json({
      code: 500,
      message: error.message || '导出失败'
    })
  }
})

module.exports = router
