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
        <h1 className="proto-h1">Kiến thức</h1>
        <p className="proto-lead">
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
          <section className="public-content-list">
            {items.map((item) => {
              const ct = contentTypeLabel(item.contentType)
              const isOpen = expandedId === item.contentId
              return (
                <article key={item.contentId} onClick={() => setExpandedId(isOpen ? null : item.contentId)} className={`public-content-card ${isOpen ? 'open' : ''}`}>
                  <div className="public-content-head">
                    <div className="public-content-icon"><span className="material-symbols-outlined">{ct.icon}</span></div>
                    <div className="public-content-main">
                      <div className="public-content-meta">
                        <span className="ann-tag">{ct.label}</span>
                        <small>{formatDate(item.createdAt)} - {item.createdByName || 'BICAP'}</small>
                      </div>
                      <h3>{item.title}</h3>
                      {item.summary ? <p>{item.summary}</p> : null}
                    </div>
                    <span className="material-symbols-outlined public-content-toggle">{isOpen ? 'expand_less' : 'expand_more'}</span>
                  </div>
                  {isOpen ? <div className="public-content-body prewrap">{item.body}</div> : null}
                </article>
              )
            })}
          </section>
        )}
      </main>
    </PublicShell>
  )
}
