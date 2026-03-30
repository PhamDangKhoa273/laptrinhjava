import { Link, Outlet, useLocation } from 'react-router-dom'
import { AnnouncementBanner } from '../components/AnnouncementBanner.jsx'

export function AuthLayout() {
  const location = useLocation()
  const isRegisterPage = location.pathname === '/register'

  return (
    <div className="auth-layout">
      <section className="auth-hero">
        <div className="auth-hero-content">
          <div className="hero-logo-wrap">
            <img className="uth-logo" src="/uth-logo.png" alt="University of Transport Ho Chi Minh City" />
          </div>

          <p className="eyebrow">University of Transport Ho Chi Minh City</p>
          <p className="eyebrow hero-kicker">BICAP · Blockchain integration in clean agricultural production</p>
          <h1>BICAP</h1>
          <div className="auth-hero-links">
            <Link className={!isRegisterPage ? 'is-active' : ''} to="/login">Login</Link>
            <Link className={isRegisterPage ? 'is-active' : ''} to="/register">Register</Link>
          </div>

        </div>
      </section>
      <section className="auth-panel">
        <Outlet />
      </section>
      <AnnouncementBanner />
    </div>
  )
}
