import { useEffect, useMemo, useState } from 'react'
import { PublicShell } from '../components/public/PublicShell.jsx'
import { PublicState } from '../components/public/PublicState.jsx'
import { getPublicAnnouncementFeed } from '../services/workflowService.js'
import { sanitizeAnnouncementHtml } from '../utils/announcementSanitizer.js'

const filters = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Tin tức', value: 'NEWS' },
  { label: 'Sự kiện', value: 'EVENT' },
  { label: 'Chính sách', value: 'POLICY' },
  { label: 'Thông báo', value: 'ANNOUNCEMENT' },
]

function formatDate(value) { return value ? new Date(value).toLocaleDateString('vi-VN') : '' }
function translateTag(value) {
  const text = String(value || '')
  if (text === 'NEWS') return 'TIN TỨC'
  if (text === 'EVENT') return 'SỰ KIỆN'
  if (text === 'POLICY') return 'CHÍNH SÁCH'
  if (text === 'ANNOUNCEMENT') return 'THÔNG BÁO'
  const lower = text.toLowerCase()
  if (lower.includes('system')) return 'HỆ THỐNG'
  if (lower.includes('guide')) return 'HƯỚNG DẪN'
  if (lower.includes('article')) return 'BÀI VIẾT'
  return 'THÔNG BÁO'
}
function matchesFilter(item, filter) {
  if (filter === 'all') return true
  const text = `${item.category || ''} ${item.contentType || ''} ${item.kind || ''} ${item.title || ''} ${item.summary || ''}`.toLowerCase()
  return text.includes(filter.toLowerCase())
}
function getReadableBody(item) {
  if (item.body || item.contentHtml) return item.body || item.contentHtml
  const title = String(item.title || '').toLowerCase()
  if (title.includes('qr') || title.includes('truy xuất')) return '<p>Khi quét mã QR trên sản phẩm, khách hàng có thể xem tên nông trại, khu vực sản xuất, ngày thu hoạch, hạng chất lượng và nhật ký sản xuất công khai.</p><p>Nếu mã QR hợp lệ, hệ thống sẽ hiển thị hồ sơ truy xuất của lô hàng.</p>'
  if (title.includes('listing')) return '<p>Để sản phẩm xuất hiện trên chợ nông sản công khai, nông trại cần tạo mùa vụ, ghi nhận lô hàng và gửi listing để quản trị viên kiểm tra.</p><p>Sau khi được duyệt, listing hiển thị thông tin: tên sản phẩm, giá, nông trại, khu vực, chất lượng và đường dẫn truy xuất QR.</p>'
  return '<p>Nội dung được BICAP công bố để khách truy cập nắm thông tin cần thiết.</p>'
}

export function PublicAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    let mounted = true
    getPublicAnnouncementFeed()
      .then((data) => { if (mounted) setAnnouncements(Array.isArray(data) ? data : []) })
      .catch(() => { if (mounted) setError('Không thể tải thông báo.') })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const filtered = announcements.filter((item) =>
    `${item.title || ''} ${item.summary || ''} ${item.category || ''}`.toLowerCase().includes(query.toLowerCase()) &&
    matchesFilter(item, categoryFilter)
  )

  return (
    <PublicShell>
      <header className="ann-header">
        <span className="proto-kicker"><span className="material-symbols-outlined fill">campaign</span> Thông báo công khai BICAP</span>
        <h1 className="proto-h1">Thông báo</h1>
      </header>
      <section className="ann-tools">
        <div className="proto-chip-row" style={{ margin: 0 }}>
          {filters.map((filter) => (
            <button key={filter.value} className={`proto-chip ${categoryFilter === filter.value ? 'active' : ''}`} onClick={() => setCategoryFilter(filter.value)}>
              {filter.label}
            </button>
          ))}
        </div>
        <div className="proto-search" style={{ margin: 0, maxWidth: 340, boxShadow: 'none', borderRadius: 12 }}>
          <span className="material-symbols-outlined">search</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm thông báo..." />
        </div>
      </section>
      <main className="proto-page">
        {loading ? (
          <div className="mp-loading" style={{ padding: 60, textAlign: 'center' }}>
            <div className="mp-spinner"></div>
            <p>Đang tải...</p>
          </div>
        ) : error ? (
          <PublicState title="Chưa tải được thông báo" message={error} />
        ) : filtered.length === 0 ? (
          <PublicState title="Chưa có thông báo" message="Khi BICAP có cập nhật, nội dung sẽ hiển thị tại đây." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((item) => {
              const id = item.announcementId || item.contentId || item.title
              const isOpen = expandedId === id
              const tag = translateTag(item.category || item.contentType || item.kind)
              return (
                <article key={id}
                  onClick={() => setExpandedId(isOpen ? null : id)}
                  style={{
                    cursor: 'pointer', background: 'var(--proto-surface)', borderRadius: 12, padding: '16px 20px',
                    border: '1px solid var(--proto-outline-variant)',
                    boxShadow: isOpen ? '0 2px 12px rgba(0,0,0,.08)' : 'none',
                    transition: 'box-shadow .2s',
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span className="ann-tag">{tag}</span>
                        <small style={{ color: 'var(--proto-on-surface-variant)' }}>{formatDate(item.publishAt || item.createdAt)}</small>
                      </div>
                      <h3 style={{ margin: '4px 0', fontSize: 16 }}>{item.title}</h3>
                      {item.summary ? <p style={{ margin: '2px 0 0', color: 'var(--proto-on-surface-variant)', fontSize: 13 }}>{item.summary}</p> : null}
                    </div>
                    <span className="material-symbols-outlined" style={{ color: 'var(--proto-on-surface-variant)', marginTop: 4 }}>
                      {isOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                  {isOpen ? (
                    <div style={{
                      marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--proto-outline-variant)',
                      lineHeight: 1.8, fontSize: 14,
                    }} dangerouslySetInnerHTML={{ __html: sanitizeAnnouncementHtml(getReadableBody(item)) }} />
                  ) : null}
                </article>
              )
            })}
          </div>
        )}
      </main>
    </PublicShell>
  )
}
