<<<<<<< Updated upstream
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getPublicListings } from '../services/listingService'
import { searchListings } from '../services/searchService'
import { getPublishedContent } from '../services/workflowService.js'
import './GuestMarketplace.css'

function formatPrice(price) {
  if (price === null || price === undefined || price === '') return 'Liên hệ'
  return `${Number(price).toLocaleString('vi-VN')}đ`
}

function ProductCard({ item, onOpen }) {
  const placeholderColors = [
    'linear-gradient(135deg, #2d5016 0%, #4a7c2e 100%)',
    'linear-gradient(135deg, #1a3a0a 0%, #3d6b1e 100%)',
    'linear-gradient(135deg, #0f4030 0%, #1a6b4a 100%)',
    'linear-gradient(135deg, #2e1065 0%, #4c1d95 100%)',
    'linear-gradient(135deg, #7c2d12 0%, #c2410c 100%)',
  ]
  const bgColor = placeholderColors[Math.abs((item.listingId || 0) % placeholderColors.length)]
  const traceHref = item.batchId ? `/public/trace?batchId=${item.batchId}` : '/public/trace'

  return (
    <div className="mp-card" onClick={onOpen} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter') onOpen?.() }}>
      <div className="mp-card__image" style={{ background: item.imageUrl ? undefined : bgColor }}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} onError={(event) => { event.target.style.display = 'none' }} />
        ) : (
          <div className="mp-card__placeholder">
            <span className="mp-card__placeholder-icon">🌱</span>
            <span className="mp-card__placeholder-text">{item.productName || 'Nông sản'}</span>
          </div>
        )}
        {item.qualityGrade ? <span className="mp-card__badge">{item.qualityGrade}</span> : null}
        {item.batchCode ? <span className="mp-card__badge mp-card__badge--qr">🔗 QR</span> : null}
      </div>

      <div className="mp-card__body">
        <h3 className="mp-card__title">{item.title}</h3>
        <p className="mp-card__farm">🏡 {item.farmName || 'Nông trại BICAP'}</p>
        {item.province ? <span className="mp-card__category">{item.province}</span> : null}
        {item.description ? <p className="mp-card__desc">{item.description}</p> : null}

        <div className="mp-card__meta">
          <span className="mp-card__qty">📦 {Number(item.quantityAvailable || 0).toLocaleString('vi-VN')} {item.unit || 'kg'}</span>
          {item.batchCode ? <span className="mp-card__batch">🔗 {item.batchCode}</span> : null}
        </div>

        <div className="mp-card__meta">
          {item.productCode ? <span className="mp-card__batch">Mã SP: {item.productCode}</span> : null}
          {item.farmCode ? <span className="mp-card__batch">Mã farm: {item.farmCode}</span> : null}
        </div>

        <div className="mp-card__footer">
          <span className="mp-card__price">{formatPrice(item.price)}</span>
          <span className="mp-card__unit">/ {item.unit || 'kg'}</span>
        </div>

        <div className="mp-card__actions" style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
          <Link className="mp-retry-btn" to={traceHref}>
            Xem nguồn gốc lô hàng này
          </Link>
        </div>
      </div>
=======
import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { getPublicListings } from '../services/listingService'
import { getPublishedContent, getPublicAnnouncementFeed, getActiveAnnouncement } from '../services/workflowService'
import { searchListings } from '../services/searchService'
import './GuestMarketplace.css'

const navItems = [
  { module: 'overview', to: '/guest/overview', icon: 'dashboard', label: 'Bảng điều khiển' },
  { module: 'search', to: '/guest/search', icon: 'search', label: 'Tìm kiếm' },
  { module: 'announcements', to: '/guest/announcements', icon: 'campaign', label: 'Thông báo' },
  { module: 'education', to: '/guest/education', icon: 'school', label: 'Kiến thức' },
]

const PLACEHOLDER_IMG = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="%23e2e8f0"><rect width="400" height="300"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="16">Nông sản BICAP</text></svg>')

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
            <div className="mp-side__profile-name">Không gian khách</div>
            <div className="mp-side__profile-badge">Đã xác thực blockchain</div>
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
              placeholder={module === 'search' ? 'Tìm nhanh...' : 'Tìm kiếm sản phẩm, nông trại, mùa vụ...'}
            />
          </label>
          <div className="mp-top__actions">
            <button className="mp-icon-btn material-symbols-outlined">notifications</button>
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
>>>>>>> Stashed changes
    </div>
  )
}

<<<<<<< Updated upstream
function ContentCard({ item }) {
  return (
    <article className="mp-card" style={{ cursor: 'default' }}>
      <div className="mp-card__image" style={{ background: item.mediaUrl ? '#102a43' : 'linear-gradient(135deg, #1f2937 0%, #374151 100%)' }}>
        {item.mediaUrl ? (
          <img src={item.mediaUrl} alt={item.title} onError={(event) => { event.target.style.display = 'none' }} />
        ) : (
          <div className="mp-card__placeholder">
            <span className="mp-card__placeholder-icon">📘</span>
            <span className="mp-card__placeholder-text">{item.contentType}</span>
          </div>
        )}
      </div>
      <div className="mp-card__body">
        <span className="mp-card__category">{item.contentType}</span>
        <h3 className="mp-card__title">{item.title}</h3>
        {item.summary ? <p className="mp-card__desc">{item.summary}</p> : null}
        <p className="mp-card__farm">Tác giả: {item.createdByName || 'BICAP'}</p>
        <div className="mp-card__actions" style={{ marginTop: 12 }}>
          <Link className="mp-retry-btn" to={`/dashboard/guest?content=${item.slug}`}>Xem nội dung</Link>
        </div>
      </div>
    </article>
  )
}

function ProductCardSkeleton() {
  return (
    <div className="mp-card mp-card--skeleton" aria-hidden="true">
      <div className="mp-card__image mp-skeleton mp-skeleton--image" />
      <div className="mp-card__body">
        <div className="mp-skeleton mp-skeleton--title" />
        <div className="mp-skeleton mp-skeleton--line" />
        <div className="mp-skeleton mp-skeleton--chip" />
        <div className="mp-skeleton mp-skeleton--line" />
        <div className="mp-skeleton mp-skeleton--line short" />
        <div className="mp-skeleton mp-skeleton--price" />
        <div className="mp-skeleton mp-skeleton--button" />
      </div>
    </div>
  )
}

function parsePositiveInt(value, fallback) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

export function GuestMarketplacePage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialSearch = searchParams.get('keyword') || ''
  const initialProvince = searchParams.get('province') || ''
  const initialMinPrice = searchParams.get('minPrice') || ''
  const initialMaxPrice = searchParams.get('maxPrice') || ''
  const initialSort = searchParams.get('sort') || 'createdAt,desc'
  const initialPage = parsePositiveInt(searchParams.get('page'), 0)
  const initialSize = parsePositiveInt(searchParams.get('size'), 9) || 9

  const [items, setItems] = useState([])
  const [contentItems, setContentItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [contentLoading, setContentLoading] = useState(true)
  const [isDebouncing, setIsDebouncing] = useState(false)
  const [error, setError] = useState(null)
  const [contentError, setContentError] = useState(null)
  const [search, setSearch] = useState(initialSearch)
  const [province, setProvince] = useState(initialProvince)
  const [minPrice, setMinPrice] = useState(initialMinPrice)
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice)
  const [sort, setSort] = useState(initialSort)
  const [page, setPage] = useState(initialPage)
  const [size] = useState(initialSize)
  const [meta, setMeta] = useState({ page: initialPage, size: initialSize, totalItems: 0, totalPages: 0, sort: initialSort })
  const debounceRef = useRef(null)

  const hasActiveFilters = Boolean(search || province || minPrice || maxPrice || sort !== 'createdAt,desc')

  useEffect(() => {
    const nextParams = new URLSearchParams()
    if (search) nextParams.set('keyword', search)
    if (province) nextParams.set('province', province)
    if (minPrice) nextParams.set('minPrice', minPrice)
    if (maxPrice) nextParams.set('maxPrice', maxPrice)
    if (sort !== 'createdAt,desc') nextParams.set('sort', sort)
    if (page > 0) nextParams.set('page', String(page))
    if (size !== 9) nextParams.set('size', String(size))
    setSearchParams(nextParams, { replace: true })
  }, [search, province, minPrice, maxPrice, sort, page, size, setSearchParams])

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    setIsDebouncing(true)
    debounceRef.current = setTimeout(() => {
      if (hasActiveFilters) {
        handleSearch(page)
      } else {
        loadDefaultListings(page)
      }
      setIsDebouncing(false)
    }, 350)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search, province, minPrice, maxPrice, sort, page])

  useEffect(() => {
    async function loadContent() {
      try {
        setContentLoading(true)
        const data = await getPublishedContent()
        setContentItems(Array.isArray(data) ? data : [])
        setContentError(null)
      } catch (err) {
        setContentError('Không tải được nội dung giáo dục công khai.')
      } finally {
        setContentLoading(false)
      }
    }

    loadContent()
  }, [])

  async function loadDefaultListings(targetPage = 0) {
    try {
      setLoading(true)
      setError(null)
      const result = await getPublicListings({ page: targetPage, size, sort: 'createdAt,desc' })
      setItems(Array.isArray(result.items) ? result.items : [])
      setMeta(result)
    } catch (err) {
      console.error(err)
      setError('Không thể tải danh sách listing công khai.')
      setItems([])
      setMeta({ page: 0, size, totalItems: 0, totalPages: 0, sort: 'createdAt,desc' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(targetPage = 0) {
    try {
      setLoading(true)
      setError(null)
      const result = await searchListings({
        keyword: search,
        province,
        minPrice,
        maxPrice,
        page: targetPage,
        size,
        sort,
      })
      setItems(Array.isArray(result.items) ? result.items : [])
      setMeta(result)
    } catch (err) {
      console.error(err)
      setError('Không thể tìm kiếm listing theo bộ lọc hiện tại.')
      setItems([])
      setMeta({ page: 0, size, totalItems: 0, totalPages: 0, sort })
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setSearch('')
    setProvince('')
    setMinPrice('')
    setMaxPrice('')
    setSort('createdAt,desc')
    setPage(0)
  }

  const stats = useMemo(() => {
    const farmCount = [...new Set(items.map((item) => item.farmName).filter(Boolean))].length
    const provinceCount = [...new Set(items.map((item) => item.province).filter(Boolean))].length
    return { farmCount, provinceCount }
  }, [items])

  const currentPage = meta.page || 0
  const totalPages = meta.totalPages || 0
  const showSkeleton = loading || isDebouncing

  return (
    <section className="marketplace">
      <div className="mp-hero">
        <div className="mp-hero__content">
          <p className="mp-hero__eyebrow">SÀN GIAO DỊCH</p>
          <p className="mp-hero__subtitle">Chợ nông sản sạch</p>
        </div>

        <form className="mp-hero__search" onSubmit={(event) => event.preventDefault()}>
          <div className="mp-hero__search-main">
            <input
              type="text"
              placeholder="Tìm theo tên sản phẩm hoặc mã lô"
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(0) }}
              className="mp-hero__search-input"
            />
          </div>
          <div className="mp-hero__filters-grid">
            <input
              type="text"
              placeholder="Tỉnh thành"
              value={province}
              onChange={(event) => { setProvince(event.target.value); setPage(0) }}
              className="mp-hero__search-input"
            />
            <input
              type="number"
              min="0"
              placeholder="Giá từ"
              value={minPrice}
              onChange={(event) => { setMinPrice(event.target.value); setPage(0) }}
              className="mp-hero__search-input"
            />
            <input
              type="number"
              min="0"
              placeholder="Giá đến"
              value={maxPrice}
              onChange={(event) => { setMaxPrice(event.target.value); setPage(0) }}
              className="mp-hero__search-input"
            />
            <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(0) }} className="mp-hero__search-input">
              <option value="createdAt,desc">Mới nhất</option>
              <option value="price,asc">Giá tăng dần</option>
              <option value="price,desc">Giá giảm dần</option>
              <option value="title,asc">Tên A-Z</option>
            </select>
          </div>
          <div className="mp-hero__actions">
            <button className="mp-retry-btn" type="button" onClick={handleReset}>Xóa bộ lọc</button>
            {isDebouncing ? <span className="mp-hint">Đang cập nhật kết quả...</span> : null}
          </div>
        </form>
      </div>

      <div className="mp-stats">
        <div className="mp-stat">
          <span className="mp-stat__value">{meta.totalItems || items.length}</span>
          <span className="mp-stat__label">Listing</span>
        </div>
        <div className="mp-stat">
          <span className="mp-stat__value">{stats.farmCount || '—'}</span>
          <span className="mp-stat__label">Nông trại</span>
        </div>
        <div className="mp-stat">
          <span className="mp-stat__value">{contentItems.length || '—'}</span>
          <span className="mp-stat__label">Nội dung công khai</span>
        </div>
      </div>

      <section style={{ marginBottom: 28 }}>
        <div className="section-heading" style={{ marginBottom: 16 }}>
          <div>
            <p className="eyebrow">Guest educational content</p>
            <h2 style={{ marginBottom: 6 }}>Bài viết, video và kiến thức công khai</h2>
            <p style={{ margin: 0, color: '#5f6b7a' }}>Phần này giúp phase 2-4 tròn hơn thay vì chỉ có marketplace.</p>
          </div>
        </div>
        {contentError ? <div className="mp-empty"><p>{contentError}</p></div> : null}
        {contentLoading ? (
          <div className="mp-grid">
            {Array.from({ length: 3 }).map((_, index) => <ProductCardSkeleton key={`content-${index}`} />)}
          </div>
        ) : contentItems.length === 0 ? (
          <div className="mp-empty">
            <span className="mp-empty__icon">📘</span>
            <h3>Chưa có nội dung công khai</h3>
            <p>Admin có thể tạo bài viết/video từ trang vận hành.</p>
          </div>
        ) : (
          <div className="mp-grid">
            {contentItems.slice(0, 6).map((item) => <ContentCard key={item.contentId} item={item} />)}
          </div>
        )}
      </section>

      {error && !showSkeleton ? (
        <div className="mp-empty">
          <span className="mp-empty__icon">⚠️</span>
          <p>{error}</p>
          <button className="mp-retry-btn" onClick={() => (hasActiveFilters ? handleSearch(page) : loadDefaultListings(page))}>Thử lại</button>
        </div>
      ) : showSkeleton ? (
        <div className="mp-grid">
          {Array.from({ length: size }).map((_, index) => <ProductCardSkeleton key={index} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="mp-empty">
          <span className="mp-empty__icon">🌿</span>
          <h3>Chưa có listing phù hợp</h3>
          <p>Thử đổi bộ lọc hoặc quay lại sau khi farm đăng thêm hàng lên sàn.</p>
        </div>
      ) : (
        <>
          <div className="mp-grid">
            {items.map((item) => (
              <ProductCard key={item.listingId} item={item} onOpen={() => navigate(`/listings/${item.listingId}`)} />
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, gap: 12, flexWrap: 'wrap' }}>
            <p style={{ margin: 0, color: '#5f6b7a' }}>
              Trang {currentPage + 1} / {Math.max(totalPages, 1)}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="mp-retry-btn" type="button" disabled={currentPage <= 0 || showSkeleton} onClick={() => setPage((prev) => Math.max(prev - 1, 0))}>
                Trang trước
              </button>
              <button className="mp-retry-btn" type="button" disabled={showSkeleton || totalPages === 0 || currentPage + 1 >= totalPages} onClick={() => setPage((prev) => prev + 1)}>
                Trang sau
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  )
=======
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
          <p className="mp-hero__eyebrow">Thị trường nông sản</p>
          <h1 className="mp-hero__title">Truy xuất nguồn gốc nông sản từ trang trại đến bàn ăn.</h1>
          <p className="mp-hero__subtitle">Khám phá nông sản Việt được xác thực blockchain với truy xuất minh bạch từ đất trồng đến kệ hàng.</p>
          <div className="mp-hero__actions">
            <NavLink to="/guest/search" className="mp-btn-primary">Khám phá ngay</NavLink>
          </div>
        </section>

        {loading ? (
          <div className="mp-loading">
            <div className="mp-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="mp-empty">
            <span className="mp-empty__icon material-symbols-outlined">inventory_2</span>
            <h3>Chưa có sản phẩm</h3>
            <p>Chưa có sản phẩm nào trên thị trường.</p>
          </div>
        ) : (
          <section>
            <div className="mp-section-title">
              <div>
                <h2>Sản phẩm nổi bật</h2>
                <p>Các sản phẩm đã được xác thực và phê duyệt.</p>
              </div>
            </div>
            <div className="mp-grid">
              {listings.slice(0, 6).map((p) => (
                <article className="mp-card" key={p.listingId}>
                  <div className="mp-card__image">
                    <img src={p.imageUrl || PLACEHOLDER_IMG} alt={p.title} />
                    <span className="mp-card__badge">{p.certification || 'Đã xác thực'}</span>
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
                    <NavLink to={`/listings/${p.listingId}`} className="mp-btn-detail">Xem chi tiết</NavLink>
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
          <h1 className="mp-hero__title">Khám phá chợ nông sản</h1>
          <p className="mp-hero__subtitle">Truy xuất sản phẩm từ đất trồng đến kệ hàng bằng xác thực blockchain.</p>
          <div className="mp-hero__search">
            <div className="mp-hero__search-main">
              <input
                className="mp-hero__search-input"
                placeholder="Tìm theo tên sản phẩm, nông trại hoặc địa điểm..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </section>
        {searched && !loading && (
          <div className="mp-page-header" style={{ padding: '12px 0' }}>
            <h3 className="mp-page-header__title">
              Kết quả tìm kiếm <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>{total} kết quả</span>
            </h3>
          </div>
        )}
        {loading ? (
          <div className="mp-loading">
            <div className="mp-spinner"></div>
            <p>Đang tìm kiếm...</p>
          </div>
        ) : results.length === 0 && searched ? (
          <div className="mp-empty">
            <span className="mp-empty__icon material-symbols-outlined">search_off</span>
            <h3>Không tìm thấy</h3>
            <p>Không tìm thấy kết quả phù hợp.</p>
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
                    {item.province || 'Việt Nam'}
                  </p>
                  <div className="mp-card__footer">
                    <span className="mp-card__price">{formatPrice(item.price)}</span>
                  </div>
                  <NavLink to={`/listings/${item.listingId}`} className="mp-btn-detail">Theo dõi lô</NavLink>
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
          <h1 className="mp-page-header__title">Thông báo mới nhất</h1>
          <p className="mp-page-header__desc">Cập nhật thị trường, nâng cấp hệ thống và thông tin mùa vụ từ BICAP.</p>
        </div>

        {loading ? (
          <div className="mp-loading">
            <div className="mp-spinner"></div>
            <p>Đang tải...</p>
          </div>
        ) : (
          <>
            {active && (
              <article className="mp-ann-feature" onClick={() => toggleExpand('featured')} style={{cursor:'pointer'}}>
                <div className="mp-ann-feature__badge">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>campaign</span>
                  THÔNG BÁO NỔI BẬT
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
                      <span className="mp-ann-card__category">{ann.category || 'Cập nhật'}</span>
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
                  <h3>Chưa có thông báo</h3>
                  <p>Chưa có thông báo nào.</p>
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
          <p className="mp-hero__eyebrow">Trao quyền minh bạch</p>
          <h1 className="mp-hero__title">Làm chủ <b>nông nghiệp truy xuất được</b></h1>
          <p className="mp-hero__subtitle">Tìm hiểu cách blockchain bảo đảm mỗi nông sản đều có câu chuyện từ đất trồng đến kệ hàng.</p>
        </section>

        <section>
          <div className="mp-section-title">
            <div>
              <h2>Bài viết kiến thức</h2>
            </div>
          </div>
          {loading ? (
            <div className="mp-loading">
              <div className="mp-spinner"></div>
              <p>Đang tải...</p>
            </div>
          ) : content.length === 0 ? (
            <div className="mp-empty">
              <span className="mp-empty__icon material-symbols-outlined">menu_book</span>
              <h3>Chưa có bài viết</h3>
              <p>Chưa có bài viết nào.</p>
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
                        {item.contentType === 'GUIDE' ? 'Hướng dẫn' : item.contentType === 'VIDEO' ? 'Video' : 'Bài viết'}
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
>>>>>>> Stashed changes
}
