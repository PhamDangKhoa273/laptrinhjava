import { useEffect, useMemo, useState } from 'react'
import '../shipping-workspace.css'
import { getFarmShipments } from '../services/workflowService'
import { getErrorMessage } from '../utils/helpers'

function Icon({ children, fill = false }) {
  return <span className={`material-symbols-outlined${fill ? ' fill' : ''}`}>{children}</span>
}

function statusLabel(value) {
  const labels = {
    CREATED: 'Mới tạo',
    ASSIGNED: 'Đã phân công',
    PICKED_UP: 'Đã nhận hàng',
    IN_TRANSIT: 'Đang vận chuyển',
    DELIVERED: 'Đã giao',
    CONFIRMED: 'Đã xác nhận',
    REJECTED: 'Đã từ chối',
    DISPUTED: 'Đang tranh chấp',
    ESCALATED: 'Đã chuyển admin',
    CANCELLED: 'Đã hủy',
  }
  const key = String(value || 'CREATED').toUpperCase()
  return labels[key] || value || 'Mới tạo'
}

function Status({ value }) {
  const key = String(value || 'CREATED').toLowerCase()
  return <span className={`ship-status ${key}`}>{statusLabel(value)}</span>
}

function PageChrome({ eyebrow, title, subtitle, actions, children, error, success, loading }) {
  return (
    <>
      <div className="ship-page-head">
        <div><p>{eyebrow}</p><h2>{title}</h2><span>{subtitle}</span></div>
        <div className="ship-actions">{actions}</div>
      </div>
      {loading ? <div className="ship-alert neutral">Đang tải chuyến giao...</div> : null}
      {error ? <div className="ship-alert danger">{error}</div> : null}
      {success ? <div className="ship-alert success">{success}</div> : null}
      {children}
    </>
  )
}

function Metric({ icon, label, value, note, tone = 'green' }) {
  return (
    <article className={`ship-metric ${tone}`}>
      <div><Icon fill>{icon}</Icon>{note ? <span>{note}</span> : null}</div>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  )
}

function fmtDate(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString('vi-VN')
}

export function FarmShippingPage() {
  const [shipments, setShipments] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function load() {
    setLoading(true)
    try {
      const data = await getFarmShipments()
      setShipments(Array.isArray(data) ? data : [])
      setError('')
    } catch (err) {
      setError(getErrorMessage(err, 'Không tải được chuyến giao.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const stats = useMemo(() => {
    const inTransit = shipments.filter((s) => ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(String(s.status).toUpperCase())).length
    const delivered = shipments.filter((s) => String(s.status).toUpperCase() === 'DELIVERED').length
    const issues = shipments.filter((s) => ['REJECTED', 'DISPUTED', 'ESCALATED', 'CANCELLED'].includes(String(s.status).toUpperCase())).length
    return { total: shipments.length, inTransit, delivered, issues }
  }, [shipments])

  const selected = useMemo(
    () => shipments.find((s) => String(s.shipmentId) === String(selectedId)) || null,
    [shipments, selectedId],
  )

  return (
    <section className="shipping-prototype-shell">
      <PageChrome
        eyebrow="Farm / Kinh doanh / Vận chuyển"
        title="Vận chuyển liên quan farm"
        subtitle={`${stats.total} chuyến • ${stats.inTransit} đang vận chuyển • ${stats.delivered} đã giao • ${stats.issues} sự cố`}
        loading={loading}
        error={error}
        success={success}
        actions={<button type="button" onClick={load}><Icon>refresh</Icon>Làm mới</button>}
      >
        <section className="ship-metrics four">
          <Metric icon="local_shipping" label="Tổng chuyến" value={stats.total} />
          <Metric icon="route" label="Đang vận chuyển" value={stats.inTransit} tone="blue" />
          <Metric icon="check_circle" label="Đã giao" value={stats.delivered} />
          <Metric icon="warning" label="Sự cố" value={stats.issues} tone="red" />
        </section>

        <div className="drivers-grid">
          <article className="ship-card">
            <div className="ship-card-head">
              <h3><Icon>list</Icon>Danh sách chuyến giao</h3>
            </div>
            {shipments.length === 0 ? (
              <p>Chưa có chuyến giao liên quan tới farm.</p>
            ) : (
              <div className="ship-table-wrap">
                <table className="ship-table">
                  <thead>
                    <tr><th>Chuyến giao</th><th>Đơn hàng</th><th>Nhà bán lẻ</th><th>Tài xế</th><th>Trạng thái</th><th>Cập nhật</th></tr>
                  </thead>
                  <tbody>
                    {shipments.map((s) => (
                      <tr
                        key={s.shipmentId}
                        style={String(selectedId) === String(s.shipmentId) ? { background: '#fbfdfb', cursor: 'pointer' } : { cursor: 'pointer' }}
                        onClick={() => setSelectedId(String(s.shipmentId))}
                      >
                        <td><b>#{s.shipmentId}</b><small>{s.batchCode || '--'}</small></td>
                        <td>#{s.orderId}</td>
                        <td>{s.retailerName || '--'}</td>
                        <td>{s.driverName || s.driverCode || 'Chưa gán'}</td>
                        <td><Status value={s.status} /></td>
                        <td>{fmtDate(s.updatedAt || s.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>

          <article className="ship-card">
            <div className="ship-card-head">
              <h3><Icon>info</Icon>Chi tiết chuyến giao</h3>
            </div>
            {!selected ? (
              <p>Chọn 1 chuyến trong bảng để xem chi tiết, timeline và báo cáo tài xế.</p>
            ) : (
              <>
                <p><strong>Chuyến giao #{selected.shipmentId}</strong> · Đơn #{selected.orderId}</p>
                <p>Nhà bán lẻ: {selected.retailerName || '--'}</p>
                <p>Tài xế: {selected.driverName || selected.driverCode || 'Chưa gán'} · Xe: {selected.vehiclePlateNo || '--'}</p>
                <p>Lô hàng: {selected.batchCode || '--'} · Mã truy xuất: {selected.traceCode || '--'}</p>
                <p>Nhận hàng: {fmtDate(selected.pickupConfirmedAt)} · Giao hàng: {fmtDate(selected.deliveryConfirmedAt)}</p>
                <p>Ghi chú điều phối: {selected.note || 'Không có'}</p>

                <h4 style={{ marginTop: 16 }}>Timeline</h4>
                <div className="ship-timeline">
                  {selected.logs?.length ? selected.logs.map((log) => (
                    <div key={log.logId}>
                      <i />
                      <strong>{statusLabel(log.type)}</strong>
                      <p>{fmtDate(log.recordedAt)}{log.location ? ` · ${log.location}` : ''}{log.note ? ` · ${log.note}` : ''}</p>
                    </div>
                  )) : <p>Chưa có timeline.</p>}
                </div>

                <h4 style={{ marginTop: 16 }}>Báo cáo tài xế</h4>
                {selected.reports?.length ? selected.reports.map((r) => (
                  <div key={r.reportId} className="ship-warning">
                    <strong>{r.issueType}</strong>
                    <p>{r.description}</p>
                    <p><small>Mức độ: {r.severity || '--'} · {fmtDate(r.createdAt)}</small></p>
                  </div>
                )) : <p>Chưa có báo cáo từ tài xế.</p>}
              </>
            )}
          </article>
        </div>
      </PageChrome>
    </section>
  )
}
