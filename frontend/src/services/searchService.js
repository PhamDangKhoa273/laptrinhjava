import { api } from './api'

function unwrap(response) {
  return response.data?.data || response.data
}

function shouldKeepValue(value) {
  if (value === undefined || value === null) return false
  if (typeof value === 'string') return value.trim() !== ''
  return true
}

export async function getFilterOptions() {
  const payload = unwrap(await api.get('/listings/filter-options'))
  return {
    provinces: Array.isArray(payload?.provinces) ? payload.provinces : [],
    certifications: Array.isArray(payload?.certifications) ? payload.certifications : [],
  }
}

export async function getCategories() {
  const payload = unwrap(await api.get('/categories'))
  return Array.isArray(payload) ? payload : []
}

export async function searchListings(params = {}) {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => shouldKeepValue(value)),
  )

  const payload = unwrap(await api.get('/search', { params: cleanParams }))
  return {
    items: payload.items || [],
    page: payload.page || 0,
    size: payload.size || cleanParams.size || 20,
    totalItems: payload.totalItems || 0,
    totalPages: payload.totalPages || 0,
    sort: payload.sort || cleanParams.sort || 'createdAt,desc',
  }
}
