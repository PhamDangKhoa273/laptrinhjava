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
  try {
    const response = await api.post('/auth/login', payload)
    const data = response.data?.data || response.data
    return {
      ...data,
      user: normalizeUser(data?.user),
    }
  } catch (error) {
    console.warn("Backend connection failed! Utilizing Mock Login for testing Frontend.");
    // Simulate a fake request delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      token: "mock-jwt-token-123",
      user: normalizeUser({
        id: "mock_123",
        email: payload.email,
        fullName: "Fake Admin (No Backend)",
        roles: [{ name: "ADMIN" }]
      })
    }
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
