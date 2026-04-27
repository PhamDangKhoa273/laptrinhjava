import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button.jsx'
import { getDrivers, getVehicles } from '../services/businessService'
import { getShipments } from '../services/workflowService.js'
import { getErrorMessage } from '../utils/helpers.js'

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.content)) return payload.content
  if (Array.isArray(payload?.shipments)) return payload.shipments
  return []
}

function statusClass(status) {
  return `status-pill status-${String(status || 'active').toLowerCase()}`
}

function getShipmentId(item) {
  return item?.shipmentId || item?.id || item?.shipmentCode || item?.traceCode || 'N/A'
}

function getShipmentStatus(item) {
  return item?.status || item?.shipmentStatus || 'PENDING'
}

function getDriverName(driver) {
  return driver?.fullName || driver?.driverName || driver?.name || 'Driver chưa đặt tên'
}

function getVehiclePlate(vehicle) {
  return vehicle?.licensePlate || vehicle?.plateNumber || vehicle?.vehicleCode || 'Chưa có biển số'
}

function getShipmentKeyword(item) {
  return [
    item?.shipmentCode,
    item?.traceCode,
    item?.orderCode,
    item?.orderId,
    item?.driverName,
    item?.driverId,
    item?.vehiclePlate,
    item?.vehicleId,
    getShipmentStatus(item),
  ].filter(Boolean).join(' ').toLowerCase()
}

export function AdminLogisticsPage() {
  const [drivers, setDrivers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedShipmentId, setSelectedShipmentId] = useState(null)

  useEffect(() => {
    loadLogistics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stats = useMemo(() => {
    const activeDrivers = drivers.filter((item) => String(item.status || 'ACTIVE').toUpperCase() === 'ACTIVE').length
    const activeVehicles = vehicles.filter((item) => String(item.status || 'ACTIVE').toUpperCase() === 'ACTIVE').length
    const pendingShipments = shipments.filter((item) => ['PENDING', 'CREATED', 'ASSIGNED'].includes(String(getShipmentStatus(item)).toUpperCase())).length
    const inTransitShipments = shipments.filter((item) => ['IN_TRANSIT', 'PICKED_UP', 'SHIPPING'].includes(String(getShipmentStatus(item)).toUpperCase())).length
    const unassignedShipments = shipments.filter((item) => !item.driverId && !item.driverName).length

    return {
      drivers: drivers.length,
      activeDrivers,
      vehicles: vehicles.length,
      activeVehicles,
      shipments: shipments.length,
      pendingShipments,
      inTransitShipments,
      unassignedShipments,
    }
  }, [drivers, vehicles, shipments])

  const availableStatuses = useMemo(() => {
    const values = shipments.map(getShipmentStatus).filter(Boolean)
    return ['ALL', ...Array.from(new Set(values))]
  }, [shipments])

  const filteredShipments = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return shipments.filter((item) => {
      const status = getShipmentStatus(item)
      const matchesStatus = statusFilter === 'ALL' || status === statusFilter
      const matchesKeyword = !keyword || getShipmentKeyword(item).includes(keyword)
      return matchesStatus && matchesKeyword
    })
  }, [shipments, search, statusFilter])

  const selectedShipment = useMemo(
    () => shipments.find((item) => String(getShipmentId(item)) === String(selectedShipmentId)) || filteredShipments[0] || null,
    [shipments, filteredShipments, selectedShipmentId],
  )

  async function loadLogistics() {
    try {
      setLoading(true)
      setError('')
      const [driverData, vehicleData, shipmentData] = await Promise.allSettled([getDrivers(), getVehicles(), getShipments()])
      if (driverData.status === 'fulfilled') setDrivers(normalizeList(driverData.value))
      if (vehicleData.status === 'fulfilled') setVehicles(normalizeList(vehicleData.value))
      if (shipmentData.status === 'fulfilled') {
        const nextShipments = normalizeList(shipmentData.value)
        setShipments(nextShipments)
        if (!selectedShipmentId && nextShipments.length > 0) setSelectedShipmentId(getShipmentId(nextShipments[0]))
      }
      if (driverData.status === 'rejected' || vehicleData.status === 'rejected' || shipmentData.status === 'rejected') {
        setError('Một phần dữ liệu vận chuyển chưa tải được. Kiểm tra quyền API hoặc backend logistics.')
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page-section admin-page admin-logistics-page">
      <div className="section-heading">
        <div>
          <h2>Quản lý vận chuyển</h2>
        </div>
        <div className="section-actions">
          <Button variant="secondary" onClick={loadLogistics} disabled={loading}>{loading ? 'Đang tải...' : 'Làm mới'}</Button>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="status-grid admin-overview-grid">
        <article className="status-card"><span>Tổng shipment</span><strong>{stats.shipments}</strong></article>
        <article className="status-card"><span>Chờ điều phối</span><strong>{stats.pendingShipments}</strong></article>
        <article className="status-card"><span>Đang vận chuyển</span><strong>{stats.inTransitShipments}</strong></article>
        <article className="status-card"><span>Chưa gán tài xế</span><strong>{stats.unassignedShipments}</strong></article>
        <article className="status-card"><span>Tài xế / xe hoạt động</span><strong>{stats.activeDrivers}/{stats.activeVehicles}</strong></article>
      </div>

      <div className="admin-logistics-workspace">
        <aside className="glass-card admin-logistics-list-card">
          <h3>Danh sách shipment</h3>
          <div className="admin-users-filters">
            <input
              className="form-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm mã shipment/tài xế/biển số"
            />
            <select className="form-input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              {availableStatuses.map((status) => (
                <option key={status} value={status}>{status === 'ALL' ? 'Tất cả trạng thái' : status}</option>
              ))}
            </select>
          </div>

          <div className="admin-logistics-items">
            {filteredShipments.map((item) => {
              const id = getShipmentId(item)
              const isSelected = String(id) === String(getShipmentId(selectedShipment))
              return (
                <button
                  key={id}
                  type="button"
                  className={`admin-user-item admin-logistics-item ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => setSelectedShipmentId(id)}
                >
                  <div className="admin-user-item-main">
                    <strong className="admin-user-name">{item.shipmentCode || item.traceCode || `Shipment #${id}`}</strong>
                    <span className="admin-user-email">Đơn hàng: {item.orderCode || item.orderId || 'Chưa liên kết'}</span>
                  </div>
                  <div className="admin-user-item-meta">
                    <div className="admin-user-item-meta-left">
                      <span className={statusClass(getShipmentStatus(item))}>{getShipmentStatus(item)}</span>
                    </div>
                    <span className="admin-user-id">#{id}</span>
                  </div>
                </button>
              )
            })}
            {!loading && filteredShipments.length === 0 ? <p className="muted-inline">Chưa có shipment phù hợp.</p> : null}
          </div>
        </aside>

        <main className="glass-card admin-logistics-detail-card">
          {selectedShipment ? (
            <>
              <div className="admin-logistics-detail-head">
                <div>
                  <span className="feature-badge">Shipment control</span>
                  <h3>{selectedShipment.shipmentCode || selectedShipment.traceCode || `Shipment #${getShipmentId(selectedShipment)}`}</h3>
                  <p>Đơn hàng: {selectedShipment.orderCode || selectedShipment.orderId || 'Chưa liên kết'}</p>
                </div>
                <span className={statusClass(getShipmentStatus(selectedShipment))}>{getShipmentStatus(selectedShipment)}</span>
              </div>

              <div className="admin-logistics-info-grid">
                <div><span>Tài xế phụ trách</span><strong>{selectedShipment.driverName || (selectedShipment.driverId ? `#${selectedShipment.driverId}` : 'Chưa gán')}</strong></div>
                <div><span>Phương tiện</span><strong>{selectedShipment.vehiclePlate || (selectedShipment.vehicleId ? `#${selectedShipment.vehicleId}` : 'Chưa gán')}</strong></div>
                <div><span>Điểm lấy hàng</span><strong>{selectedShipment.pickupAddress || selectedShipment.fromAddress || 'Chưa cập nhật'}</strong></div>
                <div><span>Điểm giao hàng</span><strong>{selectedShipment.deliveryAddress || selectedShipment.toAddress || 'Chưa cập nhật'}</strong></div>
                <div><span>Thời gian tạo</span><strong>{selectedShipment.createdAt || selectedShipment.createdDate || 'Chưa cập nhật'}</strong></div>
                <div><span>Cập nhật cuối</span><strong>{selectedShipment.updatedAt || selectedShipment.updatedDate || 'Chưa cập nhật'}</strong></div>
              </div>

              <div className="admin-logistics-checklist">
                <h3>Kiểm tra điều phối</h3>
                <ul className="feature-list">
                  <li className={selectedShipment.driverId || selectedShipment.driverName ? 'is-ok' : 'is-warning'}>
                    {selectedShipment.driverId || selectedShipment.driverName ? 'Đã gán tài xế.' : 'Shipment chưa gán tài xế.'}
                  </li>
                  <li className={selectedShipment.vehicleId || selectedShipment.vehiclePlate ? 'is-ok' : 'is-warning'}>
                    {selectedShipment.vehicleId || selectedShipment.vehiclePlate ? 'Đã gán phương tiện.' : 'Shipment chưa gán phương tiện.'}
                  </li>
                  <li className={String(getShipmentStatus(selectedShipment)).toUpperCase() === 'DELIVERED' ? 'is-ok' : 'is-warning'}>
                    {String(getShipmentStatus(selectedShipment)).toUpperCase() === 'DELIVERED' ? 'Shipment đã giao thành công.' : 'Shipment chưa hoàn tất.'}
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <p className="muted-inline">Chưa có shipment để hiển thị.</p>
          )}
        </main>
      </div>

      <div className="content-grid admin-logistics-resource-grid">
        <article className="glass-card admin-logistics-resource-card">
          <div className="admin-table-head"><h3>Tài xế</h3><span>{drivers.length} hồ sơ</span></div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Tài xế</th><th>Liên hệ</th><th>Trạng thái</th></tr></thead>
              <tbody>
                {drivers.map((driver) => (
                  <tr key={driver.driverId || driver.id || driver.email}>
                    <td><strong>{getDriverName(driver)}</strong><br /><small>#{driver.driverId || driver.id || '-'}</small></td>
                    <td>{driver.phone || driver.email || 'Chưa cập nhật'}</td>
                    <td><span className={statusClass(driver.status)}>{driver.status || 'ACTIVE'}</span></td>
                  </tr>
                ))}
                {!loading && drivers.length === 0 ? <tr><td colSpan="3">Chưa có dữ liệu tài xế.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </article>

        <article className="glass-card admin-logistics-resource-card">
          <div className="admin-table-head"><h3>Phương tiện</h3><span>{vehicles.length} xe</span></div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Biển số</th><th>Loại xe</th><th>Trạng thái</th></tr></thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.vehicleId || vehicle.id || vehicle.licensePlate}>
                    <td><strong>{getVehiclePlate(vehicle)}</strong><br /><small>#{vehicle.vehicleId || vehicle.id || '-'}</small></td>
                    <td>{vehicle.vehicleType || vehicle.type || 'Chưa cập nhật'}</td>
                    <td><span className={statusClass(vehicle.status)}>{vehicle.status || 'ACTIVE'}</span></td>
                  </tr>
                ))}
                {!loading && vehicles.length === 0 ? <tr><td colSpan="3">Chưa có dữ liệu phương tiện.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </section>
  )
}
