import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getListingById } from '../services/listingService'
import { getErrorMessage } from '../utils/helpers'
import './GuestMarketplace.css'

function formatPrice(price) {
  if (price === null || price === undefined || price === '') return 'Liên hệ'
  return `${Number(price).toLocaleString('vi-VN')}đ`
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
            {listing.description ? <p className="mp-card__desc" style={{ WebkitLineClamp: 'unset' }}>{listing.description}</p> : null}
            <div className="mp-card__footer">
              <span className="mp-card__price">{formatPrice(listing.price)}</span>
              <span className="mp-card__unit">/ {listing.unit || 'kg'}</span>
            </div>
          </div>
        </article>

        <article className="mp-card">
          <div className="mp-card__body">
            <h3 className="mp-card__title" style={{ whiteSpace: 'normal' }}>Thông tin listing</h3>
            <div className="mp-card__meta"><span className="mp-card__qty">Mã listing</span><span className="mp-card__batch">#{listing.listingId}</span></div>
            <div className="mp-card__meta"><span className="mp-card__qty">Mã batch</span><span className="mp-card__batch">{listing.batchCode || 'N/A'}</span></div>
            <div className="mp-card__meta"><span className="mp-card__qty">Mã sản phẩm</span><span className="mp-card__batch">{listing.productCode || 'N/A'}</span></div>
            <div className="mp-card__meta"><span className="mp-card__qty">Mã farm</span><span className="mp-card__batch">{listing.farmCode || 'N/A'}</span></div>
            <div className="mp-card__meta"><span className="mp-card__qty">Số lượng còn bán</span><span className="mp-card__batch">{listing.quantityAvailable} {listing.unit || 'kg'}</span></div>
            <div className="mp-card__meta"><span className="mp-card__qty">Chất lượng</span><span className="mp-card__batch">{listing.qualityGrade || 'N/A'}</span></div>
            <div className="mp-card__meta"><span className="mp-card__qty">Trạng thái</span><span className="mp-card__batch">{listing.status || 'N/A'}</span></div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
              <Link className="mp-retry-btn" to={`/public/trace?batchId=${listing.batchId}`}>Xem nguồn gốc lô hàng</Link>
              <Link className="mp-retry-btn" to="/dashboard/guest">Quay lại marketplace</Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
