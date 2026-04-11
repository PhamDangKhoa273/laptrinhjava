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
  try {
    return unwrap(await api.get('/farms'))
  } catch (error) {
    return []
  }
}

export async function reviewFarm(id, approvalStatus, certificationStatus) {
  return unwrap(await api.put(`/farms/${id}/review`, { approvalStatus, certificationStatus }))
}

export async function getRetailers() {
  try {
    return unwrap(await api.get('/retailers'))
  } catch (error) {
    return []
  }
}

export async function getPackages() {
  try {
    return unwrap(await api.get('/packages'))
  } catch (error) {
    return []
  }
}

// === NEW ADMIN API ENDPOINTS (Mocked/Fallback) === //

export async function getProducts() {
  return unwrap(await api.get('/products'))
}

export async function createProduct(data) {
  return unwrap(await api.post('/products', data))
}

export async function updateProduct(id, data) {
  return unwrap(await api.put(`/products/${id}`, data))
}

export async function deleteProduct(id) {
  return unwrap(await api.delete(`/products/${id}`))
}

export async function getCategories() {
  return unwrap(await api.get('/categories'))
}

export async function createCategory(data) {
  return unwrap(await api.post('/categories', data))
}

export async function updateCategory(id, data) {
  return unwrap(await api.put(`/categories/${id}`, data))
}

export async function deleteCategory(id) {
  return unwrap(await api.delete(`/categories/${id}`))
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
