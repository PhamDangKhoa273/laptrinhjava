import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button.jsx'
import { PageEmptyState, PageErrorState, PageLoadingState } from '../components/PageState.jsx'
import { getOrders } from '../api/orderApi'

function normalizeOrders(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.content)) return payload.content
  return []
}

function formatMoney(value) {
  const amount = Number(value || 0)
  return `${amount.toLocaleString('vi-VN')} đ`
}

export default function OrderPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadOrders() {
    try {
      setLoading(true)
      setError('')
      const response = await getOrders()
      setOrders(normalizeOrders(response))
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không tải được danh sách đơn hàng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const metrics = useMemo(() => {
    const active = orders.filter((order) => !['CANCELLED', 'DELIVERED'].includes(order.status)).length
    const depositPaid = orders.filter((order) => order.paymentStatus === 'DEPOSIT_PAID' || order.paymentStatus === 'PAID').length
    const total = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0)
    return { active, depositPaid, total }
  }, [orders])

  return (
    <section className="page-section orders-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Order operations</p>
          <h2>Quản lý đơn hàng</h2>
          <p>Theo dõi trạng thái đặt cọc, vận chuyển và xác nhận giao nhận theo dữ liệu backend.</p>
        </div>
        <div className="section-actions">
          <Button variant="secondary" onClick={loadOrders} disabled={loading}>Làm mới</Button>
        </div>
      </div>

      <div className="status-grid">
        <article className="status-card"><span className="status-card-label">Tổng đơn</span><strong>{orders.length}</strong></article>
        <article className="status-card"><span className="status-card-label">Đang xử lý</span><strong>{metrics.active}</strong></article>
        <article className="status-card"><span className="status-card-label">Đã đặt cọc/thanh toán</span><strong>{metrics.depositPaid}</strong></article>
        <article className="status-card"><span className="status-card-label">Giá trị đơn</span><strong>{formatMoney(metrics.total)}</strong></article>
      </div>

      {loading ? <PageLoadingState title="Đang tải đơn hàng" message="Đang lấy dữ liệu order mới nhất từ backend." /> : null}
      {!loading && error ? <PageErrorState title="Không tải được đơn hàng" message={error} actionLabel="Thử lại" onAction={loadOrders} /> : null}
      {!loading && !error && orders.length === 0 ? (
        <PageEmptyState
          icon="📦"
          title="Chưa có đơn hàng"
          message="Khi retailer tạo đơn từ marketplace, đơn hàng sẽ xuất hiện ở đây cùng trạng thái đặt cọc và vận chuyển."
        />
      ) : null}

      {!loading && !error && orders.length > 0 ? (
        <div className="order-card-grid">
          {orders.map((order) => {
            const items = Array.isArray(order.items) ? order.items : []
            return (
              <article key={order.orderId || order.id} className="glass-card order-card">
                <div className="admin-table-head">
                  <div>
                    <h3>Đơn #{order.orderId || order.id}</h3>
                    <p>{items.length} mặt hàng • Farm #{order.farmId || 'N/A'} • Retailer #{order.retailerId || 'N/A'}</p>
                  </div>
                  <span className={`status-pill status-${String(order.status || 'unknown').toLowerCase()}`}>{order.status || 'UNKNOWN'}</span>
                </div>
                <div className="order-card-meta">
                  <span><strong>{formatMoney(order.totalAmount)}</strong><small>Tổng giá trị</small></span>
                  <span><strong>{order.paymentStatus || 'UNPAID'}</strong><small>Thanh toán</small></span>
                  <span><strong>{order.minimumDepositAmount ? formatMoney(order.minimumDepositAmount) : 'N/A'}</strong><small>Đặt cọc tối thiểu</small></span>
                </div>
                {items.length > 0 ? (
                  <ul className="order-item-list">
                    {items.map((item, index) => (
                      <li key={`${order.orderId || order.id}-${item.listingId || index}`}>
                        <span>{item.title || `Listing #${item.listingId || index + 1}`}</span>
                        <strong>{Number(item.quantity || 0).toLocaleString('vi-VN')} × {formatMoney(item.price)}</strong>
                      </li>
                    ))}
                  </ul>
                ) : <p className="muted-inline">Backend chưa trả về chi tiết mặt hàng cho đơn này.</p>}
              </article>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}