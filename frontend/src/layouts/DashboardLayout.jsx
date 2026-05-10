import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar.jsx'
import { RoleBadge } from '../components/RoleBadge.jsx'
import { Button } from '../components/Button.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getPrimaryRole } from '../utils/helpers'
<<<<<<< Updated upstream
import { ROLES } from '../utils/constants'
=======
import { ROLES, ROLE_LABELS } from '../utils/constants'
import { useEffect, useState, useRef, useCallback } from 'react'
import { getMyNotifications, markNotificationRead } from '../services/workflowService.js'

const prototypeLinks = [
  { to: '/dashboard', label: 'Trang chủ', description: '' },
  { to: '/marketplace', label: 'Chợ nông sản', description: '' },
  { to: '/public/trace', label: 'Truy xuất', description: '' },
  { to: '/announcements', label: 'Thông báo', description: '' },
  { to: '/profile', label: 'Hồ sơ', description: '' },
]
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
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
=======
    { section: true, label: 'TỔNG QUAN' },
    { to: '/dashboard/retailer', label: 'Tổng quan', description: 'KPI mua hàng và giao nhận' },
    { to: '/retailer/profile', label: 'Hồ sơ', description: 'Thông tin kinh doanh và giấy phép' },
    { section: true, label: 'MUA HÀNG' },
    { to: '/retailer/marketplace', label: 'Chợ nông sản', description: 'Tìm listing, lọc và xem chi tiết' },
    { to: '/retailer/trace', label: 'Truy xuất QR', description: 'Tra cứu mã truy xuất' },
    { to: '/retailer/orders', label: 'Đơn hàng', description: 'Tạo và quản lý đơn' },
    { to: '/retailer/deposit', label: 'Đặt cọc', description: 'Thanh toán cọc' },
    { to: '/retailer/history', label: 'Lịch sử', description: 'Trạng thái và timeline' },
    { to: '/retailer/shipping', label: 'Giao nhận', description: 'Xác nhận và chứng từ' },
    { to: '/retailer/contracts', label: 'Hợp đồng', description: 'Theo dõi thỏa thuận hợp tác' },
    { section: true, label: 'LIÊN LẠC' },
    { to: '/retailer/messages', label: 'Tin nhắn farm', description: 'Trao đổi với nông trại' },
    { to: '/retailer/reports', label: 'Báo cáo admin', description: 'Gửi báo cáo sự cố' },
    { to: '/profile', label: 'Hồ sơ cá nhân', description: 'Cài đặt tài khoản' },
  ],
  [ROLES.SHIPPING_MANAGER]: [
    { section: true, label: 'TỔNG QUAN' },
    { to: '/dashboard/shipping-manager', label: 'Bảng điều khiển', description: 'KPI vận chuyển' },
    { section: true, label: 'ĐƠN HÀNG & VẬN CHUYỂN' },
    { to: '/shipping/orders', label: 'Quản lý đơn hàng', description: 'Xem, tạo, theo dõi và hủy chuyến hàng' },
    { to: '/shipping/completed', label: 'Đơn hàng hoàn thành', description: 'Xem đơn hàng thành công giữa nhà bán lẻ và trang trại' },
    { section: true, label: 'QUẢN LÝ' },
    { to: '/shipping/drivers', label: 'Tài xế', description: 'Quản lý tài xế' },
    { to: '/shipping/vehicles', label: 'Phương tiện', description: 'Quản lý phương tiện' },
    { section: true, label: 'LIÊN LẠC & BÁO CÁO' },
    { to: '/shipping/sendnotification', label: 'Gửi thông báo', description: 'Gửi đến nông trại, nhà bán lẻ hoặc quản trị viên' },
    { to: '/shipping/reports', label: 'Báo cáo từ tài xế', description: 'Sự cố vận hành' },
    { section: true, label: 'TÀI KHOẢN' },
    { to: '/shipping/profile', label: 'Hồ sơ cá nhân', description: 'Thông tin tài khoản' },
  ],
  [ROLES.DRIVER]: [
    { to: '/dashboard/driver', label: 'Tuyến của tôi', description: 'Danh sách/chi tiết chuyến hàng' },
    { to: '/driver/mobile', label: 'Ứng dụng Di động', description: 'Giao diện tối ưu cho điện thoại' },
    { to: '/driver/qr', label: 'Quét QR', description: 'Quét truy xuất tại nông trại' },
    { to: '/driver/pickup', label: 'Nhận hàng', description: 'Xác nhận nhận hàng' },
    { to: '/driver/checkpoint', label: 'Checkpoint', description: 'Cập nhật tiến trình' },
    { to: '/driver/handover', label: 'Bàn giao', description: 'Xác nhận bàn giao' },
    { to: '/driver/report', label: 'Báo cáo sự cố', description: 'Báo cáo quản lý vận chuyển' },
    { to: '/profile', label: 'Hồ sơ cá nhân', description: 'Thông tin tài khoản' },
>>>>>>> Stashed changes
  ],
  [ROLES.GUEST]: [
    { to: '/dashboard', label: 'Overview', description: 'Tổng quan hệ thống và trạng thái đăng nhập' },
    { to: '/dashboard/guest', label: 'Sàn giao dịch', description: 'Chợ nông sản sạch' },
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
<<<<<<< Updated upstream
  const visibleLinks = filterLinksByRole(role)
=======
  const isPrototypeRoute = location.pathname === '/dashboard' || location.pathname === '/profile'
  const isProfileRoute = location.pathname === '/profile'
  const isDriverMobileRoute = role === ROLES.DRIVER && (location.pathname === '/dashboard/driver' || location.pathname.startsWith('/driver/'))
  const visibleLinks = isPrototypeRoute ? prototypeLinks : filterLinksByRole(role)
  const shellClassName = [
    'dashboard-shell',
    role === ROLES.ADMIN && !isPrototypeRoute ? 'role-admin' : '',
    isPrototypeRoute ? 'prototype-shell' : '',
    location.pathname === '/dashboard' ? 'prototype-dashboard-shell' : '',
    isProfileRoute ? 'prototype-profile-shell' : '',
    isDriverMobileRoute ? 'driver-mobile-layout' : '',
  ].filter(Boolean).join(' ')
>>>>>>> Stashed changes

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

<<<<<<< Updated upstream
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
=======
  const displayName = user?.fullName || user?.email || 'Người dùng BICAP'
  const roleLabel = ROLE_LABELS[role] || role || 'Tài khoản đã xác thực'

  return (
    <div className={shellClassName}>
      {!isDriverMobileRoute ? <Sidebar links={visibleLinks} /> : null}
      <div className="dashboard-main">
        {!isDriverMobileRoute ? <header className="dashboard-topbar" aria-label="Thanh điều hướng không gian làm việc">
          <div className="dashboard-topbar-main">
            {isProfileRoute ? <span className="dashboard-topbar-title">BICAP</span> : null}
          </div>
          <div className="dashboard-topbar-actions">
            <NotificationBell />
            <button className="dashboard-icon-button" type="button" aria-label="Cài đặt">
              <span className="material-symbols-outlined" aria-hidden="true">settings</span>
            </button>
            <div className="dashboard-topbar-divider" aria-hidden="true" />
            <div className="dashboard-user-mini" aria-label="Người dùng hiện tại">
              <div>
                <strong>{displayName}</strong>
                <span>{roleLabel}</span>
              </div>
              <span className="dashboard-user-avatar prototype-avatar-img">M</span>
>>>>>>> Stashed changes
            </div>
          </div>
          <div className="header-actions">
            <Link to="/profile" className="text-link">Hồ sơ</Link>
            <Button variant="secondary" onClick={handleLogout}>Đăng xuất</Button>
          </div>
        </header> : null}
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  async function load() {
    try { setNotifications(await getMyNotifications() || []) } catch { }
  }
  useEffect(() => { load() }, [])

  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const unread = notifications.filter(n => !n.read).length

  async function handleMarkRead(id) {
    try {
      await markNotificationRead(id)
      await load()
    } catch { }
  }

  return (
    <div className="notification-bell-wrapper" ref={ref}>
      <button className="dashboard-icon-button" type="button" aria-label="Thông báo" onClick={() => { setOpen(!open); if (!open) load() }}>
        <span className="material-symbols-outlined" aria-hidden="true">notifications</span>
        {unread > 0 && <span className="notification-badge">{unread}</span>}
      </button>
      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <strong>Thông báo</strong>
            <span>{notifications.length} cái</span>
          </div>
          <div className="notification-dropdown-list">
            {notifications.length === 0 ? (
              <div className="notification-dropdown-empty">Không có thông báo</div>
            ) : (
              notifications.slice(0, 10).map(n => (
                <div key={n.notificationId} className={`notification-dropdown-item ${n.read ? '' : 'unread'}`}>
                  <div className="notification-item-main">
                    <strong>{n.title}</strong>
                    <p>{n.message}</p>
                    <small>{new Date(n.createdAt).toLocaleDateString('vi-VN')}</small>
                  </div>
                  {!n.read && <button className="notification-mark-read" onClick={() => handleMarkRead(n.notificationId)} title="Đánh dấu đọc"><span className="material-symbols-outlined">check</span></button>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
