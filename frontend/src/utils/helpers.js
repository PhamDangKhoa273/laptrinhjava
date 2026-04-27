import { DEFAULT_ROLE, ROLE_DASHBOARD_PATHS, ROLES } from './constants'

const ROLE_PRIORITY = [ROLES.ADMIN, ROLES.SHIPPING_MANAGER, ROLES.DRIVER, ROLES.FARM, ROLES.RETAILER, ROLES.GUEST]

function normalizeRole(value) {
  return String(value || '').toUpperCase().replace(/^ROLE_/, '')
}

function normalizeRoles(user) {
  if (!user) return []

  const roles = []
  const addRole = (value) => {
    const normalized = normalizeRole(value?.name || value)
    if (normalized && !roles.includes(normalized)) roles.push(normalized)
  }

  if (Array.isArray(user.roles)) user.roles.forEach(addRole)
  addRole(user.primaryRole)
  addRole(user.role)

  return roles
}

export function getPrimaryRole(user) {
  const roles = normalizeRoles(user)
  const prioritizedRole = ROLE_PRIORITY.find((role) => roles.includes(role))
  return prioritizedRole || DEFAULT_ROLE
}

export function getDashboardPathForUser(user) {
  const role = getPrimaryRole(user)
  return ROLE_DASHBOARD_PATHS[role] || ROLE_DASHBOARD_PATHS[DEFAULT_ROLE]
}

export function getErrorMessage(error, fallback = 'Đã xảy ra lỗi. Vui lòng thử lại.') {
  if (!error?.response) {
    if (error?.code === 'ECONNABORTED') return 'Yêu cầu quá thời gian chờ. Vui lòng thử lại.'
    return 'Không thể kết nối máy chủ. Vui lòng kiểm tra backend.'
  }

  const apiMessage = error?.response?.data?.message || error?.response?.data?.error
  if (typeof apiMessage === 'string' && apiMessage.trim()) return apiMessage

  const validationErrors = error?.response?.data?.errors
  if (Array.isArray(validationErrors) && validationErrors.length) {
    return validationErrors.map((item) => item.message || item.defaultMessage).filter(Boolean).join(', ')
  }

  return fallback
}

export function mapBackendValidationErrors(error) {
  const rawErrors = error?.response?.data?.errors
  if (!Array.isArray(rawErrors)) return {}

  return rawErrors.reduce((acc, item) => {
    const field = item?.field || item?.path || item?.param || item?.property
    const message = item?.message || item?.defaultMessage || item?.msg

    if (!field || !message) return acc

    const normalizedField = String(field)
      .replace(/^profile\./, '')
      .replace(/^user\./, '')
      .trim()

    if (!acc[normalizedField]) {
      acc[normalizedField] = message
    }

    return acc
  }, {})
}
