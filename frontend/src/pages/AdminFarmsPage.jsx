import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button.jsx'
import { getAllFarms, updateFarmApprovalStatus } from '../services/businessService'
import { getErrorMessage } from '../utils/helpers.js'

const APPROVAL_LABELS = {
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  PENDING: 'Chờ duyệt',
}

const CERTIFICATION_LABELS = {
  VALID: 'Hợp lệ',
  INVALID: 'Không hợp lệ',
  PENDING: 'Chờ kiểm tra',
}

function normalizeFarms(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.content)) return payload.content
  if (Array.isArray(payload?.farms)) return payload.farms
  return []
}

function statusClass(status) {
  return `status-pill status-${String(status || 'pending').toLowerCase()}`
}

function display(value, fallback = 'Chưa cập nhật') {
  return value || fallback
}

export function AdminFarmsPage() {
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [approvalFilter, setApprovalFilter] = useState('')
  const [selectedFarmId, setSelectedFarmId] = useState(null)
  const [reviewingFarmId, setReviewingFarmId] = useState(null)

  useEffect(() => {
    loadFarms()
  }, [])

  const filteredFarms = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return farms.filter((farm) => {
      const haystack = [
        farm.farmCode,
        farm.farmName,
        farm.ownerName,
        farm.ownerEmail,
        farm.province,
        farm.address,
      ].filter(Boolean).join(' ').toLowerCase()
      const matchesKeyword = !keyword || haystack.includes(keyword)
      const matchesApproval = !approvalFilter || farm.approvalStatus === approvalFilter
      return matchesKeyword && matchesApproval
    })
  }, [farms, search, approvalFilter])

  const selectedFarm = useMemo(() => {
    if (!filteredFarms.length) return null
    return filteredFarms.find((farm) => farm.farmId === selectedFarmId) || filteredFarms[0]
  }, [filteredFarms, selectedFarmId])

  const stats = useMemo(() => {
    const total = farms.length
    const pending = farms.filter((farm) => farm.approvalStatus === 'PENDING').length
    const approved = farms.filter((farm) => farm.approvalStatus === 'APPROVED').length
    const rejected = farms.filter((farm) => farm.approvalStatus === 'REJECTED').length
    return { total, pending, approved, rejected }
  }, [farms])

  async function loadFarms() {
    try {
      setLoading(true)
      setError('')
      const data = normalizeFarms(await getAllFarms())
      setFarms(data)
      setSelectedFarmId((prev) => {
        if (data.some((farm) => farm.farmId === prev)) return prev
        return data[0]?.farmId ?? null
      })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleChangeApprovalStatus(farm, newStatus) {
    try {
      setReviewingFarmId(farm.farmId)
      setError('')
      setSuccess('')
      await updateFarmApprovalStatus(farm.farmId, newStatus)
      await loadFarms()
      setSuccess(`${APPROVAL_LABELS[newStatus] || newStatus} nông trại ${farm.farmName}`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(getErrorMessage(err))
      await loadFarms()
    } finally {
      setReviewingFarmId(null)
    }
  }

  function formatDate(dateString) {
    if (!dateString) return 'Chưa duyệt'
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <section className="page-section admin-page admin-farms-page">
      <div className="section-heading">
        <div>
          <h2>Quản lý nông trại</h2>
        </div>
        <div className="section-actions">
          <Button variant="secondary" onClick={loadFarms} disabled={loading}>{loading ? 'Đang tải...' : 'Làm mới'}</Button>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <div className="stats-grid admin-farms-stats">
        <div className="status-card glass-card tone-primary"><span>Tổng farm</span><strong>{stats.total}</strong></div>
        <div className="status-card glass-card tone-warning"><span>Chờ duyệt</span><strong>{stats.pending}</strong></div>
        <div className="status-card glass-card tone-success"><span>Đã duyệt</span><strong>{stats.approved}</strong></div>
        <div className="status-card glass-card tone-danger"><span>Từ chối</span><strong>{stats.rejected}</strong></div>
      </div>

      <div className="admin-farms-shell">
        <aside className="admin-farms-list glass-card">
          <div className="admin-users-list-head">
            <h3>Danh sách nông trại</h3>
            <span className="muted-inline">{filteredFarms.length} farm</span>
          </div>
          <div className="admin-users-filters">
            <input
              className="form-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm farm/chủ/tỉnh"
            />
            <select className="form-input" value={approvalFilter} onChange={(event) => setApprovalFilter(event.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="REJECTED">Từ chối</option>
            </select>
          </div>

          <div className="admin-farms-items">
            {loading ? <div className="muted-inline">Đang tải danh sách farm...</div> : null}
            {!loading && filteredFarms.length === 0 ? <div className="muted-inline">Không có farm phù hợp.</div> : null}
            {filteredFarms.map((farm) => (
              <button
                key={farm.farmId}
                type="button"
                className={`admin-farm-item ${selectedFarm?.farmId === farm.farmId ? 'is-selected' : ''}`}
                onClick={() => setSelectedFarmId(farm.farmId)}
              >
                <strong>{display(farm.farmName, 'Farm chưa đặt tên')}</strong>
                <span>{display(farm.ownerName, 'Chưa có chủ sở hữu')}</span>
                <div className="admin-farm-item-meta">
                  <span className={statusClass(farm.approvalStatus)}>{APPROVAL_LABELS[farm.approvalStatus] || farm.approvalStatus || 'Chờ duyệt'}</span>
                  <span>#{farm.farmId}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <main className="admin-farms-detail glass-card">
          {selectedFarm ? (
            <>
              <div className="admin-farm-profile-head">
                <div>
                  <p className="eyebrow">Hồ sơ farm</p>
                  <h3>{display(selectedFarm.farmName, 'Farm chưa đặt tên')}</h3>
                  <p className="muted-inline">Mã farm: {display(selectedFarm.farmCode, `#${selectedFarm.farmId}`)}</p>
                </div>
                <span className={statusClass(selectedFarm.approvalStatus)}>{APPROVAL_LABELS[selectedFarm.approvalStatus] || selectedFarm.approvalStatus || 'Chờ duyệt'}</span>
              </div>

              <div className="admin-farm-info-grid">
                <div className="admin-farm-info-card">
                  <span>Chủ farm</span>
                  <strong>{display(selectedFarm.ownerName)}</strong>
                  <small>ID: {display(selectedFarm.ownerId, '-')}</small>
                </div>
                <div className="admin-farm-info-card">
                  <span>Tỉnh / khu vực</span>
                  <strong>{display(selectedFarm.province)}</strong>
                  <small>{display(selectedFarm.address, 'Chưa có địa chỉ chi tiết')}</small>
                </div>
                <div className="admin-farm-info-card">
                  <span>Chứng nhận</span>
                  <strong>{CERTIFICATION_LABELS[selectedFarm.certificationStatus] || selectedFarm.certificationStatus || 'Chưa cập nhật'}</strong>
                  <small>Trạng thái kiểm tra chứng nhận</small>
                </div>
                <div className="admin-farm-info-card">
                  <span>Người duyệt</span>
                  <strong>{display(selectedFarm.reviewedByFullName, 'Chưa duyệt')}</strong>
                  <small>{formatDate(selectedFarm.reviewedAt)}</small>
                </div>
              </div>

              <div className="admin-farm-license-card">
                <div>
                  <h3>Giấy phép / chứng từ</h3>
                  <p className="muted-inline">Kiểm tra giấy phép kinh doanh hoặc chứng nhận nông sản sạch trước khi phê duyệt.</p>
                </div>
                {selectedFarm.businessLicenseUrl || selectedFarm.certificationUrl ? (
                  <div className="admin-farm-license-actions">
                    {selectedFarm.businessLicenseUrl ? <a className="button button-secondary" href={selectedFarm.businessLicenseUrl} target="_blank" rel="noreferrer">Xem giấy phép</a> : null}
                    {selectedFarm.certificationUrl ? <a className="button button-secondary" href={selectedFarm.certificationUrl} target="_blank" rel="noreferrer">Xem chứng nhận</a> : null}
                  </div>
                ) : (
                  <span className="muted-inline">Farm chưa upload giấy phép/chứng nhận.</span>
                )}
              </div>

              <div className="admin-farm-review-panel">
                <div>
                  <h3>Quyết định duyệt farm</h3>
                  <p className="muted-inline">Farm được duyệt mới nên được tham gia tạo sản phẩm, batch và niêm yết bán hàng.</p>
                </div>
                <div className="admin-farm-review-actions">
                  <Button
                    variant="primary"
                    disabled={reviewingFarmId === selectedFarm.farmId || selectedFarm.approvalStatus === 'APPROVED'}
                    onClick={() => handleChangeApprovalStatus(selectedFarm, 'APPROVED')}
                  >
                    {reviewingFarmId === selectedFarm.farmId ? 'Đang xử lý...' : 'Duyệt farm'}
                  </Button>
                  <Button
                    variant="danger"
                    disabled={reviewingFarmId === selectedFarm.farmId || selectedFarm.approvalStatus === 'REJECTED'}
                    onClick={() => handleChangeApprovalStatus(selectedFarm, 'REJECTED')}
                  >
                    Từ chối
                  </Button>
                </div>
              </div>

              <div className="admin-users-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Farm</th>
                      <th>Chủ sở hữu</th>
                      <th>Khu vực</th>
                      <th>Chứng nhận</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFarms.map((farm) => (
                      <tr key={farm.farmId} className={selectedFarm.farmId === farm.farmId ? 'is-selected' : ''} onClick={() => setSelectedFarmId(farm.farmId)}>
                        <td>{display(farm.farmName, `Farm #${farm.farmId}`)}</td>
                        <td>{display(farm.ownerName)}</td>
                        <td>{display(farm.province)}</td>
                        <td>{CERTIFICATION_LABELS[farm.certificationStatus] || farm.certificationStatus || 'Chưa cập nhật'}</td>
                        <td><span className={statusClass(farm.approvalStatus)}>{APPROVAL_LABELS[farm.approvalStatus] || farm.approvalStatus || 'Chờ duyệt'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="muted-inline">Không có farm để hiển thị.</div>
          )}
        </main>
      </div>
    </section>
  )
}
