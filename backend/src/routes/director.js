const express = require('express')
const { generateDirectorPlan } = require('../services/directorService')

const router = express.Router()

router.post('/director/plan', async (req, res) => {
  try {
    const body = req.body || {}
    const { theme, stylePreference, refinement, previousScenes } = body
    const result = await generateDirectorPlan({
      theme,
      stylePreference,
      refinement,
      previousScenes,
    })

    if (!result.ok) {
      return res.status(400).json({
        code: 400,
        message: result.message || '生成导拍方案失败',
        reason: result.reason,
      })
    }

    const isRefine = !!String(refinement || '').trim()

    res.json({
      code: 0,
      message: result.fallback
        ? '已使用本地模板生成导拍方案'
        : isRefine
          ? '已根据你的补充要求更新导拍方案'
          : '导拍方案已生成',
      data: result.data,
      meta: {
        provider: result.data.provider,
        fallback: !!result.fallback,
      },
    })
  } catch (error) {
    console.error('[director]', error)
    res.status(500).json({
      code: 500,
      message: error.message || '服务器错误',
    })
  }
})

module.exports = router
