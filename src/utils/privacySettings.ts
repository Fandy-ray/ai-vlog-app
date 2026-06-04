const STORAGE_KEY = 'memento-privacy-settings'

export interface PrivacySettings {
  /** 允许从系统相册/文件选择器导入视频与图片 */
  albumAccessEnabled: boolean
  /** 允许将画面发送至 AI 进行识图、涂鸦生成等 */
  aiVisionEnabled: boolean
  /** 允许给本地剪辑作品记录浏览器定位，用于记忆花园地图标注 */
  locationTaggingEnabled: boolean
  /** 匿名使用统计，用于改进产品 */
  analyticsEnabled: boolean
  /** 个性化推荐 */
  personalizedRecommendations: boolean
  /** 共同编辑时展示昵称给协作者 */
  showNameInCollaboration: boolean
}

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  albumAccessEnabled: true,
  aiVisionEnabled: true,
  locationTaggingEnabled: true,
  analyticsEnabled: true,
  personalizedRecommendations: true,
  showNameInCollaboration: true,
}

export const PRIVACY_ALBUM_DENIED_MESSAGE =
  '请先在「我的 → 隐私与安全 → 隐私设置」中开启「允许访问相册」'

export const PRIVACY_AI_VISION_DENIED_MESSAGE =
  '请先在「我的 → 隐私与安全 → 隐私设置」中开启「允许 AI 识图」'

export function isAlbumAccessAllowed() {
  return loadPrivacySettings().albumAccessEnabled
}

export function isAiVisionAllowed() {
  return loadPrivacySettings().aiVisionEnabled
}

export function isLocationTaggingAllowed() {
  return loadPrivacySettings().locationTaggingEnabled
}

export function assertAlbumAccessAllowed() {
  if (!isAlbumAccessAllowed()) throw new Error(PRIVACY_ALBUM_DENIED_MESSAGE)
}

export function assertAiVisionAllowed() {
  if (!isAiVisionAllowed()) throw new Error(PRIVACY_AI_VISION_DENIED_MESSAGE)
}

export function loadPrivacySettings(): PrivacySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_PRIVACY_SETTINGS }
    const parsed = JSON.parse(raw) as Partial<PrivacySettings>
    return { ...DEFAULT_PRIVACY_SETTINGS, ...parsed }
  } catch {
    return { ...DEFAULT_PRIVACY_SETTINGS }
  }
}

export function savePrivacySettings(next: PrivacySettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}
