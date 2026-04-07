import { NavLink } from 'react-router-dom'

export function Sidebar({ links }) {
  return (
    <aside className="sidebar">
      <div>
        <p className="sidebar-title">Navigation</p>
        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <span>{link.label}</span>
              {link.description ? <small>{link.description}</small> : null}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  )
}
