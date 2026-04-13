import { api } from './api'

function unwrap(response) {
  return response.data?.data || response.data
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
  return unwrap(await api.get(`/processes/season/${seasonId}`))
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
  return unwrap(await api.get(`/batches/${id}/qr`))
}

export async function generateBatchQr(id) {
  return unwrap(await api.post(`/batches/${id}/qr`))
}

export async function traceBatch(id, isPublic = false) {
  const path = isPublic ? `/public/trace/batches/${id}` : `/trace/batches/${id}`
  return unwrap(await api.get(path))
}

export async function verifyBatch(id) {
  return unwrap(await api.get(`/batches/${id}/verify`))
}
