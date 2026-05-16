import { api } from './api.js'

function unwrap(response) {
  return response?.data?.data ?? response?.data ?? null
}

export async function getPublicSupportConfig() {
  const response = await api.get('/public/support-config', { skipAuth: true })
  return unwrap(response)
}

export async function getAdminSupportConfig() {
  const response = await api.get('/admin/support-config')
  return unwrap(response)
}

export async function updateAdminSupportConfig(payload) {
  const response = await api.put('/admin/support-config', payload)
  return unwrap(response)
}
