import { NavLink, Link } from 'react-router-dom'

export function PublicShell({ children }) {
  return (
    <div className="public-shell">
      <nav className="public-nav">
        <div className="public-nav-inner">
          <Link className="public-brand" to="/marketplace"><span className="material-symbols-outlined fill">eco</span>BICAP</Link>
          <div className="public-nav-links">
            <NavLink to="/marketplace">Chợ nông sản</NavLink>
            <NavLink to="/public/trace">Truy xuất</NavLink>
            <NavLink to="/announcements">Thông báo</NavLink>
          </div>
          <div className="public-actions">
            <Link className="public-login" to="/login">Đăng nhập</Link>
            <Link className="public-register" to="/register">Đăng ký</Link>
          </div>
        </div>
      </nav>
      <div className="public-main">{children}</div>
      <footer className="public-footer">
        <div className="public-footer-grid">
          <div><strong>BICAP</strong><p>© 2026 BICAP. Nền tảng truy xuất nguồn gốc và chợ nông sản minh bạch.</p></div>
          <div><h4>Nền tảng</h4><Link to="/marketplace">Chợ nông sản</Link><Link to="/public/trace">Truy xuất nguồn gốc</Link><Link to="/announcements">Thông báo</Link></div>
          <div><h4>Hỗ trợ</h4><a>Liên hệ</a><a>Chính sách bảo mật</a></div>
        </div>
      </footer>
    </div>
  )
}
