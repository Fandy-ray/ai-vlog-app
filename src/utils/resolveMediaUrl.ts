/**
 * 将后端返回的 localhost 绝对地址改为当前页面的相对路径，便于手机通过 Vite 代理访问。
 */
export function resolveMediaUrl(url?: string): string {
  if (!url) return ''
  if (url.startsWith('/')) return url

  try {
    const parsed = new URL(url, window.location.origin)
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      return `${parsed.pathname}${parsed.search}`
    }
    return parsed.href
  } catch {
    return url
  }
}
