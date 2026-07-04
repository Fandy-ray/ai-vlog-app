import type { MagicDoodleMode } from '@/components/editor/MagicDoodlePanel'

/** 仅功能名/空输入时使用默认主题，保留用户真实描述 */
export function normalizeDoodleUserInput(raw: string): string {
  const text = raw.trim()
  if (!text) return ''
  if (/^(?:魔法涂鸦|涂鸦|magic\s*doodle|打开涂鸦|生成涂鸦|画涂鸦)$/iu.test(text)) {
    return ''
  }
  return text.replace(/^(?:魔法涂鸦|涂鸦)[:：\s]*/iu, '').trim() || text
}

/** 短句、情绪词补充视觉意象，避免模型只生成通用 vlog 装饰 */
function expandVisualCue(text: string): string | null {
  const core = text.replace(/^我(?:很|好|太|非常|特别)?/u, '').trim() || text
  const rules: Array<[RegExp, string]> = [
    [/激动|兴奋|热血|燃|太棒|yyds/u, '欢呼、跳跃、星光迸发、拳头举起、高能量庆祝'],
    [/开心|高兴|快乐|愉快|哈哈/u, '灿烂笑脸、阳光、轻盈活泼、比心'],
    [/难过|伤心|失落|emo|哭/u, '低饱和色调、雨滴、安静感伤、拥抱自己'],
    [/爱|心动|喜欢|浪漫/u, '爱心、粉色调、温馨浪漫'],
    [/惊讶|震惊|哇/u, '瞪大眼睛、感叹号、夸张表情'],
    [/累|困|疲惫/u, '打哈欠、软绵绵、慵懒'],
    [/生气|愤怒/u, '冒火、皱眉、红色调'],
    [/害怕|紧张/u, '冒汗、缩成一团、蓝紫冷色'],
  ]
  for (const [re, visual] of rules) {
    if (re.test(core)) return visual
  }
  return null
}

export function buildDoodleGenerationPrompt(
  userPrompt: string,
  mode: MagicDoodleMode,
  hasDoodle: boolean,
): string {
  const subject = normalizeDoodleUserInput(userPrompt)
  const visualCue = subject ? expandVisualCue(subject) : null

  const themeBlock = subject
    ? visualCue
      ? `【创作主题】${subject}。请用视觉元素表达：${visualCue}。`
      : `【创作主题】${subject}。请把上述描述转化为具体、可识别的图形内容。`
    : '【创作主题】精致可爱的手绘贴纸。'

  const fidelity =
    '必须紧扣创作主题，不要生成与主题无关的通用 vlog 图标、logo、相机或抽象装饰块。'

  if (mode === 'style') {
    const ref = hasDoodle
      ? '参考图由当前视频帧与用户手绘组成，保持原始构图。'
      : '参考图为当前视频帧。'
    return `${themeBlock}${fidelity}${ref}将画面统一转换为指定风格，人物主体自然清晰。`
  }

  if (mode === 'sticker') {
    const ref = hasDoodle
      ? '参考用户手绘线条的形状与位置，结合创作主题进行绘制。'
      : '根据创作主题从零设计，准确传达描述的情绪、物体或场景。'
    return `${themeBlock}${fidelity}${ref}输出单个可叠加贴纸：主体居中完整，线条清晰，纯白背景，无文字无水印。`
  }

  const ref = hasDoodle
    ? '参考用户手绘，结合创作主题生成前景元素。'
    : '根据创作主题设计独立前景元素。'
  return `${themeBlock}${fidelity}${ref}主体完整，纯白背景，不含道路天空等视频背景，无文字。`
}
