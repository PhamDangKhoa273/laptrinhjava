import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button.jsx'
import {
  getMyNotifications,
  getMyReports,
  getPendingListingRegistrations,
  markNotificationRead,
  reviewListingRegistration,
} from '../services/workflowService.js'
import { getErrorMessage } from '../utils/helpers.js'

function valueOf(item, keys, fallback = '-') {
  const value = keys.map((key) => item?.[key]).find((entry) => entry !== undefined && entry !== null && entry !== '')
  return value ?? fallback
}

function money(value) {
  if (value === undefined || value === null || value === '') return '-'
  const number = Number(value)
  return Number.isFinite(number) ? number.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }) : String(value)
}

function statusTone(status) {
  const text = String(status || '').toUpperCase()
  if (text.includes('APPROVED') || text.includes('ACTIVE') || text.includes('READ')) return 'active'
  if (text.includes('REJECTED') || text.includes('FAILED') || text.includes('CLOSED')) return 'inactive'
  return 'pending'
}

function unwrapList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.content)) return data.content
  return []
}

export function AdminOperationsPage() {
  const [pendingRegistrations, setPendingRegistrations] = useState([])
  const [notifications, setNotifications] = useState([])
  const [reports, setReports] = useState([])
  const [rejectReasonMap, setRejectReasonMap] = useState({})
  const [expandedRejectId, setExpandedRejectId] = useState(null)
  const [savingId, setSavingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [registrationData, notificationData, reportData] = await Promise.all([
        getPendingListingRegistrations().catch(() => []),
        getMyNotifications().catch(() => []),
        getMyReports().catch(() => []),
      ])
      setPendingRegistrations(unwrapList(registrationData))
      setNotifications(unwrapList(notificationData))
      setReports(unwrapList(reportData))
    } catch (err) {
      setError(getErrorMessage(err, 'Không tải được dữ liệu duyệt đăng sàn.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const metrics = useMemo(() => ({
    pendingListings: pendingRegistrations.length,
    unreadNotifications: notifications.filter((item) => !item.read).length,
    openReports: reports.filter((item) => String(item.status || '').toUpperCase() === 'OPEN').length,
    totalReports: reports.length,
  }), [pendingRegistrations, notifications, reports])

  async function handleReview(registrationId, status) {
    const note = status === 'APPROVED'
      ? 'Listing đã được admin duyệt và hiển thị trên chợ nông sản.'
      : (rejectReasonMap[registrationId]?.trim() || 'Listing bị từ chối. Vui lòng bổ sung thông tin sản phẩm, lô hàng hoặc QR truy xuất.')

    setSavingId(registrationId)
    setError('')
    setSuccess('')
    try {
      await reviewListingRegistration(registrationId, { status, note })
      setSuccess(status === 'APPROVED' ? 'Đã duyệt listing lên chợ.' : 'Đã từ chối listing.')
      setExpandedRejectId(null)
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Không xử lý được yêu cầu duyệt listing.'))
    } finally {
      setSavingId(null)
    }
  }

  async function handleMarkRead(notificationId) {
    try {
      await markNotificationRead(notificationId)
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Không đánh dấu đã đọc được.'))
    }
  }

  return (
    <section className="page-section admin-ops-page">
      <div className="section-heading">
        <div>
          <span className="feature-badge">Marketplace governance</span>
          <h2>Duyệt đăng sàn</h2>
          <p>Kiểm tra listing farm gửi lên trước khi hiển thị công khai trên chợ nông sản.</p>
        </div>
        <div className="section-actions">
          <Button variant="secondary" onClick={loadData} disabled={loading}>{loading ? 'Đang tải...' : 'Làm mới'}</Button>
        </div>
      </div>

      <div className="status-grid">
        <article className="status-card tone-warning"><span>Listing chờ duyệt</span><strong>{metrics.pendingListings}</strong><small>Farm đã gửi yêu cầu</small></article>
        <article className="status-card tone-primary"><span>Thông báo chưa đọc</span><strong>{metrics.unreadNotifications}</strong><small>Cần admin xem</small></article>
        <article className="status-card tone-success"><span>Report đang mở</span><strong>{metrics.openReports}</strong><small>Sự cố vận hành</small></article>
        <article className="status-card tone-primary"><span>Tổng report</span><strong>{metrics.totalReports}</strong><small>Lịch sử xử lý</small></article>
      </div>

      {loading ? <div className="glass-card top-gap">Đang tải dữ liệu...</div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <article className="glass-card ops-panel ops-panel-wide top-gap">
        <div className="admin-table-head">
          <div>
            <h3>Listing chờ duyệt</h3>
            <p>Duyệt xong listing sẽ chuyển sang ACTIVE + APPROVED và xuất hiện ngoài marketplace.</p>
          </div>
          <span>{pendingRegistrations.length} yêu cầu</span>
        </div>

        {pendingRegistrations.length === 0 ? <div className="ops-empty">Không có listing nào chờ duyệt.</div> : null}

        <div className="form-grid">
          {pendingRegistrations.map((item) => {
            const id = item.registrationId
            const title = valueOf(item, ['listingTitle', 'title'], `Listing #${item.listingId || id}`)
            return (
              <div key={id} className="ops-card listing-review-card">
                <div className="ops-card-head">
                  <div>
                    <span className="feature-badge">Listing #{item.listingId || '-'}</span>
                    <h4>{title}</h4>
                  </div>
                  <span className={`status-pill status-${statusTone(item.status)}`}>{item.status || 'PENDING'}</span>
                </div>

                <div className="ops-facts-grid">
                  <span><strong>Farm/User</strong>{valueOf(item, ['farmName', 'requestedByName', 'requesterName'])}</span>
                  <span><strong>Sản phẩm</strong>{valueOf(item, ['productName', 'productCode', 'listingTitle'])}</span>
                  <span><strong>Lô hàng</strong>{valueOf(item, ['batchCode', 'batchId'])}</span>
                  <span><strong>Số lượng</strong>{valueOf(item, ['quantity', 'availableQuantity', 'quantityAvailable'])}</span>
                  <span><strong>Giá</strong>{money(valueOf(item, ['price', 'unitPrice'], ''))}</span>
                  <span><strong>Trạng thái listing</strong>{item.listingStatus || '-'}</span>
                </div>

                <p className="muted-inline">Ghi chú farm: {item.note || 'Không có'}</p>

                {expandedRejectId === id ? (
                  <label className="form-field">
                    <span className="form-label">Lý do từ chối</span>
                    <textarea
                      className="form-input"
                      rows={3}
                      value={rejectReasonMap[id] || ''}
                      placeholder="VD: Thiếu ảnh sản phẩm, thiếu QR truy xuất, giá hoặc số lượng chưa hợp lệ."
                      onChange={(event) => setRejectReasonMap((prev) => ({ ...prev, [id]: event.target.value }))}
                    />
                  </label>
                ) : null}

                <div className="inline-actions">
                  <Button variant="secondary" onClick={() => handleReview(id, 'APPROVED')} disabled={savingId === id}>Duyệt lên chợ</Button>
                  {expandedRejectId === id ? (
                    <Button onClick={() => handleReview(id, 'REJECTED')} disabled={savingId === id}>Xác nhận từ chối</Button>
                  ) : (
                    <Button onClick={() => setExpandedRejectId(id)} disabled={savingId === id}>Từ chối</Button>
                  )}
                  {expandedRejectId === id ? <Button variant="secondary" onClick={() => setExpandedRejectId(null)}>Hủy</Button> : null}
                </div>
              </div>
            )
          })}
        </div>
      </article>

      <div className="content-grid top-gap">
        <article className="glass-card ops-panel">
          <div className="admin-table-head">
            <div>
              <h3>Thông báo gần đây</h3>
              <p>Thông báo hệ thống gửi cho admin.</p>
            </div>
          </div>
          <div className="form-grid">
            {notifications.slice(0, 6).map((notification) => (
              <div key={notification.notificationId} className="ops-card notification-card">
                <div className="ops-card-head">
                  <strong>{notification.title}</strong>
                  <span className={`status-pill status-${notification.read ? 'active' : 'pending'}`}>{notification.read ? 'Đã đọc' : 'Chưa đọc'}</span>
                </div>
                <p>{notification.message}</p>
                {!notification.read ? <Button variant="secondary" onClick={() => handleMarkRead(notification.notificationId)}>Đánh dấu đã đọc</Button> : null}
              </div>
            ))}
            {notifications.length === 0 ? <div className="ops-empty">Chưa có thông báo.</div> : null}
          </div>
        </article>

        <article className="glass-card ops-panel">
          <div className="admin-table-head">
            <div>
              <h3>Report gần đây</h3>
              <p>Phản ánh và sự cố vận hành mới nhất.</p>
            </div>
          </div>
          <div className="form-grid">
            {reports.slice(0, 6).map((report) => (
              <div key={report.reportId} className="ops-card report-card">
                <div className="ops-card-head">
                  <strong>{report.subject}</strong>
                  <span className={`status-pill status-${statusTone(report.status)}`}>{report.status || 'OPEN'}</span>
                </div>
                <p>{report.content}</p>
              </div>
            ))}
            {reports.length === 0 ? <div className="ops-empty">Chưa có report.</div> : null}
          </div>
        </article>
      </div>
    </section>
  )
}

export default AdminOperationsPage
