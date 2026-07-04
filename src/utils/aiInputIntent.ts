/** 判断用户是否在请求生成标题/文案，而非描述剪辑或功能名 */
export function hasTextGenerationIntent(text: string): boolean {
  const t = text.trim()
  if (!t) return false
  if (/(?:标题|文案|字幕|片头字|解说词|caption)/iu.test(t)) return true
  if (/(?:写|生成|做一个|来一).{0,10}(?:标题|文案|字幕|文字|片头)/iu.test(t)) return true
  if (
    /(?:帮我|请帮我|给我).{0,8}(?:写|生成|做)/iu.test(t) &&
    /(?:标题|文案|字幕|文字|解说|vlog|旅行|日常)/iu.test(t)
  ) {
    return true
  }
  return false
}

/** 功能导航类口语，不应走文案生成 */
export function isFeatureNavigationIntent(text: string): boolean {
  const t = text.trim()
  if (!t) return false
  if (/^(?:魔法涂鸦|智能配乐|ai旁白|语音剪辑)$/iu.test(t)) return true
  return /(?:打开|进入|开启|使用|启动).{0,8}(?:旁白|配乐|滤镜|特效|文字|贴纸|语音剪辑)/iu.test(
    t,
  )
}

import { normalizeDoodleUserInput } from '@/utils/doodlePrompt'

/** 将功能名/空泛描述转为可发给图像模型的具体 prompt */
export function normalizeDoodlePrompt(raw: string): string {
  const normalized = normalizeDoodleUserInput(raw)
  return normalized || '精致可爱的手绘贴纸元素，适合 vlog 叠加'
}

/** 将模型/接口英文报错转为用户可读中文 */
export function mapAiErrorMessage(message: string): string {
  const msg = message.trim()
  if (!msg) return 'AI 暂时无法理解，请换种说法试试'
  if (/invalid input context/i.test(msg)) {
    return '暂未理解这句描述，请说明具体画面、风格或剪辑需求'
  }
  if (/content.?filter|safety|违规|敏感/i.test(msg)) {
    return '描述可能包含不适用内容，请调整措辞后重试'
  }
  if (/rate.?limit|too many/i.test(msg)) {
    return 'AI 请求过于频繁，请稍后再试'
  }
  if (/timeout|timed out/i.test(msg)) {
    return 'AI 响应超时，请检查网络后重试'
  }
  return msg
}
