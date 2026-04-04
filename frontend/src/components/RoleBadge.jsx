import { ROLE_LABELS } from '../utils/constants'

export function RoleBadge({ role }) {
  return <span className="role-badge">{ROLE_LABELS[role] || role}</span>
}
