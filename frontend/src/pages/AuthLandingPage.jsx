import { Navigate } from 'react-router-dom'
import { LoadingScreen } from '../components/LoadingScreen.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export function AuthLandingPage() {
  const { isAuthenticated, loading, getPostLoginPath } = useAuth()

  if (loading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <Navigate to={getPostLoginPath()} replace />
}
