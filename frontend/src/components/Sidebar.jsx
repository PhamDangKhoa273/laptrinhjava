import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'

function Icon({ name }) {
  // Simple inline icons (no external deps)
  switch (name) {
    case 'accounts':
      return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M16 11c1.66 0 3-1.34 3-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3Zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V20h6v-3.5C23 14.17 18.33 13 16 13Z"/></svg>
    case 'farm':
      return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M12 3 3 8v13h6v-6h6v6h6V8l-9-5Zm0 3.2 5.8 3.22V19H17v-6H7v6h-.8V9.42L12 6.2Zm-2 4.8h4v2h-4v-2Z"/></svg>
    case 'retailer':
      return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M4 4h16l1 5v2a3 3 0 0 1-5.5 1.65A3 3 0 0 1 10 12.65 3 3 0 0 1 4.5 11 3 3 0 0 1 3 11V9l1-5Zm1 10h14v6H5v-6Zm3 2v2h8v-2H8Z"/></svg>
    case 'packages':
      return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M21 8.5 12 3 3 8.5v7L12 21l9-5.5v-7Zm-9-3.16 5.45 3.33L12 12 6.55 8.67 12 5.34ZM5 10.42l6 3.67v4.57l-6-3.67v-4.57Zm8 8.24v-4.57l6-3.67v4.57l-6 3.67Z"/></svg>
    case 'logistics':
      return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M3 6h11v8h2.2l2.1-3H21l2 3v4h-2a3 3 0 0 1-6 0H9a3 3 0 0 1-6 0H1V8c0-1.1.9-2 2-2Zm0 2v8h1.76A3 3 0 0 1 9 16h5V8H3Zm15.3 5-1.4 2H21l-.67-2h-2.03ZM6 17.5A1.5 1.5 0 1 0 6 20a1.5 1.5 0 0 0 0-3Zm12 0A1.5 1.5 0 1 0 18 20a1.5 1.5 0 0 0 0-3Z"/></svg>
    case 'blockchain':
      return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M12 2 4 6.5v9L12 20l8-4.5v-9L12 2Zm0 2.3 5.6 3.15L12 10.6 6.4 7.45 12 4.3ZM6 9.25l5 2.8v5.65l-5-2.8V9.25Zm7 8.45v-5.65l5-2.8v5.65l-5 2.8Z"/><path fill="currentColor" d="M3 19h4v2H3v-2Zm14 0h4v2h-4v-2ZM11 21h2v2h-2v-2Z"/></svg>
    case 'products':
      return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M12 2 1 7l11 5 9-4.09V17h2V7L12 2Zm-1 13.09L3.24 11 2 11.57V17l9 4 9-4v-5.43L18.76 11 11 15.09Z"/></svg>
    case 'content':
      return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M4 4h16v14H7l-3 3V4Zm3 4v2h10V8H7Zm0 4v2h7v-2H7Z"/></svg>
    case 'control':
      return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M3 13h8V3H3v10Zm2-8h4v6H5V5Zm8 16h8V11h-8v10Zm2-8h4v6h-4v-6ZM3 21h8v-6H3v6Zm2-4h4v2H5v-2Zm8-8h8V3h-8v6Zm2-4h4v2h-4V5Z"/></svg>
    case 'profile':
      return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5Zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5Z"/></svg>
    default:
      return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z"/></svg>
  }
}

function guessIcon(to) {
  if (to.includes('/accounts')) return 'accounts'
  if (to.includes('/farms')) return 'farm'
  if (to.includes('/retailers')) return 'retailer'
  if (to.includes('/packages')) return 'packages'
  if (to.includes('/logistics')) return 'logistics'
  if (to.includes('/blockchain')) return 'blockchain'
  if (to.includes('/products')) return 'products'
  if (to.includes('/content') || to.includes('/operations')) return 'content'
  if (to.includes('/control-center') || to.includes('/operations-plus')) return 'control'
  if (to.includes('/profile')) return 'profile'
  return 'menu'
}

export function Sidebar({ links }) {
  const [collapsed, setCollapsed] = React.useState(false)
  const location = useLocation()

  function scrollToHash(hash) {
    if (!hash) return
    window.setTimeout(() => {
      const target = document.getElementById(hash.replace('#', ''))
      if (!target) return
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      target.classList.add('section-focus-ring')
      window.setTimeout(() => target.classList.remove('section-focus-ring'), 1400)
    }, 80)
  }

  React.useEffect(() => {
    scrollToHash(location.hash)
  }, [location.pathname, location.hash])

  function handleLinkClick(link) {
    const [, hash] = link.to.split('#')
    if (hash) scrollToHash(`#${hash}`)
  }


  return (
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
          {links.map((link) => (
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
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-action-panel">
          <button type="button" className="sidebar-new-transaction">
            <span className="material-symbols-outlined" aria-hidden="true">support_agent</span>
            <span>Support</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
