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
  { to: '/dashboard/admin/operations', label: 'Nông trại và vận hành', description: 'Duyệt nông trại và theo dõi gói dịch vụ' },
  { to: '/admin/operations-plus', label: 'Control center', description: 'Gom listing approval, report, notification và guest content vào một chỗ' },
  { to: '/dashboard/admin/products', label: 'Sản phẩm', description: 'Quản lý danh mục, thông tin sản phẩm và dữ liệu' },
  { to: '/dashboard/admin/blockchain', label: 'Blockchain', description: 'Giám sát hợp đồng thông minh và cấu hình blockchain' },
  { to: '/dashboard/appearance', label: 'Giao diện website', description: 'Quản lý tài nguyên hiển thị và xem trước giao diện' },
  { to: '/profile', label: 'Hồ sơ cá nhân', description: 'Xem và cập nhật hồ sơ cá nhân' },
]

const roleLinks = {
  [ROLES.FARM]: [
    { to: '/dashboard', label: 'Overview', description: 'Tổng quan hệ thống và trạng thái đăng nhập' },
    { to: '/dashboard/farm', label: 'Farm dashboard', description: 'Tổng quan vai trò nông trại' },
    { to: '/farm/workflow', label: 'Farm workflow', description: 'Theo dõi notification, report và tiến độ duyệt listing' },
    { to: '/profile', label: 'Profile center', description: 'Xem và cập nhật hồ sơ cá nhân' },
  ],
  [ROLES.RETAILER]: [
    { to: '/dashboard', label: 'Overview', description: 'Tổng quan hệ thống và trạng thái đăng nhập' },
    { to: '/dashboard/retailer', label: 'Retailer dashboard', description: 'Tổng quan vai trò nhà bán lẻ' },
    { to: '/retailer/orders', label: 'Order workflow', description: 'Đặt cọc, hủy đơn và xác nhận giao hàng' },
    { to: '/profile', label: 'Profile center', description: 'Xem và cập nhật hồ sơ cá nhân' },
  ],
  [ROLES.SHIPPING_MANAGER]: [
    { to: '/dashboard', label: 'Overview', description: 'Tổng quan hệ thống và trạng thái đăng nhập' },
    { to: '/dashboard/shipping-manager', label: 'Shipping dashboard', description: 'Tổng quan vai trò vận chuyển' },
    { to: '/shipping/proof', label: 'Shipping proof', description: 'Ghi nhận bằng chứng giao vận' },
    { to: '/profile', label: 'Profile center', description: 'Xem và cập nhật hồ sơ cá nhân' },
  ],
  [ROLES.DRIVER]: [
    { to: '/dashboard', label: 'Overview', description: 'Tổng quan hệ thống và trạng thái đăng nhập' },
    { to: '/dashboard/driver', label: 'Driver dashboard', description: 'Tổng quan vai trò tài xế' },
    { to: '/driver/proof', label: 'Delivery proof', description: 'Ghi nhận bằng chứng giao vận khi đi tuyến' },
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
