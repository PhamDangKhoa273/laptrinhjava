import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="auth-card">
      <div className="card-header">
        <p className="eyebrow">404</p>
        <h2>Page not found</h2>
        <p>The page you requested does not exist in this frontend module.</p>
      </div>
      <Link className="text-link" to="/login">Back to login</Link>
    </div>
  )
}
