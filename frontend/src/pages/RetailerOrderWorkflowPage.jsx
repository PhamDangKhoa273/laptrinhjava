import { useEffect, useState } from 'react'
import { Button } from '../components/Button.jsx'
import { TextInput } from '../components/TextInput.jsx'
import { TextAreaField } from '../components/TextAreaField.jsx'
import { uploadDeliveryProofFile } from '../services/mediaService.js'
import { cancelOrder, confirmOrderDelivery, createReport, getMyNotifications, getOrdersV2, markNotificationRead, payOrderDeposit } from '../services/workflowService.js'
import { getErrorMessage } from '../utils/helpers.js'

const initialDepositForm = { amount: '', method: 'BANK_TRANSFER', transactionRef: '' }
const initialCancelForm = { reason: '' }
const initialDeliveryForm = { proofImageUrl: '', note: '' }

export function RetailerOrderWorkflowPage() {
  const [orders, setOrders] = useState([])
  const [notifications, setNotifications] = useState([])
  const [depositForm, setDepositForm] = useState(initialDepositForm)
  const [cancelForm, setCancelForm] = useState(initialCancelForm)
  const [deliveryForm, setDeliveryForm] = useState(initialDeliveryForm)
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deliveryFile, setDeliveryFile] = useState(null)

  async function loadData() {
    try {
      setLoading(true)
      const [orderData, notificationData] = await Promise.all([getOrdersV2(), getMyNotifications()])
      setOrders(Array.isArray(orderData) ? orderData : [])
      setNotifications(Array.isArray(notificationData) ? notificationData : [])
      if (!selectedOrderId && Array.isArray(orderData) && orderData.length > 0) {
        setSelectedOrderId(String(orderData[0].orderId))
      }
      setError('')
    } catch (err) {
      setError(getErrorMessage(err, 'Không tải được order workflow.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const selectedOrder = orders.find((item) => String(item.orderId) === String(selectedOrderId))

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

  async function handlePayDeposit(event) {
    event.preventDefault()
    if (!selectedOrder) return
    try {
      setSaving(true)
      await payOrderDeposit(selectedOrder.orderId, {
        amount: Number(depositForm.amount),
        method: depositForm.method.trim(),
        transactionRef: depositForm.transactionRef.trim(),
      })
      setSuccess('Đã thanh toán đặt cọc.')
      setDepositForm(initialDepositForm)
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Không thanh toán được đặt cọc.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleCancelOrder(event) {
    event.preventDefault()
    if (!selectedOrder) return
    try {
      setSaving(true)
      await cancelOrder(selectedOrder.orderId, { reason: cancelForm.reason.trim() })
      setSuccess('Đã hủy đơn hàng.')
      setCancelForm(initialCancelForm)
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Không hủy được đơn hàng.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleConfirmDelivery(event) {
    event.preventDefault()
    if (!selectedOrder) return
    try {
      setSaving(true)
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
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Không xác nhận được giao hàng.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleMarkRead(notificationId) {
    try {
      await markNotificationRead(notificationId)
      await loadData()
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
    <section className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Retailer order workflow</p>
          <h2>Đặt cọc, hủy đơn và xác nhận giao hàng</h2>
          <p>Khóa phần nghiệp vụ retailer để flow phase 4 dùng được thật từ UI.</p>
        </div>
        <div className="section-actions">
          <Button variant="secondary" onClick={loadData} disabled={loading}>Làm mới</Button>
          <Button onClick={handleCreateReport} disabled={!selectedOrder}>Gửi report</Button>
        </div>
      </div>

      {loading ? <div className="glass-card">Đang tải dữ liệu đơn hàng...</div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <div className="content-grid">
        <article className="glass-card">
          <h3>Danh sách đơn hàng</h3>
          {orders.length === 0 ? <p>Chưa có đơn hàng.</p> : null}
          <div className="form-grid">
            {orders.map((order) => (
              <div key={order.orderId} className={`business-card ${String(order.orderId) === String(selectedOrderId) ? 'is-selected' : ''}`}>
                <div>
                  <strong>Order #{order.orderId}</strong>
                  <p>Trạng thái: {order.status}</p>
                  <p>Thanh toán: {order.paymentStatus}</p>
                  <p>Tổng tiền: {order.totalAmount}</p>
                </div>
                <Button variant="secondary" onClick={() => setSelectedOrderId(String(order.orderId))}>Chọn</Button>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-card">
          <h3>Thông tin xử lý</h3>
          {selectedOrder ? (
            <ul className="feature-list">
              <li>Order ID: {selectedOrder.orderId}</li>
              <li>Status: {selectedOrder.status}</li>
              <li>Payment: {selectedOrder.paymentStatus}</li>
              <li>Delivery proof: {selectedOrder.deliveryProofImageUrl || 'Chưa có'}</li>
              <li>Shipping proof: {selectedOrder.shippingProofImageUrl || 'Chưa có'}</li>
              <li>Cancellation reason: {selectedOrder.cancellationReason || 'Không có'}</li>
            </ul>
          ) : <p>Chọn một order để thao tác.</p>}
        </article>
      </div>

      <div className="content-grid top-gap">
        <article className="glass-card">
          <h3>Thanh toán đặt cọc</h3>
          <form className="form-grid" onSubmit={handlePayDeposit}>
            <TextInput label="Số tiền" name="amount" value={depositForm.amount} onChange={handleDepositChange} required />
            <TextInput label="Phương thức" name="method" value={depositForm.method} onChange={handleDepositChange} required />
            <TextInput label="Mã giao dịch" name="transactionRef" value={depositForm.transactionRef} onChange={handleDepositChange} required />
            <Button type="submit" disabled={saving || !selectedOrder}>Thanh toán đặt cọc</Button>
          </form>
        </article>

        <article className="glass-card">
          <h3>Hủy đơn</h3>
          <form className="form-grid" onSubmit={handleCancelOrder}>
            <TextAreaField label="Lý do hủy" name="reason" value={cancelForm.reason} onChange={handleCancelChange} required />
            <Button type="submit" disabled={saving || !selectedOrder}>Hủy đơn hàng</Button>
          </form>
        </article>
      </div>

      <div className="content-grid top-gap">
        <article className="glass-card">
          <h3>Xác nhận giao hàng</h3>
          <form className="form-grid" onSubmit={handleConfirmDelivery}>
            <TextInput label="Proof image URL" name="proofImageUrl" value={deliveryForm.proofImageUrl} onChange={handleDeliveryChange} required />
            <label className="form-field">
              <span className="form-label">Hoặc chọn file proof</span>
              <input className="form-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setDeliveryFile(event.target.files?.[0] || null)} />
            </label>
            <TextAreaField label="Ghi chú" name="note" value={deliveryForm.note} onChange={handleDeliveryChange} />
            <Button type="submit" disabled={saving || !selectedOrder}>Xác nhận đã nhận hàng</Button>
          </form>
        </article>

        <article className="glass-card">
          <h3>Notification</h3>
          {notifications.length === 0 ? <p>Chưa có notification.</p> : null}
          <div className="form-grid">
            {notifications.map((item) => (
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
