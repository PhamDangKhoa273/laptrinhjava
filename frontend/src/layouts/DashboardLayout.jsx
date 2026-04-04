import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar.jsx'
import { RoleBadge } from '../components/RoleBadge.jsx'
import { Button } from '../components/Button.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getPrimaryRole } from '../utils/helpers'
import { ROLES } from '../utils/constants'

const links = [
  { to: '/dashboard', label: 'Overview', description: 'Frontend integration and auth status summary' },
  { to: '/profile', label: 'Profile center', description: 'Personal and business profile management' },
  { to: '/dashboard/admin', label: 'Admin hub', description: 'User roles and farm approval overview' },
  { to: '/dashboard/farm', label: 'Farm dashboard', description: 'Farm role overview and business links' },
  { to: '/farm/workspace', label: 'Farm profile', description: 'Create and update farm business profile' },
  { to: '/farm/packages', label: 'Farm packages', description: 'Browse packages and create subscriptions' },
  { to: '/dashboard/retailer', label: 'Retailer dashboard', description: 'Retailer overview and business links' },
  { to: '/retailer/workspace', label: 'Retailer profile', description: 'Create and update retailer profile' },
  { to: '/dashboard/shipping-manager', label: 'Shipping manager', description: 'Shipping role overview and business links' },
  { to: '/shipping/workspace', label: 'Drivers & vehicles', description: 'Manage drivers and vehicles' },
  { to: '/dashboard/driver', label: 'Driver workspace', description: 'Shipment status and handover placeholders' },
  { to: '/dashboard/guest', label: 'Guest view', description: 'Discovery and educational content placeholder' },
]

function filterLinksByRole(role) {
  if (role === ROLES.ADMIN) return links
  if (role === ROLES.FARM) return links.filter((item) => ['/dashboard', '/profile', '/dashboard/farm', '/farm/workspace', '/farm/packages'].includes(item.to))
  if (role === ROLES.RETAILER) return links.filter((item) => ['/dashboard', '/profile', '/dashboard/retailer', '/retailer/workspace'].includes(item.to))
  if (role === ROLES.SHIPPING_MANAGER) return links.filter((item) => ['/dashboard', '/profile', '/dashboard/shipping-manager', '/shipping/workspace'].includes(item.to))
  if (role === ROLES.DRIVER) return links.filter((item) => ['/dashboard', '/profile', '/dashboard/driver'].includes(item.to))
  return links.filter((item) => ['/dashboard', '/profile', '/dashboard/guest'].includes(item.to))
}

export function DashboardLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const role = getPrimaryRole(user)
  const visibleLinks = filterLinksByRole(role)

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="dashboard-shell">
      <Sidebar links={visibleLinks} />
      <div className="dashboard-main">
        <header className="dashboard-header enhanced">
          <div>
            <p className="eyebrow">BICAP control center</p>
            <h1>{user?.fullName || user?.name || 'User dashboard'}</h1>
            <p className="header-description">
              Frontend core module for role-based access, profile workflows, and scalable navigation.
            </p>
            <div className="header-meta">
              <RoleBadge role={role} />
              <span>{user?.email || 'No email yet'}</span>
            </div>
          </div>
          <div className="header-actions">
            <Link to="/profile" className="text-link">Profile</Link>
            <Button variant="secondary" onClick={handleLogout}>Logout</Button>
          </div>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
