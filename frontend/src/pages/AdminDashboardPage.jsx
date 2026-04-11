import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button.jsx'
import { StatusCard } from '../components/StatusCard.jsx'
import {
  assignRole, changeUserStatus, getFarms, getPackages, getRetailers, getUsers,
  getProducts, createProduct, updateProduct, deleteProduct,
  getCategories, createCategory, updateCategory, deleteCategory,
  createAdminAccount, deleteUserAccount, deploySmartContract
} from '../services/adminService.js'
import { ROLE_LABELS, ROLES } from '../utils/constants'

const statusOptions = ['ALL', 'ACTIVE', 'INACTIVE']
const roleOptions = ['ALL', ...Object.values(ROLES)]

const blockchainModules = [
  { name: 'Hợp đồng mùa vụ', network: 'VeChainThor Testnet', version: 'v1.2.0', status: 'Đang hoạt động' },
  { name: 'Hợp đồng truy xuất QR', network: 'VeChainThor Testnet', version: 'v1.0.4', status: 'Sẵn sàng cập nhật' },
  { name: 'Hợp đồng nhật ký vận chuyển', network: 'VeChainThor Testnet', version: 'v0.9.8', status: 'Bản demo' },
]

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.content)) return payload.content
  if (Array.isArray(payload?.users)) return payload.users
  return []
}

function getRoleNames(user) {
  if (Array.isArray(user?.roles) && user.roles.length > 0) return user.roles
  if (user?.primaryRole) return [user.primaryRole]
  return [ROLES.GUEST]
}

function getUserKeyword(user) {
  return [user?.fullName, user?.email, user?.phone].filter(Boolean).join(' ').toLowerCase()
}

export function AdminDashboardPage({ defaultTab = 'users' }) {
  const [users, setUsers] = useState([])
  const [farms, setFarms] = useState([])
  const [retailers, setRetailers] = useState([])
  const [packages, setPackages] = useState([])
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [activeTab, setActiveTab] = useState(defaultTab)

  // Product/Category sub-tab
  const [productSubTab, setProductSubTab] = useState('products')

  // Product form state
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [productForm, setProductForm] = useState({ productName: '', productCode: '', description: '', price: '', imageUrl: '', sortOrder: '0', status: 'ACTIVE', categoryId: '' })

  // Category form state
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryForm, setCategoryForm] = useState({ categoryName: '', slug: '', imageUrl: '', icon: '', sortOrder: '0', status: 'ACTIVE' })

  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [selectedRole, setSelectedRole] = useState(ROLES.FARM)
  const [busyUserId, setBusyUserId] = useState(null)
  const [isAssigningRole, setIsAssigningRole] = useState(false)
  const [busyFarmId, setBusyFarmId] = useState(null)

  async function loadAdminData() {
    try {
      setLoading(true)
      setError('')
      const [usersData, farmsData, retailersData, packagesData, productsData, categoriesData] = await Promise.all([
        getUsers(), getFarms(), getRetailers(), getPackages(), getProducts(), getCategories(),
      ])
      const nextUsers = normalizeList(usersData)
      setUsers(nextUsers)
      setFarms(normalizeList(farmsData))
      setRetailers(normalizeList(retailersData))
      setPackages(normalizeList(packagesData))
      setProducts(normalizeList(productsData))
      setCategories(normalizeList(categoriesData))
      if (!selectedUserId && nextUsers.length > 0) setSelectedUserId(nextUsers[0].userId)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không tải được dữ liệu quản trị.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return users.filter((user) => {
      const roles = getRoleNames(user)
      const matchesKeyword = !keyword || getUserKeyword(user).includes(keyword)
      const matchesRole = roleFilter === 'ALL' || roles.includes(roleFilter)
      const matchesStatus = statusFilter === 'ALL' || user?.status === statusFilter
      return matchesKeyword && matchesRole && matchesStatus
    })
  }, [users, search, roleFilter, statusFilter])

  const selectedUser = useMemo(
    () => users.find((user) => user.userId === Number(selectedUserId)) || filteredUsers[0] || null,
    [users, filteredUsers, selectedUserId],
  )

  const metrics = useMemo(() => {
    const activeUsers = users.filter((user) => user.status === 'ACTIVE').length
    const adminUsers = users.filter((user) => getRoleNames(user).includes(ROLES.ADMIN)).length
    const pendingFarms = farms.filter((farm) => farm.approvalStatus !== 'APPROVED').length

    return {
      activeUsers,
      adminUsers,
      pendingFarms,
    }
  }, [users, farms])

  async function handleAssignRole() {
    if (!selectedUser) return

    try {
      setIsAssigningRole(true)
      setStatusMessage('')
      await assignRole(selectedUser.userId, selectedRole)
      setStatusMessage(`Đã gán vai trò ${ROLE_LABELS[selectedRole] || selectedRole} cho ${selectedUser.fullName}.`)
      await loadAdminData()
      setSelectedUserId(selectedUser.userId)
    } catch (err) {
      setStatusMessage(err?.response?.data?.message || 'Không gán được vai trò.')
    } finally {
      setIsAssigningRole(false)
    }
  }

  async function handleToggleStatus(user) {
    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'

    try {
      setBusyUserId(user.userId)
      setStatusMessage('')
      await changeUserStatus(user.userId, nextStatus)
      setStatusMessage(`Đã chuyển ${user.fullName} sang trạng thái ${nextStatus}.`)
      await loadAdminData()
      setSelectedUserId(user.userId)
    } catch (err) {
      setStatusMessage(err?.response?.data?.message || 'Không cập nhật được trạng thái.')
    } finally {
      setBusyUserId(null)
    }
  }

  async function handleDeployContract() {
    try {
      setStatusMessage('')
      const result = await deploySmartContract({ network: 'VeChainThor' })
      setStatusMessage(`Đã gửi lệnh cập nhật / triển khai hợp đồng (Tx: ${result.txId || 'Thành công'}).`)
    } catch (err) {
      setError('Lỗi triển khai contract')
    }
  }

  async function handleCreateAdmin() {
    try {
      setStatusMessage('')
      await createAdminAccount({ email: 'newadmin@bicap.com', role: 'ADMIN' })
      setStatusMessage('Đã tạo tài khoản quản trị mới (Mock).')
    } catch (err) {
      setError('Lỗi tạo Admin')
    }
  }

  async function handleDeleteUser(id) {
    if (!window.confirm('Bạn có chắc chắn muốn xoá tài khoản này không?')) return
    try {
      setBusyUserId(id)
      await deleteUserAccount(id)
      setStatusMessage('Đã xoá tài khoản thành công (Mock).')
      await loadAdminData()
    } catch (e) {
      setStatusMessage('Lỗi xoá tài khoản')
    } finally { setBusyUserId(null) }
  }

  async function handleReviewFarm(farmId, approvalStatus) {
    try {
      setBusyFarmId(farmId)
      setStatusMessage('')
      await reviewFarm(farmId, approvalStatus, approvalStatus === 'APPROVED' ? 'VALID' : 'PENDING')
      setStatusMessage(`Đã cập nhật trạng thái duyệt nông trại sang ${approvalStatus}.`)
      await loadAdminData()
    } catch (err) {
      setStatusMessage(err?.response?.data?.message || 'Không duyệt được nông trại.')
    } finally {
      setBusyFarmId(null)
    }
  }

  return (
    <section className="page-section admin-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Trung tâm quản trị</p>
          <h2>Bảng điều khiển quản trị</h2>
          <p>Khu vực quản trị tổng hợp cho người dùng, phê duyệt nông trại, quản lý nhà bán lẻ, gói dịch vụ và blockchain của dự án BICAP.</p>
        </div>
        <div className="section-actions">
          <Button variant="secondary" onClick={loadAdminData} disabled={loading}>Làm mới dữ liệu</Button>
        </div>
      </div>

      <div className="status-grid">
        <StatusCard label="Tổng người dùng" value={users.length} tone="primary" />
        <StatusCard label="Đang hoạt động" value={metrics.activeUsers} tone="success" />
        <StatusCard label="Tài khoản quản trị" value={metrics.adminUsers} tone="warning" />
        <StatusCard label="Nông trại chờ duyệt" value={metrics.pendingFarms} tone="primary" />
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {statusMessage ? <div className="alert alert-success">{statusMessage}</div> : null}

      {activeTab === 'users' ? (
        <>
          <div className="content-grid admin-top-grid">
            <article className="glass-card">
              <h3>Bộ lọc & tìm kiếm người dùng</h3>
              <div className="admin-filters">
                <label className="form-field">
                  <span className="form-label">Tìm theo tên / email / số điện thoại</span>
                  <input className="form-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ví dụ: admin@bicap.com" />
                </label>
                <label className="form-field">
                  <span className="form-label">Lọc theo vai trò</span>
                  <select className="form-input" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>{role === 'ALL' ? 'Tất cả vai trò' : ROLE_LABELS[role] || role}</option>
                    ))}
                  </select>
                </label>
                <label className="form-field">
                  <span className="form-label">Lọc theo trạng thái</span>
                  <select className="form-input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status === 'ALL' ? 'Tất cả trạng thái' : status}</option>
                    ))}
                  </select>
                </label>
              </div>
            </article>

            <article className="glass-card admin-action-card">
              <h3>Thao tác quản trị nhanh</h3>
              <p className="muted-inline">Chọn một người dùng để gán vai trò hoặc khoá / mở khoá tài khoản.</p>
              {selectedUser ? (
                <div className="admin-selected-user">
                  <strong>{selectedUser.fullName}</strong>
                  <span>{selectedUser.email}</span>
                  <span>Vai trò hiện có: {getRoleNames(selectedUser).map((role) => ROLE_LABELS[role] || role).join(', ')}</span>
                  <span>Trạng thái: {selectedUser.status}</span>
                </div>
              ) : <p>Chưa có người dùng nào được chọn.</p>}

              <div className="inline-actions top-gap">
                <select className="form-input" value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)}>
                  {Object.values(ROLES).map((role) => (
                    <option key={role} value={role}>{ROLE_LABELS[role] || role}</option>
                  ))}
                </select>
                <Button onClick={handleAssignRole} disabled={!selectedUser || isAssigningRole}>{isAssigningRole ? 'Đang gán...' : 'Gán vai trò'}</Button>
              </div>

              {selectedUser ? (
                <div className="inline-actions top-gap">
                  <Button variant="secondary" onClick={() => handleToggleStatus(selectedUser)} disabled={busyUserId === selectedUser.userId}>
                    {busyUserId === selectedUser.userId ? 'Đang cập nhật...' : selectedUser.status === 'ACTIVE' ? 'Khoá tài khoản' : 'Mở lại tài khoản'}
                  </Button>
                  <Button variant="secondary" onClick={() => handleDeleteUser(selectedUser.userId)} disabled={busyUserId === selectedUser.userId}>Xoá</Button>
                </div>
              ) : null}
              
              <hr />
              <Button onClick={handleCreateAdmin}>+ Tạo Admin Mới</Button>
            </article>
          </div>

          <article className="glass-card">
            <div className="admin-table-head">
              <div>
                <h3>Danh sách người dùng</h3>
                <p>Quản lý tài khoản, vai trò và trạng thái người dùng trên hệ thống.</p>
              </div>
              <span>{filteredUsers.length} kết quả</span>
            </div>
            <div className="admin-table-wrap">
                <table className="admin-table" style={{ width: '100%', tableLayout: 'fixed' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '25%', textAlign: 'left' }}>Người dùng</th>
                      <th style={{ width: '25%', textAlign: 'left' }}>Email</th>
                      <th style={{ width: '15%', textAlign: 'left' }}>Số điện thoại</th>
                      <th style={{ width: '15%', textAlign: 'left' }}>Vai trò</th>
                      <th style={{ width: '10%', textAlign: 'left' }}>Trạng thái</th>
                      <th style={{ width: '10%', textAlign: 'right' }}>Hành động</th>
                    </tr>
                  </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const isSelected = selectedUser?.userId === user.userId
                    const roles = getRoleNames(user)
                    return (
                      <tr key={user.userId} className={isSelected ? 'is-selected' : ''} onClick={() => setSelectedUserId(user.userId)}>
                        <td><div className="table-user-cell" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}><strong>{user.fullName}</strong><span>#{user.userId}</span></div></td>
                        <td style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</td>
                        <td>{user.phone || 'Chưa cập nhật'}</td>
                        <td><div className="role-chip-wrap">{roles.map((role) => <span key={`${user.userId}-${role}`} className="role-chip">{ROLE_LABELS[role] || role}</span>)}</div></td>
                        <td><span className={`status-pill status-${(user.status || '').toLowerCase()}`}>{user.status}</span></td>
                        <td style={{ textAlign: 'right' }}>
                          <Button variant="secondary" onClick={(event) => { event.stopPropagation(); handleToggleStatus(user) }} disabled={busyUserId === user.userId}>
                            {busyUserId === user.userId ? '...' : user.status === 'ACTIVE' ? 'Khoá' : 'Mở'}
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </article>
        </>
      ) : null}

      {activeTab === 'farms' ? (
        <div className="farm-board-grid">
          <article className="glass-card farm-board-column">
            <div className="admin-table-head"><div><h3>Chờ duyệt</h3><p>Hồ sơ nông trại đang chờ quản trị viên xem xét.</p></div></div>
            <div className="farm-board-list">
              {farms.filter((farm) => farm.approvalStatus !== 'APPROVED' && farm.approvalStatus !== 'REJECTED').map((farm) => (
                <div key={farm.farmId || farm.id} className="farm-board-item pending" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(162, 184, 214, 0.12)', marginBottom: '16px' }}>
                  <strong style={{ fontSize: '1.1rem' }}>{farm.farmName || 'Chưa có tên nông trại'}</strong>
                  <span style={{ color: '#89a0bc' }}>{farm.farmCode || 'N/A'} • {farm.address || farm.province || 'Chưa cập nhật'}</span>
                  <small style={{ color: '#93cbff' }}>Chứng nhận: {farm.certificationStatus || 'PENDING'}</small>
                  <div className="role-chip-wrap top-gap">
                    <Button variant="secondary" onClick={() => handleReviewFarm(farm.farmId || farm.id, 'APPROVED')} disabled={busyFarmId === (farm.farmId || farm.id)}>Duyệt</Button>
                    <Button onClick={() => handleReviewFarm(farm.farmId || farm.id, 'REJECTED')} disabled={busyFarmId === (farm.farmId || farm.id)}>Từ chối</Button>
                    <Button variant="secondary">Quản lý chi tiết</Button>
                  </div>
                </div>
              ))}
            </div>
          </article>
          <article className="glass-card farm-board-column approved-column">
            <div className="admin-table-head"><div><h3>Đã duyệt</h3><p>Các nông trại đã hợp lệ và có thể hoạt động trên hệ thống.</p></div></div>
            <div className="farm-board-list">
              {farms.filter((farm) => farm.approvalStatus === 'APPROVED').map((farm) => (
                <div key={farm.farmId || farm.id} className="farm-board-item approved" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px', background: 'rgba(51, 212, 139, 0.04)', borderRadius: '14px', border: '1px solid rgba(51, 212, 139, 0.16)', marginBottom: '16px' }}>
                  <strong style={{ fontSize: '1.1rem', color: '#89efbb' }}>{farm.farmName || 'Chưa có tên nông trại'}</strong>
                  <span style={{ color: '#89a0bc' }}>{farm.farmCode || 'N/A'} • {farm.address || farm.province || 'Chưa cập nhật'}</span>
                  <small style={{ color: '#93cbff' }}>Chứng nhận: {farm.certificationStatus || 'VALID'}</small>
                  <div className="top-gap"><Button variant="secondary">Quản lý chi tiết</Button></div>
                </div>
              ))}
            </div>
          </article>
          <article className="glass-card farm-board-column rejected-column">
            <div className="admin-table-head"><div><h3>Từ chối</h3><p>Các hồ sơ chưa đáp ứng điều kiện chứng nhận hoặc thông tin pháp lý.</p></div></div>
            <div className="farm-board-list">
              {farms.filter((farm) => farm.approvalStatus === 'REJECTED').map((farm) => (
                <div key={farm.farmId || farm.id} className="farm-board-item rejected" style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px', background: 'rgba(255, 93, 93, 0.04)', borderRadius: '14px', border: '1px solid rgba(255, 93, 93, 0.16)', marginBottom: '16px' }}>
                  <strong style={{ fontSize: '1.1rem', color: '#ffabab' }}>{farm.farmName || 'Chưa có tên nông trại'}</strong>
                  <span style={{ color: '#89a0bc' }}>{farm.farmCode || 'N/A'} • {farm.address || farm.province || 'Chưa cập nhật'}</span>
                  <small style={{ color: '#93cbff' }}>Chứng nhận: {farm.certificationStatus || 'PENDING'}</small>
                </div>
              ))}
            </div>
          </article>
        </div>
      ) : null}

      {activeTab === 'retailers' ? (
        <div className="retailer-directory-grid">
          {retailers.map((retailer) => (
            <article key={retailer.retailerId || retailer.id} className="glass-card retailer-profile-card">
              <div className="retailer-avatar">🏪</div>
              <div className="retailer-profile-body">
                <div className="admin-table-head">
                  <div>
                    <h3>{retailer.retailerName || 'Nhà bán lẻ chưa đặt tên'}</h3>
                    <p>Mã nhà bán lẻ: {retailer.retailerCode || 'N/A'}</p>
                  </div>
                  <span className={`status-pill status-${String(retailer.status || 'active').toLowerCase()}`}>{retailer.status || 'ACTIVE'}</span>
                </div>
                <ul className="feature-list">
                  <li>Giấy phép kinh doanh: {retailer.businessLicenseNo || 'Chưa cập nhật'}</li>
                  <li>Địa chỉ hoạt động: {retailer.address || 'Chưa cập nhật'}</li>
                  <li>Mã định danh: {retailer.retailerId || retailer.id}</li>
                </ul>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {activeTab === 'packages' ? (
        <div className="feature-grid package-card-grid">
          {packages.map((item) => (
            <article key={item.packageId || item.id} className="feature-card package-card">
              <span className="feature-badge">Gói dịch vụ</span>
              <h3>{item.packageName || 'Chưa có tên gói'}</h3>
              <p>Mã gói: {item.packageCode || 'N/A'}</p>
              <strong className="package-price">{item.price?.toLocaleString?.('vi-VN') || item.price || 0} đ</strong>
              <ul className="feature-list">
                <li>Thời hạn sử dụng: {item.durationDays || 0} ngày</li>
                <li>Số mùa vụ hỗ trợ: {item.maxSeasons || 0}</li>
                <li>Số tin đăng tối đa: {item.maxListings || 0}</li>
                <li>Trạng thái: {item.status || 'ACTIVE'}</li>
              </ul>
              <Button variant="secondary">Xem chi tiết gói</Button>
            </article>
          ))}
        </div>
      ) : null}

      {activeTab === 'products' ? (
        <div>
          {/* Sub-tab switcher */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <button
              onClick={() => setProductSubTab('products')}
              style={{
                padding: '0.6rem 1.4rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                background: productSubTab === 'products' ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.04)',
                color: productSubTab === 'products' ? '#4ade80' : 'rgba(255,255,255,0.5)',
                borderBottom: productSubTab === 'products' ? '2px solid #4ade80' : '2px solid transparent',
              }}
            >📦 Sản phẩm ({products.length})</button>
            <button
              onClick={() => setProductSubTab('categories')}
              style={{
                padding: '0.6rem 1.4rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                background: productSubTab === 'categories' ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.04)',
                color: productSubTab === 'categories' ? '#4ade80' : 'rgba(255,255,255,0.5)',
                borderBottom: productSubTab === 'categories' ? '2px solid #4ade80' : '2px solid transparent',
              }}
            >🏷️ Chuyên mục ({categories.length})</button>
          </div>

          {/* ── PRODUCTS sub-tab ── */}
          {productSubTab === 'products' ? (
            <article className="glass-card">
              <div className="admin-table-head">
                <div><h3>Danh sách sản phẩm</h3><p>Quản lý thông tin sản phẩm trên nền tảng BICAP.</p></div>
                <Button onClick={() => { setEditingProduct(null); setProductForm({ productName: '', productCode: '', description: '', price: '', imageUrl: '', sortOrder: '0', status: 'ACTIVE', categoryId: '' }); setShowProductForm(true) }}>+ Thêm sản phẩm</Button>
              </div>

              {/* Product Form */}
              {showProductForm && (
                <div style={{ background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <h4 style={{ color: '#4ade80', marginBottom: '1rem' }}>{editingProduct ? '✏️ Sửa sản phẩm' : '➕ Thêm sản phẩm mới'}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <label className="form-field">
                      <span className="form-label">Số thứ tự hiển thị</span>
                      <input className="form-input" type="number" value={productForm.sortOrder}
                        onChange={e => setProductForm(f => ({ ...f, sortOrder: e.target.value }))} />
                      <small style={{ color: 'rgba(255,255,255,0.35)' }}>Số càng thấp, hiển thị càng lên đầu</small>
                    </label>
                    <label className="form-field">
                      <span className="form-label">Tên sản phẩm *</span>
                      <input className="form-input" placeholder="Nhập tên sản phẩm" value={productForm.productName}
                        onChange={e => setProductForm(f => ({ ...f, productName: e.target.value }))} />
                    </label>
                    <label className="form-field">
                      <span className="form-label">Mã sản phẩm</span>
                      <input className="form-input" placeholder="Tự động nếu để trống" value={productForm.productCode}
                        onChange={e => setProductForm(f => ({ ...f, productCode: e.target.value }))} />
                    </label>
                    <label className="form-field">
                      <span className="form-label">Chuyên mục</span>
                      <select className="form-input" value={productForm.categoryId}
                        onChange={e => setProductForm(f => ({ ...f, categoryId: e.target.value }))}>
                        <option value="">-- Chọn chuyên mục --</option>
                        {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
                      </select>
                      <small style={{ color: 'rgba(255,255,255,0.35)' }}>Thêm chuyên mục tại tab <button style={{ background: 'none', border: 'none', color: '#4ade80', cursor: 'pointer', padding: 0 }} onClick={() => { setShowProductForm(false); setProductSubTab('categories') }}>Chuyên mục</button></small>
                    </label>
                    <label className="form-field">
                      <span className="form-label">Giá sản phẩm (VND)</span>
                      <input className="form-input" type="number" placeholder="Nhập giá VND" value={productForm.price}
                        onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} />
                    </label>
                    <label className="form-field">
                      <span className="form-label">Trạng thái</span>
                      <select className="form-input" value={productForm.status}
                        onChange={e => setProductForm(f => ({ ...f, status: e.target.value }))}>
                        <option value="ACTIVE">Hiển thị</option>
                        <option value="INACTIVE">Ẩn</option>
                      </select>
                    </label>
                    <label className="form-field" style={{ gridColumn: '1 / -1' }}>
                      <span className="form-label">URL ảnh sản phẩm</span>
                      <input className="form-input" placeholder="https://..." value={productForm.imageUrl}
                        onChange={e => setProductForm(f => ({ ...f, imageUrl: e.target.value }))} />
                    </label>
                    <label className="form-field" style={{ gridColumn: '1 / -1' }}>
                      <span className="form-label">Chi tiết sản phẩm</span>
                      <textarea className="form-input" rows={3} placeholder="Nhập chi tiết sản phẩm" value={productForm.description}
                        onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} />
                    </label>
                  </div>
                  <div className="inline-actions top-gap">
                    <Button onClick={async () => {
                      try {
                        const payload = { ...productForm, sortOrder: Number(productForm.sortOrder) || 0, price: productForm.price ? Number(productForm.price) : null, categoryId: productForm.categoryId ? Number(productForm.categoryId) : null }
                        if (editingProduct) { await updateProduct(editingProduct.productId, payload) } else { await createProduct(payload) }
                        setShowProductForm(false); setEditingProduct(null); setStatusMessage(editingProduct ? 'Đã cập nhật sản phẩm.' : 'Đã thêm sản phẩm thành công.'); await loadAdminData()
                      } catch (e) { setError(e?.response?.data?.message || 'Lỗi lưu sản phẩm') }
                    }}>{editingProduct ? 'Lưu thay đổi' : 'Thêm sản phẩm'}</Button>
                    <Button variant="secondary" onClick={() => { setShowProductForm(false); setEditingProduct(null) }}>Hủy</Button>
                  </div>
                </div>
              )}

              <div className="admin-table-wrap">
                <table className="admin-table" style={{ width: '100%', tableLayout: 'fixed' }}>
                  <thead><tr>
                    <th style={{ width: '5%' }}>STT</th>
                    <th style={{ width: '30%' }}>Tên sản phẩm</th>
                    <th style={{ width: '20%' }}>Chuyên mục</th>
                    <th style={{ width: '15%' }}>Giá</th>
                    <th style={{ width: '10%' }}>Trạng thái</th>
                    <th style={{ width: '20%', textAlign: 'right' }}>Hành động</th>
                  </tr></thead>
                  <tbody>
                    {products.map(item => (
                      <tr key={item.productId}>
                        <td>{item.sortOrder ?? 0}</td>
                        <td><div className="table-user-cell"><strong>{item.productName}</strong><span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{item.productCode}</span></div></td>
                        <td><span className="role-chip">{item.categoryName || '—'}</span></td>
                        <td>{item.price ? Number(item.price).toLocaleString('vi-VN') + 'đ' : '—'}</td>
                        <td><span className={`status-pill status-${(item.status || '').toLowerCase()}`}>{item.status === 'ACTIVE' ? 'Hiển thị' : 'Ẩn'}</span></td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="inline-actions" style={{ justifyContent: 'flex-end' }}>
                            <Button variant="secondary" onClick={() => { setEditingProduct(item); setProductForm({ productName: item.productName || '', productCode: item.productCode || '', description: item.description || '', price: item.price || '', imageUrl: item.imageUrl || '', sortOrder: item.sortOrder ?? 0, status: item.status || 'ACTIVE', categoryId: item.categoryId || '' }); setShowProductForm(true) }}>Sửa</Button>
                            <Button variant="secondary" onClick={async () => { if (!window.confirm('Xóa sản phẩm này?')) return; await deleteProduct(item.productId); setStatusMessage('Đã xóa sản phẩm.'); await loadAdminData() }}>Xóa</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.3)' }}>Chưa có sản phẩm nào</td></tr>}
                  </tbody>
                </table>
              </div>
            </article>
          ) : null}

          {/* ── CATEGORIES sub-tab ── */}
          {productSubTab === 'categories' ? (
            <article className="glass-card">
              <div className="admin-table-head">
                <div><h3>Danh sách chuyên mục</h3><p>Tạo và quản lý chuyên mục để phân loại sản phẩm.</p></div>
                <Button onClick={() => { setEditingCategory(null); setCategoryForm({ categoryName: '', slug: '', imageUrl: '', icon: '', sortOrder: '0', status: 'ACTIVE' }); setShowCategoryForm(true) }}>+ Thêm chuyên mục</Button>
              </div>

              {/* Category Form */}
              {showCategoryForm && (
                <div style={{ background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <h4 style={{ color: '#4ade80', marginBottom: '1rem' }}>{editingCategory ? '✏️ Sửa chuyên mục' : '➕ Thêm chuyên mục mới'}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <label className="form-field">
                      <span className="form-label">Tên chuyên mục *</span>
                      <input className="form-input" placeholder="Ví dụ: Rau củ quả" value={categoryForm.categoryName}
                        onChange={e => setCategoryForm(f => ({ ...f, categoryName: e.target.value }))} />
                    </label>
                    <label className="form-field">
                      <span className="form-label">Slug (tùy chọn)</span>
                      <input className="form-input" placeholder="rau-cu-qua" value={categoryForm.slug}
                        onChange={e => setCategoryForm(f => ({ ...f, slug: e.target.value }))} />
                    </label>
                    <label className="form-field">
                      <span className="form-label">Biểu tượng (Icon / Emoji)</span>
                      <input className="form-input" placeholder="Ví dụ: 🐕, 🥬, 📦..." value={categoryForm.icon}
                        onChange={e => setCategoryForm(f => ({ ...f, icon: e.target.value }))} />
                    </label>
                    <label className="form-field">
                      <span className="form-label">Số thứ tự</span>
                      <input className="form-input" type="number" value={categoryForm.sortOrder}
                        onChange={e => setCategoryForm(f => ({ ...f, sortOrder: e.target.value }))} />
                    </label>
                    <label className="form-field">
                      <span className="form-label">Trạng thái</span>
                      <select className="form-input" value={categoryForm.status}
                        onChange={e => setCategoryForm(f => ({ ...f, status: e.target.value }))}>
                        <option value="ACTIVE">Hiển thị</option>
                        <option value="INACTIVE">Ẩn</option>
                      </select>
                    </label>
                    <label className="form-field">
                      <span className="form-label">URL ảnh bìa chuyên mục</span>
                      <input className="form-input" placeholder="https://..." value={categoryForm.imageUrl}
                        onChange={e => setCategoryForm(f => ({ ...f, imageUrl: e.target.value }))} />
                    </label>
                  </div>
                  <div className="inline-actions top-gap">
                    <Button onClick={async () => {
                      try {
                        const payload = { ...categoryForm, sortOrder: Number(categoryForm.sortOrder) || 0 }
                        if (editingCategory) { await updateCategory(editingCategory.categoryId, payload) } else { await createCategory(payload) }
                        setShowCategoryForm(false); setEditingCategory(null); setStatusMessage(editingCategory ? 'Đã cập nhật chuyên mục.' : 'Đã thêm chuyên mục thành công.'); await loadAdminData()
                      } catch (e) { setError(e?.response?.data?.message || 'Lỗi lưu chuyên mục') }
                    }}>{editingCategory ? 'Lưu thay đổi' : 'Thêm chuyên mục'}</Button>
                    <Button variant="secondary" onClick={() => { setShowCategoryForm(false); setEditingCategory(null) }}>Hủy</Button>
                  </div>
                </div>
              )}

              <div className="admin-table-wrap">
                <table className="admin-table" style={{ width: '100%', tableLayout: 'fixed' }}>
                  <thead><tr>
                    <th style={{ width: '5%' }}>STT</th>
                    <th style={{ width: '35%' }}>Tên chuyên mục</th>
                    <th style={{ width: '25%' }}>Slug</th>
                    <th style={{ width: '15%' }}>Trạng thái</th>
                    <th style={{ width: '20%', textAlign: 'right' }}>Hành động</th>
                  </tr></thead>
                  <tbody>
                    {categories.map(cat => (
                      <tr key={cat.categoryId}>
                        <td>{cat.sortOrder ?? 0}</td>
                        <td><div className="table-user-cell"><strong>{cat.icon ? `${cat.icon} ` : ''}{cat.categoryName}</strong></div></td>
                        <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{cat.slug}</td>
                        <td><span className={`status-pill status-${(cat.status || '').toLowerCase()}`}>{cat.status === 'ACTIVE' ? 'Hiển thị' : 'Ẩn'}</span></td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="inline-actions" style={{ justifyContent: 'flex-end' }}>
                            <Button variant="secondary" onClick={() => { setEditingCategory(cat); setCategoryForm({ categoryName: cat.categoryName || '', slug: cat.slug || '', imageUrl: cat.imageUrl || '', icon: cat.icon || '', sortOrder: cat.sortOrder ?? 0, status: cat.status || 'ACTIVE' }); setShowCategoryForm(true) }}>Sửa</Button>
                            <Button variant="secondary" onClick={async () => { if (!window.confirm('Xóa chuyên mục này?')) return; await deleteCategory(cat.categoryId); setStatusMessage('Đã xóa chuyên mục.'); await loadAdminData() }}>Xóa</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {categories.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.3)' }}>Chưa có chuyên mục nào</td></tr>}
                  </tbody>
                </table>
              </div>
            </article>
          ) : null}
        </div>
      ) : null}

      {activeTab === 'blockchain' ? (
        <article className="glass-card">
          <div className="admin-table-head">
            <div>
              <h3>Quản lý blockchain / hợp đồng thông minh</h3>
              <p>Khu vực mô phỏng giám sát hợp đồng thông minh, phiên bản triển khai và khả năng cập nhật minh bạch truy xuất nguồn gốc.</p>
            </div>
            <span>{blockchainModules.length} hợp đồng</span>
          </div>
          <div className="feature-grid blockchain-grid">
            {blockchainModules.map((item) => (
              <article key={item.name} className="feature-card blockchain-card">
                <span className="feature-badge">Blockchain</span>
                <h3>{item.name}</h3>
                <p>Mạng: {item.network}</p>
                <p>Phiên bản: {item.version}</p>
                <p>Trạng thái: {item.status}</p>
                <div className="role-chip-wrap top-gap">
                  <Button variant="secondary">Xem cấu hình</Button>
                  <Button onClick={handleDeployContract}>Triển khai mới</Button>
                </div>
              </article>
            ))}
          </div>
        </article>
      ) : null}
    </section>
  )
}
