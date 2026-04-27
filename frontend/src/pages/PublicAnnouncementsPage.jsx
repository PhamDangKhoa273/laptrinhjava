import { useEffect, useMemo, useState } from 'react'
import { PublicShell } from '../components/public/PublicShell.jsx'
import { PublicSkeletonGrid, PublicState } from '../components/public/PublicState.jsx'
import { getPublishedContent, getPublicAnnouncementFeed } from '../services/workflowService.js'
import { sanitizeAnnouncementHtml } from '../utils/announcementSanitizer.js'

const filters = [
  { label: 'Tất cả', value: 'all', icon: null },
  { label: 'Hệ thống', value: 'system', icon: null },
  { label: 'Chợ nông sản', value: 'market', icon: null },
  { label: 'Mùa vụ', value: 'seasonal', icon: null },
  { label: 'Vận chuyển', value: 'shipping', icon: 'warning', danger: true },
]

function formatDate(value) { return value ? new Date(value).toLocaleDateString('vi-VN') : 'Đang cập nhật' }
function translateTag(value) {
  const text = String(value || '').toLowerCase()
  if (text.includes('system')) return 'HỆ THỐNG'
  if (text.includes('market')) return 'CHỢ NÔNG SẢN'
  if (text.includes('season')) return 'MÙA VỤ'
  if (text.includes('shipping')) return 'VẬN CHUYỂN'
  if (text.includes('guide')) return 'HƯỚNG DẪN'
  if (text.includes('article')) return 'BÀI VIẾT'
  return 'THÔNG BÁO'
}
function translateAuthorRole(kind) { return kind === 'Content' ? 'Nội dung hướng dẫn' : 'Thông báo BICAP' }
function matchesFilter(item, filter) {
  if (filter === 'all') return true
  const text = `${item.category || ''} ${item.contentType || ''} ${item.kind || ''} ${item.title || ''} ${item.summary || ''}`.toLowerCase()
  return text.includes(filter)
}
function getReadableBody(item) {
  if (item.body) return item.body
  const title = String(item.title || '').toLowerCase()
  if (title.includes('qr') || title.includes('truy xuất')) {
    return '<p>Khi quét mã QR trên sản phẩm, khách hàng có thể xem tên nông trại, khu vực sản xuất, ngày thu hoạch, hạng chất lượng và nhật ký sản xuất công khai.</p><p>Nếu mã QR hợp lệ, hệ thống sẽ hiển thị hồ sơ truy xuất của lô hàng. Nếu không tìm thấy dữ liệu, khách hàng nên kiểm tra lại mã hoặc liên hệ đơn vị bán hàng.</p>'
  }
  if (title.includes('listing')) {
    return '<p>Để một sản phẩm xuất hiện trên chợ nông sản công khai, nông trại cần tạo mùa vụ, ghi nhận lô hàng và gửi listing để quản trị viên kiểm tra.</p><p>Sau khi được duyệt, listing chỉ hiển thị các thông tin phù hợp cho khách truy cập như tên sản phẩm, giá, nông trại, khu vực, chất lượng và đường dẫn truy xuất QR.</p>'
  }
  return '<p>Nội dung này được BICAP công bố để khách truy cập nắm thông tin cần thiết trước khi xem sản phẩm hoặc truy xuất nguồn gốc.</p>'
}
function FeedCard({ item, kind }) {
  const tag = translateTag(item.category || item.contentType || kind)
  const readableBody = getReadableBody(item)
  return (
    <article className="announcement-card">
      <div className="announcement-meta"><span className="proto-chip active" style={{ borderRadius: 6, padding: '4px 8px' }}>{tag}</span><span>{formatDate(item.publishAt || item.createdAt)}</span></div>
      <h3>{item.title}</h3>
      {item.summary ? <p className="public-muted">{item.summary}</p> : null}
      <div className="public-muted" dangerouslySetInnerHTML={{ __html: sanitizeAnnouncementHtml(readableBody) }} />
      <div style={{ marginTop: 'auto', paddingTop: 18, display: 'flex', alignItems: 'center', gap: 10 }}><span className="material-symbols-outlined">{kind === 'Content' ? 'school' : 'campaign'}</span><strong>{item.createdByName || 'BICAP'}</strong><span className="public-muted">{translateAuthorRole(kind)}</span></div>
    </article>
  )
}

export function PublicAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([])
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [visibleCount, setVisibleCount] = useState(7)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true); setError('')
        const [feed, published] = await Promise.allSettled([getPublicAnnouncementFeed(), getPublishedContent()])
        if (!mounted) return
        setAnnouncements(feed.status === 'fulfilled' && Array.isArray(feed.value) ? feed.value : [])
        setContent(published.status === 'fulfilled' && Array.isArray(published.value) ? published.value : [])
        if (feed.status === 'rejected' && published.status === 'rejected') setError('Unable to load public announcements.')
      } finally { if (mounted) setLoading(false) }
    }
    load(); return () => { mounted = false }
  }, [])

  useEffect(() => { setVisibleCount(7) }, [query, categoryFilter])

  const allItems = useMemo(() => [...announcements.map((item) => ({ ...item, kind: 'Announcement' })), ...content.map((item) => ({ ...item, kind: 'Content' }))], [announcements, content])
  const filtered = allItems.filter((item) => `${item.title || ''} ${item.summary || ''} ${item.category || ''} ${item.contentType || ''}`.toLowerCase().includes(query.toLowerCase()) && matchesFilter(item, categoryFilter))
  const featured = filtered[0]
  const secondaryItems = filtered.slice(1, visibleCount)
  const canLoadMore = filtered.length > visibleCount

  return (
    <PublicShell>
      <header className="ann-header"><span className="proto-kicker"><span className="material-symbols-outlined fill">campaign</span> Thông báo công khai BICAP</span><h1 className="proto-h1">Thông báo</h1></header>
      <section className="ann-tools"><div className="proto-chip-row" style={{ margin: 0 }}>{filters.map((filter) => <button key={filter.value} className={`proto-chip ${categoryFilter === filter.value ? 'active' : ''}`} onClick={() => setCategoryFilter(filter.value)} style={filter.danger && categoryFilter !== filter.value ? { background: 'var(--proto-danger-bg)', color: '#93000a' } : undefined}>{filter.icon ? <span className="material-symbols-outlined">{filter.icon}</span> : null}{filter.label}</button>)}</div><div className="proto-search" style={{ margin: 0, maxWidth: 340, boxShadow: 'none', borderRadius: 12 }}><span className="material-symbols-outlined">search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm thông báo..." /></div></section>
      {loading ? <main className="proto-page"><PublicSkeletonGrid count={6} /></main> : error ? <main className="proto-page"><PublicState title="Chưa tải được thông báo" message={error} /></main> : !featured ? <main className="proto-page"><PublicState title="Chưa có thông báo công khai" message="Khi BICAP có cập nhật dành cho khách truy cập, nội dung sẽ hiển thị tại đây." /></main> : <><section className="ann-feature"><div className="ann-feature-img" /><div className="ann-feature-body"><div className="announcement-meta"><span className="proto-chip active" style={{ borderRadius: 6, padding: '4px 8px' }}>{translateTag(featured.category || featured.contentType || featured.kind)}</span><span><span className="material-symbols-outlined">calendar_today</span> {formatDate(featured.publishAt || featured.createdAt)}</span></div><h2 className="auth-title" style={{ fontSize: 36 }}>{featured.title}</h2><p className="public-muted">{featured.summary || 'Cập nhật công khai từ BICAP dành cho khách truy cập và người mua quan tâm đến nông sản có truy xuất.'}</p><div className="public-muted" dangerouslySetInnerHTML={{ __html: sanitizeAnnouncementHtml(getReadableBody(featured)) }} /><div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 12, borderTop: '1px solid var(--proto-line)' }}><span className="material-symbols-outlined fill" style={{ fontSize: 42, color: 'var(--proto-primary)' }}>campaign</span><div><strong>{featured.createdByName || 'BICAP'}</strong><p className="public-muted">{translateAuthorRole(featured.kind)}</p></div></div></div></section><section className="ann-grid">{secondaryItems.map((item) => <FeedCard key={`${item.kind}-${item.announcementId || item.contentId || item.title}`} item={item} kind={item.kind} />)}</section>{canLoadMore ? <div className="proto-chip-row" style={{ paddingTop: 36 }}><button className="proto-chip" onClick={() => setVisibleCount((count) => count + 6)}>Xem thêm thông báo <span className="material-symbols-outlined">expand_more</span></button></div> : null}</>}
    </PublicShell>
  )
}
