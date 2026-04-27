import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button.jsx'
import { SelectField } from '../components/SelectField.jsx'
import { getUsers, replaceUserRole, updateUserStatus } from '../services/businessService'
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

  async function handleAssignRole(userId) {
    const roleName = selectedRoles[userId]
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
      setSuccess(`Đã chuyển vai trò chính sang ${ROLE_LABELS[roleName] || roleName} cho ${selectedUser?.fullName || 'người dùng'}`)
      setRoleActionMessage(`Hoàn tất: ${selectedUser?.fullName || 'Người dùng'} hiện chỉ giữ vai trò ${ROLE_LABELS[roleName] || roleName}.`)
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
          <Button variant="secondary" onClick={loadUsers} disabled={loading}>{loading ? 'Đang tải...' : 'Làm mới'}</Button>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <div className="admin-users-shell">
        <aside className="admin-users-list glass-card">
          <div className="admin-users-list-head">
            <h3>Danh sách tài khoản</h3>
            <span className="muted-inline">{filteredUsers.length} tài khoản</span>
          </div>

          <div className="admin-users-filters">
            <input
              className="form-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tên/email/sđt"
            />
            <select className="form-input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="BLOCKED">BLOCKED</option>
            </select>
          </div>

          <div className="admin-users-items">
            {filteredUsers.map((user) => (
              <div
                key={user.userId}
                role="button"
                tabIndex={0}
                className={`admin-user-item ${selectedUser?.userId === user.userId ? 'is-selected' : ''}`}
                onClick={() => setSelectedUserId(user.userId)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setSelectedUserId(user.userId)
                  }
                }}
              >
                <div className="admin-user-item-main">
                  <strong className="admin-user-name">{user.fullName}</strong>
                  <span className="admin-user-email">{user.email}</span>
                </div>
                <div className="admin-user-item-meta">
                  <div className="admin-user-item-meta-left">
                    <span className={`status-pill status-${String(user.status || '').toLowerCase()}`}>{user.status}</span>
                  </div>
                  <span className="admin-user-id">#{user.userId}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="admin-users-detail glass-card">
          <div className="admin-users-detail-head">
            <h3>Thiết lập tài khoản</h3>
            <p className="muted-inline">Chọn một tài khoản bên trái, cập nhật vai trò hoặc trạng thái.</p>
          </div>

          {selectedUser ? (
            <>

              <div className="admin-users-table-wrap">
                <table className="admin-table" style={{ width: '100%', tableLayout: 'fixed' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '18%' }}>ID</th>
                      <th style={{ width: '22%' }}>Họ tên</th>
                      <th style={{ width: '24%' }}>Email</th>
                      <th style={{ width: '16%' }}>Vai trò</th>
                      <th style={{ width: '10%' }}>Trạng thái</th>
                      <th style={{ width: '10%', textAlign: 'right' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.userId}>
                        <td>#{user.userId}</td>
                        <td>{user.fullName}</td>
                        <td>{user.email}</td>
                        <td>
                          <div className="role-chip-wrap">
                            {getUserRoles(user).map((role) => (
                              <span key={`${user.userId}-${role}`} className="role-chip">{ROLE_LABELS[role] || role}</span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className={`status-pill status-${String(user.status || '').toLowerCase()}`}>{user.status}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Button
                            variant="secondary"
                            onClick={() => handleUserStatusChange(user, getNextStatus(user.status))}
                            disabled={pendingUserId === user.userId}
                          >
                            {pendingUserId === user.userId ? 'Đang xử lý...' : user.status === 'ACTIVE' ? 'Khoá' : 'Mở'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="admin-users-actions">
                  <div className="admin-users-action-title">Gán vai trò</div>
                  <p className="muted-inline admin-users-action-hint">
                    Chọn tài khoản bên trái rồi chọn vai trò mới. Khi xác nhận, hệ thống sẽ thay thế vai trò hiện tại bằng vai trò mới để đúng nghiệp vụ một tài khoản - một vai trò vận hành chính.
                  </p>
                  {roleActionMessage ? <div className="alert alert-success compact-alert">{roleActionMessage}</div> : null}
                  {assignableRoleOptions.length <= 1 ? (
                    <div className="alert alert-info compact-alert">Tài khoản này đã có đầy đủ vai trò khả dụng.</div>
                  ) : null}
                  <div className="admin-users-action-row">
                    <SelectField
                      label="Vai trò"
                      name={`role-assign-${selectedUser.userId}`}
                      value={selectedAssignRole}
                      onChange={(event) => setSelectedRoles((prev) => ({ ...prev, [selectedUser.userId]: event.target.value }))}
                      options={assignableRoleOptions}
                      disabled={assignableRoleOptions.length <= 1}
                    />
                    <Button
                      onClick={() => handleAssignRole(selectedUser.userId)}
                      disabled={!canAssignSelectedRole || assigningRoleFor === selectedUser.userId}
                    >
                      {assigningRoleFor === selectedUser.userId ? 'Đang gán...' : 'Gán vai trò'}
                    </Button>
                  </div>

                </div>
              </div>
            </>
          ) : (
            <div className="muted-inline">Không có tài khoản phù hợp với bộ lọc hiện tại.</div>
          )}
        </main>
      </div>
    </section>
  )
}
