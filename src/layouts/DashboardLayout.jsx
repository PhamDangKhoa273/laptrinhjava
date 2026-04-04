import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar.jsx'
import { RoleBadge } from '../components/RoleBadge.jsx'
import { Button } from '../components/Button.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getPrimaryRole } from '../utils/helpers'
import { ROLES } from '../utils/constants'

const adminLinks = [
  { to: '/dashboard', label: 'Tổng quan', description: 'Tổng quan phiên đăng nhập và kết nối hệ thống' },
  { to: '/dashboard/admin/accounts', label: 'Quản lý tài khoản', description: 'Quản trị người dùng và nhà bán lẻ trên hệ thống' },
  { to: '/dashboard/admin/operations', label: 'Quản lý vận hành', description: 'Duyệt nông trại và theo dõi gói dịch vụ' },
  { to: '/dashboard/admin/products', label: 'Sản phẩm', description: 'Quản lý danh mục, thông tin sản phẩm và dữ liệu' },
  { to: '/dashboard/admin/blockchain', label: 'Blockchain', description: 'Giám sát hợp đồng thông minh và cấu hình blockchain' },
  { to: '/dashboard/appearance', label: 'Giao diện website', description: 'Quản lý tài nguyên hiển thị và xem trước giao diện' },
  { to: '/profile', label: 'Hồ sơ cá nhân', description: 'Xem và cập nhật hồ sơ cá nhân' },
]

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
  if (role === ROLES.ADMIN) return adminLinks
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
            <p className="eyebrow">Trung tâm điều khiển BICAP</p>
            <h1>{user?.fullName || user?.name || 'Bảng điều khiển người dùng'}</h1>
            <p className="header-description">
              Khu vực quản lý giao diện frontend cho phân quyền người dùng, hồ sơ tài khoản và điều hướng theo vai trò.
            </p>
            <div className="header-meta">
              <RoleBadge role={role} />
              <span>{user?.email || 'Chưa có email'}</span>
            </div>
          </div>
          <div className="header-actions">
            <Link to="/profile" className="text-link">Hồ sơ</Link>
            <Button variant="secondary" onClick={handleLogout}>Đăng xuất</Button>
          </div>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
