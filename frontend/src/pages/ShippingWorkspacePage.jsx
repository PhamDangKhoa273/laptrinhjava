import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { changePassword } from '../services/authService.js'
import '../shipping-workspace.css'
import '../transaction-hardening.css'
<<<<<<< Updated upstream
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
=======
import { createDriver, createDriverWithUser, createVehicle, deleteDriver, deleteVehicle, getDrivers, getUsers, getVehicles, updateDriver, updateVehicle, createNotification } from '../services/businessService'
import { createReport, createShipment, getEligibleShipmentOrders, getMyNotifications, getShipmentReportsForReview, getShipments, markNotificationRead, updateShipmentStatus } from '../services/workflowService.js'
import { getErrorMessage } from '../utils/helpers'

const initialDriverForm = { driverCode: '', licenseNo: '', userId: '', status: 'ACTIVE', fullName: '', email: '', password: '' }
const initialVehicleForm = { plateNo: '', vehicleType: '', capacity: '', status: 'ACTIVE' }
const initialShipmentForm = { orderId: '', driverId: '', vehicleId: '', note: '' }
const initialShipmentStatusForm = { status: 'ASSIGNED', note: '' }
const initialReportForm = { title: '', description: '', severity: 'LOW' }
const initialNotificationForm = { recipientRole: 'FARM', title: '', message: '' }
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
  const [savingOrder, setSavingOrder] = useState(false)
=======
  const [savingReport, setSavingReport] = useState(false)
  const [savingNotification, setSavingNotification] = useState(false)
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
      const [driverData, vehicleData, orderData, notificationData] = await Promise.all([
        getDrivers(),
        getVehicles(),
        getOrdersV2(),
        getMyNotifications(),
      ])
=======
      const [driverData, vehicleData, eligibleData, shipmentData, reportData, notificationData, userData] = await Promise.all([getDrivers(), getVehicles(), getEligibleShipmentOrders(), getShipments(), getShipmentReportsForReview(), getMyNotifications(), getUsers('DRIVER')])
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream

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
=======
  function change(setter) { return (event) => { const { name, value } = event.target; setter((prev) => ({ ...prev, [name]: value })) } }
  async function submitShipment(event) { event.preventDefault(); setSavingShipment(true); setError(''); setSuccess(''); try { const created = await createShipment({ orderId: Number(shipmentForm.orderId), driverId: toPositiveNumber(shipmentForm.driverId), vehicleId: toPositiveNumber(shipmentForm.vehicleId), note: shipmentForm.note.trim() }); setSuccess('Đã tạo shipment và assign logistics resource.'); setShipmentForm(initialShipmentForm); setSelectedShipmentId(String(created.shipmentId)); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'Không thể tạo shipment.')) } finally { setSavingShipment(false) } }
  async function submitDriver(event) { event.preventDefault(); setSavingDriver(true); setError(''); setSuccess(''); try { if (selectedDriverId) await updateDriver(Number(selectedDriverId), { licenseNo: driverForm.licenseNo.trim(), status: driverForm.status.trim() }); else if (driverForm.fullName && driverForm.email) await createDriverWithUser({ fullName: driverForm.fullName.trim(), email: driverForm.email.trim(), password: driverForm.password, driverCode: driverForm.driverCode.trim(), licenseNo: driverForm.licenseNo.trim(), status: driverForm.status.trim() }); else await createDriver({ driverCode: driverForm.driverCode.trim(), licenseNo: driverForm.licenseNo.trim(), userId: toPositiveNumber(driverForm.userId), status: driverForm.status.trim() }); setSuccess(selectedDriverId ? 'Đã cập nhật driver.' : 'Đã tạo driver mới.'); setSelectedDriverId(''); setDriverForm(initialDriverForm); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'Không thể lưu driver.')) } finally { setSavingDriver(false) } }
  async function submitVehicle(event) { event.preventDefault(); setSavingVehicle(true); setError(''); setSuccess(''); try { if (selectedVehicleId) await updateVehicle(Number(selectedVehicleId), { vehicleType: vehicleForm.vehicleType.trim(), capacity: Number(vehicleForm.capacity), status: vehicleForm.status.trim() }); else await createVehicle({ plateNo: vehicleForm.plateNo.trim(), vehicleType: vehicleForm.vehicleType.trim(), capacity: Number(vehicleForm.capacity), status: vehicleForm.status.trim() }); setSuccess(selectedVehicleId ? 'Đã cập nhật vehicle.' : 'Đã tạo vehicle mới.'); setSelectedVehicleId(''); setVehicleForm(initialVehicleForm); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'Không thể lưu vehicle.')) } finally { setSavingVehicle(false) } }
  async function submitShipmentStatus(event) { event.preventDefault(); if (!selectedShipment) return; setSavingShipment(true); try { await updateShipmentStatus(selectedShipment.shipmentId, { status: shipmentStatusForm.status, note: shipmentStatusForm.note.trim() }); setSuccess('Đã cập nhật shipment.'); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'Không thể cập nhật shipment.')) } finally { setSavingShipment(false) } }
  function fillDriver(driver) { setSelectedDriverId(String(driver.driverId)); setDriverForm({ driverCode: driver.driverCode || '', licenseNo: driver.licenseNo || '', userId: String(driver.userId || ''), status: driver.status || 'ACTIVE' }) }
  function fillVehicle(vehicle) { setSelectedVehicleId(String(vehicle.vehicleId)); setVehicleForm({ plateNo: vehicle.plateNo || '', vehicleType: vehicle.vehicleType || '', capacity: vehicle.capacity || '', status: vehicle.status || 'ACTIVE' }) }
  async function handleMarkRead(notificationId) { try { await markNotificationRead(notificationId); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'Không đánh dấu notification được.')) } }
  async function handleDeleteDriver(id) { if (!window.confirm('Xóa tài xế này?')) return; setError(''); setSuccess(''); try { await deleteDriver(id); setSuccess('Đã xóa tài xế.'); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'Không thể xóa tài xế.')) } }
  async function handleDeleteVehicle(id) { if (!window.confirm('Xóa phương tiện này?')) return; setError(''); setSuccess(''); try { await deleteVehicle(id); setSuccess('Đã xóa phương tiện.'); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'Không thể xóa phương tiện.')) } }
  const [reportForm, setReportForm] = useState(initialReportForm)
  const [notificationForm, setNotificationForm] = useState(initialNotificationForm)
  async function submitReport(event) { event.preventDefault(); setSavingReport(true); setError(''); setSuccess(''); try { await createReport({ title: reportForm.title.trim(), description: reportForm.description.trim(), severity: reportForm.severity }); setSuccess('Đã gửi báo cáo đến admin.'); setReportForm(initialReportForm); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'Không thể gửi báo cáo.')) } finally { setSavingReport(false) } }
  async function submitNotification(event) { event.preventDefault(); setSavingNotification(true); setError(''); setSuccess(''); try { await createNotification({ recipientRole: notificationForm.recipientRole, title: notificationForm.title.trim(), message: notificationForm.message.trim(), notificationType: 'MANUAL' }); setSuccess('Đã gửi thông báo.'); setNotificationForm(initialNotificationForm); await loadWorkspace() } catch (err) { setError(getErrorMessage(err, 'Không thể gửi thông báo.')) } finally { setSavingNotification(false) } }

  const props = { module, loading, error, success, displayShipments, shipmentReports, displayDrivers, displayVehicles, eligibleOrders, activeDrivers, activeVehicles, availableUsers, notifications, shipmentForm, driverForm, vehicleForm, shipmentStatusForm, reportForm, notificationForm, selectedShipment, selectedDriverId, selectedVehicleId, savingShipment, savingDriver, savingVehicle, savingReport, savingNotification, setShipmentForm, setShipmentStatusForm, setReportForm, setNotificationForm, submitShipment, submitDriver, submitVehicle, submitShipmentStatus, submitReport, submitNotification, fillDriver, fillVehicle, handleMarkRead, handleDeleteDriver, handleDeleteVehicle, onShipmentChange: change(setShipmentForm), onDriverChange: change(setDriverForm), onVehicleChange: change(setVehicleForm), onShipmentStatusChange: change(setShipmentStatusForm), onReportChange: change(setReportForm), onNotificationChange: change(setNotificationForm), loadWorkspace }
  const pages = { overview: <OverviewPage {...props} />, orders: <OrdersPage {...props} />, create: <CreateShipmentPage {...props} />, tracking: <TrackingPage {...props} />, drivers: <DriversPage {...props} />, vehicles: <VehiclesPage {...props} />, notifications: <NotificationsPage {...props} />, reports: <ReportsPage {...props} />, sendreport: <SendReportPage {...props} />, sendnotification: <SendNotificationPage {...props} />, completed: <SuccessfulOrdersPage {...props} />, profile: <ShippingProfilePage /> }
  return <section className={`shipping-prototype-shell shipping-module-${module}`}>{pages[module] || pages.overview}</section>
}

function PageChrome({ eyebrow, title, subtitle, actions, children, error, success, loading }) { return <><div className="ship-page-head"><div><p>{eyebrow}</p><h2>{title}</h2><span>{subtitle}</span></div><div className="ship-actions">{actions}</div></div>{loading ? <div className="ship-alert neutral">Đang đồng bộ dữ liệu vận chuyển...</div> : null}{error ? <div className="ship-alert danger">{error}</div> : null}{success ? <div className="ship-alert success">{success}</div> : null}{children}</> }
function Metric({ icon, label, value, note, tone = 'green' }) { return <article className={`ship-metric ${tone}`}><div><Icon fill>{icon}</Icon><span>{note}</span></div><p>{label}</p><strong>{value}</strong></article> }
function OverviewPage(p) { const deliveredCount = p.displayShipments.filter((s)=>String(s.status).toUpperCase()==='DELIVERED').length; const delayedCount = p.displayShipments.filter((s)=>['REJECTED','DISPUTED','ESCALATED'].includes(String(s.status).toUpperCase())).length; const statuses = ['ASSIGNED','PICKED_UP','IN_TRANSIT','DELIVERED','CANCELLED']; return <PageChrome eyebrow="Shipping Manager" title="Tổng quan Vận chuyển" subtitle="Điều phối đơn hàng, đội xe, tài xế và cảnh báo vận hành." loading={p.loading} error={p.error} success={p.success} actions={<button onClick={p.loadWorkspace}><Icon>refresh</Icon>Làm mới</button>}><section className="ship-metrics"><Metric icon="inventory" label="Chờ phân bổ" value={p.eligibleOrders.length} note="Eligible orders" tone="blue"/><Metric icon="local_shipping" label="Đang vận chuyển" value={p.displayShipments.length} note="Shipments API" tone="amber"/><Metric icon="task_alt" label="Đã giao" value={deliveredCount} note="Delivered"/><Metric icon="warning" label="Cần xử lý" value={delayedCount} note="Exception states" tone="red"/><Metric icon="badge" label="Tài xế hoạt động" value={p.activeDrivers.length} note="Active drivers"/></section><div className="ship-overview-grid"><ShipmentStatusChart shipments={p.displayShipments} /><aside className="ship-stack"><AlertsCard reports={p.shipmentReports} /><ActivityCard shipments={p.displayShipments} /></aside></div><PendingOrders orders={p.eligibleOrders} setShipmentForm={p.setShipmentForm} /></PageChrome> }

function ShipmentStatusChart({ shipments = [] }) {
  const total = shipments.length
  const groups = { ASSIGNED: [], PICKED_UP: [], IN_TRANSIT: [], DELIVERED: [], CANCELLED: [], ISSUE: [] }
  shipments.forEach(s => {
    const key = String(s.status).toUpperCase()
    if (groups[key]) groups[key].push(s)
    else if (['REJECTED','DISPUTED','ESCALATED'].includes(key)) groups.ISSUE.push(s)
  })
  const bars = [
    { key: 'ASSIGNED', label: 'Chờ lấy hàng', color: '#3b82f6' },
    { key: 'PICKED_UP', label: 'Đã lấy hàng', color: '#8b5cf6' },
    { key: 'IN_TRANSIT', label: 'Đang vận chuyển', color: '#f59e0b' },
    { key: 'DELIVERED', label: 'Đã giao', color: '#22c55e' },
    { key: 'CANCELLED', label: 'Đã hủy', color: '#a1a1aa' },
    { key: 'ISSUE', label: 'Có vấn đề', color: '#ef4444' },
  ]
  return <article className="ship-card ship-map-card">
    <div className="ship-card-head"><h3><Icon>bar_chart</Icon>Phân bổ trạng thái</h3><span className="live-pill"><i />{total} chuyến</span></div>
    <div className="ship-status-chart">
      {bars.map(b => {
        const count = groups[b.key].length
        const pct = total > 0 ? (count / total) * 100 : 0
        return <div key={b.key} className="chart-bar-row">
          <span className="chart-label">{b.label}</span>
          <div className="chart-bar-track">
            <div className="chart-bar-fill" style={{ width: pct + '%', background: b.color }} />
          </div>
          <span className="chart-value">{count}</span>
        </div>
      })}
    </div>
  </article>
}
function MapPanel({ shipments = [] }) { const visible = shipments.slice(0, 2); return <div className="ship-map">{visible.map((s, index)=><div className={`map-marker ${index===0?'one':'two'}`} key={s.shipmentId}><Icon>local_shipping</Icon><b>{s.vehiclePlateNo || `Shipment #${s.shipmentId}`}</b><small>{s.status || 'UNKNOWN'}</small></div>)}{visible.length===0?<div className="map-marker one"><Icon>map</Icon><b>Chưa có shipment</b><small>Backend chưa trả về vị trí vận chuyển.</small></div>:null}<div className="map-controls"><button type="button">+</button><button type="button">−</button></div></div> }
function AlertsCard({ reports = [] }) { const openReports = reports.filter((r)=>String(r.status).toUpperCase()==='OPEN').slice(0,3); return <article className="ship-card"><div className="ship-card-head"><h3><Icon>emergency_home</Icon>Cảnh báo Vận hành</h3><span className="danger-pill">{openReports.length} OPEN</span></div>{openReports.length ? openReports.map((r,i)=><div className={`ship-warning w${i}`} key={r.reportId}><strong>{r.issueType || 'Issue report'}</strong><p>{r.description || `Shipment #${r.shipmentId}`}</p></div>) : <p>Không có issue report mở từ backend.</p>}</article> }
function ActivityCard({ shipments = [] }) { return <article className="ship-card"><h3>Hoạt động Gần đây</h3><div className="ship-timeline">{shipments.slice(0,3).map((s)=><div key={s.shipmentId}><i /><strong>Shipment #{s.shipmentId}</strong><p>{s.status || 'UNKNOWN'} · {s.updatedAt || s.createdAt || 'No timestamp'}</p></div>)}{shipments.length===0?<p>Chưa có hoạt động shipment từ backend.</p>:null}</div></article> }
function PendingOrders({ orders, setShipmentForm }) { const list = safeList(orders); return <article className="ship-card"><div className="ship-card-head"><h3>Đơn hàng Chờ Phân bổ</h3><a href="/shipping/create">Tạo shipment</a></div>{list.length ? <div className="ship-table-wrap"><table className="ship-table"><thead><tr><th>Mã đơn</th><th>Điểm xuất phát</th><th>Điểm đến</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{list.map(o=><tr key={o.orderId}><td>#{o.orderId}</td><td>{o.farmName || 'Farm'}</td><td>{o.retailerName || 'Retailer'}</td><td><Status value={o.orderStatus} /></td><td><button onClick={()=>setShipmentForm(prev=>({...prev, orderId:String(o.orderId)}))}>Chọn</button></td></tr>)}</tbody></table></div> : <p>Không có order đủ điều kiện tạo shipment.</p>}</article> }
function OrdersPage(p) {
  const orders = safeList(p.eligibleOrders)
  const delivered = p.displayShipments.filter((s)=>String(s.status).toUpperCase()==='DELIVERED')
  const inTransit = p.displayShipments.filter((s)=>['ASSIGNED','PICKED_UP','IN_TRANSIT'].includes(String(s.status).toUpperCase()))
  const [tab, setTab] = useState('pending')
  const pendingCount = orders.length; const activeCount = inTransit.length; const doneCount = delivered.length
  return <PageChrome eyebrow="Đơn hàng & Vận chuyển" title="Quản lý đơn hàng" subtitle="Xem đơn hàng, tạo chuyến, theo dõi và hủy chuyến hàng." loading={p.loading} error={p.error} success={p.success} actions={<button onClick={p.loadWorkspace}><Icon>refresh</Icon>Làm mới</button>}>
    <section className="ship-metrics four">
      <Metric icon="order_approve" label="Chờ tạo chuyến" value={pendingCount} note={pendingCount+' đơn'} tone="blue"/>
      <Metric icon="local_shipping" label="Đang vận chuyển" value={activeCount} note={activeCount+' chuyến'}/>
      <Metric icon="task_alt" label="Đã giao" value={doneCount} note={doneCount+' chuyến'}/>
      <Metric icon="farm" label="Nông trại đối tác" value={[...new Set(orders.map(o=>o.farmName).filter(Boolean))].length || 0} note="Đang hợp tác" tone="green"/>
    </section>
    <div className="ship-tabs" style={{marginBottom:20}}>
      <button className={tab==='pending'?'active':''} onClick={()=>setTab('pending')}>Chờ xử lý {pendingCount>0?`(${pendingCount})`:''}</button>
      <button className={tab==='active'?'active':''} onClick={()=>setTab('active')}>Đang vận chuyển {activeCount>0?`(${activeCount})`:''}</button>
      <button className={tab==='done'?'active':''} onClick={()=>setTab('done')}>Đã giao {doneCount>0?`(${doneCount})`:''}</button>
    </div>
    {tab==='pending' && <PendingTab orders={orders} activeDrivers={p.activeDrivers} activeVehicles={p.activeVehicles} shipmentForm={p.shipmentForm} savingShipment={p.savingShipment} onSubmit={p.submitShipment} onChange={p.onShipmentChange} eligibleOrders={p.eligibleOrders} setShipmentForm={p.setShipmentForm} />}
    {tab==='active' && <ActiveTab shipments={inTransit} loadWorkspace={p.loadWorkspace} />}
    {tab==='done' && <DoneTab shipments={delivered} />}
  </PageChrome>
}
function PendingTab({ orders, activeDrivers, activeVehicles, shipmentForm, savingShipment, onSubmit, onChange, eligibleOrders, setShipmentForm }) {
  const [creating, setCreating] = useState(null)
  if (!orders.length) return <article className="ship-card"><div className="ship-empty"><Icon>inbox</Icon><h4>Chưa có đơn hàng</h4><p>Không có đơn hàng nào sẵn sàng từ backend.</p></div></article>
  return <div className="order-list">{orders.map(o=>{
    const isOpen = creating===o.orderId
    return <div key={o.orderId} className="order-card">
      <div className="order-card-top">
        <div className="order-parties"><span className="order-party farm">{o.farmName || 'Nông trại'}</span><span className="order-arrow"><Icon>arrow_forward</Icon></span><span className="order-party retailer">{o.retailerName || 'Nhà bán lẻ'}</span></div>
        <Status value={o.status || 'READY_FOR_SHIPMENT'} />
      </div>
      <div className="order-card-details">
        <span className="order-detail"><Icon>tag</Icon>Mã đơn: #{o.orderId}</span>
        {o.batchCode?<span className="order-detail"><Icon>inventory_2</Icon>Lô: {o.batchCode}</span>:null}
        {o.traceCode?<span className="order-detail"><Icon>qr_code_scanner</Icon>Mã vạch: {o.traceCode}</span>:null}
        <span className="order-detail"><Icon>payments</Icon>TT: {o.paymentStatus || '---'}</span>
        <span className="order-detail"><Icon>calendar_today</Icon>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</span>
      </div>
      {!isOpen ? <div className="order-card-action"><button className="order-create-btn" onClick={()=>{setCreating(o.orderId); setShipmentForm(prev=>({...prev, orderId:String(o.orderId)}))}}><Icon>add_shipping</Icon>Tạo chuyến hàng</button></div>
      :<form className="ship-form" onSubmit={async(e)=>{e.preventDefault(); await onSubmit(e); setCreating(null)}} style={{borderTop:'1px solid var(--ship-border)',paddingTop:16}}>
        <div className="two-cols">
          <label>Tài xế<select name="driverId" value={shipmentForm.driverId} onChange={onChange} required><option value="">Chọn tài xế</option>{activeDrivers.map(d=><option key={d.driverId} value={d.driverId}>{d.driverCode} - {d.userFullName}</option>)}</select></label>
          <label>Phương tiện<select name="vehicleId" value={shipmentForm.vehicleId} onChange={onChange} required><option value="">Chọn xe</option>{activeVehicles.map(v=><option key={v.vehicleId} value={v.vehicleId}>{v.plateNo} - {v.vehicleType}</option>)}</select></label>
        </div>
        <textarea name="note" value={shipmentForm.note} onChange={onChange} placeholder="Ghi chú (không bắt buộc)" rows={2}/>
        <div style={{display:'flex',gap:10}}>
          <button className="order-create-btn" disabled={savingShipment}>{savingShipment?'Đang tạo...':'Xác nhận tạo chuyến'}</button>
          <button type="button" className="secondary-action" onClick={()=>setCreating(null)} style={{padding:'10px 20px'}}>Hủy</button>
        </div>
      </form>}
    </div>
  })}</div>
}
function ActiveTab({ shipments, loadWorkspace }) {
  const [cancelId, setCancelId] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)
  if (!shipments.length) return <article className="ship-card"><div className="ship-empty"><Icon>local_shipping</Icon><h4>Không có chuyến hàng nào</h4><p>Chưa có chuyến hàng đang vận chuyển.</p></div></article>
  async function handleCancel(shipmentId) {
    if (cancelling||!cancelReason.trim()) return
    setCancelling(true)
    try {
      await import('../services/workflowService.js').then(m=>m.updateShipmentStatus(shipmentId, {status:'CANCELLED', note:cancelReason.trim()}))
      setCancelId(null); setCancelReason('')
      await loadWorkspace()
    } catch(e) { setCancelling(false) }
  }
  return <div className="order-list">{shipments.map(s=>{
    const isCancelling = cancelId===s.shipmentId
    return <div key={s.shipmentId} className="order-card">
      <div className="order-card-top">
        <div><b>Chuyến #{s.shipmentId}</b><span style={{marginLeft:12,color:'var(--ship-muted)',fontSize:13}}>Đơn #{s.orderId}</span></div>
        <Status value={s.status} />
      </div>
      <div className="order-card-details">
        <span className="order-detail"><Icon>person</Icon>{s.driverCode||'---'}</span>
        <span className="order-detail"><Icon>directions_car</Icon>{s.vehiclePlateNo||'---'}</span>
        <span className="order-detail"><Icon>store</Icon>{s.farmName||'---'}</span>
        <span className="order-detail"><Icon>storefront</Icon>{s.retailerName||'---'}</span>
        <span className="order-detail"><Icon>calendar_today</Icon>{new Date(s.updatedAt||s.createdAt).toLocaleDateString('vi-VN')}</span>
      </div>
      <div className="progress" style={{marginBottom:12}}><i style={{width:String(s.status).toUpperCase()==='IN_TRANSIT'?'68%':String(s.status).toUpperCase()==='PICKED_UP'?'35%':'18%'}}/></div>
      {!isCancelling ? <button className="order-create-btn" style={{background:'var(--ship-secondary)'}} onClick={()=>{setCancelId(s.shipmentId); setCancelReason('')}}><Icon>cancel</Icon>Hủy chuyến</button>
      :<form className="ship-form" onSubmit={e=>{e.preventDefault(); handleCancel(s.shipmentId)}} style={{borderTop:'1px solid var(--ship-border)',paddingTop:16}}>
        <textarea rows={2} placeholder="Lý do hủy..." value={cancelReason} onChange={e=>setCancelReason(e.target.value)} required/>
        <div style={{display:'flex',gap:10}}>
          <button className="order-create-btn" style={{background:'var(--ship-danger)'}} disabled={cancelling}>{cancelling?'Đang hủy...':'Xác nhận hủy'}</button>
          <button type="button" className="secondary-action" onClick={()=>setCancelId(null)} style={{padding:'10px 20px'}}>Quay lại</button>
        </div>
      </form>}
    </div>
  })}</div>
}
function DoneTab({ shipments }) {
  if (!shipments.length) return <article className="ship-card"><div className="ship-empty"><Icon>check_circle</Icon><h4>Chưa có đơn đã giao</h4><p>Các chuyến hàng đã giao thành công sẽ hiển thị ở đây.</p></div></article>
  return <article className="ship-card"><div className="ship-table-wrap"><table className="ship-table"><thead><tr><th>Chuyến</th><th>Đơn hàng</th><th>Nông trại</th><th>Nhà bán lẻ</th><th>Tài xế</th><th>Phương tiện</th><th>Ngày giao</th></tr></thead><tbody>{shipments.map(s=><tr key={s.shipmentId}><td><b>#{s.shipmentId}</b></td><td>#{s.orderId}</td><td>{s.farmName||'---'}</td><td>{s.retailerName||'---'}</td><td>{s.driverCode||'---'}</td><td>{s.vehiclePlateNo||'---'}</td><td>{new Date(s.updatedAt||s.createdAt).toLocaleDateString('vi-VN')}</td></tr>)}</tbody></table></div></article>
}
function SuccessfulOrdersPage(p) {
  const delivered = p.displayShipments.filter(s=>String(s.status).toUpperCase()==='DELIVERED')
  const pairs = {}
  delivered.forEach(s=>{
    const key = `${s.farmName||'?'} → ${s.retailerName||'?'}`
    if (!pairs[key]) pairs[key] = []
    pairs[key].push(s)
  })
  return <PageChrome eyebrow="Báo cáo thành công" title="Đơn hàng hoàn thành" subtitle="Danh sách đơn hàng đã giao thành công giữa Nhà bán lẻ và Quản lý Trang trại." loading={p.loading} error={p.error} success={p.success} actions={<button onClick={p.loadWorkspace}><Icon>refresh</Icon>Làm mới</button>}>
    <section className="ship-metrics four">
      <Metric icon="check_circle" label="Đã giao thành công" value={delivered.length} note={`${delivered.length} chuyến`} tone="green"/>
      <Metric icon="store" label="Nông trại" value={Object.keys(pairs).length} note="Đối tác" tone="blue"/>
      <Metric icon="badge" label="Tài xế" value={[...new Set(delivered.map(s=>s.driverCode).filter(Boolean))].length} note="Đã giao hàng" tone="amber"/>
      <Metric icon="local_shipping" label="Phương tiện" value={[...new Set(delivered.map(s=>s.vehiclePlateNo).filter(Boolean))].length} note="Đã sử dụng"/>
    </section>
    {Object.keys(pairs).length===0 ? <article className="ship-card"><div className="ship-empty"><Icon>check_circle</Icon><h4>Chưa có đơn hàng hoàn thành</h4><p>Các đơn hàng đã giao thành công giữa nhà bán lẻ và trang trại sẽ xuất hiện tại đây.</p></div></article>
    : Object.entries(pairs).map(([route, items])=><article key={route} className="ship-card" style={{marginBottom:16}}>
      <div className="ship-card-head"><h3><Icon>swap_horiz</Icon>{route}</h3><span className="success-pill">{items.length} đơn</span></div>
      <div className="ship-table-wrap"><table className="ship-table"><thead><tr><th>Chuyến</th><th>Đơn hàng</th><th>Tài xế</th><th>Phương tiện</th><th>Ngày giao</th></tr></thead><tbody>{items.map(s=><tr key={s.shipmentId}><td><b>#{s.shipmentId}</b></td><td>#{s.orderId}</td><td>{s.driverCode||'---'}</td><td>{s.vehiclePlateNo||'---'}</td><td>{new Date(s.updatedAt||s.createdAt).toLocaleDateString('vi-VN')}</td></tr>)}</tbody></table></div>
    </article>)}
  </PageChrome>
}
function ShipmentStatusForm(p) { const canCancel = p.selectedShipment && !['DELIVERED','CANCELLED','REJECTED','DISPUTED','ESCALATED'].includes(String(p.selectedShipment.status).toUpperCase()); return <article className="ship-card"><div className="ship-card-head"><h3><Icon>switch_access_shortcut</Icon>Cập nhật trạng thái</h3></div>{!p.selectedShipment?<p>Chọn shipment để cập nhật.</p>:<form className="ship-form" onSubmit={p.submitShipmentStatus}><select name="status" value={p.shipmentStatusForm.status} onChange={p.onShipmentStatusChange}><option value="ASSIGNED">ASSIGNED</option><option value="PICKED_UP">PICKED_UP</option><option value="IN_TRANSIT">IN_TRANSIT</option><option value="DELIVERED">DELIVERED</option>{canCancel?<option value="CANCELLED">CANCELLED (Hủy)</option>:null}</select><textarea name="note" value={p.shipmentStatusForm.note} onChange={p.onShipmentStatusChange} placeholder="Ghi chú..." rows={2}/><button disabled={p.savingShipment}>{p.savingShipment?'Đang lưu...':'Cập nhật'}</button></form>}</article> }
function ShipmentTable({ shipments }) { if (!shipments.length) return <p>Chưa có shipment từ backend.</p>; return <div className="ship-table-wrap"><table className="ship-table large"><thead><tr><th>Shipment ID</th><th>Origin</th><th>Destination</th><th>Driver & Vehicle</th><th>Status</th><th>Updated</th><th>Actions</th></tr></thead><tbody>{shipments.map((s)=><tr key={s.shipmentId}><td><b>#{s.shipmentId}</b><small>Order #{s.orderId || 'N/A'}</small></td><td>{s.farmName || 'Nông trại'}</td><td>{s.retailerName || 'Retailer'}</td><td>{s.driverCode ? `${s.driverCode} • ${s.vehiclePlateNo || 'N/A'}` : <button className="dash-btn">Assign Driver</button>}</td><td><Status value={s.status} /></td><td>{s.updatedAt || s.createdAt || 'N/A'}</td><td><button><Icon>more_vert</Icon></button></td></tr>)}</tbody></table></div> }
function CreateShipmentPage(p) { return <PageChrome eyebrow="Shipping / Orders / New Shipment" title="Lập Lệnh Vận chuyển" subtitle="Configure logistics and blockchain verification for agricultural orders." loading={p.loading} error={p.error} success={p.success}><form className="ship-create-grid" onSubmit={p.submitShipment}><div className="ship-form-stack"><FormSection step="1" title="Order Identification"><label>Related Order<select name="orderId" value={p.shipmentForm.orderId} onChange={p.onShipmentChange} required><option value="">Chọn order</option>{safeList(p.eligibleOrders).map(o=><option key={o.orderId} value={o.orderId}>#{o.orderId} • {o.farmName} → {o.retailerName}</option>)}</select></label></FormSection><FormSection step="2" title="Logistics Nodes"><div className="node-card"><Icon>location_on</Icon><input value={p.eligibleOrders.find(o=>String(o.orderId)===String(p.shipmentForm.orderId))?.farmName || ''} readOnly placeholder="Origin resolved from selected order" /></div><div className="node-line"/><div className="node-card"><Icon>local_shipping</Icon><input value={p.eligibleOrders.find(o=>String(o.orderId)===String(p.shipmentForm.orderId))?.retailerName || ''} readOnly placeholder="Destination resolved from selected order" /></div></FormSection><FormSection step="3" title="Scheduling & Resources"><div className="two-cols"><label>Driver<select name="driverId" value={p.shipmentForm.driverId} onChange={p.onShipmentChange}><option value="">Chọn driver</option>{p.activeDrivers.map(d=><option key={d.driverId} value={d.driverId}>{d.driverCode} • {d.userFullName}</option>)}</select></label><label>Vehicle<select name="vehicleId" value={p.shipmentForm.vehicleId} onChange={p.onShipmentChange}><option value="">Chọn vehicle</option>{p.activeVehicles.map(v=><option key={v.vehicleId} value={v.vehicleId}>{v.plateNo} • {v.vehicleType}</option>)}</select></label></div></FormSection><FormSection title="Special Instructions"><textarea name="note" value={p.shipmentForm.note} onChange={p.onShipmentChange} placeholder="Mention handling requirements, temperature thresholds, or ledger notes..." /></FormSection></div><aside className="ship-summary"><MapPanel shipments={p.displayShipments} /><div className="protocol-card"><Icon fill>verified_user</Icon><h3>Backend Verification</h3><p>Shipment evidence is committed by the backend after successful creation and status updates.</p><small>HASH: assigned by API / blockchain service</small></div><button className="primary-action" disabled={p.savingShipment}><Icon>send</Icon>{p.savingShipment?'Đang tạo...':'Confirm & Create Shipment'}</button><button type="button" className="secondary-action">Clear form</button></aside></form></PageChrome> }
function FormSection({ step, title, children }) { return <article className="ship-card form-section"><h3>{step ? <span>{step}</span> : <Icon>notes</Icon>}{title}</h3>{children}</article> }
function TrackingPage(p) { return <PageChrome eyebrow="Shipping / Tracking" title="Theo dõi Hành trình" subtitle="Live shipment status from backend." loading={p.loading} error={p.error} success={p.success}><div className="tracking-layout"><div className="tracking-map"><MapPanel shipments={p.displayShipments} /><div className="tracking-stats"><Metric icon="check_circle" label="Delivered" value={p.displayShipments.filter((s)=>String(s.status).toUpperCase()==='DELIVERED').length} note="API"/><Metric icon="sensors" label="Active Units" value={p.displayShipments.length} note="LIVE" tone="blue"/></div></div><aside className="tracking-list"><h3>Lô hàng đang đi <span className="live-pill"><i/>LIVE</span></h3>{p.displayShipments.length ? p.displayShipments.map((s,i)=><div className={`tracking-card ${i===0?'active':''}`} key={s.shipmentId}><strong>Shipment #{s.shipmentId}</strong><p>{s.farmName} → {s.retailerName}</p><div className="progress"><i style={{width:String(s.status).toUpperCase()==='DELIVERED'?'100%':String(s.status).toUpperCase()==='IN_TRANSIT'?'68%':'35%'}} /></div><Status value={s.status}/></div>) : <p>Chưa có shipment active để theo dõi.</p>}</aside></div></PageChrome> }
function DriversPage(p) { return <PageChrome eyebrow="Shipping / Drivers" title="Quản lý Tài xế" subtitle={`${p.displayDrivers.length} tài xế trong mạng lưới • ${p.activeDrivers.length} đang hoạt động`} loading={p.loading} error={p.error} success={p.success}><section className="ship-metrics four"><Metric icon="group" label="Tổng số tài xế" value={p.displayDrivers.length} note="API"/><Metric icon="radio_button_checked" label="Đang hoạt động" value={p.activeDrivers.length} note="ACTIVE"/><Metric icon="star" label="Đã gán shipment" value={p.displayShipments.filter((s)=>s.driverCode).length} note="Assignments" tone="amber"/><Metric icon="task_alt" label="Đã giao" value={p.displayShipments.filter((s)=>String(s.status).toUpperCase()==='DELIVERED').length} note="Delivered" tone="blue"/></section><div className="drivers-grid"><article className="ship-card"><DriverTable drivers={p.displayDrivers} fillDriver={p.fillDriver} handleDeleteDriver={p.handleDeleteDriver}/></article><DriverForm {...p}/></div><article className="ship-card"><h3>Bản đồ Tài xế thời gian thực</h3><MapPanel shipments={p.displayShipments} /></article></PageChrome> }
function DriverTable({ drivers, fillDriver, handleDeleteDriver }) { if (!drivers.length) return <p>Chưa có driver từ backend.</p>; return <div className="ship-table-wrap"><table className="ship-table"><thead><tr><th>Tài xế</th><th>Liên hệ</th><th>Trạng thái</th><th>Đơn hiện tại</th><th>Đánh giá</th><th></th></tr></thead><tbody>{drivers.map(d=><tr key={d.driverId}><td><b>{d.userFullName || d.driverCode}</b><small>ID: {d.driverId}</small></td><td>{d.phone || 'N/A'}<small>{d.email || d.driverCode || ''}</small></td><td><Status value={d.status}/></td><td><div className="progress"><i style={{width:d.status==='ACTIVE'?'75%':'30%'}}/></div></td><td>{d.rating || 'N/A'}</td><td style={{display:'flex',gap:4}}><button onClick={()=>fillDriver(d)}><Icon>edit</Icon></button><button onClick={()=>handleDeleteDriver(d.driverId)} style={{color:'var(--proto-error)'}}><Icon>delete</Icon></button></td></tr>)}</tbody></table></div> }
function DriverForm(p) { const isUpdate = Boolean(p.selectedDriverId); return <article className="ship-card"><h3>{isUpdate ? 'Cập nhật tài xế' : 'Thêm tài xế mới'}</h3><form className="ship-form" onSubmit={p.submitDriver}>{!isUpdate && <><input name="fullName" placeholder="Họ và tên" value={p.driverForm.fullName} onChange={p.onDriverChange} required/><input name="email" type="email" placeholder="Email" value={p.driverForm.email} onChange={p.onDriverChange} required/><input name="password" type="password" placeholder="Mật khẩu (ít nhất 8 ký tự)" value={p.driverForm.password} onChange={p.onDriverChange} required/></>}<input name="driverCode" placeholder="Mã tài xế" value={p.driverForm.driverCode} onChange={p.onDriverChange} disabled={isUpdate} required/><input name="licenseNo" placeholder="Số giấy phép lái xe" value={p.driverForm.licenseNo} onChange={p.onDriverChange} required/>{isUpdate && <input name="status" value={p.driverForm.status} onChange={p.onDriverChange}/>}<button disabled={p.savingDriver}>{p.savingDriver?'Đang lưu...':(isUpdate?'Cập nhật':'Tạo tài xế')}</button></form></article> }
function VehiclesPage(p) { return <PageChrome eyebrow="Shipping / Vehicles" title="Quản lý Phương tiện" subtitle="Biển số, tải trọng, trạng thái vận hành." loading={p.loading} error={p.error} success={p.success}><div className="drivers-grid"><article className="ship-card"><div className="ship-table-wrap"><table className="ship-table"><thead><tr><th>Biển số</th><th>Loại xe</th><th>Tải trọng</th><th>Trạng thái</th><th></th></tr></thead><tbody>{p.displayVehicles.map(v=><tr key={v.vehicleId}><td><b>{v.plateNo}</b></td><td>{v.vehicleType}</td><td>{formatCapacity(v.capacity)}</td><td><Status value={v.status}/></td><td style={{display:'flex',gap:4}}><button onClick={()=>p.fillVehicle(v)}><Icon>edit</Icon></button><button onClick={()=>p.handleDeleteVehicle(v.vehicleId)} style={{color:'var(--proto-error)'}}><Icon>delete</Icon></button></td></tr>)}{p.displayVehicles.length===0?<tr><td colSpan="5">Chưa có vehicle từ backend.</td></tr>:null}</tbody></table></div></article><article className="ship-card"><h3>{p.selectedVehicleId?'Cập nhật vehicle':'Tạo vehicle'}</h3><form className="ship-form" onSubmit={p.submitVehicle}><input name="plateNo" placeholder="Plate number" value={p.vehicleForm.plateNo} onChange={p.onVehicleChange} disabled={Boolean(p.selectedVehicleId)} required/><input name="vehicleType" placeholder="Vehicle type" value={p.vehicleForm.vehicleType} onChange={p.onVehicleChange} required/><input name="capacity" type="number" placeholder="Capacity" value={p.vehicleForm.capacity} onChange={p.onVehicleChange} required/><input name="status" value={p.vehicleForm.status} onChange={p.onVehicleChange}/><button disabled={p.savingVehicle}>Lưu vehicle</button></form></article></div></PageChrome> }
function NotificationsPage(p) { return <PageChrome eyebrow="Shipping / Notifications" title="Thông báo logistics" subtitle="Nhận/gửi thông tin thay đổi shipment." loading={p.loading} error={p.error} success={p.success}><article className="ship-card">{p.notifications.length===0?<p>Chưa có notification.</p>:p.notifications.map(n=><div className="notification-row" key={n.notificationId}><div><strong>{n.title}</strong><p>{n.message}</p></div>{!n.read?<button onClick={()=>p.handleMarkRead(n.notificationId)}>Đánh dấu đọc</button>:<Status value="READ"/>}</div>)}</article></PageChrome> }
function ReportsPage(p) { const reports = safeList(p.shipmentReports); return <PageChrome eyebrow="Shipping / Reports" title="Báo cáo vận hành" subtitle="Driver issue inbox, proof, QR scan và SLA." loading={p.loading} error={p.error} success={p.success} actions={<button onClick={p.loadWorkspace}><Icon>refresh</Icon>Làm mới</button>}><VerificationHub shipments={p.displayShipments} /><article className="ship-card"><div className="ship-card-head"><h3>Driver Issue Inbox</h3><span className="danger-pill">{reports.filter((r)=>String(r.status).toUpperCase()==='OPEN').length} OPEN</span></div>{reports.length ? <div className="ship-table-wrap"><table className="ship-table"><thead><tr><th>Report</th><th>Shipment</th><th>Driver</th><th>Issue</th><th>Severity</th><th>Status</th></tr></thead><tbody>{reports.map((r)=><tr key={r.reportId}><td><b>#{r.reportId}</b><small>{r.description || 'Không có mô tả'}</small></td><td>#{r.shipmentId}</td><td>{r.driverId || 'N/A'}</td><td>{r.issueType}</td><td><Status value={r.severity}/></td><td><Status value={r.status}/></td></tr>)}</tbody></table></div> : <p>Chưa có driver issue report từ backend.</p>}</article></PageChrome> }
function VerificationHub({ shipments = [] }) { const latest = shipments[0]; return <section className="verification-grid"><article className="ship-card"><h3><Icon fill>verified_user</Icon>Verification Hub</h3><div className="ship-timeline"><div><i/><strong>Selected shipment</strong><p>{latest ? `Shipment #${latest.shipmentId} · ${latest.status}` : 'No shipment selected from backend'}</p></div><div><i/><strong>Order reference</strong><p>{latest?.orderId ? `Order #${latest.orderId}` : 'N/A'}</p></div><div><i/><strong>Trace evidence</strong><p>{latest?.blockchainTxHash || latest?.txHash || 'Awaiting backend/blockchain proof'}</p></div></div></article><article className="ship-card image-card"><span>LIVE OPS</span><h3>Fleet Management Dashboard</h3><p>Giám sát đội xe bằng dữ liệu shipment, report và notification từ backend.</p></article></section> }
function SendReportPage(p) { return <PageChrome eyebrow="Shipping / Reports / New Report" title="Gửi báo cáo đến Admin" subtitle="Báo cáo sự cố vận hành, đề xuất cải tiến hoặc yêu cầu hỗ trợ." loading={p.loading} error={p.error} success={p.success}><form className="ship-create-grid" onSubmit={p.submitReport}><div className="ship-form-stack"><article className="ship-card form-section"><h3><Icon>description</Icon>Nội dung báo cáo</h3><label>Tiêu đề<input name="title" value={p.reportForm.title} onChange={p.onReportChange} placeholder="VD: Xe hỏng trên đường giao hàng" required/></label><label>Mô tả chi tiết<textarea name="description" value={p.reportForm.description} onChange={p.onReportChange} rows={4} placeholder="Mô tả vấn đề, thời gian, địa điểm..." required/></label><label>Mức độ<select name="severity" value={p.reportForm.severity} onChange={p.onReportChange}><option value="LOW">Thấp</option><option value="MEDIUM">Trung bình</option><option value="HIGH">Cao</option><option value="CRITICAL">Nghiêm trọng</option></select></label><button disabled={p.savingReport}>{p.savingReport?'Đang gửi...':'Gửi báo cáo'}</button></article></div></form></PageChrome> }
function SendNotificationPage(p) { return <PageChrome eyebrow="Shipping / Notifications / New" title="Gửi thông báo" subtitle="Gửi thông báo đến Nông trại, Nhà bán lẻ hoặc Quản trị viên." loading={p.loading} error={p.error} success={p.success}><form className="ship-create-grid" onSubmit={p.submitNotification}><div className="ship-form-stack"><article className="ship-card form-section"><h3><Icon>notifications</Icon>Soạn thông báo</h3><label>Đối tượng<select name="recipientRole" value={p.notificationForm.recipientRole} onChange={p.onNotificationChange}><option value="FARM">Nông trại</option><option value="RETAILER">Nhà bán lẻ</option><option value="ADMIN">Quản trị viên</option></select></label><label>Tiêu đề<input name="title" value={p.notificationForm.title} onChange={p.onNotificationChange} placeholder="Tiêu đề thông báo" required/></label><label>Nội dung<textarea name="message" value={p.notificationForm.message} onChange={p.onNotificationChange} rows={4} placeholder="Nội dung thông báo..." required/></label><button disabled={p.savingNotification}>{p.savingNotification?'Đang gửi...':'Gửi thông báo'}</button></article></div></form></PageChrome> }

function ShippingProfilePage() {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState({ fullName: user?.fullName || '', phone: user?.phoneNumber || '' })
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [changing, setChanging] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSave(e) {
    e.preventDefault(); setSaving(true); setError(''); setSuccess('')
    try { await updateProfile({ fullName: form.fullName.trim(), phone: form.phone.trim() }); setSuccess('Hồ sơ đã cập nhật.') }
    catch (err) { setError(err?.response?.data?.message || err.message || 'Lỗi cập nhật hồ sơ.') }
    finally { setSaving(false) }
  }

  async function handleChangePw(e) {
    e.preventDefault(); setError(''); setSuccess('')
    if (pw.newPassword !== pw.confirmPassword) { setError('Mật khẩu xác nhận không khớp.'); return }
    setChanging(true)
    try { const msg = await changePassword(pw); setSuccess(msg || 'Mật khẩu đã đổi.'); setPw({ currentPassword: '', newPassword: '', confirmPassword: '' }) }
    catch (err) { setError(err?.response?.data?.message || err.message || 'Lỗi đổi mật khẩu.') }
    finally { setChanging(false) }
  }

  return <PageChrome eyebrow="Shipping / Hồ sơ" title="Hồ sơ cá nhân" subtitle="Thông tin tài khoản và bảo mật.">
    {error && <div className="ship-alert danger">{error}</div>}
    {success && <div className="ship-alert success">{success}</div>}
    <div className="ship-create-grid">
      <div className="ship-form-stack">
        <article className="ship-card form-section">
          <h3><Icon>person</Icon>Thông tin cá nhân</h3>
          <form className="ship-form" onSubmit={handleSave}>
            <label>Họ và tên<input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required /></label>
            <label>Email<input value={user?.email || ''} readOnly style={{ opacity: .6 }} /></label>
            <label>Số điện thoại<input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></label>
            <label>Vai trò<input value={'Quản lý vận chuyển'} readOnly style={{ opacity: .6 }} /></label>
            <button disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu thông tin'}</button>
          </form>
        </article>
      </div>
      <div className="ship-form-stack">
        <article className="ship-card form-section">
          <h3><Icon>lock</Icon>Bảo mật</h3>
          <form className="ship-form" onSubmit={handleChangePw}>
            <label>Mật khẩu hiện tại<input type="password" value={pw.currentPassword} onChange={e => setPw({ ...pw, currentPassword: e.target.value })} required /></label>
            <label>Mật khẩu mới<input type="password" value={pw.newPassword} onChange={e => setPw({ ...pw, newPassword: e.target.value })} required minLength={8} /></label>
            <label>Xác nhận mật khẩu<input type="password" value={pw.confirmPassword} onChange={e => setPw({ ...pw, confirmPassword: e.target.value })} required /></label>
            <button disabled={changing}>{changing ? 'Đang đổi...' : 'Đổi mật khẩu'}</button>
          </form>
        </article>
      </div>
    </div>
  </PageChrome>
}
>>>>>>> Stashed changes
