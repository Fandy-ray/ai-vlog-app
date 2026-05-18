import request from '@system.request'
import manifest from '../../manifest.json'
import $ajax from '../ajax'
import $ai from '../ai'
import $utils from '../utils'

const DEFAULT_API_BASE = 'http://127.0.0.1:3000'
const UPLOAD_TIMEOUT = 30000

function trimSlash(value = '') {
  return String(value).replace(/\/+$/, '')
}

function getApiBase() {
  const configured =
    manifest && manifest.config ? manifest.config.MEMENTO_API_BASE : ''

  return trimSlash(configured || DEFAULT_API_BASE)
}

function apiUrl(path) {
  return `${getApiBase()}${path}`
}

function parseJson(data) {
  if (typeof data !== 'string') {
    return data
  }

  try {
    return JSON.parse(data)
  } catch (error) {
    return data
  }
}

function unwrapResponse(payload) {
  const result = parseJson(payload)

  if (!result || typeof result !== 'object') {
    return result
  }

  if (result.code !== undefined) {
    if (result.code !== 0 && result.code !== '0') {
      throw new Error(result.message || 'request failed')
    }

    return result.data
  }

  if (result.success === true) {
    return result.data || result.value
  }

  if (result.success === false) {
    throw new Error(result.message || 'request failed')
  }

  return result
}

function fallbackRequest(requestTask, fallbackTask) {
  return requestTask().catch(error => {
    console.log('api fallback to mock', error && error.message ? error.message : error)
    return fallbackTask()
  })
}

function pickValue(data, key, fallback) {
  if (!data || data[key] === undefined || data[key] === null || data[key] === '') {
    return fallback
  }

  return data[key]
}

function normalizeUploadFile(file = {}, index = 0, type = 'study') {
  const uri = file.uri || file.path || ''
  const filename = file.filename || file.name || uri.split('/').reverse()[0]

  return {
    id: file.id || `local-${Date.now()}-${index}`,
    type,
    category: file.category || 'custom',
    name: filename || `素材${index + 1}`,
    duration: file.duration || 4,
    tags: file.tags || ['upload', type],
    sortWeight: file.sortWeight || 50 + index,
    uri,
    status: file.status || 'local'
  }
}

function registerLocalMaterial(file = {}, data = {}) {
  const type = $utils.normalizeVlogType(data.type)
  return $utils.mockRequest(normalizeUploadFile(file, data.index || 0, type), 120)
}

function uploadWithRequest(file = {}, data = {}) {
  const type = $utils.normalizeVlogType(data.type)
  const query = {
    type,
    category: data.category || 'custom',
    name: file.filename || file.name || ''
  }
  const url = $utils.queryString(apiUrl('/api/materials/upload'), query)

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('upload timeout'))
    }, data.timeout || UPLOAD_TIMEOUT)

    request.upload({
      url,
      files: [
        {
          uri: file.uri,
          name: 'file',
          filename: file.filename || file.name || 'material.mp4'
        }
      ],
      data: [
        {
          name: 'type',
          value: type
        }
      ],
      success: res => {
        clearTimeout(timer)

        try {
          resolve(unwrapResponse(res && res.data))
        } catch (error) {
          reject(error)
        }
      },
      fail: res => {
        clearTimeout(timer)
        reject(new Error((res && res.errMsg) || 'upload failed'))
      }
    })
  })
}

export default {
  getApiBase,

  health() {
    return $ajax.get(apiUrl('/api/health'))
  },

  getVlogTypes() {
    return fallbackRequest(
      () => $ajax.get(apiUrl('/api/vlog-types')),
      () => $utils.mockRequest($utils.getVlogTypes())
    )
  },

  getShootGuide(data = {}) {
    const type = pickValue(data, 'type', 'study')

    return fallbackRequest(
      () => $ajax.get(apiUrl(`/api/guide/${type}`)).then(result => result.guide || result),
      () => $utils.mockRequest($utils.getShootGuide(type))
    )
  },

  getMaterials(data = {}) {
    return fallbackRequest(
      () => $ajax.get(apiUrl('/api/materials'), data),
      () => $utils.mockRequest($utils.getMaterials(data))
    )
  },

  getMaterialCategories(data = {}) {
    return fallbackRequest(
      () => $ajax.get(apiUrl('/api/materials'), data).then(materials => {
        const categories = materials.map(item => item.category)
        return Array.from(new Set(categories))
      }),
      () => $utils.mockRequest($utils.getMaterialCategories(data.type))
    )
  },

  getStyleTemplates() {
    return fallbackRequest(
      () => $ajax.get(apiUrl('/api/style-templates')),
      () => $utils.mockRequest($utils.getStyleTemplates())
    )
  },

  getStyleTemplate(data = {}) {
    const style = pickValue(data, 'style', 'study')

    return fallbackRequest(
      () =>
        $ajax.get(apiUrl('/api/style-templates')).then(templates => {
          return templates.find(item => item.id === style) || templates[0]
        }),
      () => $utils.mockRequest($utils.getStyleTemplate(style))
    )
  },

  getAiShotPlan(data = {}) {
    return fallbackRequest(
      () => $ajax.post(apiUrl('/api/shot-plan'), data),
      () => $utils.mockRequest($ai.createShotPlan(data))
    )
  },

  uploadMaterial(file = {}, data = {}) {
    if (!file.uri) {
      return registerLocalMaterial(file, data)
    }

    return fallbackRequest(
      () => uploadWithRequest(file, data),
      () => registerLocalMaterial(file, data)
    )
  },

  registerMaterial(file = {}, data = {}) {
    return fallbackRequest(
      () => $ajax.post(apiUrl('/api/materials'), normalizeUploadFile(file, data.index || 0, data.type)),
      () => registerLocalMaterial(file, data)
    )
  },

  generateVlog(data = {}) {
    return fallbackRequest(
      () => $ajax.post(apiUrl('/api/generate/mock'), data, { timeout: 30000 }),
      () => $ai.generateVlogAsync(data, 300)
    )
  },

  /** 导出用片段上传（与 export 路由配合，失败时仅登记本地 uri） */
  uploadExportClip(file = {}) {
    if (!file.uri) {
      return Promise.resolve({ uri: '', local: true })
    }

    return uploadWithRequest(
      {
        uri: file.uri,
        filename: file.filename || 'clip.mp4',
        name: file.filename || 'clip.mp4',
        category: 'video'
      },
      { type: 'export', category: 'video', index: file.index || 0, timeout: 60000 }
    ).catch(() => ({ uri: file.uri, local: true }))
  }
}
