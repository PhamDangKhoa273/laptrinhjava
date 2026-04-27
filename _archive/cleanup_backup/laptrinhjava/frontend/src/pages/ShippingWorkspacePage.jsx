import { useEffect, useMemo, useState } from 'react'
import '../shipping-workspace.css'
import '../transaction-hardening.css'
import { Button } from '../components/Button.jsx'
import { TextAreaField } from '../components/TextAreaField.jsx'
import { TextInput } from '../components/TextInput.jsx'
import { createDriver, createVehicle, getDrivers, getUsers, getVehicles, updateDriver, updateVehicle } from '../services/businessService'
import { createShipment, getEligibleShipmentOrders, getMyNotifications, getShipments, markNotificationRead, updateShipmentStatus } from '../services/workflowService.js'
import { createNotification } from '../services/businessService'
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

const initialShipmentForm = {
  orderId: '',
  driverId: '',
  vehicleId: '',
  note: '',
}

const initialShipmentStatusForm = {
  status: 'ASSIGNED',
  note: '',
}

const shipmentStatuses = ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'REJECTED', 'DISPUTED', 'ESCALATED', 'CANCELLED']

const shipmentStatusLabels = {
  ASSIGNED: 'Đã gán',
  PICKED_UP: 'Đã pickup',
  IN_TRANSIT: 'Đang vận chuyển',
  DELIVERED: 'Đã giao',
  REJECTED: 'Retailer reject',
  DISPUTED: 'Tranh chấp',
  ESCALATED: 'Escalated',
  CANCELLED: 'Đã hủy',
}

const shipmentStatusTone = {
  ASSIGNED: 'pending',
  PICKED_UP: 'active',
  IN_TRANSIT: 'active',
  DELIVERED: 'success',
  REJECTED: 'danger',
  DISPUTED: 'warning',
  ESCALATED: 'warning',
  CANCELLED: 'danger',
}

function formatDateTime(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString('vi-VN')
}

function formatCapacity(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return 'N/A'
  return `${numeric} kg`
}

function toPositiveNumber(value) {
  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null
}

export function ShippingWorkspacePage() {
  const [drivers, setDrivers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [eligibleOrders, setEligibleOrders] = useState([])
  const [shipments, setShipments] = useState([])
  const [notifications, setNotifications] = useState([])
  const [users, setUsers] = useState([])
  const [driverForm, setDriverForm] = useState(initialDriverForm)
  const [vehicleForm, setVehicleForm] = useState(initialVehicleForm)
  const [shipmentForm, setShipmentForm] = useState(initialShipmentForm)
  const [shipmentStatusForm, setShipmentStatusForm] = useState(initialShipmentStatusForm)
  const [selectedDriverId, setSelectedDriverId] = useState('')
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [selectedShipmentId, setSelectedShipmentId] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingDriver, setSavingDriver] = useState(false)
  const [savingVehicle, setSavingVehicle] = useState(false)
  const [savingShipment, setSavingShipment] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [notificationForm, setNotificationForm] = useState({ recipientRole: 'ADMIN', title: '', message: '', targetType: 'SHIPMENT', targetId: '' })

  const selectedShipment = useMemo(
    () => shipments.find((item) => String(item.shipmentId) === String(selectedShipmentId)) || null,
    [shipments, selectedShipmentId],
  )

  const activeDrivers = useMemo(() => drivers.filter((item) => item.status === 'ACTIVE'), [drivers])
  const activeVehicles = useMemo(() => vehicles.filter((item) => item.status === 'ACTIVE'), [vehicles])
  const availableUsers = useMemo(() => users.filter((item) => item.status === 'ACTIVE'), [users])

  useEffect(() => {
    loadWorkspace()
  }, [])

  async function loadWorkspace() {
    setLoading(true)
    try {
      const [driverData, vehicleData, eligibleData, shipmentData, notificationData, userData] = await Promise.all([
        getDrivers(),
        getVehicles(),
        getEligibleShipmentOrders(),
        getShipments(),
        getMyNotifications(),
        getUsers(),
      ])
      setDrivers(Array.isArray(driverData) ? driverData : [])
      setVehicles(Array.isArray(vehicleData) ? vehicleData : [])
      setEligibleOrders(Array.isArray(eligibleData) ? eligibleData : [])
      const safeShipments = Array.isArray(shipmentData) ? shipmentData : []
      setShipments(safeShipments)
      setNotifications(Array.isArray(notificationData) ? notificationData : [])
      setUsers(Array.isArray(userData) ? userData : [])
      if (!selectedShipmentId && safeShipments.length > 0) {
        setSelectedShipmentId(String(safeShipments[0].shipmentId))
      }
      setError('')
    } catch (err) {
      setError(getErrorMessage(err, 'Không tải được shipping manager workspace.'))
    } finally {
      setLoading(false)
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

  function handleShipmentChange(event) {
    const { name, value } = event.target
    setShipmentForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleShipmentStatusChange(event) {
    const { name, value } = event.target
    setShipmentStatusForm((prev) => ({ ...prev, [name]: value }))
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

  async function submitShipment(event) {
    event.preventDefault()
    if (savingShipment) return

    setSavingShipment(true)
    setError('')
    setSuccess('')
    try {
      const created = await createShipment({
        orderId: Number(shipmentForm.orderId),
        driverId: toPositiveNumber(shipmentForm.driverId),
        vehicleId: toPositiveNumber(shipmentForm.vehicleId),
        note: shipmentForm.note.trim(),
      })
      setSuccess('Đã tạo shipment và assign logistics resource.')
      setShipmentForm(initialShipmentForm)
      setSelectedShipmentId(String(created.shipmentId))
      await loadWorkspace()
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tạo shipment.'))
    } finally {
      setSavingShipment(false)
    }
  }

  async function submitShipmentStatus(event) {
    event.preventDefault()
    if (!selectedShipment || savingShipment) return

    setSavingShipment(true)
    setError('')
    setSuccess('')
    try {
      await updateShipmentStatus(selectedShipment.shipmentId, {
        status: shipmentStatusForm.status,
        note: shipmentStatusForm.note.trim(),
      })
      setSuccess('Đã cập nhật shipment.')
      setShipmentStatusForm(initialShipmentStatusForm)
      await loadWorkspace()
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể cập nhật shipment.'))
    } finally {
      setSavingShipment(false)
    }
  }

  async function rejectDelivery() {
    if (!selectedShipment || savingShipment) return
    const reason = window.prompt('Lý do retailer reject delivery?', selectedShipment.cancelReason || 'Sai batch / thiếu hàng / hàng hư')
    if (!reason) return
    setSavingShipment(true)
    try {
      await fetch(`/api/v1/shipments/${selectedShipment.shipmentId}/reject?reason=${encodeURIComponent(reason)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      setSuccess('Đã ghi nhận retailer reject delivery.')
      await loadWorkspace()
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể reject shipment.'))
    } finally {
      setSavingShipment(false)
    }
  }

  async function escalateShipment() {
    if (!selectedShipment || savingShipment) return
    const reason = window.prompt('Lý do escalated?', selectedShipment.cancelReason || 'Cần xử lý tranh chấp')
    if (!reason) return
    setSavingShipment(true)
    try {
      await fetch(`/api/v1/shipments/${selectedShipment.shipmentId}/escalate?reason=${encodeURIComponent(reason)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      setSuccess('Đã escalated shipment issue.')
      await loadWorkspace()
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể escalated shipment.'))
    } finally {
      setSavingShipment(false)
    }
  }

  async function submitNotification(event) {
    event.preventDefault()
    try {
      await createNotification({
        recipientRole: notificationForm.recipientRole,
        title: notificationForm.title.trim(),
        message: notificationForm.message.trim(),
        notificationType: 'SHIPPING_MANAGER_NOTE',
        targetType: notificationForm.targetType,
        targetId: notificationForm.targetId ? Number(notificationForm.targetId) : (selectedShipment ? selectedShipment.shipmentId : null),
      })
      setSuccess('Đã gửi notification.')
      setNotificationForm({ recipientRole: 'ADMIN', title: '', message: '' })
      await loadWorkspace()
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể gửi notification.'))
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
          <h2>Shipping Manager core</h2>
          <p>Quản lý eligible orders, driver, vehicle và shipment backbone cho Phase 2.</p>
        </div>
        <div className="section-actions">
          <Button variant="secondary" onClick={loadWorkspace} disabled={loading}>Làm mới</Button>
        </div>
      </div>

      {loading ? <div className="glass-card">Đang tải shipping workspace...</div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <div className="feature-grid">
        <article className="status-card tone-success">
          <span className="summary-label">Eligible orders</span>
          <strong>{eligibleOrders.length}</strong>
          <p>Order đủ điều kiện tạo shipment</p>
        </article>
        <article className="status-card tone-primary">
          <span className="summary-label">Shipments</span>
          <strong>{shipments.length}</strong>
          <p>Shipment đang quản lý</p>
        </article>
        <article className="status-card tone-warning">
          <span className="summary-label">Drivers</span>
          <strong>{drivers.length}</strong>
          <p>Tài xế logistics</p>
        </article>
        <article className="status-card">
          <span className="summary-label">Vehicles</span>
          <strong>{vehicles.length}</strong>
          <p>Phương tiện vận chuyển</p>
        </article>
      </div>

      <div className="shipping-workspace-grid top-gap">
        <article className="glass-card shipping-panel shipping-panel-wide">
          <div className="shipping-panel-header">
            <div>
              <p className="eyebrow">Eligible orders</p>
              <h3>Orders sẵn sàng tạo shipment</h3>
            </div>
          </div>

          <div className="form-grid">
            {eligibleOrders.length === 0 ? <p>Chưa có order nào đủ điều kiện tạo shipment.</p> : eligibleOrders.map((order) => (
              <div key={order.orderId} className="business-card shipping-order-card">
                <div>
                  <strong>Order #{order.orderId}</strong>
                  <p>Farm: {order.farmName || 'N/A'}</p>
                  <p>Retailer: {order.retailerName || 'N/A'}</p>
                  <p>Status: {order.orderStatus} • Payment: {order.paymentStatus}</p>
                </div>
                <Button variant="secondary" onClick={() => setShipmentForm((prev) => ({ ...prev, orderId: String(order.orderId) }))}>Chọn để tạo shipment</Button>
              </div>
            ))}
          </div>

          <form className="form-grid top-gap" onSubmit={submitShipment}>
            <h4>Tạo shipment</h4>
            <div className="grid-two">
              <label className="field-group">
                <span className="field-label">Eligible order</span>
                <select className="field-input" name="orderId" value={shipmentForm.orderId} onChange={handleShipmentChange} required>
                  <option value="">Chọn order</option>
                  {eligibleOrders.map((order) => <option key={order.orderId} value={order.orderId}>#{order.orderId} • {order.farmName} → {order.retailerName}</option>)}
                </select>
              </label>
              <label className="field-group">
                <span className="field-label">Driver</span>
                <select className="field-input" name="driverId" value={shipmentForm.driverId} onChange={handleShipmentChange}>
                  <option value="">Chọn driver</option>
                  {activeDrivers.map((driver) => <option key={driver.driverId} value={driver.driverId}>{driver.driverCode} • {driver.userFullName}</option>)}
                </select>
              </label>
            </div>
            <div className="grid-two">
              <label className="field-group">
                <span className="field-label">Vehicle</span>
                <select className="field-input" name="vehicleId" value={shipmentForm.vehicleId} onChange={handleShipmentChange}>
                  <option value="">Chọn vehicle</option>
                  {activeVehicles.map((vehicle) => <option key={vehicle.vehicleId} value={vehicle.vehicleId}>{vehicle.plateNo} • {vehicle.vehicleType}</option>)}
                </select>
              </label>
              <TextAreaField label="Ghi chú điều phối" name="note" value={shipmentForm.note} onChange={handleShipmentChange} placeholder="Ví dụ: ưu tiên giao trong sáng nay." />
            </div>
            <Button type="submit" disabled={savingShipment}>{savingShipment ? 'Đang tạo...' : 'Tạo shipment'}</Button>
          </form>
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
              <p className="eyebrow">Driver & vehicle management</p>
              <h3>Quản lý resource logistics</h3>
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
                  <label className="field-group">
                    <span className="field-label">Target user</span>
                    <select className="field-input" name="userId" value={driverForm.userId} onChange={handleDriverChange} disabled={Boolean(selectedDriverId)} required>
                      <option value="">Chọn user</option>
                      {availableUsers.map((user) => <option key={user.userId} value={user.userId}>{user.fullName} • {user.email}</option>)}
                    </select>
                  </label>
                  <TextInput label="Status" name="status" value={driverForm.status} onChange={handleDriverChange} />
                </div>
                <Button type="submit" disabled={savingDriver}>{savingDriver ? 'Đang lưu...' : selectedDriverId ? 'Cập nhật driver' : 'Tạo driver'}</Button>
              </form>

              <div className="form-grid top-gap">
                {drivers.length === 0 ? <p>Chưa có driver.</p> : drivers.map((driver) => (
                  <div key={driver.driverId} className="business-card">
                    <div>
                      <strong>{driver.driverCode}</strong>
                      <p>{driver.userFullName || 'No user'} • {driver.licenseNo}</p>
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
                      <p>{vehicle.vehicleType} • {formatCapacity(vehicle.capacity)}</p>
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
              <p className="eyebrow">Shipment list</p>
              <h3>Theo dõi shipment</h3>
            </div>
          </div>

          <div className="shipping-chip-row">
            {shipments.length === 0 ? <p>Chưa có shipment.</p> : shipments.map((shipment) => (
              <button
                key={shipment.shipmentId}
                type="button"
                className={`shipping-chip ${String(shipment.shipmentId) === String(selectedShipmentId) ? 'active' : ''}`}
                onClick={() => setSelectedShipmentId(String(shipment.shipmentId))}
              >
                #{shipment.shipmentId} • {shipment.status}
              </button>
            ))}
          </div>

          {selectedShipment ? (
            <div className="form-grid top-gap">
              <div className="business-card shipping-order-card is-selected">
                <div>
                  <strong>Shipment #{selectedShipment.shipmentId}</strong>
                  <p>Order #{selectedShipment.orderId} • {selectedShipment.orderStatus} • {selectedShipment.paymentStatus}</p>
                  <p>{selectedShipment.farmName || 'N/A'} → {selectedShipment.retailerName || 'N/A'}</p>
                  <p>Driver: {selectedShipment.driverCode || 'Chưa gán'} • Vehicle: {selectedShipment.vehiclePlateNo || 'Chưa gán'}</p>
                  <p>Pickup: {formatDateTime(selectedShipment.pickupConfirmedAt)}</p>
                  <p>Delivery: {formatDateTime(selectedShipment.deliveryConfirmedAt)}</p>
                  <p>Note: {selectedShipment.note || 'Không có'}</p>
                  <p>Cancel reason: {selectedShipment.cancelReason || 'Không có'}</p>
                  <div className="inline-actions top-gap">
                    <span className={`status-pill status-${shipmentStatusTone[selectedShipment.status] || 'pending'}`}>{shipmentStatusLabels[selectedShipment.status] || selectedShipment.status}</span>
                  </div>
                </div>
              </div>

              <form className="form-grid" onSubmit={submitShipmentStatus}>
                <h4>Cập nhật shipment status</h4>
                <label className="field-group">
                  <span className="field-label">Status</span>
                  <select className="field-input" name="status" value={shipmentStatusForm.status} onChange={handleShipmentStatusChange}>
                    {shipmentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </label>
                <TextAreaField label="Ghi chú" name="note" value={shipmentStatusForm.note} onChange={handleShipmentStatusChange} placeholder="Ví dụ: xe đã rời farm lúc 9:15." />
                <div className="inline-actions">
                  <Button type="submit" disabled={savingShipment}>Cập nhật shipment</Button>
                  <Button type="button" variant="secondary" onClick={rejectDelivery} disabled={savingShipment}>Retailer reject</Button>
                  <Button type="button" variant="secondary" onClick={escalateShipment} disabled={savingShipment}>Escalate issue</Button>
                </div>
              </form>
            </div>
          ) : <p>Chọn shipment để xem chi tiết.</p>}
        </article>
      </div>
    </section>
  )
}
