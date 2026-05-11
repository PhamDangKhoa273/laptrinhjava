import { Link } from 'react-router-dom'

const fallbackImages = [
  'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1586201375761-83865001e31b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1605027990121-cbae9e0642df?auto=format&fit=crop&w=900&q=80',
]

function statusLabel(value) {
  const key = String(value || '').toUpperCase()
  if (key === 'VALID') return 'Đã xác thực'
  if (key === 'PENDING') return 'Chờ xác thực'
  if (key === 'PENDING_REVIEW') return 'Chờ duyệt'
  if (key === 'APPROVED') return 'Đã duyệt'
  return value
}

export function formatPublicPrice(value) {
  if (value === null || value === undefined || value === '') return 'Liên hệ'
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return String(value)
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(numeric)
}

export function PublicProductCard({ item, onOpen }) {
  const id = item.listingId || item.id
  const title = item.title || item.productName || 'Listing chưa có tên'
  const farm = item.farmName || item.producerName || 'Chưa cập nhật nông trại'
  const region = item.province || item.location || item.address || 'Chưa cập nhật xuất xứ'
  const img = item.imageUrl || fallbackImages[id ? Number(id) % fallbackImages.length : 0]
  const traceHref = item.traceCode ? `/public/trace?traceCode=${encodeURIComponent(item.traceCode)}` : `/public/trace?batchId=${item.batchId || ''}`
  const detailHref = id ? `/listings/${id}` : '/marketplace'
  const hasTrace = item.traceable || item.traceCode || item.qrCodeUrl || item.batchId
  const badge = statusLabel(item.certificationStatus || item.qualityGrade || item.approvalStatus)

  return (
    <article className="public-product-card" onClick={id ? onOpen : undefined}>
      <div className="public-product-media">
        <img src={img} alt={title} />
        {hasTrace ? <span className="public-badge trace"><span className="material-symbols-outlined">qr_code</span> Có truy xuất</span> : null}
        {badge ? <span className="public-badge grade">{badge}</span> : null}
      </div>
      <div className="public-product-body">
        <h3>{title}</h3>
        <div className="public-product-footer"><strong>{formatPublicPrice(item.price)}</strong><small> / {item.unit || 'kg'}</small></div>
        <div style={{ margin: '12px 0 24px', flex: 1 }}>
          <p className="public-muted"><span className="material-symbols-outlined" style={{ color: 'var(--proto-tertiary)', fontSize: 16 }}>agriculture</span>{farm}</p>
          <p className="public-muted"><span className="material-symbols-outlined" style={{ color: 'var(--proto-outline)', fontSize: 16 }}>location_on</span>{region}</p>
        </div>
        <div className="public-card-actions" onClick={(e) => e.stopPropagation()}>
          <Link to={detailHref}>Chi tiết</Link>
          {hasTrace ? <Link to={traceHref}>Truy xuất</Link> : null}
        </div>
      </div>
    </article>
  )
}
