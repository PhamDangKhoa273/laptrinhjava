const iconFor = (type = '') => {
  const text = String(type).toLowerCase()
  if (text.includes('plant') || text.includes('seed')) return 'agriculture'
  if (text.includes('care') || text.includes('irrig') || text.includes('water')) return 'water_drop'
  if (text.includes('harvest')) return 'grass'
  if (text.includes('pack') || text.includes('storage')) return 'inventory_2'
  if (text.includes('ship') || text.includes('deliver')) return 'local_shipping'
  return 'verified'
}

function formatTimelineDate(value) {
  if (!value) return 'Đang chờ'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('vi-VN', { month: 'short', day: '2-digit', year: 'numeric' })
}

export function TraceTimeline({ items = [], fallback = false, emptyMessage = 'Chưa có nhật ký sản xuất nào được công bố cho lô hàng này.' }) {
  const fallbackItems = [
    { processType: 'Gieo trồng', description: 'Lô giống đã được ghi nhận. Đất được chuẩn bị bằng phân hữu cơ.', recordedAt: '2023-08-01' },
    { processType: 'Chăm sóc cây trồng', description: 'Nhật ký tưới tiêu và kiểm soát sâu bệnh đã được đồng bộ.', recordedAt: '2023-09-15' },
    { processType: 'Thu hoạch', description: 'Sản lượng thu hoạch được kiểm tra và liên kết với lô sản phẩm.', recordedAt: '2023-10-12' },
    { processType: 'Đóng gói & lưu kho', description: 'Đang chờ chuyển đến khu lưu trữ kiểm soát nhiệt độ.', recordedAt: null },
  ]
  const data = Array.isArray(items) && items.length > 0 ? items : fallback ? fallbackItems : []

  if (data.length === 0) {
    return <div className="public-state" style={{ minHeight: 120, boxShadow: 'none' }}><p>{emptyMessage}</p></div>
  }

  return (
    <ul className="trace-timeline">
      {data.map((item, index) => {
        const title = item.processType || item.title || item.stepName || item.name || `Bước truy xuất ${index + 1}`
        const description = item.description || item.note || item.status || item.eventDescription || 'Hoạt động sản xuất đã được ghi nhận trong BICAP.'
        const recordedAt = item.recordedAt || item.createdAt || item.eventTime || item.updatedAt
        return (
          <li key={item.processId || item.id || item.stepId || `${title}-${index}`}>
            <span className="trace-dot" />
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 24, alignItems: 'center' }}>
              <span className="public-muted" style={{ margin: 0 }}>{formatTimelineDate(recordedAt)}</span>
              <div className="proto-card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12, background: index === 2 ? 'rgba(212,227,255,.35)' : 'var(--proto-surface-low)' }}>
                <span className="material-symbols-outlined" style={{ color: index === 2 ? 'var(--proto-secondary)' : 'var(--proto-tertiary)' }}>{iconFor(title)}</span>
                <div><strong>{title}</strong><p className="public-muted" style={{ margin: 0 }}>{description}</p></div>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
