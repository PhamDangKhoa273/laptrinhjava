import { DEFAULT_ROLE, ROLE_DASHBOARD_PATHS, ROLES } from './constants'

const ROLE_PRIORITY = [ROLES.ADMIN, ROLES.SHIPPING_MANAGER, ROLES.DRIVER, ROLES.FARM, ROLES.RETAILER, ROLES.GUEST]

function normalizeRole(value) {
  return String(value || '').toUpperCase().replace(/^ROLE_/, '')
}

export function getPrimaryRole(user) {
  const explicitRole = user?.primaryRole || user?.role
  if (explicitRole) return normalizeRole(explicitRole)

  const roles = Array.isArray(user?.roles)
    ? user.roles.map((item) => normalizeRole(item?.name || item)).filter(Boolean)
    : []

  const prioritizedRole = ROLE_PRIORITY.find((role) => roles.includes(role))
  return prioritizedRole || DEFAULT_ROLE
}

export function getDashboardPathForUser(user) {
  const role = getPrimaryRole(user)
  return ROLE_DASHBOARD_PATHS[role] || ROLE_DASHBOARD_PATHS[DEFAULT_ROLE]
}

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error?.response) {
    if (error?.code === 'ECONNABORTED') return 'The request timed out. Please try again.'
    return 'Cannot connect to the server. Please check the backend connection.'
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
