import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { getDashboardPathForUser } from '../../utils/helpers'

export function PublicShell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)
<<<<<<< HEAD
=======
  const { user, logout } = useAuth()
  const dashboardPath = user ? getDashboardPathForUser(user) : '/dashboard'
  const displayName = user?.fullName || user?.name || user?.email || ''
>>>>>>> 435dc21896bb4f9cdfc25f3a8829c4fe20148ecd

  return (
    <div className="public-shell">
      <nav className="public-nav">
        <div className="public-nav-inner">
          <Link className="public-brand" to="/marketplace"><span className="material-symbols-outlined fill">eco</span>BICAP</Link>
          <div className="public-nav-links">
            <NavLink to="/marketplace">Chợ nông sản</NavLink>
            <NavLink to="/public/trace">Truy xuất</NavLink>
            <NavLink to="/announcements">Thông báo</NavLink>
            <NavLink to="/education">Kiến thức</NavLink>
          </div>
          <div className="public-actions">
<<<<<<< HEAD
            <Link className="public-login" to="/login">Đăng nhập</Link>
            <Link className="public-register" to="/register">Đăng ký</Link>
=======
            {user ? (
              <>
                <Link className="public-login" to={dashboardPath} title={displayName}>Quay lại workspace</Link>
                <button className="public-register" onClick={() => logout()}>Đăng xuất</button>
              </>
            ) : (
              <>
                <Link className="public-login" to="/login">Đăng nhập</Link>
                <Link className="public-register" to="/register">Đăng ký</Link>
              </>
            )}
>>>>>>> 435dc21896bb4f9cdfc25f3a8829c4fe20148ecd
            <button className="public-hamburger" onClick={() => setMenuOpen(true)} aria-label="Mở menu">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer overlay */}
      <div className={`mobile-drawer-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />
      <aside className={`mobile-drawer ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-header">
          <Link className="public-brand" to="/marketplace" onClick={() => setMenuOpen(false)}><span className="material-symbols-outlined fill">eco</span>BICAP</Link>
          <button className="public-hamburger" onClick={() => setMenuOpen(false)} aria-label="Đóng menu">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="mobile-drawer-links">
          <NavLink to="/marketplace" onClick={() => setMenuOpen(false)}><span className="material-symbols-outlined">storefront</span>Chợ nông sản</NavLink>
          <NavLink to="/public/trace" onClick={() => setMenuOpen(false)}><span className="material-symbols-outlined">qr_code_scanner</span>Truy xuất</NavLink>
          <NavLink to="/announcements" onClick={() => setMenuOpen(false)}><span className="material-symbols-outlined">campaign</span>Thông báo</NavLink>
          <NavLink to="/education" onClick={() => setMenuOpen(false)}><span className="material-symbols-outlined">school</span>Kiến thức</NavLink>
        </nav>
        <div className="mobile-drawer-footer">
<<<<<<< HEAD
          <Link className="public-login" to="/login" onClick={() => setMenuOpen(false)}>Đăng nhập</Link>
          <Link className="public-register" to="/register" onClick={() => setMenuOpen(false)}>Đăng ký</Link>
=======
          {user ? (
            <>
              <Link className="public-login" to={dashboardPath} onClick={() => setMenuOpen(false)}>Quay lại workspace</Link>
              <button className="public-register" onClick={() => { setMenuOpen(false); logout() }}>Đăng xuất</button>
            </>
          ) : (
            <>
              <Link className="public-login" to="/login" onClick={() => setMenuOpen(false)}>Đăng nhập</Link>
              <Link className="public-register" to="/register" onClick={() => setMenuOpen(false)}>Đăng ký</Link>
            </>
          )}
>>>>>>> 435dc21896bb4f9cdfc25f3a8829c4fe20148ecd
        </div>
      </aside>

      <div className="public-main">{children}</div>
      <footer className="public-footer">
        <div className="public-footer-grid">
          <div><strong>BICAP</strong><p>© 2026 BICAP. Nền tảng truy xuất nguồn gốc và chợ nông sản minh bạch.</p></div>
          <div><h4>Nền tảng</h4><Link to="/marketplace">Chợ nông sản</Link><Link to="/public/trace">Truy xuất nguồn gốc</Link><Link to="/announcements">Thông báo</Link><Link to="/education">Kiến thức</Link></div>
          <div><h4>Hỗ trợ</h4><a>Liên hệ</a><a>Chính sách bảo mật</a></div>
        </div>
      </footer>
    </div>
  )
}
