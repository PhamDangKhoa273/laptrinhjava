import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getPublicListings } from '../services/listingService'
import { searchListings } from '../services/searchService'
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
    </div>
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
  const [loading, setLoading] = useState(true)
  const [isDebouncing, setIsDebouncing] = useState(false)
  const [error, setError] = useState(null)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, province, minPrice, maxPrice, sort, page])

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
          <p className="mp-hero__eyebrow">SÀN NÔNG SẢN BICAP</p>
          <h1 className="mp-hero__title">TV1 + TV2 đã thành marketplace/search tử tế</h1>
          <p className="mp-hero__subtitle">
            Tìm theo tên sản phẩm, mã lô, tỉnh thành, khoảng giá. Có phân trang, sắp xếp, debounce, đồng bộ URL, và nối thẳng sang traceability công khai.
          </p>
        </div>

        <form className="mp-hero__search" onSubmit={(event) => event.preventDefault()} style={{ display: 'grid', gap: 10 }}>
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm hoặc mã lô"
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(0) }}
            className="mp-hero__search-input"
          />
          <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
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
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
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
          <span className="mp-stat__value">{stats.provinceCount || '—'}</span>
          <span className="mp-stat__label">Tỉnh thành</span>
        </div>
      </div>

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
}
