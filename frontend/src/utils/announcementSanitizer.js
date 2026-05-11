import createDOMPurify from 'dompurify'

const DEFAULT_ANNOUNCEMENT_HTML = '<p>BICAP</p><p>CHÚC BẠN</p><p>MỘT NGÀY VUI VẺ 😊</p>'
const PURIFY_CONFIG = {
  ALLOWED_TAGS: ['p', 'br', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'u', 'a', 'blockquote', 'h1', 'h2', 'h3', 'h4'],
  ALLOWED_ATTR: ['href', 'title', 'rel'],
  ALLOW_DATA_ATTR: false,
}

const purifier = typeof window !== 'undefined' ? createDOMPurify(window) : null

export function sanitizeAnnouncementHtml(html) {
  if (!purifier) return html || ''
  return purifier.sanitize(html || '', PURIFY_CONFIG)
}

export function getDefaultAnnouncementHtml() {
  return DEFAULT_ANNOUNCEMENT_HTML
}
