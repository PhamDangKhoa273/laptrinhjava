import { Button } from '../Button.jsx'

export function AdminPackagesPanel({ packages }) {
  return (
    <div className="feature-grid package-card-grid">
      {packages.map((item) => (
        <article key={item.packageId || item.id} className="feature-card package-card">
          <span className="feature-badge">Gói dịch vụ</span>
          <h3>{item.packageName || 'Chưa có tên gói'}</h3>
          <p>Mã gói: {item.packageCode || 'N/A'}</p>
          <strong className="package-price">{item.price?.toLocaleString?.('vi-VN') || item.price || 0} đ</strong>
          <ul className="feature-list">
            <li>Thời hạn sử dụng: {item.durationDays || 0} ngày</li>
            <li>Số mùa vụ hỗ trợ: {item.maxSeasons || 0}</li>
            <li>Số tin đăng tối đa: {item.maxListings || 0}</li>
            <li>Trạng thái: {item.status || 'ACTIVE'}</li>
          </ul>
          <Button variant="secondary">Xem chi tiết gói</Button>
        </article>
      ))}
    </div>
  )
}
