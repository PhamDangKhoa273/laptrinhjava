import { useEffect, useMemo, useState } from 'react'
import '../retailer-workspace.css'
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
  const [certification, setCertification] = useState('')
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
      const [retailerResult, listingResult, orderResult, notificationResult] = await Promise.allSettled([
        getMyRetailer(),
        getPublicListings({ page: 0, size: 12, sort, keyword: search, province, certification }),
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
                      <p>Escrow-style readiness: {selectedOrderDetail.depositPaidAt ? 'Deposit đã được giữ trong hệ thống' : 'Chưa hoàn tất deposit'}</p>
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
              <span className="field-label">Certification</span>
              <select className="field-input" value={certification} onChange={(event) => setCertification(event.target.value)}>
                <option value="">Any certification</option>
                <option value="VIETGAP">VietGAP</option>
                <option value="GLOBALGAP">GlobalGAP</option>
                <option value="ORGANIC">Organic</option>
                <option value="PENDING">Đang cập nhật</option>
              </select>
            </label>
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
                  <p>Certification: {item.certificationStatus || 'Đang cập nhật'}</p>
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
