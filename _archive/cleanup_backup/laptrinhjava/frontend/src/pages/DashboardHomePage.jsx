import { Link } from 'react-router-dom'
import { Button } from '../components/Button.jsx'
import { StatusCard } from '../components/StatusCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getPrimaryRole } from '../utils/helpers'
import { getAccessToken, getRefreshToken } from '../utils/storage'

export function DashboardHomePage() {
  const { user, getPostLoginPath } = useAuth()
  const role = getPrimaryRole(user)
  const rolePath = getPostLoginPath(user)

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <h2>Frontend Phase 2 integration status</h2>
        </div>
        <div className="section-actions">
          <Link to={rolePath}>
            <Button>Open my role dashboard</Button>
          </Link>
        </div>
      </div>

      <div className="status-grid">
        <StatusCard label="Authenticated user" value={user?.fullName || user?.name || 'Ready'} tone="success" />
        <StatusCard label="Current role" value={role} tone="primary" />
        <StatusCard label="Access token" value={getAccessToken() ? 'Stored' : 'Missing'} tone={getAccessToken() ? 'success' : 'warning'} />
        <StatusCard label="Refresh token" value={getRefreshToken() ? 'Stored' : 'Optional / missing'} tone={getRefreshToken() ? 'success' : 'warning'} />
      </div>

    </section>
  )
}
