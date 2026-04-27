import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PublicShell } from '../components/public/PublicShell.jsx'
import { PublicState } from '../components/public/PublicState.jsx'
import { TraceTimeline } from '../components/public/TraceTimeline.jsx'
import { formatPublicPrice } from '../components/public/PublicProductCard.jsx'
import { getListingById } from '../services/listingService'
import { traceBatch, traceBatchByCode } from '../services/phase3Service'
import { getErrorMessage } from '../utils/helpers'

function formatDate(value) { return value ? new Date(value).toLocaleDateString('vi-VN') : 'Đang cập nhật' }
function InfoRow({ label, value }) { return <div className="info-row"><span>{label}</span><strong>{value || 'N/A'}</strong></div> }

export function ListingDetailPage() {
  const { id } = useParams()
  const [listing, setListing] = useState(null)
  const [traceData, setTraceData] = useState(null)
  const [traceError, setTraceError] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true); setError(''); setTraceError(''); setTraceData(null)
        const nextListing = await getListingById(id)
        if (!mounted) return
        setListing(nextListing)
        const traceCode = nextListing?.traceCode
        const batchId = nextListing?.batchId || nextListing?.batch?.batchId || nextListing?.batch?.id
        if (traceCode || batchId) {
          try {
            const nextTrace = traceCode ? await traceBatchByCode(traceCode) : await traceBatch(batchId, true)
            if (mounted) setTraceData(nextTrace)
          } catch (err) {
            if (mounted) setTraceError(getErrorMessage(err, 'Trace events unavailable for this listing.'))
          }
        }
      } catch (err) { if (mounted) { setError(getErrorMessage(err, 'Không thể tải chi tiết listing.')); setListing(null) } }
      finally { if (mounted) setLoading(false) }
    }
    if (id) load()
    return () => { mounted = false }
  }, [id])

  const timelineItems = useMemo(() => traceData?.processList || traceData?.timeline || [], [traceData])

  if (loading) return <PublicShell><main className="proto-page"><PublicState loading title="Đang tải sản phẩm" /></main></PublicShell>
  if (error) return <PublicShell><main className="proto-page"><PublicState title="Không thể tải sản phẩm" message={error} action={<Link className="proto-btn-primary" to="/marketplace">Quay lại chợ nông sản</Link>} /></main></PublicShell>
  if (!listing) return null

  const title = listing.title || listing.productName || 'Sản phẩm BICAP'
  const batchId = listing.batchId || listing.batch?.batchId || listing.batch?.id
  const traceHref = listing.traceCode ? `/public/trace?traceCode=${encodeURIComponent(listing.traceCode)}` : `/public/trace?batchId=${batchId || ''}`
  const orderHref = `/login?redirect=${encodeURIComponent(`/listings/${listing.listingId || id}`)}`

  return (
    <PublicShell>
      <main className="detail-page">
        <section className="detail-stack">
          <article className="detail-gallery">
            <div className="detail-media" style={{ background: listing.imageUrl ? '#eef2ec' : 'linear-gradient(135deg,#ecfdf5,#bbf7d0)' }}>
              {listing.imageUrl ? <img src={listing.imageUrl} alt={title} /> : <span style={{ color: '#166534', fontSize: 30, fontWeight: 900 }}>{listing.productName || 'Nông sản BICAP'}</span>}
              <span className="public-badge grade" style={{ left: 16, right: 'auto', top: 16 }}><span className="material-symbols-outlined">verified</span> Có truy xuất</span>
            </div>
          </article>

          <article className="detail-card">
            <span className="proto-kicker"><span className="material-symbols-outlined fill">eco</span> Thông tin sản phẩm</span>
            <h2 className="auth-title">{title}</h2>
            <p className="public-muted">{listing.description || 'Sản phẩm nông nghiệp đã được công bố công khai trên BICAP, có thông tin nguồn gốc và mã truy xuất để người mua kiểm tra trước khi liên hệ giao dịch.'}</p>
            <div className="public-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginTop: 20 }}>
              <div className="proto-card" style={{ padding: 16 }}><small>Ngày thu hoạch</small><strong>{formatDate(listing.harvestDate || traceData?.batch?.harvestDate)}</strong></div>
              <div className="proto-card" style={{ padding: 16 }}><small>Hạn sử dụng</small><strong>{formatDate(listing.expiryDate)}</strong></div>
              <div className="proto-card" style={{ padding: 16 }}><small>Hạng chất lượng</small><strong>{listing.qualityGrade || traceData?.batch?.qualityGrade || 'Đang cập nhật'}</strong></div>
            </div>
          </article>

          <article className="detail-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}><h2 className="auth-title">Nhật ký truy xuất công khai</h2><Link className="auth-link" to={traceHref}><span className="material-symbols-outlined">qr_code</span> Xem truy xuất</Link></div>
            {traceError ? <div className="alert alert-error" style={{ marginBottom: 16 }}>{traceError}</div> : null}
            <TraceTimeline items={timelineItems} emptyMessage="Chưa có nhật ký sản xuất công khai cho sản phẩm này." />
          </article>
        </section>

        <aside className="detail-sticky">
          <article className="detail-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><h1 className="auth-title">{title}</h1><span className="material-symbols-outlined">eco</span></div>
            <div className="public-product-footer"><strong>{formatPublicPrice(listing.price)}</strong><small> / {listing.unit || 'kg'}</small></div>
            <div className="proto-card" style={{ display: 'grid', gap: 12, margin: '20px 0', padding: 18 }}><div><small>Nông trại</small><strong>{listing.farmName || traceData?.seasonInfo?.farmName || 'Đang cập nhật'}</strong></div><div><small>Khu vực</small><strong>{listing.province || traceData?.seasonInfo?.province || 'Đang cập nhật'}</strong></div><div><small>Chứng nhận</small><strong>{listing.certificationStatus || 'Đang cập nhật'}</strong></div></div>
            <div className="auth-grid"><Link className="auth-submit-button" to={orderHref}><span className="material-symbols-outlined">login</span> Đăng nhập để đặt hàng</Link><Link className="proto-btn-secondary" to={traceHref}><span className="material-symbols-outlined">qr_code</span> Truy xuất QR</Link></div>
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--proto-line)' }}><p><span className="material-symbols-outlined">gpp_good</span> Thông tin công khai đã được BICAP ghi nhận</p><p><span className="material-symbols-outlined">visibility</span> Khách có thể xem nguồn gốc trước khi đăng nhập</p></div>
          </article>
        </aside>
      </main>
    </PublicShell>
  )
}
