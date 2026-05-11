import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button.jsx'
import { StatusCard } from '../components/StatusCard.jsx'
import {
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  getCategories,
  getProducts,
  updateCategory,
  updateProduct,
} from '../services/adminService.js'
import { generateBatchQr, getBatchQr, getBatches, getSeasons, verifyBatch } from '../services/phase3Service.js'

const emptyProductForm = {
  productName: '',
  productCode: '',
  description: '',
  price: '',
  imageUrl: '',
  sortOrder: '0',
  status: 'ACTIVE',
  categoryId: '',
}

const emptyCategoryForm = {
  categoryName: '',
  slug: '',
  imageUrl: '',
  icon: '',
  sortOrder: '0',
  status: 'ACTIVE',
}

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.content)) return payload.content
  if (Array.isArray(payload?.products)) return payload.products
  if (Array.isArray(payload?.categories)) return payload.categories
  if (Array.isArray(payload?.batches)) return payload.batches
  return []
}

function getBatchId(batch) {
  return batch?.batchId || batch?.id
}

function getSeasonId(season) {
  return season?.id || season?.seasonId
}

function getBatchStatus(batch) {
  return batch?.batchStatus || batch?.status || 'UNKNOWN'
}

function getSeasonForBatch(seasons, batch) {
  return seasons.find((season) => Number(getSeasonId(season)) === Number(batch?.seasonId)) || null
}

function getProductName(products, productId) {
  return products.find((product) => Number(product.productId || product.id) === Number(productId))?.productName || `#${productId || 'N/A'}`
}

function shortText(value, start = 12, end = 8) {
  if (!value) return 'N/A'
  const text = String(value)
  return text.length > start + end + 3 ? `${text.slice(0, start)}...${text.slice(-end)}` : text
}

function statusClass(status) {
  return `status-pill status-${String(status || 'active').toLowerCase()}`
}

function getBatchKeyword(batch, products, seasons, verifyRecord, qrRecord) {
  const season = getSeasonForBatch(seasons, batch)
  return [
    batch?.batchCode,
    batch?.traceCode,
    batch?.qualityGrade,
    getBatchStatus(batch),
    getProductName(products, batch?.productId),
    season?.farmName,
    season?.seasonCode,
    season?.farmingMethod,
    verifyRecord?.localHash,
    verifyRecord?.onChainHash,
    qrRecord?.qrValue,
    qrRecord?.qrCodeData,
  ].filter(Boolean).join(' ').toLowerCase()
}

export function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [batches, setBatches] = useState([])
  const [seasons, setSeasons] = useState([])
  const [activeTab, setActiveTab] = useState('products')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [productForm, setProductForm] = useState(emptyProductForm)

  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm)

  const [batchVerifyMap, setBatchVerifyMap] = useState({})
  const [batchQrMap, setBatchQrMap] = useState({})
  const [batchSearch, setBatchSearch] = useState('')
  const [batchStatusFilter, setBatchStatusFilter] = useState('ALL')
  const [selectedBatchId, setSelectedBatchId] = useState(null)
  const [batchActionId, setBatchActionId] = useState(null)

  async function loadData() {
    try {
      setLoading(true)
      setError('')
      const [productData, categoryData, batchData, seasonData] = await Promise.all([
        getProducts(), getCategories(), getBatches(), getSeasons(),
      ])
      const nextBatches = normalizeList(batchData)
      setProducts(normalizeList(productData))
      setCategories(normalizeList(categoryData))
      setBatches(nextBatches)
      setSeasons(normalizeList(seasonData))
      if (!selectedBatchId && nextBatches.length > 0) setSelectedBatchId(getBatchId(nextBatches[0]))
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không tải được dữ liệu sản phẩm.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const batchStatuses = useMemo(() => ['ALL', ...new Set(batches.map(getBatchStatus).filter(Boolean))], [batches])

  const filteredBatches = useMemo(() => {
    const keyword = batchSearch.trim().toLowerCase()
    return batches.filter((batch) => {
      const id = getBatchId(batch)
      const matchesStatus = batchStatusFilter === 'ALL' || getBatchStatus(batch) === batchStatusFilter
      const matchesKeyword = !keyword || getBatchKeyword(batch, products, seasons, batchVerifyMap[id], batchQrMap[id]).includes(keyword)
      return matchesStatus && matchesKeyword
    })
  }, [batches, products, seasons, batchVerifyMap, batchQrMap, batchSearch, batchStatusFilter])

  const selectedBatch = useMemo(
    () => batches.find((batch) => String(getBatchId(batch)) === String(selectedBatchId)) || filteredBatches[0] || null,
    [batches, filteredBatches, selectedBatchId],
  )

  const metrics = useMemo(() => {
    const activeProducts = products.filter((item) => item.status === 'ACTIVE').length
    const activeCategories = categories.filter((item) => item.status === 'ACTIVE').length
    const withTrace = batches.filter((batch) => batch.traceCode || batch.publicTraceUrl).length
    const totalQuantity = batches.reduce((sum, batch) => sum + Number(batch.quantity || 0), 0)
    return { activeProducts, activeCategories, withTrace, totalQuantity }
  }, [products, categories, batches])

  async function handleSaveProduct() {
    try {
      setError('')
      const payload = {
        ...productForm,
        sortOrder: Number(productForm.sortOrder) || 0,
        price: productForm.price ? Number(productForm.price) : null,
        categoryId: productForm.categoryId ? Number(productForm.categoryId) : null,
      }
      if (editingProduct) await updateProduct(editingProduct.productId || editingProduct.id, payload)
      else await createProduct(payload)
      setShowProductForm(false)
      setEditingProduct(null)
      setProductForm(emptyProductForm)
      setStatusMessage(editingProduct ? 'Đã cập nhật sản phẩm.' : 'Đã thêm sản phẩm thành công.')
      await loadData()
    } catch (err) {
      setError(err?.response?.data?.message || 'Lỗi lưu sản phẩm.')
    }
  }

  async function handleDeleteProduct(item) {
    if (!window.confirm('Xóa sản phẩm này?')) return
    await deleteProduct(item.productId || item.id)
    setStatusMessage('Đã xóa sản phẩm.')
    await loadData()
  }

  async function handleSaveCategory() {
    try {
      setError('')
      const payload = { ...categoryForm, sortOrder: Number(categoryForm.sortOrder) || 0 }
      if (editingCategory) await updateCategory(editingCategory.categoryId || editingCategory.id, payload)
      else await createCategory(payload)
      setShowCategoryForm(false)
      setEditingCategory(null)
      setCategoryForm(emptyCategoryForm)
      setStatusMessage(editingCategory ? 'Đã cập nhật chuyên mục.' : 'Đã thêm chuyên mục thành công.')
      await loadData()
    } catch (err) {
      setError(err?.response?.data?.message || 'Lỗi lưu chuyên mục.')
    }
  }

  async function handleDeleteCategory(item) {
    if (!window.confirm('Xóa chuyên mục này?')) return
    await deleteCategory(item.categoryId || item.id)
    setStatusMessage('Đã xóa chuyên mục.')
    await loadData()
  }

  async function handleVerifyBatch(batch) {
    const id = getBatchId(batch)
    if (!id) return
    try {
      setBatchActionId(id)
      const record = await verifyBatch(id)
      setBatchVerifyMap((prev) => ({ ...prev, [id]: record }))
      setStatusMessage(`Đã verify blockchain cho lô ${batch.batchCode || id}.`)
    } catch (err) {
      setError(err?.response?.data?.message || 'Không verify được lô sản xuất.')
    } finally {
      setBatchActionId(null)
    }
  }

  async function handleLoadBatchQr(batch, shouldGenerate = false) {
    const id = getBatchId(batch)
    if (!id) return
    try {
      setBatchActionId(id)
      const qr = shouldGenerate ? await generateBatchQr(id) : await getBatchQr(id)
      setBatchQrMap((prev) => ({ ...prev, [id]: qr }))
      setStatusMessage(`${shouldGenerate ? 'Đã tạo' : 'Đã tải'} QR cho lô ${batch.batchCode || id}.`)
    } catch (err) {
      setError(err?.response?.data?.message || 'Không lấy được QR của lô sản xuất.')
    } finally {
      setBatchActionId(null)
    }
  }

  function openBatchTrace(batch) {
    const id = getBatchId(batch)
    const qr = batchQrMap[id]
    const traceTarget = batch.publicTraceUrl || qr?.publicTraceUrl || qr?.qrValue || (batch.traceCode ? `/trace/${batch.traceCode}` : '')
    if (traceTarget) window.open(traceTarget, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="page-section admin-page admin-products-page">
      <div className="section-heading">
        <div>
          <h2>Quản lý sản phẩm</h2>
          <p>Sản phẩm, chuyên mục và lô sản xuất được gom vào một cockpit vận hành thống nhất.</p>
        </div>
        <div className="section-actions">
          <Button variant="secondary" onClick={loadData} disabled={loading}>{loading ? 'Đang tải...' : 'Làm mới'}</Button>
          <Button onClick={() => { setActiveTab('products'); setEditingProduct(null); setProductForm(emptyProductForm); setShowProductForm(true) }}>Thêm sản phẩm</Button>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {statusMessage ? <div className="alert alert-success">{statusMessage}</div> : null}

      <div className="status-grid admin-overview-grid">
        <StatusCard label="Sản phẩm" value={products.length} tone="primary" />
        <StatusCard label="Đang hiển thị" value={metrics.activeProducts} tone="success" />
        <StatusCard label="Chuyên mục active" value={`${metrics.activeCategories}/${categories.length}`} tone="warning" />
        <StatusCard label="Lô có trace" value={`${metrics.withTrace}/${batches.length}`} tone="success" />
        <StatusCard label="Tổng sản lượng" value={metrics.totalQuantity.toLocaleString('vi-VN')} tone="primary" />
      </div>

      <div className="admin-product-tabs" role="tablist" aria-label="Product admin tabs">
        <button type="button" className={activeTab === 'products' ? 'is-active' : ''} onClick={() => setActiveTab('products')}>Sản phẩm <strong>{products.length}</strong></button>
        <button type="button" className={activeTab === 'categories' ? 'is-active' : ''} onClick={() => setActiveTab('categories')}>Chuyên mục <strong>{categories.length}</strong></button>
        <button type="button" className={activeTab === 'batches' ? 'is-active' : ''} onClick={() => setActiveTab('batches')}>Lô sản xuất <strong>{batches.length}</strong></button>
      </div>

      {activeTab === 'products' ? (
        <article className="glass-card admin-workspace-panel">
          <div className="admin-table-head">
            <div><span className="feature-badge">Catalog</span><h3>Danh sách sản phẩm</h3><p>Quản lý tên, mã, giá, chuyên mục và trạng thái hiển thị.</p></div>
            <Button onClick={() => { setEditingProduct(null); setProductForm(emptyProductForm); setShowProductForm(true) }}>+ Thêm sản phẩm</Button>
          </div>

          {showProductForm ? (
            <div className="admin-form-panel">
              <div className="admin-table-head"><div><span className="feature-badge">Product form</span><h3>{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3></div></div>
              <div className="admin-form-grid">
                <label className="form-field"><span className="form-label">Tên sản phẩm *</span><input className="form-input" value={productForm.productName} onChange={(e) => setProductForm((f) => ({ ...f, productName: e.target.value }))} /></label>
                <label className="form-field"><span className="form-label">Mã sản phẩm</span><input className="form-input" value={productForm.productCode} onChange={(e) => setProductForm((f) => ({ ...f, productCode: e.target.value }))} /></label>
                <label className="form-field"><span className="form-label">Chuyên mục</span><select className="form-input" value={productForm.categoryId} onChange={(e) => setProductForm((f) => ({ ...f, categoryId: e.target.value }))}><option value="">-- Chọn chuyên mục --</option>{categories.map((category) => <option key={category.categoryId || category.id} value={category.categoryId || category.id}>{category.categoryName}</option>)}</select></label>
                <label className="form-field"><span className="form-label">Giá sản phẩm</span><input className="form-input" type="number" value={productForm.price} onChange={(e) => setProductForm((f) => ({ ...f, price: e.target.value }))} /></label>
                <label className="form-field"><span className="form-label">Số thứ tự</span><input className="form-input" type="number" value={productForm.sortOrder} onChange={(e) => setProductForm((f) => ({ ...f, sortOrder: e.target.value }))} /></label>
                <label className="form-field"><span className="form-label">Trạng thái</span><select className="form-input" value={productForm.status} onChange={(e) => setProductForm((f) => ({ ...f, status: e.target.value }))}><option value="ACTIVE">Hiển thị</option><option value="INACTIVE">Ẩn</option></select></label>
                <label className="form-field full-span"><span className="form-label">URL ảnh sản phẩm</span><input className="form-input" value={productForm.imageUrl} onChange={(e) => setProductForm((f) => ({ ...f, imageUrl: e.target.value }))} /></label>
                <label className="form-field full-span"><span className="form-label">Chi tiết sản phẩm</span><textarea className="form-input" rows={3} value={productForm.description} onChange={(e) => setProductForm((f) => ({ ...f, description: e.target.value }))} /></label>
              </div>
              <div className="inline-actions top-gap"><Button onClick={handleSaveProduct}>{editingProduct ? 'Lưu thay đổi' : 'Thêm sản phẩm'}</Button><Button variant="secondary" onClick={() => { setShowProductForm(false); setEditingProduct(null) }}>Hủy</Button></div>
            </div>
          ) : null}

          <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>STT</th><th>Sản phẩm</th><th>Chuyên mục</th><th>Giá</th><th>Trạng thái</th><th>Hành động</th></tr></thead><tbody>
            {products.map((item) => <tr key={item.productId || item.id}><td>{item.sortOrder ?? 0}</td><td><strong>{item.productName}</strong><br /><small>{item.productCode || 'Chưa có mã'}</small></td><td><span className="role-chip">{item.categoryName || '—'}</span></td><td>{item.price ? `${Number(item.price).toLocaleString('vi-VN')}đ` : '—'}</td><td><span className={statusClass(item.status)}>{item.status === 'ACTIVE' ? 'Hiển thị' : 'Ẩn'}</span></td><td><div className="inline-actions"><Button variant="secondary" onClick={() => { setEditingProduct(item); setProductForm({ productName: item.productName || '', productCode: item.productCode || '', description: item.description || '', price: item.price || '', imageUrl: item.imageUrl || '', sortOrder: item.sortOrder ?? 0, status: item.status || 'ACTIVE', categoryId: item.categoryId || '' }); setShowProductForm(true) }}>Sửa</Button><Button variant="secondary" onClick={() => handleDeleteProduct(item)}>Xóa</Button></div></td></tr>)}
            {products.length === 0 ? <tr><td colSpan="6">Chưa có sản phẩm nào.</td></tr> : null}
          </tbody></table></div>
        </article>
      ) : null}

      {activeTab === 'categories' ? (
        <article className="glass-card admin-workspace-panel">
          <div className="admin-table-head"><div><span className="feature-badge">Taxonomy</span><h3>Danh sách chuyên mục</h3><p>Tổ chức catalog theo nhóm sản phẩm và trạng thái xuất bản.</p></div><Button onClick={() => { setEditingCategory(null); setCategoryForm(emptyCategoryForm); setShowCategoryForm(true) }}>+ Thêm chuyên mục</Button></div>
          {showCategoryForm ? <div className="admin-form-panel"><div className="admin-form-grid"><label className="form-field"><span className="form-label">Tên chuyên mục *</span><input className="form-input" value={categoryForm.categoryName} onChange={(e) => setCategoryForm((f) => ({ ...f, categoryName: e.target.value }))} /></label><label className="form-field"><span className="form-label">Slug</span><input className="form-input" value={categoryForm.slug} onChange={(e) => setCategoryForm((f) => ({ ...f, slug: e.target.value }))} /></label><label className="form-field"><span className="form-label">Icon</span><input className="form-input" value={categoryForm.icon} onChange={(e) => setCategoryForm((f) => ({ ...f, icon: e.target.value }))} /></label><label className="form-field"><span className="form-label">Số thứ tự</span><input className="form-input" type="number" value={categoryForm.sortOrder} onChange={(e) => setCategoryForm((f) => ({ ...f, sortOrder: e.target.value }))} /></label><label className="form-field"><span className="form-label">Trạng thái</span><select className="form-input" value={categoryForm.status} onChange={(e) => setCategoryForm((f) => ({ ...f, status: e.target.value }))}><option value="ACTIVE">Hiển thị</option><option value="INACTIVE">Ẩn</option></select></label><label className="form-field"><span className="form-label">URL ảnh bìa</span><input className="form-input" value={categoryForm.imageUrl} onChange={(e) => setCategoryForm((f) => ({ ...f, imageUrl: e.target.value }))} /></label></div><div className="inline-actions top-gap"><Button onClick={handleSaveCategory}>{editingCategory ? 'Lưu thay đổi' : 'Thêm chuyên mục'}</Button><Button variant="secondary" onClick={() => { setShowCategoryForm(false); setEditingCategory(null) }}>Hủy</Button></div></div> : null}
          <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>STT</th><th>Chuyên mục</th><th>Slug</th><th>Trạng thái</th><th>Hành động</th></tr></thead><tbody>{categories.map((item) => <tr key={item.categoryId || item.id}><td>{item.sortOrder ?? 0}</td><td><strong>{item.icon ? `${item.icon} ` : ''}{item.categoryName}</strong></td><td>{item.slug || '—'}</td><td><span className={statusClass(item.status)}>{item.status === 'ACTIVE' ? 'Hiển thị' : 'Ẩn'}</span></td><td><div className="inline-actions"><Button variant="secondary" onClick={() => { setEditingCategory(item); setCategoryForm({ categoryName: item.categoryName || '', slug: item.slug || '', imageUrl: item.imageUrl || '', icon: item.icon || '', sortOrder: item.sortOrder ?? 0, status: item.status || 'ACTIVE' }); setShowCategoryForm(true) }}>Sửa</Button><Button variant="secondary" onClick={() => handleDeleteCategory(item)}>Xóa</Button></div></td></tr>)}{categories.length === 0 ? <tr><td colSpan="5">Chưa có chuyên mục nào.</td></tr> : null}</tbody></table></div>
        </article>
      ) : null}

      {activeTab === 'batches' ? (
        <div className="admin-products-batch-shell">
          <aside className="glass-card admin-package-list-card"><h3>Danh sách lô sản xuất</h3><div className="admin-users-filters"><input className="form-input" value={batchSearch} onChange={(event) => setBatchSearch(event.target.value)} placeholder="Tìm batch / trace / sản phẩm" /><select className="form-input" value={batchStatusFilter} onChange={(event) => setBatchStatusFilter(event.target.value)}>{batchStatuses.map((status) => <option key={status} value={status}>{status === 'ALL' ? 'Tất cả trạng thái' : status}</option>)}</select></div><div className="admin-package-list">{filteredBatches.map((batch) => { const id = getBatchId(batch); return <button key={id} type="button" className={`admin-user-item admin-package-list-item ${String(id) === String(getBatchId(selectedBatch)) ? 'is-selected' : ''}`} onClick={() => setSelectedBatchId(id)}><div className="admin-user-item-main"><strong>{batch.batchCode || `Batch #${id}`}</strong><span>{getProductName(products, batch.productId)}</span></div><div className="admin-user-item-meta"><span className={statusClass(getBatchStatus(batch))}>{getBatchStatus(batch)}</span><span>#{id}</span></div></button> })}</div></aside>
          <main className="glass-card admin-package-detail-card">{selectedBatch ? (() => { const id = getBatchId(selectedBatch); const verifyRecord = batchVerifyMap[id]; const qrRecord = batchQrMap[id]; const season = getSeasonForBatch(seasons, selectedBatch); return <><div className="admin-package-detail-head"><div><span className="feature-badge">Batch trace</span><h3>{selectedBatch.batchCode || `Batch #${id}`}</h3><p>{getProductName(products, selectedBatch.productId)}</p></div><span className={statusClass(getBatchStatus(selectedBatch))}>{getBatchStatus(selectedBatch)}</span></div><div className="admin-package-info-grid"><div><span>Farm</span><strong>{season?.farmName || 'Chưa rõ farm'}</strong></div><div><span>Mùa vụ</span><strong>{season?.seasonCode || `#${selectedBatch.seasonId || 'N/A'}`}</strong></div><div><span>Sản lượng</span><strong>{selectedBatch.quantity || 0}</strong></div><div><span>Trace code</span><strong>{selectedBatch.traceCode || 'Chưa có'}</strong></div><div><span>Local hash</span><strong>{shortText(verifyRecord?.localHash)}</strong></div><div><span>QR</span><strong>{shortText(qrRecord?.qrValue || qrRecord?.qrCodeData)}</strong></div></div><div className="admin-package-checklist"><h3>Checklist truy xuất</h3><ul className="feature-list"><li className={season ? 'is-ok' : 'is-warning'}>Có thông tin Farm/Mùa vụ</li><li className={selectedBatch.traceCode || selectedBatch.publicTraceUrl ? 'is-ok' : 'is-warning'}>Có mã trace công khai</li><li className={qrRecord?.qrValue || qrRecord?.qrCodeData || selectedBatch.publicTraceUrl ? 'is-ok' : 'is-warning'}>Có QR truy xuất</li><li className={verifyRecord?.matched ? 'is-ok' : 'is-warning'}>Đã verify blockchain</li></ul></div><div className="inline-actions"><Button onClick={() => handleVerifyBatch(selectedBatch)} disabled={batchActionId === id}>Verify blockchain</Button><Button variant="secondary" onClick={() => handleLoadBatchQr(selectedBatch)} disabled={batchActionId === id}>Lấy QR</Button><Button variant="secondary" onClick={() => handleLoadBatchQr(selectedBatch, true)} disabled={batchActionId === id}>Tạo QR</Button><Button variant="secondary" onClick={() => openBatchTrace(selectedBatch)} disabled={!selectedBatch.publicTraceUrl && !selectedBatch.traceCode && !qrRecord}>Mở trace</Button></div></> })() : <p className="muted-inline">Chưa có lô sản xuất để hiển thị.</p>}</main>
        </div>
      ) : null}
    </section>
  )
}
