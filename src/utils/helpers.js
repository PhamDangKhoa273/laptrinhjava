import { DEFAULT_ROLE, ROLE_DASHBOARD_PATHS } from './constants'

export function getPrimaryRole(user) {
  const role = user?.primaryRole || user?.role || user?.roles?.[0]?.name || user?.roles?.[0]
  return role || DEFAULT_ROLE
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
