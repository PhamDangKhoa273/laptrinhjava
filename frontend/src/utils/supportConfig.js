const STORAGE_KEY = 'bicap.supportConfig.v1'

const DEFAULT_CONFIG = {
  telegramHandle: 'bicap_support',
  telegramDisplay: '@bicap_support',
  zaloPhone: '',
  zaloDisplay: '',
  facebookUrl: '',
  instagramUrl: '',
  tiktokUrl: '',
  youtubeUrl: '',
  linkedinUrl: '',
  twitterUrl: '',
  websiteUrl: '',
  messengerUrl: '',
  whatsappUrl: '',
  email: 'support@bicap.vn',
  hotline: '1900 1009',
  workingHours: 'Thứ 2 - Thứ 7, 8:00 - 18:00',
  note: 'Đội ngũ BICAP sẽ phản hồi trong vòng 30 phút vào giờ hành chính.',
}

export const SUPPORT_CONFIG_EVENT = 'bicap:support-config-changed'

function safeParse(raw) {
  try {
    const parsed = JSON.parse(raw || '{}')
    if (parsed && typeof parsed === 'object') return parsed
  } catch {
    return null
  }
  return null
}

export function getSupportConfig() {
  if (typeof window === 'undefined') return { ...DEFAULT_CONFIG }
  const stored = safeParse(window.localStorage.getItem(STORAGE_KEY))
  return { ...DEFAULT_CONFIG, ...(stored || {}) }
}

export function saveSupportConfig(config) {
  if (typeof window === 'undefined') return
  const merged = { ...DEFAULT_CONFIG, ...(config || {}) }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  window.dispatchEvent(new CustomEvent(SUPPORT_CONFIG_EVENT, { detail: merged }))
}

export async function refreshSupportConfigFromBackend() {
  if (typeof window === 'undefined') return null
  try {
    const { getPublicSupportConfig } = await import('../services/supportService.js')
    const remote = await getPublicSupportConfig()
    if (remote && typeof remote === 'object') {
      saveSupportConfig(remote)
      return getSupportConfig()
    }
  } catch {
    return null
  }
  return null
}

export function buildTelegramLink(handle) {
  const value = String(handle || '').trim()
  if (!value) return ''
  if (value.startsWith('http')) return value
  const clean = value.replace(/^@/, '')
  return `https://t.me/${clean}`
}

export function buildZaloLink(phone) {
  const value = String(phone || '').trim()
  if (!value) return ''
  if (value.startsWith('http')) return value
  const clean = value.replace(/\D/g, '')
  if (!clean) return ''
  return `https://zalo.me/${clean}`
}


export function normalizeExternalUrl(value) {
  const v = String(value || '').trim()
  if (!v) return ''
  if (v.startsWith('http://') || v.startsWith('https://')) return v
  return `https://${v}`
}

export const SOCIAL_DEFINITIONS = [
  { key: 'facebookUrl',  label: 'Facebook',        icon: 'facebook',          tone: '#1877f2' },
  { key: 'messengerUrl', label: 'Messenger',       icon: 'forum',             tone: '#0084ff' },
  { key: 'instagramUrl', label: 'Instagram',       icon: 'photo_camera',      tone: '#e1306c' },
  { key: 'tiktokUrl',    label: 'TikTok',          icon: 'music_note',        tone: '#010101' },
  { key: 'youtubeUrl',   label: 'YouTube',         icon: 'smart_display',     tone: '#ff0000' },
  { key: 'linkedinUrl',  label: 'LinkedIn',        icon: 'work',              tone: '#0a66c2' },
  { key: 'twitterUrl',   label: 'X (Twitter)',     icon: 'close',             tone: '#0f172a' },
  { key: 'whatsappUrl',  label: 'WhatsApp',        icon: 'chat',              tone: '#25d366' },
  { key: 'websiteUrl',   label: 'Website cá nhân', icon: 'language',          tone: '#1f6b4a' },
]
