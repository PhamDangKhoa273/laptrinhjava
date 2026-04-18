import { api } from './api'

function unwrap(response) {
  return response.data?.data || response.data
}

export async function uploadShippingProofFile(orderId, file) {
  const formData = new FormData()
  formData.append('file', file)
  return unwrap(await api.post(`/orders/${orderId}/shipping-proof/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }))
}

export async function uploadDeliveryProofFile(orderId, file) {
  const formData = new FormData()
  formData.append('file', file)
  return unwrap(await api.post(`/orders/${orderId}/delivery-proof/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }))
}
