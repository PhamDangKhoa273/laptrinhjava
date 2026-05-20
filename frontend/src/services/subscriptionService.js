import { api } from './api'

function unwrap(response) {
  return response.data?.data || response.data
}

export async function getMyFarmSubscriptions() {
  return unwrap(await api.get('/farm-subscriptions/me'))
}

/** Returns the most recent ACTIVE subscription for the current farm, or null. */
export async function getMyActiveSubscription() {
  const list = await getMyFarmSubscriptions().catch(() => null)
  if (!Array.isArray(list)) return null
  return list.find((s) => String(s.subscriptionStatus || s.status).toUpperCase() === 'ACTIVE') || null
}

export async function getServicePackages() {
  return unwrap(await api.get('/packages'))
}

export async function createFarmSubscription(payload) {
  return unwrap(await api.post('/farm-subscriptions', payload))
}

export async function getMySubscriptionPayments() {
  return unwrap(await api.get('/subscription-payments/me'))
}

export async function createSubscriptionPayment(payload) {
  return unwrap(await api.post('/subscription-payments', payload))
}

/** Demo-mode only: confirm a pending payment without HMAC gateway. */
export async function demoConfirmPayment(paymentId) {
  return unwrap(await api.post(`/subscription-payments/${paymentId}/demo-confirm`))
}
