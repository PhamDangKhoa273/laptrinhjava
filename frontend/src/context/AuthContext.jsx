import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api.js'
import { getCurrentUser, login as loginRequest, logout as logoutRequest, register as registerRequest, updateProfile as updateProfileRequest } from '../services/authService'
import { clearAuthStorage, getAccessToken, getStoredUser, setAuthStorage } from '../utils/storage'
import { getDashboardPathForUser } from '../utils/helpers'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser())
  const [loading, setLoading] = useState(Boolean(getAccessToken()))

  useEffect(() => {
    async function bootstrap() {
      if (!getAccessToken()) {
        try {
          const response = await api.post('/auth/refresh', {})
          const refreshed = response.data?.data || response.data
          if (refreshed?.accessToken) {
            setAuthStorage({ accessToken: refreshed.accessToken })
          } else {
            setLoading(false)
            return
          }
        } catch {
          clearAuthStorage()
          setUser(null)
          setLoading(false)
          return
        }
      }

      try {
        const profile = await getCurrentUser()
        setUser(profile)
        setAuthStorage({ user: profile })
      } catch {
        clearAuthStorage()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    bootstrap()
  }, [])

  async function login(payload) {
    clearAuthStorage()
    const data = await loginRequest(payload)
    const loginUser = data.user || data
    setAuthStorage({
      accessToken: data.accessToken,
      user: loginUser,
    })
    const nextUser = await getCurrentUser().catch(() => loginUser)
    setAuthStorage({ user: nextUser })
    setUser(nextUser)
    return nextUser
  }

  async function register(payload) {
    const data = await registerRequest(payload)
    const nextUser = data.user || data

    if (data.accessToken) {
      setAuthStorage({
        accessToken: data.accessToken,
        user: nextUser,
      })
      setUser(nextUser)
    }

    return nextUser
  }

  async function refreshProfile() {
    const profile = await getCurrentUser()
    setUser(profile)
    setAuthStorage({ user: profile })
    return profile
  }

  async function updateProfile(payload) {
    const profile = await updateProfileRequest(payload)
    setUser(profile)
    setAuthStorage({ user: profile })
    return profile
  }

  async function logout() {
    try {
      await logoutRequest()
    } catch {
      // no-op for local logout fallback
    } finally {
      clearAuthStorage()
      setUser(null)
    }
  }

  const getPostLoginPath = useCallback((nextUser = user) => getDashboardPathForUser(nextUser), [user])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user && getAccessToken()),
      login,
      register,
      logout,
      refreshProfile,
      updateProfile,
      getPostLoginPath,
    }),
    [user, loading, getPostLoginPath],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
