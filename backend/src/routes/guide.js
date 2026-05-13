const express = require('express')
const router = express.Router()
const { getGuideByType, createShotPlan } = require('../services/mockService')

router.get('/guide/:type', (req, res) => {
  const { type } = req.params

  res.json({
    code: 0,
    data: {
      type,
      guide: getGuideByType(type)
    }
  })
})

router.post('/shot-plan', (req, res) => {
  res.json({
    code: 0,
    data: createShotPlan(req.body || {})
  })
})

module.exports = router
