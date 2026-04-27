import { useMemo, useState, useEffect } from 'react'
import { Button } from '../components/Button.jsx'
import { TextAreaField } from '../components/TextAreaField.jsx'
import { TextInput } from '../components/TextInput.jsx'
import { markNotificationRead, createContent, createReport, getMyNotifications, getMyReports, getPendingListingRegistrations, reviewListingRegistration } from '../services/workflowService.js'
import { getErrorMessage } from '../utils/helpers.js'

const initialContentForm = {
  title: '',
  summary: '',
  body: '',
  contentType: 'ARTICLE',
  mediaUrl: '',
  status: 'PUBLISHED',
}

const notificationFilters = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'UNREAD', label: 'Chưa đọc' },
  { value: 'READ', label: 'Đã đọc' },
]

const contentTypes = ['ARTICLE', 'GUIDE', 'VIDEO', 'ANNOUNCEMENT']
const contentStatuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED']

function getField(item, keys, fallback = 'N/A') {
  const value = keys.map((key) => item?.[key]).find((entry) => entry !== undefined && entry !== null && entry !== '')
  return value ?? fallback
}

function money(value) {
  if (value === undefined || value === null || value === '') return 'N/A'
  const number = Number(value)
  return Number.isFinite(number) ? `${number.toLocaleString('vi-VN')}đ` : value
}

function statusTone(status) {
  const normalized = String(status || '').toLowerCase()
  if (normalized.includes('open') || normalized.includes('pending')) return 'pending'
  if (normalized.includes('done') || normalized.includes('closed') || normalized.includes('read')) return 'active'
  if (normalized.includes('reject') || normalized.includes('failed')) return 'inactive'
  return 'pending'
}

export function AdminOperationsPage() {
  const [notifications, setNotifications] = useState([])
  const [reports, setReports] = useState([])
  const [pendingRegistrations, setPendingRegistrations] = useState([])
  const [contentForm, setContentForm] = useState(initialContentForm)
  const [notificationFilter, setNotificationFilter] = useState('ALL')
  const [reportStatusFilter, setReportStatusFilter] = useState('ALL')
  const [reportTypeFilter, setReportTypeFilter] = useState('ALL')
  const [rejectReasonMap, setRejectReasonMap] = useState({})
  const [expandedRejectId, setExpandedRejectId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadData() {
    try {
      setLoading(true)
      setError('')
      const [notificationData, reportData, registrationData] = await Promise.all([
        getMyNotifications(),
        getMyReports(),
        getPendingListingRegistrations(),
      ])
      setNotifications(Array.isArray(notificationData) ? notificationData : [])
      setReports(Array.isArray(reportData) ? reportData : [])
      setPendingRegistrations(Array.isArray(registrationData) ? registrationData : [])
    } catch (err) {
      setError(getErrorMessage(err, 'Không tải được dữ liệu tác vụ quản trị.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredNotifications = useMemo(() => notifications.filter((item) => {
    if (notificationFilter === 'UNREAD') return !item.read
    if (notificationFilter === 'READ') return item.read
    return true
  }), [notifications, notificationFilter])

  const reportStatuses = useMemo(() => ['ALL', ...new Set(reports.map((item) => item.status).filter(Boolean))], [reports])
  const reportTypes = useMemo(() => ['ALL', ...new Set(reports.map((item) => item.reportType).filter(Boolean))], [reports])

  const filteredReports = useMemo(() => reports.filter((item) => {
    const matchesStatus = reportStatusFilter === 'ALL' || item.status === reportStatusFilter
    const matchesType = reportTypeFilter === 'ALL' || item.reportType === reportTypeFilter
    return matchesStatus && matchesType
  }), [reports, reportStatusFilter, reportTypeFilter])

  const metrics = useMemo(() => ({
    pendingListings: pendingRegistrations.length,
    unreadNotifications: notifications.filter((item) => !item.read).length,
    openReports: reports.filter((item) => String(item.status || '').toUpperCase() === 'OPEN').length,
    totalReports: reports.length,
  }), [pendingRegistrations, notifications, reports])

  function handleContentChange(event) {
    const { name, value } = event.target
    setContentForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleReview(registrationId, status) {
    const note = status === 'APPROVED'
      ? 'Listing đã được Admin duyệt: đủ điều kiện hiển thị marketplace.'
      : (rejectReasonMap[registrationId]?.trim() || 'Listing bị từ chối: cần bổ sung thông tin sản phẩm/lô sản xuất/truy xuất.')

    try {
      setSaving(true)
      setSuccess('')
      setError('')
      await reviewListingRegistration(registrationId, { status, note })
      setSuccess(`Đã ${status === 'APPROVED' ? 'duyệt' : 'từ chối'} listing.`)
      setExpandedRejectId(null)
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Không xử lý được yêu cầu duyệt listing.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleMarkRead(notificationId) {
    try {
      setSaving(true)
      setError('')
      await markNotificationRead(notificationId)
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Không đánh dấu đã đọc được notification.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleCreateContent(event) {
    event.preventDefault()
    try {
      setSaving(true)
      setSuccess('')
      setError('')
      await createContent({
        title: contentForm.title.trim(),
        summary: contentForm.summary.trim(),
        body: contentForm.body.trim(),
        contentType: contentForm.contentType.trim(),
        mediaUrl: contentForm.mediaUrl.trim(),
        status: contentForm.status.trim(),
      })
      setContentForm(initialContentForm)
      setSuccess('Đã tạo nội dung guest/public thành công.')
    } catch (err) {
      setError(getErrorMessage(err, 'Không tạo được nội dung.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleEscalationReport() {
    try {
      setSaving(true)
      setError('')
      await createReport({
        recipientRole: 'ADMIN',
        reportType: 'SYSTEM_REVIEW',
        subject: 'Tổng hợp thao tác admin',
        content: `Admin đã rà soát ${pendingRegistrations.length} listing chờ duyệt, ${notifications.length} notification và ${reports.length} report trong operations UI.`,
        relatedEntityType: 'ADMIN_DASHBOARD',
      })
      setSuccess('Đã tạo report tổng hợp nội bộ.')
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Không tạo được report tổng hợp.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page-section admin-ops-page">
      <div className="section-heading">
        <div>
          <h2>Duyệt listing, giám sát report & nội dung truyền thông</h2>
        </div>
        <div className="section-actions">
          <Button variant="secondary" onClick={loadData} disabled={loading}>Làm mới</Button>
          <Button onClick={handleEscalationReport} disabled={saving}>Tạo report tổng hợp</Button>
        </div>
      </div>

      <div className="status-grid">
        <article className="status-card tone-primary"><span>Listing chờ duyệt</span><strong>{metrics.pendingListings}</strong><small>Chợ nông sản governance</small></article>
        <article className="status-card tone-warning"><span>Notification chưa đọc</span><strong>{metrics.unreadNotifications}</strong><small>Cần Admin xử lý</small></article>
        <article className="status-card tone-success"><span>Report đang mở</span><strong>{metrics.openReports}</strong><small>Incident tracking</small></article>
        <article className="status-card tone-primary"><span>Tổng report</span><strong>{metrics.totalReports}</strong><small>Audit trail</small></article>
      </div>

      {loading ? <div className="glass-card top-gap">Đang tải dữ liệu vận hành...</div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <div className="content-grid top-gap">
        <article className="glass-card ops-panel ops-panel-wide">
          <div className="admin-table-head">
            <div>
              <h3>Listing chờ duyệt</h3>
              <p>Kiểm tra listing trước khi cho phép xuất hiện trên marketplace.</p>
            </div>
            <span>{pendingRegistrations.length} yêu cầu</span>
          </div>
          {pendingRegistrations.length === 0 ? <div className="ops-empty">✅ Không còn listing nào chờ duyệt.</div> : null}
          <div className="form-grid">
            {pendingRegistrations.map((item) => {
              const id = item.registrationId
              const traceReady = Boolean(getField(item, ['traceCode', 'publicTruy xuấtUrl', 'qrCodeData'], ''))
              return (
                <div key={id} className="ops-card listing-review-card">
                  <div className="ops-card-head">
                    <div>
                      <span className="feature-badge">Listing approval</span>
                      <h4>{getField(item, ['listingTitle', 'title'], `Listing #${id}`)}</h4>
                    </div>
                    <span className={`status-pill status-${statusTone(item.listingStatus || item.status)}`}>{item.listingStatus || item.status || 'PENDING'}</span>
                  </div>
                  <div className="ops-facts-grid">
                    <span><strong>Farm/User</strong>{getField(item, ['farmName', 'requestedByName', 'requesterName'])}</span>
                    <span><strong>Sản phẩm</strong>{getField(item, ['productName', 'productCode'])}</span>
                    <span><strong>Batch</strong>{getField(item, ['batchCode', 'batchId'])}</span>
                    <span><strong>Số lượng</strong>{getField(item, ['quantity', 'availableQuantity'])}</span>
                    <span><strong>Giá</strong>{money(getField(item, ['price', 'unitPrice'], ''))}</span>
                    <span><strong>Truy xuất/QR</strong>{traceReady ? 'Sẵn sàng' : 'Cần kiểm tra'}</span>
                  </div>
                  <p className="muted-inline">Ghi chú: {item.note || 'Không có'}</p>
                  {expandedRejectId === id ? (
                    <label className="form-field">
                      <span className="form-label">Lý do từ chối</span>
                      <textarea
                        className="form-input"
                        rows={3}
                        value={rejectReasonMap[id] || ''}
                        placeholder="VD: Listing thiếu batch/Truy xuất QR hoặc thông tin giá chưa hợp lệ."
                        onChange={(event) => setRejectReasonMap((prev) => ({ ...prev, [id]: event.target.value }))}
                      />
                    </label>
                  ) : null}
                  <div className="inline-actions">
                    <Button variant="secondary" onClick={() => handleReview(id, 'APPROVED')} disabled={saving}>Duyệt listing</Button>
                    {expandedRejectId === id ? (
                      <Button onClick={() => handleReview(id, 'REJECTED')} disabled={saving}>Xác nhận từ chối</Button>
                    ) : (
                      <Button onClick={() => setExpandedRejectId(id)} disabled={saving}>Từ chối</Button>
                    )}
                    {expandedRejectId === id ? <Button variant="secondary" onClick={() => setExpandedRejectId(null)}>Hủy</Button> : null}
                  </div>
                </div>
              )
            })}
          </div>
        </article>

        <article className="glass-card ops-panel">
          <div className="admin-table-head">
            <div>
              <h3>Notification quan trọng</h3>
              <p>Theo dõi cảnh báo và luồng vận hành cần Admin chú ý.</p>
            </div>
            <select className="form-input" value={notificationFilter} onChange={(event) => setNotificationFilter(event.target.value)} style={{ maxWidth: 160 }}>
              {notificationFilters.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
          {filteredNotifications.length === 0 ? <div className="ops-empty">Chưa có notification phù hợp.</div> : null}
          <div className="form-grid">
            {filteredNotifications.slice(0, 8).map((notification) => (
              <div key={notification.notificationId} className="ops-card notification-card">
                <div className="ops-card-head">
                  <strong>{notification.title}</strong>
                  <span className={`status-pill status-${notification.read ? 'active' : 'pending'}`}>{notification.read ? 'Đã đọc' : 'Chưa đọc'}</span>
                </div>
                <p>{notification.message}</p>
                <div className="ops-card-foot">
                  <span>{notification.notificationType || 'SYSTEM'}</span>
                  {!notification.read ? <Button variant="secondary" onClick={() => handleMarkRead(notification.notificationId)} disabled={saving}>Đánh dấu đã đọc</Button> : null}
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="content-grid top-gap">
        <article className="glass-card ops-panel">
          <div className="admin-table-head">
            <div>
              <h3>Report gần đây</h3>
              <p>Theo dõi sự cố, phản ánh và report nội bộ.</p>
            </div>
          </div>
          <div className="grid-two" style={{ marginBottom: '1rem' }}>
            <label className="form-field">
              <span className="form-label">Trạng thái</span>
              <select className="form-input" value={reportStatusFilter} onChange={(event) => setReportStatusFilter(event.target.value)}>
                {reportStatuses.map((status) => <option key={status} value={status}>{status === 'ALL' ? 'Tất cả' : status}</option>)}
              </select>
            </label>
            <label className="form-field">
              <span className="form-label">Loại report</span>
              <select className="form-input" value={reportTypeFilter} onChange={(event) => setReportTypeFilter(event.target.value)}>
                {reportTypes.map((type) => <option key={type} value={type}>{type === 'ALL' ? 'Tất cả' : type}</option>)}
              </select>
            </label>
          </div>
          {filteredReports.length === 0 ? <div className="ops-empty">Chưa có report phù hợp.</div> : null}
          <div className="form-grid">
            {filteredReports.slice(0, 8).map((report) => (
              <div key={report.reportId} className="ops-card report-card">
                <div className="ops-card-head">
                  <strong>{report.subject}</strong>
                  <span className={`status-pill status-${statusTone(report.status)}`}>{report.status || 'OPEN'}</span>
                </div>
                <p>{report.content}</p>
                <div className="ops-facts-grid compact">
                  <span><strong>Loại</strong>{report.reportType || 'N/A'}</span>
                  <span><strong>Người gửi</strong>{report.reporterName || 'Hệ thống/Admin'}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-card ops-panel content-composer">
          <div className="admin-table-head">
            <div>
              <h3>Tạo nội dung guest / educational</h3>
              <p>Đăng bài hướng dẫn, truyền thông nông sản sạch hoặc thông báo public.</p>
            </div>
          </div>
          <form className="form-grid" onSubmit={handleCreateContent}>
            <TextInput label="Tiêu đề" name="title" value={contentForm.title} onChange={handleContentChange} required />
            <TextInput label="Summary" name="summary" value={contentForm.summary} onChange={handleContentChange} />
            <div className="grid-two">
              <label className="form-field">
                <span className="form-label">Loại nội dung</span>
                <select className="form-input" name="contentType" value={contentForm.contentType} onChange={handleContentChange} required>
                  {contentTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label className="form-field">
                <span className="form-label">Trạng thái</span>
                <select className="form-input" name="status" value={contentForm.status} onChange={handleContentChange}>
                  {contentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
            </div>
            <TextInput label="Media URL" name="mediaUrl" value={contentForm.mediaUrl} onChange={handleContentChange} />
            <TextAreaField label="Nội dung" name="body" value={contentForm.body} onChange={handleContentChange} required />
            <div className="ops-preview-card">
              <span className="feature-badge">Preview</span>
              <h4>{contentForm.title || 'Tiêu đề nội dung'}</h4>
              <p>{contentForm.summary || 'Tóm tắt nội dung sẽ hiển thị tại đây.'}</p>
              <small>{contentForm.contentType} • {contentForm.status}</small>
            </div>
            <Button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Tạo nội dung'}</Button>
          </form>
        </article>
      </div>
    </section>
  )
}
