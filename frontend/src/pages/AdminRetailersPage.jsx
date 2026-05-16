import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button.jsx'
import { getRetailers, reviewRetailer } from '../services/adminService.js'

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
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedRetailerId, setSelectedRetailerId] = useState(null)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewing, setReviewing] = useState(false)

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
    const pending = retailers.filter((retailer) => ['PENDING', 'INACTIVE'].includes(String(getRetailerStatus(retailer)).toUpperCase())).length
    const rejected = retailers.filter((retailer) => String(getRetailerStatus(retailer)).toUpperCase() === 'REJECTED').length
    const missingLicense = retailers.filter((retailer) => !retailer.businessLicenseNo).length
    return { active, pending, rejected, missingLicense }
  }, [retailers])

  async function handleReview(approvalStatus) {
    if (!selectedRetailer) return
    setReviewing(true)
    setError('')
    setSuccess('')
    try {
      await reviewRetailer(getRetailerId(selectedRetailer), approvalStatus, reviewComment)
      setSuccess(`Đã ${approvalStatus === 'ACTIVE' || approvalStatus === 'APPROVED' ? 'phê duyệt' : 'từ chối'} retailer thành công.`)
      setReviewComment('')
      await loadRetailers()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể cập nhật trạng thái retailer.')
    } finally {
      setReviewing(false)
    }
  }

  return (
    <section className="page-section admin-page admin-retailers-page">
      <div className="section-heading">
        <div>
          <h2>Quản lý nhà bán lẻ</h2>
          <p>Phê duyệt, từ chối và quản lý hồ sơ nhà bán lẻ trên nền tảng.</p>
        </div>
        <div className="section-actions">
          <Button variant="secondary" onClick={loadRetailers} disabled={loading}>{loading ? 'Đang tải...' : 'Làm mới'}</Button>
        </div>
      </div>

      <div className="status-grid admin-overview-grid">
        <article className="status-card"><span>Tổng retailer</span><strong>{retailers.length}</strong></article>
        <article className="status-card"><span>Đang hoạt động</span><strong>{metrics.active}</strong></article>
        <article className="status-card"><span>Chờ duyệt / Inactive</span><strong>{metrics.pending}</strong></article>
        <article className="status-card"><span>Đã từ chối</span><strong>{metrics.rejected}</strong></article>
        <article className="status-card"><span>Thiếu giấy phép</span><strong>{metrics.missingLicense}</strong></article>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

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
              const status = getRetailerStatus(retailer)
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
                      <span className={`status-pill status-${String(status).toLowerCase()}`}>{status}</span>
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
                {selectedRetailer.userFullName ? <div><span>Chủ sở hữu</span><strong>{selectedRetailer.userFullName}</strong></div> : null}
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

              {/* ── Approval / Review Panel ── */}
              <div className="admin-review-panel glass-card" style={{ marginTop: '20px', padding: '20px' }}>
                <h3 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>rate_review</span>
                  Phê duyệt / Từ chối
                </h3>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#64748b' }}>
                    Ghi chú xét duyệt (tùy chọn)
                  </label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Nhập lý do phê duyệt hoặc từ chối..."
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <Button
                    variant="primary"
                    onClick={() => handleReview('ACTIVE')}
                    disabled={reviewing}
                    style={{ background: '#16a34a', borderColor: '#16a34a' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>
                    {reviewing ? 'Đang xử lý...' : 'Phê duyệt (ACTIVE)'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleReview('REJECTED')}
                    disabled={reviewing}
                    style={{ background: '#dc2626', borderColor: '#dc2626', color: '#fff' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>cancel</span>
                    {reviewing ? 'Đang xử lý...' : 'Từ chối (REJECTED)'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleReview('INACTIVE')}
                    disabled={reviewing}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>block</span>
                    {reviewing ? 'Đang xử lý...' : 'Vô hiệu hóa'}
                  </Button>
                </div>
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



