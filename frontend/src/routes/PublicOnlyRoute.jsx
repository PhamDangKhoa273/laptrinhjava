import { Navigate, Outlet } from 'react-router-dom'
import { LoadingScreen } from '../components/LoadingScreen.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export function PublicOnlyRoute() {
  const { isAuthenticated, loading, getPostLoginPath } = useAuth()

  if (loading) return <LoadingScreen />

  if (isAuthenticated) {
    return <Navigate to={getPostLoginPath()} replace />
  }

  return <Outlet />
}
