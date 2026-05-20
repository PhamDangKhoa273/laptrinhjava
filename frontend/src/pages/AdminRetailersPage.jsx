import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button.jsx'
import { getRetailers } from '../services/adminService.js'

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.content)) return payload.content
  if (Array.isArray(payload?.retailers)) return payload.retailers
  return []
}

function getRetailerId(retailer) {
  return retailer?.retailerId || retailer?.id || retailer?.userId || 'N/A'
}

function getRetailerStatus(retailer) {
  return retailer?.status || retailer?.approvalStatus || 'ACTIVE'
}

function getRetailerKeyword(retailer) {
  return [
    retailer?.retailerName,
    retailer?.businessName,
    retailer?.retailerCode,
    retailer?.businessLicenseNo,
    retailer?.address,
    retailer?.email,
    retailer?.phone,
  ].filter(Boolean).join(' ').toLowerCase()
}

export function AdminRetailersPage() {
  const [retailers, setRetailers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedRetailerId, setSelectedRetailerId] = useState(null)

  async function loadRetailers() {
    try {
      setLoading(true)
      setError('')
      const data = normalizeList(await getRetailers())
      setRetailers(data)
      if (!selectedRetailerId && data.length > 0) setSelectedRetailerId(getRetailerId(data[0]))
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không t?i được danh sách retailer.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRetailers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const availableStatuses = useMemo(() => {
    const values = retailers.map(getRetailerStatus).filter(Boolean)
    return ['ALL', ...Array.from(new Set(values))]
  }, [retailers])

  const filteredRetailers = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return retailers.filter((retailer) => {
      const status = getRetailerStatus(retailer)
      const matchesStatus = statusFilter === 'ALL' || status === statusFilter
      const matchesKeyword = !keyword || getRetailerKeyword(retailer).includes(keyword)
      return matchesStatus && matchesKeyword
    })
  }, [retailers, search, statusFilter])

  const selectedRetailer = useMemo(
    () => retailers.find((retailer) => String(getRetailerId(retailer)) === String(selectedRetailerId)) || filteredRetailers[0] || null,
    [retailers, filteredRetailers, selectedRetailerId],
  )

  const metrics = useMemo(() => {
    const active = retailers.filter((retailer) => String(getRetailerStatus(retailer)).toUpperCase() === 'ACTIVE').length
    const inactive = retailers.filter((retailer) => String(getRetailerStatus(retailer)).toUpperCase() !== 'ACTIVE').length
    const missingLicense = retailers.filter((retailer) => !retailer.businessLicenseNo).length
    const missingAddress = retailers.filter((retailer) => !retailer.address).length
    return { active, inactive, missingLicense, missingAddress }
  }, [retailers])

  return (
    <section className="page-section admin-page admin-retailers-page">
      <div className="section-heading">
        <div>
          <h2>Qu?n l? nhà bán l?</h2>
        </div>
        <div className="section-actions">
          <Button variant="secondary" onClick={loadRetailers} disabled={loading}>{loading ? 'Đang t?i...' : 'Làm m?i'}</Button>
        </div>
      </div>

      <div className="status-grid admin-overview-grid">
        <article className="status-card"><span>T?ng retailer</span><strong>{retailers.length}</strong></article>
        <article className="status-card"><span>Đang ho?t động</span><strong>{metrics.active}</strong></article>
        <article className="status-card"><span>Inactive / ch? x? l?</span><strong>{metrics.inactive}</strong></article>
        <article className="status-card"><span>Thi?u gi?y phép</span><strong>{metrics.missingLicense}</strong></article>
        <article className="status-card"><span>Thi?u địa ch?</span><strong>{metrics.missingAddress}</strong></article>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="admin-retailer-workspace">
        <aside className="glass-card admin-retailer-list-card">
          <h3>Danh sách retailer</h3>
          <div className="admin-filters compact-filters">
            <input
              className="form-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="T?m tên/mã/giấy phép/địa ch?"
            />
            <select className="form-input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              {availableStatuses.map((status) => (
                <option key={status} value={status}>{status === 'ALL' ? 'T?t c? tr?ng thái' : status}</option>
              ))}
            </select>
          </div>

          <div className="admin-retailer-list">
            {filteredRetailers.map((retailer) => {
              const id = getRetailerId(retailer)
              const isSelected = String(id) === String(getRetailerId(selectedRetailer))
              return (
                <button
                  key={id}
                  type="button"
                  className={`admin-user-item admin-retailer-list-item ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => setSelectedRetailerId(id)}
                >
                  <div className="admin-user-item-main">
                    <strong className="admin-user-name">{retailer.retailerName || retailer.businessName || 'Nhà bán l? chưa đặt tên'}</strong>
                    <span className="admin-user-email">{retailer.retailerCode || `#${id}`}</span>
                  </div>
                  <div className="admin-user-item-meta">
                    <div className="admin-user-item-meta-left">
                      <span className={`status-pill status-${String(getRetailerStatus(retailer)).toLowerCase()}`}>{getRetailerStatus(retailer)}</span>
                    </div>
                    <span className="admin-user-id">#{id}</span>
                  </div>
                </button>
              )
            })}
            {!loading && filteredRetailers.length === 0 ? <p className="muted-inline">Không có retailer phù h?p.</p> : null}
          </div>
        </aside>

        <main className="glass-card admin-retailer-detail-card">
          {selectedRetailer ? (
            <>
              <div className="admin-retailer-detail-head">
                <div>
                  <span className="feature-badge">H? sơ retailer</span>
                  <h3>{selectedRetailer.retailerName || selectedRetailer.businessName || 'Nhà bán l? chưa đặt tên'}</h3>
                  <p>M? nhà bán l?: {selectedRetailer.retailerCode || `#${getRetailerId(selectedRetailer)}`}</p>
                </div>
                <span className={`status-pill status-${String(getRetailerStatus(selectedRetailer)).toLowerCase()}`}>
                  {getRetailerStatus(selectedRetailer)}
                </span>
              </div>

              <div className="admin-retailer-info-grid">
                <div><span>Gi?y phép kinh doanh</span><strong>{selectedRetailer.businessLicenseNo || 'Chưa c?p nh?t'}</strong></div>
                <div><span>Địa ch? ho?t động</span><strong>{selectedRetailer.address || 'Chưa c?p nh?t'}</strong></div>
                <div><span>Email</span><strong>{selectedRetailer.email || 'Chưa c?p nh?t'}</strong></div>
                <div><span>S? điện tho?i</span><strong>{selectedRetailer.phone || 'Chưa c?p nh?t'}</strong></div>
                <div><span>M? định danh</span><strong>#{getRetailerId(selectedRetailer)}</strong></div>
                <div><span>Tài kho?n liên k?t</span><strong>{selectedRetailer.userId ? `#${selectedRetailer.userId}` : 'Chưa liên k?t'}</strong></div>
              </div>

              <div className="admin-retailer-checklist">
                <h3>Ki?m tra h? sơ</h3>
                <ul className="feature-list">
                  <li className={selectedRetailer.businessLicenseNo ? 'is-ok' : 'is-warning'}>
                    {selectedRetailer.businessLicenseNo ? 'Đã có gi?y phép kinh doanh.' : 'Chưa có gi?y phép kinh doanh.'}
                  </li>
                  <li className={selectedRetailer.address ? 'is-ok' : 'is-warning'}>
                    {selectedRetailer.address ? 'Đã có địa ch? ho?t động.' : 'Chưa có địa ch? ho?t động.'}
                  </li>
                  <li className={String(getRetailerStatus(selectedRetailer)).toUpperCase() === 'ACTIVE' ? 'is-ok' : 'is-warning'}>
                    {String(getRetailerStatus(selectedRetailer)).toUpperCase() === 'ACTIVE' ? 'Retailer đang ho?t động.' : 'Retailer chưa ? tr?ng thái ACTIVE.'}
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <p className="muted-inline">Chưa có retailer để hi?n th?.</p>
          )}
        </main>
      </div>
    </section>
  )
}
