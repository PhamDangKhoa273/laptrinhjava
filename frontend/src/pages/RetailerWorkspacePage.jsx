import { useEffect, useMemo, useState } from 'react'
import '../retailer-workspace.css'
<<<<<<< Updated upstream
import '../transaction-hardening.css'
import { Button } from '../components/Button.jsx'
import { TextAreaField } from '../components/TextAreaField.jsx'
import { TextInput } from '../components/TextInput.jsx'
import { createRetailer, getMyRetailer, updateRetailer } from '../services/businessService'
import { getPublicListings } from '../services/listingService.js'
import { uploadDeliveryProofFile } from '../services/mediaService.js'
import {
  cancelOrder,
  confirmOrderDelivery,
  createOrder,
  createReport,
  getMyNotifications,
  getOrderById,
  getOrderStatusHistory,
  getOrdersV2,
  markNotificationRead,
  payOrderDeposit,
} from '../services/workflowService.js'
import { getErrorMessage } from '../utils/helpers'
=======
import { getPublicListings, getListingById } from '../services/listingService.js'
import { cancelOrder, confirmOrderDelivery, createOrder, createReport, getMyNotifications, getOrderById, getOrderStatusHistory, getOrdersV2, getRetailerShipments, markNotificationRead, payOrderDeposit, uploadShippingProof } from '../services/workflowService.js'
import { createNotification, getMyRetailer, updateRetailer, uploadRetailerBusinessLicense } from '../services/businessService.js'
import { getErrorMessage } from '../utils/helpers.js'
import ContractsPage from './ContractsPage.jsx'
>>>>>>> Stashed changes

const initialProfileForm = {
  retailerCode: '',
  retailerName: '',
  businessLicenseNo: '',
  address: '',
  status: 'ACTIVE',
}

const initialOrderForm = {
  listingId: '',
  quantity: '',
}

const initialDepositForm = {
  amount: '',
  method: 'BANK_TRANSFER',
  transactionRef: '',
}

const initialCancelForm = {
  reason: '',
}

<<<<<<< Updated upstream
const initialDeliveryForm = {
  proofImageUrl: '',
  note: '',
}

function formatCurrency(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return 'N/A'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numeric)
}

function formatDateTime(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString('vi-VN')
}

function toPositiveNumber(value) {
  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null
}

export function RetailerWorkspacePage() {
  const [retailer, setRetailer] = useState(null)
  const [profileForm, setProfileForm] = useState(initialProfileForm)
  const [orderForm, setOrderForm] = useState(initialOrderForm)
  const [depositForm, setDepositForm] = useState(initialDepositForm)
  const [cancelForm, setCancelForm] = useState(initialCancelForm)
  const [deliveryForm, setDeliveryForm] = useState(initialDeliveryForm)
  const [deliveryFile, setDeliveryFile] = useState(null)
  const [listings, setListings] = useState([])
  const [orders, setOrders] = useState([])
  const [notifications, setNotifications] = useState([])
  const [history, setHistory] = useState([])
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null)
  const [search, setSearch] = useState('')
  const [province, setProvince] = useState('')
  const [sort, setSort] = useState('createdAt,desc')
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingOrder, setSavingOrder] = useState(false)
  const [savingWorkflow, setSavingWorkflow] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const selectedOrder = useMemo(
    () => orders.find((item) => String(item.orderId) === String(selectedOrderId)) || null,
    [orders, selectedOrderId],
  )

  const summary = useMemo(() => ({
    totalListings: listings.length,
    totalOrders: orders.length,
    pendingOrders: orders.filter((item) => item.status === 'PENDING').length,
    unreadNotifications: notifications.filter((item) => !item.read).length,
  }), [listings, orders, notifications])

  useEffect(() => {
    loadWorkspace()
=======
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
>>>>>>> Stashed changes
  }, [])

  useEffect(() => {
    if (selectedOrder?.orderId) {
      loadHistory(selectedOrder.orderId)
      loadOrderDetail(selectedOrder.orderId)
    } else {
      setHistory([])
      setSelectedOrderDetail(null)
    }
  }, [selectedOrder?.orderId])

  async function loadWorkspace() {
    setLoading(true)
    try {
<<<<<<< Updated upstream
      const [retailerResult, listingResult, orderResult, notificationResult] = await Promise.allSettled([
        getMyRetailer(),
        getPublicListings({ page: 0, size: 12, sort, keyword: search, province }),
        getOrdersV2(),
        getMyNotifications(),
      ])

      const retailerData = retailerResult.status === 'fulfilled' ? retailerResult.value : null
      setRetailer(retailerData)
      setProfileForm({
        retailerCode: retailerData?.retailerCode || '',
        retailerName: retailerData?.retailerName || '',
        businessLicenseNo: retailerData?.businessLicenseNo || '',
        address: retailerData?.address || '',
        status: retailerData?.status || 'ACTIVE',
      })

      const listingData = listingResult.status === 'fulfilled' ? listingResult.value?.items || [] : []
      setListings(Array.isArray(listingData) ? listingData : [])
      setOrderForm((prev) => ({ ...prev, listingId: prev.listingId || String(listingData[0]?.listingId || '') }))

      const orderData = orderResult.status === 'fulfilled' && Array.isArray(orderResult.value) ? orderResult.value : []
      setOrders(orderData)
      setSelectedOrderId((prev) => prev || String(orderData[0]?.orderId || ''))

      setNotifications(notificationResult.status === 'fulfilled' && Array.isArray(notificationResult.value) ? notificationResult.value : [])
      setError('')
=======
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
>>>>>>> Stashed changes
    } catch (err) {
      setError(getErrorMessage(err, 'Không tải được Retailer Workspace.'))
    } finally {
      setLoading(false)
    }
  }

  async function loadHistory(orderId) {
    try {
      const data = await getOrderStatusHistory(orderId)
      setHistory(Array.isArray(data) ? data : [])
    } catch {
      setHistory([])
    }
  }

  async function loadOrderDetail(orderId) {
    try {
      const data = await getOrderById(orderId)
      setSelectedOrderDetail(data)
    } catch {
      setSelectedOrderDetail(null)
    }
  }

  function handleProfileChange(event) {
    const { name, value } = event.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleOrderChange(event) {
    const { name, value } = event.target
    setOrderForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleDepositChange(event) {
    const { name, value } = event.target
    setDepositForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleCancelChange(event) {
    const { name, value } = event.target
    setCancelForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleDeliveryChange(event) {
    const { name, value } = event.target
    setDeliveryForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleProfileSubmit(event) {
    event.preventDefault()
    if (savingProfile) return
    setSavingProfile(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        retailerCode: profileForm.retailerCode.trim(),
        retailerName: profileForm.retailerName.trim(),
        businessLicenseNo: profileForm.businessLicenseNo.trim(),
        address: profileForm.address.trim(),
        status: profileForm.status.trim(),
      }

      const result = retailer
        ? await updateRetailer(retailer.retailerId, {
          retailerName: payload.retailerName,
          businessLicenseNo: payload.businessLicenseNo,
          address: payload.address,
          status: payload.status,
        })
        : await createRetailer(payload)

      setRetailer(result)
      setProfileForm({
        retailerCode: result.retailerCode || payload.retailerCode,
        retailerName: result.retailerName || '',
        businessLicenseNo: result.businessLicenseNo || '',
        address: result.address || '',
        status: result.status || 'ACTIVE',
      })
      setSuccess(retailer ? 'Đã cập nhật retailer profile.' : 'Đã tạo retailer profile.')
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể lưu retailer profile.'))
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleCreateOrder(event) {
    event.preventDefault()
    if (savingOrder) return

    const listingId = toPositiveNumber(orderForm.listingId)
    const quantity = toPositiveNumber(orderForm.quantity)
    if (!listingId || !quantity) {
      setError('Listing và quantity phải hợp lệ.')
      return
    }

    setSavingOrder(true)
    setError('')
    setSuccess('')
    try {
      await createOrder({ items: [{ listingId, quantity }] })
      setSuccess('Đã tạo order mới.')
      setOrderForm({ ...initialOrderForm, listingId: String(listings[0]?.listingId || '') })
      await loadWorkspace()
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tạo order.'))
    } finally {
      setSavingOrder(false)
    }
  }

  async function handlePayDeposit(event) {
    event.preventDefault()
    if (!selectedOrder || savingWorkflow) return

    const amount = toPositiveNumber(depositForm.amount)
    if (!amount) {
      setError('Số tiền đặt cọc phải hợp lệ.')
      return
    }

    setSavingWorkflow(true)
    setError('')
    setSuccess('')
    try {
      await payOrderDeposit(selectedOrder.orderId, {
        amount,
        method: depositForm.method.trim(),
        transactionRef: depositForm.transactionRef.trim(),
      })
      setSuccess('Đã thanh toán đặt cọc.')
      setDepositForm(initialDepositForm)
      await loadWorkspace()
    } catch (err) {
      setError(getErrorMessage(err, 'Không thanh toán được đặt cọc.'))
    } finally {
      setSavingWorkflow(false)
    }
  }

  async function handleCancelOrder(event) {
    event.preventDefault()
    if (!selectedOrder || savingWorkflow) return

    setSavingWorkflow(true)
    setError('')
    setSuccess('')
    try {
      await cancelOrder(selectedOrder.orderId, { reason: cancelForm.reason.trim() })
      setSuccess('Đã hủy đơn hàng.')
      setCancelForm(initialCancelForm)
      await loadWorkspace()
    } catch (err) {
      setError(getErrorMessage(err, 'Không hủy được đơn hàng.'))
    } finally {
      setSavingWorkflow(false)
    }
  }

  async function handleConfirmDelivery(event) {
    event.preventDefault()
    if (!selectedOrder || savingWorkflow) return

    setSavingWorkflow(true)
    setError('')
    setSuccess('')
    try {
      let proofUrl = deliveryForm.proofImageUrl.trim()
      if (deliveryFile) {
        const uploaded = await uploadDeliveryProofFile(selectedOrder.orderId, deliveryFile)
        proofUrl = uploaded.fileUrl
      }
      await confirmOrderDelivery(selectedOrder.orderId, {
        proofImageUrl: proofUrl,
        note: deliveryForm.note.trim(),
      })
      setSuccess('Đã xác nhận nhận hàng hoàn tất.')
      setDeliveryForm(initialDeliveryForm)
      setDeliveryFile(null)
      await loadWorkspace()
    } catch (err) {
      setError(getErrorMessage(err, 'Không xác nhận được giao hàng.'))
    } finally {
      setSavingWorkflow(false)
    }
  }

  async function handleMarkRead(notificationId) {
    setError('')
    try {
      await markNotificationRead(notificationId)
      await loadWorkspace()
    } catch (err) {
      setError(getErrorMessage(err, 'Không đánh dấu notification được.'))
    }
  }

  async function handleCreateReport() {
    try {
      await createReport({
        recipientRole: 'ADMIN',
        reportType: 'RETAILER_ORDER',
        subject: 'Retailer phản hồi workflow đơn hàng',
        content: 'Retailer cần hỗ trợ về trạng thái đơn hàng, proof hoặc thanh toán đặt cọc.',
        relatedEntityType: 'ORDER',
        relatedEntityId: selectedOrder ? selectedOrder.orderId : null,
      })
      setSuccess('Đã gửi report cho admin.')
    } catch (err) {
      setError(getErrorMessage(err, 'Không gửi được report.'))
    }
  }

<<<<<<< Updated upstream
=======
function getTraceKind(item) {
  if (!item) return 'Kết quả'
  if (item.shipmentId || String(item.status || '').toLowerCase().includes('ship')) return 'Shipment'
  if (item.orderId || String(item.status || '').toLowerCase().includes('order')) return 'Order'
  if (item.listingId || item.title || item.productName) return 'Listing'
  return 'Kết quả'
}

function RetailerShell({ title, subtitle, children, loading, error, success }) {
>>>>>>> Stashed changes
  return (
    <section className="page-section retailer-workspace-shell">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Retailer workspace</p>
          <h2>Retailer control surface</h2>
          <p>Gom profile, marketplace browsing, buying flow, order lifecycle và trace consumption side vào một workspace thống nhất.</p>
        </div>
        <div className="section-actions">
          <Button variant="secondary" onClick={loadWorkspace} disabled={loading}>Làm mới</Button>
          <Button onClick={handleCreateReport} disabled={!selectedOrder}>Gửi report</Button>
        </div>
      </div>

      <div className="feature-grid">
        <article className="status-card tone-success">
          <span className="summary-label">Retailer</span>
          <strong>{retailer?.status || 'NOT_CREATED'}</strong>
          <p>{retailer?.retailerName || 'Chưa tạo retailer profile'}</p>
        </article>
        <article className="status-card tone-primary">
          <span className="summary-label">Marketplace</span>
          <strong>{summary.totalListings}</strong>
          <p>Listing đang mở để mua</p>
        </article>
        <article className="status-card tone-warning">
          <span className="summary-label">Orders</span>
          <strong>{summary.totalOrders}</strong>
          <p>{summary.pendingOrders} đơn đang PENDING</p>
        </article>
        <article className="status-card">
          <span className="summary-label">Notifications</span>
          <strong>{summary.unreadNotifications}</strong>
          <p>Thông báo chưa đọc</p>
        </article>
      </div>

      {loading ? <div className="glass-card">Đang tải Retailer Workspace...</div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <div className="glass-card top-gap retailer-panel">
        <div className="retailer-panel-header">
          <div>
            <p className="eyebrow">Transaction hardening</p>
            <h3>Cross-actor order consistency</h3>
            <p>Làm rõ payment, logistics proof và traceability để retailer thấy chuỗi giao dịch khép kín hơn.</p>
          </div>
        </div>
        <div className="transaction-kpi-grid">
          <div className="transaction-kpi-card">
            <strong>{orders.filter((item) => item.paymentStatus === 'DEPOSIT_PAID').length}</strong>
            <p>Đơn đã deposit</p>
          </div>
          <div className="transaction-kpi-card">
            <strong>{orders.filter((item) => item.status === 'DELIVERED').length}</strong>
            <p>Đơn đã tới bước nhận hàng</p>
          </div>
          <div className="transaction-kpi-card">
            <strong>{orders.filter((item) => item.shippingProofImageUrl).length}</strong>
            <p>Đơn đã có shipping proof</p>
          </div>
          <div className="transaction-kpi-card">
            <strong>{orders.filter((item) => item.deliveryProofImageUrl).length}</strong>
            <p>Đơn đã có delivery proof</p>
          </div>
        </div>
        <div className="transaction-audit-grid top-gap">
          <div className="transaction-issue-list">
            <div className="transaction-issue-card">
              <strong>Deposit but still pending</strong>
              <p>{orders.filter((item) => item.paymentStatus === 'DEPOSIT_PAID' && item.status === 'PENDING').length} đơn đã deposit nhưng vẫn đứng ở PENDING.</p>
            </div>
            <div className="transaction-issue-card">
              <strong>Shipping proof gap</strong>
              <p>{orders.filter((item) => item.status === 'SHIPPING' && !item.shippingProofImageUrl).length} đơn đang SHIPPING nhưng chưa có proof logistics.</p>
            </div>
          </div>
          <div className="transaction-issue-list">
            <div className="transaction-issue-card">
              <strong>Delivery confirmation gap</strong>
              <p>{orders.filter((item) => item.status === 'DELIVERED' && !item.deliveryProofImageUrl).length} đơn DELIVERED nhưng retailer chưa đính proof nhận hàng.</p>
            </div>
            <div className="transaction-issue-card">
              <strong>Traceability gap</strong>
              <p>{orders.filter((item) => item.items?.some((orderItem) => !orderItem.batchCode)).length} order có item chưa hiện batchCode để trace.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="retailer-workspace-grid top-gap">
        <article className="glass-card retailer-panel retailer-panel-wide">
          <div className="retailer-panel-header">
            <div>
              <p className="eyebrow">Retailer profile</p>
              <h3>Hồ sơ doanh nghiệp</h3>
            </div>
          </div>

          <form className="form-grid" onSubmit={handleProfileSubmit}>
            <div className="grid-two">
              <TextInput label="Retailer code" name="retailerCode" value={profileForm.retailerCode} onChange={handleProfileChange} required disabled={Boolean(retailer)} />
              <TextInput label="Retailer name" name="retailerName" value={profileForm.retailerName} onChange={handleProfileChange} required />
            </div>
            <div className="grid-two">
              <TextInput label="Business license" name="businessLicenseNo" value={profileForm.businessLicenseNo} onChange={handleProfileChange} required />
              <TextInput label="Status" name="status" value={profileForm.status} onChange={handleProfileChange} />
            </div>
            <TextInput label="Address" name="address" value={profileForm.address} onChange={handleProfileChange} required />
            <Button type="submit" disabled={savingProfile}>{savingProfile ? 'Đang lưu...' : retailer ? 'Cập nhật retailer profile' : 'Tạo retailer profile'}</Button>
          </form>
        </article>

        <article className="glass-card retailer-panel">
          <div className="retailer-panel-header">
            <div>
              <p className="eyebrow">Order handling</p>
              <h3>Đơn hàng đang chọn</h3>
            </div>
          </div>

          {selectedOrder ? (
            <div className="form-grid">
              <div className="business-card retailer-order-card is-selected">
                <div>
                  <strong>Order #{selectedOrder.orderId}</strong>
                  <p>Status: {selectedOrder.status}</p>
                  <p>Payment: {selectedOrder.paymentStatus}</p>
                  <p>Total: {formatCurrency(selectedOrder.totalAmount)}</p>
                  <p>Deposit: {formatCurrency(selectedOrder.depositAmount)}</p>
                  <p>Created: {formatDateTime(selectedOrder.createdAt)}</p>
                </div>
              </div>

              <div className="form-grid">
                <h4>Status history</h4>
                {history.length === 0 ? <p>Chưa có lịch sử trạng thái.</p> : history.map((item) => (
                  <div key={item.historyId} className="business-card">
                    <div>
                      <strong>{item.previousStatus || 'N/A'} → {item.newStatus}</strong>
                      <p>{item.reason || 'Không có ghi chú'}</p>
                      <p>{formatDateTime(item.changedAt)}</p>
                      {item.blockchainTxHash ? <p>Tx: {item.blockchainTxHash}</p> : null}
                    </div>
                  </div>
                ))}
              </div>

              {selectedOrderDetail ? (
                <div className="form-grid">
                  <h4>Cross-actor visibility</h4>
                  <div className="business-card">
                    <div>
                      <strong>Payment + proof snapshot</strong>
                      <p>Deposit paid at: {formatDateTime(selectedOrderDetail.depositPaidAt)}</p>
                      <p>Shipping proof: {selectedOrderDetail.shippingProofImageUrl || 'Chưa có'}</p>
                      <p>Delivery proof: {selectedOrderDetail.deliveryProofImageUrl || 'Chưa có'}</p>
                      <p>Delivery confirmed at: {formatDateTime(selectedOrderDetail.deliveryConfirmedAt)}</p>
                    </div>
                  </div>
                  {selectedOrderDetail.items?.map((item, index) => (
                    <div key={`${item.listingId}-${index}`} className="business-card">
                      <div>
                        <strong>{item.title}</strong>
                        <p>Batch: {item.batchCode || 'N/A'}</p>
                        <p>Quantity: {item.quantity}</p>
                        <p>Subtotal: {formatCurrency(item.subTotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : <p>Chọn một order để xem lifecycle.</p>}
        </article>
      </div>

      <div className="retailer-workspace-grid top-gap">
        <article className="glass-card retailer-panel retailer-panel-wide">
          <div className="retailer-panel-header">
            <div>
              <p className="eyebrow">Marketplace browsing</p>
              <h3>Tìm listing để mua</h3>
              <p>Retailer có thể duyệt marketplace public, xem nguồn gốc và đặt order trực tiếp.</p>
            </div>
          </div>

          <div className="retailer-filter-grid">
            <TextInput label="Keyword" name="search" value={search} onChange={(event) => setSearch(event.target.value)} />
            <TextInput label="Province" name="province" value={province} onChange={(event) => setProvince(event.target.value)} />
            <label className="field-group">
              <span className="field-label">Sort</span>
              <select className="field-input" value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="createdAt,desc">Mới nhất</option>
                <option value="price,asc">Giá tăng dần</option>
                <option value="price,desc">Giá giảm dần</option>
                <option value="title,asc">Tên A-Z</option>
              </select>
            </label>
            <div className="section-actions" style={{ alignItems: 'end' }}>
              <Button variant="secondary" onClick={loadWorkspace}>Áp dụng</Button>
            </div>
          </div>

          <div className="retailer-listing-grid top-gap">
            {listings.length === 0 ? <p>Chưa có listing phù hợp.</p> : listings.map((item) => (
              <div key={item.listingId} className="business-card">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.farmName || 'Nông trại BICAP'} {item.province ? `• ${item.province}` : ''}</p>
                  <p>{formatCurrency(item.price)} / {item.unit || 'kg'}</p>
                  <p>Available: {item.quantityAvailable} {item.unit || 'kg'} • Quality: {item.qualityGrade || 'N/A'}</p>
                  <p>Batch: {item.batchCode || 'N/A'} • Farm code: {item.farmCode || 'N/A'}</p>
                </div>
                <div className="inline-actions">
                  <Button variant="secondary" onClick={() => setOrderForm((prev) => ({ ...prev, listingId: String(item.listingId) }))}>Chọn để đặt</Button>
                  <Button variant="secondary" onClick={() => window.open(`/public/trace?batchId=${item.batchId}`, '_blank')}>Xem trace</Button>
                </div>
              </div>
            ))}
          </div>

          <form className="form-grid top-gap" onSubmit={handleCreateOrder}>
            <div className="grid-two">
              <label className="field-group">
                <span className="field-label">Listing</span>
                <select className="field-input" name="listingId" value={orderForm.listingId} onChange={handleOrderChange}>
                  <option value="">Chọn listing</option>
                  {listings.map((item) => (
                    <option key={item.listingId} value={item.listingId}>{item.title} • {formatCurrency(item.price)}</option>
                  ))}
                </select>
              </label>
              <TextInput label="Quantity" name="quantity" type="number" min="1" value={orderForm.quantity} onChange={handleOrderChange} required />
            </div>
            <Button type="submit" disabled={savingOrder}>{savingOrder ? 'Đang tạo...' : 'Tạo order'}</Button>
          </form>
        </article>

        <article className="glass-card retailer-panel">
          <div className="retailer-panel-header">
            <div>
              <p className="eyebrow">Order lifecycle</p>
              <h3>Deposit, cancel, confirm</h3>
            </div>
          </div>

          <div className="retailer-chip-row">
            {orders.length === 0 ? <p>Chưa có order.</p> : orders.map((order) => (
              <button
                key={order.orderId}
                type="button"
                className={`retailer-chip ${String(order.orderId) === String(selectedOrderId) ? 'active' : ''}`}
                onClick={() => setSelectedOrderId(String(order.orderId))}
              >
                #{order.orderId} • {order.status}
              </button>
            ))}
          </div>

          <form className="form-grid top-gap" onSubmit={handlePayDeposit}>
            <h4>Thanh toán đặt cọc</h4>
            <TextInput label="Số tiền" name="amount" type="number" min="1" value={depositForm.amount} onChange={handleDepositChange} required />
            <TextInput label="Phương thức" name="method" value={depositForm.method} onChange={handleDepositChange} required />
            <TextInput label="Mã giao dịch" name="transactionRef" value={depositForm.transactionRef} onChange={handleDepositChange} required />
            <Button type="submit" disabled={savingWorkflow || !selectedOrder}>Thanh toán đặt cọc</Button>
          </form>

          <form className="form-grid top-gap" onSubmit={handleCancelOrder}>
            <h4>Hủy đơn</h4>
            <TextAreaField label="Lý do hủy" name="reason" value={cancelForm.reason} onChange={handleCancelChange} />
            <Button type="submit" variant="secondary" disabled={savingWorkflow || !selectedOrder}>Hủy đơn hàng</Button>
          </form>

          <form className="form-grid top-gap" onSubmit={handleConfirmDelivery}>
            <h4>Xác nhận nhận hàng</h4>
            <TextInput label="Proof image URL" name="proofImageUrl" value={deliveryForm.proofImageUrl} onChange={handleDeliveryChange} />
            <label className="form-field">
              <span className="form-label">Hoặc chọn file proof</span>
              <input className="form-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setDeliveryFile(event.target.files?.[0] || null)} />
            </label>
            <TextAreaField label="Ghi chú" name="note" value={deliveryForm.note} onChange={handleDeliveryChange} />
            {selectedOrder?.shippingProofImageUrl ? <img className="retailer-proof-preview" src={selectedOrder.shippingProofImageUrl} alt="Shipping proof" /> : null}
            <Button type="submit" disabled={savingWorkflow || !selectedOrder}>Xác nhận đã nhận hàng</Button>
          </form>
        </article>
      </div>

      <div className="retailer-workspace-grid top-gap">
        <article className="glass-card retailer-panel retailer-panel-wide">
          <div className="retailer-panel-header">
            <div>
              <p className="eyebrow">Orders</p>
              <h3>Danh sách order của retailer</h3>
            </div>
          </div>

          <div className="form-grid">
            {orders.length === 0 ? <p>Chưa có đơn hàng.</p> : orders.map((order) => (
              <div key={order.orderId} className={`business-card retailer-order-card ${String(order.orderId) === String(selectedOrderId) ? 'is-selected' : ''}`}>
                <div>
                  <strong>Order #{order.orderId}</strong>
                  <p>Status: {order.status} • Payment: {order.paymentStatus}</p>
                  <p>Total: {formatCurrency(order.totalAmount)} • Deposit: {formatCurrency(order.depositAmount)}</p>
                  <p>Cancellation: {order.cancellationReason || 'Không có'}</p>
                  {order.items?.length ? <p>Items: {order.items.map((item) => `${item.title} (${item.quantity})`).join(', ')}</p> : null}
                </div>
                <div className="inline-actions">
                  <Button variant="secondary" onClick={() => setSelectedOrderId(String(order.orderId))}>Chọn</Button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-card retailer-panel">
          <div className="retailer-panel-header">
            <div>
              <p className="eyebrow">Notifications</p>
              <h3>Thông báo vận hành</h3>
            </div>
          </div>

          <div className="form-grid">
            {notifications.length === 0 ? <p>Chưa có notification.</p> : notifications.map((item) => (
              <div key={item.notificationId} className="business-card">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.message}</p>
                </div>
                <div className="inline-actions">
                  <span className={`status-pill status-${item.read ? 'active' : 'pending'}`}>{item.read ? 'Đã đọc' : 'Chưa đọc'}</span>
                  {!item.read ? <Button variant="secondary" onClick={() => handleMarkRead(item.notificationId)}>Đánh dấu đã đọc</Button> : null}
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}
<<<<<<< Updated upstream
=======

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
  const [traceCode, setTraceCode] = useState('')
  const [traceResult, setTraceResult] = useState(null)
  const [traceKind, setTraceKind] = useState('')
  const [traceError, setTraceError] = useState('')
  const [loadingTrace, setLoadingTrace] = useState(false)

  function searchTrace() {
    const code = traceCode.trim().toLowerCase()
    if (!code) {
      setTraceResult(null)
      setTraceError('Nhập mã QR / batch / shipment để truy xuất.')
      return
    }
    const shipment = data.shipments.find((item) => [item.traceCode, item.batchCode, item.shipmentId].some((value) => String(value || '').toLowerCase() === code)) || null
    const listing = data.listings.find((item) => [item.traceCode, item.batchCode, item.listingId, item.id].some((value) => String(value || '').toLowerCase() === code)) || null
    const order = data.orders.find((item) => [item.traceCode, item.batchCode, item.orderId, item.id].some((value) => String(value || '').toLowerCase() === code)) || null
    const result = shipment || listing || order
    setTraceResult(result || null)
    setTraceKind(getTraceKind(result))
    setTraceError(result ? '' : 'Không tìm thấy mã phù hợp trong dữ liệu hiện tại.')
  }

  return <RetailerShell title="QR Trace" subtitle="Truy xuất theo mã QR/batch/shipment từ dữ liệu retailer hiện có." loading={data.loading || loadingTrace} error={data.error || traceError} success={data.success}>
    <section className="retailer-card">
      <div className="retailer-card-head"><h3>Nhập mã truy xuất</h3><span className="pill blue">Retailer</span></div>
      <div className="retailer-search-row">
        <input value={traceCode} onChange={(event) => setTraceCode(event.target.value)} placeholder="Trace code / batch code / shipment id" />
        <Button onClick={searchTrace}>Truy xuất</Button>
      </div>
    </section>
    {traceResult ? <RetailerDetailsBar title={`${traceKind} truy xuất`} item={traceResult} empty="Không có kết quả." /> : <EmptyState title="Chưa truy xuất" text="Nhập mã ở trên để xem shipment, listing hoặc order liên quan." />}
  </RetailerShell>
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
      await createReport({ title: title.trim(), description: description.trim(), severity })
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
>>>>>>> Stashed changes
