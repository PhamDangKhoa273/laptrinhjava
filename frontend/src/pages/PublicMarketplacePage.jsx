import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PublicProductCard } from '../components/public/PublicProductCard.jsx'
import { PublicShell } from '../components/public/PublicShell.jsx'
import { PublicSkeletonGrid, PublicState } from '../components/public/PublicState.jsx'
import { getPublicListings } from '../services/listingService'
import { searchListings, getFilterOptions } from '../services/searchService'
import { repairText } from '../utils/textRepair'

function parsePositiveInt(value, fallback) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

function classifyListing(item) {
  const explicit = repairText(item.productCategory || item.categoryName || '')
  if (explicit) return explicit

  const text = repairText(`${item.title || ''} ${item.productName || ''}`).toLowerCase()
  const rules = [
    ['Cà chua', ['cà chua', 'tomato']],
    ['Nấm', ['nấm', 'mushroom']],
    ['Cà phê', ['cà phê', 'coffee', 'arabica', 'robusta']],
    ['Trái cây', ['trái cây', 'xoài', 'cam', 'bưởi', 'chuối', 'dâu', 'sầu riêng']],
    ['Rau củ', ['rau', 'cải', 'xà lách', 'khoai', 'củ']],
    ['Ngũ cốc', ['gạo', 'lúa', 'bắp', 'ngô']],
  ]
  return rules.find(([, keys]) => keys.some((key) => text.includes(key)))?.[0] || ''
}

function uniqueClean(values) {
  return [...new Set(values.map(repairText).map((v) => String(v || '').trim()).filter(Boolean))]
}

function uniqueRaw(values) {
  return [...new Set(values.map((v) => String(v || '').trim()).filter(Boolean))]
}

export function PublicMarketplacePage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDebouncing, setIsDebouncing] = useState(false)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState(searchParams.get('keyword') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || 'createdAt,desc')
  const [page, setPage] = useState(parsePositiveInt(searchParams.get('page'), 0))
  const [size] = useState(8)
  const [meta, setMeta] = useState({ page: 0, size, totalItems: 0, totalPages: 0 })
  const debounceRef = useRef(null)

  const [showFilters, setShowFilters] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '')
  const [provinceFilter, setProvinceFilter] = useState(searchParams.get('province') || '')
  const [certFilter, setCertFilter] = useState(searchParams.get('certification') || '')
  const [availableOnly, setAvailableOnly] = useState(searchParams.get('available') === 'true')
  const [filterOpts, setFilterOpts] = useState({ categories: [], provinces: [], certifications: [] })

  const categoryOptions = useMemo(() => {
    const fromApi = filterOpts.categories || []
    const fromListings = items.map(classifyListing)
    return uniqueClean([...fromApi, ...fromListings])
  }, [filterOpts.categories, items])
  const provinceOptions = useMemo(() => uniqueRaw(filterOpts.provinces || []), [filterOpts.provinces])
  const certOptions = useMemo(() => uniqueRaw(filterOpts.certifications || []), [filterOpts.certifications])
  const hasActiveSearch = Boolean(search || sort !== 'createdAt,desc' || categoryFilter || provinceFilter || certFilter || availableOnly)

  useEffect(() => {
    getFilterOptions().then(setFilterOpts).catch(() => {})
  }, [])

  useEffect(() => {
    const nextParams = new URLSearchParams()
    if (search) nextParams.set('keyword', search)
    if (sort !== 'createdAt,desc') nextParams.set('sort', sort)
    if (page > 0) nextParams.set('page', String(page))
    if (categoryFilter) nextParams.set('category', categoryFilter)
    if (provinceFilter) nextParams.set('province', provinceFilter)
    if (certFilter) nextParams.set('certification', certFilter)
    if (availableOnly) nextParams.set('available', 'true')
    setSearchParams(nextParams, { replace: true })
  }, [search, sort, page, categoryFilter, provinceFilter, certFilter, availableOnly, setSearchParams])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setIsDebouncing(true)
    debounceRef.current = setTimeout(() => {
      if (hasActiveSearch) handleSearch(page)
      else loadDefaultListings(page)
      setIsDebouncing(false)
    }, 350)
    return () => debounceRef.current && clearTimeout(debounceRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sort, page, hasActiveSearch, categoryFilter, provinceFilter, certFilter, availableOnly])

  async function loadDefaultListings(targetPage = 0) {
    try {
      setLoading(true)
      setError(null)
      const result = await getPublicListings({ page: targetPage, size, sort: 'createdAt,desc' })
      setItems(Array.isArray(result.items) ? result.items : [])
      setMeta(result)
    } catch {
      setError('Không thể tải danh sách nông sản công khai.')
      setItems([])
      setMeta({ page: 0, size, totalItems: 0, totalPages: 0 })
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(targetPage = 0) {
    try {
      setLoading(true)
      setError(null)
      const params = { keyword: search || undefined, page: targetPage, size, sort }
      if (categoryFilter) params.productCategory = categoryFilter
      if (provinceFilter) params.province = provinceFilter
      if (certFilter) params.certification = certFilter
      if (availableOnly) params.availableOnly = true
      const result = await searchListings(params)
      setItems(Array.isArray(result.items) ? result.items : [])
      setMeta(result)
    } catch {
      setError('Không thể tìm kiếm sản phẩm hiện tại.')
      setItems([])
      setMeta({ page: 0, size, totalItems: 0, totalPages: 0 })
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setSearch('')
    setSort('createdAt,desc')
    setPage(0)
    setCategoryFilter('')
    setProvinceFilter('')
    setCertFilter('')
    setAvailableOnly(false)
  }

  const showSkeleton = loading || isDebouncing
  const currentPage = meta.page || 0
  const totalPages = meta.totalPages || 0
  const pageNumbers = useMemo(() => Array.from({ length: totalPages }, (_, index) => index), [totalPages])
  const stats = useMemo(() => ({
    total: meta.totalItems || items.length,
    farms: new Set(items.map((item) => repairText(item.farmName)).filter(Boolean)).size,
    regions: new Set(items.map((item) => repairText(item.province || item.region)).filter(Boolean)).size,
  }), [items, meta.totalItems])

  return (
    <PublicShell>
      <header className="proto-hero">
        <div className="proto-hero-content">
          <span className="proto-kicker"><span className="material-symbols-outlined fill">verified</span> Nguồn cung có truy xuất</span>
          <h1 className="proto-h1">Chợ nông sản BICAP</h1>
          <div className="proto-search">
            <span className="material-symbols-outlined">search</span>
            <input id="marketplace-keyword" type="text" placeholder="Tìm sản phẩm, vùng trồng, tên nông trại..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} />
            <button className="proto-btn-primary" type="button" onClick={() => handleSearch(0)}>Tìm kiếm</button>
          </div>
          <div className="proto-chip-row">
            <button className={`proto-chip ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>filter_list</span> Bộ lọc
            </button>
            {categoryFilter ? <button className="proto-chip active" onClick={() => { setCategoryFilter(''); setPage(0) }}>Phân loại: {repairText(categoryFilter)} <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span></button> : null}
            {provinceFilter ? <button className="proto-chip active" onClick={() => { setProvinceFilter(''); setPage(0) }}>Nguồn gốc: {repairText(provinceFilter)} <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span></button> : null}
            {certFilter ? <button className="proto-chip active" onClick={() => { setCertFilter(''); setPage(0) }}>Chứng nhận: {repairText(certFilter)} <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span></button> : null}
            {availableOnly ? <button className="proto-chip active" onClick={() => { setAvailableOnly(false); setPage(0) }}>Có sẵn <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span></button> : null}
            {hasActiveSearch ? <button className="proto-chip" onClick={handleReset}>Xóa tất cả</button> : null}
          </div>
        </div>
      </header>

      {showFilters ? (
        <div className="market-filter-panel">
          <label className="market-filter-field">
            <span>Phân loại</span>
            <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(0) }}>
              <option value="">Tất cả phân loại</option>
              {categoryOptions.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </label>
          <label className="market-filter-field">
            <span>Nguồn gốc</span>
            <select value={provinceFilter} onChange={(e) => { setProvinceFilter(e.target.value); setPage(0) }}>
              <option value="">Tất cả khu vực</option>
              {provinceOptions.map((p) => <option key={p} value={p}>{repairText(p)}</option>)}
            </select>
          </label>
          <label className="market-filter-field">
            <span>Chứng nhận</span>
            <select value={certFilter} onChange={(e) => { setCertFilter(e.target.value); setPage(0) }}>
              <option value="">Tất cả chứng nhận</option>
              {certOptions.map((c) => <option key={c} value={c}>{repairText(c)}</option>)}
            </select>
          </label>
          <label className="market-filter-check">
            <input type="checkbox" id="available-filter" checked={availableOnly} onChange={(e) => { setAvailableOnly(e.target.checked); setPage(0) }} />
            <span>Chỉ sản phẩm còn hàng</span>
          </label>
        </div>
      ) : null}

      <main className="proto-page">
        <section>
          <div className="proto-controls">
            <p><strong>{stats.total}</strong> listing · {stats.farms} nông trại · {stats.regions} khu vực</p>
            <div>
              <label htmlFor="sort">Sắp xếp: </label>
              <select id="sort" value={sort} onChange={(e) => { setSort(e.target.value); setPage(0) }}>
                <option value="createdAt,desc">Mới nhất</option>
                <option value="price,asc">Giá thấp đến cao</option>
                <option value="price,desc">Giá cao đến thấp</option>
                <option value="title,asc">Tên A-Z</option>
              </select>
            </div>
          </div>
          {error && !showSkeleton ? (
            <PublicState title="Marketplace tạm thời không khả dụng" message={error} action={<button className="proto-btn-primary" onClick={() => (hasActiveSearch ? handleSearch(page) : loadDefaultListings(page))}>Thử lại</button>} />
          ) : showSkeleton ? (
            <PublicSkeletonGrid count={size} />
          ) : items.length === 0 ? (
            <PublicState title="Chưa có sản phẩm phù hợp" message="Không tìm thấy sản phẩm phù hợp. Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm." action={<button className="proto-btn-secondary" onClick={handleReset}>Xóa bộ lọc</button>} />
          ) : (
            <>
              <div className="public-grid">{items.map((item) => <PublicProductCard key={item.listingId || item.id} item={item} onOpen={() => navigate(`/listings/${item.listingId || item.id}`)} />)}</div>
              {totalPages > 1 ? (
                <nav className="market-pagination" style={{ marginTop: 44 }} aria-label="Phân trang marketplace">
                  {pageNumbers.map((pageIndex) => <button key={pageIndex} type="button" className={`market-page-number ${currentPage === pageIndex ? 'active' : ''}`} onClick={() => setPage(pageIndex)} disabled={showSkeleton || currentPage === pageIndex}>{pageIndex + 1}</button>)}
                  <button type="button" className="market-page-next" disabled={showSkeleton || currentPage + 1 >= totalPages} onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))} aria-label="Trang sau"><span className="material-symbols-outlined">chevron_right</span></button>
                </nav>
              ) : null}
            </>
          )}
        </section>
      </main>
    </PublicShell>
  )
}
