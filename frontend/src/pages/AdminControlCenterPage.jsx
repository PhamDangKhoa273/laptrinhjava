import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RoleCoveragePanel } from '../components/RoleCoveragePanel.jsx'
import { StatusCard } from '../components/StatusCard.jsx'
import { getFarms, getPackages, getProducts, getRetailers, getUsers } from '../services/adminService.js'
import { getErrorMessage } from '../utils/helpers.js'
import '../admin-control.css'
import '../transaction-hardening.css'

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.content)) return payload.content
  if (Array.isArray(payload?.users)) return payload.users
  return []
}

function countByStatus(items, statusKey, expectedStatus) {
  return items.filter((item) => String(item?.[statusKey] || '').toUpperCase() === expectedStatus).length
}

const quickModules = [
  {
    title: 'Tài khoản & phân quyền',
    description: 'Khóa/mở tài khoản, thay vai trò và phân quyền người dùng.',
    to: '/dashboard/admin/accounts',
    badge: 'RBAC',
  },
  {
    title: 'Duyệt Farm',
    description: 'Duyệt, từ chối và kiểm tra hồ sơ/giấy phép farm trước khi tham gia chuỗi.',
    to: '/dashboard/admin/farms',
    badge: 'Approval',
  },
  {
    title: 'Retailer',
    description: 'Theo dõi nhà bán lẻ, hồ sơ kinh doanh và trạng thái hoạt động.',
    to: '/dashboard/admin/retailers',
    badge: 'Partner',
  },
  {
    title: 'Sản phẩm & lô SX',
    description: 'Quản lý sản phẩm, chuyên mục và điểm vào cho batch/process trace.',
    to: '/dashboard/admin/products',
    badge: 'Catalog',
  },
  {
    title: 'Gói dịch vụ',
    description: 'Quản lý package, subscription và payment workflow cho Farm.',
    to: '/dashboard/admin/packages',
    badge: 'Package',
  },
  {
    title: 'Logistics',
    description: 'Giám sát shipment, tài xế, phương tiện và sự cố giao nhận.',
    to: '/dashboard/admin/logistics',
    badge: 'Shipment',
  },
  {
    title: 'Blockchain Trace',
    description: 'Theo dõi contract, transaction, QR verification và trace integrity.',
    to: '/dashboard/admin/blockchain',
    badge: 'Chain',
  },
  {
    title: 'Nội dung website',
    description: 'Quản lý thông báo, bài viết, giáo dục và giao diện public site.',
    to: '/dashboard/admin/content',
    badge: 'CMS',
  },
]

const adminCoverageItems = [
  { title: 'Tài khoản hệ thống', description: 'Admin, Farm, Retailer, Shipping Manager, Driver user accounts và role/status.', href: '/dashboard/admin/accounts' },
  { title: 'Duyệt Farm', description: 'Kiểm tra giấy phép, chứng nhận, trạng thái approval và năng lực tham gia chuỗi.', href: '/dashboard/admin/farms' },
  { title: 'Quản lý Retailer', description: 'Business license, trạng thái hoạt động, order/shipment/report liên quan retailer.', href: '/dashboard/admin/retailers' },
  { title: 'Gói dịch vụ', description: 'Package, subscription, payment, quyền đăng sản phẩm và hạn mức sử dụng.', href: '/dashboard/admin/packages' },
  { title: 'Sản phẩm / Batch / QR', description: 'Danh mục, sản phẩm, mùa vụ, batch, QR và dữ liệu truy xuất nguồn gốc.', href: '/dashboard/admin/products' },
  { title: 'Logistics', description: 'Shipment, driver, vehicle, status timeline, dispute và delivery proof.', href: '/dashboard/admin/logistics' },
  { title: 'Blockchain', description: 'Smart contract, transaction hash, proof verification và dữ liệu trace không sửa đổi.', href: '/dashboard/admin/blockchain' },
  { title: 'Nội dung & thông báo', description: 'Public announcement, content library, website appearance và education feed.', href: '/dashboard/admin/content' },
  { title: 'Analytics / Báo cáo', description: 'KPI vận hành, pending queue, report từ Farm/Retailer/Driver và audit trail.', href: '/dashboard/admin/analytics' },
]


export function AdminControlCenterPage() {
  const [users, setUsers] = useState([])
  const [farms, setFarms] = useState([])
  const [retailers, setRetailers] = useState([])
  const [packages, setPackages] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadOverview()
  }, [])

  const metrics = useMemo(() => {
    const activeUsers = countByStatus(users, 'status', 'ACTIVE')
    const inactiveUsers = countByStatus(users, 'status', 'INACTIVE')
    const pendingFarms = farms.filter((farm) => String(farm.approvalStatus || '').toUpperCase() !== 'APPROVED').length
    const approvedFarms = countByStatus(farms, 'approvalStatus', 'APPROVED')

    return {
      totalUsers: users.length,
      activeUsers,
      inactiveUsers,
      totalFarms: farms.length,
      pendingFarms,
      approvedFarms,
      totalRetailers: retailers.length,
      totalPackages: packages.length,
      totalProducts: products.length,
    }
  }, [users, farms, retailers, packages, products])

  async function loadOverview() {
    try {
      setLoading(true)
      setError('')
      const [usersData, farmsData, retailersData, packagesData, productsData] = await Promise.all([
        getUsers(),
        getFarms(),
        getRetailers(),
        getPackages(),
        getProducts(),
      ])

      setUsers(normalizeList(usersData))
      setFarms(normalizeList(farmsData))
      setRetailers(normalizeList(retailersData))
      setPackages(normalizeList(packagesData))
      setProducts(normalizeList(productsData))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page-section admin-page admin-control-page dashboard-command-page admin-live-command-page">
      <div className="command-hero admin-live-hero">
        <div>
          <div className="command-role-pill">
            <span aria-hidden="true" />
            BICAP ADMIN COMMAND CENTER
          </div>
          <h1>Welcome back, Admin!</h1>
          <p>Live operating cockpit for users, farms, retailers, catalog, logistics and traceability governance.</p>
        </div>
        <button className="command-primary-action admin-live-refresh" type="button" onClick={loadOverview} disabled={loading}>
          <span>{loading ? 'Đang đồng bộ...' : 'Refresh live data'}</span>
          <span className="material-symbols-outlined" aria-hidden="true">sync</span>
        </button>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="command-stats-grid admin-live-stats" aria-label="Admin live statistics">
        <article className="command-stat-card tone-blue">
          <div className="command-stat-topline">
            <span className="command-stat-icon material-symbols-outlined" aria-hidden="true">group</span>
            <span className="command-stat-badge">Accounts</span>
          </div>
          <p>Total Users</p>
          <strong>{metrics.totalUsers}</strong>
        </article>
        <article className="command-stat-card tone-green">
          <div className="command-stat-topline">
            <span className="command-stat-icon material-symbols-outlined" aria-hidden="true">verified_user</span>
            <span className="command-stat-badge">Active</span>
          </div>
          <p>Operational Accounts</p>
          <strong>{metrics.activeUsers}</strong>
        </article>
        <article className="command-stat-card tone-amber">
          <div className="command-stat-topline">
            <span className="command-stat-icon material-symbols-outlined" aria-hidden="true">pending_actions</span>
            <span className="command-stat-badge">Queue</span>
          </div>
          <p>Farm Review Queue</p>
          <strong>{metrics.pendingFarms}</strong>
        </article>
        <article className="command-stat-card tone-red">
          <div className="command-stat-topline">
            <span className="command-stat-icon material-symbols-outlined" aria-hidden="true">inventory_2</span>
            <span className="command-stat-badge">Catalog</span>
          </div>
          <p>Products Governed</p>
          <strong>{metrics.totalProducts}</strong>
        </article>
      </div>

      <div className="command-content-grid admin-live-grid">
        <aside className="command-side-stack" aria-label="Admin quick modules">
          <article className="command-panel admin-live-panel">
            <div className="command-panel-kicker">Mission shortcuts</div>
            <div className="command-shortcuts">
              {quickModules.slice(0, 5).map((module) => (
                <Link key={module.to} className="command-shortcut" to={module.to}>
                  <span className="material-symbols-outlined" aria-hidden="true">dashboard_customize</span>
                  <strong>{module.title}</strong>
                  <i className="material-symbols-outlined" aria-hidden="true">chevron_right</i>
                </Link>
              ))}
            </div>
          </article>

          <article className="command-health-card admin-live-health">
            <div className="health-content">
              <div className="health-badge">
                <span className="material-symbols-outlined" aria-hidden="true">admin_panel_settings</span>
                RBAC + Governance Online
              </div>
              <h2>BICAP Network Health</h2>
              <p>{metrics.totalFarms + metrics.totalRetailers} verified partners, {metrics.totalPackages} service packages and protected admin modules are active.</p>
              <div className="health-meter" aria-label="Admin system health">
                <span />
              </div>
            </div>
            <span className="health-watermark material-symbols-outlined" aria-hidden="true">hub</span>
          </article>
        </aside>

        <article className="command-activity-card admin-live-activity">
          <div className="command-activity-head">
            <h2>Admin Operations Feed</h2>
            <Link to="/dashboard/admin/analytics">Open analytics</Link>
          </div>

          <div className="command-timeline">
            <div className="command-event">
              <div className="command-event-rail" aria-hidden="true"><span className="tone-green" /><i /></div>
              <div className="command-event-body">
                <div className="command-event-title"><h3>Account governance synced</h3><time>Live</time></div>
                <p>{metrics.activeUsers} active users and {metrics.inactiveUsers} inactive/locked accounts detected across the platform.</p>
                <div className="command-event-chips"><span>Users: {metrics.totalUsers}</span><span>RBAC Ready</span></div>
              </div>
            </div>
            <div className="command-event">
              <div className="command-event-rail" aria-hidden="true"><span className="tone-blue" /><i /></div>
              <div className="command-event-body">
                <div className="command-event-title"><h3>Farm approval queue</h3><time>Now</time></div>
                <p>{metrics.pendingFarms} farm hồ sơ cần kiểm tra; {metrics.approvedFarms} farm đã đủ điều kiện tham gia chuỗi.</p>
                <div className="command-event-chips"><span>Approved: {metrics.approvedFarms}</span><span>Pending: {metrics.pendingFarms}</span></div>
              </div>
            </div>
            <div className="command-event">
              <div className="command-event-rail" aria-hidden="true"><span /><i /></div>
              <div className="command-event-body">
                <div className="command-event-title"><h3>Catalog & partner surface</h3><time>Stable</time></div>
                <p>{metrics.totalProducts} products, {metrics.totalRetailers} retailers and {metrics.totalPackages} service packages are visible to admin governance.</p>
                <div className="command-event-chips"><span>Products: {metrics.totalProducts}</span><span>Retailers: {metrics.totalRetailers}</span></div>
              </div>
            </div>
          </div>

          <div className="admin-live-module-grid">
            {quickModules.slice(5).map((module) => (
              <Link key={module.to} className="feature-card glass-card admin-control-action" to={module.to}>
                <span className="feature-badge">{module.badge}</span>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
              </Link>
            ))}
          </div>
        </article>
      </div>

      <RoleCoveragePanel
        eyebrow="Admin Web coverage"
        title="Đủ chức năng Admin theo đề BICAP"
        description="Admin có control center riêng cho user, farm, retailer, package, logistics, product/batch/QR, blockchain, content và analytics."
        items={adminCoverageItems}
      />
    </section>
  )
}
