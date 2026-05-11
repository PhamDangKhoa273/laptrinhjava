import { api } from './api'

function unwrap(response) {
  return response.data?.data || response.data
}

export async function getAnalyticsDashboard() {
  return unwrap(await api.get('/analytics/dashboard'))
}

export async function getDemandForecast() {
  return unwrap(await api.get('/analytics/forecast/demand'))
}

export async function getInventoryForecast() {
  return unwrap(await api.get('/analytics/forecast/inventory'))
}

export async function getDeliveryForecast() {
  return unwrap(await api.get('/analytics/forecast/delivery'))
}

export async function getIotForecast() {
  return unwrap(await api.get('/analytics/forecast/iot'))
}