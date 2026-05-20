import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button.jsx'
import { SelectField } from '../components/SelectField.jsx'
import { getUsers, replaceUserRole, updateUserStatus } from '../services/businessService'
import { createAdminAccount, deleteUserAccount } from '../services/adminService.js'
import { ROLES, ROLE_LABELS } from '../utils/constants'
import { getErrorMessage } from '../utils/helpers'

const ALL_ROLE_OPTIONS = Object.values(ROLES).map((role) => ({ value: role, label: ROLE_LABELS[role] || role }))

function getUserRoles(user) {
  return Array.isArray(user?.roles) ? user.roles : []
}

function getAssignableRoleOptions(user) {
  const currentRoles = new Set(getUserRoles(user))
  return [
    { value: '', label: currentRoles.size ? 'Chọn vai trò mới để gán' : 'Chọn vai trò để gán' },
    ...ALL_ROLE_OPTIONS.filter((option) => !currentRoles.has(option.value)),
  ]
}

function getNextStatus(status) {
  return status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
}

export function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [selectedRoles, setSelectedRoles] = useState({})
  const [pendingUserId, setPendingUserId] = useState(null)
  const [assigningRoleFor, setAssigningRoleFor] = useState(null)
  const [roleActionMessage, setRoleActionMessage] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    initialRole: 'ADMIN',
  })
  const [creatingUser, setCreatingUser] = useState(false)
  const [deletingUserId, setDeletingUserId] = useState(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return [...users]
      .sort((a, b) => Number(a.userId) - Number(b.userId))
      .filter((user) => {
        const haystack = [user?.fullName, user?.email, user?.phone].filter(Boolean).join(' ').toLowerCase()
        const matchesKeyword = !keyword || haystack.includes(keyword)
        const matchesStatus = !statusFilter || user?.status === statusFilter
        return matchesKeyword && matchesStatus
      })
  }, [users, search, statusFilter])

  const selectedUser = useMemo(() => {
    if (!filteredUsers.length) return null
    return filteredUsers.find((user) => user.userId === selectedUserId) || filteredUsers[0]
  }, [filteredUsers, selectedUserId])

  async function loadUsers() {
    try {
      setLoading(true)
      setError('')
      const loadedUsers = await getUsers()
      setUsers(loadedUsers)
      setSelectedUserId((prev) => {
        if (loadedUsers.some((user) => user.userId === prev)) return prev
        return loadedUsers[0]?.userId ?? null
      })
      setSelectedRoles((prev) => {
        const next = { ...prev }
        loadedUsers.forEach((user) => {
          if (!(user.userId in next)) next[user.userId] = ''
        })
        return next
      })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleUserStatusChange(user, nextStatus) {
    try {
      setPendingUserId(user.userId)
      setError('')
      setSuccess('')
      await updateUserStatus(user.userId, nextStatus)
      await loadUsers()
      setSuccess('Cập nhật trạng thái thành công')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(getErrorMessage(err))
      await loadUsers()
    } finally {
      setPendingUserId(null)
    }
  }

  async function handleCreateUser(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!createForm.fullName.trim() || !createForm.email.trim() || !createForm.password) {
      setError('Vui lòng điền đầy đủ họ tên, email, mật khẩu.')
      return
    }
    if (createForm.password.length < 6) {
      setError('Mật khẩu phải ít nhất 6 ký tự.')
      return
    }
    setCreatingUser(true)
    try {
      const payload = {
        fullName: createForm.fullName.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        phone: createForm.phone.trim() || undefined,
        initialRole: createForm.initialRole || undefined,
      }
      await createAdminAccount(payload)
      setSuccess(`Đã tạo tài khoản ${payload.email} với vai trò ${ROLE_LABELS[createForm.initialRole] || createForm.initialRole}.`)
      setCreateForm({ fullName: '', email: '', password: '', phone: '', initialRole: 'ADMIN' })
      setShowCreateForm(false)
      await loadUsers()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tạo tài khoản.'))
    } finally {
      setCreatingUser(false)
    }
  }

  async function handleDeleteUser(user) {
    if (!user?.userId) return
    if (!window.confirm(`Xóa vĩnh viễn tài khoản ${user.email || `#${user.userId}`}? Hành động này không thể hoàn tác.`)) {
      return
    }
    setDeletingUserId(user.userId)
    setError('')
    setSuccess('')
    try {
      await deleteUserAccount(user.userId)
      setSuccess(`Đã xóa tài khoản ${user.email || `#${user.userId}`}.`)
      await loadUsers()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể xóa tài khoản. Tài khoản có thể có dữ liệu liên quan.'))
    } finally {
      setDeletingUserId(null)
    }
  }

  async function handleAssignRole(userId) {
    const roleName = selectedRoles[userId]
    const targetUser = users.find((user) => user.userId === userId)
    if (!roleName) {
      setError('Vui lòng chọn vai trò trước khi gán')
      return
    }

    try {
      setAssigningRoleFor(userId)
      setRoleActionMessage('')
      setSuccess('')
      await replaceUserRole(userId, roleName)
      await loadUsers()
      setSelectedRoles((prev) => ({ ...prev, [userId]: '' }))
      setSuccess(`Đã chuyển vai trò chính sang ${ROLE_LABELS[roleName] || roleName} cho ${targetUser?.fullName || 'người dùng'}`)
      setRoleActionMessage(`Hoàn tất: ${targetUser?.fullName || 'Người dùng'} hiện chỉ giữ vai trò ${ROLE_LABELS[roleName] || roleName}.`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(getErrorMessage(err))
      await loadUsers()
    } finally {
      setAssigningRoleFor(null)
    }
  }


  const assignableRoleOptions = getAssignableRoleOptions(selectedUser)
  const selectedAssignRole = selectedUser ? selectedRoles[selectedUser.userId] || '' : ''
  const canAssignSelectedRole = Boolean(selectedUser && selectedAssignRole && assignableRoleOptions.some((option) => option.value === selectedAssignRole))

  return (
    <section className="page-section admin-page admin-users-page">
      <div className="section-heading">
        <div>
          <h2>Quản lý tài khoản</h2>

        </div>
        <div className="section-actions">
          <Button onClick={() => { setShowCreateForm(true); setError('') }} disabled={loading}>+ Tạo tài khoản</Button>
          <Button variant="secondary" onClick={loadUsers} disabled={loading}>{loading ? 'Đang tải...' : 'Làm mới'}</Button>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <main className="glass-card admin-users-flat-card">
        <div className="admin-users-flat-toolbar">
          <div>
            <h3>Danh sách tài khoản</h3>
            <p className="muted-inline">{filteredUsers.length} tài khoản phù hợp</p>
          </div>
          <div className="admin-users-flat-filters">
            <input className="form-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên/email/sđt" />
            <select className="form-input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="BLOCKED">BLOCKED</option>
            </select>
          </div>
        </div>

        {roleActionMessage ? <div className="alert alert-success compact-alert">{roleActionMessage}</div> : null}

        <div className="admin-users-table-wrap">
          <table className="admin-table admin-users-flat-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Người dùng</th>
                <th>Email</th>
                <th>Vai trò hiện tại</th>
                <th>Trạng thái</th>
                <th>Gán vai trò</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const assignOptions = getAssignableRoleOptions(user)
                const selectedRole = selectedRoles[user.userId] || ''
                const canAssign = Boolean(selectedRole && assignOptions.some((option) => option.value === selectedRole))
                return (
                  <tr key={user.userId}>
                    <td>#{user.userId}</td>
                    <td><strong>{user.fullName}</strong><small>{user.phone || 'Chưa có số điện thoại'}</small></td>
                    <td>{user.email}</td>
                    <td>
                      <div className="role-chip-wrap">
                        {getUserRoles(user).map((role) => <span key={`${user.userId}-${role}`} className="role-chip">{ROLE_LABELS[role] || role}</span>)}
                      </div>
                    </td>
                    <td><span className={`status-pill status-${String(user.status || '').toLowerCase()}`}>{user.status}</span></td>
                    <td>
                      <div className="admin-role-inline">
                        <SelectField
                          label=""
                          name={`role-assign-${user.userId}`}
                          value={selectedRole}
                          onChange={(event) => setSelectedRoles((prev) => ({ ...prev, [user.userId]: event.target.value }))}
                          options={assignOptions}
                          disabled={assignOptions.length <= 1}
                        />
                        <Button onClick={() => handleAssignRole(user.userId)} disabled={!canAssign || assigningRoleFor === user.userId}>
                          {assigningRoleFor === user.userId ? 'Đang gán...' : 'Gán'}
                        </Button>
                      </div>
                    </td>
                    <td>
                      <div className="inline-actions">
                        <Button variant="secondary" onClick={() => handleUserStatusChange(user, getNextStatus(user.status))} disabled={pendingUserId === user.userId || deletingUserId === user.userId}>
                          {pendingUserId === user.userId ? 'Đang xử lý...' : user.status === 'ACTIVE' ? 'Khoá' : 'Mở'}
                        </Button>
                        <Button variant="danger" onClick={() => handleDeleteUser(user)} disabled={deletingUserId === user.userId || pendingUserId === user.userId} title="Xóa tài khoản (không thể hoàn tác)">
                          {deletingUserId === user.userId ? 'Đang xóa...' : 'Xóa'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredUsers.length === 0 ? <tr><td colSpan="7">Không có tài khoản phù hợp với bộ lọc hiện tại.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </main>

      {showCreateForm ? (
        <div className="admin-modal-backdrop" onClick={() => !creatingUser && setShowCreateForm(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3>Tạo tài khoản mới</h3>
              <button type="button" onClick={() => !creatingUser && setShowCreateForm(false)} aria-label="Đóng">×</button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="admin-modal-body">
                <p>Backend tự hash mật khẩu BCrypt và gán vai trò ban đầu. Bạn có thể thay đổi vai trò sau ở phần "Gán vai trò".</p>
                <label className="form-field">
                  <span className="form-label">Họ tên *</span>
                  <input
                    className="form-input"
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, fullName: e.target.value }))}
                    required
                    minLength={2}
                    maxLength={150}
                    autoFocus
                  />
                </label>
                <label className="form-field">
                  <span className="form-label">Email *</span>
                  <input
                    className="form-input"
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </label>
                <label className="form-field">
                  <span className="form-label">Mật khẩu * (ít nhất 6 ký tự)</span>
                  <input
                    className="form-input"
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
                    required
                    minLength={6}
                    maxLength={100}
                  />
                </label>
                <label className="form-field">
                  <span className="form-label">Số điện thoại</span>
                  <input
                    className="form-input"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="0xxxxxxxxx hoặc +84xxxxxxxxx"
                    pattern="^(0|\+84)[0-9]{9,10}$"
                  />
                </label>
                <label className="form-field">
                  <span className="form-label">Vai trò ban đầu</span>
                  <select
                    className="form-input"
                    value={createForm.initialRole}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, initialRole: e.target.value }))}
                  >
                    {Object.values(ROLES).map((role) => (
                      <option key={role} value={role}>{ROLE_LABELS[role] || role}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="admin-modal-foot">
                <Button type="button" variant="secondary" onClick={() => setShowCreateForm(false)} disabled={creatingUser}>
                  Hủy
                </Button>
                <Button type="submit" disabled={creatingUser}>
                  {creatingUser ? 'Đang tạo...' : 'Tạo tài khoản'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  )
}
