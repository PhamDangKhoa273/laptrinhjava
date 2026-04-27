import { api } from './api'

function unwrap(response) {
  return response.data?.data || response.data
}

export async function getFarmContracts(farmId) {
  return unwrap(await api.get(`/contracts/farm/${farmId}`))
}

export async function getActiveFarmContracts(farmId) {
  return unwrap(await api.get(`/contracts/farm/${farmId}/active`))
}

export async function getRetailerContracts(retailerId) {
  return unwrap(await api.get(`/contracts/retailer/${retailerId}`))
}

export async function createContract(data) {
  return unwrap(await api.post('/contracts', data))
}

export async function reviewContract(contractId, status) {
  return unwrap(await api.patch(`/contracts/${contractId}/review`, null, { params: { status } }))
}

export async function cancelContract(contractId) {
  return unwrap(await api.patch(`/contracts/${contractId}/cancel`))
}
