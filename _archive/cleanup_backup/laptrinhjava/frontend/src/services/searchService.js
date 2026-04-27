import { api } from './api'

function unwrap(response) {
  return response.data?.data || response.data
}

function shouldKeepValue(value) {
  if (value === undefined || value === null) return false
  if (typeof value === 'string') return value.trim() !== ''
  return true
}

export async function searchListings(params = {}) {
  const mappedParams = {
    ...params,
    productCategory: params.productCategory || params.type,
    certification: params.certification,
  }

  const cleanParams = Object.fromEntries(
    Object.entries(mappedParams).filter(([, value]) => shouldKeepValue(value)),
  )

  const payload = unwrap(await api.get('/listings/search', { params: cleanParams }))
  return {
    items: payload.items || [],
    page: payload.page || 0,
    size: payload.size || cleanParams.size || 20,
    totalItems: payload.totalItems || 0,
    totalPages: payload.totalPages || 0,
    sort: payload.sort || cleanParams.sort || 'createdAt,desc',
  }
}
