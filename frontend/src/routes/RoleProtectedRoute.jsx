import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getPrimaryRole } from '../utils/helpers'

export function RoleProtectedRoute({ allowedRoles = [] }) {
  const { user } = useAuth()
  const role = getPrimaryRole(user)

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
