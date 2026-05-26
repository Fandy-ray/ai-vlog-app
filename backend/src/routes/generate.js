const express = require('express')
const router = express.Router()
const { generateMockVlog } = require('../services/mockService')

router.post('/generate/mock', (req, res) => {
  const result = generateMockVlog(req.body || {})

  res.json({
    code: 0,
    message: 'mock vlog generated',
    data: result
  })
})

module.exports = router
