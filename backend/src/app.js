require('dotenv').config()

const express = require('express')
const cors = require('cors')
const path = require('path')
const healthRouter = require('./routes/health')
const stylesRouter = require('./routes/styles')
const guideRouter = require('./routes/guide')
const generateRouter = require('./routes/generate')
const exportRouter = require('./routes/export')
const narrationRouter = require('./routes/narration')
const vlogRouter = require('./routes/vlog')
const directorRouter = require('./routes/director')
const musicRouter = require('./routes/music')

const app = express()

app.use(cors())
app.use(express.json({ limit: '2mb' }))

app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
app.use('/exports', express.static(path.join(__dirname, '../exports')))

app.use('/api', healthRouter)
app.use('/api', stylesRouter)
app.use('/api', guideRouter)
app.use('/api', generateRouter)
app.use('/api', exportRouter)
app.use('/api', narrationRouter)
app.use('/api', vlogRouter)
app.use('/api', directorRouter)
app.use('/api', musicRouter)

app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'Memento backend is running',
    api: '/api/health',
  })
})

app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
  })
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    error: err.message,
  })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Memento backend running at http://localhost:${PORT}`)
})
