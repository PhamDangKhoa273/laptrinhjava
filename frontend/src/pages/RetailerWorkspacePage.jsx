import { useEffect, useMemo, useState } from 'react'
import '../retailer-workspace.css'
import { getPublicListings } from '../services/listingService.js'
import { createOrder, getOrdersV2, getRetailerShipments } from '../services/workflowService.js'
import { getMyRetailer } from '../services/businessService.js'
import { getErrorMessage } from '../utils/helpers.js'

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
  const [state, setState] = useState({ loading: true, error: '', success: '', orderingListingId: null, orders: [], listings: [], shipments: [], retailer: null })

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [orders, listings, shipments, retailer] = await Promise.all([
          getOrdersV2().catch(() => []),
          getPublicListings({ page: 0, size: 8 }).catch(() => []),
          getRetailerShipments().catch(() => []),
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
      const [orders, listings, shipments] = await Promise.all([
        getOrdersV2().catch(() => []),
        getPublicListings({ page: 0, size: 8 }).catch(() => []),
        getRetailerShipments().catch(() => []),
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

function OverviewPage({ data }) {
  const processing = data.orders.filter(order => !['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(String(order.status).toUpperCase())).length
  const delivered = data.orders.filter(order => ['DELIVERED', 'COMPLETED'].includes(String(order.status).toUpperCase())).length
  const totalSpend = data.orders.reduce((sum, order) => sum + Number(order.totalAmount || order.amount || 0), 0)
  const suppliers = new Set(data.listings.map(item => item.farmName || item.sellerName || item.farm?.farmName).filter(Boolean)).size

  return <RetailerShell title="Retailer Overview" subtitle="Trực tiếp order, marketplace, and delivery status from BICAP APIs." loading={data.loading} error={data.error} success={data.success}>
    <div className="retailer-head-actions"><Button variant="ghost"><Icon>sync</Icon> Trực tiếp Backend</Button><Button variant="ghost"><Icon>download</Icon> Export from API</Button></div>
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
  if (!rows.length) return <p className="empty-copy">Chưa có order nào từ backend.</p>
  return <table className="retailer-table"><thead><tr>{['Order ID','Supplier','Product','Status','Amount','Action'].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(order => <tr key={order.orderId || order.id}><td>#{order.orderId || order.id}</td><td>{order.farmName || order.supplierName || order.farm?.farmName || 'N/A'}</td><td>{order.productName || order.listingTitle || order.product?.name || 'N/A'}</td><td><span className={`status ${statusTone(order.status)}`}>{order.status || 'UNKNOWN'}</span></td><td><b>{money(order.totalAmount || order.amount)}</b></td><td><button type="button"><Icon>visibility</Icon></button></td></tr>)}</tbody></table>
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
  const categories = useMemo(() => listingOptions(data.listings, ['productCategory', 'categoryName', 'type']), [data.listings])
  const regions = useMemo(() => listingOptions(data.listings, ['province', 'region', 'location']), [data.listings])
  const filteredListings = useMemo(() => data.listings.filter((item) => {
    const categoryMatched = !categoryFilter || [item.productCategory, item.categoryName, item.type].some((value) => String(value || '') === categoryFilter)
    const regionMatched = !regionFilter || [item.province, item.region, item.location].some((value) => String(value || '') === regionFilter)
    return categoryMatched && regionMatched
  }), [categoryFilter, data.listings, regionFilter])

  return <RetailerShell title="Chợ nông sản" subtitle="Listing đã được backend trả về từ /listings." loading={data.loading} error={data.error} success={data.success}>
    <div className="retailer-market-layout"><aside className="retailer-filters"><div className="retailer-card-head"><h3>Bộ lọc</h3><a>Dữ liệu backend</a></div>{categories.length ? <FilterGroup title="Danh mục sản phẩm" items={categories} value={categoryFilter} onChange={setCategoryFilter} /> : <p>Chưa có danh mục từ listing backend.</p>}{regions.length ? <div className="filter-block"><h4>Khu vực</h4><select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)}><option value="">Tất cả khu vực</option>{regions.map((region) => <option key={region} value={region}>{region}</option>)}</select></div> : null}<Button variant="ghost" onClick={() => { setCategoryFilter(''); setRegionFilter('') }}>Xóa bộ lọc</Button></aside><div className="retailer-products"><div className="retailer-list-head"><div><h2>Chợ nông sản</h2><p>{data.listings.length} listing từ backend.</p></div><div><span><b>{filteredListings.length}</b> sản phẩm phù hợp</span><select><option>Sắp xếp: thứ tự backend</option></select></div></div>{filteredListings.length ? <div className="product-grid">{filteredListings.map(item => <Product key={item.listingId || item.id || item.title} item={item} onOrder={data.createOrderFromListing} orderingListingId={data.orderingListingId} />)}</div> : <EmptyState title="Chưa có listing" text="Backend chưa trả về listing nào cho bộ lọc hiện tại. Hãy tạo và duyệt listing từ farm trước." />}</div></div>
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
  return <RetailerShell title="Retailer Hồ sơ" subtitle="Business profile from /retailers/me." loading={data.loading} error={data.error} success={data.success}>
    <section className="profile-hero"><div className="cover"></div><div className="profile-identity"><div className="store-logo">{(retailer.businessName || retailer.name || 'RT').slice(0, 2).toUpperCase()}</div><div><h2>{retailer.businessName || retailer.name || 'Retailer business not configured'} <span><Icon fill>verified</Icon>{retailer.status || 'Backend Managed'}</span></h2><p>{retailer.businessType || 'Retail partner'} • {retailer.createdAt || 'Created by backend'}</p></div></div></section>
    <div className="profile-grid"><article className="retailer-card business-info"><div className="retailer-card-head"><h3>Business Information</h3><Icon>business_center</Icon></div><div className="info-grid"><Info label="Representative Name" value={retailer.representativeName || retailer.contactName || 'N/A'} /><Info label="Contact Email" value={retailer.email || retailer.contactEmail || 'N/A'} /><Info label="Store Address" value={retailer.address || 'N/A'} /><Info label="Business Phone" value={retailer.phone || 'N/A'} /></div></article><aside className="profile-side"><article className="identity-card"><h3><Icon>verified_user</Icon> Backend Identity</h3><p><span>Retailer ID</span><b>{retailer.retailerId || retailer.id || 'N/A'}</b></p><p><span>Status</span><b>{retailer.status || 'N/A'}</b></p><span><i></i></span></article></aside></div>
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
  if (module === 'deposit') return <DepositPage data={data} />
  if (module === 'history') return <HistoryPage data={data} />
  return <FallbackPage module={module} data={data} />
}
