import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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

const adminWorkAreas = [
  {
    title: 'Tài khoản quản trị',
    description: 'Tạo, xem, chỉnh sửa, khóa hoặc xóa tài khoản admin. Phân quyền theo vai trò khi cần.',
    to: '/dashboard/admin/accounts',
    icon: 'admin_panel_settings',
    meta: 'RBAC',
  },
  {
    title: 'Đăng ký trang trại',
    description: 'Xem, phê duyệt hoặc từ chối hồ sơ trang trại mới trước khi cho tham gia nền tảng.',
    to: '/dashboard/admin/farms',
    icon: 'approval_delegation',
    meta: 'Approval',
  },
  {
    title: 'Hồ sơ trang trại',
    description: 'Quản lý chứng nhận, thông tin liên hệ, vị trí và trạng thái hoạt động của trang trại.',
    to: '/dashboard/admin/farms',
    icon: 'storefront',
    meta: 'Farm data',
  },
  {
    title: 'Sản phẩm nền tảng',
    description: 'Giám sát sản phẩm đăng ký, danh mục, mô tả và độ chính xác của dữ liệu hiển thị.',
    to: '/dashboard/admin/products',
    icon: 'inventory_2',
    meta: 'Catalog',
  },
  {
    title: 'Blockchain trace',
    description: 'Quản lý hợp đồng thông minh, giao dịch và dữ liệu truy xuất nguồn gốc trên VeChainThor.',
    to: '/dashboard/admin/blockchain',
    icon: 'account_tree',
    meta: 'Trace',
  },
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
    const pendingFarms = farms.filter((farm) => String(farm.approvalStatus || '').toUpperCase() !== 'APPROVED').length
    const approvedFarms = countByStatus(farms, 'approvalStatus', 'APPROVED')

    return {
      totalUsers: users.length,
      activeUsers,
      pendingFarms,
      approvedFarms,
      totalFarms: farms.length,
      totalRetailers: retailers.length,
      totalPackages: packages.length,
      totalProducts: products.length,
    }
  }, [users, farms, retailers, packages, products])

  const queueItems = [
    { label: 'Farm chờ duyệt', value: metrics.pendingFarms, to: '/dashboard/admin/farms' },
    { label: 'Tài khoản đang hoạt động', value: metrics.activeUsers, to: '/dashboard/admin/accounts' },
    { label: 'Sản phẩm cần giám sát', value: metrics.totalProducts, to: '/dashboard/admin/products' },
    { label: 'Đối tác bán lẻ', value: metrics.totalRetailers, to: '/dashboard/admin/retailers' },
  ]

  const systemSignals = [
    {
      label: 'Hồ sơ cần xử lý',
      value: metrics.pendingFarms,
      detail: metrics.pendingFarms > 0 ? 'Cần duyệt trước khi farm tham gia nền tảng' : 'Không có hồ sơ tồn',
      tone: metrics.pendingFarms > 0 ? 'warning' : 'ok',
      to: '/dashboard/admin/farms',
    },
    {
      label: 'Catalog đang giám sát',
      value: metrics.totalProducts,
      detail: 'Sản phẩm, danh mục, mô tả và dữ liệu hiển thị',
      tone: 'info',
      to: '/dashboard/admin/products',
    },
    {
      label: 'Blockchain trace',
      value: 'READY',
      detail: 'VeChainThor governance đã bật trong Docker local',
      tone: 'chain',
      to: '/dashboard/admin/blockchain',
    },
  ]

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
    <section className="page-section admin-page admin-control-page admin-simple-page">
      <header className="admin-simple-header">
        <div>
          <span className="admin-simple-kicker">Admin Web</span>
          <h1>Quản trị nền tảng</h1>
          <p>Trang này chỉ gom các nghiệp vụ quản trị chính: tài khoản, trang trại, sản phẩm và blockchain trace.</p>
        </div>
        <button className="button button-secondary" type="button" onClick={loadOverview} disabled={loading}>
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </header>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="admin-signal-band" aria-label="Tín hiệu vận hành">
        {systemSignals.map((item) => (
          <Link key={item.label} className={`admin-signal-card signal-${item.tone}`} to={item.to}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.detail}</small>
          </Link>
        ))}
      </div>

      <div className="admin-simple-stats" aria-label="Tổng quan quản trị">
        <article>
          <span>Người dùng</span>
          <strong>{metrics.totalUsers}</strong>
          <small>{metrics.activeUsers} đang hoạt động</small>
        </article>
        <article>
          <span>Trang trại</span>
          <strong>{metrics.totalFarms}</strong>
          <small>{metrics.pendingFarms} hồ sơ cần duyệt</small>
        </article>
        <article>
          <span>Sản phẩm</span>
          <strong>{metrics.totalProducts}</strong>
          <small>Đang được giám sát</small>
        </article>
        <article>
          <span>Đối tác</span>
          <strong>{metrics.totalRetailers}</strong>
          <small>{metrics.totalPackages} gói dịch vụ</small>
        </article>
      </div>

      <div className="admin-simple-layout">
        <main className="admin-simple-card admin-simple-work">
          <div className="admin-simple-card-head">
            <div>
              <h2>Nghiệp vụ quản trị</h2>
              <p>Đi theo đúng phạm vi của quản trị viên trong đề bài.</p>
            </div>
          </div>

          <div className="admin-simple-work-grid">
            {adminWorkAreas.map((area) => (
              <Link key={`${area.title}-${area.to}`} className="admin-simple-work-item" to={area.to}>
                <span className="material-symbols-outlined" aria-hidden="true">{area.icon}</span>
                <div>
                  <strong>{area.title}</strong>
                  <p>{area.description}</p>
                </div>
                <small>{area.meta}</small>
              </Link>
            ))}
          </div>
        </main>

        <aside className="admin-simple-card admin-simple-queue">
          <div className="admin-simple-card-head">
            <div>
              <h2>Cần chú ý</h2>
              <p>Số liệu ngắn, bấm để xử lý.</p>
            </div>
          </div>

          <div className="admin-simple-queue-list">
            {queueItems.map((item) => (
              <Link key={item.label} to={item.to}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </section>
  )
}
