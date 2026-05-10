import { useEffect, useState } from 'react'
import { PublicShell } from '../components/public/PublicShell.jsx'
import { PublicState } from '../components/public/PublicState.jsx'
import { getPublishedContent } from '../services/workflowService.js'

function formatDate(value) { return value ? new Date(value).toLocaleDateString('vi-VN') : '' }

function contentTypeLabel(type) {
  if (type === 'GUIDE') return { label: 'Hướng dẫn', icon: 'menu_book' }
  if (type === 'VIDEO') return { label: 'Video', icon: 'play_circle' }
  return { label: 'Bài viết', icon: 'article' }
}

export function PublicEducationPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    let mounted = true
    getPublishedContent()
      .then((data) => { if (mounted) setItems(Array.isArray(data) ? data : []) })
      .catch(() => { if (mounted) setError('Không thể tải nội dung kiến thức.') })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  return (
    <PublicShell>
      <header className="ann-header">
        <span className="proto-kicker"><span className="material-symbols-outlined fill">school</span> Kiến thức nông nghiệp</span>
        <h1 className="proto-h1">BICAP Education</h1>
        <p style={{ color: 'var(--proto-on-surface-variant)', marginTop: 8 }}>
          Bài viết, hướng dẫn và nội dung giáo dục về nông nghiệp bền vững, canh tác hữu cơ và an toàn thực phẩm.
        </p>
      </header>
      <main className="proto-page">
        {loading ? (
          <div className="mp-loading"><div className="mp-spinner"></div><p>Đang tải...</p></div>
        ) : error ? (
          <PublicState title="Không thể tải nội dung" message={error} />
        ) : items.length === 0 ? (
          <PublicState title="Chưa có bài viết" message="Nội dung kiến thức sẽ được cập nhật sớm." />
        ) : (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map((item) => {
              const ct = contentTypeLabel(item.contentType)
              const isOpen = expandedId === item.contentId
              return (
                <article key={item.contentId}
                  onClick={() => setExpandedId(isOpen ? null : item.contentId)}
                  style={{
                    cursor: 'pointer', background: 'var(--proto-surface)', borderRadius: 12, padding: '20px 24px',
                    border: '1px solid var(--proto-outline-variant)', transition: 'box-shadow .2s',
                    boxShadow: isOpen ? '0 2px 12px rgba(0,0,0,.08)' : 'none',
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span className="proto-chip active" style={{ borderRadius: 6, padding: '4px 8px', fontSize: 11 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{ct.icon}</span> {ct.label}
                        </span>
                        <small style={{ color: 'var(--proto-on-surface-variant)' }}>
                          {formatDate(item.createdAt)} — {item.createdByName || 'BICAP'}
                        </small>
                      </div>
                      <h3 style={{ margin: '4px 0', fontSize: 18 }}>{item.title}</h3>
                      {item.summary ? <p style={{ margin: '4px 0 0', color: 'var(--proto-on-surface-variant)', fontSize: 14 }}>{item.summary}</p> : null}
                    </div>
                    <span className="material-symbols-outlined" style={{ color: 'var(--proto-on-surface-variant)', marginTop: 4 }}>
                      {isOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                  {isOpen ? (
                    <div style={{
                      marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--proto-outline-variant)',
                      lineHeight: 1.8, whiteSpace: 'pre-wrap', fontSize: 14,
                    }}>
                      {item.body}
                    </div>
                  ) : null}
                </article>
              )
            })}
          </section>
        )}
      </main>
    </PublicShell>
  )
}
