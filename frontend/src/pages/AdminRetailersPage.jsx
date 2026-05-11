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
      setError(err?.response?.data?.message || err?.message || 'Không tải được danh sách retailer.')
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
          <h2>Quản lý nhà bán lẻ</h2>
        </div>
        <div className="section-actions">
          <Button variant="secondary" onClick={loadRetailers} disabled={loading}>{loading ? 'Đang tải...' : 'Làm mới'}</Button>
        </div>
      </div>

      <div className="status-grid admin-overview-grid">
        <article className="status-card"><span>Tổng retailer</span><strong>{retailers.length}</strong></article>
        <article className="status-card"><span>Đang hoạt động</span><strong>{metrics.active}</strong></article>
        <article className="status-card"><span>Inactive / chờ xử lý</span><strong>{metrics.inactive}</strong></article>
        <article className="status-card"><span>Thiếu giấy phép</span><strong>{metrics.missingLicense}</strong></article>
        <article className="status-card"><span>Thiếu địa chỉ</span><strong>{metrics.missingAddress}</strong></article>
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
              placeholder="Tìm tên/mã/giấy phép/địa chỉ"
            />
            <select className="form-input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              {availableStatuses.map((status) => (
                <option key={status} value={status}>{status === 'ALL' ? 'Tất cả trạng thái' : status}</option>
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
                    <strong className="admin-user-name">{retailer.retailerName || retailer.businessName || 'Nhà bán lẻ chưa đặt tên'}</strong>
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
            {!loading && filteredRetailers.length === 0 ? <p className="muted-inline">Không có retailer phù hợp.</p> : null}
          </div>
        </aside>

        <main className="glass-card admin-retailer-detail-card">
          {selectedRetailer ? (
            <>
              <div className="admin-retailer-detail-head">
                <div>
                  <span className="feature-badge">Hồ sơ retailer</span>
                  <h3>{selectedRetailer.retailerName || selectedRetailer.businessName || 'Nhà bán lẻ chưa đặt tên'}</h3>
                  <p>Mã nhà bán lẻ: {selectedRetailer.retailerCode || `#${getRetailerId(selectedRetailer)}`}</p>
                </div>
                <span className={`status-pill status-${String(getRetailerStatus(selectedRetailer)).toLowerCase()}`}>
                  {getRetailerStatus(selectedRetailer)}
                </span>
              </div>

              <div className="admin-retailer-info-grid">
                <div><span>Giấy phép kinh doanh</span><strong>{selectedRetailer.businessLicenseNo || 'Chưa cập nhật'}</strong></div>
                <div><span>Địa chỉ hoạt động</span><strong>{selectedRetailer.address || 'Chưa cập nhật'}</strong></div>
                <div><span>Email</span><strong>{selectedRetailer.email || 'Chưa cập nhật'}</strong></div>
                <div><span>Số điện thoại</span><strong>{selectedRetailer.phone || 'Chưa cập nhật'}</strong></div>
                <div><span>Mã định danh</span><strong>#{getRetailerId(selectedRetailer)}</strong></div>
                <div><span>Tài khoản liên kết</span><strong>{selectedRetailer.userId ? `#${selectedRetailer.userId}` : 'Chưa liên kết'}</strong></div>
              </div>

              <div className="admin-retailer-checklist">
                <h3>Kiểm tra hồ sơ</h3>
                <ul className="feature-list">
                  <li className={selectedRetailer.businessLicenseNo ? 'is-ok' : 'is-warning'}>
                    {selectedRetailer.businessLicenseNo ? 'Đã có giấy phép kinh doanh.' : 'Chưa có giấy phép kinh doanh.'}
                  </li>
                  <li className={selectedRetailer.address ? 'is-ok' : 'is-warning'}>
                    {selectedRetailer.address ? 'Đã có địa chỉ hoạt động.' : 'Chưa có địa chỉ hoạt động.'}
                  </li>
                  <li className={String(getRetailerStatus(selectedRetailer)).toUpperCase() === 'ACTIVE' ? 'is-ok' : 'is-warning'}>
                    {String(getRetailerStatus(selectedRetailer)).toUpperCase() === 'ACTIVE' ? 'Retailer đang hoạt động.' : 'Retailer chưa ở trạng thái ACTIVE.'}
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <p className="muted-inline">Chưa có retailer để hiển thị.</p>
          )}
        </main>
      </div>
    </section>
  )
}
