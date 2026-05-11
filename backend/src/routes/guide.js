const express = require('express')
const router = express.Router()
const { getGuideByType } = require('../services/mockService')

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

module.exports = router