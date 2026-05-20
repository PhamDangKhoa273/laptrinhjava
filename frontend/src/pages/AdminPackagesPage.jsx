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
      setError(err?.response?.data?.message || err?.message || 'Không t?i được danh sách gói d?ch v?.')
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
          <h2>Qu?n l? gói d?ch v?</h2>
        </div>
        <div className="section-actions">
          <Button variant="secondary" onClick={loadPackages} disabled={loading}>{loading ? 'Đang t?i...' : 'Làm m?i'}</Button>
        </div>
      </div>

      <div className="status-grid admin-overview-grid">
        <article className="status-card"><span>T?ng gói</span><strong>{packages.length}</strong></article>
        <article className="status-card"><span>Gói active</span><strong>{metrics.active}</strong></article>
        <article className="status-card"><span>Gói inactive</span><strong>{metrics.inactive}</strong></article>
        <article className="status-card"><span>T?ng mùa v? h? tr?</span><strong>{metrics.totalSeasons}</strong></article>
        <article className="status-card"><span>T?ng tin đăng t?i đa</span><strong>{metrics.totalListings}</strong></article>
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
              placeholder="T?m tên/mã gói"
            />
            <select className="form-input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              {availableStatuses.map((status) => (
                <option key={status} value={status}>{status === 'ALL' ? 'T?t c? tr?ng thái' : status}</option>
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
            {!loading && filteredPackages.length === 0 ? <p className="muted-inline">Không có gói phù h?p.</p> : null}
          </div>
        </aside>

        <main className="glass-card admin-package-detail-card">
          {selectedPackage ? (
            <>
              <div className="admin-package-detail-head">
                <div>
                  <span className="feature-badge">Gói d?ch v?</span>
                  <h3>{selectedPackage.packageName || 'Gói chưa đặt tên'}</h3>
                  <p>M? gói: {selectedPackage.packageCode || `#${getPackageId(selectedPackage)}`}</p>
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
                <div><span>Th?i h?n s? d?ng</span><strong>{selectedPackage.durationDays || 0} ngày</strong></div>
                <div><span>S? mùa v? h? tr?</span><strong>{selectedPackage.maxSeasons || 0}</strong></div>
                <div><span>S? tin đăng t?i đa</span><strong>{selectedPackage.maxListings || 0}</strong></div>
                <div><span>Tr?ng thái</span><strong>{getPackageStatus(selectedPackage)}</strong></div>
                <div><span>M? định danh</span><strong>#{getPackageId(selectedPackage)}</strong></div>
                <div><span>Mô t?</span><strong>{selectedPackage.description || 'Chưa c?p nh?t'}</strong></div>
              </div>

              <div className="admin-package-checklist">
                <h3>Ki?m tra c?u h?nh gói</h3>
                <ul className="feature-list">
                  <li className={Number(selectedPackage.price || 0) >= 0 ? 'is-ok' : 'is-warning'}>Giá gói đã có giá tr? h?p l?.</li>
                  <li className={Number(selectedPackage.durationDays || 0) > 0 ? 'is-ok' : 'is-warning'}>
                    {Number(selectedPackage.durationDays || 0) > 0 ? 'Đã c?u h?nh th?i h?n s? d?ng.' : 'Chưa c?u h?nh th?i h?n s? d?ng.'}
                  </li>
                  <li className={Number(selectedPackage.maxListings || 0) > 0 ? 'is-ok' : 'is-warning'}>
                    {Number(selectedPackage.maxListings || 0) > 0 ? 'Đã c?u h?nh gi?i h?n tin đăng.' : 'Chưa c?u h?nh gi?i h?n tin đăng.'}
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <p className="muted-inline">Chưa có gói d?ch v? để hi?n th?.</p>
          )}
        </main>
      </div>
    </section>
  )
}
