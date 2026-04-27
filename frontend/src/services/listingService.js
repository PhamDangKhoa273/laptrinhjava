import { api } from './api'

function unwrap(response) {
  return response.data?.data || response.data
}

function shouldKeepValue(value) {
  if (value === undefined || value === null) return false
  if (typeof value === 'string') return value.trim() !== ''
  return true
}

export async function getPublicListings(params = {}) {
  const mappedParams = {
    ...params,
    productCategory: params.productCategory || params.type,
    certification: params.certification,
  }
  const cleanParams = Object.fromEntries(
    Object.entries(mappedParams).filter(([, value]) => shouldKeepValue(value)),
  )
  const payload = unwrap(await api.get('/listings', { params: cleanParams, skipAuth: true }))
  return {
    items: payload.items || [],
    page: payload.page || 0,
    size: payload.size || cleanParams.size || 9,
    totalItems: payload.totalItems || 0,
    totalPages: payload.totalPages || 0,
    sort: payload.sort || cleanParams.sort || 'createdAt,desc',
  }
}

export async function getListingById(id) {
  return unwrap(await api.get(`/listings/${id}`, { skipAuth: true }))
}

export async function getMyListings() {
  return unwrap(await api.get('/listings/my'))
}

export async function createListing(payload) {
  return unwrap(await api.post('/listings', payload))
}

export async function updateListing(id, payload) {
  return unwrap(await api.put(`/listings/${id}`, payload))
}
