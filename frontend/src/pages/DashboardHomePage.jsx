import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { ROLE_LABELS } from '../utils/constants'
import { getPrimaryRole } from '../utils/helpers'

const statCards = [
  { icon: 'shopping_cart', label: 'Total Orders', value: '124', badge: '+12%', tone: 'blue' },
  { icon: 'inventory_2', label: 'đang hoạt động Lô hàng', value: '18', badge: 'Stable', tone: 'green' },
  { icon: 'local_shipping', label: 'Shipments in Transit', value: '5', badge: '3 Late', tone: 'amber' },
  { icon: 'error', label: 'đang hoạt động Alerts', value: '2', badge: 'Urgent', tone: 'red' },
]

const shortcuts = [
  { to: '/farm/packages', icon: 'add_circle', title: 'Create New Batch' },
  { to: '/marketplace', icon: 'storefront', title: 'Xem chợ nông sản' },
  { to: '/public/trace', icon: 'search_check', title: 'Truy xuất Product' },
  { to: '/profile', icon: 'groups', title: 'Manage Staff' },
]

const events = [
  {
    tone: 'green',
    title: 'Batch #BR-9021 Harvested',
    time: '2 mins ago',
    body: '1,200kg of Premium Coffee Beans recorded at Highland Farm Facility.',
    chips: ['GPS: 4.57, -74.29', 'TX: 0x82...a3e'],
  },
  {
    tone: 'blue',
    title: 'Shipment Handover Confirmed',
    time: '1 hour ago',
    body: 'Logistics Partner "AgroTransit" accepted 45 containers from Storage Node C.',
    chips: ['Humidity: 12%', 'Temp: 18°C'],
  },
  {
    tone: 'zinc',
    title: 'New Retailer Verification',
    time: '5 hours ago',
    body: '"Global Foods Inc" has completed on-chain credentialing for Tier 1 access.',
    chips: [],
  },
]

export function DashboardHomePage() {
  const { user, getPostLoginPath } = useAuth()
  const role = getPrimaryRole(user)
  const rolePath = getPostLoginPath(user)
  const displayName = user?.fullName || user?.name || 'BICAP user'
  const firstName = String(displayName).split(' ')[0]
  const roleLabel = ROLE_LABELS[role] || 'Workspace user'

  return (
    <section className="dashboard-command-page dashboard-reference-page" aria-labelledby="dashboard-command-title">
      <div className="command-hero dashboard-reference-hero">
        <div>
          <div className="command-role-pill">
            <span aria-hidden="true" />
            {roleLabel}
          </div>
          <h1 id="dashboard-command-title">Welcome back, {firstName}!</h1>
          <p>Here is what's happening across your supply chain today.</p>
        </div>
        <Link className="command-primary-action" to={rolePath}>
          <span>Go to Main Workspace</span>
          <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
        </Link>
      </div>

      <div className="command-stats-grid dashboard-reference-stats" aria-label="Supply chain statistics">
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
        <aside className="command-side-stack" aria-label="Quick actions">
          <article className="command-panel dashboard-reference-shortcuts">
            <div className="command-panel-kicker">Quick Shortcuts</div>
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
              <h2>BICAP Network Health</h2>
              <p>Nodes operating at 99.9% efficiency. All smart contracts confirmed.</p>
              <div className="health-meter" aria-label="Network health 99.9 percent">
                <span />
              </div>
            </div>
            <span className="health-watermark material-symbols-outlined" aria-hidden="true">account_tree</span>
          </article>
        </aside>

        <article className="command-activity-card dashboard-reference-events">
          <div className="command-activity-head">
            <h2>Recent Truy xuất nguồn gốc Events</h2>
            <Link to="/public/trace">View All Activities</Link>
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

          <Link className="command-map-card dashboard-reference-map" to="/public/trace" aria-label="Open live supply chain map">
            <span className="material-symbols-outlined" aria-hidden="true">map</span>
            <strong>Open Trực tiếp Supply Chain Map</strong>
          </Link>
        </article>
      </div>
    </section>
  )
}
