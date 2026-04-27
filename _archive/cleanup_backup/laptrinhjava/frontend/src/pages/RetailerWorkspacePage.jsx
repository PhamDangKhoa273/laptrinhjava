import { useEffect, useMemo, useRef, useState } from 'react'
import '../retailer-workspace.css'
import '../transaction-hardening.css'
import { Button } from '../components/Button.jsx'
import { TextAreaField } from '../components/TextAreaField.jsx'
import { TextInput } from '../components/TextInput.jsx'
import { createRetailer, getMyRetailer, updateRetailer, uploadRetailerBusinessLicense } from '../services/businessService'
import { getRetailerContracts } from '../services/contractService.js'
import { createNotification } from '../services/businessService'
import { getPublicListings } from '../services/listingService.js'
import { uploadDeliveryProofFile } from '../services/mediaService.js'
import { Html5QrcodeScanner } from 'html5-qrcode'
import {
  cancelOrder,
  confirmOrderDelivery,
  createOrder,
  createReport,
  getMyNotifications,
  getOrderById,
  getOrderStatusHistory,
  getOrdersV2,
  getRetailerShipments,
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

function formatDate(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleDateString('vi-VN')
}

function toPositiveNumber(value) {
  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null
}

function StatusBadge({ value }) {
  return <span className={`status-pill status-${String(value || '').toLowerCase()}`}>{value || 'N/A'}</span>
}

export function RetailerWorkspacePage() {
  const [retailer, setRetailer] = useState(null)
  const [profileForm, setProfileForm] = useState(initialProfileForm)
  const [orderForm, setOrderForm] = useState(initialOrderForm)
  const [depositForm, setDepositForm] = useState(initialDepositForm)
  const [cancelForm, setCancelForm] = useState(initialCancelForm)
  const [deliveryForm, setDeliveryForm] = useState(initialDeliveryForm)
  const [deliveryFile, setDeliveryFile] = useState(null)
  const [licenseFile, setLicenseFile] = useState(null)
  const [traceInput, setTraceInput] = useState('')
  const [traceImageFile, setTraceImageFile] = useState(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const scannerRef = useRef(null)
  const [listings, setListings] = useState([])
  const [orders, setOrders] = useState([])
  const [notifications, setNotifications] = useState([])
  const [history, setHistory] = useState([])
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null)
  const [search, setSearch] = useState('')
  const [province, setProvince] = useState('')
  const [certification, setCertification] = useState('')
  const [type, setType] = useState('')
  const [sort, setSort] = useState('createdAt,desc')
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [loading, setLoading] = useState(true)
  const [shipments, setShipments] = useState([])
  const [contracts, setContracts] = useState([])
  const [messageForm, setMessageForm] = useState({ subject: '', message: '' })
  const [threadFilter, setThreadFilter] = useState('ORDER')
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
    depositPaidOrders: orders.filter((item) => item.paymentStatus === 'DEPOSIT_PAID').length,
    cancelledOrders: orders.filter((item) => item.status === 'CANCELLED').length,
    unreadNotifications: notifications.filter((item) => !item.read).length,
    traceableListings: listings.filter((item) => item.traceable).length,
    activeShipments: shipments.filter(s => s.status === 'IN_TRANSIT').length,
  }), [listings, orders, notifications, shipments])

  const selectedOrderShipment = useMemo(() => {
    if (!selectedOrderId) return null
    return shipments.find(s => String(s.orderId) === String(selectedOrderId))
  }, [shipments, selectedOrderId])

  useEffect(() => {
    loadWorkspace()
  }, [])

  useEffect(() => {
    if (!scannerOpen) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
        scannerRef.current = null
      }
      return
    }

    const scanner = new Html5QrcodeScanner('retailer-qr-reader', {
      fps: 10,
      qrbox: { width: 220, height: 220 },
      rememberLastUsedCamera: true,
    }, false)

    scannerRef.current = scanner
    scanner.render(
      (decodedText) => {
        setTraceInput(decodedText)
        setSuccess('Đã quét QR thành công.')
        setScannerOpen(false)
      },
      () => {}
    )

    return () => {
      scanner.clear().catch(() => {})
      scannerRef.current = null
    }
  }, [scannerOpen])

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
      const [retailerResult, listingResult, orderResult, shipmentResult, notificationResult] = await Promise.allSettled([
        getMyRetailer(),
        getPublicListings({ page: 0, size: 12, sort, keyword: search, province, certification, productCategory: type }),
        getOrdersV2(),
        getRetailerShipments(),
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
      setSelectedOrderId((prev) => {
        if (prev && orderData.some((item) => String(item.orderId) === String(prev))) return prev
        return String(orderData[0]?.orderId || '')
      })

      const shipmentData = shipmentResult.status === 'fulfilled' && Array.isArray(shipmentResult.value) ? shipmentResult.value : []
      setShipments(shipmentData)

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
      setDepositForm((prev) => ({
        ...prev,
        amount: prev.amount || String(data?.minimumDepositAmount || ''),
      }))
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

  function handleMessageChange(event) {
    const { name, value } = event.target
    setMessageForm((prev) => ({ ...prev, [name]: value }))
  }

  const threadNotifications = notifications.filter((item) => {
    const type = String(item.targetType || '').toUpperCase()
    if (!type) return false
    if (threadFilter === 'ORDER') return type === 'ORDER' && item.targetId === selectedOrderDetail?.orderId
    if (threadFilter === 'CONTRACT') return type === 'CONTRACT'
    return true
  })

  function openScanner() {
    setError('')
    setSuccess('')
    setScannerOpen(true)
  }

  function closeScanner() {
    setScannerOpen(false)
  }

  function openPublicTrace() {
    const trace = traceInput.trim()
    if (!trace) return
    window.open(buildPublicTraceUrl(trace), '_blank')
  }

  function buildPublicTraceUrl(trace) {
    const encoded = encodeURIComponent(trace)
    return `/public/trace?traceCode=${encoded}`
  }

  async function handleTraceImageUpload(event) {
    const file = event.target.files?.[0] || null
    setTraceImageFile(file)
    if (!file) return
    try {
      const decoded = await decodeQrFromImage(file)
      if (decoded) {
        setTraceInput(decoded)
        setSuccess('?? ??c QR t? ?nh th?nh c?ng.')
      } else {
        setError('Kh?ng ??c ???c QR t? ?nh. H?y th? ?nh r? h?n.')
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Kh?ng ??c ???c QR t? ?nh.'))
    }
  }

  async function decodeQrFromImage(file) {
    const dataUrl = await fileToDataUrl(file)
    const image = await loadImage(dataUrl)
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''
    ctx.drawImage(image, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const { jsQR } = await import('jsqr')
    const result = jsQR(imageData.data, canvas.width, canvas.height)
    return result?.data || ''
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = () => reject(new Error('Kh?ng th? ??c file ?nh'))
      reader.readAsDataURL(file)
    })
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error('Kh?ng th? t?i ?nh'))
      image.src = src
    })
  }

  async function handleLicenseUpload(event) {
    event.preventDefault()
    if (!retailer || !licenseFile) return
    setSavingWorkflow(true)
    setError('')
    setSuccess('')
    try {
      const result = await uploadRetailerBusinessLicense(retailer.retailerId, licenseFile)
      setRetailer(result)
      setLicenseFile(null)
      setSuccess('Đã upload giấy phép retailer.')
      await loadWorkspace()
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể upload giấy phép retailer.'))
    } finally {
      setSavingWorkflow(false)
    }
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
      const created = await createOrder({ items: [{ listingId, quantity }] })
      setSuccess(`Đã tạo order #${created.orderId}.`)
      setOrderForm({ ...initialOrderForm, listingId: String(listings[0]?.listingId || '') })
      await loadWorkspace()
      setSelectedOrderId(String(created.orderId))
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tạo order.'))
    } finally {
      setSavingOrder(false)
    }
  }

  async function handlePayDeposit(event) {
    event.preventDefault()
    if (!selectedOrderDetail || savingWorkflow || !selectedOrderDetail.canPayDeposit) return

    const amount = toPositiveNumber(depositForm.amount)
    if (!amount) {
      setError('Số tiền đặt cọc phải hợp lệ.')
      return
    }

    setSavingWorkflow(true)
    setError('')
    setSuccess('')
    try {
      await payOrderDeposit(selectedOrderDetail.orderId, {
        amount,
        method: depositForm.method.trim(),
        transactionRef: depositForm.transactionRef.trim(),
      })
      setSuccess('Đã thanh toán đặt cọc.')
      setDepositForm(initialDepositForm)
      await loadWorkspace()
      await loadOrderDetail(selectedOrderDetail.orderId)
      await loadHistory(selectedOrderDetail.orderId)
    } catch (err) {
      setError(getErrorMessage(err, 'Không thanh toán được đặt cọc.'))
    } finally {
      setSavingWorkflow(false)
    }
  }

  async function handleCancelOrder(event) {
    event.preventDefault()
    if (!selectedOrderDetail || savingWorkflow || !selectedOrderDetail.canCancel) return

    setSavingWorkflow(true)
    setError('')
    setSuccess('')
    try {
      await cancelOrder(selectedOrderDetail.orderId, { reason: cancelForm.reason.trim() })
      setSuccess('Đã hủy đơn hàng.')
      setCancelForm(initialCancelForm)
      await loadWorkspace()
      await loadOrderDetail(selectedOrderDetail.orderId)
      await loadHistory(selectedOrderDetail.orderId)
    } catch (err) {
      setError(getErrorMessage(err, 'Không hủy được đơn hàng.'))
    } finally {
      setSavingWorkflow(false)
    }
  }

  async function handleConfirmDelivery(event) {
    event.preventDefault()
    if (!selectedOrderDetail || savingWorkflow || !selectedOrderDetail.canConfirmDelivery) return

    setSavingWorkflow(true)
    setError('')
    setSuccess('')
    try {
      let proofUrl = deliveryForm.proofImageUrl.trim()
      if (deliveryFile) {
        const uploaded = await uploadDeliveryProofFile(selectedOrderDetail.orderId, deliveryFile)
        proofUrl = uploaded.fileUrl
      }
      await confirmOrderDelivery(selectedOrderDetail.orderId, {
        proofImageUrl: proofUrl,
        note: deliveryForm.note.trim(),
      })
      setSuccess('Đã xác nhận nhận hàng hoàn tất.')
      setDeliveryForm(initialDeliveryForm)
      setDeliveryFile(null)
      await loadWorkspace()
      await loadOrderDetail(selectedOrderDetail.orderId)
      await loadHistory(selectedOrderDetail.orderId)
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

  async function handleSendThreadMessage() {
    if (!selectedOrderDetail) return
    try {
      const contextType = threadFilter === 'CONTRACT' ? 'CONTRACT' : 'ORDER'
      const targetId = contextType === 'ORDER' ? selectedOrderDetail.orderId : (contracts[0]?.contractId || null)
      if (!targetId) return
      await createNotification({
        recipientRole: 'FARM',
        title: messageForm.subject.trim() || 'Trao ??i nghi?p v?',
        message: messageForm.message.trim(),
        notificationType: 'THREAD_MESSAGE',
        targetType: contextType,
        targetId,
      })
      setMessageForm({ subject: '', message: '' })
      setSuccess('?? g?i message theo thread.')
      await loadWorkspace()
    } catch (err) {
      setError(getErrorMessage(err, 'Kh?ng g?i ???c message.'))
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
        relatedEntityId: selectedOrderDetail ? selectedOrderDetail.orderId : null,
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
          <Button onClick={handleCreateReport} disabled={!selectedOrderDetail}>Gửi report</Button>
        </div>
      </div>

      <div className="glass-card top-gap">
        <div className="retailer-panel-header">
          <div>
            <p className="eyebrow">Trace QR</p>
            <h3>Quét QR quy trình mùa vụ</h3>
            <p>Scan bằng camera, dán trace code, hoặc tải ảnh QR rồi mở public trace flow.</p>
          </div>
          <div className="section-actions">
            <Button variant="secondary" onClick={openScanner}>Scan QR</Button>
            <Button variant="secondary" onClick={openPublicTrace} disabled={!traceInput.trim()}>Mở trace</Button>
            <Button variant="secondary" onClick={closeScanner}>Đóng scanner</Button>
          </div>
        </div>
        <div className="form-grid">
          <TextInput label="Trace code" value={traceInput} onChange={(e) => setTraceInput(e.target.value)} placeholder="Dán trace code hoặc quét QR" />
          <label className="field-group">
            <span className="field-label">Upload ảnh QR</span>
            <input className="field-input" type="file" accept="image/*" onChange={handleTraceImageUpload} />
          </label>
          {traceImageFile ? <p>Đã chọn: {traceImageFile.name}</p> : null}
          <p>Nếu cần, chọn ảnh QR rồi mở public trace bằng link bên dưới sau khi nhận diện thủ công.</p>
          {traceInput.trim() ? <a href={`/public/trace?traceCode=${encodeURIComponent(traceInput.trim())}`} target="_blank" rel="noreferrer">Xem trace hiện tại</a> : null}
        </div>
        {scannerOpen ? <div id="retailer-qr-reader" className="top-gap" /> : null}
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
          <p>{summary.traceableListings} listing có trace</p>
        </article>
        <article className="status-card tone-warning">
          <span className="summary-label">Pending orders</span>
          <strong>{summary.pendingOrders}</strong>
          <p>{summary.depositPaidOrders} đơn đã deposit</p>
        </article>
        <article className="status-card">
          <span className="summary-label">Cancelled / notifications</span>
          <strong>{summary.cancelledOrders}</strong>
          <p>{summary.unreadNotifications} thông báo chưa đọc</p>
        </article>
      </div>

      {loading ? <div className="glass-card">Đang tải Retailer Workspace...</div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <article className="glass-card top-gap">
        <div className="retailer-panel-header">
          <div>
            <p className="eyebrow">Farm agreements</p>
            <h3>Hợp đồng với farm</h3>
          </div>
        </div>
        <div className="form-grid">
          {contracts.length === 0 ? <p>Chưa có contract.</p> : contracts.map((item) => (
            <div key={item.contractId} className="business-card">
              <div>
                <strong>{item.farmName}</strong>
                <p>Status: {item.status} • Active: {item.active ? 'Yes' : 'No'}</p>
                <p>Scope: {item.productScope || 'N/A'}</p>
                <p>Rule: {item.agreedPriceRule || 'N/A'}</p>
                <p>Coverage: {item.coverageSummary || 'N/A'}</p>
                <p>Valid: {item.validFrom || 'N/A'} → {item.validTo || 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>
      </article>

      <div className="retailer-workspace-grid top-gap">
        <article className="glass-card retailer-panel retailer-panel-wide">
          <div className="retailer-panel-header">
            <div>
              <p className="eyebrow">Inbox / outbox</p>
              <h3>Trao ??i nghi?p v? Farm ? Retailer</h3>
            </div>
            <div className="section-actions">
              <label className="field-group">
                <span className="field-label">Thread</span>
                <select className="field-input" value={threadFilter} onChange={(e) => setThreadFilter(e.target.value)}>
                  <option value="ORDER">Order thread</option>
                  <option value="CONTRACT">Contract thread</option>
                </select>
              </label>
            </div>
          </div>

          <div className="form-grid">
            <TextInput label="Subject" name="subject" value={messageForm.subject} onChange={handleMessageChange} />
            <TextAreaField label="Message" name="message" value={messageForm.message} onChange={handleMessageChange} />
            <Button onClick={handleSendThreadMessage} disabled={!messageForm.message.trim()}>G?i cho farm</Button>
          </div>

          <div className="form-grid top-gap">
            {threadNotifications.length === 0 ? <p>Ch?a c? tin nh?n trong thread.</p> : threadNotifications.map((item) => (
              <div key={item.notificationId} className="business-card">
                <strong>{item.title}</strong>
                <p>{item.message}</p>
                <p>{item.senderName || 'System'} ? {formatDateTime(item.createdAt)}</p>
              </div>
            ))}
          </div>
        </article>
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
              <p className="eyebrow">Selected order</p>
              <h3>Detail + history + action guard</h3>
            </div>
          </div>

          {selectedOrderDetail ? (
            <div className="form-grid">
              <div className="business-card retailer-order-card is-selected">
                <div>
                  <strong>Order #{selectedOrderDetail.orderId}</strong>
                  <p><StatusBadge value={selectedOrderDetail.status} /> <StatusBadge value={selectedOrderDetail.paymentStatus} /></p>
                  <p>Retailer: {selectedOrderDetail.retailerName || selectedOrderDetail.retailerId}</p>
                  <p>Farm: {selectedOrderDetail.farmName || selectedOrderDetail.farmId}</p>
                  <p>Total: {formatCurrency(selectedOrderDetail.totalAmount)}</p>
                  <p>Minimum deposit: {formatCurrency(selectedOrderDetail.minimumDepositAmount)}</p>
                  <p>Farm decision: {selectedOrderDetail.farmDecisionNote || (selectedOrderDetail.status === 'PENDING' ? 'Đang chờ farm xử lý buy request' : 'Chưa có ghi chú')}</p>
                  <p>Deposit actual: {formatCurrency(selectedOrderDetail.depositAmount)}</p>
                  <p>Allowed actions: {selectedOrderDetail.allowedActions?.join(', ') || 'Không có'}</p>
                  <p>Created: {formatDateTime(selectedOrderDetail.createdAt)}</p>
                </div>
              </div>

              <div className="form-grid">
                <h4>Order items</h4>
                {selectedOrderDetail.items?.map((item, index) => (
                  <div key={`${item.listingId}-${index}`} className="business-card">
                    <div>
                      <strong>{item.title}</strong>
                      <p>Batch: {item.batchCode || 'N/A'}</p>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: {formatCurrency(item.price)}</p>
                      <p>Subtotal: {formatCurrency(item.subTotal)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedOrderShipment && (
                <div className="form-grid top-gap">
                  <h4>Shipment tracking (Live timeline)</h4>
                  <div className="business-card tone-success">
                    <div className="execution-header">
                      <strong>Shipment #{selectedOrderShipment.shipmentId}</strong>
                      <span className={`status-pill status-${selectedOrderShipment.status.toLowerCase()}`}>{selectedOrderShipment.status}</span>
                    </div>
                    <p>Driver: {selectedOrderShipment.driverName} • Vehicle: {selectedOrderShipment.vehiclePlateNo}</p>
                    <p>Batch: {selectedOrderShipment.batchCode || 'N/A'} • Trace: {selectedOrderShipment.traceCode || 'N/A'}</p>
                    <p>Pickup confirmed: {formatDateTime(selectedOrderShipment.pickupConfirmedAt)} • Delivered: {formatDateTime(selectedOrderShipment.deliveryConfirmedAt)}</p>

                    {selectedOrderShipment.reports?.length ? (
                      <div className="top-gap">
                        <h5>Driver reports / issues</h5>
                        <div className="form-grid">
                          {selectedOrderShipment.reports.map((report) => (
                            <div key={report.reportId} className="business-card">
                              <strong>{report.issueType}</strong>
                              <p>{report.description}</p>
                              <p>Severity: {report.severity || 'N/A'} • Status: {report.status || 'OPEN'}</p>
                              <p>{formatDateTime(report.createdAt)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    
                    <div className="timeline-section top-gap">
                      <div className="timeline-list">
                        {selectedOrderShipment.logs?.length === 0 ? <p>Chưa có thông tin lộ trình.</p> : selectedOrderShipment.logs.map((log) => (
                          <div key={log.logId} className="timeline-item">
                            <span className="timeline-time">{formatDateTime(log.recordedAt)}</span>
                            <div className="timeline-content">
                              <strong>{log.type}</strong>
                              <p>{log.note}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

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

              <div className="form-grid">
                <h4>Proof + settlement</h4>
                <div className="business-card">
                  <div>
                    <p>Deposit paid at: {formatDateTime(selectedOrderDetail.depositPaidAt)}</p>
                    <p>Deposit released at: {formatDateTime(selectedOrderDetail.depositReleasedAt)}</p>
                    <p>Release note: {selectedOrderDetail.depositReleaseNote || 'Chưa có'}</p>
                    <p>Shipping proof: {selectedOrderDetail.shippingProofImageUrl || 'Chưa có'}</p>
                    <p>Delivery proof: {selectedOrderDetail.deliveryProofImageUrl || 'Chưa có'}</p>
                    <p>Cancellation: {selectedOrderDetail.cancellationReason || 'Không có'}</p>
                    <p>Cancelled at: {formatDateTime(selectedOrderDetail.cancelledAt)}</p>
                    <p>Delivery confirmed at: {formatDateTime(selectedOrderDetail.deliveryConfirmedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : <p>Chọn một order để xem detail khép kín.</p>}
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
            <TextInput label="Type / category" name="type" value={type} onChange={(event) => setType(event.target.value)} />
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
                <option value="quantityAvailable,desc">Nhiều hàng nhất</option>
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
                  <p>Category: {item.productCategory || 'N/A'} • Type: {item.farmType || 'N/A'}</p>
                  <p>Certification: {item.certificationStatus || 'Đang cập nhật'}</p>
                  <p>Harvest: {formatDate(item.harvestDate)} • Expiry: {formatDate(item.expiryDate)}</p>
                  <p>Trace: {item.traceCode || 'N/A'} • Season: {item.seasonCode || 'N/A'}</p>
                  <p>Retailer readiness: {item.availableForRetailer ? 'Sẵn sàng mua' : 'Cần rà soát thêm'}</p>
                </div>
                <div className="inline-actions">
                  <Button variant="secondary" onClick={() => setOrderForm((prev) => ({ ...prev, listingId: String(item.listingId) }))}>Chọn để đặt</Button>
                  <Button variant="secondary" onClick={() => window.open(item.traceCode ? `/public/trace?traceCode=${encodeURIComponent(item.traceCode)}` : `/public/trace?batchId=${item.batchId}`, '_blank')}>Xem trace</Button>
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
                    <option key={item.listingId} value={item.listingId}>{item.title} • {formatCurrency(item.price)} • {item.quantityAvailable} {item.unit || 'kg'}</option>
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
              <p className="eyebrow">Valid actions only</p>
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
                #{order.orderId} • {order.status} • {order.paymentStatus}
              </button>
            ))}
          </div>

          <form className="form-grid top-gap" onSubmit={handlePayDeposit}>
            <h4>Thanh toán đặt cọc</h4>
            <p>Mức tối thiểu: {formatCurrency(selectedOrderDetail?.minimumDepositAmount)}</p>
            <p>Retailer chỉ được đặt cọc sau khi farm xác nhận request. Nếu order còn PENDING, hãy chờ farm review trước.</p>
            <TextInput label="Số tiền" name="amount" type="number" min="1" value={depositForm.amount} onChange={handleDepositChange} required />
            <TextInput label="Phương thức" name="method" value={depositForm.method} onChange={handleDepositChange} required />
            <TextInput label="Mã giao dịch" name="transactionRef" value={depositForm.transactionRef} onChange={handleDepositChange} required />
            <Button type="submit" disabled={savingWorkflow || !selectedOrderDetail?.canPayDeposit}>Thanh toán đặt cọc</Button>
          </form>

          <form className="form-grid top-gap" onSubmit={handleCancelOrder}>
            <h4>Hủy đơn</h4>
            <TextAreaField label="Lý do hủy" name="reason" value={cancelForm.reason} onChange={handleCancelChange} />
            <Button type="submit" variant="secondary" disabled={savingWorkflow || !selectedOrderDetail?.canCancel}>Hủy đơn hàng</Button>
          </form>

          <form className="form-grid top-gap" onSubmit={handleConfirmDelivery}>
            <h4>Xác nhận nhận hàng</h4>
            <TextInput label="Proof image URL" name="proofImageUrl" value={deliveryForm.proofImageUrl} onChange={handleDeliveryChange} />
            <label className="form-field">
              <span className="form-label">Hoặc chọn file proof</span>
              <input className="form-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setDeliveryFile(event.target.files?.[0] || null)} />
            </label>
            <TextAreaField label="Ghi chú" name="note" value={deliveryForm.note} onChange={handleDeliveryChange} />
            {selectedOrderDetail?.shippingProofImageUrl ? <img className="retailer-proof-preview" src={selectedOrderDetail.shippingProofImageUrl} alt="Shipping proof" /> : null}
            <Button type="submit" disabled={savingWorkflow || !selectedOrderDetail?.canConfirmDelivery}>Xác nhận đã nhận hàng</Button>
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
                  <p>Farm review: {order.farmDecisionNote || (order.status === 'PENDING' ? 'Đang chờ farm xác nhận' : 'Không có')}</p>
                  <p>Minimum deposit: {formatCurrency(order.minimumDepositAmount)}</p>
                  <p>Allowed: {order.allowedActions?.join(', ') || 'Không có'}</p>
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
