const express = require('express')
const router = express.Router()
const { getStyles } = require('../services/mockService')

router.get('/styles', (req, res) => {
  res.json({
    code: 0,
    data: getStyles()
  })
})

module.exports = router