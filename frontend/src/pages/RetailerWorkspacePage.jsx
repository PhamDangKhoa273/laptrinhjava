import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../retailer-workspace.css'
import { getPublicListings, getListingById } from '../services/listingService.js'
import { cancelOrder, confirmOrderDelivery, createOrder, createReport, getMyNotifications, getOrderById, getOrderStatusHistory, getOrdersV2, getRetailerShipments, markNotificationRead, payOrderDeposit, uploadShippingProof } from '../services/workflowService.js'
import { createNotification, getMyRetailer, updateRetailer, uploadRetailerBusinessLicense } from '../services/businessService.js'
import { traceBatch, traceBatchByCode } from '../services/phase3Service.js'
import { getErrorMessage } from '../utils/helpers.js'
import ContractsPage from './ContractsPage.jsx'

function Icon({ children, fill = false }) {
  return <span className={`material-symbols-outlined${fill ? ' fill' : ''}`}>{children}</span>
}

function unwrapList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.content)) return payload.content
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

function money(value) {
  if (value === null || value === undefined || value === '') return 'N/A'
  const number = Number(value)
  if (Number.isNaN(number)) return String(value)
  return number.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
}

function statusTone(status = '') {
  const value = String(status).toUpperCase()
  if (value.includes('DELIVER') || value.includes('COMPLETE') || value.includes('PAID')) return 'green'
  if (value.includes('TRANSIT') || value.includes('SHIP')) return 'blue'
  if (value.includes('CANCEL') || value.includes('REJECT') || value.includes('DELAY')) return 'red'
  return 'gray'
}

function useRetailerWorkspaceData() {
  const [state, setState] = useState({ loading: true, error: '', success: '', orderingListingId: null, orders: [], listings: [], shipments: [], notifications: [], retailer: null })

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [orders, listings, shipments, notifications, retailer] = await Promise.all([
          getOrdersV2().catch(() => []),
          getPublicListings({ page: 0, size: 8 }).catch(() => []),
          getRetailerShipments().catch(() => []),
          getMyNotifications().catch(() => []),
          getMyRetailer().catch(() => null),
        ])
        if (!mounted) return
        setState(current => ({
          ...current,
          loading: false,
          error: '',
          orders: unwrapList(orders),
          listings: unwrapList(listings),
          shipments: unwrapList(shipments),
          notifications: unwrapList(notifications),
          retailer,
        }))
      } catch (err) {
        if (!mounted) return
        setState(current => ({ ...current, loading: false, error: getErrorMessage(err, 'Không thể tải dữ liệu retailer.') }))
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  async function handleCreateOrder(listing) {
    const listingId = listing?.listingId || listing?.id
    if (!listingId) {
      setState(current => ({ ...current, error: 'Listing không có ID hợp lệ để tạo order.' }))
      return
    }

    setState(current => ({ ...current, error: '', success: '', orderingListingId: listingId }))
    try {
      const createdOrder = await createOrder({
        items: [{ listingId: Number(listingId), quantity: 1 }],
      })
      const [orders, listings, shipments, notifications] = await Promise.all([
        getOrdersV2().catch(() => []),
        getPublicListings({ page: 0, size: 8 }).catch(() => []),
        getRetailerShipments().catch(() => []),
        getMyNotifications().catch(() => []),
      ])
      setState(current => ({
        ...current,
        loading: false,
        error: '',
        success: `Đã tạo order #${createdOrder?.orderId || ''} từ listing #${listingId}.`,
        orderingListingId: null,
        orders: unwrapList(orders),
        listings: unwrapList(listings),
        shipments: unwrapList(shipments),
        notifications: unwrapList(notifications),
      }))
    } catch (err) {
      setState(current => ({
        ...current,
        error: getErrorMessage(err, 'Không thể tạo order từ listing này.'),
        success: '',
        orderingListingId: null,
      }))
    }
  }

  return { ...state, createOrderFromListing: handleCreateOrder }
}

function getTraceKind(item) {
  if (!item) return 'Kết quả'
  if (item.shipmentId || String(item.status || '').toLowerCase().includes('ship')) return 'Shipment'
  if (item.orderId || String(item.status || '').toLowerCase().includes('order')) return 'Order'
  if (item.listingId || item.title || item.productName) return 'Listing'
  return 'Kết quả'
}

function RetailerShell({ title, subtitle, children, loading, error, success }) {
  return (
    <section className="retailer-prototype-shell">
      <div className="retailer-page-canvas">
        {title ? <div className="retailer-page-head"><div><h2>{title}</h2>{subtitle ? <p>{subtitle}</p> : null}</div></div> : null}
        {error ? <div className="driver-alert error">{error}</div> : null}
        {success ? <div className="driver-alert success">{success}</div> : null}
        {loading ? <div className="driver-alert">Đang đồng bộ dữ liệu từ backend...</div> : null}
        {children}
      </div>
    </section>
  )
}

function Kpi({ icon, label, value, note, tone = 'green' }) {
  return <article className={`retailer-kpi ${tone}`}><div><span>{label}</span><Icon>{icon}</Icon></div><strong>{value}</strong><p>{note}</p><Icon>{icon}</Icon></article>
}
function Button({ children, variant = 'primary', ...props }) { return <button className={`retailer-btn ${variant}`} {...props}>{children}</button> }

function EmptyState({ title, text }) {
  return <article className="retailer-card"><h3>{title}</h3><p>{text}</p></article>
}

function RetailerDetailsBar({ item, title = 'Chi tiết', empty = 'Chưa có dữ liệu' }) {
  if (!item) return <article className="retailer-card"><h3>{title}</h3><p>{empty}</p></article>
  return (
    <article className="retailer-card">
      <div className="retailer-card-head"><h3>{title}</h3><span className="pill green">Live</span></div>
      <div className="retailer-detail-grid">
        {Object.entries(item).slice(0, 8).map(([key, value]) => <div key={key}><label>{key}</label><p>{String(value ?? 'N/A')}</p></div>)}
      </div>
    </article>
  )
}

function OverviewPage({ data }) {
  const processing = data.orders.filter(order => !['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(String(order.status).toUpperCase())).length
  const delivered = data.orders.filter(order => ['DELIVERED', 'COMPLETED'].includes(String(order.status).toUpperCase())).length
  const totalSpend = data.orders.reduce((sum, order) => sum + Number(order.totalAmount || order.amount || 0), 0)
  const suppliers = new Set(data.listings.map(item => item.farmName || item.sellerName || item.farm?.farmName).filter(Boolean)).size

  return <RetailerShell title="Retailer Overview" subtitle="Trực tiếp order, marketplace, and delivery status from BICAP APIs." loading={data.loading} error={data.error} success={data.success}>
    <div className="retailer-head-actions"><Button type="button" variant="ghost" onClick={() => window.location.reload()}><Icon>sync</Icon> Làm mới</Button></div>
    <section className="retailer-kpi-grid">
      <Kpi icon="pending_actions" label="Orders Processing" value={processing} note="Calculated from /orders" tone="blue" />
      <Kpi icon="check_circle" label="Orders Received" value={delivered} note="Delivered/completed orders" />
      <Kpi icon="payments" label="Total Spend" value={money(totalSpend)} note="Current order payload" tone="brown" />
      <Kpi icon="group" label="đang hoạt động Suppliers" value={suppliers || 'N/A'} note="From marketplace listings" tone="dark" />
    </section>
    <div className="retailer-dashboard-grid">
      <article className="retailer-card retailer-table-card"><div className="retailer-card-head"><h3>Recent Orders</h3><span>API-backed</span></div><RetailerTable rows={data.orders.slice(0, 6)} /></article>
      <aside className="retailer-side-stack">
        <article className="retailer-card"><h3><Icon>notifications_active</Icon> Delivery Alerts</h3>{data.shipments.length ? data.shipments.slice(0, 3).map(item => <Alert key={item.shipmentId || item.id} icon="local_shipping" title={`Shipment #${item.shipmentId || item.id}`} text={`${item.status || 'UNKNOWN'} · ${item.currentLocation || item.location || 'No location update'}`} tone={statusTone(item.status)} />) : <p>Không có shipment đang gán cho retailer.</p>}</article>
        <article className="retailer-card"><div className="retailer-card-head"><h3>Thông tin thị trường</h3><span className="pill green">Trực tiếp</span></div>{data.listings.slice(0, 3).map(item => <Insight key={item.listingId || item.id || item.title} title={item.title || item.productName || 'Listing'} text={item.farmName || item.location || 'Listing đã xác thực'} />)}{!data.listings.length ? <p>Chợ nông sản chưa có listing phù hợp.</p> : null}</article>
      </aside>
    </div>
  </RetailerShell>
}

function RetailerTable({ rows }) {
  const navigate = useNavigate()
  if (!rows.length) return <p className="empty-copy">Chưa có order nào từ backend.</p>
  return <table className="retailer-table"><thead><tr>{['Order ID','Supplier','Product','Status','Amount','Action'].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(order => <tr key={order.orderId || order.id}><td>#{order.orderId || order.id}</td><td>{order.farmName || order.supplierName || order.farm?.farmName || 'N/A'}</td><td>{order.productName || order.listingTitle || order.product?.name || 'N/A'}</td><td><span className={`status ${statusTone(order.status)}`}>{order.status || 'UNKNOWN'}</span></td><td><b>{money(order.totalAmount || order.amount)}</b></td><td><button type="button" title="Mở chi tiết đơn hàng" onClick={() => navigate('/retailer/orders')}><Icon>visibility</Icon></button></td></tr>)}</tbody></table>
}
function Alert({ icon, title, text, tone }) { return <div className={`retailer-alert ${tone}`}><Icon>{icon}</Icon><div><strong>{title}</strong><p>{text}</p><small>Backend update</small></div></div> }
function Insight({ title, text }) { return <div className="retailer-insight"><div></div><div><strong>{title}</strong><p>{text}</p></div><Icon>chevron_right</Icon></div> }

function listingOptions(items, fields) {
  const values = new Set()
  items.forEach((item) => fields.forEach((field) => {
    const value = item[field]
    if (typeof value === 'string' && value.trim()) values.add(value.trim())
  }))
  return Array.from(values).sort((a, b) => a.localeCompare(b, 'vi'))
}

function MarketplacePage({ data }) {
  const [categoryFilter, setCategoryFilter] = useState('')
  const [regionFilter, setRegionFilter] = useState('')
  const [selectedListingId, setSelectedListingId] = useState('')
  const [selectedListingDetail, setSelectedListingDetail] = useState(null)
  const categories = useMemo(() => listingOptions(data.listings, ['productCategory', 'categoryName', 'type']), [data.listings])
  const regions = useMemo(() => listingOptions(data.listings, ['province', 'region', 'location']), [data.listings])
  const filteredListings = useMemo(() => data.listings.filter((item) => {
    const categoryMatched = !categoryFilter || [item.productCategory, item.categoryName, item.type].some((value) => String(value || '') === categoryFilter)
    const regionMatched = !regionFilter || [item.province, item.region, item.location].some((value) => String(value || '') === regionFilter)
    return categoryMatched && regionMatched
  }), [categoryFilter, data.listings, regionFilter])
  const selectedListing = useMemo(() => filteredListings.find((item) => String(item.listingId || item.id) === String(selectedListingId)) || filteredListings[0] || null, [filteredListings, selectedListingId])

  useEffect(() => {
    let mounted = true
    async function loadDetail() {
      const listingId = selectedListing?.listingId || selectedListing?.id
      if (!listingId) {
        setSelectedListingDetail(null)
        return
      }
      try {
        const detail = await getListingById(listingId)
        if (mounted) setSelectedListingDetail(detail || selectedListing)
      } catch {
        if (mounted) setSelectedListingDetail(selectedListing)
      }
    }
    loadDetail()
    return () => { mounted = false }
  }, [selectedListing])

  return <RetailerShell title="Chợ nông sản" subtitle="Listing đã được backend trả về từ /listings." loading={data.loading} error={data.error} success={data.success}>
    <div className="retailer-market-layout"><aside className="retailer-filters"><div className="retailer-card-head"><h3>Bộ lọc</h3><a>Dữ liệu backend</a></div>{categories.length ? <FilterGroup title="Danh mục sản phẩm" items={categories} value={categoryFilter} onChange={setCategoryFilter} /> : <p>Chưa có danh mục từ listing backend.</p>}{regions.length ? <div className="filter-block"><h4>Khu vực</h4><select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)}><option value="">Tất cả khu vực</option>{regions.map((region) => <option key={region} value={region}>{region}</option>)}</select></div> : null}<Button variant="ghost" onClick={() => { setCategoryFilter(''); setRegionFilter('') }}>Xóa bộ lọc</Button></aside><div className="retailer-products"><div className="retailer-list-head"><div><h2>Chợ nông sản</h2><p>{data.listings.length} listing từ backend.</p></div><div><span><b>{filteredListings.length}</b> sản phẩm phù hợp</span><select><option>Sắp xếp: thứ tự backend</option></select></div></div>{filteredListings.length ? <div className="product-grid">{filteredListings.map(item => <Product key={item.listingId || item.id || item.title} item={item} onOrder={data.createOrderFromListing} orderingListingId={data.orderingListingId} />)}</div> : <EmptyState title="Chưa có listing" text="Backend chưa trả về listing nào cho bộ lọc hiện tại. Hãy tạo và duyệt listing từ farm trước." />}</div></div>
    <div className="retailer-details-split">
      <article className="retailer-card">
        <div className="retailer-card-head"><h3>Chi tiết nông sản</h3><span className="pill blue">Listing</span></div>
        <select value={selectedListingId} onChange={(event) => setSelectedListingId(event.target.value)}>
          <option value="">Chọn listing</option>
          {filteredListings.map((item) => <option key={item.listingId || item.id} value={item.listingId || item.id}>#{item.listingId || item.id} · {item.title || item.productName || 'Listing'}</option>)}
        </select>
        {selectedListingDetail ? <RetailerDetailsBar item={selectedListingDetail} title={selectedListingDetail.title || selectedListingDetail.productName || 'Listing chi tiết'} /> : <EmptyState title="Chưa chọn listing" text="Chọn một listing để xem chi tiết sản phẩm." />}
      </article>
    </div>
  </RetailerShell>
}

function TracePage({ data }) {
  const [inputCode, setInputCode] = useState('')
  const [traceData, setTraceData] = useState(null)
  const [traceError, setTraceError] = useState('')
  const [loadingTrace, setLoadingTrace] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scannerError, setScannerError] = useState('')
  const scannerRef = useRef(null)

  // Camera scanner mount/unmount per BR-TRC-010 (QR round-trip).
  // Reuses html5-qrcode pattern from DriverMobilePage.
  useEffect(() => {
    let cancelled = false
    if (!scannerOpen) {
      scannerRef.current?.clear?.().catch(() => {})
      scannerRef.current = null
      setScannerError('')
      return
    }
    async function mountScanner() {
      try {
        const { Html5QrcodeScanner } = await import('html5-qrcode')
        if (cancelled) return
        const scanner = new Html5QrcodeScanner(
          'retailer-qr-reader',
          { fps: 10, qrbox: { width: 220, height: 220 }, rememberLastUsedCamera: true },
          false,
        )
        scannerRef.current = scanner
        scanner.render(
          (decodedText) => {
            // QR can encode either a trace code directly or a full URL containing ?traceCode= or ?batchId=
            const extracted = extractTraceCodeFromQr(decodedText)
            setInputCode(extracted)
            setScannerOpen(false)
            runLookup(extracted)
          },
          () => {},
        )
      } catch (err) {
        if (!cancelled) setScannerError(getErrorMessage(err, 'Không thể mở camera. Vui lòng cấp quyền camera trên trình duyệt.'))
      }
    }
    mountScanner()
    return () => {
      cancelled = true
      scannerRef.current?.clear?.().catch(() => {})
      scannerRef.current = null
    }
  }, [scannerOpen])

  async function runLookup(rawCode) {
    const code = String(rawCode || '').trim()
    if (!code) {
      setTraceError('Nhập mã QR / trace code / batch ID để truy xuất.')
      setTraceData(null)
      return
    }
    setLoadingTrace(true)
    setTraceError('')
    setTraceData(null)
    try {
      // Heuristic: numeric input → batchId; otherwise trace code (which may include letters and dashes).
      const isNumeric = /^\d+$/.test(code)
      const result = isNumeric
        ? await traceBatch(Number(code), true)
        : await traceBatchByCode(code)
      if (!result) {
        setTraceError('Không tìm thấy thông tin truy xuất cho mã này.')
        return
      }
      setTraceData(result)
    } catch (err) {
      setTraceError(getErrorMessage(err, 'Không thể truy xuất thông tin sản phẩm. Mã có thể không hợp lệ hoặc backend chưa sẵn sàng.'))
    } finally {
      setLoadingTrace(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    runLookup(inputCode)
  }

  return <RetailerShell title="QR Trace" subtitle="Quét QR hoặc nhập mã để truy xuất nguồn gốc nông sản từ blockchain." loading={data.loading || loadingTrace} error={data.error || traceError || scannerError} success={data.success}>
    <section className="retailer-card">
      <div className="retailer-card-head">
        <h3>Truy xuất sản phẩm</h3>
        <span className="pill blue">Retailer</span>
      </div>
      <form className="retailer-search-row" onSubmit={handleSubmit} style={{ marginBottom: 12 }}>
        <input
          value={inputCode}
          onChange={(event) => setInputCode(event.target.value)}
          placeholder="Mã QR / trace code (ví dụ TRACE-30-XXXX) hoặc batch ID"
        />
        <Button type="submit" disabled={loadingTrace}>{loadingTrace ? 'Đang truy xuất...' : 'Truy xuất'}</Button>
      </form>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Button type="button" onClick={() => setScannerOpen((open) => !open)}>
          <Icon>qr_code_scanner</Icon>
          {scannerOpen ? 'Đóng camera' : 'Quét bằng camera'}
        </Button>
        <small style={{ color: 'var(--proto-muted, #6b7280)' }}>Mở camera thiết bị để quét trực tiếp mã QR sản phẩm.</small>
      </div>
      {scannerOpen ? (
        <div id="retailer-qr-reader" style={{ marginTop: 16, maxWidth: 360 }} />
      ) : null}
    </section>

    {traceData ? <TraceResultPanel trace={traceData} /> : <EmptyState title="Chưa có kết quả" text="Quét QR hoặc nhập mã ở trên để xem thông tin nguồn gốc." />}
  </RetailerShell>
}

function extractTraceCodeFromQr(decodedText) {
  if (!decodedText) return ''
  const text = String(decodedText).trim()
  // If QR contains a URL with traceCode or batchId query params, extract that.
  try {
    const url = new URL(text)
    const traceCode = url.searchParams.get('traceCode')
    if (traceCode) return traceCode
    const batchId = url.searchParams.get('batchId')
    if (batchId) return batchId
    // Fallback: take last path segment for routes like /public/trace/CODE
    const segments = url.pathname.split('/').filter(Boolean)
    if (segments.length) return segments[segments.length - 1]
  } catch {
    // Not a URL; treat as raw code.
  }
  return text
}

function TraceResultPanel({ trace }) {
  const batch = trace?.batch || {}
  const season = trace?.seasonInfo || trace?.season || {}
  const farm = trace?.farm || season?.farm || {}
  const qrInfo = trace?.qrInfo || {}
  const processList = Array.isArray(trace?.processList) ? trace.processList : []
  const timeline = Array.isArray(trace?.timeline) ? trace.timeline : []

  return (
    <section className="retailer-card" style={{ marginTop: 16 }}>
      <div className="retailer-card-head">
        <h3>Thông tin truy xuất</h3>
        <span className="pill green">Verified</span>
      </div>
      <dl className="trace-info-grid">
        <div><dt>Mã truy xuất</dt><dd>{qrInfo.traceCode || batch.traceCode || 'N/A'}</dd></div>
        <div><dt>Batch / Lô</dt><dd>{batch.batchCode || batch.batchId || 'N/A'}</dd></div>
        <div><dt>Mùa vụ</dt><dd>{season.seasonCode || season.seasonName || 'N/A'}</dd></div>
        <div><dt>Trang trại</dt><dd>{farm.farmName || farm.name || 'N/A'}</dd></div>
        <div><dt>Địa điểm</dt><dd>{farm.address || farm.province || 'N/A'}</dd></div>
        <div><dt>Sản phẩm</dt><dd>{batch.productName || season.productName || 'N/A'}</dd></div>
        <div><dt>Ngày thu hoạch</dt><dd>{batch.harvestDate || season.harvestDate || 'N/A'}</dd></div>
        <div><dt>Blockchain TX</dt><dd style={{ wordBreak: 'break-all' }}>{batch.blockchainTxHash || season.txHash || 'Đang chờ blockchain commit'}</dd></div>
      </dl>

      {processList.length ? (
        <div style={{ marginTop: 16 }}>
          <h4>Quy trình mùa vụ</h4>
          <ol className="trace-process-list">
            {processList.map((step, index) => (
              <li key={step.processId || step.id || index}>
                <strong>{step.stepName || step.name || `Bước ${index + 1}`}</strong>
                <p>{step.stepDescription || step.description || ''}</p>
                {step.performedAt ? <small>Thực hiện: {step.performedAt}</small> : null}
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {timeline.length ? (
        <div style={{ marginTop: 16 }}>
          <h4>Mốc thời gian</h4>
          <ul className="trace-timeline-list">
            {timeline.map((event, index) => (
              <li key={event.eventId || index}>
                <strong>{event.eventType || event.type || 'Event'}</strong>
                <span>{event.occurredAt || event.timestamp || ''}</span>
                {event.note ? <p>{event.note}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}

function OrdersPage({ data }) {
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [depositAmount, setDepositAmount] = useState('')
  const [depositNote, setDepositNote] = useState('')
  const [cancelNote, setCancelNote] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderHistory, setOrderHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    if (!selectedOrderId && data.orders[0]) setSelectedOrderId(String(data.orders[0].orderId || data.orders[0].id))
  }, [data.orders, selectedOrderId])

  useEffect(() => {
    let mounted = true
    async function loadOrder() {
      if (!selectedOrderId) { setSelectedOrder(null); return }
      try {
        const order = await getOrderById(selectedOrderId)
        if (mounted) setSelectedOrder(order || null)
      } catch {
        if (mounted) setSelectedOrder(data.orders.find((item) => String(item.orderId || item.id) === String(selectedOrderId)) || null)
      }
    }
    loadOrder()
    return () => { mounted = false }
  }, [data.orders, selectedOrderId])

  useEffect(() => {
    let mounted = true
    async function loadHistory() {
      if (!selectedOrderId) {
        setOrderHistory([])
        return
      }
      setHistoryLoading(true)
      try {
        const history = await getOrderStatusHistory(selectedOrderId)
        if (mounted) setOrderHistory(Array.isArray(history) ? history : [])
      } catch {
        if (mounted) setOrderHistory([])
      } finally {
        if (mounted) setHistoryLoading(false)
      }
    }
    loadHistory()
    return () => { mounted = false }
  }, [selectedOrderId])

  const displayedOrder = selectedOrder || data.orders.find((item) => String(item.orderId || item.id) === String(selectedOrderId)) || null

  async function handleDeposit() {
    if (!displayedOrder) return
    await payOrderDeposit(displayedOrder.orderId || displayedOrder.id, { amount: Number(depositAmount), note: depositNote.trim() })
    setDepositAmount('')
    setDepositNote('')
    window.location.reload()
  }

  async function handleCancel() {
    if (!displayedOrder) return
    await cancelOrder(displayedOrder.orderId || displayedOrder.id, { reason: cancelNote.trim() || 'Retailer request' })
    setCancelNote('')
    window.location.reload()
  }

  return <RetailerShell title="Đơn hàng" subtitle="Tạo, xem, thanh toán đặt cọc, hủy và xem trạng thái đơn hàng." loading={data.loading} error={data.error} success={data.success}>
    <section className="retailer-card">
      <div className="retailer-card-head"><h3>Chọn đơn</h3><span className="pill blue">{data.orders.length} orders</span></div>
      <select value={selectedOrderId} onChange={(event) => setSelectedOrderId(event.target.value)}>
        <option value="">Chọn order</option>
        {data.orders.map((order) => <option key={order.orderId || order.id} value={order.orderId || order.id}>#{order.orderId || order.id} · {order.status || 'UNKNOWN'}</option>)}
      </select>
    </section>
    <div className="deposit-bottom">
      <article className="retailer-card">
        <div className="retailer-card-head"><h3>Chi tiết & trạng thái</h3></div>
        {displayedOrder ? <RetailerDetailsBar item={displayedOrder} empty="Chọn order để xem." /> : <EmptyState title="Chưa chọn đơn" text="Chọn một order để xem chi tiết và thao tác." />}
        {displayedOrder ? <div className="retailer-actions-row"><Button variant="ghost" onClick={() => setSelectedOrderId(String(displayedOrder.orderId || displayedOrder.id))}><Icon>visibility</Icon> Xem chi tiết</Button></div> : null}
      </article>
      <aside className="retailer-side-stack">
        <article className="retailer-card">
          <div className="retailer-card-head"><h3>Thanh toán đặt cọc</h3></div>
          <input value={depositAmount} onChange={(event) => setDepositAmount(event.target.value)} placeholder="Số tiền cọc" />
          <textarea value={depositNote} onChange={(event) => setDepositNote(event.target.value)} placeholder="Ghi chú thanh toán" rows={3} />
          <Button onClick={handleDeposit} disabled={!displayedOrder}>Thanh toán cọc</Button>
        </article>
        <article className="retailer-card">
          <div className="retailer-card-head"><h3>Hủy đơn</h3></div>
          <textarea value={cancelNote} onChange={(event) => setCancelNote(event.target.value)} placeholder="Lý do hủy" rows={3} />
          <Button variant="ghost" onClick={handleCancel} disabled={!displayedOrder}>Hủy yêu cầu</Button>
        </article>
      </aside>
    </div>
    <article className="retailer-card retailer-table-card"><div className="retailer-card-head"><h3>Lịch sử đơn hàng</h3><span>API-backed</span></div><RetailerTable rows={data.orders} /></article>
    <article className="retailer-card"><div className="retailer-card-head"><h3>Lịch sử trạng thái</h3><span>{historyLoading ? 'Đang tải...' : `${orderHistory.length} event(s)`}</span></div>{orderHistory.length ? <div className="history-card-list">{orderHistory.map((item, index) => <div className="history-card" key={item.id || `${selectedOrderId}-${index}`}><div><Icon>timeline</Icon><div><h4>{item.status || item.action || 'STATUS_EVENT'}</h4><p>{item.note || item.description || item.message || 'Không có ghi chú.'}</p></div></div><div><strong>{item.createdAt || item.time || 'N/A'}</strong></div></div>)}</div> : <EmptyState title="Chưa có lịch sử" text="Backend chưa trả về lịch sử trạng thái cho đơn đang chọn." />}</article>
  </RetailerShell>
}

function ShippingPage({ data }) {
  const [selectedShipmentId, setSelectedShipmentId] = useState('')
  const [proofNote, setProofNote] = useState('')
  const [proofFiles, setProofFiles] = useState([])
  const [deliveryNote, setDeliveryNote] = useState('')
  const selectedShipment = data.shipments.find((item) => String(item.shipmentId || item.id) === String(selectedShipmentId)) || data.shipments[0] || null

  useEffect(() => {
    if (!selectedShipmentId && data.shipments[0]) setSelectedShipmentId(String(data.shipments[0].shipmentId || data.shipments[0].id))
  }, [data.shipments, selectedShipmentId])

  async function handleConfirmDelivery() {
    if (!selectedShipment) return
    await confirmOrderDelivery(selectedShipment.orderId || selectedShipment.shipmentId, { note: deliveryNote.trim() || 'Retailer confirmed full delivery' })
    window.location.reload()
  }

  async function handleUploadProof() {
    if (!selectedShipment || !proofFiles[0]) return
    await uploadShippingProof(selectedShipment.orderId || selectedShipment.shipmentId, { file: proofFiles[0], note: proofNote.trim() })
    window.location.reload()
  }

  return <RetailerShell title="Giao nhận" subtitle="Xem shipment và xác nhận nhận hàng đầy đủ." loading={data.loading} error={data.error} success={data.success}>
    <section className="retailer-card">
      <div className="retailer-card-head"><h3>Chọn shipment</h3><span className="pill blue">{data.shipments.length} shipments</span></div>
      <select value={selectedShipmentId} onChange={(event) => setSelectedShipmentId(event.target.value)}>
        <option value="">Chọn shipment</option>
        {data.shipments.map((shipment) => <option key={shipment.shipmentId || shipment.id} value={shipment.shipmentId || shipment.id}>#{shipment.shipmentId || shipment.id} · {shipment.status || 'UNKNOWN'}</option>)}
      </select>
    </section>
    <div className="deposit-bottom">
      <article className="retailer-card">
        <div className="retailer-card-head"><h3>Trạng thái shipment</h3></div>
        {selectedShipment ? <RetailerDetailsBar item={selectedShipment} title="Shipment hiện tại" empty="Chưa có shipment" /> : <EmptyState title="Chưa có shipment" text="Backend chưa trả về shipment phù hợp." />}
      </article>
      <aside className="retailer-side-stack">
        <article className="retailer-card">
          <div className="retailer-card-head"><h3>Xác nhận giao đầy đủ</h3></div>
          <textarea value={deliveryNote} onChange={(event) => setDeliveryNote(event.target.value)} placeholder="Ghi chú giao hàng" rows={3} />
          <Button onClick={handleConfirmDelivery} disabled={!selectedShipment}>Xác nhận giao</Button>
        </article>
        <article className="retailer-card">
          <div className="retailer-card-head"><h3>Upload ảnh giao hàng</h3></div>
          <input type="file" accept="image/*" onChange={(event) => setProofFiles(Array.from(event.target.files || []))} />
          <textarea value={proofNote} onChange={(event) => setProofNote(event.target.value)} placeholder="Ghi chú ảnh" rows={3} />
          <Button variant="ghost" onClick={handleUploadProof} disabled={!selectedShipment || !proofFiles.length}>Tải ảnh lên</Button>
        </article>
      </aside>
    </div>
  </RetailerShell>
}

function MessagesPage({ data }) {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [markingId, setMarkingId] = useState(null)

  async function handleSend() {
    setSending(true)
    try {
      await createNotification({ recipientRole: 'FARM', title: title.trim(), message: message.trim(), notificationType: 'MANUAL' })
      window.location.reload()
    } finally {
      setSending(false)
    }
  }

  async function handleMarkRead(notificationId) {
    if (!notificationId) return
    setMarkingId(notificationId)
    try {
      await markNotificationRead(notificationId)
      window.location.reload()
    } finally {
      setMarkingId(null)
    }
  }

  return <RetailerShell title="Tin nhắn" subtitle="Gửi thông báo đến Quản lý Trang trại." loading={data.loading} error={data.error} success={data.success}>
    <div className="retailer-dashboard-grid">
      <article className="retailer-card">
        <div className="retailer-card-head"><h3>Gửi thông báo</h3></div>
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Tiêu đề" />
        <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Nội dung" rows={5} />
        <Button onClick={handleSend} disabled={sending || !title.trim() || !message.trim()}>Gửi cho Farm</Button>
      </article>
      <aside className="retailer-side-stack">
        <article className="retailer-card"><div className="retailer-card-head"><h3>Thông báo gần đây</h3></div>{data.notifications.length ? data.notifications.slice(0, 4).map((item) => <div key={item.notificationId || item.id} className="retailer-alert-wrap"><Alert icon="message" title={item.title || 'Notification'} text={item.message || item.content || 'N/A'} tone={statusTone(item.status || '')} /><Button variant="ghost" onClick={() => handleMarkRead(item.notificationId || item.id)} disabled={markingId === (item.notificationId || item.id)}>{markingId === (item.notificationId || item.id) ? 'Đang xử lý...' : 'Đánh dấu đã đọc'}</Button></div>) : <p>Chưa có message backend.</p>}</article>
      </aside>
    </div>
  </RetailerShell>
}

function ReportsPage({ data }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState('LOW')
  const [sending, setSending] = useState(false)

  async function handleSubmit() {
    setSending(true)
    try {
      // R-RTL-190 — backend yêu cầu schema {recipientRole, reportType, subject, content}.
      // Severity được encode vào subject vì PlatformReport không có cột severity.
      await createReport({
        recipientRole: 'ADMIN',
        reportType: 'RETAILER_OPERATION',
        subject: `[${severity}] ${title.trim()}`,
        content: description.trim(),
      })
      window.location.reload()
    } finally {
      setSending(false)
    }
  }

  return <RetailerShell title="Báo cáo" subtitle="Gửi báo cáo đến quản trị viên." loading={data.loading} error={data.error} success={data.success}>
    <div className="deposit-bottom">
      <article className="retailer-card">
        <div className="retailer-card-head"><h3>Tạo báo cáo</h3></div>
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Tiêu đề" />
        <select value={severity} onChange={(event) => setSeverity(event.target.value)}><option value="LOW">LOW</option><option value="MEDIUM">MEDIUM</option><option value="HIGH">HIGH</option></select>
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Nội dung báo cáo" rows={5} />
        <Button onClick={handleSubmit} disabled={sending || !title.trim() || !description.trim()}>Gửi báo cáo</Button>
      </article>
      <aside className="retailer-side-stack">
        <article className="retailer-card"><div className="retailer-card-head"><h3>Tham chiếu</h3></div>{data.shipments.length ? data.shipments.slice(0, 3).map((shipment) => <Alert key={shipment.shipmentId || shipment.id} icon="local_shipping" title={`Shipment #${shipment.shipmentId || shipment.id}`} text={shipment.status || 'UNKNOWN'} tone={statusTone(shipment.status)} />) : <p>Chưa có shipment để tham chiếu.</p>}</article>
      </aside>
    </div>
  </RetailerShell>
}

function FilterGroup({ title, items, value, onChange }) { return <div className="filter-block"><h4>{title}</h4>{items.map(x => <label key={x}><input type="checkbox" checked={value === x} onChange={(event) => onChange(event.target.checked ? x : '')} /><span>{x}</span></label>)}</div> }
function Product({ item, onOrder, orderingListingId }) {
  const title = item.title || item.productName || item.product?.name || 'Listing chưa có tên'
  const listingId = item.listingId || item.id
  const isOrdering = String(orderingListingId) === String(listingId)
  const status = item.certification || item.certificationStatus || item.approvalStatus || item.status || ''
  const traceable = item.traceabilityStatus || (item.traceable || item.traceCode || item.qrCodeUrl ? 'Có truy xuất' : '')
  return <article className="product-card"><div className="product-art wheat">{status ? <span>{status}</span> : null}{traceable ? <b>{traceable}</b> : null}</div><div><header><h3>{title}</h3><span><Icon fill>star</Icon> {item.rating || 'N/A'}</span></header><p><Icon>location_on</Icon>{item.location || item.province || item.farmName || 'Chưa cập nhật'}</p><dl><div><dt>Giá bán</dt><dd>{money(item.price || item.unitPrice)} <small>{item.unit || ''}</small></dd></div><div><dt>Tồn khả dụng</dt><dd>{item.availableQuantity || item.quantityAvailable || item.quantity || 'N/A'}</dd></div></dl><footer><button type="button" onClick={() => onOrder?.(item)} disabled={isOrdering || !listingId}><Icon>shopping_bag</Icon>{isOrdering ? 'Đang đặt...' : 'Đặt hàng'}</button><button type="button"><Icon>contract</Icon></button></footer></div></article>
}

function ProfilePage({ data }) {
  const retailer = data.retailer || {}
  const [form, setForm] = useState({
    businessName: retailer.businessName || retailer.name || '',
    representativeName: retailer.representativeName || retailer.contactName || '',
    email: retailer.email || retailer.contactEmail || '',
    address: retailer.address || '',
    phone: retailer.phone || '',
    businessType: retailer.businessType || '',
  })
  const [licenseFile, setLicenseFile] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm({
      businessName: retailer.businessName || retailer.name || '',
      representativeName: retailer.representativeName || retailer.contactName || '',
      email: retailer.email || retailer.contactEmail || '',
      address: retailer.address || '',
      phone: retailer.phone || '',
      businessType: retailer.businessType || '',
    })
  }, [retailer.businessName, retailer.businessType, retailer.contactName, retailer.contactEmail, retailer.email, retailer.name, retailer.phone, retailer.representativeName, retailer.address])

  async function handleSave() {
    const retailerId = retailer.retailerId || retailer.id
    if (!retailerId) return
    setSaving(true)
    try {
      await updateRetailer(retailerId, {
        businessName: form.businessName.trim(),
        representativeName: form.representativeName.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        businessType: form.businessType.trim(),
      })
      if (licenseFile) await uploadRetailerBusinessLicense(retailerId, licenseFile)
      window.location.reload()
    } finally {
      setSaving(false)
    }
  }

  return <RetailerShell title="Retailer Hồ sơ" subtitle="Business profile from /retailers/me." loading={data.loading} error={data.error} success={data.success}>
    <section className="profile-hero"><div className="cover"></div><div className="profile-identity"><div className="store-logo">{(retailer.businessName || retailer.name || 'RT').slice(0, 2).toUpperCase()}</div><div><h2>{retailer.businessName || retailer.name || 'Retailer business not configured'} <span><Icon fill>verified</Icon>{retailer.status || 'Backend Managed'}</span></h2><p>{retailer.businessType || 'Retail partner'} • {retailer.createdAt || 'Created by backend'}</p></div></div></section>
    <div className="profile-grid"><article className="retailer-card business-info"><div className="retailer-card-head"><h3>Business Information</h3><Icon>business_center</Icon></div><div className="info-grid"><label><span>Business Name</span><input value={form.businessName} onChange={(event) => setForm((prev) => ({ ...prev, businessName: event.target.value }))} /></label><label><span>Representative Name</span><input value={form.representativeName} onChange={(event) => setForm((prev) => ({ ...prev, representativeName: event.target.value }))} /></label><label><span>Contact Email</span><input value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} /></label><label><span>Business Phone</span><input value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} /></label><label style={{ gridColumn: '1 / -1' }}><span>Store Address</span><textarea rows={3} value={form.address} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} /></label><label><span>Business Type</span><input value={form.businessType} onChange={(event) => setForm((prev) => ({ ...prev, businessType: event.target.value }))} /></label></div><div className="retailer-card-head" style={{ marginTop: 16 }}><h3>Business License</h3></div><input type="file" accept="application/pdf,image/*" onChange={(event) => setLicenseFile(event.target.files?.[0] || null)} /><div className="retailer-actions-row"><Button onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu hồ sơ'}</Button></div></article><aside className="profile-side"><article className="identity-card"><h3><Icon>verified_user</Icon> Backend Identity</h3><p><span>Retailer ID</span><b>{retailer.retailerId || retailer.id || 'N/A'}</b></p><p><span>Status</span><b>{retailer.status || 'N/A'}</b></p><span><i></i></span></article></aside></div>
  </RetailerShell>
}
function Info({ label, value }) { return <div><label>{label}</label><p>{String(value).split('\n').map((x, i) => <span key={`${label}-${i}`}>{x}{i === 0 ? <br /> : null}</span>)}</p></div> }

function DepositPage({ data }) {
  const total = data.orders.reduce((sum, order) => sum + Number(order.depositAmount || order.totalAmount || 0), 0)
  return <RetailerShell title="Wallet & Payments" subtitle="Payment status inferred from live orders." loading={data.loading} error={data.error} success={data.success}><section className="wallet-grid"><Wallet tone="green" icon="account_balance_wallet" label="Order Value" value={money(total)} note="Aggregated from /orders" /><Wallet tone="blue" icon="pending_actions" label="Payment-linked Orders" value={data.orders.length} note="Current retailer-accessible payload" /><article className="security-tile"><h3><Icon fill>verified_user</Icon> Settlement Security</h3><p>Payment actions remain enforced by backend order/payment endpoints.</p><span><i></i>Fail-closed if API data is unavailable</span></article></section><TransactionTable rows={data.orders} title="Order Payment History" /></RetailerShell>
}
function Wallet({ tone, icon, label, value, note }) { return <article className={`wallet-card ${tone}`}><Icon fill>{icon}</Icon><p>{label}</p><strong>{value}</strong><span>{note}</span></article> }
function TransactionTable({ title = 'Transaction History', rows = [] }) { return <article className="retailer-card retailer-table-card"><div className="retailer-card-head"><div><h3>{title}</h3><p>Settlement & order traceability</p></div></div>{rows.length ? <table className="retailer-table"><thead><tr>{['Transaction ID','Entity / Contract','Status','Truy xuất blockchain','Date','Amount'].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(order => <tr key={order.orderId || order.id}><td>#{order.paymentId || order.orderId || order.id}</td><td><b>{order.farmName || order.supplierName || 'Order'}</b><small>{order.contractCode || 'Order trace enabled'}</small></td><td><span className={`status ${statusTone(order.paymentStatus || order.status)}`}>{order.paymentStatus || order.status || 'UNKNOWN'}</span></td><td><a>{order.blockchainTxHash || order.txHash || 'N/A'}</a></td><td>{order.createdAt || order.updatedAt || 'N/A'}</td><td><b>{money(order.totalAmount || order.amount)}</b></td></tr>)}</tbody></table> : <p className="empty-copy">Chưa có transaction/order từ backend.</p>}</article> }

function HistoryPage({ data }) {
  return <RetailerShell title="Transaction History" subtitle="Review backend order and shipment history." loading={data.loading} error={data.error} success={data.success}><section className="history-filters"><div><label>Source</label><span><Icon>api</Icon>/orders + /shipments/retailer</span></div><article><p>Loaded Orders</p><strong>{data.orders.length}</strong><span><Icon>sync</Icon>Trực tiếp API result</span></article></section><div className="history-grid"><section className="history-list"><h3><Icon>list_alt</Icon>RECENT ORDERS</h3>{data.orders.length ? data.orders.slice(0, 8).map(order => <article className="history-card" key={order.orderId || order.id}><div><Icon>eco</Icon><div><h4>{order.productName || order.listingTitle || `Order #${order.orderId || order.id}`}</h4><p>Status: {order.status || 'UNKNOWN'} • {order.createdAt || 'N/A'}</p></div></div><div><strong>{money(order.totalAmount || order.amount)}</strong><span className={statusTone(order.status)}>{order.status || 'UNKNOWN'}</span></div><footer><span><Icon>location_on</Icon>{order.farmName || 'N/A'}</span><span><Icon>inventory_2</Icon>{order.quantity || 'N/A'}</span><button type="button"><Icon>visibility</Icon></button></footer></article>) : <EmptyState title="No order history" text="Backend chưa trả về order history cho retailer hiện tại." />}</section><aside className="trace-details"><h3><Icon>timeline</Icon>ACTIVE SHIPMENTS</h3><article>{data.shipments.length ? data.shipments.slice(0, 4).map(item => <div className="trace-timeline" key={item.shipmentId || item.id}><div className="current"><span>🚚</span><div><strong>Shipment #{item.shipmentId || item.id}</strong><p>{item.status || 'UNKNOWN'} · {item.currentLocation || 'No location'}</p></div></div></div>) : <p>Không có shipment active.</p>}</article></aside></div></RetailerShell>
}

function FallbackPage({ module, data }) { return <RetailerShell title="Retailer Workspace" subtitle="Module chưa có backend-specific screen; không hiển thị dữ liệu giả." loading={data.loading} error={data.error} success={data.success}><article className="retailer-card"><h3>Module: {module}</h3><p>Trang này đang chờ wiring API riêng. Hệ thống không dùng dữ liệu demo thay thế.</p></article></RetailerShell> }

export function RetailerWorkspacePage({ module = 'overview' }) {
  const data = useRetailerWorkspaceData()
  if (module === 'overview') return <OverviewPage data={data} />
  if (module === 'marketplace') return <MarketplacePage data={data} />
  if (module === 'profile') return <ProfilePage data={data} />
  if (module === 'trace') return <TracePage data={data} />
  if (module === 'orders') return <OrdersPage data={data} />
  if (module === 'deposit') return <DepositPage data={data} />
  if (module === 'history') return <HistoryPage data={data} />
  if (module === 'shipping') return <ShippingPage data={data} />
  if (module === 'messages') return <MessagesPage data={data} />
  if (module === 'reports') return <ReportsPage data={data} />
  if (module === 'contracts') return <RetailerShell title="Quản lý hợp đồng" subtitle="Hợp đồng hợp tác với nông trại" loading={data.loading} error={data.error} success={data.success}><ContractsPage /></RetailerShell>
  return <FallbackPage module={module} data={data} />
}
