import { useState, useEffect } from 'react'
import { getPublicListings } from '../services/listingService'
import { api } from '../services/api'
import './GuestMarketplace.css'

const DEFAULT_CATEGORIES = [
  { key: 'all', label: 'Tất cả', icon: '🌾' }
]

function getIconForCategory(slug) {
  if (slug.includes('rau')) return '🥬'
  if (slug.includes('trai')) return '🍊'
  if (slug.includes('thit') || slug.includes('hai-san')) return '🥩'
  if (slug.includes('gao') || slug.includes('hat')) return '🍚'
  if (slug.includes('sua') || slug.includes('trung')) return '🥚'
  if (slug.includes('cho') || slug.includes('dong-vat')) return '🐕'
  return '📦'
}

function formatPrice(price) {
  if (!price) return 'Liên hệ'
  return Number(price).toLocaleString('vi-VN') + 'đ'
}

// Normalize sản phẩm admin về cùng format với listing
function normalizeProduct(p) {
  return {
    _id: 'product-' + p.productId,
    listingId: p.productId,
    title: p.productName,
    productName: p.productName,
    description: p.description,
    price: p.price,
    imageUrl: p.imageUrl,
    unit: 'kg',
    status: p.status,
    categoryName: p.categoryName,
    farmName: 'BICAP Platform',
    qualityGrade: null,
    batchCode: null,
    quantityAvailable: null,
    _type: 'product',
  }
}

// Normalize listing về format chung
function normalizeListing(l) {
  return { ...l, _id: 'listing-' + l.listingId, _type: 'listing' }
}

function ProductCard({ item }) {
  const placeholderColors = [
    'linear-gradient(135deg, #2d5016 0%, #4a7c2e 100%)',
    'linear-gradient(135deg, #1a3a0a 0%, #3d6b1e 100%)',
    'linear-gradient(135deg, #0f4030 0%, #1a6b4a 100%)',
    'linear-gradient(135deg, #2e1065 0%, #4c1d95 100%)',
    'linear-gradient(135deg, #7c2d12 0%, #c2410c 100%)',
  ]
  const bgColor = placeholderColors[Math.abs((item.listingId || 0) % placeholderColors.length)]

  return (
    <div className="mp-card">
      <div className="mp-card__image" style={{ background: item.imageUrl ? undefined : bgColor }}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} onError={e => { e.target.style.display = 'none' }} />
        ) : (
          <div className="mp-card__placeholder">
            <span className="mp-card__placeholder-icon">🌱</span>
            <span className="mp-card__placeholder-text">{item.productName || 'Nông sản'}</span>
          </div>
        )}
        {item.qualityGrade && <span className="mp-card__badge">{item.qualityGrade}</span>}
        {item._type === 'listing' && item.batchCode && (
          <span className="mp-card__badge mp-card__badge--qr" title="Có dữ liệu truy xuất">🔗 QR</span>
        )}
        {item._type === 'product' && (
          <span className="mp-card__badge mp-card__badge--platform">BICAP</span>
        )}
      </div>

      <div className="mp-card__body">
        <h3 className="mp-card__title">{item.title}</h3>
        <p className="mp-card__farm">
          <span className="mp-card__farm-icon">{item._type === 'listing' ? '🏡' : '🏪'}</span>
          {item.farmName || 'BICAP Platform'}
        </p>
        {item.categoryName && (
          <span className="mp-card__category">{item.categoryName}</span>
        )}
        {item.description && (
          <p className="mp-card__desc">{item.description}</p>
        )}
        {item.quantityAvailable != null && (
          <div className="mp-card__meta">
            <span className="mp-card__qty">
              📦 {Number(item.quantityAvailable).toLocaleString()} {item.unit || 'kg'}
            </span>
            {item.batchCode && (
              <span className="mp-card__batch" title="Mã lô — có thể truy xuất QR">
                🔗 {item.batchCode}
              </span>
            )}
          </div>
        )}
        <div className="mp-card__footer">
          <span className="mp-card__price">{formatPrice(item.price)}</span>
          {item.price && <span className="mp-card__unit">/ {item.unit || 'kg'}</span>}
        </div>
      </div>
    </div>
  )
}

export function GuestMarketplacePage() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    try {
      setLoading(true)
      setError(null)

      // Gọi song song cả 3 nguồn dữ liệu
      const [listingsData, productsData, categoriesData] = await Promise.allSettled([
        getPublicListings(),
        api.get('/products').then(r => r.data?.data || r.data || []),
        api.get('/categories').then(r => r.data?.data || r.data || []),
      ])

      const listings = (listingsData.status === 'fulfilled' && Array.isArray(listingsData.value))
        ? listingsData.value.filter(l => l.status === 'ACTIVE').map(normalizeListing)
        : []

      const products = (productsData.status === 'fulfilled' && Array.isArray(productsData.value))
        ? productsData.value.filter(p => p.status === 'ACTIVE').map(normalizeProduct)
        : []
        
      if (categoriesData.status === 'fulfilled' && Array.isArray(categoriesData.value)) {
        const dynamicCats = categoriesData.value.filter(c => c.status === 'ACTIVE').map(c => ({
          key: c.slug,
          label: c.categoryName,
          icon: c.icon || getIconForCategory(c.slug || c.categoryName.toLowerCase())
        }))
        setCategories([...DEFAULT_CATEGORIES, ...dynamicCats])
      }

      setItems([...listings, ...products])
    } catch (err) {
      setError('Không thể tải danh sách sản phẩm')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = items.filter((item) => {
    const matchSearch =
      !search ||
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.productName?.toLowerCase().includes(search.toLowerCase()) ||
      item.farmName?.toLowerCase().includes(search.toLowerCase()) ||
      item.categoryName?.toLowerCase().includes(search.toLowerCase())
      
    const matchCat = activeCategory === 'all' || 
      (item.categoryName && item.categoryName.toLowerCase().includes(
        categories.find(c => c.key === activeCategory)?.label.toLowerCase()
      )) || 
      (item.categorySlug && item.categorySlug === activeCategory)

    return matchSearch && matchCat
  })

  const farmCount = [...new Set(items.filter(i => i._type === 'listing').map(i => i.farmName))].filter(Boolean).length

  return (
    <section className="marketplace">
      {/* Hero banner */}
      <div className="mp-hero">
        <div className="mp-hero__content">
          <p className="mp-hero__eyebrow">SÀN NÔNG SẢN BICAP</p>
          <h1 className="mp-hero__title">Nông sản sạch, truy xuất nguồn gốc</h1>
          <p className="mp-hero__subtitle">
            Mỗi sản phẩm đều gắn liền với lô sản xuất — quét mã QR để xem toàn bộ quy trình canh tác.
          </p>
        </div>
        <div className="mp-hero__search">
          <span className="mp-hero__search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm, nông trại, chuyên mục..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mp-hero__search-input"
          />
        </div>
      </div>

      {/* Category bar */}
      <div className="mp-categories">
        {categories.map((cat) => (
          <button
            key={cat.key}
            className={`mp-cat-btn ${activeCategory === cat.key ? 'mp-cat-btn--active' : ''}`}
            onClick={() => setActiveCategory(cat.key)}
          >
            <span className="mp-cat-btn__icon">{cat.icon}</span>
            <span className="mp-cat-btn__label">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="mp-stats">
        <div className="mp-stat">
          <span className="mp-stat__value">{items.length}</span>
          <span className="mp-stat__label">Sản phẩm</span>
        </div>
        <div className="mp-stat">
          <span className="mp-stat__value">{farmCount || '—'}</span>
          <span className="mp-stat__label">Nông trại</span>
        </div>
        <div className="mp-stat">
          <span className="mp-stat__value">100%</span>
          <span className="mp-stat__label">Truy xuất</span>
        </div>
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="mp-loading">
          <div className="mp-spinner"></div>
          <p>Đang tải sản phẩm...</p>
        </div>
      ) : error ? (
        <div className="mp-empty">
          <span className="mp-empty__icon">⚠️</span>
          <p>{error}</p>
          <button className="mp-retry-btn" onClick={loadAll}>Thử lại</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mp-empty">
          <span className="mp-empty__icon">🌿</span>
          <h3>Chưa có sản phẩm nào trên sàn</h3>
          <p>Admin hoặc các nông trại chưa đăng sản phẩm. Hãy quay lại sau nhé!</p>
        </div>
      ) : (
        <div className="mp-grid">
          {filtered.map((item) => (
            <ProductCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </section>
  )
}
