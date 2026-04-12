import { api } from './api'

function normalizeUser(user) {
  if (!user) return null

  return {
    ...user,
    phoneNumber: user.phoneNumber ?? user.phone ?? '',
    profile: user.profile ?? {},
  }
}

export async function login(payload) {
  const response = await api.post('/auth/login', payload)
  const data = response.data?.data || response.data
  return {
    ...data,
    user: normalizeUser(data?.user),
  }
}

export async function register(payload) {
  const requestPayload = {
    fullName: payload.fullName,
    email: payload.email,
    phone: payload.phone ?? payload.phoneNumber ?? '',
    password: payload.password,
    avatarUrl: payload.avatarUrl ?? '',
  }

  const response = await api.post('/auth/register', requestPayload)
  return normalizeUser(response.data?.data || response.data)
}

export async function getCurrentUser() {
  const response = await api.get('/auth/me')
  return normalizeUser(response.data?.data || response.data)
}

export async function updateProfile(payload) {
  const requestPayload = {
    fullName: payload.fullName,
    phone: payload.phone ?? payload.phoneNumber ?? '',
    avatarUrl: payload.avatarUrl ?? '',
  }

  const response = await api.put('/users/me/profile', requestPayload)
  return normalizeUser(response.data?.data || response.data)
}

export async function logout() {
  const response = await api.post('/auth/logout')
  return response.data?.data || response.data
}

export async function forgotPassword(payload) {
  const response = await api.post('/auth/forgot-password', payload)
  return response.data?.data || response.data
}

export async function resetPassword(payload) {
  const response = await api.post('/auth/reset-password', payload)
  return response.data?.data || response.data
}
