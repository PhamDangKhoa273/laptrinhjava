export function AdminRetailerPanel({ retailers }) {
  return (
    <div className="retailer-directory-grid">
      {retailers.map((retailer) => (
        <article key={retailer.retailerId || retailer.id} className="glass-card retailer-profile-card">
          <div className="retailer-avatar">??</div>
          <div className="retailer-profile-body">
            <div className="admin-table-head">
              <div>
                <h3>{retailer.retailerName || 'Nhà bán l? chưa đặt tên'}</h3>
                <p>M? nhà bán l?: {retailer.retailerCode || 'N/A'}</p>
              </div>
              <span className={`status-pill status-${String(retailer.status || 'active').toLowerCase()}`}>{retailer.status || 'ACTIVE'}</span>
            </div>
            <ul className="feature-list">
              <li>Gi?y phép kinh doanh: {retailer.businessLicenseNo || 'Chưa c?p nh?t'}</li>
              <li>Địa ch? ho?t động: {retailer.address || 'Chưa c?p nh?t'}</li>
              <li>M? định danh: {retailer.retailerId || retailer.id}</li>
            </ul>
          </div>
        </article>
      ))}
    </div>
  )
}
