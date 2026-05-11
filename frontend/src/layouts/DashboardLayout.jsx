import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getPrimaryRole } from '../utils/helpers'
import { ROLES, ROLE_LABELS } from '../utils/constants'
import { useEffect, useState, useRef, useCallback } from 'react'
import { getMyNotifications, markNotificationRead } from '../services/workflowService.js'
import { SupportButton } from '../components/SupportButton.jsx'

const prototypeLinks = [
  { to: '/dashboard', label: 'Trang chủ', description: '' },
  { to: '/marketplace', label: 'Chợ nông sản', description: '' },
  { to: '/public/trace', label: 'Truy xuất', description: '' },
  { to: '/announcements', label: 'Thông báo', description: '' },
  { to: '/profile', label: 'Hồ sơ', description: '' },
]

const adminLinks = [
  { to: '/dashboard/admin/control-center', label: 'Trung tâm điều hành', description: 'Sức khỏe hệ thống và thao tác nhanh' },
  { to: '/dashboard/admin/accounts', label: 'Tài khoản', description: 'Người dùng, vai trò, khóa và xác minh' },
  { to: '/dashboard/admin/operations', label: 'Vận hành', description: 'Đơn hàng, lô hàng, vận chuyển, khiếu nại' },
  { to: '/dashboard/admin/farms', label: 'Nông trại', description: 'Hồ sơ nông trại và chứng nhận' },
  { to: '/dashboard/admin/retailers', label: 'Nhà bán lẻ', description: 'Hồ sơ nhà bán lẻ và đơn hàng' },
  { to: '/dashboard/admin/packages', label: 'Gói dịch vụ', description: 'Gói dịch vụ và truy xuất' },
  { to: '/dashboard/admin/logistics', label: 'Logistics', description: 'Chuyến hàng, tài xế, bằng chứng' },
  { to: '/dashboard/admin/products', label: 'Sản phẩm', description: 'Sản phẩm, danh mục, lô hàng' },
  { to: '/dashboard/admin/blockchain', label: 'Truy xuất blockchain', description: 'Giao dịch và nhật ký kiểm toán' },
  { to: '/dashboard/admin/content', label: 'Nội dung', description: 'Thông báo và kiến thức' },
  { to: '/dashboard/admin/analytics', label: 'Phân tích', description: 'Báo cáo tăng trưởng và vận hành' },
  { to: '/dashboard/appearance', label: 'Giao diện website', description: 'Logo, thương hiệu, banner chợ nông sản' },
  { to: '/profile', label: 'Hồ sơ', description: 'Cài đặt tài khoản cá nhân' },
]

const roleLinks = {
  [ROLES.FARM]: [
    { to: '/dashboard', label: 'Trang chủ', description: 'Trang tổng quan chung' },
    { to: '/marketplace', label: 'Chợ nông sản', description: 'Xem listing công khai' },
    { to: '/public/trace', label: 'Truy xuất', description: 'Truy xuất mã QR sản phẩm' },
    { to: '/announcements', label: 'Thông báo', description: 'Cập nhật và thông báo công khai' },
    { to: '/profile', label: 'Hồ sơ', description: 'Thông tin cá nhân và bảo mật' },
    { to: '/dashboard/farm', label: 'Không gian nông trại', description: 'KPI, sức khỏe sản xuất, việc cần làm hôm nay' },
    { to: '/farm/packages', label: 'Gói / Lô hàng', description: 'Thẻ lô, QR, blockchain, trạng thái chợ' },
    { to: '/farm/seasons', label: 'Mùa vụ', description: 'Mùa vụ, nhật ký canh tác, thu hoạch' },
  ],
  [ROLES.RETAILER]: [
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
  ],
  [ROLES.GUEST]: [
    { to: '/dashboard/guest', label: 'Sàn nông sản', description: 'Tổng quan chợ nông sản' },
    { to: '/guest/search', label: 'Tìm kiếm & lọc', description: 'Tìm kiếm/lọc sản phẩm' },
    { to: '/public/trace', label: 'Truy xuất QR', description: 'Tra cứu truy xuất công khai' },
    { to: '/guest/announcements', label: 'Thông báo', description: 'Tin công khai' },
    { to: '/guest/education', label: 'Kiến thức/video', description: 'Nội dung giáo dục' },
    { to: '/profile', label: 'Hồ sơ cá nhân', description: 'Thông tin tài khoản' },
  ],
}

function filterLinksByRole(role) {
  if (role === ROLES.ADMIN) return adminLinks
  return roleLinks[role] || roleLinks[ROLES.GUEST]
}

export function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const role = getPrimaryRole(user)
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

  async function handleGlobalLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

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
            <SupportButton />
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
            </div>
            <button className="dashboard-logout-button" type="button" onClick={handleGlobalLogout}>
              Đăng xuất
            </button>
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
