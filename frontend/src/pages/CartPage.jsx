import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/Button.jsx'
import { PageEmptyState } from '../components/PageState.jsx'

export default function CartPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const listingId = useMemo(() => (id ? String(id).trim() : ''), [id])

  if (!listingId) {
    return (
      <section className="page-section cart-page">
        <PageEmptyState
          icon="??"
          title="Gi? hàng chưa có s?n ph?m"
          message="Ch?n m?t tin bán nông s?n t? marketplace để b?t đầu t?o đơn hàng ho?c đặt c?c v?i farm."
          actionLabel="Khám phá marketplace"
          onAction={() => navigate('/marketplace')}
        />
      </section>
    )
  }

  return (
    <section className="page-section cart-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Retailer checkout</p>
          <h2>Gi? hàng s?n sàng đặt mua</h2>
          <p>Ki?m tra nhanh s?n ph?m trước khi chuy?n sang quy tr?nh t?o đơn hàng chính th?c.</p>
        </div>
      </div>

      <div className="content-grid cart-summary-grid">
        <article className="glass-card cart-intent-card">
          <span className="feature-badge">Listing #{listingId}</span>
          <h3>Đơn hàng m?i t? marketplace</h3>
          <p className="muted-inline">
            BICAP s? t?o đơn hàng t? listing đã ch?n, sau đó retailer có th? theo d?i đặt c?c,
            v?n chuy?n và xác nh?n giao nh?n trong workspace.
          </p>
          <ul className="feature-list">
            <li>Xác minh t?n kho và tr?ng thái phê duy?t c?a listing.</li>
            <li>Chu?n b? lu?ng đặt c?c 30% theo c?u h?nh backend.</li>
            <li>Liên k?t sang workspace để qu?n l? v?ng đời đơn hàng.</li>
          </ul>
        </article>

        <article className="glass-card cart-checkout-card">
          <h3>Bước ti?p theo</h3>
          <div className="cart-step-list">
            <span>1. Xem l?i listing và s? lượng</span>
            <span>2. T?o đơn hàng trong retailer workspace</span>
            <span>3. Theo d?i đặt c?c và v?n chuy?n</span>
          </div>
          <div className="inline-actions top-gap">
            <Button onClick={() => navigate('/retailer/workspace')}>M? workspace</Button>
            <Button variant="secondary" onClick={() => navigate('/checkout')}>Ti?p t?c thanh toán</Button>
            <Button variant="secondary" onClick={() => navigate('/marketplace')}>Mua thêm</Button>
          </div>
        </article>
      </div>
    </section>
  )
}