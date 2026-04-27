import { StatusCard } from '../StatusCard.jsx'

export function AdminOverviewCards({ usersCount, activeUsers, adminUsers, pendingFarms }) {
  return (
    <div className="status-grid">
      <StatusCard label="Tổng người dùng" value={usersCount} tone="primary" />
      <StatusCard label="Đang hoạt động" value={activeUsers} tone="success" />
      <StatusCard label="Tài khoản quản trị" value={adminUsers} tone="warning" />
      <StatusCard label="Nông trại chờ duyệt" value={pendingFarms} tone="primary" />
    </div>
  )
}
