import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getListingById } from '../services/listingService'
import { getErrorMessage } from '../utils/helpers'
import './GuestMarketplace.css'

function formatPrice(price) {
  if (price === null || price === undefined || price === '') return 'Liên hệ'
  return `${Number(price).toLocaleString('vi-VN')}đ`
}

function formatDate(value) {
  if (!value) return 'Đang cập nhật'
  return new Date(value).toLocaleDateString('vi-VN')
}

function InfoRow({ label, value }) {
  return (
    <div className="mp-card__meta">
      <span className="mp-card__qty">{label}</span>
      <span className="mp-card__batch">{value || 'N/A'}</span>
    </div>
  )
}

export function ListingDetailPage() {
  const { id } = useParams()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError('')
        const data = await getListingById(id)
        setListing(data)
      } catch (err) {
        setError(getErrorMessage(err, 'Không thể tải chi tiết listing.'))
        setListing(null)
      } finally {
        setLoading(false)
      }
    }

    if (id) load()
  }, [id])

  if (loading) {
    return (
      <section className="marketplace">
        <div className="mp-grid" style={{ gridTemplateColumns: '1.1fr 0.9fr' }}>
          <div className="mp-card mp-card--skeleton"><div className="mp-card__image mp-skeleton mp-skeleton--image" /><div className="mp-card__body"><div className="mp-skeleton mp-skeleton--title" /><div className="mp-skeleton mp-skeleton--line" /><div className="mp-skeleton mp-skeleton--line short" /></div></div>
          <div className="mp-card mp-card--skeleton"><div className="mp-card__body"><div className="mp-skeleton mp-skeleton--title" /><div className="mp-skeleton mp-skeleton--line" /><div className="mp-skeleton mp-skeleton--line" /><div className="mp-skeleton mp-skeleton--button" /></div></div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="marketplace">
        <div className="mp-empty">
          <span className="mp-empty__icon">⚠️</span>
          <p>{error}</p>
          <Link className="mp-retry-btn" to="/dashboard/guest">Quay lại marketplace</Link>
        </div>
      </section>
    )
  }

  if (!listing) return null

  const traceHref = listing.traceCode ? `/public/trace?traceCode=${encodeURIComponent(listing.traceCode)}` : `/public/trace?batchId=${listing.batchId}`

  return (
    <section className="marketplace">
      <div className="mp-grid" style={{ gridTemplateColumns: '1.1fr 0.9fr', alignItems: 'start' }}>
        <article className="mp-card" style={{ overflow: 'hidden' }}>
          <div className="mp-card__image" style={{ height: 320, background: listing.imageUrl ? undefined : 'linear-gradient(135deg, #1a3a0a 0%, #3d6b1e 100%)' }}>
            {listing.imageUrl ? <img src={listing.imageUrl} alt={listing.title} /> : <div className="mp-card__placeholder"><span className="mp-card__placeholder-icon">🌱</span><span className="mp-card__placeholder-text">{listing.productName || 'Nông sản'}</span></div>}
          </div>
          <div className="mp-card__body">
            <p className="mp-hero__eyebrow" style={{ marginBottom: 8 }}>LISTING DETAIL</p>
            <h1 className="mp-card__title" style={{ fontSize: '1.5rem', whiteSpace: 'normal' }}>{listing.title}</h1>
            <p className="mp-card__farm">🏡 {listing.farmName || 'Nông trại BICAP'} {listing.province ? `, ${listing.province}` : ''}</p>
            <div className="mp-card__meta" style={{ marginBottom: 12 }}>
              {listing.productCategory ? <span className="mp-card__category">{listing.productCategory}</span> : null}
              {listing.farmType ? <span className="mp-card__category">{listing.farmType}</span> : null}
              {listing.certificationStatus ? <span className="mp-card__category">{listing.certificationStatus}</span> : null}
            </div>
            {listing.description ? <p className="mp-card__desc" style={{ WebkitLineClamp: 'unset' }}>{listing.description}</p> : null}
            <div className="mp-card__footer">
              <span className="mp-card__price">{formatPrice(listing.price)}</span>
              <span className="mp-card__unit">/ {listing.unit || 'kg'}</span>
            </div>
            <div className="mp-card__meta" style={{ marginTop: 16 }}>
              <span className="mp-card__batch">Chất lượng: {listing.qualityGrade || 'N/A'}</span>
              <span className="mp-card__batch">Sẵn hàng: {listing.quantityAvailable} {listing.unit || 'kg'}</span>
            </div>
            <div className="mp-card__meta">
              <span className="mp-card__batch">Traceability: {listing.traceable ? 'Có thể truy xuất' : 'Chưa đủ dữ liệu truy xuất'}</span>
              <span className="mp-card__batch">Retailer readiness: {listing.availableForRetailer ? 'Sẵn sàng mua' : 'Cần rà soát thêm'}</span>
            </div>
          </div>
        </article>

        <article className="mp-card">
          <div className="mp-card__body">
            <h3 className="mp-card__title" style={{ whiteSpace: 'normal' }}>Thông tin để retailer quyết định mua</h3>
            <InfoRow label="Mã listing" value={`#${listing.listingId}`} />
            <InfoRow label="Mã batch" value={listing.batchCode} />
            <InfoRow label="Trace code" value={listing.traceCode} />
            <InfoRow label="Mã sản phẩm" value={listing.productCode} />
            <InfoRow label="Danh mục" value={listing.productCategory} />
            <InfoRow label="Mã farm" value={listing.farmCode} />
            <InfoRow label="Địa chỉ farm" value={listing.address} />
            <InfoRow label="Chứng chỉ farm" value={listing.certificationStatus} />
            <InfoRow label="Farm approval" value={listing.farmApproved ? 'Đã duyệt' : 'Chưa duyệt'} />
            <InfoRow label="Mùa vụ" value={listing.seasonCode} />
            <InfoRow label="Trạng thái mùa vụ" value={listing.seasonStatus} />
            <InfoRow label="Phương thức canh tác" value={listing.farmingMethod} />
            <InfoRow label="Ngày thu hoạch" value={formatDate(listing.harvestDate)} />
            <InfoRow label="Hạn sử dụng" value={formatDate(listing.expiryDate)} />
            <InfoRow label="QR URL" value={listing.qrCodeUrl} />
            <InfoRow label="Trạng thái listing" value={listing.status} />
            <InfoRow label="Approval listing" value={listing.approvalStatus} />
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
              <Link className="mp-retry-btn" to={traceHref}>Xem nguồn gốc lô hàng</Link>
              <Link className="mp-retry-btn" to="/dashboard/guest">Quay lại marketplace</Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
