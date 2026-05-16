<<<<<<< HEAD
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../shipping-workspace.css'
import ContractsPage from './ContractsPage.jsx'
import { getSeasons, getBatches } from '../services/phase3Service'
import { getMyListings } from '../services/listingService'
import { getOrdersV2, getFarmShipments } from '../services/workflowService'
import { getIoTAlerts, resolveIoTAlert } from '../services/businessService'
import { getErrorMessage } from '../utils/helpers'
=======
import '../farm-workspace.css'
import ContractsPage from './ContractsPage.jsx'
import { SupportButton } from '../components/SupportButton.jsx'
import { useEffect, useState } from 'react'
import { getIoTAlerts, resolveIoTAlert, getIoTThresholds, createIoTThreshold, updateIoTThreshold, deleteIoTThreshold } from '../services/businessService.js'
>>>>>>> 435dc21896bb4f9cdfc25f3a8829c4fe20148ecd

// Mounted under DashboardLayout. Uses shipping-workspace.css (shipping-prototype-shell scope)
// for consistent visual style with other Farm pages (FarmSeasonsPage, FarmBatchesPage, ...).

function Icon({ children, fill = false }) {
  return <span className={`material-symbols-outlined${fill ? ' fill' : ''}`}>{children}</span>
}

function PageChrome({ eyebrow, title, subtitle, actions, children, error, success, loading }) {
  return (
<<<<<<< HEAD
    <>
      <div className="ship-page-head">
        <div><p>{eyebrow}</p><h2>{title}</h2><span>{subtitle}</span></div>
        <div className="ship-actions">{actions}</div>
      </div>
      {loading ? <div className="ship-alert neutral">Đang đồng bộ dữ liệu nông trại...</div> : null}
      {error ? <div className="ship-alert danger">{error}</div> : null}
      {success ? <div className="ship-alert success">{success}</div> : null}
      {children}
    </>
  )
}

function Metric({ icon, label, value, note, tone = 'green' }) {
  return (
    <article className={`ship-metric ${tone}`}>
      <div><Icon fill>{icon}</Icon>{note ? <span>{note}</span> : null}</div>
      <p>{label}</p>
      <strong>{value}</strong>
=======
    <div className="farm-prototype-shell">
      {/* Decorative leaf backgrounds */}
      <svg className="farm-leaves-bg" viewBox="0 0 300 280" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <g fill="none" stroke="#86efac" strokeWidth="1.5" opacity="0.5">
          <path d="M30 260 Q60 200 120 170 Q180 140 230 80" />
          <path d="M50 250 Q90 210 150 195" />
          <path d="M40 230 Q70 200 110 185" />
          <path d="M80 160 Q120 145 170 130" />
          <path d="M100 100 Q130 90 180 80" />
          <circle cx="120" cy="170" r="6" fill="#86efac" opacity="0.3" />
          <circle cx="170" cy="130" r="5" fill="#86efac" opacity="0.25" />
          <circle cx="180" cy="80" r="7" fill="#86efac" opacity="0.3" />
        </g>
      </svg>
      <svg className="farm-leaves-bg-2" viewBox="0 0 260 380" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <g fill="none" stroke="#86efac" strokeWidth="1.5" opacity="0.45">
          <path d="M230 360 Q200 300 175 240 Q150 180 130 110 Q110 60 80 20" />
          <path d="M220 320 Q190 290 170 250" />
          <path d="M205 280 Q180 255 160 230" />
          <path d="M190 230 Q170 210 150 185" />
          <path d="M175 180 Q155 160 140 140" />
          <path d="M160 130 Q140 110 125 90" />
          <circle cx="170" cy="240" r="6" fill="#86efac" opacity="0.3" />
          <circle cx="150" cy="185" r="5" fill="#86efac" opacity="0.3" />
          <circle cx="125" cy="90" r="7" fill="#86efac" opacity="0.3" />
        </g>
      </svg>

      <aside className="farm-proto-sidebar">
        {/* Brand mini header */}
        <div className="farm-proto-brand">
          <div className="farm-proto-brand-mini"><Icon fill>eco</Icon></div>
          <div>
            <strong>GreenField Farm</strong>
            <small>Nông trại thông minh</small>
          </div>
        </div>

        {/* Profile card */}
        <div className="farm-proto-profile-card">
          <div className="farm-proto-logo">GF</div>
          <div>
            <strong>GreenField Farm</strong>
            <span><Icon>verified</Icon> Đã xác thực blockchain</span>
          </div>
        </div>

        <nav className="farm-proto-nav" aria-label="Farm workspace navigation">
          {navItems.map((item) => (
            <a key={item.module} href={item.href} className={item.module === module ? 'active' : ''}>
              <Icon fill={item.module === module}>{item.icon}</Icon>
              {item.label}
            </a>
          ))}
        </nav>
        <button className="farm-proto-add"><Icon>add</Icon> Add New Batch</button>
      </aside>

      <main className="farm-proto-main">
        <header className="farm-proto-topbar">
          <label className="farm-proto-search">
            <Icon>search</Icon>
            <input placeholder={searchPlaceholder || 'Tìm kiếm...'} />
            <kbd>Ctrl + K</kbd>
          </label>
          <button className="notif" aria-label="Thông báo"><Icon>notifications</Icon></button>
          <SupportButton label="Hỗ trợ" />
          <button aria-label="Cài đặt"><Icon>settings</Icon></button>
          <div className="farm-proto-avatar">GF</div>
        </header>
        {children}
      </main>
    </div>
  )
}

function StatCard({ icon, label, value, tone = 'green', trend, trendDir = 'up' }) {
  return (
    <article className={`farm-stat-card ${tone}`}>
      <div className="farm-stat-card-top">
        <div className="farm-stat-icon"><Icon>{icon}</Icon></div>
        <div className="farm-stat-label">{label}</div>
      </div>
      <div className="farm-stat-value">{value}</div>
      {trend && (
        <div className={`farm-stat-trend ${trendDir}`}>
          <Icon>{trendDir === 'up' ? 'arrow_upward' : trendDir === 'down' ? 'arrow_downward' : 'remove'}</Icon>
          {trend}
        </div>
      )}
>>>>>>> 435dc21896bb4f9cdfc25f3a8829c4fe20148ecd
    </article>
  )
}

<<<<<<< HEAD
function severityClass(severity) {
  const s = String(severity || '').toUpperCase()
  if (s === 'HIGH' || s === 'CRITICAL') return 'red'
  if (s === 'MEDIUM') return 'amber'
  return 'green'
}

function metricLabel(metric) {
  const m = String(metric || '').toUpperCase()
  if (m === 'TEMP' || m === 'TEMPERATURE') return 'Nhiệt độ'
  if (m === 'HUMIDITY') return 'Độ ẩm'
  if (m === 'SOIL_MOISTURE') return 'Độ ẩm đất'
  if (m === 'PH' || m === 'SOIL_PH') return 'Độ pH'
  return metric || 'Cảm biến'
}

function metricIcon(metric) {
  const m = String(metric || '').toUpperCase()
  if (m === 'TEMP' || m === 'TEMPERATURE') return 'thermostat'
  if (m === 'HUMIDITY' || m === 'SOIL_MOISTURE') return 'humidity_mid'
  if (m === 'PH' || m === 'SOIL_PH') return 'science'
  return 'sensors'
}

function OverviewPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [seasons, setSeasons] = useState([])
  const [batches, setBatches] = useState([])
  const [listings, setListings] = useState([])
  const [orders, setOrders] = useState([])
  const [shipments, setShipments] = useState([])
  const [alerts, setAlerts] = useState([])
  const [resolvingId, setResolvingId] = useState(null)

  async function loadDashboard() {
    setLoading(true)
    setError('')
    try {
      const results = await Promise.allSettled([
        getSeasons(),
        getBatches(),
        getMyListings(),
        getOrdersV2(),
        getFarmShipments(),
        getIoTAlerts(),
      ])
      const [seasonsR, batchesR, listingsR, ordersR, shipmentsR, alertsR] = results
      setSeasons(seasonsR.status === 'fulfilled' && Array.isArray(seasonsR.value) ? seasonsR.value : [])
      setBatches(batchesR.status === 'fulfilled' && Array.isArray(batchesR.value) ? batchesR.value : [])
      setListings(listingsR.status === 'fulfilled' && Array.isArray(listingsR.value) ? listingsR.value : [])
      setOrders(ordersR.status === 'fulfilled' && Array.isArray(ordersR.value) ? ordersR.value : [])
      setShipments(shipmentsR.status === 'fulfilled' && Array.isArray(shipmentsR.value) ? shipmentsR.value : [])
      setAlerts(alertsR.status === 'fulfilled' && Array.isArray(alertsR.value) ? alertsR.value : [])
    } catch (err) {
      setError(getErrorMessage(err, 'Không tải được dữ liệu nông trại.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const activeListings = useMemo(
    () => listings.filter((l) => String(l.status || '').toUpperCase() === 'ACTIVE'),
    [listings],
  )
  const pendingOrders = useMemo(
    () => orders.filter((o) => ['PENDING', 'CONFIRMED', 'READY_FOR_SHIPMENT'].includes(String(o.status || '').toUpperCase())),
    [orders],
  )
  const inTransit = useMemo(
    () => shipments.filter((s) => ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(String(s.status || '').toUpperCase())),
    [shipments],
  )
  const openAlerts = useMemo(
    () => alerts.filter((a) => String(a.status || '').toUpperCase() !== 'RESOLVED'),
    [alerts],
  )

  // Build last-6-months yield trend from real seasons.
  const yieldTrend = useMemo(() => {
    const now = new Date()
    const buckets = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('vi-VN', { month: 'short' }), total: 0 })
    }
    seasons.forEach((s) => {
      const dateStr = s.actualHarvestDate || s.expectedHarvestDate
      if (!dateStr) return
      const d = new Date(dateStr)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      const bucket = buckets.find((b) => b.key === key)
      if (bucket) {
        const yieldKg = Number(s.actualYield ?? s.expectedYield ?? 0)
        if (Number.isFinite(yieldKg)) bucket.total += yieldKg
      }
    })
    const maxValue = Math.max(...buckets.map((b) => b.total), 1)
    return buckets.map((b) => ({ ...b, pct: Math.max(8, Math.round((b.total / maxValue) * 100)) }))
  }, [seasons])

  async function handleResolveAlert(alertId) {
    if (!alertId || resolvingId) return
    setResolvingId(alertId)
    setError('')
    setSuccess('')
    try {
      await resolveIoTAlert(alertId)
      setSuccess('Đã xử lý cảnh báo IoT.')
      await loadDashboard()
    } catch (err) {
      setError(getErrorMessage(err, 'Không xử lý được cảnh báo.'))
    } finally {
      setResolvingId(null)
    }
  }

  return (
    <section className="shipping-prototype-shell">
      <PageChrome
        eyebrow="Farm / Tổng quan"
        title="Không gian Nông trại"
        subtitle="Theo dõi sản xuất, IoT và chuỗi cung ứng theo thời gian thực."
        loading={loading}
        error={error}
        success={success}
        actions={
          <>
            <button type="button" onClick={loadDashboard} disabled={loading}>
              <Icon>refresh</Icon> {loading ? 'Đang tải...' : 'Làm mới'}
            </button>
            <button type="button" onClick={() => navigate('/farm/seasons')}>
              <Icon>edit_note</Icon> Quản lý mùa vụ
            </button>
          </>
        }
      >
        <section className="ship-metrics">
          <Metric icon="eco" label="Tổng Mùa Vụ" value={loading ? '...' : seasons.length} />
          <Metric icon="inventory_2" label="Tổng Lô Hàng" value={loading ? '...' : batches.length} tone="amber" />
          <Metric icon="store" label="Listing đang bán" value={loading ? '...' : activeListings.length} tone="blue" />
          <Metric icon="pending_actions" label="Đơn Chờ Xử Lý" value={loading ? '...' : pendingOrders.length} tone="red" />
          <Metric icon="local_shipping" label="Đang Giao Hàng" value={loading ? '...' : inTransit.length} />
        </section>

        <div className="ship-overview-grid">
          <article className="ship-card">
            <div className="ship-card-head">
              <h3><Icon>bar_chart</Icon>Sản lượng thu hoạch · 6 tháng</h3>
              <button type="button" className="dash-btn" onClick={() => navigate('/farm/seasons')}>
                <Icon>arrow_forward</Icon> Xem chi tiết
              </button>
            </div>
            <div className="ship-status-chart">
              {yieldTrend.map((b) => (
                <div key={b.key} className="chart-bar-row">
                  <span className="chart-label">{b.label}</span>
                  <div className="chart-bar-track">
                    <div className="chart-bar-fill" style={{ width: `${b.pct}%`, background: '#0d631b' }} />
                  </div>
                  <span className="chart-value">{b.total ? `${b.total.toLocaleString('vi-VN')} kg` : '—'}</span>
                </div>
              ))}
            </div>
          </article>

          <aside className="ship-stack">
            <article className="ship-card">
              <div className="ship-card-head">
                <h3><Icon fill>sensors</Icon>Cảnh báo IoT</h3>
                <span className="danger-pill">{openAlerts.length} OPEN</span>
              </div>
              {loading ? (
                <p>Đang tải cảnh báo...</p>
              ) : openAlerts.length === 0 ? (
                <p>Không có cảnh báo IoT đang mở.</p>
              ) : (
                openAlerts.slice(0, 3).map((alert) => (
                  <div key={alert.alertId} className={`ship-warning ${severityClass(alert.severity) === 'red' ? '' : 'w1'}`}>
                    <strong><Icon>{metricIcon(alert.metric)}</Icon> {alert.title || `${metricLabel(alert.metric)} bất thường`}</strong>
                    <p>
                      {alert.description || `Giá trị ${alert.value ?? '?'} ngoài ngưỡng [${alert.minValue ?? '?'}–${alert.maxValue ?? '?'}].`}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleResolveAlert(alert.alertId)}
                      disabled={resolvingId === alert.alertId}
                    >
                      {resolvingId === alert.alertId ? 'Đang xử lý...' : 'Đánh dấu đã xử lý'}
                    </button>
                  </div>
                ))
              )}
            </article>

            <article className="ship-card">
              <div className="ship-card-head">
                <h3><Icon>tune</Icon>Cấu hình ngưỡng cảnh báo</h3>
              </div>
              <p>Đặt ngưỡng nhiệt độ, độ ẩm, pH theo mùa vụ và xem báo cáo vận chuyển từ tài xế.</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" onClick={() => navigate('/farm/shipment-reports')}>
                  <Icon>route</Icon> Báo cáo vận chuyển
                </button>
                <button type="button" onClick={() => navigate('/farm/orders')}>
                  <Icon>inbox</Icon> Đơn hàng từ retailer
                </button>
              </div>
            </article>
          </aside>
=======
function ProductivityChart({ period, onPeriodChange }) {
  const data = {
    'this-year': {
      labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'],
      values: [42, 68, 55, 80, 95, 38],
      avg: 61.7,
      trend: '+15% so với năm ngoái',
    },
    'last-year': {
      labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'],
      values: [35, 50, 45, 65, 75, 30],
      avg: 50.0,
      trend: '+8% so với năm trước',
    },
  }
  const d = data[period] || data['this-year']
  const maxVal = 100
  const highlightIdx = d.values.indexOf(Math.max(...d.values))

  return (
    <div className="farm-glass-card farm-chart-card">
      <div className="farm-card-head">
        <h3><Icon>show_chart</Icon> Xu Hướng Năng Suất</h3>
        <select value={period} onChange={(e) => onPeriodChange(e.target.value)}>
          <option value="this-year">Năm nay</option>
          <option value="last-year">Năm ngoái</option>
        </select>
      </div>
      <div className="farm-chart-wrap">
        {/* Y-axis labels */}
        <div className="farm-chart-y-labels">
          {[0, 20, 40, 60, 80, 100].map((v) => <span key={v}>{v}</span>)}
        </div>
        {/* Grid lines */}
        <div className="farm-chart-grid">
          {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="farm-chart-grid-line" />)}
        </div>
        {/* Bars */}
        <div className="farm-chart-bars">
          {d.values.map((v, i) => (
            <div key={i} className="farm-chart-bar-wrap">
              {i === highlightIdx && (
                <div className="farm-chart-tooltip">
                  <strong>{d.labels[i]}</strong>
                  <span>Năng suất: {v}</span>
                </div>
              )}
              <div
                className={`farm-chart-bar ${i === highlightIdx ? 'highlight' : ''}`}
                style={{ height: `${(v / maxVal) * 100}%` }}
              />
              <span className="farm-chart-label">{d.labels[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer: "Năng suất trung bình" + progress bar + trend */}
      <div className="farm-chart-footer">
        <div className="farm-chart-footer-icon"><Icon>trending_up</Icon></div>
        <div className="farm-chart-footer-content">
          <div className="farm-chart-footer-label">
            Năng suất trung bình: <strong>{d.avg}</strong>
          </div>
          <div className="farm-chart-progress">
            <div style={{ width: `${d.avg}%` }} />
          </div>
        </div>
        <div className="farm-chart-footer-trend">
          <Icon>arrow_upward</Icon> {d.trend}
        </div>
      </div>
    </div>
  )
}

function OverviewPage() {
  const [chartPeriod, setChartPeriod] = useState('this-year')

  // Today's date in Vietnamese format
  const today = new Date()
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']
  const dayName = days[today.getDay()]
  const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`
  const timeStr = today.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

  return (
    <FarmShell module="overview" title="Tổng quan Nông trại" subtitle="Theo dõi sản xuất, IoT và chuỗi cung ứng theo thời gian thực." searchPlaceholder="Tìm kiếm...">
      <section className="farm-proto-content farm-overview">
        {/* Page head with greeting + date + actions */}
        <div className="farm-page-head">
          <div>
            <div className="farm-page-greeting">
              Xin chào, <span style={{ fontSize: '16px' }}>👋</span>
            </div>
            <h2>Tổng quan Nông trại</h2>
            <p>Theo dõi sản xuất, IoT và chuỗi cung ứng theo thời gian thực.</p>
          </div>
          <div className="farm-page-actions">
            <div className="farm-page-date">
              <Icon>calendar_month</Icon> {dayName}, {dateStr} • {timeStr}
            </div>
            <div className="farm-page-actions-row">
              <button className="farm-btn ghost"><Icon>calendar_today</Icon> Hôm nay</button>
              <button className="farm-btn primary"><Icon>download</Icon> Báo cáo</button>
            </div>
          </div>
        </div>

        {/* KPI Cards — 5 cards matching the mockup */}
        <div className="farm-kpi-grid five">
          <StatCard
            icon="eco" label="Tổng Mùa Vụ" value="12" tone="green"
            trend="↑ 8% so với tháng trước" trendDir="up"
          />
          <StatCard
            icon="inventory_2" label="Tổng Lô Hàng" value="145" tone="amber"
            trend="↑ 12% so với tháng trước" trendDir="up"
          />
          <StatCard
            icon="local_shipping" label="Bán Hàng đang hoạt động" value="28" tone="blue"
            trend="↑ 5% so với tháng trước" trendDir="up"
          />
          <StatCard
            icon="pending_actions" label="Đơn Chờ Xử Lý" value="7" tone="red"
            trend="↓ 2% so với tháng trước" trendDir="down"
          />
          <StatCard
            icon="local_shipping" label="Đang Giao Hàng" value="4" tone="green-light"
            trend="↑ 0% so với tháng trước" trendDir="flat"
          />
        </div>

        {/* Main bento: Chart + IoT Alerts */}
        <div className="farm-bento-grid">
          <ProductivityChart period={chartPeriod} onPeriodChange={setChartPeriod} />

          <div className="farm-glass-card farm-alert-card">
            <div className="farm-card-head">
              <h3><Icon>sensors</Icon> Cảnh Báo IoT</h3>
              <a href="/farm/iot" className="farm-card-link">Xem tất cả</a>
            </div>
            <div className="farm-alert danger">
              <div className="farm-alert-icon"><Icon fill>warning</Icon></div>
              <div className="farm-alert-body">
                <strong>Độ ẩm đất thấp</strong>
                <p>Khu vực A (Lô #102) ghi nhận độ ẩm 32%.</p>
                <button>Kích hoạt bơm nước</button>
              </div>
            </div>
            <div className="farm-alert warning">
              <div className="farm-alert-icon"><Icon>thermostat</Icon></div>
              <div className="farm-alert-body">
                <strong>Nhiệt độ ổn định</strong>
                <p>Nhà màng B duy trì ở mức 24°C.</p>
              </div>
            </div>
            <div className="farm-alert info">
              <div className="farm-alert-icon"><Icon>science</Icon></div>
              <div className="farm-alert-body">
                <strong>Lịch kiểm tra pH</strong>
                <p>Cần lấy mẫu đất khu C vào chiều nay.</p>
              </div>
            </div>
          </div>
>>>>>>> 435dc21896bb4f9cdfc25f3a8829c4fe20148ecd
        </div>
      </PageChrome>
    </section>
  )
}

<<<<<<< HEAD
export function FarmWorkspacePage({ module = 'overview' }) {
  if (module === 'contracts') return <ContractsPage />
  return <OverviewPage />
=======
function SeasonsPage() {
  const seasons = [
    { name: 'Arabica Mùa Xuân 2024', status: 'Đang sinh trưởng', active: true, code: 'B-2401', yield: '4.5 Tấn' },
    { name: 'Arabica Thu Đông 2023', status: 'Đã thu hoạch', code: 'B-2309', yield: '4.2 Tấn' },
  ]
  return (
    <FarmShell module="seasons" title="Quản lý Mùa vụ" subtitle="Giám sát và theo dõi tiến trình trồng trọt Cà phê Arabica." searchPlaceholder="Tìm kiếm mùa vụ...">
      <section className="farm-proto-content farm-season-layout">
        <div className="farm-season-list"><div className="farm-section-title"><h2>Danh sách Mùa vụ</h2><Icon>filter_list</Icon></div>{seasons.map((s)=><article className={`farm-season-card ${s.active?'active':''}`} key={s.name}><div><h3>{s.name}</h3><span>Cà phê Arabica</span><span>• Lô: {s.code}</span></div><b>{s.status}</b><dl><div><dt>Ngày bắt đầu</dt><dd>15/02/2024</dd></div><div><dt>Dự kiến thu hoạch</dt><dd>10/11/2024</dd></div></dl><footer><span>Sản lượng ước tính</span><strong>{s.yield}</strong><Icon>arrow_forward</Icon></footer></article>)}</div>
        <div className="farm-season-detail"><article className="farm-glass-card farm-season-hero"><div><Icon>eco</Icon><div><h2>Arabica Mùa Xuân 2024</h2><p><Icon>location_on</Icon> Vùng trồng Nam Ban, Lâm Đồng</p></div></div><div><button className="farm-btn ghost"><Icon>link</Icon> Liên kết Lô mới</button><button className="farm-btn secondary"><Icon>edit_note</Icon> Cập nhật Nhật ký</button></div></article>
          <div className="farm-detail-grid"><aside><article className="farm-glass-card"><h3><Icon>cloud</Icon> Thời tiết hiện tại</h3><div className="farm-temp">24°C <span>Độ ẩm 68%</span></div><p>Lượng mưa <b>12mm (Tuần)</b></p><p>Độ pH Đất <b>6.2 (Tối ưu)</b></p><div className="farm-note"><Icon>info</Icon> Cảnh báo sương muối nhẹ vào rạng sáng ngày mai.</div></article><div className="farm-map-card"><span>Khu vực 3A</span><p><Icon>map</Icon> Lô đất B-2401</p></div></aside><article className="farm-glass-card farm-timeline"><h3>Nhật ký Nông nghiệp</h3>{['Gieo hạt & Trồng cây','Bón phân đợt 1','Tưới tiêu & Kiểm soát Sâu bệnh','Thu hoạch & Sơ chế'].map((t,i)=><div className={`timeline-item ${i===2?'current':''} ${i===3?'future':''}`} key={t}><span></span><div><h4>{t}</h4><small>{i===2?'Hiện tại':i===3?'Dự kiến: T11/2024':'15/02/2024'}</small><p>{i===0?'Sử dụng giống Arabica thuần chủng ghép gốc Robusta kháng tuyến trùng.':i===1?'Bón phân hữu cơ vi sinh kết hợp NPK 16-16-8.':i===2?'Duy trì độ ẩm đất ở mức 65-70%, theo dõi sâu bệnh.':'Chờ thực hiện. Tiêu chuẩn hái mọng > 95%.'}</p></div></div>)}</article></div>
        </div>
      </section>
    </FarmShell>
  )
}

function PackagesPage() {
  return (
    <FarmShell module="packages" title="Quản lý Lô hàng" searchPlaceholder="Tìm kiếm lô hàng...">
      <section className="farm-batch-page">
        <div className="farm-batch-list"><div className="farm-filter-row">{['Tất cả','Bản nháp','Đã đóng gói','Đang bán','Đã giao'].map((x,i)=><button className={i===0?'active':''} key={x}>{x}</button>)}</div><div className="farm-batch-cards"><BatchCard selected code="#BR-9021" status="Đã đóng gói" name="Cà phê Robusta Hữu cơ" qr="QR Đã tạo" /><BatchCard code="#BR-9022" status="Bản nháp" name="Cà phê Arabica Cầu Đất" qr="QR Chưa tạo" /></div></div>
        <aside className="farm-batch-detail"><header><span>Chi tiết Lô hàng</span><h2>#BR-9021</h2><p>Cà phê Robusta Hữu cơ - Thu hoạch vụ Mùa Thu 2023.</p></header><div className="farm-qr-box"><div className="fake-qr"></div><div><strong>Mã QR Đã Kích Hoạt</strong><button className="farm-btn ghost">In Nhãn dán</button><small>URL Truy xuất nguồn gốc công khai đã sẵn sàng</small></div></div><h3>Nhật ký Đóng gói (Truy xuất nguồn gốc)</h3><div className="farm-log-list">{['Đóng gói hoàn tất','Phân loại & Làm sạch','Tạo lô trên Blockchain'].map((x,i)=><div key={x}><span>{i===0?'':'✓'}</span><div><b>{x}</b><small>{i===0?'Hôm nay, 14:30':'Hôm qua, 09:15'}</small><p>{i===2?'TxHash: 0x8f2a...9b41':'Lô hàng được xử lý và ghi nhận theo chuẩn.'}</p></div></div>)}</div><button className="farm-btn primary full">Đăng bán lên Chợ nông sản</button></aside>
      </section>
    </FarmShell>
  )
}
function BatchCard({ selected, code, status, name, qr }) { return <article className={`farm-batch-card ${selected?'selected':''}`}><div><h3>{code}</h3><span>{status}</span><b><Icon>verified_user</Icon> Blockchain {selected?'Verified':'Pending'}</b></div><h4>{name}</h4><p><Icon>scale</Icon> 1,200 kg <Icon>calendar_today</Icon> 12/10/2023</p><footer><Icon>qr_code_2</Icon> {qr}<span>• Lô chứa 24 kiện nhỏ</span></footer></article> }

function BlockchainPage() {
  const rows = [['0x7f9a...8b2c','BATCH-2023-A1','Thu hoạch','Confirmed (Polygon)','ok'],['0x1a2b...3c4d','BATCH-2023-A1','Đóng gói','Failed','fail'],['Pending...','BATCH-2023-B2','Vận chuyển','Processing','pending']]
  return <FarmShell module="blockchain" title="Nhật ký Blockchain" subtitle="Lịch sử giao dịch và xác thực trên chuỗi khối."><section className="farm-proto-content"><article className="farm-table-card"><table><thead><tr>{['Transaction Hash','Mã Lô Hàng','Sự kiện','Thời gian','Trạng thái','Hành động'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={r[1]+i}><td><a>{r[0]} <Icon>open_in_new</Icon></a></td><td>{r[1]}</td><td>{r[2]}</td><td>20/10/2023 14:30</td><td><span className={`chain ${r[4]}`}>{r[3]}</span></td><td>{r[4]==='fail'?<button>Thử lại</button>:null}</td></tr>)}</tbody></table><footer>Hiển thị 1-3 trong số 128 giao dịch <span><button disabled>‹</button><button>›</button></span></footer></article></section></FarmShell>
}

function ExportPage() {
  return <FarmShell module="packages" title="Xuất mã QR & Tem nhãn"><section className="farm-proto-content farm-export-grid"><div><Card title="Chọn lô hàng" icon="package_2"><label>Lô hàng (Batch ID)<select><option>B-2023-11-ORG-001 (Cà phê Arabica)</option></select></label><div className="farm-info-strip"><span>Trạng thái Blockchain</span><b><Icon>verified</Icon> Đã xác thực</b><span>Ngày thu hoạch</span><b>15/11/2023</b></div></Card><Card title="Tùy chọn xuất" icon="settings_applications"><div className="farm-choice"><button className="active">PNG (Hình ảnh)</button><button>PDF (In ấn)</button></div><div className="farm-choice"><button>Tiêu chuẩn<br/><small>100x100 mm</small></button><button className="active">Nhỏ<br/><small>50x50 mm</small></button></div><button className="farm-btn primary full"><Icon>download</Icon> Tải xuống Tem nhãn QR</button><button className="farm-btn ghost full"><Icon>content_copy</Icon> Sao chép Liên kết Truy xuất</button></Card></div><Card title="Bản xem trước Tem nhãn" icon="visibility" className="preview"><div className="label-canvas"><div className="product-label"><header>Cà phê Arabica<small>Hữu cơ - Organic</small></header><div><div className="fake-qr large"></div><p>Quét để truy xuất nguồn gốc</p></div><footer><p><span>Mã lô:</span><b>B-2023-11-001</b></p><p><span>Nông trại:</span><b>GreenField Farm</b></p><p><span>Ngày thu hoạch:</span><b>15/11/2023</b></p></footer></div></div><p className="farm-help"><Icon>info</Icon> Nhãn thực tế có thể thay đổi tùy máy in.</p></Card></section></FarmShell>
}
function Card({ title, icon, children, className='' }) { return <article className={`farm-glass-card farm-form-card ${className}`}><h3><Icon>{icon}</Icon>{title}</h3>{children}</article> }

function MarketplacePage() {
  return <FarmShell module="marketplace" title="Quản lý Bán hàng" searchPlaceholder="Tìm kiếm sản phẩm..."><section className="farm-proto-content"><div className="farm-page-head"><div><h2>Quản lý Bán hàng</h2><p>Quản lý các sản phẩm đang niêm yết trên chợ giao dịch BICAP.</p></div><button className="farm-btn primary"><Icon>add_circle</Icon> Tạo Niêm Yết Mới</button></div><div className="farm-kpi-grid four"><StatCard icon="inventory_2" label="Tổng sản phẩm" value="124" tone="blue"/><StatCard icon="public" label="Đang Xuất Bản" value="98"/><StatCard icon="shopping_cart" label="Đơn hàng mới" value="12" tone="brown"/><StatCard icon="remove_shopping_cart" label="Hết Hàng" value="3" tone="red"/></div><div className="farm-filter-panel">{['Tất cả','Đã xuất bản','Bản nháp','Hết hàng'].map((x,i)=><button className={i===0?'active':''} key={x}>{x}</button>)}<select><option>Mới nhất</option></select></div><div className="farm-listing-grid">{['Bơ Sáp Hữu Cơ Đắk Lắk','Cà Chua Beef Hữu Cơ','Cà phê Robusta Rang Mộc'].map((x,i)=><article className={`farm-listing-card ${i===2?'sold':''}`} key={x}><div className="farm-product-art"><span>{i===0?'Đang Xuất Bản':i===1?'Bản Nháp':'Hết Hàng'}</span></div><div><h3>{x}</h3><p>Lô: BSL-2023-11A</p><dl><div><dt>Giá bán</dt><dd>{i===1?'Chưa đặt':'85,000 / kg'}</dd></div><div><dt>Tồn kho</dt><dd>{i===2?'0 kg':'500 kg'}</dd></div></dl><footer><label><input type="checkbox" defaultChecked={i===0}/> Hiển thị</label><button>{i===1?'Tiếp tục chỉnh sửa':'Chi tiết'}</button></footer></div></article>)}</div></section></FarmShell>
}

function FallbackFarmPage({ module }) { return <FarmShell module={module} title="Không gian nông trại" subtitle="Module này giữ chức năng hiện tại trong khi chờ prototype chi tiết."><section className="farm-proto-content"><article className="farm-glass-card"><h2>Module: {module}</h2><p>Trang này chưa có HTML prototype mới, nên được giữ làm placeholder an toàn trong workspace Farm.</p></article></section></FarmShell> }

function IoTPage() {
  const [alerts, setAlerts] = useState([])
  const [thresholds, setThresholds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tab, setTab] = useState('alerts')
  // Threshold form
  const [metric, setMetric] = useState('')
  const [minValue, setMinValue] = useState('')
  const [maxValue, setMaxValue] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [a, t] = await Promise.all([
        getIoTAlerts().catch(() => []),
        getIoTThresholds().catch(() => []),
      ])
      setAlerts(Array.isArray(a) ? a : [])
      setThresholds(Array.isArray(t) ? t : [])
    } catch (err) {
      setError(err?.message || 'Không tải được dữ liệu IoT.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleResolve(id) {
    try {
      await resolveIoTAlert(id)
      setSuccess('Đã giải quyết cảnh báo.')
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể giải quyết cảnh báo.')
    }
  }

  function startEdit(rule) {
    setEditingId(rule.ruleId)
    setMetric(rule.metric || '')
    setMinValue(rule.minValue !== null && rule.minValue !== undefined ? String(rule.minValue) : '')
    setMaxValue(rule.maxValue !== null && rule.maxValue !== undefined ? String(rule.maxValue) : '')
  }

  function resetForm() {
    setEditingId(null)
    setMetric('')
    setMinValue('')
    setMaxValue('')
  }

  async function handleSaveThreshold() {
    if (!metric.trim()) { setError('Vui lòng nhập tên chỉ số (metric).'); return }
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const payload = {
        metric: metric.trim().toUpperCase(),
        minValue: minValue !== '' ? Number(minValue) : null,
        maxValue: maxValue !== '' ? Number(maxValue) : null,
        enabled: true,
      }
      if (editingId) {
        await updateIoTThreshold(editingId, payload)
        setSuccess('Đã cập nhật ngưỡng cảnh báo.')
      } else {
        await createIoTThreshold(payload)
        setSuccess('Đã tạo ngưỡng cảnh báo mới.')
      }
      resetForm()
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể lưu ngưỡng cảnh báo.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteThreshold(id) {
    if (!window.confirm('Xóa ngưỡng cảnh báo này?')) return
    try {
      await deleteIoTThreshold(id)
      setSuccess('Đã xóa ngưỡng cảnh báo.')
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể xóa ngưỡng.')
    }
  }

  const severityColor = (s) => s === 'HIGH' ? '#dc2626' : s === 'MEDIUM' ? '#d97706' : '#16a34a'

  return (
    <FarmShell module="iot" title="IoT Monitoring" subtitle="Theo dõi cảnh báo cảm biến và quản lý ngưỡng cảnh báo.">
      <section className="farm-proto-content">
        {error ? <div className="farm-alert danger" style={{ marginBottom: '12px' }}><Icon>error</Icon><div>{error}</div></div> : null}
        {success ? <div className="farm-alert" style={{ marginBottom: '12px', background: '#f0fdf4', borderColor: '#86efac' }}><Icon>check_circle</Icon><div>{success}</div></div> : null}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[['alerts', 'Cảnh báo IoT', 'sensors'], ['thresholds', 'Ngưỡng cảnh báo', 'tune']].map(([key, label, icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`farm-btn ${tab === key ? 'primary' : 'ghost'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Icon>{icon}</Icon>{label}
              {key === 'alerts' && alerts.filter(a => a.status !== 'RESOLVED').length > 0 && (
                <span style={{ background: '#dc2626', color: '#fff', borderRadius: '999px', padding: '0 6px', fontSize: '11px', fontWeight: 700 }}>
                  {alerts.filter(a => a.status !== 'RESOLVED').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? <p style={{ color: '#94a3b8' }}>Đang tải dữ liệu IoT...</p> : null}

        {/* Alerts Tab */}
        {tab === 'alerts' && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alerts.length === 0 ? (
              <article className="farm-glass-card" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                <Icon>sensors_off</Icon>
                <p>Không có cảnh báo IoT nào.</p>
              </article>
            ) : alerts.map((alert) => (
              <article key={alert.alertId} className="farm-glass-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: alert.status === 'RESOLVED' ? '#f0fdf4' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon>{alert.status === 'RESOLVED' ? 'check_circle' : 'warning'}</Icon>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '14px' }}>{alert.title || alert.metric}</strong>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: severityColor(alert.severity), background: '#fef2f2', padding: '2px 8px', borderRadius: '999px' }}>
                      {alert.severity || 'N/A'}
                    </span>
                    <span style={{ fontSize: '11px', color: alert.status === 'RESOLVED' ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                      {alert.status || 'ACTIVE'}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 4px' }}>{alert.description}</p>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                    Giá trị: <strong>{alert.value}</strong>
                    {alert.minValue !== null && alert.minValue !== undefined ? ` | Min: ${alert.minValue}` : ''}
                    {alert.maxValue !== null && alert.maxValue !== undefined ? ` | Max: ${alert.maxValue}` : ''}
                    {alert.measuredAt ? ` | ${new Date(alert.measuredAt).toLocaleString('vi-VN')}` : ''}
                  </p>
                </div>
                {alert.status !== 'RESOLVED' && (
                  <button className="farm-btn ghost" onClick={() => handleResolve(alert.alertId)} style={{ flexShrink: 0, fontSize: '12px' }}>
                    <Icon>check</Icon> Giải quyết
                  </button>
                )}
              </article>
            ))}
          </div>
        )}

        {/* Thresholds Tab */}
        {tab === 'thresholds' && !loading && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Form */}
            <article className="farm-glass-card" style={{ padding: '20px' }}>
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon>{editingId ? 'edit' : 'add_circle'}</Icon>
                {editingId ? 'Chỉnh sửa ngưỡng' : 'Thêm ngưỡng mới'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Chỉ số (metric) *</label>
                  <select
                    className="form-input"
                    value={metric}
                    onChange={(e) => setMetric(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="">Chọn chỉ số...</option>
                    {['TEMPERATURE', 'HUMIDITY', 'PH', 'SOIL_MOISTURE', 'CO2', 'LIGHT'].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Giá trị tối thiểu</label>
                    <input
                      type="number"
                      className="form-input"
                      value={minValue}
                      onChange={(e) => setMinValue(e.target.value)}
                      placeholder="Ví dụ: 20"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Giá trị tối đa</label>
                    <input
                      type="number"
                      className="form-input"
                      value={maxValue}
                      onChange={(e) => setMaxValue(e.target.value)}
                      placeholder="Ví dụ: 35"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="farm-btn primary" onClick={handleSaveThreshold} disabled={saving} style={{ flex: 1 }}>
                    <Icon>{editingId ? 'save' : 'add'}</Icon>
                    {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Thêm ngưỡng'}
                  </button>
                  {editingId && (
                    <button className="farm-btn ghost" onClick={resetForm}>
                      <Icon>close</Icon> Hủy
                    </button>
                  )}
                </div>
              </div>
            </article>

            {/* List */}
            <article className="farm-glass-card" style={{ padding: '20px' }}>
              <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon>list</Icon> Danh sách ngưỡng ({thresholds.length})
              </h3>
              {thresholds.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '13px' }}>Chưa có ngưỡng cảnh báo nào. Thêm ngưỡng để nhận cảnh báo IoT tự động.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {thresholds.map((rule) => (
                    <div key={rule.ruleId} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: '13px' }}>{rule.metric}</strong>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                          {rule.minValue !== null && rule.minValue !== undefined ? `Min: ${rule.minValue}` : ''}
                          {rule.minValue !== null && rule.maxValue !== null ? ' · ' : ''}
                          {rule.maxValue !== null && rule.maxValue !== undefined ? `Max: ${rule.maxValue}` : ''}
                          {rule.minValue === null && rule.maxValue === null ? 'Không giới hạn' : ''}
                        </p>
                      </div>
                      <span style={{ fontSize: '11px', color: rule.enabled ? '#16a34a' : '#94a3b8', fontWeight: 600 }}>
                        {rule.enabled ? 'Bật' : 'Tắt'}
                      </span>
                      <button className="farm-btn ghost" onClick={() => startEdit(rule)} style={{ padding: '4px 8px', fontSize: '12px' }}>
                        <Icon>edit</Icon>
                      </button>
                      <button className="farm-btn ghost" onClick={() => handleDeleteThreshold(rule.ruleId)} style={{ padding: '4px 8px', fontSize: '12px', color: '#dc2626' }}>
                        <Icon>delete</Icon>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </div>
        )}
      </section>
    </FarmShell>
  )
}

export function FarmWorkspacePage({ module = 'overview' }) {
  if (module === 'overview') return <OverviewPage />
  if (module === 'seasons') return <SeasonsPage />
  if (module === 'packages') return <PackagesPage />
  if (module === 'blockchain') return <BlockchainPage />
  if (module === 'export') return <ExportPage />
  if (module === 'marketplace') return <MarketplacePage />
  if (module === 'contracts') return <ContractsPage />
  if (module === 'iot') return <IoTPage />
  return <FallbackFarmPage module={module} />
>>>>>>> 435dc21896bb4f9cdfc25f3a8829c4fe20148ecd
}
