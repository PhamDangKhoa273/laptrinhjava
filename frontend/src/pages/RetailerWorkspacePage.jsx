import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../retailer-workspace.css'
import { useAuth } from '../context/AuthContext.jsx'
import { changePassword } from '../services/authService.js'
import { getPublicListings, getListingById } from '../services/listingService.js'
import { cancelOrder, confirmOrderDelivery, createOrder, createReport, getMyNotifications, getOrderById, getOrdersV2, getRetailerShipments, markNotificationRead, payOrderDeposit } from '../services/workflowService.js'
import { createNotification, createRetailer, getMyRetailer, updateRetailer, uploadRetailerBusinessLicense } from '../services/businessService.js'
import { uploadDeliveryProofFile } from '../services/mediaService.js'
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
  if (value === null || value === undefined || value === '') return 'Chưa có số tiền'
  const number = Number(value)
  if (Number.isNaN(number)) return String(value)
  return number.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
}

function present(value, fallback = 'Chưa có dữ liệu') {
  if (value === null || value === undefined || value === '') return fallback
  const text = String(value).trim()
  if (!text || text.toUpperCase() === 'N/A') return fallback
  return value
}

function statusTone(status = '') {
  const value = String(status).toUpperCase()
  if (value.includes('DELIVER') || value.includes('COMPLETE') || value.includes('PAID')) return 'green'
  if (value.includes('TRANSIT') || value.includes('SHIP')) return 'blue'
  if (value.includes('CANCEL') || value.includes('REJECT') || value.includes('DELAY')) return 'red'
  return 'gray'
}

function orderStatusText(status = '') {
  const value = String(status || '').toUpperCase()
  if (value === 'PENDING') return 'Tạo yêu cầu mua hàng'
  if (value === 'CONFIRMED') return 'Farm đã xác nhận'
  if (value === 'REJECTED') return 'Farm từ chối'
  if (value === 'CANCELLED') return 'Đã hủy yêu cầu'
  if (value === 'READY_FOR_SHIPMENT') return 'Chờ điều phối vận chuyển'
  if (value === 'SHIPPING') return 'Đang vận chuyển'
  if (value === 'DELIVERED') return 'Đã giao hàng'
  if (value === 'COMPLETED') return 'Hoàn tất đơn hàng'
  if (value === 'DISPUTED') return 'Đang xử lý tranh chấp'
  return value || 'Cập nhật đơn hàng'
}

function orderStatusIcon(status = '') {
  const value = String(status || '').toUpperCase()
  if (value === 'PENDING') return 'add_shopping_cart'
  if (value === 'CONFIRMED') return 'task_alt'
  if (value === 'CANCELLED' || value === 'REJECTED') return 'cancel'
  if (value === 'SHIPPING' || value === 'READY_FOR_SHIPMENT') return 'local_shipping'
  if (value === 'DELIVERED' || value === 'COMPLETED') return 'verified'
  if (value === 'DISPUTED') return 'report'
  return 'timeline'
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
        setState(current => ({ ...current, loading: false, error: getErrorMessage(err, 'Không thể tải dữ liệu nhà bán lẻ.') }))
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  async function handleCreateOrder(listing) {
    const listingId = listing?.listingId || listing?.id
    if (!listingId) {
      setState(current => ({ ...current, error: 'Listing không có ID hợp lệ để tạo đơn hàng.' }))
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
        success: `Đã tạo đơn hàng #${createdOrder?.orderId || ''} từ listing #${listingId}.`,
        orderingListingId: null,
        orders: unwrapList(orders),
        listings: unwrapList(listings),
        shipments: unwrapList(shipments),
        notifications: unwrapList(notifications),
      }))
    } catch (err) {
      setState(current => ({
        ...current,
        error: getErrorMessage(err, 'Không thể tạo đơn hàng từ listing này.'),
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

function RetailerShell({ title, subtitle, children, loading, error, success, pageClassName = '' }) {
  return (
    <section className="retailer-prototype-shell">
      <div className={`retailer-page-canvas ${pageClassName}`}>
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
        {Object.entries(item).slice(0, 8).map(([key, value]) => <div key={key}><label>{key}</label><p>{String(present(value))}</p></div>)}
      </div>
    </article>
  )
}

function OverviewPage({ data }) {
  const processing = data.orders.filter(order => !['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(String(order.status).toUpperCase())).length
  const delivered = data.orders.filter(order => ['DELIVERED', 'COMPLETED'].includes(String(order.status).toUpperCase())).length
  const totalSpend = data.orders.reduce((sum, order) => sum + Number(order.totalAmount || order.amount || 0), 0)
  const suppliers = new Set(data.listings.map(item => item.farmName || item.sellerName || item.farm?.farmName).filter(Boolean)).size

  return <RetailerShell title="Tổng quan nhà bán lẻ" subtitle="Theo dõi đơn mua, chợ nông sản và giao nhận từ dữ liệu BICAP." loading={data.loading} error={data.error} success={data.success}>
    <div className="retailer-head-actions"><Button type="button" variant="ghost" onClick={() => window.location.reload()}><Icon>sync</Icon> Làm mới</Button></div>
    <section className="retailer-kpi-grid">
      <Kpi icon="pending_actions" label="Đơn đang xử lý" value={processing} note="Tính từ dữ liệu đơn hàng" tone="blue" />
      <Kpi icon="check_circle" label="Đơn đã nhận" value={delivered} note="Đơn đã giao hoặc hoàn tất" />
      <Kpi icon="payments" label="Tổng chi tiêu" value={money(totalSpend)} note="Theo dữ liệu đơn hiện tại" tone="brown" />
      <Kpi icon="group" label="Nhà cung cấp" value={suppliers} note="Từ listing trên chợ" tone="dark" />
    </section>
    <div className="retailer-dashboard-grid">
      <article className="retailer-card retailer-table-card"><div className="retailer-card-head"><h3>Đơn gần đây</h3><span>Dữ liệu backend</span></div><RetailerTable rows={data.orders.slice(0, 6)} /></article>
      <aside className="retailer-side-stack">
        <article className="retailer-card"><h3><Icon>notifications_active</Icon> Cảnh báo giao nhận</h3>{data.shipments.length ? data.shipments.slice(0, 3).map(item => <Alert key={item.shipmentId || item.id} icon="local_shipping" title={`Shipment #${item.shipmentId || item.id}`} text={`${item.status || 'UNKNOWN'} · ${item.currentLocation || item.location || 'Chưa cập nhật vị trí'}`} tone={statusTone(item.status)} />) : <p>Không có shipment đang gán cho nhà bán lẻ.</p>}</article>
        <article className="retailer-card"><div className="retailer-card-head"><h3>Thông tin thị trường</h3><span className="pill green">Trực tiếp</span></div>{data.listings.slice(0, 3).map(item => <Insight key={item.listingId || item.id || item.title} title={item.title || item.productName || 'Listing'} text={item.farmName || item.location || 'Listing đã xác thực'} />)}{!data.listings.length ? <p>Chợ nông sản chưa có listing phù hợp.</p> : null}</article>
      </aside>
    </div>
  </RetailerShell>
}

function RetailerTable({ rows, onSelectOrder }) {
  const navigate = useNavigate()
  if (!rows.length) return <p className="empty-copy">Chưa có đơn hàng nào từ backend.</p>
  return <table className="retailer-table"><thead><tr>{['Mã đơn','Nhà cung cấp','Sản phẩm','Trạng thái','Số tiền','Thao tác'].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(order => {
    const firstItem = Array.isArray(order.items) ? order.items[0] : null
    const supplier = order.farmName || order.supplierName || order.farm?.farmName || (order.farmId ? `Farm #${order.farmId}` : 'Chưa có dữ liệu')
    const product = order.productName || order.listingTitle || order.product?.name || firstItem?.title || firstItem?.batchCode || (firstItem?.listingId ? `Listing #${firstItem.listingId}` : 'Chưa có dữ liệu')
    return <tr key={order.orderId || order.id}><td>#{order.orderId || order.id}</td><td>{supplier}</td><td>{product}</td><td><span className={`status ${statusTone(order.status)}`}>{order.status || 'UNKNOWN'}</span></td><td><b>{money(order.totalAmount || order.amount)}</b></td><td><button type="button" title="Xem chi tiết đơn hàng" onClick={() => onSelectOrder ? onSelectOrder(order) : navigate('/retailer/orders')}><Icon>visibility</Icon></button></td></tr>
  })}</tbody></table>
}
function Alert({ icon, title, text, tone }) { return <div className={`retailer-alert ${tone}`}><Icon>{icon}</Icon><div><strong>{title}</strong><p>{text}</p><small>Cập nhật backend</small></div></div> }
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
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [regionFilter, setRegionFilter] = useState('')
  const [page, setPage] = useState(0)
  const [listings, setListings] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loadingListings, setLoadingListings] = useState(true)
  const [filterOptions, setFilterOptions] = useState({ provinces: [], certifications: [] })
  const [selectedId, setSelectedId] = useState('')
  const [selectedDetail, setSelectedDetail] = useState(null)
  const PAGE_SIZE = 12

  // Load filter options once
  useEffect(() => {
    import('../services/searchService.js').then(m => {
      m.getFilterOptions().then(opts => setFilterOptions(opts)).catch(() => {})
    })
  }, [])

  // Fetch listings on search/filter/page change (debounced)
  useEffect(() => {
    let mounted = true
    const handle = setTimeout(async () => {
      setLoadingListings(true)
      try {
        const { searchListings } = await import('../services/searchService.js')
        const result = await searchListings({
          keyword: search || undefined,
          province: regionFilter || undefined,
          productCategory: categoryFilter || undefined,
          page,
          size: PAGE_SIZE,
        })
        if (!mounted) return
        setListings(result.items || [])
        setTotalItems(result.totalItems || 0)
        setTotalPages(result.totalPages || 0)
        // Auto-select first
        if (result.items?.length > 0) setSelectedId(String(result.items[0].listingId || result.items[0].id))
      } catch {
        if (mounted) setListings([])
      } finally {
        if (mounted) setLoadingListings(false)
      }
    }, 300)
    return () => { mounted = false; clearTimeout(handle) }
  }, [search, categoryFilter, regionFilter, page])

  // Load detail when selected changes
  useEffect(() => {
    if (!selectedId) { setSelectedDetail(null); return }
    const item = listings.find(i => String(i.listingId || i.id) === String(selectedId))
    if (!item) return
    setSelectedDetail(item)
    getListingById(item.listingId || item.id).then(d => setSelectedDetail(d || item)).catch(() => {})
  }, [selectedId])

  const activeFilters = [search, categoryFilter, regionFilter].filter(Boolean).length

  return (
    <RetailerShell title="Chợ nông sản" subtitle={`${totalItems} sản phẩm${activeFilters ? ` · ${activeFilters} bộ lọc` : ''}`} loading={data.loading} error={data.error} success={data.success}>
      <div className="retailer-market-clean">
      {/* Search + filter bar */}
      <div className="retailer-market-toolbar">
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
          placeholder="Tìm theo tên sản phẩm, nông trại..."
        />
        {filterOptions.provinces.length > 0 && (
          <select value={regionFilter} onChange={e => { setRegionFilter(e.target.value); setPage(0) }}>
            <option value="">Tất cả khu vực</option>
            {filterOptions.provinces.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        )}
        {activeFilters > 0 && (
          <button type="button" onClick={() => { setSearch(''); setCategoryFilter(''); setRegionFilter(''); setPage(0) }}>
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Grid + detail */}
      <div className="retailer-market-grid">
        <div>
          {loadingListings ? (
            <div className="retailer-card"><p>Đang tải sản phẩm...</p></div>
          ) : listings.length === 0 ? (
            <article className="retailer-card"><EmptyState title="Không tìm thấy sản phẩm" text="Thử thay đổi từ khóa hoặc bộ lọc." /></article>
          ) : (
            <>
              <div className="product-grid">
                {listings.map(item => (
                  <article
                    key={item.listingId || item.id}
                    className="product-card"
                    onClick={() => setSelectedId(String(item.listingId || item.id))}
                    style={{ cursor: 'pointer', outline: String(selectedId) === String(item.listingId || item.id) ? '2px solid #0d631b' : 'none' }}
                  >
                    <div className="product-art wheat">
                      {item.certification || item.certificationStatus ? <span>{item.certification || item.certificationStatus}</span> : null}
                      {item.traceCode || item.publicTraceUrl ? <b>Có truy xuất</b> : null}
                    </div>
                    <div>
                      <header><h3>{item.title || item.productName || 'Sản phẩm'}</h3></header>
                      <p><Icon>location_on</Icon>{item.province || item.location || item.farmName || 'Chưa cập nhật khu vực'}</p>
                      <dl>
                        <div><dt>Giá bán</dt><dd>{money(item.price || item.unitPrice)} <small>{item.unit || ''}</small></dd></div>
                        <div><dt>Còn lại</dt><dd>{item.availableQuantity ?? item.quantityAvailable ?? 'Chưa có tồn kho'}</dd></div>
                      </dl>
                      <footer>
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); data.createOrderFromListing?.(item) }}
                          disabled={String(data.orderingListingId) === String(item.listingId || item.id)}
                        >
                          <Icon>shopping_bag</Icon>
                          {String(data.orderingListingId) === String(item.listingId || item.id) ? 'Đang đặt...' : 'Đặt hàng'}
                        </button>
                      </footer>
                    </div>
                  </article>
                ))}
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
                  <button type="button" disabled={page === 0} onClick={() => setPage(p => p - 1)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: page === 0 ? 'not-allowed' : 'pointer', fontWeight: 700 }}>Trước</button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const p = totalPages <= 7 ? i : (page < 4 ? i : page - 3 + i)
                    if (p >= totalPages) return null
                    return (
                      <button key={p} type="button" onClick={() => setPage(p)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: p === page ? '#0d631b' : '#fff', color: p === page ? '#fff' : '#0f172a', cursor: 'pointer', fontWeight: 700 }}>{p + 1}</button>
                    )
                  })}
                  <button type="button" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', fontWeight: 700 }}>Tiếp</button>
                  <span style={{ padding: '8px 0', color: '#64748b', fontSize: 13 }}>Trang {page + 1}/{totalPages} · {totalItems} sản phẩm</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Detail panel */}
        <aside>
          <article className="retailer-card retailer-market-detail">
            <div className="retailer-card-head">
              <h3><Icon>info</Icon>Chi tiết sản phẩm</h3>
              {selectedDetail && <span className="pill blue">#{selectedDetail.listingId || selectedDetail.id}</span>}
            </div>
            {!selectedDetail ? (
              <p style={{ color: '#94a3b8' }}>Chọn một sản phẩm để xem chi tiết.</p>
            ) : (
              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800 }}>{selectedDetail.title || selectedDetail.productName}</h4>
                <p style={{ color: '#475569', marginBottom: 12 }}>{selectedDetail.description || 'Không có mô tả.'}</p>
                <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
                  {[
                    ['Nông trại', selectedDetail.farmName],
                    ['Khu vực', selectedDetail.province || selectedDetail.location],
                    ['Giá bán', money(selectedDetail.price)],
                    ['Đơn vị', selectedDetail.unit || 'kg'],
                    ['Còn lại', selectedDetail.availableQuantity ?? selectedDetail.quantityAvailable],
                    ['Chứng nhận', selectedDetail.certification || selectedDetail.certificationStatus],
                    ['Truy xuất', selectedDetail.traceCode ? 'Có mã QR' : '—'],
                  ].map(([label, value]) => value != null && value !== '' ? (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>
                      <span style={{ color: '#64748b' }}>{label}</span>
                      <strong style={{ color: '#0f172a' }}>{String(value)}</strong>
                    </div>
                  ) : null)}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => data.createOrderFromListing?.(selectedDetail)}
                    disabled={String(data.orderingListingId) === String(selectedDetail.listingId || selectedDetail.id)}
                    style={{ flex: 1, padding: '12px', borderRadius: 10, border: 0, background: '#0d631b', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                  >
                    <Icon>shopping_bag</Icon>
                    {String(data.orderingListingId) === String(selectedDetail.listingId || selectedDetail.id) ? 'Đang đặt...' : 'Đặt hàng ngay'}
                  </button>
                  {(selectedDetail.traceCode || selectedDetail.publicTraceUrl) && (
                    <button type="button" onClick={() => navigate(`/retailer/trace?code=${encodeURIComponent(selectedDetail.traceCode || selectedDetail.publicTraceUrl)}`)} style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #cfe3cf', background: '#fff', color: '#0d631b', cursor: 'pointer', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6 }} title="Truy xuất nguồn gốc">
                      <Icon>qr_code_scanner</Icon>
                      Truy xuất
                    </button>
                  )}
                </div>
              </div>
            )}
          </article>
        </aside>
      </div>
      </div>
    </RetailerShell>
  )
}

function TracePage({ data }) {
  const location = useLocation()
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

  // If navigated from marketplace with ?code=TRACE-... or full publicTraceUrl,
  // prefill + auto-run trace immediately so retailer sees the same data as public trace.
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const incoming = params.get('code')
    if (!incoming) return
    const extracted = extractTraceCodeFromQr(incoming)
    if (!extracted) return
    setInputCode(extracted)
    runLookup(extracted)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])

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
      // Heuristic: numeric input ? batchId; otherwise trace code (which may include letters and dashes).
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

  return <RetailerShell title="Truy xuất QR" subtitle="Kiểm tra nguồn gốc lô hàng bằng trace code, batch ID hoặc camera quét QR." loading={data.loading || loadingTrace} error={data.error || traceError || scannerError} success={data.success}>
    <section className="retailer-trace-console">
      <article className="retailer-card retailer-trace-search-panel">
        <div className="retailer-card-head">
          <div>
            <h3>Truy xuất sản phẩm</h3>
            <p>Nhập mã từ tem QR hoặc mở camera để quét trực tiếp.</p>
          </div>
          <span className="pill green">R-RTL-060</span>
        </div>

        <form className="retailer-trace-form" onSubmit={handleSubmit}>
          <label className="retailer-trace-field">
            <span>Mã truy xuất</span>
            <input
              value={inputCode}
              onChange={(event) => setInputCode(event.target.value)}
              placeholder="TRACE-30-XXXX hoặc batch ID"
              autoComplete="off"
            />
          </label>
          <Button type="submit" disabled={loadingTrace}>
            <Icon>search</Icon>
            {loadingTrace ? 'Đang tra...' : 'Truy xuất'}
          </Button>
        </form>

        <div className="retailer-trace-scan-row">
          <Button type="button" variant={scannerOpen ? 'ghost' : 'blue'} onClick={() => setScannerOpen((open) => !open)}>
            <Icon>qr_code_scanner</Icon>
            {scannerOpen ? 'Đóng camera' : 'Quét bằng camera'}
          </Button>
          <p>Camera dùng cho tem QR sản phẩm; mã đọc được sẽ tự điền và truy xuất ngay.</p>
        </div>

        {scannerOpen ? (
          <div className="retailer-qr-reader-shell">
            <div id="retailer-qr-reader" />
          </div>
        ) : null}
      </article>

      <aside className="retailer-card retailer-trace-guide">
        <span className="retailer-trace-guide-icon"><Icon>verified</Icon></span>
        <h3>Dữ liệu kiểm tra</h3>
        <dl>
          <div><dt>Nguồn</dt><dd>Farm, mùa vụ, lô hàng</dd></div>
          <div><dt>Chứng thực</dt><dd>QR và blockchain transaction</dd></div>
          <div><dt>Luồng dùng</dt><dd>Nhập mã, quét camera, mở từ marketplace</dd></div>
        </dl>
      </aside>
    </section>

    {traceData ? <TraceResultPanel trace={traceData} /> : (
      <section className="retailer-trace-empty">
        <Icon>qr_code_2</Icon>
        <div>
          <h3>Chưa có kết quả truy xuất</h3>
          <p>Nhập trace code, batch ID hoặc quét mã QR để xem thông tin nguồn gốc.</p>
        </div>
      </section>
    )}
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
  const traceCode = qrInfo.traceCode || batch.traceCode || trace?.traceCode || 'Chưa có mã truy xuất'
  const batchCode = batch.batchCode || batch.batchId || trace?.batchId || 'Chưa có mã lô'
  const productName = batch.productName || season.productName || trace?.productName || 'Chưa có tên sản phẩm'
  const farmName = farm.farmName || farm.name || trace?.farmName || 'Chưa có tên farm'
  const txHash = batch.blockchainTxHash || season.txHash || trace?.blockchainTxHash || ''

  return (
    <section className="retailer-card retailer-trace-result">
      <div className="retailer-trace-result-head">
        <div>
          <span className="pill green">Đã truy xuất</span>
          <h3>{productName}</h3>
          <p>{farmName}</p>
        </div>
        <div className="retailer-trace-code">
          <span>Mã truy xuất</span>
          <strong>{traceCode}</strong>
        </div>
      </div>

      <dl className="retailer-trace-info-grid">
        <div><dt>Batch / Lô</dt><dd>{batchCode}</dd></div>
        <div><dt>Mùa vụ</dt><dd>{season.seasonCode || season.seasonName || 'Chưa có mùa vụ'}</dd></div>
        <div><dt>Địa điểm</dt><dd>{farm.address || farm.province || 'Chưa cập nhật địa điểm'}</dd></div>
        <div><dt>Ngày thu hoạch</dt><dd>{batch.harvestDate || season.harvestDate || 'Chưa cập nhật'}</dd></div>
        <div className="wide"><dt>Blockchain TX</dt><dd>{txHash || 'Đang chờ blockchain commit'}</dd></div>
      </dl>

      <div className="retailer-trace-columns">
        <div>
          <h4>Quy trình mùa vụ</h4>
          {processList.length ? (
            <ol className="retailer-trace-process-list">
              {processList.map((step, index) => (
                <li key={step.processId || step.id || index}>
                  <span>{index + 1}</span>
                  <div>
                    <strong>{step.stepName || step.name || `Bước ${index + 1}`}</strong>
                    <p>{step.stepDescription || step.description || 'Không có ghi chú.'}</p>
                    {step.performedAt ? <small>Thực hiện: {step.performedAt}</small> : null}
                  </div>
                </li>
              ))}
            </ol>
          ) : <p className="retailer-trace-muted">Chưa có bước quy trình từ backend.</p>}
        </div>

        <div>
          <h4>Mốc thời gian</h4>
          {timeline.length ? (
            <ul className="retailer-trace-timeline-list">
              {timeline.map((event, index) => (
                <li key={event.eventId || index}>
                  <span></span>
                  <div>
                    <strong>{event.eventType || event.type || 'Event'}</strong>
                    <small>{event.occurredAt || event.timestamp || ''}</small>
                    {event.note ? <p>{event.note}</p> : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="retailer-trace-muted">Chưa có timeline từ backend.</p>}
        </div>
      </div>
    </section>
  )
}

function OrdersPage({ data }) {
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [depositAmount, setDepositAmount] = useState('')
  const [depositNote, setDepositNote] = useState('')
  const [cancelNote, setCancelNote] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const detailRef = useRef(null)

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

  const displayedOrder = selectedOrder || data.orders.find((item) => String(item.orderId || item.id) === String(selectedOrderId)) || null
  const displayedStatus = String(displayedOrder?.status || '').toUpperCase()
  const displayedPaymentStatus = String(displayedOrder?.paymentStatus || displayedOrder?.orderPaymentStatus || '').toUpperCase()
  const canPayDeposit = displayedOrder && displayedStatus === 'CONFIRMED' && displayedPaymentStatus === 'UNPAID'
  const depositHint = !displayedOrder
    ? 'Chọn đơn đã được farm xác nhận để đặt cọc.'
    : canPayDeposit
      ? `Tối thiểu ${money(displayedOrder.minimumDepositAmount || ((displayedOrder.totalAmount || 0) * 0.3))}.`
      : displayedStatus === 'PENDING'
        ? 'Farm chưa xác nhận đơn, chưa thể đặt cọc.'
        : displayedPaymentStatus === 'DEPOSIT_PAID'
          ? 'Đơn đã đặt cọc, chờ quản lý vận chuyển tạo shipment.'
          : 'Trạng thái đơn hiện tại không cho phép đặt cọc.'

  async function handleDeposit() {
    if (!displayedOrder) return
    const orderId = displayedOrder.orderId || displayedOrder.id
    await payOrderDeposit(orderId, {
      amount: Number(depositAmount),
      method: 'LOCAL_DEMO',
      transactionRef: `RTL-${orderId}-${Date.now()}`,
    })
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

  function handleSelectOrder(order) {
    setSelectedOrderId(String(order.orderId || order.id))
    window.requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const detailRows = displayedOrder ? [
    ['Mã đơn', displayedOrder.orderId || displayedOrder.id ? `#${displayedOrder.orderId || displayedOrder.id}` : 'Chưa có mã đơn'],
    ['Trạng thái', displayedOrder.status || 'UNKNOWN'],
    ['Nhà cung cấp', displayedOrder.farmName || displayedOrder.supplierName || displayedOrder.farm?.farmName || (displayedOrder.farmId ? `Farm #${displayedOrder.farmId}` : 'Chưa có dữ liệu')],
    ['Sản phẩm', displayedOrder.productName || displayedOrder.listingTitle || displayedOrder.product?.name || displayedOrder.items?.[0]?.title || displayedOrder.items?.[0]?.batchCode || (displayedOrder.items?.[0]?.listingId ? `Listing #${displayedOrder.items[0].listingId}` : 'Chưa có dữ liệu')],
    ['Tổng tiền', money(displayedOrder.totalAmount || displayedOrder.amount)],
    ['Thanh toán', displayedOrder.paymentStatus || displayedOrder.orderPaymentStatus || 'Chưa có trạng thái thanh toán'],
  ] : []

  const pendingPayment = data.orders.filter((order) => ['PENDING', 'UNPAID'].includes(String(order.paymentStatus || order.orderPaymentStatus || order.status).toUpperCase())).length
  const activeOrders = data.orders.filter((order) => !['DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED'].includes(String(order.status || order.orderStatus).toUpperCase())).length
  const deliveredOrders = data.orders.filter((order) => ['DELIVERED', 'COMPLETED'].includes(String(order.status || order.orderStatus).toUpperCase())).length

  return <RetailerShell title="Đơn hàng" subtitle="Theo dõi đơn, đặt cọc và xử lý hủy đơn từ một màn hình." loading={data.loading} error={data.error} success={data.success} pageClassName="retailer-orders-page">
    <section className="retailer-order-kpis">
      <article><Icon>receipt_long</Icon><span>Tổng đơn</span><strong>{data.orders.length}</strong></article>
      <article><Icon>payments</Icon><span>Chờ cọc</span><strong>{pendingPayment}</strong></article>
      <article><Icon>sync_alt</Icon><span>Đang xử lý</span><strong>{activeOrders}</strong></article>
      <article><Icon>task_alt</Icon><span>Đã giao</span><strong>{deliveredOrders}</strong></article>
    </section>
    <section className="retailer-orders-toolbar">
      <div>
        <h3>Đơn của tôi</h3>
        <p>{data.orders.length ? `${data.orders.length} đơn từ backend` : 'Chưa có đơn hàng nào.'}</p>
      </div>
      <label>
        <span>Chọn đơn</span>
        <select value={selectedOrderId} onChange={(event) => setSelectedOrderId(event.target.value)}>
          <option value="">Chọn đơn</option>
          {data.orders.map((order) => <option key={order.orderId || order.id} value={order.orderId || order.id}>#{order.orderId || order.id} · {order.status || 'UNKNOWN'}</option>)}
        </select>
      </label>
    </section>

    <section className="retailer-orders-layout">
      <article className="retailer-card retailer-order-detail-card" ref={detailRef}>
        <div className="retailer-card-head">
          <div>
            <h3>Chi tiết đơn</h3>
            <p>{displayedOrder ? `Đang xem đơn #${displayedOrder.orderId || displayedOrder.id}` : 'Chọn một đơn để xem thông tin.'}</p>
          </div>
          {displayedOrder ? <span className={`status ${statusTone(displayedOrder.status)}`}>{displayedOrder.status || 'UNKNOWN'}</span> : null}
        </div>
        {displayedOrder ? (
          <dl className="retailer-order-detail-grid">
            {detailRows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>
        ) : (
          <div className="retailer-order-empty">
            <Icon>receipt_long</Icon>
            <div>
              <h3>Chưa chọn đơn</h3>
              <p>Khi có đơn, chọn ở phía trên để xem trạng thái, thanh toán cọc hoặc hủy yêu cầu.</p>
            </div>
          </div>
        )}
      </article>

      <aside className="retailer-order-actions">
        <article className="retailer-card">
          <div className="retailer-card-head"><h3>Thanh toán đặt cọc</h3></div>
          <label><span>Số tiền cọc</span><input value={depositAmount} onChange={(event) => setDepositAmount(event.target.value)} placeholder="Ví dụ 500000" /></label>
          <p className="empty-copy">{depositHint}</p>
          <label><span>Ghi chú</span><textarea value={depositNote} onChange={(event) => setDepositNote(event.target.value)} placeholder="Ghi chú thanh toán" rows={3} /></label>
          <Button onClick={handleDeposit} disabled={!canPayDeposit || !depositAmount}>Thanh toán cọc</Button>
        </article>
        <article className="retailer-card">
          <div className="retailer-card-head"><h3>Hủy đơn</h3></div>
          <label><span>Lý do hủy</span><textarea value={cancelNote} onChange={(event) => setCancelNote(event.target.value)} placeholder="Nhập lý do hủy" rows={3} /></label>
          <Button variant="ghost" onClick={handleCancel} disabled={!displayedOrder}>Hủy yêu cầu</Button>
        </article>
      </aside>
    </section>

    <article className="retailer-card retailer-table-card"><div className="retailer-card-head"><h3>Lịch sử đơn hàng</h3><span>{data.orders.length} đơn</span></div><RetailerTable rows={data.orders} onSelectOrder={handleSelectOrder} /></article>
  </RetailerShell>
}

function ShippingPage({ data }) {
  const [selectedShipmentId, setSelectedShipmentId] = useState('')
  const [proofNote, setProofNote] = useState('')
  const [proofFiles, setProofFiles] = useState([])
  const [deliveryProofUrl, setDeliveryProofUrl] = useState('')
  const [deliveryNote, setDeliveryNote] = useState('')
  const [shippingActionError, setShippingActionError] = useState('')
  const [shippingActionSaving, setShippingActionSaving] = useState(false)
  const selectedShipment = data.shipments.find((item) => String(item.shipmentId || item.id) === String(selectedShipmentId)) || data.shipments[0] || null

  useEffect(() => {
    if (!selectedShipmentId && data.shipments[0]) setSelectedShipmentId(String(data.shipments[0].shipmentId || data.shipments[0].id))
  }, [data.shipments, selectedShipmentId])

  useEffect(() => {
    setDeliveryProofUrl(selectedShipment?.deliveryProofImageUrl || '')
  }, [selectedShipment?.shipmentId, selectedShipment?.deliveryProofImageUrl])

  async function handleConfirmDelivery() {
    if (!selectedShipment) return
    setShippingActionError('')
    setShippingActionSaving(true)
    try {
      let proofUrl = deliveryProofUrl
      if (!proofUrl && proofFiles[0]) {
        const uploaded = await uploadDeliveryProofFile(selectedShipment.orderId || selectedShipment.shipmentId, proofFiles[0])
        proofUrl = uploaded?.fileUrl || ''
      }
      await confirmOrderDelivery(selectedShipment.orderId || selectedShipment.shipmentId, {
        proofImageUrl: proofUrl,
        note: deliveryNote.trim() || 'Retailer confirmed full delivery',
      })
      window.location.reload()
    } catch (error) {
      setShippingActionError(getErrorMessage(error, 'Không xác nhận được giao hàng.'))
    } finally {
      setShippingActionSaving(false)
    }
  }

  async function handleUploadProof() {
    if (!selectedShipment || !proofFiles[0]) return
    setShippingActionError('')
    setShippingActionSaving(true)
    try {
      const uploaded = await uploadDeliveryProofFile(selectedShipment.orderId || selectedShipment.shipmentId, proofFiles[0])
      setDeliveryProofUrl(uploaded?.fileUrl || '')
      setProofFiles([])
    } catch (error) {
      setShippingActionError(getErrorMessage(error, 'Không tải được ảnh giao hàng.'))
    } finally {
      setShippingActionSaving(false)
    }
  }

  const routeLocation = selectedShipment?.currentLocation || selectedShipment?.location || (selectedShipment?.farmName && selectedShipment?.retailerName ? `${selectedShipment.farmName} → ${selectedShipment.retailerName}` : 'Chưa cập nhật vị trí')
  const shipmentRows = selectedShipment ? [
    ['Mã chuyến', selectedShipment.shipmentId || selectedShipment.id ? `#${selectedShipment.shipmentId || selectedShipment.id}` : 'Chưa có mã chuyến'],
    ['Mã đơn', selectedShipment.orderId || 'Chưa gắn đơn hàng'],
    ['Trạng thái', selectedShipment.status || 'UNKNOWN'],
    ['Tuyến giao', routeLocation],
    ['Tài xế', selectedShipment.driverName || selectedShipment.driverCode || 'Chưa gán'],
    ['Cập nhật', selectedShipment.updatedAt || selectedShipment.createdAt || 'Chưa có dữ liệu'],
  ] : []
  const readyShipmentOrders = data.orders.filter((order) => String(order.status || '').toUpperCase() === 'READY_FOR_SHIPMENT' && String(order.paymentStatus || order.orderPaymentStatus || '').toUpperCase() === 'DEPOSIT_PAID')
  const pendingFarmOrders = data.orders.filter((order) => String(order.status || '').toUpperCase() === 'PENDING')
  const emptyShipmentMessage = readyShipmentOrders.length
    ? `${readyShipmentOrders.length} đơn đã đủ điều kiện; cần quản lý vận chuyển tạo chuyến hàng.`
    : pendingFarmOrders.length
      ? `${pendingFarmOrders.length} đơn còn PENDING; cần Farm xác nhận rồi Retailer đặt cọc.`
      : 'Chưa có đơn đủ điều kiện tạo shipment cho retailer hiện tại.'

  return <RetailerShell title="Giao nhận" subtitle="Theo dõi shipment, xác nhận nhận hàng và gửi bằng chứng giao hàng." loading={data.loading} error={data.error} success={data.success}>
    <section className="retailer-shipping-toolbar">
      <div>
        <h3>Shipment của tôi</h3>
        <p>{data.shipments.length ? `${data.shipments.length} chuyến hàng từ backend` : 'Chưa có shipment phù hợp.'}</p>
      </div>
      <label>
        <span>Chọn chuyến hàng</span>
        <select value={selectedShipmentId} onChange={(event) => setSelectedShipmentId(event.target.value)}>
          <option value="">Chọn chuyến hàng</option>
          {data.shipments.map((shipment) => <option key={shipment.shipmentId || shipment.id} value={shipment.shipmentId || shipment.id}>#{shipment.shipmentId || shipment.id} · {shipment.status || 'UNKNOWN'}</option>)}
        </select>
      </label>
    </section>

    <section className="retailer-shipping-layout">
      <article className="retailer-card retailer-shipping-detail">
        <div className="retailer-card-head">
          <div><h3>Trạng thái shipment</h3><p>{selectedShipment ? `Đang xem shipment #${selectedShipment.shipmentId || selectedShipment.id}` : 'Chọn chuyến hàng để xem chi tiết.'}</p></div>
          {selectedShipment ? <span className={`status ${statusTone(selectedShipment.status)}`}>{selectedShipment.status || 'UNKNOWN'}</span> : null}
        </div>
        {selectedShipment ? (
          <dl className="retailer-order-detail-grid">
            {shipmentRows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>
        ) : (
          <div className="retailer-order-empty">
            <Icon>local_shipping</Icon>
            <div><h3>Chưa có shipment</h3><p>{emptyShipmentMessage}</p></div>
          </div>
        )}
      </article>

      <aside className="retailer-shipping-actions">
        {shippingActionError ? <div className="driver-alert error">{shippingActionError}</div> : null}
        <article className="retailer-card">
          <div className="retailer-card-head"><h3>Xác nhận giao đầy đủ</h3></div>
          <label><span>Ghi chú giao hàng</span><textarea value={deliveryNote} onChange={(event) => setDeliveryNote(event.target.value)} placeholder="Ghi chú giao hàng" rows={3} /></label>
          <Button onClick={handleConfirmDelivery} disabled={!selectedShipment || shippingActionSaving || (!deliveryProofUrl && !proofFiles[0])}>Xác nhận giao</Button>
        </article>
        <article className="retailer-card">
          <div className="retailer-card-head"><h3>Upload ảnh giao hàng</h3></div>
          <div className="retailer-license-row">
            <div><h3>Ảnh bằng chứng</h3><p>{deliveryProofUrl || proofFiles[0]?.name || 'Chưa chọn ảnh.'}</p></div>
            <label className="retailer-file-button"><Icon>upload_file</Icon>Chọn ảnh<input type="file" accept="image/*" onChange={(event) => setProofFiles(Array.from(event.target.files || []))} /></label>
          </div>
          <label><span>Ghi chú ảnh</span><textarea value={proofNote} onChange={(event) => setProofNote(event.target.value)} placeholder="Ghi chú ảnh" rows={3} /></label>
          <Button variant="ghost" onClick={handleUploadProof} disabled={!selectedShipment || shippingActionSaving || !proofFiles.length}>Tải ảnh lên</Button>
        </article>
      </aside>
    </section>
  </RetailerShell>
}

function MessagesPage({ data }) {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [sending, setSending] = useState(false)
  const [markingId, setMarkingId] = useState(null)

  useEffect(() => {
    if (!selectedOrderId && data.orders[0]) setSelectedOrderId(String(data.orders[0].orderId || data.orders[0].id))
  }, [data.orders, selectedOrderId])

  async function handleSend() {
    if (!selectedOrderId) return
    setSending(true)
    try {
      await createNotification({
        recipientRole: 'FARM',
        title: title.trim(),
        message: message.trim(),
        notificationType: 'MANUAL',
        targetType: 'ORDER',
        targetId: Number(selectedOrderId),
      })
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

  return <RetailerShell title="Thông báo" subtitle="Nhận thông báo từ Farm/Driver và gửi thông báo cho Farm theo đơn mua." loading={data.loading} error={data.error} success={data.success}>
    <div className="retailer-comm-layout">
      <article className="retailer-card retailer-comm-compose">
        <div className="retailer-card-head"><div><h3>Gửi cho quản lý trang trại</h3><p>Thông báo phải gắn với một đơn hàng của nhà bán lẻ.</p></div></div>
        <label><span>Đơn hàng</span><select value={selectedOrderId} onChange={(event) => setSelectedOrderId(event.target.value)}><option value="">Chọn đơn hàng</option>{data.orders.map((order) => <option key={order.orderId || order.id} value={order.orderId || order.id}>#{order.orderId || order.id} · {order.farmName || order.supplierName || 'Farm'} · {order.status || 'UNKNOWN'}</option>)}</select></label>
        <label><span>Tiêu đề</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Tiêu đề thông báo" /></label>
        <label><span>Nội dung</span><textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Nội dung" rows={5} /></label>
        <Button onClick={handleSend} disabled={sending || !selectedOrderId || !title.trim() || !message.trim()}>{sending ? 'Đang gửi...' : 'Gửi cho Farm'}</Button>
      </article>
      <aside className="retailer-card retailer-comm-inbox">
        <div className="retailer-card-head"><div><h3>Thông báo gần đây</h3><p>Farm, Driver và hệ thống gửi đến nhà bán lẻ.</p></div></div>
        {data.notifications.length ? data.notifications.slice(0, 8).map((item) => <div key={item.notificationId || item.id} className="retailer-notification-item"><Icon>notifications</Icon><div><strong>{item.title || 'Thông báo'}</strong><p>{item.message || item.content || 'Không có nội dung.'}</p><small>{item.targetType || 'GENERAL'} {item.targetId ? `#${item.targetId}` : ''}</small></div><Button variant="ghost" onClick={() => handleMarkRead(item.notificationId || item.id)} disabled={markingId === (item.notificationId || item.id)}>{markingId === (item.notificationId || item.id) ? '...' : 'Đã đọc'}</Button></div>) : <div className="retailer-history-empty compact"><Icon>notifications</Icon><div><h3>Chưa có thông báo</h3><p>Backend chưa trả về thông báo cho nhà bán lẻ hiện tại.</p></div></div>}
      </aside>
    </div>
  </RetailerShell>
}

function RetailerNotificationsPage({ data }) {
  const [markingId, setMarkingId] = useState(null)

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

  return <RetailerShell title="Thông báo" subtitle="Inbox thông báo từ Farm, Driver và hệ thống." loading={data.loading} error={data.error} success={data.success}>
    <section className="retailer-card retailer-comm-inbox">
      <div className="retailer-card-head"><div><h3>Tất cả thông báo</h3><p>{data.notifications.length} thông báo từ backend.</p></div></div>
      {data.notifications.length ? data.notifications.map((item) => <div key={item.notificationId || item.id} className="retailer-notification-item"><Icon>notifications</Icon><div><strong>{item.title || 'Thông báo'}</strong><p>{item.message || item.content || 'Không có nội dung.'}</p><small>{item.targetType || 'GENERAL'} {item.targetId ? `#${item.targetId}` : ''}</small></div><Button variant="ghost" onClick={() => handleMarkRead(item.notificationId || item.id)} disabled={markingId === (item.notificationId || item.id)}>{markingId === (item.notificationId || item.id) ? '...' : 'Đã đọc'}</Button></div>) : <div className="retailer-history-empty compact"><Icon>notifications</Icon><div><h3>Chưa có thông báo</h3><p>Backend chưa trả về thông báo cho nhà bán lẻ hiện tại.</p></div></div>}
    </section>
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
      // R-RTL-190: backend expects {recipientRole, reportType, subject, content}.
      // Severity is encoded into subject because PlatformReport has no severity column.
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

  return <RetailerShell title="Báo cáo" subtitle="Gửi báo cáo sự cố hoặc phản ánh đến quản trị viên." loading={data.loading} error={data.error} success={data.success}>
    <div className="retailer-comm-layout">
      <article className="retailer-card retailer-comm-compose">
        <div className="retailer-card-head"><div><h3>Tạo báo cáo</h3><p>Báo cáo được gửi đến nhóm quản trị viên.</p></div></div>
        <label><span>Tiêu đề</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Tiêu đề" /></label>
        <label><span>Mức độ</span><select value={severity} onChange={(event) => setSeverity(event.target.value)}><option value="LOW">LOW</option><option value="MEDIUM">MEDIUM</option><option value="HIGH">HIGH</option></select></label>
        <label><span>Nội dung</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Nội dung báo cáo" rows={5} /></label>
        <Button onClick={handleSubmit} disabled={sending || !title.trim() || !description.trim()}>{sending ? 'Đang gửi...' : 'Gửi báo cáo'}</Button>
      </article>
      <aside className="retailer-card retailer-comm-inbox">
        <div className="retailer-card-head"><div><h3>Tham chiếu gần đây</h3><p>Các shipment có thể liên quan đến báo cáo.</p></div></div>
        {data.shipments.length ? data.shipments.slice(0, 4).map((shipment) => <div className="retailer-shipment-item" key={shipment.shipmentId || shipment.id}><span><Icon>local_shipping</Icon></span><div><strong>Shipment #{shipment.shipmentId || shipment.id}</strong><p>{shipment.status || 'UNKNOWN'}</p></div></div>) : <div className="retailer-history-empty compact"><Icon>local_shipping</Icon><div><h3>Chưa có shipment</h3><p>Có thể gửi báo cáo không kèm tham chiếu.</p></div></div>}
      </aside>
    </div>
  </RetailerShell>
}

function FilterGroup({ title, items, value, onChange }) { return <div className="filter-block"><h4>{title}</h4>{items.map(x => <label key={x}><input type="checkbox" checked={value === x} onChange={(event) => onChange(event.target.checked ? x : '')} /><span>{x}</span></label>)}</div> }
function ProductCard({ item, onOrder, orderingListingId }) {
  const title = item.title || item.productName || item.product?.name || 'Listing chưa có tên'
  const listingId = item.listingId || item.id
  const isOrdering = String(orderingListingId) === String(listingId)
  const status = item.certification || item.certificationStatus || item.approvalStatus || item.status || ''
  const traceable = item.traceabilityStatus || (item.traceable || item.traceCode || item.qrCodeUrl ? 'Có truy xuất' : '')
  return <article className="product-card"><div className="product-art wheat">{status ? <span>{status}</span> : null}{traceable ? <b>{traceable}</b> : null}</div><div><header><h3>{title}</h3>{item.rating ? <span><Icon fill>star</Icon> {item.rating}</span> : null}</header><p><Icon>location_on</Icon>{item.location || item.province || item.farmName || 'Chưa cập nhật'}</p><dl><div><dt>Giá bán</dt><dd>{money(item.price || item.unitPrice)} <small>{item.unit || ''}</small></dd></div><div><dt>Tồn kho khả dụng</dt><dd>{item.availableQuantity ?? item.quantityAvailable ?? item.quantity ?? 'Chưa có tồn kho'}</dd></div></dl><footer><button type="button" onClick={() => onOrder?.(item)} disabled={isOrdering || !listingId}><Icon>shopping_bag</Icon>{isOrdering ? 'Đang đặt...' : 'Đặt hàng'}</button><button type="button"><Icon>contract</Icon></button></footer></div></article>
}

function ProfilePage({ data }) {
  const { user, updateProfile } = useAuth()
  const retailer = data.retailer || {}
  const defaultName = user?.fullName || user?.name || ''
  const defaultEmail = user?.email || ''
  const defaultPhone = user?.phone || ''
  const retailerId = retailer.retailerId || retailer.id
  const [form, setForm] = useState({
    retailerCode: retailer.retailerCode || '',
    businessLicenseNo: retailer.businessLicenseNo || '',
    businessName: retailer.businessName || retailer.name || defaultName,
    address: retailer.address || '',
  })
  const [accountForm, setAccountForm] = useState({
    fullName: defaultName,
    phone: defaultPhone,
  })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [licenseFile, setLicenseFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [savingAccount, setSavingAccount] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')

  useEffect(() => {
    setForm({
      retailerCode: retailer.retailerCode || '',
      businessLicenseNo: retailer.businessLicenseNo || '',
      businessName: retailer.businessName || retailer.name || defaultName,
      address: retailer.address || '',
    })
  }, [defaultName, retailer.address, retailer.businessLicenseNo, retailer.businessName, retailer.name, retailer.retailerCode])

  useEffect(() => {
    setAccountForm({ fullName: defaultName, phone: defaultPhone })
  }, [defaultName, defaultPhone])

  const openOrders = data.orders.filter((order) => !['DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED'].includes(String(order.status || order.orderStatus).toUpperCase())).length
  const deliveredShipments = data.shipments.filter((shipment) => ['DELIVERED', 'CONFIRMED'].includes(String(shipment.status).toUpperCase())).length
  const hasBusinessProfile = Boolean(retailerId)
  const hasLegalFields = Boolean(form.retailerCode.trim() && form.businessName.trim() && form.businessLicenseNo.trim() && form.address.trim())
  const hasLicenseFile = Boolean(retailer.businessLicenseFileUrl || licenseFile)
  const canOrder = hasBusinessProfile && String(retailer.status || '').toUpperCase() === 'ACTIVE'

  async function handleSave() {
    const payload = {
      retailerName: form.businessName.trim(),
      businessLicenseNo: form.businessLicenseNo.trim(),
      address: form.address.trim(),
      status: retailer.status || 'ACTIVE',
    }
    if (!payload.retailerName || !payload.businessLicenseNo || !payload.address) {
      setProfileError('Vui lòng nhập tên doanh nghiệp, số giấy phép kinh doanh và địa chỉ.')
      return
    }
    if (!retailerId && !form.retailerCode.trim()) {
      setProfileError('Vui lòng nhập mã retailer để tạo hồ sơ lần đầu.')
      return
    }
    setSaving(true)
    setProfileError('')
    setProfileSuccess('')
    try {
      const saved = retailerId
        ? await updateRetailer(retailerId, payload)
        : await createRetailer({ ...payload, retailerCode: form.retailerCode.trim() })
      const savedId = saved?.retailerId || saved?.id || retailerId
      if (licenseFile && savedId) await uploadRetailerBusinessLicense(savedId, licenseFile)
      window.location.reload()
    } catch (error) {
      setProfileError(getErrorMessage(error, 'Không thể lưu hồ sơ retailer.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleAccountSave(event) {
    event.preventDefault()
    setSavingAccount(true)
    setProfileError('')
    setProfileSuccess('')
    try {
      await updateProfile({ fullName: accountForm.fullName.trim(), phone: accountForm.phone.trim() })
      setProfileSuccess('Đã cập nhật tài khoản người mua.')
    } catch (error) {
      setProfileError(getErrorMessage(error, 'Không thể cập nhật tài khoản.'))
    } finally {
      setSavingAccount(false)
    }
  }

  async function handlePasswordSave(event) {
    event.preventDefault()
    setProfileError('')
    setProfileSuccess('')
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setProfileError('Mật khẩu xác nhận không khớp.')
      return
    }
    setChangingPassword(true)
    try {
      const message = await changePassword(passwordForm)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setProfileSuccess(message || 'Đã đổi mật khẩu.')
    } catch (error) {
      setProfileError(getErrorMessage(error, 'Không thể đổi mật khẩu.'))
    } finally {
      setChangingPassword(false)
    }
  }

  return <RetailerShell title="Hồ sơ nhà bán lẻ" subtitle="Quản lý thông tin doanh nghiệp và giấy phép bán lẻ." loading={data.loading} error={data.error} success={data.success}>
    <section className="retailer-profile-summary">
      <div className="store-logo">{(retailer.name || form.businessName || defaultName || 'RT').slice(0, 2).toUpperCase()}</div>
      <div>
        <span className="pill green"><Icon fill>verified</Icon>{canOrder ? 'ACTIVE - được đặt hàng' : 'Chưa đủ điều kiện đặt hàng'}</span>
        <h2>{retailer.name || form.businessName || 'Chưa cấu hình hồ sơ nhà bán lẻ'}</h2>
        <p>{defaultEmail || 'Chưa có email'} · {retailer.retailerCode || 'Chưa có mã nhà bán lẻ'}</p>
      </div>
    </section>

    {profileError ? <div className="driver-alert error">{profileError}</div> : null}
    {profileSuccess ? <div className="driver-alert success">{profileSuccess}</div> : null}

    <section className="retailer-history-summary">
      <article className="retailer-card"><Icon>assignment_ind</Icon><div><p>Hồ sơ nghiệp vụ</p><strong>{hasBusinessProfile ? 'Đã tạo' : 'Chưa tạo'}</strong></div></article>
      <article className="retailer-card"><Icon>shopping_cart</Icon><div><p>Đơn đang xử lý</p><strong>{openOrders}</strong></div></article>
      <article className="retailer-card"><Icon>local_shipping</Icon><div><p>Shipment đã nhận</p><strong>{deliveredShipments}</strong></div></article>
    </section>

    <div className="retailer-profile-layout">
      <article className="retailer-card retailer-profile-form">
        <div className="retailer-card-head">
          <div>
            <h3>Hồ sơ pháp lý nhà bán lẻ</h3>
            <p>Thông tin này quyết định quyền đặt hàng và gắn đơn hàng với nhà bán lẻ.</p>
          </div>
          <Icon>business_center</Icon>
        </div>
        <div className="retailer-profile-fields">
          <label><span>Mã nhà bán lẻ</span><input value={form.retailerCode} disabled={Boolean(retailer.retailerCode)} onChange={(event) => setForm((prev) => ({ ...prev, retailerCode: event.target.value }))} /></label>
          <label><span>Số giấy phép kinh doanh</span><input value={form.businessLicenseNo} onChange={(event) => setForm((prev) => ({ ...prev, businessLicenseNo: event.target.value }))} /></label>
          <label><span>Tên doanh nghiệp / cửa hàng</span><input value={form.businessName} onChange={(event) => setForm((prev) => ({ ...prev, businessName: event.target.value }))} /></label>
          <label><span>Trạng thái nghiệp vụ</span><input value={retailer.status || 'ACTIVE sau khi tạo'} readOnly /></label>
          <label className="wide"><span>Địa chỉ cửa hàng</span><textarea rows={3} value={form.address} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} /></label>
        </div>
        <div className="retailer-license-row">
          <div>
            <h3>Business License</h3>
            <p>{licenseFile ? licenseFile.name : retailer.businessLicenseFileName || 'Chưa chọn tệp giấy phép.'}</p>
          </div>
          <label className="retailer-file-button">
            <Icon>upload_file</Icon>
            Chọn tệp
            <input type="file" accept="application/pdf,image/*" onChange={(event) => setLicenseFile(event.target.files?.[0] || null)} />
          </label>
        </div>
        <div className="retailer-profile-actions"><Button onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu hồ sơ'}</Button></div>
      </article>

      <aside className="retailer-card retailer-identity-panel">
        <span className="retailer-trace-guide-icon"><Icon>verified_user</Icon></span>
        <h3>Điều kiện nghiệp vụ</h3>
        <dl>
          <div><dt>Retailer ID</dt><dd>{retailer.retailerId || retailer.id || 'Chưa tạo hồ sơ'}</dd></div>
          <div><dt>Trạng thái</dt><dd>{retailer.status || 'Chưa kích hoạt'}</dd></div>
          <div><dt>Thông tin pháp lý</dt><dd>{hasLegalFields ? 'Đủ thông tin' : 'Thiếu thông tin bắt buộc'}</dd></div>
          <div><dt>Tệp giấy phép</dt><dd>{hasLicenseFile ? 'Có file' : 'Chưa upload'}</dd></div>
          <div><dt>Quyền đặt hàng</dt><dd>{canOrder ? 'Cho phép tạo đơn hàng' : 'Bị chặn bởi backend'}</dd></div>
        </dl>
      </aside>
    </div>

    <div className="retailer-profile-layout">
      <form className="retailer-card retailer-profile-form" onSubmit={handleAccountSave}>
        <div className="retailer-card-head">
          <div>
            <h3>Tài khoản người đại diện</h3>
            <p>Thông tin đăng nhập và liên hệ cá nhân của người mua.</p>
          </div>
          <Icon>person</Icon>
        </div>
        <div className="retailer-profile-fields">
          <label><span>Họ tên</span><input value={accountForm.fullName} onChange={(event) => setAccountForm((prev) => ({ ...prev, fullName: event.target.value }))} required /></label>
          <label><span>Email đăng nhập</span><input value={defaultEmail} readOnly /></label>
          <label><span>Số điện thoại</span><input value={accountForm.phone} onChange={(event) => setAccountForm((prev) => ({ ...prev, phone: event.target.value }))} /></label>
          <label><span>Vai trò</span><input value="RETAILER" readOnly /></label>
        </div>
        <div className="retailer-profile-actions"><Button disabled={savingAccount}>{savingAccount ? 'Đang lưu...' : 'Lưu tài khoản'}</Button></div>
      </form>

      <form className="retailer-card retailer-profile-form" onSubmit={handlePasswordSave}>
        <div className="retailer-card-head">
          <div>
            <h3>Bảo mật</h3>
            <p>Đổi mật khẩu tài khoản retailer.</p>
          </div>
          <Icon>lock</Icon>
        </div>
        <div className="retailer-profile-fields">
          <label className="wide"><span>Mật khẩu hiện tại</span><input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))} required /></label>
          <label><span>Mật khẩu mới</span><input type="password" minLength={8} value={passwordForm.newPassword} onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))} required /></label>
          <label><span>Xác nhận mật khẩu</span><input type="password" minLength={8} value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))} required /></label>
        </div>
        <div className="retailer-profile-actions"><Button disabled={changingPassword}>{changingPassword ? 'Đang đổi...' : 'Đổi mật khẩu'}</Button></div>
      </form>
    </div>
  </RetailerShell>
}
function Info({ label, value }) { return <div><label>{label}</label><p>{String(value).split('\n').map((x, i) => <span key={`${label}-${i}`}>{x}{i === 0 ? <br /> : null}</span>)}</p></div> }

function DepositPage({ data }) {
  const total = data.orders.reduce((sum, order) => sum + Number(order.depositAmount || order.totalAmount || 0), 0)
  const paidOrders = data.orders.filter((order) => String(order.paymentStatus || order.orderPaymentStatus || '').toUpperCase().includes('PAID')).length
  const pendingOrders = Math.max(data.orders.length - paidOrders, 0)
  return <RetailerShell title="Đặt cọc & thanh toán" subtitle="Theo dõi giá trị đơn và trạng thái thanh toán từ backend." loading={data.loading} error={data.error} success={data.success}>
    <section className="retailer-payment-summary">
      <article className="retailer-card retailer-payment-primary">
        <span><Icon>account_balance_wallet</Icon></span>
        <div>
          <p>Tổng giá trị đơn</p>
          <strong>{money(total)}</strong>
          <small>Tính từ các đơn retailer đang truy cập.</small>
        </div>
      </article>
      <article className="retailer-card retailer-payment-metric">
        <p>Đơn có dữ liệu thanh toán</p>
        <strong>{data.orders.length}</strong>
        <small>{pendingOrders} đơn đang chờ hoặc chưa có trạng thái thanh toán.</small>
      </article>
      <article className="retailer-card retailer-payment-security">
        <span className="retailer-trace-guide-icon"><Icon>verified_user</Icon></span>
        <div>
          <h3>Bảo vệ thanh toán</h3>
          <p>Mọi thao tác đặt cọc vẫn đi qua endpoint order/payment của backend.</p>
        </div>
      </article>
    </section>
    <TransactionTable rows={data.orders} title="Lịch sử thanh toán đơn hàng" />
  </RetailerShell>
}
function Wallet({ tone, icon, label, value, note }) { return <article className={`wallet-card ${tone}`}><Icon fill>{icon}</Icon><p>{label}</p><strong>{value}</strong><span>{note}</span></article> }
function TransactionTable({ title = 'Lịch sử giao dịch', rows = [] }) { return <article className="retailer-card retailer-table-card retailer-payment-table"><div className="retailer-card-head"><div><h3>{title}</h3><p>Đối soát và truy xuất đơn hàng</p></div></div>{rows.length ? <table className="retailer-table"><thead><tr>{['Mã giao dịch','Đối tượng / hợp đồng','Trạng thái','Truy xuất blockchain','Ngày','Số tiền'].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(order => <tr key={order.orderId || order.id}><td>#{order.paymentId || order.orderId || order.id}</td><td><b>{order.farmName || order.supplierName || 'Order'}</b><small>{order.contractCode || 'Đã bật truy xuất đơn'}</small></td><td><span className={`status ${statusTone(order.paymentStatus || order.status)}`}>{order.paymentStatus || order.status || 'UNKNOWN'}</span></td><td>{order.blockchainTxHash || order.txHash ? <a>{order.blockchainTxHash || order.txHash}</a> : 'Chưa ghi blockchain'}</td><td>{order.createdAt || order.updatedAt || 'Chưa có ngày'}</td><td><b>{money(order.totalAmount || order.amount)}</b></td></tr>)}</tbody></table> : <div className="retailer-payment-empty"><Icon>payments</Icon><div><h3>Chưa có giao dịch</h3><p>Backend chưa trả về transaction/order cho retailer hiện tại.</p></div></div>}</article> }

function HistoryPage({ data }) {
  return <RetailerShell title="Lịch sử giao dịch" subtitle="Xem lại đơn hàng và giao nhận từ dữ liệu backend." loading={data.loading} error={data.error} success={data.success}>
    <section className="retailer-history-summary">
      <article className="retailer-card">
        <span><Icon>receipt_long</Icon></span>
        <div><p>Đơn hàng</p><strong>{data.orders.length}</strong></div>
      </article>
      <article className="retailer-card">
        <span><Icon>local_shipping</Icon></span>
        <div><p>Shipment</p><strong>{data.shipments.length}</strong></div>
      </article>
      <article className="retailer-card retailer-history-source">
        <Icon>api</Icon>
        <div><p>Nguồn dữ liệu</p><strong>/orders + /shipments/retailer</strong></div>
      </article>
    </section>

    <section className="retailer-history-layout">
      <article className="retailer-card retailer-history-list">
        <div className="retailer-card-head">
          <div><h3>Đơn gần đây</h3><p>{data.orders.length ? 'Tối đa 8 đơn mới nhất từ backend.' : 'Chưa có đơn hàng.'}</p></div>
        </div>
        {data.orders.length ? data.orders.slice(0, 8).map(order => (
          <div className="retailer-history-item" key={order.orderId || order.id}>
            <span><Icon>shopping_bag</Icon></span>
            <div>
              <h4>{order.productName || order.listingTitle || `Order #${order.orderId || order.id}`}</h4>
              <p>{order.farmName || 'Chưa có farm'} · {order.createdAt || 'Chưa có ngày'}</p>
            </div>
            <strong>{money(order.totalAmount || order.amount)}</strong>
            <span className={`status ${statusTone(order.status)}`}>{order.status || 'UNKNOWN'}</span>
          </div>
        )) : (
          <div className="retailer-history-empty">
            <Icon>history</Icon>
            <div><h3>Chưa có lịch sử đơn</h3><p>Backend chưa trả về order history cho retailer hiện tại.</p></div>
          </div>
        )}
      </article>

      <aside className="retailer-card retailer-history-shipments">
        <div className="retailer-card-head">
          <div><h3>Giao nhận đang mở</h3><p>Shipment đang theo dõi.</p></div>
        </div>
        {data.shipments.length ? data.shipments.slice(0, 4).map(item => (
          <div className="retailer-shipment-item" key={item.shipmentId || item.id}>
            <span><Icon>local_shipping</Icon></span>
            <div><strong>Shipment #{item.shipmentId || item.id}</strong><p>{item.status || 'UNKNOWN'} · {item.currentLocation || 'Chưa có vị trí'}</p></div>
          </div>
        )) : (
          <div className="retailer-history-empty compact">
            <Icon>local_shipping</Icon>
            <div><h3>Không có shipment active</h3><p>Chưa có giao nhận đang mở.</p></div>
          </div>
        )}
      </aside>
    </section>
  </RetailerShell>
}

function FallbackPage({ module, data }) { return <RetailerShell title="Không gian nhà bán lẻ" subtitle="Module chưa có màn backend riêng; không hiển thị dữ liệu giả." loading={data.loading} error={data.error} success={data.success}><article className="retailer-card"><h3>Module: {module}</h3><p>Trang này đang chờ wiring API riêng. Hệ thống không dùng dữ liệu demo thay thế.</p></article></RetailerShell> }

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
  if (module === 'notifications') return <RetailerNotificationsPage data={data} />
  if (module === 'messages') return <MessagesPage data={data} />
  if (module === 'reports') return <ReportsPage data={data} />
  if (module === 'contracts') return <RetailerShell title="Quản lý hợp đồng" subtitle="Hợp đồng hợp tác với nông trại" loading={data.loading} error={data.error} success={data.success}><ContractsPage /></RetailerShell>
  return <FallbackPage module={module} data={data} />
}


