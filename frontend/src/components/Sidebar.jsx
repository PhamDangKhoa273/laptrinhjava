import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'

function Icon({ name }) {
  const iconByName = {
    accounts: 'manage_accounts',
    adminAccounts: 'admin_panel_settings',
    farm: 'agriculture',
    retailer: 'storefront',
    packages: 'inventory_2',
    logistics: 'local_shipping',
    blockchain: 'deployed_code',
    products: 'category',
    adminProducts: 'inventory_2',
    content: 'article',
    control: 'dashboard',
    profile: 'account_circle',
    overview: 'space_dashboard',
    marketplace: 'storefront',
    trace: 'qr_code_scanner',
    orders: 'receipt_long',
    shipping: 'local_shipping',
    notifications: 'inbox',
    messages: 'campaign',
    reports: 'assignment_late',
    subscription: 'workspace_premium',
    seasons: 'psychiatry',
    exportQr: 'qr_code_2',
    contracts: 'contract',
    listing: 'add_business',
    listingReview: 'approval',
    farmOrders: 'shopping_bag',
    shipmentReports: 'fact_check',
    vehicles: 'directions_car',
    drivers: 'badge',
    completed: 'task_alt',
    support: 'support_agent',
    menu: 'menu',
  }
  return <span className="material-symbols-outlined" aria-hidden="true">{iconByName[name] || iconByName.menu}</span>
}

function guessIcon(to) {
  if (to.includes('/dashboard/retailer')) return 'overview'
  if (to.includes('/retailer/marketplace')) return 'marketplace'
  if (to.includes('/retailer/trace')) return 'trace'
  if (to.includes('/retailer/orders')) return 'orders'
  if (to.includes('/retailer/shipping')) return 'shipping'
  if (to.includes('/retailer/notifications')) return 'notifications'
  if (to.includes('/retailer/messages')) return 'messages'
  if (to.includes('/retailer/reports')) return 'reports'
  if (to.includes('/accounts')) return 'accounts'
  if (to.includes('/farms')) return 'farm'
  if (to.includes('/retailers')) return 'retailer'
  if (to.includes('/packages')) return 'packages'
  if (to.includes('/shipping/orders')) return 'orders'
  if (to.includes('/shipping/completed')) return 'completed'
  if (to.includes('/shipping/drivers')) return 'drivers'
  if (to.includes('/shipping/vehicles')) return 'vehicles'
  if (to.includes('/shipping/sendnotification')) return 'messages'
  if (to.includes('/shipping/reports')) return 'shipmentReports'
  if (to.includes('/shipping/profile')) return 'profile'
  if (to.includes('/logistics') || to.includes('/shipping')) return 'logistics'
  if (to.includes('/blockchain')) return 'blockchain'
  if (to.includes('/products') || to.includes('/marketplace')) return 'products'
  if (to.includes('/operations')) return 'listingReview'
  if (to.includes('/content')) return 'content'
  if (to.includes('/control-center') || to.includes('/operations-plus')) return 'control'
  if (to.includes('/profile')) return 'profile'
  if (to.includes('/farm/subscription')) return 'subscription'
  if (to.includes('/farm/seasons')) return 'seasons'
  if (to.includes('/farm/export-qr')) return 'exportQr'
  if (to.includes('/farm/marketplace')) return 'listing'
  if (to.includes('/farm/orders')) return 'farmOrders'
  if (to.includes('/farm/shipment-reports')) return 'shipmentReports'
  if (to.includes('/farm/shipping')) return 'shipping'
  if (to.includes('/farm/reports')) return 'reports'
  if (to.includes('/contracts')) return 'contracts'
  if (to.includes('/vehicles')) return 'vehicles'
  if (to.includes('/drivers')) return 'drivers'
  if (to.includes('/completed')) return 'completed'
  return 'menu'
}

export function Sidebar({ links, role }) {
  const [collapsed, setCollapsed] = React.useState(false)
  const location = useLocation()

  const subtitleByRole = {
    ADMIN: 'Không gian Quản trị',
    FARM: 'Không gian Nông trại',
    RETAILER: 'Không gian Nhà bán lẻ',
    SHIPPING_MANAGER: 'Không gian Vận chuyển',
    DRIVER: 'Ứng dụng Tài xế',
    GUEST: 'Không gian Khách',
  }
  const brandSubtitle = subtitleByRole[role] || 'Không gian BICAP'

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
        <div className="sidebar-brand" aria-label="Điều hướng không gian BICAP">
          <span className="sidebar-brand-mark">B</span>
          <span className="sidebar-brand-text">
            <span className="sidebar-brand-title">BICAP</span>
            <span className="sidebar-brand-subtitle">{brandSubtitle}</span>
          </span>
        </div>

        <button
          className="sidebar-collapse-floating"
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          title={collapsed ? 'Mở rộng' : 'Thu gọn'}
        >
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
                <span className="sidebar-link-icon"><Icon name={link.icon || guessIcon(link.to)} /></span>
                <span>
                  <span className="sidebar-link-text">{link.label}</span>
                  {link.description ? <span className="sidebar-link-desc">{link.description}</span> : null}
                </span>
              </NavLink>
            )
          })}
        </nav>

        <div className="sidebar-action-panel">
          <button type="button" className="sidebar-new-transaction">
            <span className="material-symbols-outlined" aria-hidden="true">support_agent</span>
            <span>Hỗ trợ</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
