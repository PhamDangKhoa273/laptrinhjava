const ACCESS_TOKEN_KEY = 'bicap_access_token'
const REFRESH_TOKEN_KEY = 'bicap_refresh_token'
const USER_KEY = 'bicap_user'
const AUTH_VERSION_KEY = 'bicap_auth_version'
const CURRENT_AUTH_VERSION = '2026-04-25-http-only-refresh-cookie'

export function getAccessToken() {
  clearLegacyAuthStorage()
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getStoredUser() {
  clearLegacyAuthStorage()
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setAuthStorage({ accessToken, user }) {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.setItem(AUTH_VERSION_KEY, CURRENT_AUTH_VERSION)
}

export function clearAuthStorage() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(AUTH_VERSION_KEY)
}

export function clearLegacyAuthStorage() {
  if (localStorage.getItem(AUTH_VERSION_KEY) === CURRENT_AUTH_VERSION) return

  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(AUTH_VERSION_KEY)
}
