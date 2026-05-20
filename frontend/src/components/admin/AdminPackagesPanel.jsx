import { Button } from '../Button.jsx'

export function AdminPackagesPanel({ packages }) {
  return (
    <div className="feature-grid package-card-grid">
      {packages.map((item) => (
        <article key={item.packageId || item.id} className="feature-card package-card">
          <span className="feature-badge">Gói d?ch v?</span>
          <h3>{item.packageName || 'Chưa có tên gói'}</h3>
          <p>M? gói: {item.packageCode || 'N/A'}</p>
          <strong className="package-price">{item.price?.toLocaleString?.('vi-VN') || item.price || 0} đ</strong>
          <ul className="feature-list">
            <li>Th?i h?n s? d?ng: {item.durationDays || 0} ngày</li>
            <li>S? mùa v? h? tr?: {item.maxSeasons || 0}</li>
            <li>S? tin đăng t?i đa: {item.maxListings || 0}</li>
            <li>Tr?ng thái: {item.status || 'ACTIVE'}</li>
          </ul>
          <Button variant="secondary">Xem chi ti?t gói</Button>
        </article>
      ))}
    </div>
  )
}
