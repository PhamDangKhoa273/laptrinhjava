import { api } from './api'

function unwrap(response) {
  return response.data?.data || response.data
}

export async function getUsers() {
  return unwrap(await api.get('/users'))
}

export async function assignRole(id, roleName) {
  return unwrap(await api.post(`/users/${id}/roles`, { roleName }))
}

export async function changeUserStatus(id, status) {
  return unwrap(await api.patch(`/users/${id}/status`, { status }))
}

export async function getFarms() {
  return unwrap(await api.get('/farms'))
}

export async function reviewFarm(id, approvalStatus, certificationStatus) {
  return unwrap(await api.put(`/farms/${id}/review`, { approvalStatus, certificationStatus }))
}

export async function getRetailers() {
  return unwrap(await api.get('/retailers'))
}

export async function getPackages() {
  return unwrap(await api.get('/packages'))
}

// === NEW ADMIN API ENDPOINTS (Mocked/Fallback) === //

export async function getProducts() {
  try {
    return unwrap(await api.get('/admin/products'))
  } catch (error) {
    // Mock data if backend fails
    return [
      { id: 1, name: 'Cà chua Cherry', brand:'Farm A', category: 'Rau củ', subCategory: 'Hữu cơ', origin: 'Đà Lạt', certifications: ['VietGAP'], description: 'Cà chua siêu ngọt', totalScanCount: 154, createdOn: '2026-01-10T10:00:00', blockchainTxRef: '0x123...abc' },
      { id: 2, name: 'Dâu tây New Zealand', brand:'DaLat Fresh', category: 'Trái cây', subCategory: 'Hữu cơ', origin: 'Đà Lạt', certifications: ['GlobalGAP'], description: 'Dâu tây đỏ mọng', totalScanCount: 890, createdOn: '2026-02-15T08:30:00', blockchainTxRef: '0xabc...123' },
    ]
  }
}

export async function createAdminAccount(data) {
  try {
    return unwrap(await api.post('/admin/accounts/create', data))
  } catch (error) {
    return { success: true, message: 'Đã tạo Mock Admin thành công' }
  }
}

export async function deleteUserAccount(id) {
  try {
    return unwrap(await api.delete(`/admin/accounts/${id}`))
  } catch (error) {
    return { success: true, message: 'Đã xoá Mock User thành công' }
  }
}

export async function deploySmartContract(payload) {
  try {
    return unwrap(await api.post('/admin/blockchain/deploy', payload))
  } catch (error) {
    return { success: true, txId: '0xmock' + Math.floor(Math.random()*10000) }
  }
}
