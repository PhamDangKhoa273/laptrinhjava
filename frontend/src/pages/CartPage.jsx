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
          icon="🧺"
          title="Giỏ hàng chưa có sản phẩm"
          message="Chọn một tin bán nông sản từ marketplace để bắt đầu tạo đơn hàng hoặc đặt cọc với farm."
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
          <h2>Giỏ hàng sẵn sàng đặt mua</h2>
          <p>Kiểm tra nhanh sản phẩm trước khi chuyển sang quy trình tạo đơn hàng chính thức.</p>
        </div>
      </div>

      <div className="content-grid cart-summary-grid">
        <article className="glass-card cart-intent-card">
          <span className="feature-badge">Listing #{listingId}</span>
          <h3>Đơn hàng mới từ marketplace</h3>
          <p className="muted-inline">
            BICAP sẽ tạo đơn hàng từ listing đã chọn, sau đó retailer có thể theo dõi đặt cọc,
            vận chuyển và xác nhận giao nhận trong workspace.
          </p>
          <ul className="feature-list">
            <li>Xác minh tồn kho và trạng thái phê duyệt của listing.</li>
            <li>Chuẩn bị luồng đặt cọc 30% theo cấu hình backend.</li>
            <li>Liên kết sang workspace để quản lý vòng đời đơn hàng.</li>
          </ul>
        </article>

        <article className="glass-card cart-checkout-card">
          <h3>Bước tiếp theo</h3>
          <div className="cart-step-list">
            <span>1. Xem lại listing và số lượng</span>
            <span>2. Tạo đơn hàng trong retailer workspace</span>
            <span>3. Theo dõi đặt cọc và vận chuyển</span>
          </div>
          <div className="inline-actions top-gap">
            <Button onClick={() => navigate('/retailer/workspace')}>Mở workspace</Button>
            <Button variant="secondary" onClick={() => navigate('/checkout')}>Tiếp tục thanh toán</Button>
            <Button variant="secondary" onClick={() => navigate('/marketplace')}>Mua thêm</Button>
          </div>
        </article>
      </div>
    </section>
  )
}