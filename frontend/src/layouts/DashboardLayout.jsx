import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getPrimaryRole } from '../utils/helpers'
import { ROLES, ROLE_LABELS } from '../utils/constants'
import { useEffect, useState, useRef } from 'react'
import { getMyNotifications, markNotificationRead } from '../services/workflowService.js'

const prototypeLinks = [
  { to: '/dashboard', label: 'Trang chủ', description: '' },
  { to: '/marketplace', label: 'Chợ nông sản', description: '' },
  { to: '/public/trace', label: 'Truy xuất', description: '' },
  { to: '/announcements', label: 'Thông báo', description: '' },
  { to: '/profile', label: 'Hồ sơ', description: '' },
]

const adminLinks = [
  { to: '/dashboard/admin/control-center', label: 'Tổng quan', icon: 'overview', description: 'Nhiệm vụ quản trị chính' },
  { to: '/dashboard/admin/accounts', label: 'Tài khoản admin', icon: 'adminAccounts', description: 'Admin, vai trò và quyền' },
  { to: '/dashboard/admin/farms', label: 'Trang trại', icon: 'farm', description: 'Duyệt hồ sơ và chứng nhận' },
  { to: '/dashboard/admin/products', label: 'Sản phẩm', icon: 'adminProducts', description: 'Danh mục và mô tả sản phẩm' },
  { to: '/dashboard/admin/operations', label: 'Duyệt đăng sàn', icon: 'listingReview', description: 'Duyệt listing chờ lên chợ' },
  { to: '/dashboard/admin/blockchain', label: 'Blockchain', icon: 'blockchain', description: 'Hợp đồng và dữ liệu truy xuất' },
]

const roleLinks = {
  [ROLES.FARM]: [
    { section: true, label: 'TỔNG QUAN' },
    { to: '/dashboard/farm', label: 'Không gian nông trại', description: 'KPI sản xuất, IoT, đơn hàng' },
    { to: '/farm/profile', label: 'Hồ sơ farm', description: 'Thông tin cá nhân và giấy phép kinh doanh' },
    { to: '/farm/subscription', label: 'Gói dịch vụ', description: 'Mua gói và thanh toán BICAP' },
    { section: true, label: 'SẢN XUẤT' },
    { to: '/farm/seasons', label: 'Mùa vụ', description: 'Tạo mùa vụ và quy trình canh tác' },
    { to: '/farm/packages', label: 'Lô hàng', description: 'Tạo batch từ mùa vụ đã thu hoạch' },
    { to: '/farm/export-qr', label: 'Xuất QR và truy xuất', description: 'Tạo QR và xem truy xuất blockchain' },
    { section: true, label: 'KINH DOANH' },
    { to: '/farm/marketplace', label: 'Đăng sàn', description: 'Tạo listing và gửi duyệt' },
    { to: '/farm/orders', label: 'Đơn hàng từ retailer', description: 'Xử lý yêu cầu mua từ nhà bán lẻ' },
    { to: '/farm/shipping', label: 'Vận chuyển', description: 'Theo dõi shipment liên quan' },
    { to: '/farm/shipment-reports', label: 'Báo cáo vận chuyển', description: 'Báo cáo sự cố từ tài xế' },
    { to: '/farm/contracts', label: 'Hợp đồng', description: 'Hợp tác với nhà bán lẻ' },
    { section: true, label: 'BÁO CÁO' },
    { to: '/farm/reports', label: 'Báo cáo cho admin', description: 'Gửi sự cố hoặc phản ánh đến quản trị viên' },
  ],
  [ROLES.RETAILER]: [
    { section: true, label: 'TỔNG QUAN' },
    { to: '/dashboard/retailer', label: 'Tổng quan', description: 'KPI mua hàng và giao nhận' },
    { to: '/retailer/profile', label: 'Hồ sơ', description: 'Thông tin kinh doanh và giấy phép' },
    { section: true, label: 'MUA HÀNG' },
    { to: '/retailer/marketplace', label: 'Chợ nông sản', description: 'Tìm listing, lọc và xem chi tiết' },
    { to: '/retailer/trace', label: 'Truy xuất QR', description: 'Tra cứu mã truy xuất' },
    { to: '/retailer/orders', label: 'Đơn mua', description: 'Chi tiết, đặt cọc, hủy và lịch sử đơn' },
    { to: '/retailer/shipping', label: 'Giao nhận', description: 'Xác nhận và chứng từ' },
    { section: true, label: 'LIÊN LẠC' },
    { to: '/retailer/notifications', label: 'Hộp thư', description: 'Xem tất cả thông báo từ hệ thống' },
    { to: '/retailer/messages', label: 'Gửi Farm', description: 'Gửi thông báo theo đơn hàng' },
    { to: '/retailer/reports', label: 'Báo cáo', description: 'Gửi báo cáo đến quản trị viên' },
  ],
  [ROLES.SHIPPING_MANAGER]: [
    { section: true, label: 'TỔNG QUAN' },
    { to: '/dashboard/shipping-manager', label: 'Bảng điều khiển', description: 'KPI vận chuyển' },
    { section: true, label: 'ĐƠN HÀNG VÀ VẬN CHUYỂN' },
    { to: '/shipping/orders', label: 'Quản lý đơn hàng', description: 'Xem, tạo, theo dõi và hủy chuyến hàng' },
    { to: '/shipping/completed', label: 'Đơn hàng hoàn thành', description: 'Đơn thành công giữa nhà bán lẻ và trang trại' },
    { section: true, label: 'QUẢN LÝ' },
    { to: '/shipping/drivers', label: 'Tài xế', description: 'Quản lý tài xế' },
    { to: '/shipping/vehicles', label: 'Phương tiện', description: 'Quản lý phương tiện' },
    { section: true, label: 'LIÊN LẠC VÀ BÁO CÁO' },
    { to: '/shipping/sendnotification', label: 'Gửi thông báo', description: 'Gửi đến nông trại, nhà bán lẻ hoặc admin' },
    { to: '/shipping/reports', label: 'Báo cáo từ tài xế', description: 'Sự cố vận hành' },
    { section: true, label: 'TÀI KHOẢN' },
    { to: '/shipping/profile', label: 'Hồ sơ cá nhân', description: 'Thông tin tài khoản' },
  ],
  [ROLES.DRIVER]: [
    { to: '/dashboard/driver', label: 'Tuyến của tôi', description: 'Danh sách và chi tiết chuyến hàng' },
    { to: '/driver/qr', label: 'Quét QR', description: 'Quét truy xuất tại nông trại' },
    { to: '/driver/pickup', label: 'Nhận hàng', description: 'Xác nhận nhận hàng từ farm' },
    { to: '/driver/checkpoint', label: 'Checkpoint', description: 'Cập nhật tiến trình vận chuyển' },
    { to: '/driver/handover', label: 'Bàn giao', description: 'Xác nhận giao cho retailer' },
    { to: '/driver/report', label: 'Báo cáo sự cố', description: 'Gửi báo cáo cho quản lý vận chuyển' },
    { to: '/profile', label: 'Hồ sơ cá nhân', description: 'Thông tin tài khoản' },
  ],
  [ROLES.GUEST]: [
    { to: '/dashboard/guest', label: 'Sàn nông sản', description: 'Tổng quan chợ nông sản' },
    { to: '/guest/search', label: 'Tìm kiếm và lọc', description: 'Tìm kiếm, lọc sản phẩm' },
    { to: '/public/trace', label: 'Truy xuất QR', description: 'Tra cứu truy xuất công khai' },
    { to: '/guest/announcements', label: 'Thông báo', description: 'Tin công khai' },
    { to: '/guest/education', label: 'Kiến thức và video', description: 'Nội dung giáo dục' },
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
    role ? `role-${String(role).toLowerCase().replace('_', '-')}` : '',
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
      {!isDriverMobileRoute ? <Sidebar links={visibleLinks} role={role} /> : null}
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
  const { user } = useAuth()
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
  const role = getPrimaryRole(user)
  const allNotificationsPath =
    role === ROLES.FARM ? '/farm/notifications'
      : role === ROLES.RETAILER ? '/retailer/notifications'
        : role === ROLES.SHIPPING_MANAGER ? '/shipping/notifications'
          : '/profile'

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
            <span>{notifications.length} mục</span>
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
                  {!n.read && <button className="notification-mark-read" onClick={() => handleMarkRead(n.notificationId)} title="Đánh dấu đã đọc"><span className="material-symbols-outlined">check</span></button>}
                </div>
              ))
            )}
          </div>
          <div className="notification-dropdown-footer">
            <a href={allNotificationsPath} onClick={() => setOpen(false)} style={{ display: 'block', textAlign: 'center', padding: '10px', color: '#0d631b', fontWeight: 700, fontSize: 13, textDecoration: 'none', borderTop: '1px solid #e2e8f0' }}>
              Xem tất cả thông báo
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
