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

export async function reviewFarm(id, approvalStatus, reviewComment = '') {
  return unwrap(await api.post(`/farms/${id}/review`, { approvalStatus, reviewComment }))
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

export async function getUserById(id) {
  return unwrap(await api.get(`/users/${id}`))
}

export async function getFarmById(id) {
  return unwrap(await api.get(`/farms/${id}`))
}

export async function createAdminAccount(data) {
  return unwrap(await api.post('/users', data))
}

export async function removeUserRole(id, roleName) {
  return unwrap(await api.delete(`/users/${id}/roles`, { data: { roleName } }))
}

export async function updateFarmDetailByAdmin(id, data) {
  return unwrap(await api.put(`/farms/${id}/admin`, data))
}

export async function deleteUserAccount() {
  throw new Error('Delete user account flow is disabled until safe soft-delete is implemented.')
}

export async function deploySmartContract() {
  throw new Error('Smart contract deployment is not wired to a real admin endpoint yet.')
}
