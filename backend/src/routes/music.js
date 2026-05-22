const express = require('express')
const { analyzeVlogDescription } = require('../services/bgmAnalyze')

const router = express.Router()

/**
 * POST /api/music/analyze
 * body: { description?: string, vlogType?: string }
 */
router.post('/music/analyze', async (req, res, next) => {
  try {
    const description = typeof req.body?.description === 'string' ? req.body.description : ''
    const vlogType = typeof req.body?.vlogType === 'string' ? req.body.vlogType : ''
    const result = await analyzeVlogDescription(description, vlogType)

    res.json({
      code: 0,
      message: 'ok',
      data: {
        criteria: result.criteria,
        source: result.source,
        fallbackReason: result.fallbackReason ?? null,
      },
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
