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
  return []
}

function statusClass(status) {
  return `status-pill status-${String(status || 'active').toLowerCase()}`
}

function categoryName(categories, item) {
  return item.categoryName || categories.find((category) => Number(category.categoryId || category.id) === Number(item.categoryId))?.categoryName || 'Chưa phân loại'
}

function isIncompleteProduct(item) {
  return !item.productName || !item.productCode || !item.description || !item.categoryId
}

export function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
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

  async function loadData() {
    try {
      setLoading(true)
      setError('')
      const [productData, categoryData] = await Promise.all([getProducts(), getCategories()])
      setProducts(normalizeList(productData))
      setCategories(normalizeList(categoryData))
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không tải được dữ liệu sản phẩm.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const metrics = useMemo(() => {
    const activeProducts = products.filter((item) => item.status === 'ACTIVE').length
    const hiddenProducts = products.filter((item) => item.status !== 'ACTIVE').length
    const activeCategories = categories.filter((item) => item.status === 'ACTIVE').length
    const incompleteProducts = products.filter(isIncompleteProduct).length
    return { activeProducts, hiddenProducts, activeCategories, incompleteProducts }
  }, [products, categories])

  function openProductForm(item = null) {
    setActiveTab('products')
    setEditingProduct(item)
    setProductForm(item ? {
      productName: item.productName || '',
      productCode: item.productCode || '',
      description: item.description || '',
      price: item.price || '',
      imageUrl: item.imageUrl || '',
      sortOrder: item.sortOrder ?? 0,
      status: item.status || 'ACTIVE',
      categoryId: item.categoryId || '',
    } : emptyProductForm)
    setShowProductForm(true)
  }

  function openCategoryForm(item = null) {
    setActiveTab('categories')
    setEditingCategory(item)
    setCategoryForm(item ? {
      categoryName: item.categoryName || '',
      slug: item.slug || '',
      imageUrl: item.imageUrl || '',
      icon: item.icon || '',
      sortOrder: item.sortOrder ?? 0,
      status: item.status || 'ACTIVE',
    } : emptyCategoryForm)
    setShowCategoryForm(true)
  }

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
      setStatusMessage(editingProduct ? 'Đã cập nhật sản phẩm.' : 'Đã thêm sản phẩm.')
      await loadData()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Lỗi lưu sản phẩm.')
    }
  }

  async function handleDeleteProduct(item) {
    if (!window.confirm('Xóa sản phẩm này khỏi catalog? Dữ liệu mùa vụ/lịch sử vẫn được giữ để truy xuất.')) return
    try {
      setError('')
      await deleteProduct(item.productId || item.id)
      setStatusMessage('Đã xóa sản phẩm khỏi catalog.')
      await loadData()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không xóa được sản phẩm.')
    }
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
      setStatusMessage(editingCategory ? 'Đã cập nhật danh mục.' : 'Đã thêm danh mục.')
      await loadData()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Lỗi lưu danh mục.')
    }
  }

  async function handleDeleteCategory(item) {
    if (!window.confirm('Xóa danh mục này?')) return
    try {
      setError('')
      await deleteCategory(item.categoryId || item.id)
      setStatusMessage('Đã xóa danh mục.')
      await loadData()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không xóa được danh mục.')
    }
  }

  return (
    <section className="page-section admin-page admin-products-page">
      <div className="section-heading">
        <div>
          <span className="feature-badge">Product governance</span>
          <h2>Quản lý sản phẩm</h2>
          <p>Giám sát sản phẩm đã đăng ký, danh mục, mô tả và độ chính xác dữ liệu catalog.</p>
        </div>
        <div className="section-actions">
          <Button variant="secondary" onClick={loadData} disabled={loading}>{loading ? 'Đang tải...' : 'Làm mới'}</Button>
          <Button onClick={() => openProductForm()}>Thêm sản phẩm</Button>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {statusMessage ? <div className="alert alert-success">{statusMessage}</div> : null}

      <div className="status-grid admin-overview-grid">
        <StatusCard label="Sản phẩm" value={products.length} tone="primary" />
        <StatusCard label="Đang hiển thị" value={metrics.activeProducts} tone="success" />
        <StatusCard label="Đang ẩn" value={metrics.hiddenProducts} tone="warning" />
        <StatusCard label="Cần bổ sung dữ liệu" value={metrics.incompleteProducts} tone="danger" />
      </div>

      <div className="admin-product-tabs" role="tablist" aria-label="Product admin tabs">
        <button type="button" className={activeTab === 'products' ? 'is-active' : ''} onClick={() => setActiveTab('products')}>Sản phẩm <strong>{products.length}</strong></button>
        <button type="button" className={activeTab === 'categories' ? 'is-active' : ''} onClick={() => setActiveTab('categories')}>Danh mục <strong>{categories.length}</strong></button>
      </div>

      {activeTab === 'products' ? (
        <article className="glass-card admin-workspace-panel">
          <div className="admin-table-head">
            <div>
              <h3>Catalog sản phẩm</h3>
              <p>Quản trị tên, mã, danh mục, mô tả, giá và trạng thái hiển thị.</p>
            </div>
            <Button onClick={() => openProductForm()}>Thêm sản phẩm</Button>
          </div>

          {showProductForm ? (
            <div className="admin-form-panel">
              <div className="admin-form-grid">
                <label className="form-field"><span className="form-label">Tên sản phẩm *</span><input className="form-input" value={productForm.productName} onChange={(event) => setProductForm((form) => ({ ...form, productName: event.target.value }))} /></label>
                <label className="form-field"><span className="form-label">Mã sản phẩm</span><input className="form-input" value={productForm.productCode} onChange={(event) => setProductForm((form) => ({ ...form, productCode: event.target.value }))} /></label>
                <label className="form-field"><span className="form-label">Danh mục</span><select className="form-input" value={productForm.categoryId} onChange={(event) => setProductForm((form) => ({ ...form, categoryId: event.target.value }))}><option value="">Chọn danh mục</option>{categories.map((category) => <option key={category.categoryId || category.id} value={category.categoryId || category.id}>{category.categoryName}</option>)}</select></label>
                <label className="form-field"><span className="form-label">Giá</span><input className="form-input" type="number" value={productForm.price} onChange={(event) => setProductForm((form) => ({ ...form, price: event.target.value }))} /></label>
                <label className="form-field"><span className="form-label">Thứ tự</span><input className="form-input" type="number" value={productForm.sortOrder} onChange={(event) => setProductForm((form) => ({ ...form, sortOrder: event.target.value }))} /></label>
                <label className="form-field"><span className="form-label">Trạng thái</span><select className="form-input" value={productForm.status} onChange={(event) => setProductForm((form) => ({ ...form, status: event.target.value }))}><option value="ACTIVE">Hiển thị</option><option value="INACTIVE">Ẩn</option></select></label>
                <label className="form-field full-span"><span className="form-label">URL ảnh</span><input className="form-input" value={productForm.imageUrl} onChange={(event) => setProductForm((form) => ({ ...form, imageUrl: event.target.value }))} /></label>
                <label className="form-field full-span"><span className="form-label">Mô tả</span><textarea className="form-input" rows={3} value={productForm.description} onChange={(event) => setProductForm((form) => ({ ...form, description: event.target.value }))} /></label>
              </div>
              <div className="inline-actions top-gap">
                <Button onClick={handleSaveProduct}>{editingProduct ? 'Lưu thay đổi' : 'Thêm sản phẩm'}</Button>
                <Button variant="secondary" onClick={() => { setShowProductForm(false); setEditingProduct(null) }}>Hủy</Button>
              </div>
            </div>
          ) : null}

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Thứ tự</th><th>Sản phẩm</th><th>Danh mục</th><th>Mô tả</th><th>Trạng thái dữ liệu</th><th>Hành động</th></tr></thead>
              <tbody>
                {products.map((item) => (
                  <tr key={item.productId || item.id}>
                    <td>{item.sortOrder ?? 0}</td>
                    <td><strong>{item.productName}</strong><br /><small>{item.productCode || 'Chưa có mã'} · {item.price ? `${Number(item.price).toLocaleString('vi-VN')}đ` : 'Chưa có giá'}</small></td>
                    <td><span className="role-chip">{categoryName(categories, item)}</span></td>
                    <td>{item.description || <span className="muted-inline">Chưa có mô tả</span>}</td>
                    <td><span className={isIncompleteProduct(item) ? 'status-pill status-warning' : 'status-pill status-active'}>{isIncompleteProduct(item) ? 'Cần bổ sung' : 'Đủ dữ liệu'}</span><br /><small>{item.status === 'ACTIVE' ? 'Hiển thị' : 'Ẩn'}</small></td>
                    <td><div className="inline-actions"><Button variant="secondary" onClick={() => openProductForm(item)}>Sửa</Button><Button variant="secondary" onClick={() => handleDeleteProduct(item)}>Xóa</Button></div></td>
                  </tr>
                ))}
                {products.length === 0 ? <tr><td colSpan="6">Chưa có sản phẩm.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </article>
      ) : null}

      {activeTab === 'categories' ? (
        <article className="glass-card admin-workspace-panel">
          <div className="admin-table-head">
            <div>
              <h3>Danh mục sản phẩm</h3>
              <p>Tổ chức catalog theo nhóm sản phẩm và trạng thái xuất bản.</p>
            </div>
            <Button onClick={() => openCategoryForm()}>Thêm danh mục</Button>
          </div>

          {showCategoryForm ? (
            <div className="admin-form-panel">
              <div className="admin-form-grid">
                <label className="form-field"><span className="form-label">Tên danh mục *</span><input className="form-input" value={categoryForm.categoryName} onChange={(event) => setCategoryForm((form) => ({ ...form, categoryName: event.target.value }))} /></label>
                <label className="form-field"><span className="form-label">Slug</span><input className="form-input" value={categoryForm.slug} onChange={(event) => setCategoryForm((form) => ({ ...form, slug: event.target.value }))} /></label>
                <label className="form-field"><span className="form-label">Icon</span><input className="form-input" value={categoryForm.icon} onChange={(event) => setCategoryForm((form) => ({ ...form, icon: event.target.value }))} /></label>
                <label className="form-field"><span className="form-label">Thứ tự</span><input className="form-input" type="number" value={categoryForm.sortOrder} onChange={(event) => setCategoryForm((form) => ({ ...form, sortOrder: event.target.value }))} /></label>
                <label className="form-field"><span className="form-label">Trạng thái</span><select className="form-input" value={categoryForm.status} onChange={(event) => setCategoryForm((form) => ({ ...form, status: event.target.value }))}><option value="ACTIVE">Hiển thị</option><option value="INACTIVE">Ẩn</option></select></label>
                <label className="form-field"><span className="form-label">URL ảnh bìa</span><input className="form-input" value={categoryForm.imageUrl} onChange={(event) => setCategoryForm((form) => ({ ...form, imageUrl: event.target.value }))} /></label>
              </div>
              <div className="inline-actions top-gap">
                <Button onClick={handleSaveCategory}>{editingCategory ? 'Lưu thay đổi' : 'Thêm danh mục'}</Button>
                <Button variant="secondary" onClick={() => { setShowCategoryForm(false); setEditingCategory(null) }}>Hủy</Button>
              </div>
            </div>
          ) : null}

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Thứ tự</th><th>Danh mục</th><th>Slug</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
              <tbody>
                {categories.map((item) => (
                  <tr key={item.categoryId || item.id}>
                    <td>{item.sortOrder ?? 0}</td>
                    <td><strong>{item.icon ? `${item.icon} ` : ''}{item.categoryName}</strong></td>
                    <td>{item.slug || '-'}</td>
                    <td><span className={statusClass(item.status)}>{item.status === 'ACTIVE' ? 'Hiển thị' : 'Ẩn'}</span></td>
                    <td><div className="inline-actions"><Button variant="secondary" onClick={() => openCategoryForm(item)}>Sửa</Button><Button variant="secondary" onClick={() => handleDeleteCategory(item)}>Xóa</Button></div></td>
                  </tr>
                ))}
                {categories.length === 0 ? <tr><td colSpan="5">Chưa có danh mục.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </article>
      ) : null}
    </section>
  )
}
