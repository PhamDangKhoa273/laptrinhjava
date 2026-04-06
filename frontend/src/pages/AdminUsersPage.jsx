import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button.jsx'
import { RoleBadge } from '../components/RoleBadge.jsx'
import { SelectField } from '../components/SelectField.jsx'
import { ROLES, ROLE_LABELS } from '../utils/constants'
import { getErrorMessage } from '../utils/helpers'
import { getAccessToken } from '../utils/storage'

const API_BASE = 'http://localhost:8080'

const roleOptions = [
  { value: '', label: 'Select role to assign' },
  ...Object.values(ROLES).map((role) => ({ value: role, label: ROLE_LABELS[role] || role })),
]

export function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [assigningRoleFor, setAssigningRoleFor] = useState(null)
  const [selectedRoles, setSelectedRoles] = useState({})

  useEffect(() => {
    loadUsers()
  }, [])

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => Number(a.userId) - Number(b.userId)),
    [users],
  )

  function getAuthHeaders() {
    const token = getAccessToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async function loadUsers() {
    try {
      setLoading(true)
      setError('')
      const response = await fetch(`${API_BASE}/api/users`, {
        credentials: 'include',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to load users')
      }

      const data = await response.json()
      const loadedUsers = data.data || []
      setUsers(loadedUsers)
      setSelectedRoles((prev) => {
        const next = { ...prev }
        loadedUsers.forEach((user) => {
          next[user.userId] = prev[user.userId] || ''
        })
        return next
      })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleUserStatusChange(userId, newStatus) {
    try {
      setError('')
      setSuccess('')
      const response = await fetch(`${API_BASE}/api/users/${userId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update user status')
      }

      setSuccess('User status updated successfully')
      await loadUsers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function handleAssignRole(userId) {
    const roleName = selectedRoles[userId]

    if (!roleName) {
      setError('Please select a role before assigning')
      return
    }

    try {
      setAssigningRoleFor(userId)
      setError('')
      setSuccess('')
      const response = await fetch(`${API_BASE}/api/users/${userId}/roles`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ roleName }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.message || 'Failed to assign role')
      }

      setSuccess(`Assigned role ${ROLE_LABELS[roleName] || roleName} successfully`)
      setSelectedRoles((prev) => ({ ...prev, [userId]: '' }))
      await loadUsers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setAssigningRoleFor(null)
    }
  }

  function formatDate(dateString) {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="mt-2 text-gray-600">Manage all users, assign roles, and update their status.</p>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>}
      {success && <div className="rounded-lg bg-green-50 p-4 text-green-700">{success}</div>}

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Full Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedUsers.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              sortedUsers.map((user) => (
                <tr key={user.userId} className="hover:bg-gray-50 align-top">
                  <td className="px-6 py-4 text-sm text-gray-900">{user.userId}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{user.fullName}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{user.phone || '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    {user.roles && user.roles.length > 0 ? (
                      <div className="flex gap-1 flex-wrap">
                        {user.roles.map((role) => (
                          <RoleBadge key={role} role={role} />
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">No roles</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-4 text-sm space-y-3 min-w-[240px]">
                    <div className="flex flex-wrap gap-2">
                      {user.status === 'ACTIVE' && (
                        <Button onClick={() => handleUserStatusChange(user.userId, 'INACTIVE')} variant="danger">
                          Deactivate
                        </Button>
                      )}
                      {user.status === 'INACTIVE' && (
                        <Button onClick={() => handleUserStatusChange(user.userId, 'ACTIVE')} variant="success">
                          Activate
                        </Button>
                      )}
                    </div>

                    <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Assign role</div>
                      <div className="space-y-2">
                        <SelectField
                          label="Role"
                          name={`role-${user.userId}`}
                          value={selectedRoles[user.userId] || ''}
                          onChange={(event) =>
                            setSelectedRoles((prev) => ({
                              ...prev,
                              [user.userId]: event.target.value,
                            }))
                          }
                          options={roleOptions}
                        />
                        <Button
                          onClick={() => handleAssignRole(user.userId)}
                          disabled={assigningRoleFor === user.userId}
                        >
                          {assigningRoleFor === user.userId ? 'Assigning...' : 'Assign role'}
                        </Button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
