import { api } from './api'
import { getMyFarm } from './businessService'
import { getProducts } from './adminService'

function unwrap(response) {
  return response.data?.data || response.data
}

function normalizeTimelineResponse(payload) {
  if (!payload) return { seasonInfo: null, steps: [] }

  const seasonInfo = payload.seasonInfo || payload.season || null
  const steps = Array.isArray(payload.steps) ? payload.steps : []

  return {
    ...payload,
    seasonInfo,
    steps,
  }
}

function normalizeQrInfo(qrInfo) {
  if (!qrInfo) return null
  return {
    ...qrInfo,
    qrValue: qrInfo.qrValue || qrInfo.qrCodeData || '',
    qrCodeData: qrInfo.qrCodeData || qrInfo.qrValue || '',
  }
}

function normalizeTraceResponse(payload) {
  if (!payload) return null
  return {
    ...payload,
    qrInfo: normalizeQrInfo(payload.qrInfo),
    processList: Array.isArray(payload.processList) ? payload.processList : [],
    timeline: Array.isArray(payload.timeline) ? payload.timeline : [],
  }
}

export async function getSeasons() {
  return unwrap(await api.get('/seasons'))
}

export async function getSeasonById(id) {
  return unwrap(await api.get(`/seasons/${id}`))
}

export async function getSeasonsByFarm(farmId) {
  return unwrap(await api.get(`/seasons/farm/${farmId}`))
}

export async function createSeason(payload) {
  return unwrap(await api.post('/seasons', payload))
}

export async function updateSeason(id, payload) {
  return unwrap(await api.put(`/seasons/${id}`, payload))
}

export async function getSeasonProcesses(seasonId) {
  return normalizeTimelineResponse(unwrap(await api.get(`/processes/season/${seasonId}`)))
}

export async function createSeasonProcess(seasonId, payload) {
  return unwrap(await api.post(`/processes/season/${seasonId}`, payload))
}

export async function updateSeasonProcess(id, payload) {
  return unwrap(await api.put(`/processes/${id}`, payload))
}

export async function deleteSeasonProcess(id) {
  return unwrap(await api.delete(`/processes/${id}`))
}

export async function reorderSeasonProcess(id, stepNo) {
  return unwrap(await api.patch(`/processes/${id}/reorder`, null, { params: { stepNo } }))
}

export async function getBatches() {
  return unwrap(await api.get('/batches'))
}

export async function createBatch(payload) {
  return unwrap(await api.post('/batches', payload))
}

export async function updateBatch(id, payload) {
  return unwrap(await api.put(`/batches/${id}`, payload))
}

export async function getBatchQr(id) {
  return normalizeQrInfo(unwrap(await api.get(`/batches/${id}/qr`)))
}

export async function generateBatchQr(id) {
  return normalizeQrInfo(unwrap(await api.post(`/batches/${id}/qr`)))
}

export async function traceBatch(id, isPublic = false) {
  const path = isPublic ? `/public/trace/batches/${id}` : `/trace/batches/${id}`
  return normalizeTraceResponse(unwrap(await api.get(path, isPublic ? { skipAuth: true } : undefined)))
}

export async function traceBatchByCode(traceCode) {
  return normalizeTraceResponse(unwrap(await api.get('/public/trace', { params: { traceCode }, skipAuth: true })))
}

export async function verifyBatch(id) {
  return unwrap(await api.get(`/batches/${id}/verify`, { skipAuth: true }))
}

export async function getPhase3FarmContext() {
  const [farm, products] = await Promise.allSettled([getMyFarm(), getProducts()])

  return {
    farm: farm.status === 'fulfilled' ? farm.value : null,
    products: products.status === 'fulfilled' && Array.isArray(products.value) ? products.value : [],
  }
}
