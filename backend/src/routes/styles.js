const express = require('express')
const router = express.Router()
const {
  getStyles,
  getVlogTypes,
  getStyleTemplates,
  getMaterials,
  registerUploadedMaterial
} = require('../services/mockService')

router.get('/styles', (req, res) => {
  res.json({
    code: 0,
    data: getStyles()
  })
})

router.get('/vlog-types', (req, res) => {
  res.json({
    code: 0,
    data: getVlogTypes()
  })
})

router.get('/style-templates', (req, res) => {
  res.json({
    code: 0,
    data: getStyleTemplates()
  })
})

router.get('/materials', (req, res) => {
  res.json({
    code: 0,
    data: getMaterials(req.query)
  })
})

router.post('/materials', (req, res) => {
  const material = registerUploadedMaterial(req.body || {})

  res.json({
    code: 0,
    message: 'material registered',
    data: material
  })
})

router.post('/materials/upload', (req, res) => {
  const chunks = []

  req.on('data', chunk => {
    chunks.push(chunk)
  })

  req.on('end', () => {
    const rawBody = Buffer.concat(chunks).toString('latin1')
    const filenameMatch = rawBody.match(/filename="([^"]+)"/)
    const material = registerUploadedMaterial({
      type: req.query.type,
      category: req.query.category,
      name: req.query.name,
      filename: filenameMatch && filenameMatch[1],
      source: 'request.upload'
    })

    res.json({
      code: 0,
      message: 'material uploaded',
      data: material
    })
  })

  req.on('error', error => {
    res.status(400).json({
      code: 400,
      message: 'upload failed',
      error: error.message
    })
  })
})

module.exports = router
