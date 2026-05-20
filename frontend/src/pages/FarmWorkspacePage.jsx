import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../shipping-workspace.css'
import ContractsPage from './ContractsPage.jsx'
import { getSeasons, getBatches } from '../services/phase3Service'
import { getMyListings } from '../services/listingService'
import { getOrdersV2, getFarmShipments } from '../services/workflowService'
import { getIoTAlerts, resolveIoTAlert } from '../services/businessService'
import { getErrorMessage } from '../utils/helpers'

function Icon({ children, fill = false }) {
  return <span className={`material-symbols-outlined${fill ? ' fill' : ''}`}>{children}</span>
}

function PageChrome({ eyebrow, title, subtitle, actions, children, error, success, loading }) {
  return (
    <>
      <div className="ship-page-head farm-page-head-clean">
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

function Metric({ icon, label, value, tone = 'green' }) {
  return (
    <article className={`ship-metric ${tone}`}>
      <div><Icon fill>{icon}</Icon></div>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  )
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

function parseNumber(...values) {
  for (const value of values) {
    if (value === null || value === undefined || value === '') continue
    const number = Number(value)
    if (Number.isFinite(number)) return number
  }
  return 0
}

function severityClass(severity) {
  const s = String(severity || '').toUpperCase()
  if (s === 'HIGH' || s === 'CRITICAL') return 'red'
  if (s === 'MEDIUM') return 'amber'
  return 'green'
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

  const yieldTrend = useMemo(() => {
    const now = new Date()
    const buckets = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: `Tháng ${d.getMonth() + 1}`, total: 0 })
    }
    seasons.forEach((s) => {
      const d = new Date(s.actualHarvestDate || s.expectedHarvestDate || '')
      if (Number.isNaN(d.getTime())) return
      const bucket = buckets.find((b) => b.key === `${d.getFullYear()}-${d.getMonth()}`)
      if (bucket) bucket.total += parseNumber(s.actualYield, s.harvestedQuantity, s.expectedYield)
    })
    batches.forEach((b) => {
      const d = new Date(b.harvestDate || b.createdAt || '')
      if (Number.isNaN(d.getTime())) return
      const bucket = buckets.find((item) => item.key === `${d.getFullYear()}-${d.getMonth()}`)
      if (bucket) bucket.total += parseNumber(b.quantity, b.totalQuantity, b.availableQuantity, b.weightKg)
    })
    const maxValue = Math.max(...buckets.map((b) => b.total), 1)
    return buckets
      .filter((b) => b.total > 0)
      .map((b) => ({ ...b, pct: Math.max(10, Math.round((b.total / maxValue) * 100)) }))
  }, [batches, seasons])

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
    <section className="shipping-prototype-shell farm-overview-clean">
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
        <section className="ship-metrics farm-metrics-clean">
          <Metric icon="eco" label="Tổng mùa vụ" value={loading ? '...' : seasons.length} />
          <Metric icon="inventory_2" label="Tổng lô hàng" value={loading ? '...' : batches.length} tone="amber" />
          <Metric icon="store" label="Listing đang bán" value={loading ? '...' : activeListings.length} tone="blue" />
          <Metric icon="pending_actions" label="Đơn chờ xử lý" value={loading ? '...' : pendingOrders.length} tone="red" />
          <Metric icon="local_shipping" label="Đang giao hàng" value={loading ? '...' : inTransit.length} />
        </section>

        <div className="ship-overview-grid farm-overview-grid-clean">
          <article className="ship-card farm-yield-card">
            <div className="ship-card-head">
              <h3><Icon>bar_chart</Icon>Sản lượng thu hoạch · 6 tháng</h3>
              <button type="button" className="dash-btn" onClick={() => navigate('/farm/seasons')}>
                <Icon>arrow_forward</Icon> Xem chi tiết
              </button>
            </div>
            {yieldTrend.length ? (
              <div className="ship-status-chart farm-yield-chart">
                {yieldTrend.map((b) => (
                  <div key={b.key} className="chart-bar-row">
                    <span className="chart-label">{b.label}</span>
                    <div className="chart-bar-track">
                      <div className="chart-bar-fill" style={{ width: `${b.pct}%`, background: '#0d631b' }} />
                    </div>
                    <span className="chart-value">{`${b.total.toLocaleString('vi-VN')} kg`}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="farm-yield-empty">
                <Icon>inventory_2</Icon>
                <div>
                  <h4>Chưa có dữ liệu thu hoạch</h4>
                  <p>Khi mùa vụ hoặc lô hàng có sản lượng thực tế, biểu đồ sẽ hiển thị theo tháng.</p>
                </div>
              </div>
            )}
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
                    <p>{alert.description || `Giá trị ${alert.value ?? '?'} ngoài ngưỡng [${alert.minValue ?? '?'}-${alert.maxValue ?? '?'}].`}</p>
                    <button type="button" onClick={() => handleResolveAlert(alert.alertId)} disabled={resolvingId === alert.alertId}>
                      {resolvingId === alert.alertId ? 'Đang xử lý...' : 'Đánh dấu đã xử lý'}
                    </button>
                  </div>
                ))
              )}
            </article>

            <article className="ship-card">
              <div className="ship-card-head"><h3><Icon>tune</Icon>Cấu hình ngưỡng cảnh báo</h3></div>
              <p>Đặt ngưỡng nhiệt độ, độ ẩm, pH theo mùa vụ và xem báo cáo vận chuyển từ tài xế.</p>
              <div className="farm-quick-actions">
                <button type="button" onClick={() => navigate('/farm/shipment-reports')}><Icon>route</Icon>Báo cáo vận chuyển</button>
                <button type="button" onClick={() => navigate('/farm/orders')}><Icon>inbox</Icon>Đơn hàng từ retailer</button>
              </div>
            </article>
          </aside>
        </div>
      </PageChrome>
    </section>
  )
}

export function FarmWorkspacePage({ module = 'overview' }) {
  if (module === 'contracts') return <ContractsPage />
  return <OverviewPage />
}
