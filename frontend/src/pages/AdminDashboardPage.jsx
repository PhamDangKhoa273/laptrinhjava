import { Navigate } from 'react-router-dom'

const legacyTabRoutes = {
  users: '/dashboard/admin/accounts',
  farms: '/dashboard/admin/farms',
  retailers: '/dashboard/admin/retailers',
  packages: '/dashboard/admin/packages',
  products: '/dashboard/admin/products',
  blockchain: '/dashboard/admin/blockchain',
  operations: '/dashboard/admin/operations',
  analytics: '/dashboard/admin/analytics',
  content: '/dashboard/admin/content',
}

export function AdminDashboardPage({ defaultTab = 'users' }) {
  return <Navigate to={legacyTabRoutes[defaultTab] || '/dashboard/admin/control-center'} replace />
}
