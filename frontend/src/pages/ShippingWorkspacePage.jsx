import { useEffect, useMemo, useState } from 'react'
import '../shipping-workspace.css'
import '../transaction-hardening.css'
import { Button } from '../components/Button.jsx'
import { TextAreaField } from '../components/TextAreaField.jsx'
import { TextInput } from '../components/TextInput.jsx'
import { createDriver, createVehicle, getDrivers, getVehicles, updateDriver, updateVehicle } from '../services/businessService'
import { uploadShippingProofFile } from '../services/mediaService.js'
import { getMyNotifications, getOrderById, getOrderStatusHistory, getOrdersV2, markNotificationRead, updateOrderStatus, uploadShippingProof } from '../services/workflowService.js'
import { getErrorMessage } from '../utils/helpers'

const initialDriverForm = {
  driverCode: '',
  licenseNo: '',
  userId: '',
  status: 'ACTIVE',
}

const initialVehicleForm = {
  plateNo: '',
  vehicleType: '',
  capacity: '',
  status: 'ACTIVE',
}

const initialStatusForm = {
  status: 'SHIPPING',
  reason: '',
}

const initialProofForm = {
  imageUrl: '',
  note: '',
}

const orderStatuses = ['SHIPPING', 'DELIVERED']

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

export function ShippingWorkspacePage() {
  const [drivers, setDrivers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [orders, setOrders] = useState([])
  const [notifications, setNotifications] = useState([])
  const [history, setHistory] = useState([])
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null)
  const [driverForm, setDriverForm] = useState(initialDriverForm)
  const [vehicleForm, setVehicleForm] = useState(initialVehicleForm)
  const [statusForm, setStatusForm] = useState(initialStatusForm)
  const [proofForm, setProofForm] = useState(initialProofForm)
  const [proofFile, setProofFile] = useState(null)
  const [selectedDriverId, setSelectedDriverId] = useState('')
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingDriver, setSavingDriver] = useState(false)
  const [savingVehicle, setSavingVehicle] = useState(false)
  const [savingOrder, setSavingOrder] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const selectedOrder = useMemo(
    () => orders.find((item) => String(item.orderId) === String(selectedOrderId)) || null,
    [orders, selectedOrderId],
  )

  const summary = useMemo(() => ({
    totalDrivers: drivers.length,
    totalVehicles: vehicles.length,
    shippingOrders: orders.filter((item) => item.status === 'SHIPPING').length,
    unreadNotifications: notifications.filter((item) => !item.read).length,
  }), [drivers, vehicles, orders, notifications])

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
      const [driverData, vehicleData, orderData, notificationData] = await Promise.all([
        getDrivers(),
        getVehicles(),
        getOrdersV2(),
        getMyNotifications(),
      ])
      setDrivers(Array.isArray(driverData) ? driverData : [])
      setVehicles(Array.isArray(vehicleData) ? vehicleData : [])
      const safeOrders = Array.isArray(orderData) ? orderData : []
      setOrders(safeOrders)
      setNotifications(Array.isArray(notificationData) ? notificationData : [])
      if (!selectedOrderId && safeOrders.length > 0) {
        setSelectedOrderId(String(safeOrders[0].orderId))
      }
      setError('')
    } catch (err) {
      setError(getErrorMessage(err, 'Không tải được logistics workspace.'))
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

  function handleDriverChange(event) {
    const { name, value } = event.target
    setDriverForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleVehicleChange(event) {
    const { name, value } = event.target
    setVehicleForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleStatusChange(event) {
    const { name, value } = event.target
    setStatusForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleProofChange(event) {
    const { name, value } = event.target
    setProofForm((prev) => ({ ...prev, [name]: value }))
  }

  function fillDriver(driver) {
    setSelectedDriverId(String(driver.driverId))
    setDriverForm({
      driverCode: driver.driverCode || '',
      licenseNo: driver.licenseNo || '',
      userId: String(driver.userId || ''),
      status: driver.status || 'ACTIVE',
    })
  }

  function fillVehicle(vehicle) {
    setSelectedVehicleId(String(vehicle.vehicleId))
    setVehicleForm({
      plateNo: vehicle.plateNo || '',
      vehicleType: vehicle.vehicleType || '',
      capacity: vehicle.capacity || '',
      status: vehicle.status || 'ACTIVE',
    })
  }

  async function submitDriver(event) {
    event.preventDefault()
    if (savingDriver) return

    setSavingDriver(true)
    setError('')
    setSuccess('')
    try {
      if (selectedDriverId) {
        await updateDriver(Number(selectedDriverId), {
          licenseNo: driverForm.licenseNo.trim(),
          status: driverForm.status.trim(),
        })
      } else {
        await createDriver({
          driverCode: driverForm.driverCode.trim(),
          licenseNo: driverForm.licenseNo.trim(),
          userId: toPositiveNumber(driverForm.userId),
          status: driverForm.status.trim(),
        })
      }
      setSuccess(selectedDriverId ? 'Đã cập nhật driver.' : 'Đã tạo driver mới.')
      setSelectedDriverId('')
      setDriverForm(initialDriverForm)
      await loadWorkspace()
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể lưu driver.'))
    } finally {
      setSavingDriver(false)
    }
  }

  async function submitVehicle(event) {
    event.preventDefault()
    if (savingVehicle) return

    setSavingVehicle(true)
    setError('')
    setSuccess('')
    try {
      if (selectedVehicleId) {
        await updateVehicle(Number(selectedVehicleId), {
          vehicleType: vehicleForm.vehicleType.trim(),
          capacity: Number(vehicleForm.capacity),
          status: vehicleForm.status.trim(),
        })
      } else {
        await createVehicle({
          plateNo: vehicleForm.plateNo.trim(),
          vehicleType: vehicleForm.vehicleType.trim(),
          capacity: Number(vehicleForm.capacity),
          status: vehicleForm.status.trim(),
        })
      }
      setSuccess(selectedVehicleId ? 'Đã cập nhật vehicle.' : 'Đã tạo vehicle mới.')
      setSelectedVehicleId('')
      setVehicleForm(initialVehicleForm)
      await loadWorkspace()
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể lưu vehicle.'))
    } finally {
      setSavingVehicle(false)
    }
  }

  async function handleUpdateOrderStatus(event) {
    event.preventDefault()
    if (!selectedOrder || savingOrder) return

    setSavingOrder(true)
    setError('')
    setSuccess('')
    try {
      await updateOrderStatus(selectedOrder.orderId, {
        status: statusForm.status,
        reason: statusForm.reason.trim(),
      })
      setSuccess('Đã cập nhật trạng thái order.')
      setStatusForm(initialStatusForm)
      await loadWorkspace()
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể cập nhật trạng thái order.'))
    } finally {
      setSavingOrder(false)
    }
  }

  async function handleSubmitProof(event) {
    event.preventDefault()
    if (!selectedOrder || savingOrder) return

    setSavingOrder(true)
    setError('')
    setSuccess('')
    try {
      let imageUrl = proofForm.imageUrl.trim()
      if (proofFile) {
        const uploaded = await uploadShippingProofFile(selectedOrder.orderId, proofFile)
        imageUrl = uploaded.fileUrl
      }
      await uploadShippingProof(selectedOrder.orderId, {
        imageUrl,
        note: proofForm.note.trim(),
      })
      setSuccess('Đã cập nhật proof vận chuyển.')
      setProofForm(initialProofForm)
      setProofFile(null)
      await loadWorkspace()
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể cập nhật proof vận chuyển.'))
    } finally {
      setSavingOrder(false)
    }
  }

  async function handleMarkRead(notificationId) {
    try {
      await markNotificationRead(notificationId)
      await loadWorkspace()
    } catch (err) {
      setError(getErrorMessage(err, 'Không đánh dấu notification được.'))
    }
  }

  return (
    <section className="page-section shipping-workspace-shell">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Shipping workspace</p>
          <h2>Logistics control surface</h2>
          <p>Quản lý driver, vehicle, shipping proof và cập nhật trạng thái đơn hàng trong cùng một workspace vận hành.</p>
        </div>
        <div className="section-actions">
          <Button variant="secondary" onClick={loadWorkspace} disabled={loading}>Làm mới</Button>
        </div>
      </div>

      <div className="feature-grid">
        <article className="status-card tone-success">
          <span className="summary-label">Drivers</span>
          <strong>{summary.totalDrivers}</strong>
          <p>Nguồn lực tài xế hiện có</p>
        </article>
        <article className="status-card tone-primary">
          <span className="summary-label">Vehicles</span>
          <strong>{summary.totalVehicles}</strong>
          <p>Phương tiện đang quản lý</p>
        </article>
        <article className="status-card tone-warning">
          <span className="summary-label">Shipping orders</span>
          <strong>{summary.shippingOrders}</strong>
          <p>Đơn đang ở trạng thái SHIPPING</p>
        </article>
        <article className="status-card">
          <span className="summary-label">Notifications</span>
          <strong>{summary.unreadNotifications}</strong>
          <p>Thông báo logistics chưa đọc</p>
        </article>
      </div>

      {loading ? <div className="glass-card">Đang tải logistics workspace...</div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <div className="glass-card top-gap shipping-panel">
        <div className="shipping-panel-header">
          <div>
            <p className="eyebrow">Transaction hardening</p>
            <h3>Logistics visibility snapshot</h3>
            <p>Cho logistics nhìn rõ payment readiness, proof coverage và trace liên quan tới order đang chạy.</p>
          </div>
        </div>
        <div className="transaction-kpi-grid">
          <div className="transaction-kpi-card">
            <strong>{orders.filter((item) => item.paymentStatus === 'DEPOSIT_PAID').length}</strong>
            <p>Đơn đã có deposit</p>
          </div>
          <div className="transaction-kpi-card">
            <strong>{orders.filter((item) => item.status === 'SHIPPING').length}</strong>
            <p>Đơn đang SHIPPING</p>
          </div>
          <div className="transaction-kpi-card">
            <strong>{orders.filter((item) => item.status === 'DELIVERED').length}</strong>
            <p>Đơn đã DELIVERED</p>
          </div>
          <div className="transaction-kpi-card">
            <strong>{orders.filter((item) => item.shippingProofImageUrl).length}</strong>
            <p>Đơn có shipping proof</p>
          </div>
        </div>
        <div className="transaction-audit-grid top-gap">
          <div className="transaction-issue-list">
            <div className="transaction-issue-card">
              <strong>Shipping without deposit</strong>
              <p>{orders.filter((item) => item.status === 'SHIPPING' && item.paymentStatus !== 'DEPOSIT_PAID').length} đơn đã SHIPPING nhưng payment chưa DEPOSIT_PAID.</p>
            </div>
            <div className="transaction-issue-card">
              <strong>Delivered without shipping proof</strong>
              <p>{orders.filter((item) => item.status === 'DELIVERED' && !item.shippingProofImageUrl).length} đơn DELIVERED nhưng chưa có shipping proof.</p>
            </div>
          </div>
          <div className="transaction-issue-list">
            <div className="transaction-issue-card">
              <strong>Retailer confirmation gap</strong>
              <p>{orders.filter((item) => item.status === 'DELIVERED' && !item.deliveryProofImageUrl).length} đơn DELIVERED nhưng retailer chưa confirm proof nhận hàng.</p>
            </div>
            <div className="transaction-issue-card">
              <strong>Trace gap</strong>
              <p>{orders.filter((item) => item.items?.some((orderItem) => !orderItem.batchCode)).length} order item chưa hiện batchCode để đối soát trace.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="shipping-workspace-grid top-gap">
        <article className="glass-card shipping-panel shipping-panel-wide">
          <div className="shipping-panel-header">
            <div>
              <p className="eyebrow">Logistics resources</p>
              <h3>Driver và vehicle management</h3>
            </div>
          </div>

          <div className="content-grid">
            <article className="role-section compact">
              <h4>{selectedDriverId ? 'Cập nhật driver' : 'Tạo driver'}</h4>
              <form className="form-grid" onSubmit={submitDriver}>
                <div className="grid-two">
                  <TextInput label="Driver code" name="driverCode" value={driverForm.driverCode} onChange={handleDriverChange} disabled={Boolean(selectedDriverId)} required />
                  <TextInput label="License number" name="licenseNo" value={driverForm.licenseNo} onChange={handleDriverChange} required />
                </div>
                <div className="grid-two">
                  <TextInput label="Target user ID" name="userId" value={driverForm.userId} onChange={handleDriverChange} disabled={Boolean(selectedDriverId)} required />
                  <TextInput label="Status" name="status" value={driverForm.status} onChange={handleDriverChange} />
                </div>
                <Button type="submit" disabled={savingDriver}>{savingDriver ? 'Đang lưu...' : selectedDriverId ? 'Cập nhật driver' : 'Tạo driver'}</Button>
              </form>

              <div className="form-grid top-gap">
                {drivers.length === 0 ? <p>Chưa có driver.</p> : drivers.map((driver) => (
                  <div key={driver.driverId} className="business-card">
                    <div>
                      <strong>{driver.driverCode}</strong>
                      <p>License: {driver.licenseNo}</p>
                      <p>User ID: {driver.userId}</p>
                      <p>Status: {driver.status}</p>
                    </div>
                    <Button variant="secondary" onClick={() => fillDriver(driver)}>Sửa</Button>
                  </div>
                ))}
              </div>
            </article>

            <article className="role-section compact">
              <h4>{selectedVehicleId ? 'Cập nhật vehicle' : 'Tạo vehicle'}</h4>
              <form className="form-grid" onSubmit={submitVehicle}>
                <div className="grid-two">
                  <TextInput label="Plate number" name="plateNo" value={vehicleForm.plateNo} onChange={handleVehicleChange} disabled={Boolean(selectedVehicleId)} required />
                  <TextInput label="Vehicle type" name="vehicleType" value={vehicleForm.vehicleType} onChange={handleVehicleChange} required />
                </div>
                <div className="grid-two">
                  <TextInput label="Capacity" name="capacity" type="number" min="1" value={vehicleForm.capacity} onChange={handleVehicleChange} required />
                  <TextInput label="Status" name="status" value={vehicleForm.status} onChange={handleVehicleChange} />
                </div>
                <Button type="submit" disabled={savingVehicle}>{savingVehicle ? 'Đang lưu...' : selectedVehicleId ? 'Cập nhật vehicle' : 'Tạo vehicle'}</Button>
              </form>

              <div className="form-grid top-gap">
                {vehicles.length === 0 ? <p>Chưa có vehicle.</p> : vehicles.map((vehicle) => (
                  <div key={vehicle.vehicleId} className="business-card">
                    <div>
                      <strong>{vehicle.plateNo}</strong>
                      <p>Type: {vehicle.vehicleType}</p>
                      <p>Capacity: {vehicle.capacity}</p>
                      <p>Status: {vehicle.status}</p>
                    </div>
                    <Button variant="secondary" onClick={() => fillVehicle(vehicle)}>Sửa</Button>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </article>

        <article className="glass-card shipping-panel">
          <div className="shipping-panel-header">
            <div>
              <p className="eyebrow">Notifications</p>
              <h3>Thông báo logistics</h3>
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
                  {!item.read ? <Button variant="secondary" onClick={() => handleMarkRead(item.notificationId)}>Đọc</Button> : null}
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="shipping-workspace-grid top-gap">
        <article className="glass-card shipping-panel shipping-panel-wide">
          <div className="shipping-panel-header">
            <div>
              <p className="eyebrow">Order handling</p>
              <h3>Shipping order lifecycle</h3>
              <p>Logistics có thể chọn order, upload proof, và cập nhật trạng thái SHIPPING/DELIVERED.</p>
            </div>
          </div>

          <div className="shipping-chip-row">
            {orders.length === 0 ? <p>Chưa có order.</p> : orders.map((order) => (
              <button
                key={order.orderId}
                type="button"
                className={`shipping-chip ${String(order.orderId) === String(selectedOrderId) ? 'active' : ''}`}
                onClick={() => setSelectedOrderId(String(order.orderId))}
              >
                #{order.orderId} • {order.status}
              </button>
            ))}
          </div>

          <div className="form-grid top-gap">
            {orders.length === 0 ? <p>Chưa có dữ liệu order.</p> : orders.map((order) => (
              <div key={order.orderId} className={`business-card shipping-order-card ${String(order.orderId) === String(selectedOrderId) ? 'is-selected' : ''}`}>
                <div>
                  <strong>Order #{order.orderId}</strong>
                  <p>Status: {order.status} • Payment: {order.paymentStatus}</p>
                  <p>Total: {formatCurrency(order.totalAmount)}</p>
                  <p>Shipping proof: {order.shippingProofImageUrl || 'Chưa có'}</p>
                </div>
                <Button variant="secondary" onClick={() => setSelectedOrderId(String(order.orderId))}>Chọn</Button>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-card shipping-panel">
          <div className="shipping-panel-header">
            <div>
              <p className="eyebrow">Selected order</p>
              <h3>Điều phối vận chuyển</h3>
            </div>
          </div>

          {selectedOrder ? (
            <div className="form-grid">
              <div className="business-card shipping-order-card is-selected">
                <div>
                  <strong>Order #{selectedOrder.orderId}</strong>
                  <p>Status: {selectedOrder.status}</p>
                  <p>Payment: {selectedOrder.paymentStatus}</p>
                  <p>Total: {formatCurrency(selectedOrder.totalAmount)}</p>
                  <p>Delivery proof: {selectedOrder.deliveryProofImageUrl || 'Chưa có'}</p>
                </div>
              </div>

              <form className="form-grid" onSubmit={handleUpdateOrderStatus}>
                <h4>Cập nhật trạng thái</h4>
                <label className="field-group">
                  <span className="field-label">Status</span>
                  <select className="field-input" name="status" value={statusForm.status} onChange={handleStatusChange}>
                    {orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </label>
                <TextAreaField label="Reason" name="reason" value={statusForm.reason} onChange={handleStatusChange} />
                <Button type="submit" disabled={savingOrder}>Cập nhật trạng thái</Button>
              </form>

              <form className="form-grid" onSubmit={handleSubmitProof}>
                <h4>Upload shipping proof</h4>
                <TextInput label="Image URL" name="imageUrl" value={proofForm.imageUrl} onChange={handleProofChange} />
                <label className="form-field">
                  <span className="form-label">Hoặc chọn file proof</span>
                  <input className="form-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setProofFile(event.target.files?.[0] || null)} />
                </label>
                <TextAreaField label="Ghi chú" name="note" value={proofForm.note} onChange={handleProofChange} />
                {selectedOrder.shippingProofImageUrl ? <img className="shipping-proof-preview" src={selectedOrder.shippingProofImageUrl} alt="Shipping proof" /> : null}
                <Button type="submit" disabled={savingOrder}>Cập nhật proof</Button>
              </form>

              <div className="form-grid">
                <h4>Status history</h4>
                {history.length === 0 ? <p>Chưa có lịch sử trạng thái.</p> : history.map((item) => (
                  <div key={item.historyId} className="business-card">
                    <div>
                      <strong>{item.previousStatus || 'N/A'} → {item.newStatus}</strong>
                      <p>{item.reason || 'Không có ghi chú'}</p>
                      <p>{formatDateTime(item.changedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : <p>Chọn một order để thao tác.</p>}
        </article>
      </div>
    </section>
  )
}
