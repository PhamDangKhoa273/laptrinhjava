import { Button } from '../Button.jsx'

export function AdminBlockchainPanel({ blockchainModules, onDeployContract }) {
  return (
    <article className="glass-card">
      <div className="admin-table-head">
        <div>
          <h3>Quản lý blockchain / hợp đồng thông minh</h3>
          <p>Khu vực mô phỏng giám sát hợp đồng thông minh, phiên bản triển khai và khả năng cập nhật minh bạch truy xuất nguồn gốc.</p>
        </div>
        <span>{blockchainModules.length} hợp đồng</span>
      </div>
      <div className="feature-grid blockchain-grid">
        {blockchainModules.map((item) => (
          <article key={item.name} className="feature-card blockchain-card">
            <span className="feature-badge">Blockchain</span>
            <h3>{item.name}</h3>
            <p>Mạng: {item.network}</p>
            <p>Phiên bản: {item.version}</p>
            <p>Trạng thái: {item.status}</p>
            <div className="role-chip-wrap top-gap">
              <Button variant="secondary">Xem cấu hình</Button>
              <Button onClick={onDeployContract}>Triển khai mới</Button>
            </div>
          </article>
        ))}
      </div>
    </article>
  )
}
