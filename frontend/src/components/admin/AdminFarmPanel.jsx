import { Button } from '../Button.jsx'

export function AdminFarmPanel({ farms, busyFarmId, onReviewFarm }) {
  return (
    <div className="farm-board-grid">
      <article className="glass-card farm-board-column">
        <div className="admin-table-head"><div><h3>Ch? duy?t</h3><p>H? sơ nông tr?i đang ch? qu?n tr? viên xem xét.</p></div></div>
        <div className="farm-board-list">
          {farms.filter((farm) => farm.approvalStatus !== 'APPROVED' && farm.approvalStatus !== 'REJECTED').map((farm) => (
            <div key={farm.farmId || farm.id} className="farm-board-item pending" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(162, 184, 214, 0.12)', marginBottom: '16px' }}>
              <strong style={{ fontSize: '1.1rem' }}>{farm.farmName || 'Chưa có tên nông tr?i'}</strong>
              <span style={{ color: '#89a0bc' }}>{farm.farmCode || 'N/A'} • {farm.address || farm.province || 'Chưa c?p nh?t'}</span>
              <small style={{ color: '#93cbff' }}>Ch?ng nh?n: {farm.certificationStatus || 'PENDING'}</small>
              <div className="role-chip-wrap top-gap">
                <Button variant="secondary" onClick={() => onReviewFarm(farm.farmId || farm.id, 'APPROVED')} disabled={busyFarmId === (farm.farmId || farm.id)}>Duy?t</Button>
                <Button onClick={() => onReviewFarm(farm.farmId || farm.id, 'REJECTED')} disabled={busyFarmId === (farm.farmId || farm.id)}>T? ch?i</Button>
                <Button variant="secondary">Qu?n l? chi ti?t</Button>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="glass-card farm-board-column approved-column">
        <div className="admin-table-head"><div><h3>Đã duy?t</h3><p>Các nông tr?i đã h?p l? và có th? ho?t động trên h? th?ng.</p></div></div>
        <div className="farm-board-list">
          {farms.filter((farm) => farm.approvalStatus === 'APPROVED').map((farm) => (
            <div key={farm.farmId || farm.id} className="farm-board-item approved" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px', background: 'rgba(51, 212, 139, 0.04)', borderRadius: '14px', border: '1px solid rgba(51, 212, 139, 0.16)', marginBottom: '16px' }}>
              <strong style={{ fontSize: '1.1rem', color: '#89efbb' }}>{farm.farmName || 'Chưa có tên nông tr?i'}</strong>
              <span style={{ color: '#89a0bc' }}>{farm.farmCode || 'N/A'} • {farm.address || farm.province || 'Chưa c?p nh?t'}</span>
              <small style={{ color: '#93cbff' }}>Ch?ng nh?n: {farm.certificationStatus || 'VALID'}</small>
              <div className="top-gap"><Button variant="secondary">Qu?n l? chi ti?t</Button></div>
            </div>
          ))}
        </div>
      </article>

      <article className="glass-card farm-board-column rejected-column">
        <div className="admin-table-head"><div><h3>T? ch?i</h3><p>Các h? sơ chưa đáp ?ng điều ki?n ch?ng nh?n ho?c thông tin pháp l?.</p></div></div>
        <div className="farm-board-list">
          {farms.filter((farm) => farm.approvalStatus === 'REJECTED').map((farm) => (
            <div key={farm.farmId || farm.id} className="farm-board-item rejected" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px', background: 'rgba(255, 93, 93, 0.04)', borderRadius: '14px', border: '1px solid rgba(255, 93, 93, 0.16)', marginBottom: '16px' }}>
              <strong style={{ fontSize: '1.1rem', color: '#ffabab' }}>{farm.farmName || 'Chưa có tên nông tr?i'}</strong>
              <span style={{ color: '#89a0bc' }}>{farm.farmCode || 'N/A'} • {farm.address || farm.province || 'Chưa c?p nh?t'}</span>
              <small style={{ color: '#93cbff' }}>Ch?ng nh?n: {farm.certificationStatus || 'PENDING'}</small>
            </div>
          ))}
        </div>
      </article>
    </div>
  )
}
