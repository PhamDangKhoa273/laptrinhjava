import { api } from './api'

function unwrap(response) {
  return response.data?.data || response.data
}

export async function getPublicListings() {
  return unwrap(await api.get('/listings'))
}

export async function getListingById(id) {
  return unwrap(await api.get(`/listings/${id}`))
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
