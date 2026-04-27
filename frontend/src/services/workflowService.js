import { api } from './api'

function unwrap(response) {
  return response.data?.data || response.data
}

export async function getMyNotifications() {
  return unwrap(await api.get('/notifications/me'))
}

export async function markNotificationRead(id) {
  return unwrap(await api.patch(`/notifications/${id}/read`))
}

export async function createReport(payload) {
  return unwrap(await api.post('/reports', payload))
}

export async function getMyReports() {
  return unwrap(await api.get('/reports/me'))
}

export async function getPublishedContent() {
  return unwrap(await api.get('/content', { skipAuth: true }))
}

export async function createContent(payload) {
  return unwrap(await api.post('/content', payload))
}

export async function getActiveAnnouncement() {
  return unwrap(await api.get('/announcements/active', { skipAuth: true }))
}

export async function updateActiveAnnouncement(payload) {
  return unwrap(await api.put('/announcements/active', payload))
}

export async function submitListingRegistration(listingId, payload) {
  return unwrap(await api.post(`/listings/${listingId}/submit`, payload))
}

export async function getMyListingRegistrations() {
  return unwrap(await api.get('/listings/registrations/my'))
}

export async function getPendingListingRegistrations() {
  return unwrap(await api.get('/listings/registrations/pending'))
}

export async function reviewListingRegistration(registrationId, payload) {
  return unwrap(await api.patch(`/listings/registrations/${registrationId}/review`, payload))
}

export async function createOrder(payload) {
  return unwrap(await api.post('/orders', payload))
}

export async function getOrdersV2() {
  const data = unwrap(await api.get('/orders'))
  return Array.isArray(data?.items) ? data.items : []
}


export async function getOrderAllowedActions(orderId) {
  const order = await getOrderById(orderId)
  return Array.isArray(order?.allowedActions) ? order.allowedActions : []
}


export async function getOrderById(orderId) {
  return unwrap(await api.get(`/orders/${orderId}`))
}

export async function getOrderStatusHistory(orderId) {
  const data = unwrap(await api.get(`/orders/${orderId}/status-history`))
  return Array.isArray(data?.items) ? data.items : []
}

export async function payOrderDeposit(orderId, payload) {
  return unwrap(await api.post(`/orders/${orderId}/deposit`, payload))
}

export async function farmReviewOrder(orderId, payload) {
  return unwrap(await api.patch(`/orders/${orderId}/status`, payload))
}

export async function updateOrderStatus(orderId, payload) {
  return unwrap(await api.patch(`/orders/${orderId}/status`, payload))
}

export async function confirmOrderDelivery(orderId, payload) {
  return unwrap(await api.post(`/orders/${orderId}/confirm-delivery`, payload))
}

export async function cancelOrder(orderId, payload) {
  return unwrap(await api.post(`/orders/${orderId}/cancel`, payload))
}

export async function uploadShippingProof(orderId, payload) {
  return unwrap(await api.post(`/orders/${orderId}/shipping-proof`, payload))
}

export async function getEligibleShipmentOrders() {
  return unwrap(await api.get('/shipments/eligible-orders'))
}

export async function getShipments() {
  return unwrap(await api.get('/shipments'))
}

export async function getShipmentReportsForReview() {
  return unwrap(await api.get('/shipments/reports'))
}

export async function createShipment(payload) {
  return unwrap(await api.post('/shipments', payload))
}

export async function updateShipmentStatus(shipmentId, payload) {
  return unwrap(await api.patch(`/shipments/${shipmentId}/status`, payload))
}

export async function getMyShipments() {
  return unwrap(await api.get('/shipments/mine'))
}

export async function getFarmShipments() {
  return unwrap(await api.get('/shipments/farm'))
}

export async function getRetailerShipments() {
  return unwrap(await api.get('/shipments/retailer'))
}

export async function getShipmentById(id) {
  return unwrap(await api.get(`/shipments/${id}`))
}

export async function driverConfirmPickup(id, payload) {
  return unwrap(await api.post(`/shipments/${id}/pickup`, payload))
}

export async function driverAddCheckpoint(id, payload) {
  return unwrap(await api.post(`/shipments/${id}/checkpoints`, payload))
}

export async function driverConfirmHandover(id, payload) {
  return unwrap(await api.post(`/shipments/${id}/handover`, payload))
}

export async function driverReportIssue(id, payload) {
  return unwrap(await api.post(`/shipments/${id}/reports`, payload))
}

export async function getPublicAnnouncementFeed() {
  return unwrap(await api.get('/announcements/feed', { skipAuth: true }))
}
