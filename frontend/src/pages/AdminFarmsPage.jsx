import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button.jsx'
import { getAllFarms, updateFarmApprovalStatus } from '../services/businessService'
import { updateFarmDetailByAdmin } from '../services/adminService.js'
import { getErrorMessage } from '../utils/helpers.js'

const APPROVAL_LABELS = {
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  PENDING: 'Chờ duyệt',
  SUSPENDED: 'Tạm khóa',
  REVOKED: 'Thu hồi',
  DEACTIVATED: 'Ngưng hoạt động',
}

const CERTIFICATION_LABELS = {
  VALID: 'Hợp lệ',
  INVALID: 'Không hợp lệ',
  PENDING: 'Chờ kiểm tra',
  PENDING_REVIEW: 'Cần rà soát',
  SUSPENDED: 'Tạm khóa',
  REVOKED: 'Thu hồi',
}

const emptyEditForm = {
  farmName: '',
  farmType: '',
  businessLicenseNo: '',
  address: '',
  province: '',
  totalArea: '',
  contactPerson: '',
  phone: '',
  email: '',
  description: '',
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

function formatDate(value) {
  if (!value) return 'Chưa duyệt'
  return new Date(value).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function fileSize(value) {
  if (!value) return ''
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`
  return `${(value / 1024 / 1024).toFixed(1)} MB`
}

export function AdminFarmsPage() {
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [approvalFilter, setApprovalFilter] = useState('PENDING')
  const [selectedFarmId, setSelectedFarmId] = useState(null)
  const [reviewingFarmId, setReviewingFarmId] = useState(null)
  const [rejectingFarm, setRejectingFarm] = useState(null)
  const [rejectComment, setRejectComment] = useState('')
  const [editingFarm, setEditingFarm] = useState(null)
  const [editForm, setEditForm] = useState(emptyEditForm)
  const [savingEdit, setSavingEdit] = useState(false)

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
        farm.phone,
        farm.email,
        farm.businessLicenseNo,
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
        return data.find((farm) => farm.approvalStatus === 'PENDING')?.farmId || data[0]?.farmId || null
      })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleChangeApprovalStatus(farm, newStatus, reviewComment = '') {
    try {
      setReviewingFarmId(farm.farmId)
      setError('')
      setSuccess('')
      await updateFarmApprovalStatus(farm.farmId, newStatus, reviewComment)
      await loadFarms()
      setSuccess(`${APPROVAL_LABELS[newStatus] || newStatus}: ${farm.farmName}`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(getErrorMessage(err))
      await loadFarms()
    } finally {
      setReviewingFarmId(null)
    }
  }

  function startReject(farm) {
    setRejectingFarm(farm)
    setRejectComment('')
    setError('')
  }

  async function confirmReject() {
    if (!rejectingFarm) return
    if (!rejectComment.trim()) {
      setError('Vui lòng nhập lý do từ chối.')
      return
    }
    await handleChangeApprovalStatus(rejectingFarm, 'REJECTED', rejectComment.trim())
    setRejectingFarm(null)
    setRejectComment('')
  }

  function startEdit(farm) {
    setEditingFarm(farm)
    setEditForm({
      farmName: farm.farmName || '',
      farmType: farm.farmType || '',
      businessLicenseNo: farm.businessLicenseNo || '',
      address: farm.address || '',
      province: farm.province || '',
      totalArea: farm.totalArea ?? '',
      contactPerson: farm.contactPerson || '',
      phone: farm.phone || '',
      email: farm.email || '',
      description: farm.description || '',
    })
    setError('')
  }

  async function saveEdit(event) {
    event.preventDefault()
    if (!editingFarm) return
    setError('')
    setSuccess('')
    setSavingEdit(true)
    try {
      await updateFarmDetailByAdmin(editingFarm.farmId, {
        ...editForm,
        totalArea: editForm.totalArea === '' ? null : Number(editForm.totalArea),
      })
      await loadFarms()
      setSuccess(`Đã cập nhật hồ sơ farm ${editingFarm.farmName}.`)
      setTimeout(() => setSuccess(''), 4000)
      setEditingFarm(null)
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể cập nhật hồ sơ farm.'))
    } finally {
      setSavingEdit(false)
    }
  }

  return (
    <section className="page-section admin-page admin-farms-page">
      <div className="section-heading">
        <div>
          <span className="feature-badge">Farm applications</span>
          <h2>Quản lý trang trại</h2>
          <p>Xem, phê duyệt/từ chối đăng ký farm và quản lý chứng nhận, liên hệ, vị trí.</p>
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
            <h3>Hồ sơ đăng ký</h3>
            <span className="muted-inline">{filteredFarms.length} farm</span>
          </div>
          <div className="admin-users-filters">
            <input className="form-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm farm/chủ/tỉnh/liên hệ" />
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
              <button key={farm.farmId} type="button" className={`admin-farm-item ${selectedFarm?.farmId === farm.farmId ? 'is-selected' : ''}`} onClick={() => setSelectedFarmId(farm.farmId)}>
                <strong>{display(farm.farmName, 'Farm chưa đặt tên')}</strong>
                <span>{display(farm.ownerName, 'Chưa có chủ sở hữu')}</span>
                <div className="admin-farm-item-meta">
                  <span className={statusClass(farm.approvalStatus)}>{APPROVAL_LABELS[farm.approvalStatus] || farm.approvalStatus || 'Chờ duyệt'}</span>
                  <span>{display(farm.province, `#${farm.farmId}`)}</span>
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
                <div className="admin-farm-info-card"><span>Chủ farm</span><strong>{display(selectedFarm.ownerName)}</strong><small>ID: {display(selectedFarm.ownerId, '-')}</small></div>
                <div className="admin-farm-info-card"><span>Liên hệ</span><strong>{display(selectedFarm.contactPerson || selectedFarm.ownerName)}</strong><small>{display(selectedFarm.phone)} · {display(selectedFarm.email)}</small></div>
                <div className="admin-farm-info-card"><span>Vị trí</span><strong>{display(selectedFarm.province)}</strong><small>{display(selectedFarm.address, 'Chưa có địa chỉ chi tiết')}</small></div>
                <div className="admin-farm-info-card"><span>Chứng nhận</span><strong>{CERTIFICATION_LABELS[selectedFarm.certificationStatus] || selectedFarm.certificationStatus || 'Chưa cập nhật'}</strong><small>GPKD: {display(selectedFarm.businessLicenseNo)}</small></div>
              </div>

              <div className="admin-farm-license-card">
                <div>
                  <h3>Giấy phép / chứng nhận</h3>
                  <p className="muted-inline">Kiểm tra giấy phép kinh doanh, chứng nhận và thông tin pháp lý trước khi phê duyệt.</p>
                </div>
                {selectedFarm.businessLicenseFileUrl ? (
                  <div className="admin-farm-license-actions">
                    <a className="button button-secondary" href={selectedFarm.businessLicenseFileUrl} target="_blank" rel="noreferrer">Xem giấy phép</a>
                    <span className="muted-inline">{display(selectedFarm.businessLicenseFileName, 'Tệp giấy phép')} {fileSize(selectedFarm.businessLicenseFileSize)}</span>
                  </div>
                ) : (
                  <span className="muted-inline">Farm chưa upload giấy phép/chứng nhận.</span>
                )}
              </div>

              <div className="admin-farm-review-panel">
                <div>
                  <h3>Quyết định duyệt farm</h3>
                  <p className="muted-inline">Duyệt khi hồ sơ hợp lệ; từ chối phải có lý do để farm biết cần sửa gì.</p>
                  {selectedFarm.reviewComment ? <p className="muted-inline">Ghi chú gần nhất: {selectedFarm.reviewComment}</p> : null}
                </div>
                <div className="admin-farm-review-actions">
                  <Button variant="secondary" onClick={() => startEdit(selectedFarm)} disabled={reviewingFarmId === selectedFarm.farmId}>Sửa hồ sơ</Button>
                  <Button variant="primary" disabled={reviewingFarmId === selectedFarm.farmId || selectedFarm.approvalStatus === 'APPROVED'} onClick={() => handleChangeApprovalStatus(selectedFarm, 'APPROVED')}>{reviewingFarmId === selectedFarm.farmId ? 'Đang xử lý...' : 'Duyệt farm'}</Button>
                  <Button variant="danger" disabled={reviewingFarmId === selectedFarm.farmId || selectedFarm.approvalStatus === 'REJECTED'} onClick={() => startReject(selectedFarm)}>Từ chối</Button>
                </div>
              </div>
            </>
          ) : (
            <div className="muted-inline">Không có farm để hiển thị.</div>
          )}
        </main>
      </div>

      {rejectingFarm ? (
        <div className="admin-modal-backdrop" onClick={() => setRejectingFarm(null)}>
          <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal-head">
              <h3>Từ chối farm - {rejectingFarm.farmName}</h3>
              <button type="button" onClick={() => setRejectingFarm(null)} aria-label="Đóng">×</button>
            </div>
            <div className="admin-modal-body">
              <label className="form-field">
                <span className="form-label">Lý do từ chối *</span>
                <textarea className="form-input" rows={4} value={rejectComment} onChange={(event) => setRejectComment(event.target.value)} placeholder="Ví dụ: giấy phép hết hạn, thông tin liên hệ không khớp, địa chỉ chưa hợp lệ..." autoFocus />
              </label>
            </div>
            <div className="admin-modal-foot">
              <Button variant="secondary" onClick={() => setRejectingFarm(null)} disabled={reviewingFarmId === rejectingFarm.farmId}>Hủy</Button>
              <Button variant="danger" onClick={confirmReject} disabled={reviewingFarmId === rejectingFarm.farmId || !rejectComment.trim()}>{reviewingFarmId === rejectingFarm.farmId ? 'Đang xử lý...' : 'Xác nhận từ chối'}</Button>
            </div>
          </div>
        </div>
      ) : null}

      {editingFarm ? (
        <div className="admin-modal-backdrop" onClick={() => !savingEdit && setEditingFarm(null)}>
          <div className="admin-modal" onClick={(event) => event.stopPropagation()} style={{ width: 'min(760px, 100%)' }}>
            <div className="admin-modal-head">
              <h3>Sửa hồ sơ farm - {editingFarm.farmName}</h3>
              <button type="button" onClick={() => setEditingFarm(null)} aria-label="Đóng" disabled={savingEdit}>×</button>
            </div>
            <form onSubmit={saveEdit}>
              <div className="admin-modal-body">
                <div className="admin-form-grid">
                  <label className="form-field"><span className="form-label">Tên farm *</span><input className="form-input" value={editForm.farmName} onChange={(event) => setEditForm((prev) => ({ ...prev, farmName: event.target.value }))} required maxLength={150} /></label>
                  <label className="form-field"><span className="form-label">Loại hình</span><input className="form-input" value={editForm.farmType} onChange={(event) => setEditForm((prev) => ({ ...prev, farmType: event.target.value }))} maxLength={100} /></label>
                  <label className="form-field"><span className="form-label">Số GPKD *</span><input className="form-input" value={editForm.businessLicenseNo} onChange={(event) => setEditForm((prev) => ({ ...prev, businessLicenseNo: event.target.value }))} required maxLength={100} /></label>
                  <label className="form-field"><span className="form-label">Người liên hệ</span><input className="form-input" value={editForm.contactPerson} onChange={(event) => setEditForm((prev) => ({ ...prev, contactPerson: event.target.value }))} maxLength={150} /></label>
                  <label className="form-field"><span className="form-label">Số điện thoại</span><input className="form-input" value={editForm.phone} onChange={(event) => setEditForm((prev) => ({ ...prev, phone: event.target.value }))} maxLength={30} /></label>
                  <label className="form-field"><span className="form-label">Email</span><input className="form-input" type="email" value={editForm.email} onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))} maxLength={150} /></label>
                  <label className="form-field"><span className="form-label">Địa chỉ *</span><input className="form-input" value={editForm.address} onChange={(event) => setEditForm((prev) => ({ ...prev, address: event.target.value }))} required maxLength={255} /></label>
                  <label className="form-field"><span className="form-label">Tỉnh / TP *</span><input className="form-input" value={editForm.province} onChange={(event) => setEditForm((prev) => ({ ...prev, province: event.target.value }))} required maxLength={100} /></label>
                  <label className="form-field"><span className="form-label">Diện tích (ha)</span><input className="form-input" type="number" step="0.01" min="0" value={editForm.totalArea} onChange={(event) => setEditForm((prev) => ({ ...prev, totalArea: event.target.value }))} /></label>
                  <label className="form-field" style={{ gridColumn: '1 / -1' }}><span className="form-label">Mô tả</span><textarea className="form-input" rows={3} value={editForm.description} onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))} maxLength={2000} /></label>
                </div>
              </div>
              <div className="admin-modal-foot">
                <Button type="button" variant="secondary" onClick={() => setEditingFarm(null)} disabled={savingEdit}>Hủy</Button>
                <Button type="submit" disabled={savingEdit}>{savingEdit ? 'Đang lưu...' : 'Lưu hồ sơ'}</Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  )
}
