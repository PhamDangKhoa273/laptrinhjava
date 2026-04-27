import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button.jsx'
import { getPackages } from '../services/adminService.js'

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.content)) return payload.content
  if (Array.isArray(payload?.packages)) return payload.packages
  return []
}

function getPackageId(item) {
  return item?.packageId || item?.id || item?.packageCode || 'N/A'
}

function getPackageStatus(item) {
  return item?.status || 'ACTIVE'
}

function formatCurrency(value) {
  const number = Number(value || 0)
  return `${number.toLocaleString('vi-VN')} đ`
}

function getPackageKeyword(item) {
  return [item?.packageName, item?.packageCode, item?.description, item?.status]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export function AdminPackagesPage() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedPackageId, setSelectedPackageId] = useState(null)

  async function loadPackages() {
    try {
      setLoading(true)
      setError('')
      const data = normalizeList(await getPackages())
      setPackages(data)
      if (!selectedPackageId && data.length > 0) setSelectedPackageId(getPackageId(data[0]))
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không tải được danh sách gói dịch vụ.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPackages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const availableStatuses = useMemo(() => {
    const values = packages.map(getPackageStatus).filter(Boolean)
    return ['ALL', ...Array.from(new Set(values))]
  }, [packages])

  const filteredPackages = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return packages.filter((item) => {
      const status = getPackageStatus(item)
      const matchesStatus = statusFilter === 'ALL' || status === statusFilter
      const matchesKeyword = !keyword || getPackageKeyword(item).includes(keyword)
      return matchesStatus && matchesKeyword
    })
  }, [packages, search, statusFilter])

  const selectedPackage = useMemo(
    () => packages.find((item) => String(getPackageId(item)) === String(selectedPackageId)) || filteredPackages[0] || null,
    [packages, filteredPackages, selectedPackageId],
  )

  const metrics = useMemo(() => {
    const active = packages.filter((item) => String(getPackageStatus(item)).toUpperCase() === 'ACTIVE').length
    const inactive = packages.length - active
    const totalSeasons = packages.reduce((sum, item) => sum + Number(item.maxSeasons || 0), 0)
    const totalListings = packages.reduce((sum, item) => sum + Number(item.maxListings || 0), 0)
    return { active, inactive, totalSeasons, totalListings }
  }, [packages])

  return (
    <section className="page-section admin-page admin-packages-page">
      <div className="section-heading">
        <div>
          <h2>Quản lý gói dịch vụ</h2>
        </div>
        <div className="section-actions">
          <Button variant="secondary" onClick={loadPackages} disabled={loading}>{loading ? 'Đang tải...' : 'Làm mới'}</Button>
        </div>
      </div>

      <div className="status-grid admin-overview-grid">
        <article className="status-card"><span>Tổng gói</span><strong>{packages.length}</strong></article>
        <article className="status-card"><span>Gói active</span><strong>{metrics.active}</strong></article>
        <article className="status-card"><span>Gói inactive</span><strong>{metrics.inactive}</strong></article>
        <article className="status-card"><span>Tổng mùa vụ hỗ trợ</span><strong>{metrics.totalSeasons}</strong></article>
        <article className="status-card"><span>Tổng tin đăng tối đa</span><strong>{metrics.totalListings}</strong></article>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="admin-package-workspace">
        <aside className="glass-card admin-package-list-card">
          <h3>Danh sách gói</h3>
          <div className="admin-filters compact-filters">
            <input
              className="form-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm tên/mã gói"
            />
            <select className="form-input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              {availableStatuses.map((status) => (
                <option key={status} value={status}>{status === 'ALL' ? 'Tất cả trạng thái' : status}</option>
              ))}
            </select>
          </div>

          <div className="admin-package-list">
            {filteredPackages.map((item) => {
              const id = getPackageId(item)
              const isSelected = String(id) === String(getPackageId(selectedPackage))
              return (
                <button
                  key={id}
                  type="button"
                  className={`admin-user-item admin-package-list-item ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => setSelectedPackageId(id)}
                >
                  <div className="admin-user-item-main">
                    <strong className="admin-user-name">{item.packageName || 'Gói chưa đặt tên'}</strong>
                    <span className="admin-user-email">{item.packageCode || `#${id}`}</span>
                  </div>
                  <div className="admin-user-item-meta">
                    <div className="admin-user-item-meta-left">
                      <span className={`status-pill status-${String(getPackageStatus(item)).toLowerCase()}`}>{getPackageStatus(item)}</span>
                    </div>
                    <span className="admin-user-id">{formatCurrency(item.price)}</span>
                  </div>
                </button>
              )
            })}
            {!loading && filteredPackages.length === 0 ? <p className="muted-inline">Không có gói phù hợp.</p> : null}
          </div>
        </aside>

        <main className="glass-card admin-package-detail-card">
          {selectedPackage ? (
            <>
              <div className="admin-package-detail-head">
                <div>
                  <span className="feature-badge">Gói dịch vụ</span>
                  <h3>{selectedPackage.packageName || 'Gói chưa đặt tên'}</h3>
                  <p>Mã gói: {selectedPackage.packageCode || `#${getPackageId(selectedPackage)}`}</p>
                </div>
                <span className={`status-pill status-${String(getPackageStatus(selectedPackage)).toLowerCase()}`}>
                  {getPackageStatus(selectedPackage)}
                </span>
              </div>

              <div className="admin-package-price-panel">
                <span>Giá gói</span>
                <strong>{formatCurrency(selectedPackage.price)}</strong>
              </div>

              <div className="admin-package-info-grid">
                <div><span>Thời hạn sử dụng</span><strong>{selectedPackage.durationDays || 0} ngày</strong></div>
                <div><span>Số mùa vụ hỗ trợ</span><strong>{selectedPackage.maxSeasons || 0}</strong></div>
                <div><span>Số tin đăng tối đa</span><strong>{selectedPackage.maxListings || 0}</strong></div>
                <div><span>Trạng thái</span><strong>{getPackageStatus(selectedPackage)}</strong></div>
                <div><span>Mã định danh</span><strong>#{getPackageId(selectedPackage)}</strong></div>
                <div><span>Mô tả</span><strong>{selectedPackage.description || 'Chưa cập nhật'}</strong></div>
              </div>

              <div className="admin-package-checklist">
                <h3>Kiểm tra cấu hình gói</h3>
                <ul className="feature-list">
                  <li className={Number(selectedPackage.price || 0) >= 0 ? 'is-ok' : 'is-warning'}>Giá gói đã có giá trị hợp lệ.</li>
                  <li className={Number(selectedPackage.durationDays || 0) > 0 ? 'is-ok' : 'is-warning'}>
                    {Number(selectedPackage.durationDays || 0) > 0 ? 'Đã cấu hình thời hạn sử dụng.' : 'Chưa cấu hình thời hạn sử dụng.'}
                  </li>
                  <li className={Number(selectedPackage.maxListings || 0) > 0 ? 'is-ok' : 'is-warning'}>
                    {Number(selectedPackage.maxListings || 0) > 0 ? 'Đã cấu hình giới hạn tin đăng.' : 'Chưa cấu hình giới hạn tin đăng.'}
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <p className="muted-inline">Chưa có gói dịch vụ để hiển thị.</p>
          )}
        </main>
      </div>
    </section>
  )
}
