export function AdminRetailerPanel({ retailers }) {
  return (
    <div className="retailer-directory-grid">
      {retailers.map((retailer) => (
        <article key={retailer.retailerId || retailer.id} className="glass-card retailer-profile-card">
          <div className="retailer-avatar">🏪</div>
          <div className="retailer-profile-body">
            <div className="admin-table-head">
              <div>
                <h3>{retailer.retailerName || 'Nhà bán lẻ chưa đặt tên'}</h3>
                <p>Mã nhà bán lẻ: {retailer.retailerCode || 'N/A'}</p>
              </div>
              <span className={`status-pill status-${String(retailer.status || 'active').toLowerCase()}`}>{retailer.status || 'ACTIVE'}</span>
            </div>
            <ul className="feature-list">
              <li>Giấy phép kinh doanh: {retailer.businessLicenseNo || 'Chưa cập nhật'}</li>
              <li>Địa chỉ hoạt động: {retailer.address || 'Chưa cập nhật'}</li>
              <li>Mã định danh: {retailer.retailerId || retailer.id}</li>
            </ul>
          </div>
        </article>
      ))}
    </div>
  )
}
