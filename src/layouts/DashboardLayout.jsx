import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar.jsx'
import { RoleBadge } from '../components/RoleBadge.jsx'
import { Button } from '../components/Button.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getPrimaryRole } from '../utils/helpers'

const links = [
  { to: '/dashboard', label: 'Overview', description: 'Frontend integration and auth status summary' },
  { to: '/profile', label: 'Profile center', description: 'Personal and business profile management' },
  { to: '/dashboard/admin', label: 'Admin hub', description: 'User roles and farm approval overview' },
  { to: '/dashboard/farm', label: 'Farm workspace', description: 'Farm profile, package, and season placeholders' },
  { to: '/dashboard/retailer', label: 'Retailer workspace', description: 'Marketplace and order placeholders' },
  { to: '/dashboard/shipping-manager', label: 'Shipping manager', description: 'Shipment, vehicle, and driver placeholders' },
  { to: '/dashboard/driver', label: 'Driver workspace', description: 'Shipment status and handover placeholders' },
  { to: '/dashboard/guest', label: 'Guest view', description: 'Discovery and educational content placeholder' },
]

export function DashboardLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const role = getPrimaryRole(user)

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="dashboard-shell">
      <Sidebar links={links} />
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
