import { NavLink } from 'react-router-dom'

export function Sidebar({ links }) {
  return (
<<<<<<< Updated upstream
    <aside className="sidebar">
      <div>
        <p className="sidebar-title">Navigation</p>
        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <span>{link.label}</span>
              {link.description ? <small>{link.description}</small> : null}
=======
    <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="sidebar-top">
        <div className="sidebar-brand" aria-label="BICAP workspace navigation">
          <span className="sidebar-brand-mark">B</span>
          <span className="sidebar-brand-text">
            <span className="sidebar-brand-title">BICAP Workspace</span>
            <span className="sidebar-brand-subtitle">Admin Ecosystem</span>
          </span>
        </div>

        <button className="sidebar-collapse-floating" type="button" onClick={() => setCollapsed((v) => !v)} aria-label={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'} title={collapsed ? 'Mở rộng' : 'Thu gọn'}>
          {collapsed ? '›' : '‹'}
        </button>

        <nav className="sidebar-nav" aria-label="Điều hướng dashboard">
          {links.map((link, i) => {
            if (link.section) return <div key={`sec-${i}`} className="sidebar-section-label">{link.label}</div>
            return (
            <NavLink
              key={`${link.to}-${link.label}`}
              to={link.to}
              onClick={() => handleLinkClick(link)}
              className={() => {
                const [targetPath, targetHash = ''] = link.to.split('#')
                const currentHash = location.hash.replace('#', '')
                const isExactActive = location.pathname === targetPath && currentHash === targetHash
                return `sidebar-link ${isExactActive ? 'active' : ''}`
              }}
            >
              <span className="sidebar-link-icon"><Icon name={guessIcon(link.to)} /></span>
              <span>
                <span className="sidebar-link-text">{link.label}</span>
                {link.description ? <span className="sidebar-link-desc">{link.description}</span> : null}
              </span>
>>>>>>> Stashed changes
            </NavLink>
          )})}
        </nav>
      </div>
    </aside>
  )
}
