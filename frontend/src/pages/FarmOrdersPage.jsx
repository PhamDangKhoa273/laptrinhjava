import { useEffect, useMemo, useState } from 'react'
import '../shipping-workspace.css'
import { farmReviewOrder, getMyListingRegistrations, getOrdersV2 } from '../services/workflowService'
import { getErrorMessage } from '../utils/helpers'

function Icon({ children, fill = false }) {
  return <span className={`material-symbols-outlined${fill ? ' fill' : ''}`}>{children}</span>
}

function statusLabel(value) {
  const labels = {
    PENDING: 'Chờ xử lý',
    CONFIRMED: 'Đã xác nhận',
    REJECTED: 'Đã từ chối',
    READY_FOR_SHIPMENT: 'Sẵn sàng giao',
    SHIPPING: 'Đang giao',
    DELIVERED: 'Đã giao',
    COMPLETED: 'Hoàn tất',
    CANCELLED: 'Đã hủy',
    DISPUTED: 'Đang tranh chấp',
    UNPAID: 'Chưa thanh toán',
    DEPOSIT_PAID: 'Đã đặt cọc',
    PAID: 'Đã thanh toán',
    REFUNDED: 'Đã hoàn tiền',
    APPROVED: 'Đã duyệt',
  }
  const key = String(value || 'PENDING').toUpperCase()
  return labels[key] || value || 'Chờ xử lý'
}

function Status({ value }) {
  const key = String(value || 'PENDING').toLowerCase()
  return <span className={`ship-status ${key}`}>{statusLabel(value)}</span>
}

function PageChrome({ eyebrow, title, subtitle, actions, children, error, success, loading }) {
  return (
    <>
      <div className="ship-page-head">
        <div><p>{eyebrow}</p><h2>{title}</h2><span>{subtitle}</span></div>
        <div className="ship-actions">{actions}</div>
      </div>
      {loading ? <div className="ship-alert neutral">Đang tải đơn hàng...</div> : null}
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

function fmt(v) {
  return Number(v || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
}

function fmtDate(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString('vi-VN')
}

export function FarmOrdersPage() {
  const [orders, setOrders] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [reviewingId, setReviewingId] = useState('')
  const [decisionNotes, setDecisionNotes] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function load() {
    setLoading(true)
    try {
      const [ordersData, regData] = await Promise.allSettled([getOrdersV2(), getMyListingRegistrations()])
      setOrders(ordersData.status === 'fulfilled' && Array.isArray(ordersData.value) ? ordersData.value : [])
      setRegistrations(regData.status === 'fulfilled' && Array.isArray(regData.value) ? regData.value : [])
      setError('')
    } catch (err) {
      setError(getErrorMessage(err, 'Không tải được đơn hàng.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const pendingOrders = useMemo(() => orders.filter((o) => String(o.status).toUpperCase() === 'PENDING'), [orders])
  const confirmedOrders = useMemo(() => orders.filter((o) => ['CONFIRMED', 'READY_FOR_SHIPMENT', 'SHIPPING'].includes(String(o.status).toUpperCase())), [orders])
  const completedOrders = useMemo(() => orders.filter((o) => ['DELIVERED', 'COMPLETED'].includes(String(o.status).toUpperCase())), [orders])

  async function handleReview(orderId, decision) {
    setReviewingId(String(orderId))
    setError('')
    setSuccess('')
    try {
      const note = decisionNotes[orderId] || (decision === 'CONFIRMED' ? 'Farm đã xác nhận đủ sản lượng.' : 'Farm từ chối đơn hàng.')
      await farmReviewOrder(orderId, { status: decision, note })
      setSuccess(`Đã ${decision === 'CONFIRMED' ? 'xác nhận' : 'từ chối'} đơn #${orderId}.`)
      setDecisionNotes((prev) => {
        const next = { ...prev }
        delete next[orderId]
        return next
      })
      await load()
    } catch (err) {
      setError(getErrorMessage(err, 'Không xử lý được đơn.'))
    } finally {
      setReviewingId('')
    }
  }

  return (
    <section className="shipping-prototype-shell">
      <PageChrome
        eyebrow="Farm / Kinh doanh / Đơn hàng"
        title="Đơn hàng từ nhà bán lẻ"
        subtitle={`${pendingOrders.length} chờ xử lý • ${confirmedOrders.length} đã xác nhận • ${completedOrders.length} hoàn tất`}
        loading={loading}
        error={error}
        success={success}
        actions={<button type="button" onClick={load}><Icon>refresh</Icon>Làm mới</button>}
      >
        <section className="ship-metrics four">
          <Metric icon="pending_actions" label="Chờ xử lý" value={pendingOrders.length} tone="amber" />
          <Metric icon="local_shipping" label="Đã xác nhận" value={confirmedOrders.length} tone="blue" />
          <Metric icon="task_alt" label="Hoàn tất" value={completedOrders.length} />
          <Metric icon="campaign" label="Yêu cầu duyệt listing" value={registrations.length} tone="amber" />
        </section>

        <article className="ship-card">
          <div className="ship-card-head">
            <h3><Icon>inbox</Icon>Yêu cầu mua đang chờ xử lý</h3>
            <span className="danger-pill">{pendingOrders.length} chờ xử lý</span>
          </div>
          {pendingOrders.length === 0 ? (
            <p>Không có đơn hàng nào chờ xác nhận.</p>
          ) : (
            <div className="ship-table-wrap">
              <table className="ship-table">
                <thead>
                  <tr><th>Đơn hàng</th><th>Nhà bán lẻ</th><th>Sản phẩm</th><th>Tổng tiền</th><th>Tạo lúc</th><th>Quyết định</th></tr>
                </thead>
                <tbody>
                  {pendingOrders.map((o) => (
                    <tr key={o.orderId}>
                      <td><b>#{o.orderId}</b><small>{statusLabel(o.paymentStatus || 'UNPAID')}</small></td>
                      <td>{o.retailerName || `#${o.retailerId}`}</td>
                      <td><small>{o.items?.map((it) => `${it.title} x${it.quantity}`).join(', ') || 'N/A'}</small></td>
                      <td><b>{fmt(o.totalAmount)}</b></td>
                      <td>{fmtDate(o.createdAt)}</td>
                      <td>
                        <textarea
                          rows={2}
                          placeholder="Ghi chú quyết định..."
                          value={decisionNotes[o.orderId] || ''}
                          onChange={(e) => setDecisionNotes((prev) => ({ ...prev, [o.orderId]: e.target.value }))}
                          style={{ width: 220, marginBottom: 6 }}
                        />
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button type="button" onClick={() => handleReview(o.orderId, 'CONFIRMED')} disabled={reviewingId === String(o.orderId)}>
                            <Icon>check</Icon>Xác nhận
                          </button>
                          <button type="button" onClick={() => handleReview(o.orderId, 'REJECTED')} disabled={reviewingId === String(o.orderId)} style={{ color: 'var(--ship-danger)' }}>
                            <Icon>close</Icon>Từ chối
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="ship-card" style={{ marginTop: 24 }}>
          <div className="ship-card-head">
            <h3><Icon>history</Icon>Đơn hàng đã xử lý</h3>
            <span className="success-pill">{confirmedOrders.length + completedOrders.length} đơn</span>
          </div>
          {(confirmedOrders.length + completedOrders.length) === 0 ? (
            <p>Chưa có đơn nào được xử lý.</p>
          ) : (
            <div className="ship-table-wrap">
              <table className="ship-table">
                <thead>
                  <tr><th>Đơn hàng</th><th>Nhà bán lẻ</th><th>Trạng thái</th><th>Thanh toán</th><th>Tổng tiền</th><th>Cập nhật</th></tr>
                </thead>
                <tbody>
                  {[...confirmedOrders, ...completedOrders].map((o) => (
                    <tr key={o.orderId}>
                      <td><b>#{o.orderId}</b></td>
                      <td>{o.retailerName || `#${o.retailerId}`}</td>
                      <td><Status value={o.status} /></td>
                      <td><Status value={o.paymentStatus} /></td>
                      <td><b>{fmt(o.totalAmount)}</b></td>
                      <td>{fmtDate(o.updatedAt || o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="ship-card" style={{ marginTop: 24 }}>
          <div className="ship-card-head">
            <h3><Icon>campaign</Icon>Yêu cầu duyệt listing của tôi</h3>
          </div>
          {registrations.length === 0 ? (
            <p>Chưa có yêu cầu duyệt listing nào.</p>
          ) : (
            <div className="ship-table-wrap">
              <table className="ship-table">
                <thead>
                  <tr><th>Listing</th><th>Trạng thái</th><th>Người duyệt</th><th>Ghi chú</th></tr>
                </thead>
                <tbody>
                  {registrations.map((r) => (
                    <tr key={r.registrationId}>
                      <td><b>{r.listingTitle}</b></td>
                      <td><Status value={r.status} /></td>
                      <td>{r.reviewedByName || 'Chưa xử lý'}</td>
                      <td><small>{r.note || 'Không có'}</small></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </PageChrome>
    </section>
  )
}
