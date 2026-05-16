/**
 * 交互动效工具：时长常量、列表轮换、导拍/分镜数据构造、页面动效类名。
 * 供 pages 与 components 复用，避免动画逻辑散落在各页。
 */

const DURATION_MS = 400
const DURATION_SLOW_MS = 500

const PAGE_ENTER_CLASS = 'anim-page-enter'
const PAGE_EXIT_CLASS = 'anim-page-exit'
const FADE_IN_CLASS = 'anim-fade-in'
const FADE_OUT_CLASS = 'anim-fade-out'
const SLIDE_UP_CLASS = 'anim-slide-up'
const CARD_LIFT_CLASS = 'anim-card-lift'
const CARD_EXIT_CLASS = 'anim-card-exit'

function nextIndex(current, length) {
  if (!length) {
    return 0
  }

  return (current + 1) % length
}

/** 由镜头计划生成导拍提示轮播数据 */
function buildPromptList(shots = []) {
  if (!shots.length) {
    return [
      {
        title: '准备开拍',
        shooting: '保持画面稳定，先拍环境再拍细节',
        camera: '慢速横移或固定机位',
        environment: '选择光线均匀、背景简洁的场景'
      }
    ]
  }

  return shots.map((shot, index) => ({
    id: shot.id || `prompt-${index}`,
    title: shot.title || `镜头 ${index + 1}`,
    shooting: shot.tips || '注意主体清晰、构图留白',
    camera: shot.cameraMove || '固定机位',
    environment: shot.scene || '根据场景调整取景'
  }))
}

/** 由镜头计划生成分镜步骤 */
function buildStorySteps(shots = []) {
  if (!shots.length) {
    return [
      {
        id: 'step-1',
        order: 1,
        title: '环境交代',
        desc: '先拍全景建立场景',
        status: 'active'
      }
    ]
  }

  return shots.map((shot, index) => ({
    id: shot.id || `step-${index}`,
    order: shot.order || index + 1,
    title: shot.title || `步骤 ${index + 1}`,
    desc: shot.scene || shot.tips || '',
    status: index === 0 ? 'active' : 'pending'
  }))
}

/** 点击某一步时更新 active / done / pending */
function setActiveStep(steps = [], activeIndex = 0) {
  return steps.map((step, index) => {
    const next = Object.assign({}, step)

    if (index < activeIndex) {
      next.status = 'done'
    } else if (index === activeIndex) {
      next.status = 'active'
    } else {
      next.status = 'pending'
    }

    return next
  })
}

/** 页面 onShow 时触发进入动画（通过切换 class） */
function triggerPageEnter(pageVm) {
  if (!pageVm) {
    return
  }

  pageVm.pageAnimClass = ''
  pageVm.$forceUpdate && pageVm.$forceUpdate()

  setTimeout(() => {
    pageVm.pageAnimClass = PAGE_ENTER_CLASS
  }, 16)
}

export default {
  DURATION_MS,
  DURATION_SLOW_MS,
  PAGE_ENTER_CLASS,
  PAGE_EXIT_CLASS,
  FADE_IN_CLASS,
  FADE_OUT_CLASS,
  SLIDE_UP_CLASS,
  CARD_LIFT_CLASS,
  CARD_EXIT_CLASS,
  nextIndex,
  buildPromptList,
  buildStorySteps,
  setActiveStep,
  triggerPageEnter
}
