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
          <p className="eyebrow">Dashboard overview</p>
          <h2>Frontend Phase 2 integration status</h2>
          <p>
            This screen summarizes authentication state, token storage, role-based routing, and the current connection-ready frontend scope for Member 3.
          </p>
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

      <div className="content-grid">
        <article className="glass-card">
          <h3>What is completed</h3>
          <ul className="feature-list">
            <li>Login, register, and profile flows are implemented.</li>
            <li>Client-side route protection is active.</li>
            <li>Redirect after login works by role.</li>
            <li>Backend validation and network errors are shown to users.</li>
            <li>Auth token persistence is ready through localStorage.</li>
          </ul>
        </article>

        <article className="glass-card">
          <h3>Demo flow</h3>
          <ul className="feature-list">
            <li>Register a new account.</li>
            <li>Login and verify redirect by role.</li>
            <li>Refresh the page and verify session persistence.</li>
            <li>Open profile and update user information.</li>
            <li>Logout and confirm protected routes are blocked.</li>
          </ul>
        </article>
      </div>
    </section>
  )
}
