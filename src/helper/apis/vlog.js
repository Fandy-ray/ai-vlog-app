import $ai from '../ai'
import $utils from '../utils'

function pickValue(data, key, fallback) {
  if (!data || data[key] === undefined || data[key] === null) {
    return fallback
  }

  return data[key]
}

export default {
  getVlogTypes() {
    return $utils.mockRequest($utils.getVlogTypes())
  },

  getShootGuide(data = {}) {
    return $utils.mockRequest($utils.getShootGuide(pickValue(data, 'type', 'study')))
  },

  getMaterials(data = {}) {
    return $utils.mockRequest($utils.getMaterials(data))
  },

  getMaterialCategories(data = {}) {
    return $utils.mockRequest($utils.getMaterialCategories(data.type))
  },

  getStyleTemplates() {
    return $utils.mockRequest($utils.getStyleTemplates())
  },

  getStyleTemplate(data = {}) {
    return $utils.mockRequest($utils.getStyleTemplate(pickValue(data, 'style', 'study')))
  },

  getAiShotPlan(data = {}) {
    return $utils.mockRequest($ai.createShotPlan(data))
  },

  generateVlog(data = {}) {
    return $ai.generateVlogAsync(data, 300)
  }
}
