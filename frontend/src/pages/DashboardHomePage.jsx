import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { ROLE_LABELS } from '../utils/constants'
import { getPrimaryRole } from '../utils/helpers'

const statCards = [
  { icon: 'shopping_cart', label: 'Tổng đơn hàng', value: '124', badge: '+12%', tone: 'blue' },
  { icon: 'inventory_2', label: 'Lô hàng đang hoạt động', value: '18', badge: 'Ổn định', tone: 'green' },
  { icon: 'local_shipping', label: 'Đang vận chuyển', value: '5', badge: '3 chậm', tone: 'amber' },
  { icon: 'error', label: 'Cảnh báo đang mở', value: '2', badge: 'Khẩn', tone: 'red' },
]

const shortcuts = [
  { to: '/farm/packages', icon: 'add_circle', title: 'Tạo lô hàng mới' },
  { to: '/marketplace', icon: 'storefront', title: 'Xem chợ nông sản' },
  { to: '/public/trace', icon: 'search_check', title: 'Truy xuất sản phẩm' },
  { to: '/profile', icon: 'groups', title: 'Quản lý nhân sự' },
]

const events = [
  {
    tone: 'green',
    title: 'Lô #BR-9021 đã thu hoạch',
    time: '2 phút trước',
    body: '1,200kg cà phê chất lượng cao được ghi nhận tại trang trại Highland.',
    chips: ['GPS: 4.57, -74.29', 'TX: 0x82...a3e'],
  },
  {
    tone: 'blue',
    title: 'Đã xác nhận bàn giao vận chuyển',
    time: '1 giờ trước',
    body: 'Đối tác logistics "AgroTransit" đã nhận 45 kiện từ kho trung chuyển C.',
    chips: ['Độ ẩm: 12%', 'Nhiệt độ: 18°C'],
  },
  {
    tone: 'zinc',
    title: 'Nhà bán lẻ mới được xác minh',
    time: '5 giờ trước',
    body: '"Global Foods Inc" đã hoàn tất xác minh on-chain cho quyền truy cập Tier 1.',
    chips: [],
  },
]

export function DashboardHomePage() {
  const { user, getPostLoginPath } = useAuth()
  const role = getPrimaryRole(user)
  const rolePath = getPostLoginPath(user)
  const displayName = user?.fullName || user?.name || 'Người dùng BICAP'
  const firstName = String(displayName).split(' ').slice(-1)[0] || displayName
  const roleLabel = ROLE_LABELS[role] || 'Người dùng hệ thống'

  return (
    <section className="dashboard-command-page dashboard-reference-page" aria-labelledby="dashboard-command-title">
      <div className="command-hero dashboard-reference-hero">
        <div>
          <div className="command-role-pill">
            <span aria-hidden="true" />
            {roleLabel}
          </div>
          <h1 id="dashboard-command-title">Chào mừng trở lại, {firstName}!</h1>
          <p>Đây là những gì đang diễn ra trên chuỗi cung ứng của bạn hôm nay.</p>
        </div>
        <Link className="command-primary-action" to={rolePath}>
          <span>Vào workspace chính</span>
          <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
        </Link>
      </div>

      <div className="command-stats-grid dashboard-reference-stats" aria-label="Thống kê chuỗi cung ứng">
        {statCards.map((card) => (
          <article className={`command-stat-card tone-${card.tone}`} key={card.label}>
            <div className="command-stat-topline">
              <span className="command-stat-icon material-symbols-outlined" aria-hidden="true">{card.icon}</span>
              <span className="command-stat-badge">{card.badge}</span>
            </div>
            <p>{card.label}</p>
            <strong>{card.value}</strong>
          </article>
        ))}
      </div>

      <div className="command-content-grid dashboard-reference-grid">
        <aside className="command-side-stack" aria-label="Thao tác nhanh">
          <article className="command-panel dashboard-reference-shortcuts">
            <div className="command-panel-kicker">Lối tắt</div>
            <div className="command-shortcuts">
              {shortcuts.map((shortcut) => (
                <Link className="command-shortcut" to={shortcut.to} key={shortcut.title}>
                  <span className="material-symbols-outlined" aria-hidden="true">{shortcut.icon}</span>
                  <strong>{shortcut.title}</strong>
                  <i className="material-symbols-outlined" aria-hidden="true">chevron_right</i>
                </Link>
              ))}
            </div>
          </article>

          <article className="command-health-card dashboard-reference-health">
            <div className="health-content">
              <div className="health-badge">
                <span className="material-symbols-outlined" aria-hidden="true">verified</span>
                Đã xác thực blockchain
              </div>
              <h2>Tình trạng mạng BICAP</h2>
              <p>Các node đang chạy ở mức 99.9%. Tất cả smart contract đã được xác nhận.</p>
              <div className="health-meter" aria-label="Mạng đang hoạt động 99.9%">
                <span />
              </div>
            </div>
            <span className="health-watermark material-symbols-outlined" aria-hidden="true">account_tree</span>
          </article>
        </aside>

        <article className="command-activity-card dashboard-reference-events">
          <div className="command-activity-head">
            <h2>Hoạt động truy xuất gần đây</h2>
            <Link to="/public/trace">Xem tất cả</Link>
          </div>

          <div className="command-timeline">
            {events.map((event) => (
              <div className="command-event" key={event.title}>
                <div className="command-event-rail" aria-hidden="true">
                  <span className={`tone-${event.tone}`} />
                  <i />
                </div>
                <div className="command-event-body">
                  <div className="command-event-title">
                    <h3>{event.title}</h3>
                    <time>{event.time}</time>
                  </div>
                  <p>{event.body}</p>
                  {event.chips.length ? (
                    <div className="command-event-chips">
                      {event.chips.map((chip) => <span key={chip}>{chip}</span>)}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <Link className="command-map-card dashboard-reference-map" to="/public/trace" aria-label="Mở bản đồ chuỗi cung ứng trực tiếp">
            <span className="material-symbols-outlined" aria-hidden="true">map</span>
            <strong>Mở bản đồ chuỗi cung ứng trực tiếp</strong>
          </Link>
        </article>
      </div>
    </section>
  )
}
