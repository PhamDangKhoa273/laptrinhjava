import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar.jsx'
import { RoleBadge } from '../components/RoleBadge.jsx'
import { Button } from '../components/Button.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getPrimaryRole } from '../utils/helpers'
import { ROLES } from '../utils/constants'

<<<<<<< HEAD:src/layouts/DashboardLayout.jsx
const adminLinks = [
  { to: '/dashboard', label: 'Tổng quan', description: 'Tổng quan phiên đăng nhập và kết nối hệ thống' },
  { to: '/dashboard/admin/accounts', label: 'Quản lý tài khoản', description: 'Quản trị người dùng và nhà bán lẻ trên hệ thống' },
  { to: '/dashboard/admin/operations', label: 'Quản lý vận hành', description: 'Duyệt nông trại và theo dõi gói dịch vụ' },
  { to: '/dashboard/admin/products', label: 'Sản phẩm', description: 'Quản lý danh mục, thông tin sản phẩm và dữ liệu' },
  { to: '/dashboard/admin/blockchain', label: 'Blockchain', description: 'Giám sát hợp đồng thông minh và cấu hình blockchain' },
  { to: '/dashboard/appearance', label: 'Giao diện website', description: 'Quản lý tài nguyên hiển thị và xem trước giao diện' },
  { to: '/profile', label: 'Hồ sơ cá nhân', description: 'Xem và cập nhật hồ sơ cá nhân' },
=======
const links = [
  { to: '/admin/users', label: 'Users', description: 'Manage user accounts and roles' },
    { to: '/admin/farms', label: 'Farm dashboard', description: 'Farm role overview and business links' },

  // { to: '/dashboard', label: 'Overview', description: 'Frontend integration and auth status summary' },
  // { to: '/profile', label: 'Profile center', description: 'Personal and business profile management' },
  // { to: '/admin/dashboard', label: 'Admin hub', description: 'User roles and farm approval overview' },
  // { to: '/admin/farms', label: 'Farm dashboard', description: 'Farm role overview and business links' },
  // { to: '/farm/workspace', label: 'Farm profile', description: 'Create and update farm business profile' },
  // { to: '/farm/packages', label: 'Farm packages', description: 'Browse packages and create subscriptions' },
  // { to: '/dashboard/retailer', label: 'Retailer dashboard', description: 'Retailer overview and business links' },
  // { to: '/retailer/workspace', label: 'Retailer profile', description: 'Create and update retailer profile' },
  // { to: '/dashboard/shipping-manager', label: 'Shipping manager', description: 'Shipping role overview and business links' },
  // { to: '/shipping/workspace', label: 'Drivers & vehicles', description: 'Manage drivers and vehicles' },
  // { to: '/dashboard/driver', label: 'Driver workspace', description: 'Shipment status and handover placeholders' },
  // { to: '/dashboard/guest', label: 'Guest view', description: 'Discovery and educational content placeholder' },
>>>>>>> d2684be:frontend/src/layouts/DashboardLayout.jsx
]

const roleLinks = {
  [ROLES.FARM]: [
    { to: '/dashboard', label: 'Overview', description: 'Tổng quan hệ thống và trạng thái đăng nhập' },
    { to: '/dashboard/farm', label: 'Farm dashboard', description: 'Tổng quan vai trò nông trại' },
    { to: '/profile', label: 'Profile center', description: 'Xem và cập nhật hồ sơ cá nhân' },
  ],
  [ROLES.RETAILER]: [
    { to: '/dashboard', label: 'Overview', description: 'Tổng quan hệ thống và trạng thái đăng nhập' },
    { to: '/dashboard/retailer', label: 'Retailer dashboard', description: 'Tổng quan vai trò nhà bán lẻ' },
    { to: '/profile', label: 'Profile center', description: 'Xem và cập nhật hồ sơ cá nhân' },
  ],
  [ROLES.SHIPPING_MANAGER]: [
    { to: '/dashboard', label: 'Overview', description: 'Tổng quan hệ thống và trạng thái đăng nhập' },
    { to: '/dashboard/shipping-manager', label: 'Shipping dashboard', description: 'Tổng quan vai trò vận chuyển' },
    { to: '/profile', label: 'Profile center', description: 'Xem và cập nhật hồ sơ cá nhân' },
  ],
  [ROLES.DRIVER]: [
    { to: '/dashboard', label: 'Overview', description: 'Tổng quan hệ thống và trạng thái đăng nhập' },
    { to: '/dashboard/driver', label: 'Driver dashboard', description: 'Tổng quan vai trò tài xế' },
    { to: '/profile', label: 'Profile center', description: 'Xem và cập nhật hồ sơ cá nhân' },
  ],
  [ROLES.GUEST]: [
    { to: '/dashboard', label: 'Overview', description: 'Tổng quan hệ thống và trạng thái đăng nhập' },
    { to: '/dashboard/guest', label: 'Guest dashboard', description: 'Tổng quan tài khoản khách' },
    { to: '/profile', label: 'Profile center', description: 'Xem và cập nhật hồ sơ cá nhân' },
  ],
}

function filterLinksByRole(role) {
  if (role === ROLES.ADMIN) return adminLinks
  return roleLinks[role] || roleLinks[ROLES.GUEST]
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
<<<<<<< HEAD:src/layouts/DashboardLayout.jsx
            <p className="eyebrow">Trung tâm điều khiển BICAP</p>
            <h1>{user?.fullName || user?.name || 'Bảng điều khiển người dùng'}</h1>
            <p className="header-description">
              Khu vực quản lý giao diện frontend cho phân quyền người dùng, hồ sơ tài khoản và điều hướng theo vai trò.
            </p>
=======
            <h1 style={{ fontSize: '1.5rem' }}>{user?.fullName || user?.name || 'User dashboard'}</h1>
    
>>>>>>> d2684be:frontend/src/layouts/DashboardLayout.jsx
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
