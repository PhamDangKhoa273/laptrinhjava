import { Button } from '../Button.jsx'

export function AdminFarmPanel({ farms, busyFarmId, onReviewFarm }) {
  return (
    <div className="farm-board-grid">
      <article className="glass-card farm-board-column">
        <div className="admin-table-head"><div><h3>Chờ duyệt</h3><p>Hồ sơ nông trại đang chờ quản trị viên xem xét.</p></div></div>
        <div className="farm-board-list">
          {farms.filter((farm) => farm.approvalStatus !== 'APPROVED' && farm.approvalStatus !== 'REJECTED').map((farm) => (
            <div key={farm.farmId || farm.id} className="farm-board-item pending" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(162, 184, 214, 0.12)', marginBottom: '16px' }}>
              <strong style={{ fontSize: '1.1rem' }}>{farm.farmName || 'Chưa có tên nông trại'}</strong>
              <span style={{ color: '#89a0bc' }}>{farm.farmCode || 'N/A'} • {farm.address || farm.province || 'Chưa cập nhật'}</span>
              <small style={{ color: '#93cbff' }}>Chứng nhận: {farm.certificationStatus || 'PENDING'}</small>
              <div className="role-chip-wrap top-gap">
                <Button variant="secondary" onClick={() => onReviewFarm(farm.farmId || farm.id, 'APPROVED')} disabled={busyFarmId === (farm.farmId || farm.id)}>Duyệt</Button>
                <Button onClick={() => onReviewFarm(farm.farmId || farm.id, 'REJECTED')} disabled={busyFarmId === (farm.farmId || farm.id)}>Từ chối</Button>
                <Button variant="secondary">Quản lý chi tiết</Button>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="glass-card farm-board-column approved-column">
        <div className="admin-table-head"><div><h3>Đã duyệt</h3><p>Các nông trại đã hợp lệ và có thể hoạt động trên hệ thống.</p></div></div>
        <div className="farm-board-list">
          {farms.filter((farm) => farm.approvalStatus === 'APPROVED').map((farm) => (
            <div key={farm.farmId || farm.id} className="farm-board-item approved" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px', background: 'rgba(51, 212, 139, 0.04)', borderRadius: '14px', border: '1px solid rgba(51, 212, 139, 0.16)', marginBottom: '16px' }}>
              <strong style={{ fontSize: '1.1rem', color: '#89efbb' }}>{farm.farmName || 'Chưa có tên nông trại'}</strong>
              <span style={{ color: '#89a0bc' }}>{farm.farmCode || 'N/A'} • {farm.address || farm.province || 'Chưa cập nhật'}</span>
              <small style={{ color: '#93cbff' }}>Chứng nhận: {farm.certificationStatus || 'VALID'}</small>
              <div className="top-gap"><Button variant="secondary">Quản lý chi tiết</Button></div>
            </div>
          ))}
        </div>
      </article>

      <article className="glass-card farm-board-column rejected-column">
        <div className="admin-table-head"><div><h3>Từ chối</h3><p>Các hồ sơ chưa đáp ứng điều kiện chứng nhận hoặc thông tin pháp lý.</p></div></div>
        <div className="farm-board-list">
          {farms.filter((farm) => farm.approvalStatus === 'REJECTED').map((farm) => (
            <div key={farm.farmId || farm.id} className="farm-board-item rejected" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px', background: 'rgba(255, 93, 93, 0.04)', borderRadius: '14px', border: '1px solid rgba(255, 93, 93, 0.16)', marginBottom: '16px' }}>
              <strong style={{ fontSize: '1.1rem', color: '#ffabab' }}>{farm.farmName || 'Chưa có tên nông trại'}</strong>
              <span style={{ color: '#89a0bc' }}>{farm.farmCode || 'N/A'} • {farm.address || farm.province || 'Chưa cập nhật'}</span>
              <small style={{ color: '#93cbff' }}>Chứng nhận: {farm.certificationStatus || 'PENDING'}</small>
            </div>
          ))}
        </div>
      </article>
    </div>
  )
}
