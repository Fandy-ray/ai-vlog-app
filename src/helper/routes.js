/**
 * 应用内路由：页面路径集中在 manifest.router.pages 注册；
 * 此处提供命名跳转，避免页面里散落硬编码 uri。
 */
import router from '@system.router'

const PAGES = {
  home: '/pages/home',
  create: '/pages/create',
  editor: '/pages/editor',
  complete: '/pages/complete',
  vlogLearn: '/pages/vlog-learn',
  style: '/pages/style',
  shoot: '/pages/shoot',
  upload: '/pages/upload',
  generate: '/pages/generate',
  preview: '/pages/preview',
  demo: '/pages/Demo',
  demoDetail: '/pages/DemoDetail'
}

function resolveUri(name) {
  if (typeof name === 'string' && name.indexOf('/') === 0) {
    return name
  }

  return PAGES[name] || PAGES.home
}

function push(name, params) {
  router.push({
    uri: resolveUri(name),
    params: params || {}
  })
}

function replace(name, params) {
  router.replace({
    uri: resolveUri(name),
    params: params || {}
  })
}

function back() {
  router.back()
}

export default {
  PAGES,
  push,
  replace,
  back,
  resolveUri
}
