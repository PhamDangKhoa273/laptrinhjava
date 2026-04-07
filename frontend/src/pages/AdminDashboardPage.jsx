import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button.jsx'
import { StatusCard } from '../components/StatusCard.jsx'
import { assignRole, changeUserStatus, getFarms, getPackages, getRetailers, getUsers, reviewFarm, getProducts, createAdminAccount, deleteUserAccount, deploySmartContract } from '../services/adminService.js'
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [activeTab, setActiveTab] = useState(defaultTab)

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
      const [usersData, farmsData, retailersData, packagesData, productsData] = await Promise.all([
        getUsers(),
        getFarms(),
        getRetailers(),
        getPackages(),
        getProducts(),
      ])

      const nextUsers = normalizeList(usersData)
      setUsers(nextUsers)
      setFarms(normalizeList(farmsData))
      setRetailers(normalizeList(retailersData))
      setPackages(normalizeList(packagesData))
      setProducts(normalizeList(productsData))

      if (!selectedUserId && nextUsers.length > 0) {
        setSelectedUserId(nextUsers[0].userId)
      }
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
        <article className="glass-card">
          <div className="admin-table-head">
            <div>
              <h3>Danh sách sản phẩm nền tảng</h3>
              <p>Quản lý danh mục, thông tin mô tả và đảm bảo độ chính xác truy xuất nguồn gốc (QR).</p>
            </div>
            <span>{products.length} sản phẩm</span>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table" style={{ width: '100%', tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th style={{ width: '25%', textAlign: 'left' }}>Sản phẩm</th>
                  <th style={{ width: '20%', textAlign: 'left' }}>Phân loại</th>
                  <th style={{ width: '30%', textAlign: 'left' }}>Xuất xứ & Chứng nhận</th>
                  <th style={{ width: '15%', textAlign: 'left' }}>Dữ liệu IoT/QR</th>
                  <th style={{ width: '10%', textAlign: 'right' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="table-user-cell">
                        <strong>{item.name}</strong>
                        <span>{item.brand}</span>
                      </div>
                    </td>
                    <td>
                      <div className="table-user-cell">
                        <span>{item.category}</span>
                        <small>{item.subCategory}</small>
                      </div>
                    </td>
                    <td>
                      <div className="role-chip-wrap">
                        <span className="role-chip">{item.origin}</span>
                        {item.certifications.map(c => <span key={c} className="role-chip" style={{color: 'green', background: '#e0ffe0'}}>{c}</span>)}
                      </div>
                    </td>
                    <td>
                      <div className="table-user-cell" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <span>{item.totalScanCount} Lượt quét</span>
                        <small>Ref: {item.blockchainTxRef}</small>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="inline-actions" style={{ justifyContent: 'flex-end' }}>
                        <Button variant="secondary">Sửa</Button>
                        <Button variant="secondary">Xoá</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
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
