import { useEffect, useMemo, useState } from 'react'
import '../admin-control.css'
import '../transaction-hardening.css'
import { Button } from '../components/Button.jsx'
import {
  assignRole,
  changeUserStatus,
  createAdminAccount,
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  deleteUserAccount,
  getCategories,
  getFarmById,
  getFarms,
  getProducts,
  getUserById,
  getUsers,
  removeUserRole,
  reviewFarm,
  updateCategory,
  updateFarmDetailByAdmin,
  updateProduct,
  getAdminGovernanceOverview,
  getBlockchainGovernanceConfig,
  getBlockchainTransactions,
  deploySmartContract,
  getPermissionMatrix,
  seedPermissions,
} from '../services/adminService.js'
import { getErrorMessage } from '../utils/helpers.js'
import { ROLE_LABELS, ROLES } from '../utils/constants.js'

const userStatusFlow = ['ACTIVE', 'INACTIVE', 'BLOCKED']
const adminCreationInitial = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
  initialRole: 'ADMIN',
}

const farmEditInitial = {
  farmId: null,
  farmName: '',
  farmType: '',
  businessLicenseNo: '',
  address: '',
  province: '',
  totalArea: '',
  contactPerson: '',
  description: '',
}

const productFormInitial = {
  productId: null,
  productName: '',
  productCode: '',
  description: '',
  price: '',
  imageUrl: '',
  sortOrder: 0,
  status: 'ACTIVE',
  categoryId: '',
}

const categoryFormInitial = {
  categoryId: null,
  categoryName: '',
  slug: '',
  imageUrl: '',
  icon: '',
  sortOrder: 0,
  status: 'ACTIVE',
}

function countByStatus(list, key) {
  return list.reduce((acc, item) => {
    const value = item?.[key] || 'UNKNOWN'
    acc[value] = (acc[value] || 0) + 1
    return acc
  }, {})
}

function formatDate(value) {
  if (!value) return 'Chưa có'
  return new Date(value).toLocaleString('vi-VN')
}

function normalizePrice(value) {
  if (value === '' || value === null || value === undefined) return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

export function AdminControlCenterPage() {
  const [users, setUsers] = useState([])
  const [farms, setFarms] = useState([])
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [adminForm, setAdminForm] = useState(adminCreationInitial)
  const [farmEdit, setFarmEdit] = useState(farmEditInitial)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [selectedRole, setSelectedRole] = useState(ROLES.ADMIN)
  const [reviewDrafts, setReviewDrafts] = useState({})
  const [selectedFarmId, setSelectedFarmId] = useState(null)
  const [farmDetail, setFarmDetail] = useState(null)
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [productForm, setProductForm] = useState(productFormInitial)
  const [categoryForm, setCategoryForm] = useState(categoryFormInitial)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [overview, setOverview] = useState(null)
  const [blockchainConfig, setBlockchainConfig] = useState(null)
  const [blockchainTransactions, setBlockchainTransactions] = useState([])
  const [governanceDeployState, setGovernanceDeployState] = useState(null)
  const [permissionRows, setPermissionRows] = useState([])
  const permissionMatrix = [
    { role: 'ADMIN', permissions: ['USERS_MANAGE', 'FARMS_REVIEW', 'BLOCKCHAIN_GOVERNANCE', 'RETAILERS_MANAGE', 'SHIPMENTS_MANAGE', 'NOTIFICATIONS_MANAGE', 'ALL_ACCESS'] },
    { role: 'MANAGER', permissions: ['FARMS_REVIEW', 'SHIPMENTS_MANAGE', 'NOTIFICATIONS_MANAGE'] },
    { role: 'GOVERNANCE_ADMIN', permissions: ['BLOCKCHAIN_GOVERNANCE'] },
    { role: 'USER_ADMIN', permissions: ['USERS_MANAGE'] },
  ]

  const selectedUser = useMemo(
    () => users.find((user) => user.userId === Number(selectedUserId)) || users[0] || null,
    [users, selectedUserId],
  )

  const selectedProduct = useMemo(
    () => products.find((product) => product.productId === Number(selectedProductId)) || null,
    [products, selectedProductId],
  )

  const selectedCategory = useMemo(
    () => categories.find((category) => category.categoryId === Number(selectedCategoryId)) || null,
    [categories, selectedCategoryId],
  )

  const pendingFarms = useMemo(
    () => farms.filter((farm) => farm.approvalStatus === 'PENDING'),
    [farms],
  )

  const metrics = useMemo(() => ({
    userStatuses: countByStatus(users, 'status'),
    farmApprovals: countByStatus(farms, 'approvalStatus'),
  }), [users, farms])

  async function loadAll() {
    try {
      setLoading(true)
      setError('')
      const [userData, farmData, productData, categoryData, overviewData, blockchainConfigData, blockchainTransactionsData, permissionData] = await Promise.all([
        getUsers(),
        getFarms(),
        getProducts(),
        getCategories(),
        getAdminGovernanceOverview(),
        getBlockchainGovernanceConfig(),
        getBlockchainTransactions(),
        getPermissionMatrix(),
      ])
      const normalizedUsers = Array.isArray(userData) ? userData : []
      const normalizedFarms = Array.isArray(farmData) ? farmData : []
      const normalizedProducts = Array.isArray(productData) ? productData : []
      const normalizedCategories = Array.isArray(categoryData) ? categoryData : []
      setUsers(normalizedUsers)
      setFarms(normalizedFarms)
      setProducts(normalizedProducts)
      setCategories(normalizedCategories)
      setSelectedUserId((prev) => prev || normalizedUsers[0]?.userId || null)
      setSelectedFarmId((prev) => prev || normalizedFarms[0]?.farmId || null)
      setSelectedProductId((prev) => prev || normalizedProducts[0]?.productId || null)
      setSelectedCategoryId((prev) => prev || normalizedCategories[0]?.categoryId || null)
      setOverview(overviewData || null)
      setBlockchainConfig(blockchainConfigData || null)
      setBlockchainTransactions(Array.isArray(blockchainTransactionsData) ? blockchainTransactionsData : [])
      setPermissionRows(Array.isArray(permissionData) ? permissionData : [])
    } catch (err) {
      setError(getErrorMessage(err, 'Không tải được dữ liệu control center.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    const timer = window.setInterval(() => {
      loadAll()
    }, 30000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    async function loadFarmDetail() {
      if (!selectedFarmId) {
        setFarmDetail(null)
        return
      }
      try {
        const detail = await getFarmById(selectedFarmId)
        setFarmDetail(detail)
        setFarmEdit({
          farmId: detail.farmId,
          farmName: detail.farmName || '',
          farmType: detail.farmType || '',
          businessLicenseNo: detail.businessLicenseNo || '',
          address: detail.address || '',
          province: detail.province || '',
          totalArea: detail.totalArea || '',
          contactPerson: detail.contactPerson || '',
          description: detail.description || '',
        })
      } catch (err) {
        setError(getErrorMessage(err, 'Không tải được chi tiết farm.'))
      }
    }

    loadFarmDetail()
  }, [selectedFarmId])

  useEffect(() => {
    if (selectedProduct) {
      setProductForm({
        productId: selectedProduct.productId,
        productName: selectedProduct.productName || '',
        productCode: selectedProduct.productCode || '',
        description: selectedProduct.description || '',
        price: selectedProduct.price || '',
        imageUrl: selectedProduct.imageUrl || '',
        sortOrder: selectedProduct.sortOrder ?? 0,
        status: selectedProduct.status || 'ACTIVE',
        categoryId: selectedProduct.categoryId || '',
      })
    } else {
      setProductForm(productFormInitial)
    }
  }, [selectedProduct])

  useEffect(() => {
    if (selectedCategory) {
      setCategoryForm({
        categoryId: selectedCategory.categoryId,
        categoryName: selectedCategory.categoryName || '',
        slug: selectedCategory.slug || '',
        imageUrl: selectedCategory.imageUrl || '',
        icon: selectedCategory.icon || '',
        sortOrder: selectedCategory.sortOrder ?? 0,
        status: selectedCategory.status || 'ACTIVE',
      })
    } else {
      setCategoryForm(categoryFormInitial)
    }
  }, [selectedCategory])

  function patchReviewDraft(farmId, key, value) {
    setReviewDrafts((prev) => ({
      ...prev,
      [farmId]: {
        ...prev[farmId],
        [key]: value,
      },
    }))
  }

  async function handleRefreshGovernance() {
    try {
      setSaving(true)
      setError('')
      const [configData, txData] = await Promise.all([getBlockchainGovernanceConfig(), getBlockchainTransactions()])
      setBlockchainConfig(configData || null)
      setBlockchainTransactions(Array.isArray(txData) ? txData : [])
      setSuccess('Đã làm mới dữ liệu blockchain governance.')
    } catch (err) {
      setError(getErrorMessage(err, 'Không làm mới được blockchain governance.'))
    } finally {
      setSaving(false)
    }
  }


  async function handleSeedPermissions() {
    try {
      setSaving(true)
      setError('')
      await seedPermissions()
      setSuccess('Đã seed permission matrix.')
      await loadAll()
    } catch (err) {
      setError(getErrorMessage(err, 'Không seed được permission matrix.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDeployContract() {
    try {
      setSaving(true)
      setError('')
      const result = await deploySmartContract({ dryRun: false })
      setGovernanceDeployState(result || null)
      setSuccess(result?.note || 'Đã gửi yêu cầu deploy / manage contract.')
      await handleRefreshGovernance()
    } catch (err) {
      setError(getErrorMessage(err, 'Không thực thi được governance deploy.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleCreateAdmin(event) {
    event.preventDefault()
    try {
      setSaving(true)
      setError('')
      await createAdminAccount(adminForm)
      setAdminForm(adminCreationInitial)
      setSuccess('Đã tạo tài khoản quản trị mới bằng flow thật.')
      await loadAll()
    } catch (err) {
      setError(getErrorMessage(err, 'Không tạo được tài khoản quản trị.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleAssignRole() {
    if (!selectedUser) return
    try {
      setSaving(true)
      setError('')
      await assignRole(selectedUser.userId, selectedRole)
      const freshUser = await getUserById(selectedUser.userId)
      setSuccess(`Đã gán role ${ROLE_LABELS[selectedRole] || selectedRole} cho ${selectedUser.fullName}.`)
      setUsers((prev) => prev.map((user) => (user.userId === freshUser.userId ? freshUser : user)))
    } catch (err) {
      setError(getErrorMessage(err, 'Không gán được role.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleRemoveRole(roleName) {
    if (!selectedUser) return
    try {
      setSaving(true)
      setError('')
      await removeUserRole(selectedUser.userId, roleName)
      const freshUser = await getUserById(selectedUser.userId)
      setSuccess(`Đã gỡ role ${ROLE_LABELS[roleName] || roleName} khỏi ${selectedUser.fullName}.`)
      setUsers((prev) => prev.map((user) => (user.userId === freshUser.userId ? freshUser : user)))
    } catch (err) {
      setError(getErrorMessage(err, 'Không gỡ được role.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange(nextStatus) {
    if (!selectedUser) return
    try {
      setSaving(true)
      setError('')
      await changeUserStatus(selectedUser.userId, nextStatus)
      const freshUser = await getUserById(selectedUser.userId)
      setSuccess(`Đã chuyển trạng thái ${selectedUser.fullName} sang ${nextStatus}.`)
      setUsers((prev) => prev.map((user) => (user.userId === freshUser.userId ? freshUser : user)))
    } catch (err) {
      setError(getErrorMessage(err, 'Không cập nhật được trạng thái user.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteSelectedUser() {
    if (!selectedUser) return
    if (!window.confirm(`Xoá tài khoản ${selectedUser.fullName}?`)) return
    try {
      setSaving(true)
      setError('')
      await deleteUserAccount(selectedUser.userId)
      setSuccess(`Đã xoá tài khoản ${selectedUser.fullName}.`)
      await loadAll()
    } catch (err) {
      setError(getErrorMessage(err, 'Không xoá được tài khoản user.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleReviewFarm(farmId, status) {
    try {
      setSaving(true)
      setError('')
      const draft = reviewDrafts[farmId] || {}
      await reviewFarm(farmId, status, draft.reviewComment || '')
      setSuccess(`Đã ${status === 'APPROVED' ? 'duyệt' : 'từ chối'} hồ sơ nông trại.`)
      await loadAll()
      if (Number(selectedFarmId) === Number(farmId)) {
        const detail = await getFarmById(farmId)
        setFarmDetail(detail)
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Không xử lý được review farm.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveFarmDetail(event) {
    event.preventDefault()
    if (!farmEdit.farmId) return
    try {
      setSaving(true)
      setError('')
      await updateFarmDetailByAdmin(farmEdit.farmId, {
        farmName: farmEdit.farmName,
        farmType: farmEdit.farmType,
        businessLicenseNo: farmEdit.businessLicenseNo,
        address: farmEdit.address,
        province: farmEdit.province,
        totalArea: farmEdit.totalArea === '' ? null : Number(farmEdit.totalArea),
        contactPerson: farmEdit.contactPerson,
        description: farmEdit.description,
      })
      const detail = await getFarmById(farmEdit.farmId)
      setFarmDetail(detail)
      setSuccess('Đã cập nhật chi tiết farm từ admin control center.')
      await loadAll()
    } catch (err) {
      setError(getErrorMessage(err, 'Không lưu được chi tiết farm.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveProduct(event) {
    event.preventDefault()
    try {
      setSaving(true)
      setError('')
      const payload = {
        productName: productForm.productName,
        productCode: productForm.productCode,
        description: productForm.description,
        price: normalizePrice(productForm.price),
        imageUrl: productForm.imageUrl,
        sortOrder: Number(productForm.sortOrder) || 0,
        status: productForm.status,
        categoryId: productForm.categoryId ? Number(productForm.categoryId) : null,
      }
      if (productForm.productId) {
        await updateProduct(productForm.productId, payload)
        setSuccess('Đã cập nhật sản phẩm.')
      } else {
        await createProduct(payload)
        setSuccess('Đã tạo sản phẩm mới.')
      }
      await loadAll()
    } catch (err) {
      setError(getErrorMessage(err, 'Không lưu được sản phẩm.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteSelectedProduct() {
    if (!productForm.productId) return
    try {
      setSaving(true)
      setError('')
      await deleteProduct(productForm.productId)
      setSuccess('Đã xoá sản phẩm.')
      setSelectedProductId(null)
      setProductForm(productFormInitial)
      await loadAll()
    } catch (err) {
      setError(getErrorMessage(err, 'Không xóa được sản phẩm.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveCategory(event) {
    event.preventDefault()
    try {
      setSaving(true)
      setError('')
      const payload = {
        categoryName: categoryForm.categoryName,
        slug: categoryForm.slug,
        imageUrl: categoryForm.imageUrl,
        icon: categoryForm.icon,
        sortOrder: Number(categoryForm.sortOrder) || 0,
        status: categoryForm.status,
      }
      if (categoryForm.categoryId) {
        await updateCategory(categoryForm.categoryId, payload)
        setSuccess('Đã cập nhật chuyên mục.')
      } else {
        await createCategory(payload)
        setSuccess('Đã tạo chuyên mục mới.')
      }
      await loadAll()
    } catch (err) {
      setError(getErrorMessage(err, 'Không lưu được chuyên mục.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteSelectedCategory() {
    if (!categoryForm.categoryId) return
    try {
      setSaving(true)
      setError('')
      await deleteCategory(categoryForm.categoryId)
      setSuccess('Đã xoá chuyên mục.')
      setSelectedCategoryId(null)
      setCategoryForm(categoryFormInitial)
      await loadAll()
    } catch (err) {
      setError(getErrorMessage(err, 'Không xóa được chuyên mục.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page-section admin-control-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Admin governance core</p>
          <h2>Admin control center</h2>
          <p>Điều phối user lifecycle, hồ sơ farm, và product catalog trong một trung tâm quản trị nhất quán, ít mock và sát nghiệp vụ hơn.</p>
        </div>
        <div className="section-actions">
          <Button variant="secondary" onClick={loadAll} disabled={loading || saving}>Làm mới</Button>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}
      {loading ? <div className="glass-card">Đang tải dữ liệu governance...</div> : null}

      <div className="glass-card">
        <h3>Admin governance overview</h3>
        <div className="status-grid" style={{ marginTop: '12px' }}>
          <div className="mini-stat"><strong>{overview?.pendingListings?.length || 0}</strong><span>Pending listings</span></div>
          <div className="mini-stat"><strong>{overview?.openReports?.length || 0}</strong><span>Open reports</span></div>
          <div className="mini-stat"><strong>{overview?.shipmentIssues?.length || 0}</strong><span>Shipment issues</span></div>
          <div className="mini-stat"><strong>{blockchainTransactions.length}</strong><span>Blockchain tx</span></div>
        </div>
      </div>

      <div className="glass-card top-gap">
        <h3>Live admin sync</h3>
        <p className="muted-inline">Tự làm mới mỗi 30 giây để bắt kịp thay đổi notification, report, farms và blockchain monitor.</p>
      </div>

      <div className="glass-card top-gap">
        <div className="panel-header-row">
          <div>
            <h3>Permission matrix</h3>
          </div>
          <Button variant="secondary" onClick={handleSeedPermissions} disabled={saving}>Seed defaults</Button>
        </div>
        <div className="form-grid top-gap">
          {(permissionRows.length ? permissionRows : permissionMatrix.flatMap((row) => row.permissions.map((permissionName) => ({ roleName: row.role, permissionName })))).map((row) => (
            <div key={`${row.roleName || row.role}-${row.permissionName}`} className="business-card">
              <strong>{row.roleName || row.role}</strong>
              <p>{row.permissionName}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card top-gap">
        <h3>Blockchain governance</h3>
        <div className="inline-actions top-gap">
          <Button variant="secondary" onClick={handleRefreshGovernance} disabled={saving}>Làm mới governance</Button>
          <Button onClick={handleDeployContract} disabled={saving}>Deploy / manage contract</Button>
        </div>
        <div className="feature-grid top-gap">
          <div className="business-card">
            <strong>{blockchainConfig?.contractName || 'N/A'}</strong>
            <p>Address: {blockchainConfig?.contractAddress || 'No address configured'}</p>
            <p>Version: {blockchainConfig?.contractVersion || 'N/A'}</p>
            <p>Network: {blockchainConfig?.contractNetwork || 'N/A'}</p>
          </div>
          <div className="business-card">
            <strong>Deployment</strong>
            <p>Status: {blockchainConfig?.deploymentStatus || 'N/A'}</p>
            <p>Governance: {blockchainConfig?.governanceStatus || 'N/A'}</p>
            <p>Active: {String(!!blockchainConfig?.active)}</p>
          </div>
        </div>
        <div className="business-card top-gap">
          <strong>Governance note</strong>
          <p>{governanceDeployState?.note || blockchainConfig?.governanceNote || 'N/A'}</p>
        </div>
        <div className="form-grid top-gap">
          {blockchainTransactions.length === 0 ? <p>Chưa có blockchain transaction.</p> : blockchainTransactions.map((tx) => (
            <div key={tx.txId} className="business-card">
              <strong>{tx.relatedEntityType} #{tx.relatedEntityId}</strong>
              <p>{tx.actionType} • {tx.txStatus}</p>
              <p>Governance: {tx.governanceStatus} • retry {tx.retryCount || 0}</p>
              <p>{tx.governanceNote || 'N/A'}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="status-grid">
        <div className="glass-card admin-summary-card"><strong>{users.length}</strong><p>Tổng user</p><small>ACTIVE: {metrics.userStatuses.ACTIVE || 0}, INACTIVE: {metrics.userStatuses.INACTIVE || 0}, BLOCKED: {metrics.userStatuses.BLOCKED || 0}</small></div>
        <div className="glass-card admin-summary-card"><strong>{pendingFarms.length}</strong><p>Farm chờ duyệt</p><small>APPROVED: {metrics.farmApprovals.APPROVED || 0}, REJECTED: {metrics.farmApprovals.REJECTED || 0}</small></div>
        <div className="glass-card admin-summary-card"><strong>{products.length}</strong><p>Sản phẩm quản lý</p><small>{products.filter((item) => item.status === 'ACTIVE').length} đang public</small></div>
        <div className="glass-card admin-summary-card"><strong>{categories.length}</strong><p>Chuyên mục</p><small>{categories.filter((item) => item.status === 'ACTIVE').length} đang hiển thị</small></div>
      </div>

      <div className="content-grid top-gap admin-control-grid">
        <article className="glass-card admin-panel-card">
          <div className="panel-header-row">
            <div>
              <p className="eyebrow">Admin accounts</p>
              <h3>Tạo tài khoản quản trị</h3>
            </div>
          </div>
          <form className="form-grid" onSubmit={handleCreateAdmin}>
            <input className="form-input" placeholder="Họ tên" value={adminForm.fullName} onChange={(e) => setAdminForm((prev) => ({ ...prev, fullName: e.target.value }))} />
            <input className="form-input" placeholder="Email" value={adminForm.email} onChange={(e) => setAdminForm((prev) => ({ ...prev, email: e.target.value }))} />
            <input className="form-input" placeholder="Số điện thoại" value={adminForm.phone} onChange={(e) => setAdminForm((prev) => ({ ...prev, phone: e.target.value }))} />
            <input className="form-input" type="password" placeholder="Mật khẩu" value={adminForm.password} onChange={(e) => setAdminForm((prev) => ({ ...prev, password: e.target.value }))} />
            <select className="form-input" value={adminForm.initialRole} onChange={(e) => setAdminForm((prev) => ({ ...prev, initialRole: e.target.value }))}>
              <option value="ADMIN">ADMIN</option>
              <option value="GUEST">GUEST</option>
            </select>
            <Button type="submit" disabled={saving}>{saving ? 'Đang tạo...' : 'Tạo admin/account quản trị'}</Button>
          </form>
        </article>

        <article className="glass-card admin-panel-card">
          <div className="panel-header-row">
            <div>
              <p className="eyebrow">User governance</p>
              <h3>User lifecycle</h3>
            </div>
          </div>
          <select className="form-input" value={selectedUserId || ''} onChange={(e) => setSelectedUserId(e.target.value)}>
            {users.map((user) => (
              <option key={user.userId} value={user.userId}>{user.fullName} - {user.email}</option>
            ))}
          </select>
          {selectedUser ? (
            <div className="top-gap form-grid">
              <div className="business-card business-card-stack">
                <strong>{selectedUser.fullName}</strong>
                <p>{selectedUser.email}</p>
                <p>Trạng thái hiện tại: {selectedUser.status}</p>
                <p>Roles: {selectedUser.roles?.join(', ') || 'GUEST'}</p>
              </div>

              <div className="inline-actions inline-actions-stretch">
                <select className="form-input" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                  {Object.values(ROLES).map((role) => <option key={role} value={role}>{ROLE_LABELS[role] || role}</option>)}
                </select>
                <Button onClick={handleAssignRole} disabled={saving}>Gán role</Button>
              </div>

              <div className="role-chip-wrap">
                {userStatusFlow.filter((status) => status !== selectedUser.status).map((status) => (
                  <button key={status} type="button" className="role-chip clickable-chip" onClick={() => handleStatusChange(status)} disabled={saving}>{status}</button>
                ))}
              </div>

              <div className="role-chip-wrap">
                {(selectedUser.roles || []).map((role) => (
                  <button key={role} type="button" className="role-chip clickable-chip" onClick={() => handleRemoveRole(role)} disabled={saving}>
                    Gỡ {ROLE_LABELS[role] || role}
                  </button>
                ))}
              </div>
            </div>
          ) : <p className="top-gap">Chưa có user nào.</p>}
        </article>
      </div>

      <div className="content-grid top-gap admin-control-grid admin-control-grid-wide">
        <article className="glass-card admin-panel-card">
          <div className="panel-header-row">
            <div>
              <p className="eyebrow">Farm approval board</p>
              <h3>Review queue</h3>
            </div>
          </div>
          <div className="form-grid">
            {pendingFarms.length === 0 ? <p>Không còn farm chờ duyệt.</p> : null}
            {pendingFarms.map((farm) => {
              const draft = reviewDrafts[farm.farmId] || {}
              return (
                <div key={farm.farmId} className="business-card business-card-stack admin-queue-card">
                  <div className="detail-topline">
                    <strong>{farm.farmName}</strong>
                    <span className={`status-pill status-${(farm.approvalStatus || '').toLowerCase()}`}>{farm.approvalStatus}</span>
                  </div>
                  <p>Mã farm: {farm.farmCode}</p>
                  <p>Owner: {farm.ownerName || 'Chưa rõ'}</p>
                  <p>Giấy phép: {farm.businessLicenseNo || 'Chưa có'}</p>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Ghi chú review, bắt buộc khi từ chối"
                    value={draft.reviewComment || ''}
                    onChange={(e) => patchReviewDraft(farm.farmId, 'reviewComment', e.target.value)}
                  />
                  <div className="action-row-wrap">
                    <Button variant="secondary" onClick={() => handleReviewFarm(farm.farmId, 'APPROVED')} disabled={saving}>Duyệt</Button>
                    <Button onClick={() => handleReviewFarm(farm.farmId, 'REJECTED')} disabled={saving}>Từ chối</Button>
                    <Button variant="secondary" onClick={() => setSelectedFarmId(farm.farmId)}>Mở chi tiết</Button>
                  </div>
                </div>
              )
            })}
          </div>
        </article>

        <article className="glass-card admin-panel-card admin-detail-drawer">
          <div className="panel-header-row">
            <div>
              <p className="eyebrow">Farm detail drawer</p>
              <h3>Lịch sử review và chỉnh hồ sơ</h3>
            </div>
          </div>
          <select className="form-input" value={selectedFarmId || ''} onChange={(e) => setSelectedFarmId(Number(e.target.value))}>
            <option value="">Chọn farm để quản lý chi tiết</option>
            {farms.map((farm) => (
              <option key={farm.farmId} value={farm.farmId}>{farm.farmName} - {farm.approvalStatus}</option>
            ))}
          </select>
          {farmDetail ? (
            <>
              <div className="farm-review-history top-gap">
                <div className="business-card business-card-stack detail-card subtle-card">
                  <div className="detail-topline">
                    <strong>{farmDetail.farmName}</strong>
                    <span className={`status-pill status-${(farmDetail.approvalStatus || '').toLowerCase()}`}>{farmDetail.approvalStatus}</span>
                  </div>
                  <p>Reviewer: {farmDetail.reviewedByFullName || 'Chưa review'}</p>
                  <p>Reviewed at: {formatDate(farmDetail.reviewedAt)}</p>
                  <p>Review note: {farmDetail.reviewComment || 'Chưa có ghi chú'}</p>
                  <p>Certification: {farmDetail.certificationStatus || 'PENDING'}</p>
                </div>
              </div>
              <form className="form-grid top-gap" onSubmit={handleSaveFarmDetail}>
                <input className="form-input" placeholder="Tên farm" value={farmEdit.farmName} onChange={(e) => setFarmEdit((prev) => ({ ...prev, farmName: e.target.value }))} />
                <input className="form-input" placeholder="Loại farm" value={farmEdit.farmType} onChange={(e) => setFarmEdit((prev) => ({ ...prev, farmType: e.target.value }))} />
                <input className="form-input" placeholder="Business license" value={farmEdit.businessLicenseNo} onChange={(e) => setFarmEdit((prev) => ({ ...prev, businessLicenseNo: e.target.value }))} />
                <input className="form-input" placeholder="Địa chỉ" value={farmEdit.address} onChange={(e) => setFarmEdit((prev) => ({ ...prev, address: e.target.value }))} />
                <input className="form-input" placeholder="Tỉnh/Thành" value={farmEdit.province} onChange={(e) => setFarmEdit((prev) => ({ ...prev, province: e.target.value }))} />
                <input className="form-input" placeholder="Tổng diện tích" value={farmEdit.totalArea} onChange={(e) => setFarmEdit((prev) => ({ ...prev, totalArea: e.target.value }))} />
                <input className="form-input" placeholder="Người liên hệ" value={farmEdit.contactPerson} onChange={(e) => setFarmEdit((prev) => ({ ...prev, contactPerson: e.target.value }))} />
                <textarea className="form-input" rows={4} placeholder="Mô tả farm" value={farmEdit.description} onChange={(e) => setFarmEdit((prev) => ({ ...prev, description: e.target.value }))} />
                <Button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu chi tiết farm'}</Button>
              </form>
            </>
          ) : <p className="top-gap">Chọn một farm để mở detail drawer.</p>}
        </article>
      </div>

      <div className="glass-card top-gap admin-panel-card">
        <div className="panel-header-row">
          <div>
            <p className="eyebrow">Marketplace hardening</p>
            <h3>Cross-flow governance snapshot</h3>
            <p>Siết consistency giữa listing, approval và traceability để admin nhìn ra các điểm hở giao dịch nhanh hơn.</p>
          </div>
        </div>
        <div className="transaction-kpi-grid">
          <div className="transaction-kpi-card">
            <strong>{products.filter((item) => item.status === 'ACTIVE').length}</strong>
            <p>Product ACTIVE</p>
          </div>
          <div className="transaction-kpi-card">
            <strong>{farms.filter((item) => item.approvalStatus === 'APPROVED').length}</strong>
            <p>Farm APPROVED</p>
          </div>
          <div className="transaction-kpi-card">
            <strong>{farms.filter((item) => item.approvalStatus !== 'APPROVED').length}</strong>
            <p>Farm chưa APPROVED</p>
          </div>
          <div className="transaction-kpi-card">
            <strong>{categories.filter((item) => item.status === 'ACTIVE').length}</strong>
            <p>Category ACTIVE</p>
          </div>
        </div>
        <div className="transaction-audit-grid top-gap">
          <div className="transaction-issue-list">
            <div className="transaction-issue-card">
              <strong>Farm governance risk</strong>
              <p>{farms.filter((farm) => farm.approvalStatus === 'APPROVED' && !farm.certificationStatus).length} farm approved nhưng thiếu certification status rõ ràng.</p>
            </div>
            <div className="transaction-issue-card">
              <strong>Review visibility</strong>
              <p>{farms.filter((farm) => farm.approvalStatus === 'REJECTED' && !farm.reviewComment).length} farm bị reject nhưng chưa thấy note ở snapshot list.</p>
            </div>
          </div>
          <div className="transaction-issue-list">
            <div className="transaction-issue-card">
              <strong>Catalog readiness</strong>
              <p>{products.filter((product) => !product.categoryId).length} sản phẩm chưa gắn category, dễ gây lệch discovery ở marketplace.</p>
            </div>
            <div className="transaction-issue-card">
              <strong>Visibility consistency</strong>
              <p>{products.filter((product) => product.status !== 'ACTIVE').length} sản phẩm đang không ACTIVE, cần kiểm tra xem đã bị loại khỏi flow listing/buying đúng chưa.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="content-grid top-gap admin-control-grid admin-control-grid-wide">
        <article className="glass-card admin-panel-card admin-catalog-panel">
          <div className="panel-header-row">
            <div>
              <p className="eyebrow">Product governance</p>
              <h3>Quản lý sản phẩm sâu hơn</h3>
            </div>
            <Button variant="secondary" onClick={() => { setSelectedProductId(null); setProductForm(productFormInitial) }}>Tạo mới</Button>
          </div>
          <div className="catalog-editor-grid">
            <div className="catalog-list">
              {products.map((product) => (
                <button key={product.productId} type="button" className={`catalog-list-item ${Number(selectedProductId) === Number(product.productId) ? 'is-active' : ''}`} onClick={() => setSelectedProductId(product.productId)}>
                  <strong>{product.productName}</strong>
                  <span>{product.productCode}</span>
                  <small>{product.categoryName || 'Chưa phân loại'} • {product.status}</small>
                </button>
              ))}
            </div>
            <form className="form-grid" onSubmit={handleSaveProduct}>
              <input className="form-input" placeholder="Tên sản phẩm" value={productForm.productName} onChange={(e) => setProductForm((prev) => ({ ...prev, productName: e.target.value }))} />
              <input className="form-input" placeholder="Mã sản phẩm" value={productForm.productCode} onChange={(e) => setProductForm((prev) => ({ ...prev, productCode: e.target.value }))} />
              <textarea className="form-input" rows={4} placeholder="Mô tả" value={productForm.description} onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))} />
              <div className="grid-two">
                <input className="form-input" type="number" placeholder="Giá" value={productForm.price} onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))} />
                <input className="form-input" type="number" placeholder="Sort order" value={productForm.sortOrder} onChange={(e) => setProductForm((prev) => ({ ...prev, sortOrder: e.target.value }))} />
              </div>
              <div className="grid-two">
                <select className="form-input" value={productForm.status} onChange={(e) => setProductForm((prev) => ({ ...prev, status: e.target.value }))}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
                <select className="form-input" value={productForm.categoryId} onChange={(e) => setProductForm((prev) => ({ ...prev, categoryId: e.target.value }))}>
                  <option value="">Chọn category</option>
                  {categories.map((category) => <option key={category.categoryId} value={category.categoryId}>{category.categoryName}</option>)}
                </select>
              </div>
              <input className="form-input" placeholder="Image URL" value={productForm.imageUrl} onChange={(e) => setProductForm((prev) => ({ ...prev, imageUrl: e.target.value }))} />
              <div className="action-row-wrap">
                <Button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : productForm.productId ? 'Lưu sản phẩm' : 'Tạo sản phẩm'}</Button>
                <Button type="button" variant="secondary" onClick={handleDeleteSelectedProduct} disabled={saving || !productForm.productId}>Xoá</Button>
              </div>
            </form>
          </div>
        </article>

        <article className="glass-card admin-panel-card admin-catalog-panel">
          <div className="panel-header-row">
            <div>
              <p className="eyebrow">Category governance</p>
              <h3>Quản lý category sâu hơn</h3>
            </div>
            <Button variant="secondary" onClick={() => { setSelectedCategoryId(null); setCategoryForm(categoryFormInitial) }}>Tạo mới</Button>
          </div>
          <div className="catalog-editor-grid">
            <div className="catalog-list">
              {categories.map((category) => (
                <button key={category.categoryId} type="button" className={`catalog-list-item ${Number(selectedCategoryId) === Number(category.categoryId) ? 'is-active' : ''}`} onClick={() => setSelectedCategoryId(category.categoryId)}>
                  <strong>{category.icon ? `${category.icon} ` : ''}{category.categoryName}</strong>
                  <span>{category.slug || 'Không có slug'}</span>
                  <small>{category.status}</small>
                </button>
              ))}
            </div>
            <form className="form-grid" onSubmit={handleSaveCategory}>
              <input className="form-input" placeholder="Tên chuyên mục" value={categoryForm.categoryName} onChange={(e) => setCategoryForm((prev) => ({ ...prev, categoryName: e.target.value }))} />
              <input className="form-input" placeholder="Slug" value={categoryForm.slug} onChange={(e) => setCategoryForm((prev) => ({ ...prev, slug: e.target.value }))} />
              <div className="grid-two">
                <input className="form-input" placeholder="Icon/Emoji" value={categoryForm.icon} onChange={(e) => setCategoryForm((prev) => ({ ...prev, icon: e.target.value }))} />
                <input className="form-input" type="number" placeholder="Sort order" value={categoryForm.sortOrder} onChange={(e) => setCategoryForm((prev) => ({ ...prev, sortOrder: e.target.value }))} />
              </div>
              <select className="form-input" value={categoryForm.status} onChange={(e) => setCategoryForm((prev) => ({ ...prev, status: e.target.value }))}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
              <input className="form-input" placeholder="Image URL" value={categoryForm.imageUrl} onChange={(e) => setCategoryForm((prev) => ({ ...prev, imageUrl: e.target.value }))} />
              <div className="action-row-wrap">
                <Button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : categoryForm.categoryId ? 'Lưu chuyên mục' : 'Tạo chuyên mục'}</Button>
                <Button type="button" variant="secondary" onClick={handleDeleteSelectedCategory} disabled={saving || !categoryForm.categoryId}>Xoá</Button>
              </div>
            </form>
          </div>
        </article>
      </div>
    </section>
  )
}
