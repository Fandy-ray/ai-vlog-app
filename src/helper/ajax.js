import $fetch from '@system.fetch'
import $utils from './utils'

const TIMEOUT = 20000
const DEFAULT_HEADER = {
  'Content-Type': 'application/json'
}

if (!Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const P = this.constructor
    return this.then(
      value => P.resolve(callback()).then(() => value),
      reason =>
        P.resolve(callback()).then(() => {
          throw reason
        })
    )
  }
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

function normalizeResponse(response) {
  if (!response) {
    return null
  }

  const payload = parseJson(response.data)

  if (
    payload &&
    typeof payload === 'object' &&
    !Object.prototype.hasOwnProperty.call(payload, 'success') &&
    !Object.prototype.hasOwnProperty.call(payload, 'code') &&
    typeof payload.data === 'string'
  ) {
    return parseJson(payload.data)
  }

  return payload
}

function resolveBusinessData(result) {
  if (!result || typeof result !== 'object') {
    return result
  }

  if (result.success === false) {
    throw new Error(result.message || 'request failed')
  }

  if (result.success === true) {
    if (Object.prototype.hasOwnProperty.call(result, 'value')) {
      return result.value
    }

    if (Object.prototype.hasOwnProperty.call(result, 'data')) {
      return result.data
    }
  }

  if (Object.prototype.hasOwnProperty.call(result, 'code')) {
    if (result.code !== 0 && result.code !== '0') {
      throw new Error(result.message || 'request failed')
    }

    if (Object.prototype.hasOwnProperty.call(result, 'data')) {
      return result.data
    }
  }

  return result
}

function fetchPromise(params) {
  return $fetch
    .fetch({
      url: params.url,
      method: params.method,
      data: params.data || {},
      header: params.header || DEFAULT_HEADER
    })
    .then(response => resolveBusinessData(normalizeResponse(response)))
}

function requestHandle(params, timeout = TIMEOUT) {
  return Promise.race([
    fetchPromise(params),
    new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error(`request timeout: ${params.url}`))
      }, timeout)
    })
  ]).catch(error => {
    console.log(`request fail @${params.url}`, error)
    throw error
  })
}

export default {
  get(url, params = {}, options = {}) {
    return requestHandle(
      {
        method: 'get',
        url: $utils.queryString(url, params),
        header: options.header
      },
      options.timeout
    )
  },

  post(url, params = {}, options = {}) {
    return requestHandle(
      {
        method: 'post',
        url,
        data: params,
        header: options.header
      },
      options.timeout
    )
  },

  put(url, params = {}, options = {}) {
    return requestHandle(
      {
        method: 'put',
        url,
        data: params,
        header: options.header
      },
      options.timeout
    )
  }
}
