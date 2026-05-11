const express = require('express')
const router = express.Router()

router.get('/health', (req, res) => {
  res.json({
    ok: true,
    message: 'Memento backend is running'
  })
})

module.exports = router