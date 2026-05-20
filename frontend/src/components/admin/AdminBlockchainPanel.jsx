import { Button } from '../Button.jsx'

export function AdminBlockchainPanel({ blockchainModules, onDeployContract }) {
  return (
    <article className="glass-card">
      <div className="admin-table-head">
        <div>
          <h3>Qu?n l? blockchain / h?p đồng thông minh</h3>
          <p>Khu v?c mô ph?ng giám sát h?p đồng thông minh, phiên b?n tri?n khai và kh? năng c?p nh?t minh b?ch truy xu?t ngu?n g?c.</p>
        </div>
        <span>{blockchainModules.length} h?p đồng</span>
      </div>
      <div className="feature-grid blockchain-grid">
        {blockchainModules.map((item) => (
          <article key={item.name} className="feature-card blockchain-card">
            <span className="feature-badge">Blockchain</span>
            <h3>{item.name}</h3>
            <p>M?ng: {item.network}</p>
            <p>Phiên b?n: {item.version}</p>
            <p>Tr?ng thái: {item.status}</p>
            <div className="role-chip-wrap top-gap">
              <Button variant="secondary">Xem c?u h?nh</Button>
              <Button onClick={onDeployContract}>Tri?n khai m?i</Button>
            </div>
          </article>
        ))}
      </div>
    </article>
  )
}
