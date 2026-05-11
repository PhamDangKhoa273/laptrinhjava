import axios from 'axios'
import { clearAuthStorage, getAccessToken, setAuthStorage } from '../utils/storage'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

export const api = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = config.skipAuth ? null : getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let pendingRequests = []

function flushPendingRequests(error, token = null) {
  pendingRequests.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else {
      promise.resolve(token)
    }
  })
  pendingRequests = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status !== 401 || originalRequest?.skipAuth || originalRequest?._retry || originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/register') || originalRequest?.url?.includes('/auth/refresh')) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const response = await axios.post(`${baseURL}/auth/refresh`, {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      })

      const nextAccessToken = response.data?.data?.accessToken || response.data?.accessToken
      const nextUser = response.data?.data?.user

      if (!nextAccessToken) {
        throw new Error('Missing refreshed access token.')
      }

      setAuthStorage({
        accessToken: nextAccessToken,
        user: nextUser,
      })

      flushPendingRequests(null, nextAccessToken)
      originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`
      return api(originalRequest)
    } catch (refreshError) {
      flushPendingRequests(refreshError, null)
      clearAuthStorage()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)
