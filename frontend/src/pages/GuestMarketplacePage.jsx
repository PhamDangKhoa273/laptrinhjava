import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { getPublicListings } from '../services/listingService'
import { getPublishedContent, getPublicAnnouncementFeed, getActiveAnnouncement } from '../services/workflowService'
import { searchListings } from '../services/searchService'
import { SupportButton } from '../components/SupportButton.jsx'
import './GuestMarketplace.css'

const navItems = [
  { module: 'overview', to: '/guest/overview', icon: 'dashboard', label: 'Báº£ng Ä‘iá»u khiá»ƒn' },
  { module: 'search', to: '/guest/search', icon: 'search', label: 'TÃ¬m kiáº¿m' },
  { module: 'announcements', to: '/guest/announcements', icon: 'campaign', label: 'ThÃ´ng bÃ¡o' },
  { module: 'education', to: '/guest/education', icon: 'school', label: 'Kiáº¿n thá»©c' },
]

const PLACEHOLDER_IMG = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="%23e2e8f0"><rect width="400" height="300"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="16">NÃ´ng sáº£n BICAP</text></svg>')

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

function GuestShell({ module, children }) {
  return (
    <div className="mp-shell">
      <aside className="mp-side">
        <div className="mp-side__brand">BICAP</div>
        <div className="mp-side__profile">
          <span className="mp-side__profile-icon material-symbols-outlined">account_circle</span>
          <div>
            <div className="mp-side__profile-name">KhÃ´ng gian khÃ¡ch</div>
            <div className="mp-side__profile-badge">ÄÃ£ xÃ¡c thá»±c blockchain</div>
          </div>
        </div>
        <nav className="mp-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.module}
              to={item.to}
              className={({ isActive }) => `mp-nav__link${isActive || item.module === module ? ' mp-nav__link--active' : ''}`}
            >
              <span className="mp-nav__icon material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="mp-wrap">
        <header className="mp-top">
          <div style={{ fontWeight: 600, fontSize: 15 }}>{module === 'overview' ? 'BICAP' : ''}</div>
          <label className="mp-top__search" style={module !== 'overview' ? { marginLeft: 0 } : undefined}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, opacity: 0.5 }}>search</span>
            <input
              placeholder={module === 'search' ? 'TÃ¬m nhanh...' : 'TÃ¬m kiáº¿m sáº£n pháº©m, nÃ´ng tráº¡i, mÃ¹a vá»¥...'}
            />
          </label>
          <div className="mp-top__actions">
            <button className="mp-icon-btn material-symbols-outlined">notifications</button>
            <SupportButton />
            <button className="mp-icon-btn material-symbols-outlined">account_circle</button>
          </div>
        </header>
        {children}
      </div>
      <nav className="mp-mobile-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.module}
            to={item.to}
            className={({ isActive }) => `mp-mobile-nav__link${isActive || item.module === module ? ' mp-mobile-nav__link--active' : ''}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

function DashboardPage() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const result = await getPublicListings({ size: 9 })
        if (mounted) setListings(result.items || [])
      } catch (_) {
        if (mounted) setListings([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <GuestShell module="overview">
      <main className="mp-main">
        <section className="mp-hero">
          <p className="mp-hero__eyebrow">Thá»‹ trÆ°á»ng nÃ´ng sáº£n</p>
          <h1 className="mp-hero__title">Truy xuáº¥t nguá»“n gá»‘c nÃ´ng sáº£n tá»« trang tráº¡i Ä‘áº¿n bÃ n Äƒn.</h1>
          <p className="mp-hero__subtitle">KhÃ¡m phÃ¡ nÃ´ng sáº£n Viá»‡t Ä‘Æ°á»£c xÃ¡c thá»±c blockchain vá»›i truy xuáº¥t minh báº¡ch tá»« Ä‘áº¥t trá»“ng Ä‘áº¿n ká»‡ hÃ ng.</p>
          <div className="mp-hero__actions">
            <NavLink to="/guest/search" className="mp-btn-primary">KhÃ¡m phÃ¡ ngay</NavLink>
          </div>
        </section>

        {loading ? (
          <div className="mp-loading">
            <div className="mp-spinner"></div>
            <p>Äang táº£i dá»¯ liá»‡u...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="mp-empty">
            <span className="mp-empty__icon material-symbols-outlined">inventory_2</span>
            <h3>ChÆ°a cÃ³ sáº£n pháº©m</h3>
            <p>ChÆ°a cÃ³ sáº£n pháº©m nÃ o trÃªn thá»‹ trÆ°á»ng.</p>
          </div>
        ) : (
          <section>
            <div className="mp-section-title">
              <div>
                <h2>Sáº£n pháº©m ná»•i báº­t</h2>
                <p>CÃ¡c sáº£n pháº©m Ä‘Ã£ Ä‘Æ°á»£c xÃ¡c thá»±c vÃ  phÃª duyá»‡t.</p>
              </div>
            </div>
            <div className="mp-grid">
              {listings.slice(0, 6).map((p) => (
                <article className="mp-card" key={p.listingId}>
                  <div className="mp-card__image">
                    <img src={p.imageUrl || PLACEHOLDER_IMG} alt={p.title} />
                    <span className="mp-card__badge">{p.certification || 'ÄÃ£ xÃ¡c thá»±c'}</span>
                  </div>
                  <div className="mp-card__body">
                    <h3 className="mp-card__title">{p.title}</h3>
                    <div className="mp-card__meta">
                      <span className="mp-card__category">{p.productName || p.productCategory}</span>
                    </div>
                    <p className="mp-card__farm">
                      <span className="mp-card__farm-icon material-symbols-outlined">location_on</span>
                      {p.province}
                    </p>
                    <div className="mp-card__footer">
                      <span className="mp-card__price">{formatPrice(p.price)}</span>
                    </div>
                    <NavLink to={`/listings/${p.listingId}`} className="mp-btn-detail">Xem chi tiáº¿t</NavLink>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </GuestShell>
  )
}

function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (!query.trim()) return
    let mounted = true
    setLoading(true)
    searchListings({ keyword: query, size: 20 }).then((r) => {
      if (mounted) {
        setResults(r.items || [])
        setTotal(r.totalItems || 0)
        setSearched(true)
      }
    }).catch(() => {
      if (mounted) { setResults([]); setTotal(0); setSearched(true) }
    }).finally(() => {
      if (mounted) setLoading(false)
    })
    return () => { mounted = false }
  }, [query])

  return (
    <GuestShell module="search">
      <main className="mp-main mp-main--narrow">
        <section className="mp-hero">
          <h1 className="mp-hero__title">KhÃ¡m phÃ¡ chá»£ nÃ´ng sáº£n</h1>
          <p className="mp-hero__subtitle">Truy xuáº¥t sáº£n pháº©m tá»« Ä‘áº¥t trá»“ng Ä‘áº¿n ká»‡ hÃ ng báº±ng xÃ¡c thá»±c blockchain.</p>
          <div className="mp-hero__search">
            <div className="mp-hero__search-main">
              <input
                className="mp-hero__search-input"
                placeholder="TÃ¬m theo tÃªn sáº£n pháº©m, nÃ´ng tráº¡i hoáº·c Ä‘á»‹a Ä‘iá»ƒm..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </section>
        {searched && !loading && (
          <div className="mp-page-header" style={{ padding: '12px 0' }}>
            <h3 className="mp-page-header__title">
              Káº¿t quáº£ tÃ¬m kiáº¿m <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>{total} káº¿t quáº£</span>
            </h3>
          </div>
        )}
        {loading ? (
          <div className="mp-loading">
            <div className="mp-spinner"></div>
            <p>Äang tÃ¬m kiáº¿m...</p>
          </div>
        ) : results.length === 0 && searched ? (
          <div className="mp-empty">
            <span className="mp-empty__icon material-symbols-outlined">search_off</span>
            <h3>KhÃ´ng tÃ¬m tháº¥y</h3>
            <p>KhÃ´ng tÃ¬m tháº¥y káº¿t quáº£ phÃ¹ há»£p.</p>
          </div>
        ) : (
          <div className="mp-grid">
            {results.map((item) => (
              <article className="mp-card" key={item.listingId}>
                <div className="mp-card__image">
                  <img src={item.imageUrl || PLACEHOLDER_IMG} alt={item.title} />
                  <span className="mp-card__badge mp-card__badge--qr">Blockchain</span>
                </div>
                <div className="mp-card__body">
                  <h3 className="mp-card__title">{item.title}</h3>
                  <p className="mp-card__farm">
                    <span className="mp-card__farm-icon material-symbols-outlined">location_on</span>
                    {item.province || 'Viá»‡t Nam'}
                  </p>
                  <div className="mp-card__footer">
                    <span className="mp-card__price">{formatPrice(item.price)}</span>
                  </div>
                  <NavLink to={`/listings/${item.listingId}`} className="mp-btn-detail">Theo dÃµi lÃ´</NavLink>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </GuestShell>
  )
}

function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([])
  const [active, setActive] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    Promise.all([
      getPublicAnnouncementFeed().catch(() => []),
      getActiveAnnouncement().catch(() => null),
    ]).then(([feed, activeAnn]) => {
      if (mounted) {
        setAnnouncements(Array.isArray(feed) ? feed : [])
        setActive(activeAnn)
      }
    }).catch(() => {}).finally(() => {
      if (mounted) setLoading(false)
    })
    return () => { mounted = false }
  }, [])

  function toggleExpand(id) {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <GuestShell module="announcements">
      <main className="mp-main mp-main--narrow">
        <div className="mp-page-header">
          <h1 className="mp-page-header__title">ThÃ´ng bÃ¡o má»›i nháº¥t</h1>
          <p className="mp-page-header__desc">Cáº­p nháº­t thá»‹ trÆ°á»ng, nÃ¢ng cáº¥p há»‡ thá»‘ng vÃ  thÃ´ng tin mÃ¹a vá»¥ tá»« BICAP.</p>
        </div>

        {loading ? (
          <div className="mp-loading">
            <div className="mp-spinner"></div>
            <p>Äang táº£i...</p>
          </div>
        ) : (
          <>
            {active && (
              <article className="mp-ann-feature" onClick={() => toggleExpand('featured')} style={{cursor:'pointer'}}>
                <div className="mp-ann-feature__badge">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>campaign</span>
                  THÃ”NG BÃO Ná»”I Báº¬T
                </div>
                <h2 className="mp-ann-feature__title">{active.title}</h2>
                <p className="mp-ann-feature__text">{active.summary}</p>
                <small className="mp-ann-feature__date">
                  {new Date(active.publishAt || active.createdAt).toLocaleDateString('vi-VN')}
                </small>
                {expandedId === 'featured' && (
                  <div className="mp-ann-expanded" style={{marginTop:'1rem',padding:'1rem',background:'rgba(255,255,255,0.05)',borderRadius:'8px',lineHeight:1.8}}
                    dangerouslySetInnerHTML={{ __html: active.contentHtml }} />
                )}
              </article>
            )}
            <div className="mp-ann-list">
              {announcements.map((ann) => (
                <article className="mp-ann-list-item" key={ann.announcementId}
                  onClick={() => toggleExpand(ann.announcementId)}
                  style={{cursor:'pointer',padding:'1rem',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <span className="mp-ann-card__category">{ann.category || 'Cáº­p nháº­t'}</span>
                      <h4 className="mp-ann-card__title" style={{margin:'0.25rem 0'}}>{ann.title}</h4>
                      <p className="mp-ann-card__summary" style={{margin:0,opacity:0.7,fontSize:'0.9em'}}>{ann.summary}</p>
                      <small className="mp-ann-card__date">
                        {new Date(ann.publishAt || ann.createdAt).toLocaleDateString('vi-VN')}
                      </small>
                    </div>
                    <span className="material-symbols-outlined" style={{opacity:0.5}}>
                      {expandedId === ann.announcementId ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                  {expandedId === ann.announcementId && (
                    <div className="mp-ann-expanded" style={{marginTop:'1rem',padding:'1rem',background:'rgba(255,255,255,0.05)',borderRadius:'8px',lineHeight:1.8}}
                      dangerouslySetInnerHTML={{ __html: ann.body || ann.contentHtml }} />
                  )}
                </article>
              ))}
              {announcements.length === 0 && !active && (
                <div className="mp-empty">
                  <span className="mp-empty__icon material-symbols-outlined">notifications_off</span>
                  <h3>ChÆ°a cÃ³ thÃ´ng bÃ¡o</h3>
                  <p>ChÆ°a cÃ³ thÃ´ng bÃ¡o nÃ o.</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </GuestShell>
  )
}

function EducationPage() {
  const [content, setContent] = useState([])
  const [expandedId, setExpandedId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    getPublishedContent().then((data) => {
      if (mounted) setContent(Array.isArray(data) ? data : [])
    }).catch(() => {}).finally(() => {
      if (mounted) setLoading(false)
    })
    return () => { mounted = false }
  }, [])

  function toggleExpand(id) {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <GuestShell module="education">
      <main className="mp-main mp-main--narrow">
        <section className="mp-hero" style={{ marginBottom: 24 }}>
          <p className="mp-hero__eyebrow">Trao quyá»n minh báº¡ch</p>
          <h1 className="mp-hero__title">LÃ m chá»§ <b>nÃ´ng nghiá»‡p truy xuáº¥t Ä‘Æ°á»£c</b></h1>
          <p className="mp-hero__subtitle">TÃ¬m hiá»ƒu cÃ¡ch blockchain báº£o Ä‘áº£m má»—i nÃ´ng sáº£n Ä‘á»u cÃ³ cÃ¢u chuyá»‡n tá»« Ä‘áº¥t trá»“ng Ä‘áº¿n ká»‡ hÃ ng.</p>
        </section>

        <section>
          <div className="mp-section-title">
            <div>
              <h2>BÃ i viáº¿t kiáº¿n thá»©c</h2>
            </div>
          </div>
          {loading ? (
            <div className="mp-loading">
              <div className="mp-spinner"></div>
              <p>Äang táº£i...</p>
            </div>
          ) : content.length === 0 ? (
            <div className="mp-empty">
              <span className="mp-empty__icon material-symbols-outlined">menu_book</span>
              <h3>ChÆ°a cÃ³ bÃ i viáº¿t</h3>
              <p>ChÆ°a cÃ³ bÃ i viáº¿t nÃ o.</p>
            </div>
          ) : (
            <div className="mp-edu-list">
              {content.map((item) => (
                <article className="mp-edu-list-item" key={item.contentId}
                  onClick={() => toggleExpand(item.contentId)}
                  style={{cursor:'pointer',padding:'1rem',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                    <div>
                      <span style={{fontSize:'0.75em',textTransform:'uppercase',letterSpacing:'1px',opacity:0.5}}>
                        {item.contentType === 'GUIDE' ? 'HÆ°á»›ng dáº«n' : item.contentType === 'VIDEO' ? 'Video' : 'BÃ i viáº¿t'}
                      </span>
                      <h3 className="mp-edu-item__title" style={{margin:'0.25rem 0'}}>{item.title}</h3>
                      <p className="mp-edu-item__summary" style={{margin:0,opacity:0.7,fontSize:'0.9em'}}>{item.summary}</p>
                      <small style={{opacity:0.4,fontSize:'0.8em'}}>
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')} - {item.createdByName || 'BICAP'}
                      </small>
                    </div>
                    <span className="material-symbols-outlined" style={{opacity:0.5,marginTop:'0.25rem'}}>
                      {expandedId === item.contentId ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                  {expandedId === item.contentId && (
                    <div className="mp-edu-expanded" style={{marginTop:'1rem',padding:'1rem',background:'rgba(255,255,255,0.05)',borderRadius:'8px',lineHeight:1.8,whiteSpace:'pre-wrap'}}>
                      {item.body}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </GuestShell>
  )
}

export function GuestMarketplacePage({ module = 'overview' }) {
  if (module === 'search') return <SearchPage />
  if (module === 'announcements') return <AnnouncementsPage />
  if (module === 'education') return <EducationPage />
  return <DashboardPage />
}

