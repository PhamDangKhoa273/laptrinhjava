import { api } from './api'

function unwrap(response) {
  return response.data?.data || response.data
}

export async function getMyFarm() {
  return unwrap(await api.get('/farms/me'))
}

export async function createFarm(payload) {
  return unwrap(await api.post('/farms', payload))
}

export async function updateFarm(id, payload) {
  return unwrap(await api.put(`/farms/${id}`, payload))
}

export async function uploadFarmBusinessLicense(id, file) {
  const formData = new FormData()
  formData.append('file', file)
  return unwrap(await api.post(`/farms/${id}/business-license`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }))
}

export async function getAllFarms() {
  return unwrap(await api.get('/farms'))
}

export async function updateFarmApprovalStatus(id, approvalStatus) {
  return unwrap(await api.post(`/farms/${id}/review`, { approvalStatus }))
}

export async function getMyRetailer() {
  return unwrap(await api.get('/retailers/me'))
}

export async function createRetailer(payload) {
  return unwrap(await api.post('/retailers', payload))
}

export async function updateRetailer(id, payload) {
  return unwrap(await api.put(`/retailers/${id}`, payload))
}

export async function getPackages() {
  return unwrap(await api.get('/packages'))
}

export async function getMySubscriptions() {
  return unwrap(await api.get('/farm-subscriptions/me'))
}

export async function createSubscription(payload) {
  return unwrap(await api.post('/farm-subscriptions', payload))
}

export async function getMySubscriptionPayments() {
  return unwrap(await api.get('/subscription-payments/me'))
}

export async function createSubscriptionPayment(payload) {
  return unwrap(await api.post('/subscription-payments', payload))
}

export async function getDrivers() {
  return unwrap(await api.get('/drivers'))
}

export async function createDriver(payload) {
  return unwrap(await api.post('/drivers', payload))
}

export async function updateDriver(id, payload) {
  return unwrap(await api.put(`/drivers/${id}`, payload))
}

export async function getVehicles() {
  return unwrap(await api.get('/vehicles'))
}

export async function createVehicle(payload) {
  return unwrap(await api.post('/vehicles', payload))
}

export async function updateVehicle(id, payload) {
  return unwrap(await api.put(`/vehicles/${id}`, payload))
}

export async function getUsers() {
  return unwrap(await api.get('/users'))
}

export async function assignUserRole(id, roleName) {
  return unwrap(await api.post(`/users/${id}/roles`, { roleName }))
}

export async function updateUserStatus(id, status) {
  return unwrap(await api.patch(`/users/${id}/status`, { status }))
}
