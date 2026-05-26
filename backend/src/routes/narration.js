const express = require('express')
const router = express.Router()
const {
  synthesizeSpeech,
  listVoices,
  listEngines
} = require('../services/vivoTtsService')

router.get('/narration/engines', (req, res) => {
  res.json({
    code: 0,
    data: listEngines()
  })
})

router.get('/narration/voices', (req, res) => {
  const engineid = req.query.engineid || 'short_audio_synthesis_jovi'
  res.json({
    code: 0,
    data: listVoices(engineid)
  })
})

router.post('/narration/synthesize', async (req, res) => {
  try {
    const { text, vcn, engineid, speed, volume } = req.body || {}
    const result = await synthesizeSpeech({ text, vcn, engineid, speed, volume })

    res.json({
      code: 0,
      data: {
        audioBase64: result.wav.toString('base64'),
        mimeType: result.mimeType,
        duration: result.durationSec,
        sampleRate: result.sampleRate
      }
    })
  } catch (error) {
    console.error('[narration/synthesize]', error)
    res.status(500).json({
      code: 500,
      message: error.message || '旁白合成失败'
    })
  }
})

module.exports = router
