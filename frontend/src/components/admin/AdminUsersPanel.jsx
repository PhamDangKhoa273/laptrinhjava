import { Button } from '../Button.jsx'
import { ROLE_LABELS } from '../../utils/constants.js'

export function AdminUsersPanel({
  filteredUsers,
  selectedUser,
  selectedRole,
  onSelectedRoleChange,
  roles,
  onAssignRole,
  isAssigningRole,
  onToggleStatus,
  busyUserId,
  onDeleteUser,
  onCreateAdmin,
  onSelectUser,
  roleNamesOf,
}) {
  return (
    <>
      <article className="glass-card">
        <div className="admin-table-head">
          <div>
            <h3>Danh sách người dùng</h3>
            <p>Qu?n l? tài kho?n, vai tr? và tr?ng thái người dùng trên h? th?ng.</p>
          </div>
          <span>{filteredUsers.length} k?t qu?</span>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table" style={{ width: '100%', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ width: '25%', textAlign: 'left' }}>Người dùng</th>
                <th style={{ width: '25%', textAlign: 'left' }}>Email</th>
                <th style={{ width: '15%', textAlign: 'left' }}>S? điện tho?i</th>
                <th style={{ width: '15%', textAlign: 'left' }}>Vai tr?</th>
                <th style={{ width: '10%', textAlign: 'left' }}>Tr?ng thái</th>
                <th style={{ width: '10%', textAlign: 'right' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isSelected = selectedUser?.userId === user.userId
                const rolesOfUser = roleNamesOf(user)
                return (
                  <tr key={user.userId} className={isSelected ? 'is-selected' : ''} onClick={() => onSelectUser(user.userId)}>
                    <td><div className="table-user-cell" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}><strong>{user.fullName}</strong><span>#{user.userId}</span></div></td>
                    <td style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</td>
                    <td>{user.phone || 'Chưa c?p nh?t'}</td>
                    <td><div className="role-chip-wrap">{rolesOfUser.map((role) => <span key={`${user.userId}-${role}`} className="role-chip">{ROLE_LABELS[role] || role}</span>)}</div></td>
                    <td><span className={`status-pill status-${(user.status || '').toLowerCase()}`}>{user.status}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <Button variant="secondary" onClick={(event) => { event.stopPropagation(); onToggleStatus(user) }} disabled={busyUserId === user.userId}>
                        {busyUserId === user.userId ? '...' : user.status === 'ACTIVE' ? 'Khoá' : 'M?'}
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </article>

      <article className="glass-card admin-action-card">
        <h3>Thao tác qu?n tr? nhanh</h3>
        <p className="muted-inline">Ch?n m?t người dùng để gán vai tr? ho?c khoá / m? khoá tài kho?n.</p>
        {selectedUser ? (
          <div className="admin-selected-user">
            <strong>{selectedUser.fullName}</strong>
            <span>{selectedUser.email}</span>
            <span>Vai tr? hi?n có: {roleNamesOf(selectedUser).map((role) => ROLE_LABELS[role] || role).join(', ')}</span>
            <span>Tr?ng thái: {selectedUser.status}</span>
          </div>
        ) : <p>Chưa có người dùng nào được ch?n.</p>}

        <div className="inline-actions top-gap">
          <select className="form-input" value={selectedRole} onChange={(event) => onSelectedRoleChange(event.target.value)}>
            {roles.map((role) => (
              <option key={role} value={role}>{ROLE_LABELS[role] || role}</option>
            ))}
          </select>
          <Button onClick={onAssignRole} disabled={!selectedUser || isAssigningRole}>{isAssigningRole ? 'Đang gán...' : 'Gán vai tr?'}</Button>
        </div>

        {selectedUser ? (
          <div className="inline-actions top-gap">
            <Button variant="secondary" onClick={() => onToggleStatus(selectedUser)} disabled={busyUserId === selectedUser.userId}>
              {busyUserId === selectedUser.userId ? 'Đang c?p nh?t...' : selectedUser.status === 'ACTIVE' ? 'Khoá tài kho?n' : 'M? l?i tài kho?n'}
            </Button>
            <Button variant="secondary" onClick={() => onDeleteUser(selectedUser.userId)} disabled={busyUserId === selectedUser.userId}>Xoá</Button>
          </div>
        ) : null}
        <hr />
        <Button onClick={onCreateAdmin}>+ T?o Admin M?i</Button>
      </article>
    </>
  )
}
