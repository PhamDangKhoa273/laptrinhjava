import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PublicProductCard } from '../components/public/PublicProductCard.jsx'
import { PublicShell } from '../components/public/PublicShell.jsx'
import { PublicSkeletonGrid, PublicState } from '../components/public/PublicState.jsx'
import { getPublicListings } from '../services/listingService'
import { searchListings } from '../services/searchService'

function parsePositiveInt(value, fallback) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
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
  const hasActiveSearch = Boolean(search || sort !== 'createdAt,desc')

  useEffect(() => {
    const nextParams = new URLSearchParams()
    if (search) nextParams.set('keyword', search)
    if (sort !== 'createdAt,desc') nextParams.set('sort', sort)
    if (page > 0) nextParams.set('page', String(page))
    setSearchParams(nextParams, { replace: true })
  }, [search, sort, page, setSearchParams])

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
  }, [search, sort, page, hasActiveSearch])

  async function loadDefaultListings(targetPage = 0) {
    try {
      setLoading(true); setError(null)
      const result = await getPublicListings({ page: targetPage, size, sort: 'createdAt,desc' })
      setItems(Array.isArray(result.items) ? result.items : []); setMeta(result)
    } catch {
      setError('Không thể tải danh sách nông sản công khai.'); setItems([]); setMeta({ page: 0, size, totalItems: 0, totalPages: 0 })
    } finally { setLoading(false) }
  }

  async function handleSearch(targetPage = 0) {
    try {
      setLoading(true); setError(null)
      const result = await searchListings({ keyword: search, page: targetPage, size, sort })
      setItems(Array.isArray(result.items) ? result.items : []); setMeta(result)
    } catch {
      setError('Không thể tìm kiếm sản phẩm hiện tại.'); setItems([]); setMeta({ page: 0, size, totalItems: 0, totalPages: 0 })
    } finally { setLoading(false) }
  }

  function handleReset() { setSearch(''); setSort('createdAt,desc'); setPage(0) }
  const showSkeleton = loading || isDebouncing
  const currentPage = meta.page || 0
  const totalPages = meta.totalPages || 0
  const pageNumbers = useMemo(() => Array.from({ length: totalPages }, (_, index) => index), [totalPages])
  const stats = useMemo(() => ({ total: meta.totalItems || items.length, farms: new Set(items.map((item) => item.farmName).filter(Boolean)).size, regions: new Set(items.map((item) => item.province || item.region).filter(Boolean)).size }), [items, meta.totalItems])

  return (
    <PublicShell>
      <header className="proto-hero">
        <div className="proto-hero-content">
          <span className="proto-kicker"><span className="material-symbols-outlined fill">verified</span> Nguồn cung có truy xuất</span>
          <h1 className="proto-h1">Chợ nông sản BICAP</h1>
          <div className="proto-search"><span className="material-symbols-outlined">search</span><input id="marketplace-keyword" type="text" placeholder="Tìm sản phẩm, vùng trồng, tên nông trại..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} /><button className="proto-btn-primary" type="button" onClick={() => handleSearch(0)}>Tìm kiếm</button></div>
          <div className="proto-chip-row">
            {hasActiveSearch ? <button className="proto-chip" onClick={handleReset}>Xóa tìm kiếm</button> : null}
          </div>
        </div>
      </header>
      <main className="proto-page">
        <section>
          <div className="proto-controls"><p><strong>{stats.total}</strong> listing · {stats.farms} nông trại · {stats.regions} khu vực</p><div><label htmlFor="sort">Sắp xếp: </label><select id="sort" value={sort} onChange={(e) => { setSort(e.target.value); setPage(0) }}><option value="createdAt,desc">Mới nhất</option><option value="price,asc">Giá thấp đến cao</option><option value="price,desc">Giá cao đến thấp</option><option value="title,asc">Tên A-Z</option></select></div></div>
          {error && !showSkeleton ? <PublicState title="Marketplace tạm thời không khả dụng" message={error} action={<button className="proto-btn-primary" onClick={() => (hasActiveSearch ? handleSearch(page) : loadDefaultListings(page))}>Thử lại</button>} /> : showSkeleton ? <PublicSkeletonGrid count={size} /> : items.length === 0 ? <PublicState title="Chưa có sản phẩm phù hợp" message="Không tìm thấy sản phẩm phù hợp. Hãy thử nhập tên sản phẩm, vùng trồng hoặc tên nông trại khác." action={<button className="proto-btn-secondary" onClick={handleReset}>Xóa tìm kiếm</button>} /> : <><div className="public-grid">{items.map((item) => <PublicProductCard key={item.listingId || item.id} item={item} onOpen={() => navigate(`/listings/${item.listingId || item.id}`)} />)}</div>{totalPages > 1 ? <nav className="market-pagination" style={{ marginTop: 44 }} aria-label="Phân trang marketplace">{pageNumbers.map((pageIndex) => <button key={pageIndex} type="button" className={`market-page-number ${currentPage === pageIndex ? 'active' : ''}`} onClick={() => setPage(pageIndex)} disabled={showSkeleton || currentPage === pageIndex}>{pageIndex + 1}</button>)}<button type="button" className="market-page-next" disabled={showSkeleton || currentPage + 1 >= totalPages} onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))} aria-label="Trang sau"><span className="material-symbols-outlined">chevron_right</span></button></nav> : null}</>}
        </section>
      </main>
    </PublicShell>
  )
}
