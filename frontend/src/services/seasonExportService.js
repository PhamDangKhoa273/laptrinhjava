import { api } from './api'

function unwrap(response) {
  return response.data?.data || response.data
}

export async function exportSeason(seasonId) {
  return unwrap(await api.post(`/seasons/${seasonId}/export`))
}

export async function getLatestSeasonExport(seasonId) {
  return unwrap(await api.get(`/seasons/${seasonId}/export/latest`))
}
