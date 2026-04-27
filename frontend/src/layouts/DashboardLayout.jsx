import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getPrimaryRole } from '../utils/helpers'
import { ROLES, ROLE_LABELS } from '../utils/constants'

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
    { to: '/dashboard/retailer', label: 'Retailer tổng quan', description: 'KPI mua hàng và giao nhận' },
    { to: '/retailer/profile', label: 'Hồ sơ & giấy phép', description: 'Thông tin kinh doanh và giấy phép' },
    { to: '/retailer/marketplace', label: 'Tìm nông sản', description: 'Tìm kiếm, lọc, chi tiết sản phẩm' },
    { to: '/retailer/trace', label: 'Truy xuất QR', description: 'Quét/tải mã truy xuất' },
    { to: '/retailer/orders', label: 'Tạo đơn hàng', description: 'Tạo yêu cầu đặt hàng từ listing' },
    { to: '/retailer/deposit', label: 'Đặt cọc', description: 'Thanh toán đặt cọc' },
    { to: '/retailer/history', label: 'Lịch sử đơn', description: 'Chi tiết và trạng thái đơn hàng' },
    { to: '/retailer/shipping', label: 'Giao nhận', description: 'Bằng chứng và xác nhận giao hàng' },
    { to: '/retailer/messages', label: 'Tin nhắn farm', description: 'Thông báo giữa nông trại và nhà bán lẻ' },
    { to: '/retailer/reports', label: 'Báo cáo admin', description: 'Gửi báo cáo cho quản trị viên' },
    { to: '/profile', label: 'Hồ sơ cá nhân', description: 'Thông tin tài khoản' },
  ],
  [ROLES.SHIPPING_MANAGER]: [
    { to: '/dashboard/shipping-manager', label: 'Tổng quan vận chuyển', description: 'KPI vận chuyển' },
    { to: '/shipping/orders', label: 'Đơn đủ điều kiện', description: 'Đơn hàng sẵn sàng tạo chuyến' },
    { to: '/shipping/create', label: 'Tạo shipment', description: 'Chọn tài xế, phương tiện, đơn hàng' },
    { to: '/shipping/tracking', label: 'Theo dõi chuyến hàng', description: 'Dòng thời gian và trạng thái' },
    { to: '/shipping/drivers', label: 'Tài xế', description: 'Quản lý tài xế' },
    { to: '/shipping/vehicles', label: 'Phương tiện', description: 'Quản lý phương tiện' },
    { to: '/shipping/notifications', label: 'Thông báo', description: 'Thông báo nông trại/nhà bán lẻ' },
    { to: '/shipping/reports', label: 'Báo cáo driver/admin', description: 'Quy trình sự cố và báo cáo' },
    { to: '/profile', label: 'Hồ sơ cá nhân', description: 'Thông tin tài khoản' },
  ],
  [ROLES.DRIVER]: [
    { to: '/dashboard/driver', label: 'Tuyến của tôi', description: 'Danh sách/chi tiết chuyến hàng' },
    { to: '/driver/qr', label: 'Quét QR pickup', description: 'Quét truy xuất tại nông trại' },
    { to: '/driver/pickup', label: 'Nhận hàng', description: 'Xác nhận nhận hàng' },
    { to: '/driver/checkpoint', label: 'Checkpoint', description: 'Cập nhật tiến trình' },
    { to: '/driver/handover', label: 'Bàn giao', description: 'Xác nhận bàn giao' },
    { to: '/driver/report', label: 'Báo cáo sự cố', description: 'Báo cáo quản lý vận chuyển' },
    { to: '/driver/mobile', label: 'Mobile workflow', description: 'PWA cho tài xế' },
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
  const visibleLinks = isPrototypeRoute ? prototypeLinks : filterLinksByRole(role)
  const shellClassName = [
    'dashboard-shell',
    role === ROLES.ADMIN && !isPrototypeRoute ? 'role-admin' : '',
    isPrototypeRoute ? 'prototype-shell' : '',
    location.pathname === '/dashboard' ? 'prototype-dashboard-shell' : '',
    isProfileRoute ? 'prototype-profile-shell' : '',
  ].filter(Boolean).join(' ')

  async function handleGlobalLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const displayName = user?.fullName || user?.email || 'Người dùng BICAP'
  const roleLabel = ROLE_LABELS[role] || role || 'Tài khoản đã xác thực'
  const searchPlaceholder = isProfileRoute ? 'Tìm kiếm dữ liệu...' : 'Tìm đơn hàng, lô hàng hoặc hồ sơ...'

  return (
    <div className={shellClassName}>
      <Sidebar links={visibleLinks} />
      <div className="dashboard-main">
        <header className="dashboard-topbar" aria-label="Thanh điều hướng không gian làm việc">
          <div className="dashboard-topbar-main">
            {isProfileRoute ? <span className="dashboard-topbar-title">BICAP</span> : null}
            <label className="dashboard-topbar-search" aria-label="Tìm kiếm dữ liệu không gian làm việc">
              <span className="material-symbols-outlined" aria-hidden="true">search</span>
              <input type="search" placeholder={searchPlaceholder} />
            </label>
          </div>
          <div className="dashboard-topbar-actions">
            <button className="dashboard-icon-button" type="button" aria-label="Thông báo">
              <span className="material-symbols-outlined" aria-hidden="true">notifications</span>
            </button>
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
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
