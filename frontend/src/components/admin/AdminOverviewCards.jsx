import { StatusCard } from '../StatusCard.jsx'

export function AdminOverviewCards({ usersCount, activeUsers, adminUsers, pendingFarms }) {
  return (
    <div className="status-grid">
      <StatusCard label="T?ng người dùng" value={usersCount} tone="primary" />
      <StatusCard label="Đang ho?t động" value={activeUsers} tone="success" />
      <StatusCard label="Tài kho?n qu?n tr?" value={adminUsers} tone="warning" />
      <StatusCard label="Nông tr?i ch? duy?t" value={pendingFarms} tone="primary" />
    </div>
  )
}
