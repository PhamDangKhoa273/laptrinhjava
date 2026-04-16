import { useEffect, useState } from 'react'
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

export function AdminOperationsPage() {
  const [notifications, setNotifications] = useState([])
  const [reports, setReports] = useState([])
  const [pendingRegistrations, setPendingRegistrations] = useState([])
  const [contentForm, setContentForm] = useState(initialContentForm)
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

  function handleContentChange(event) {
    const { name, value } = event.target
    setContentForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleReview(registrationId, status) {
    try {
      setSaving(true)
      setSuccess('')
      await reviewListingRegistration(registrationId, { status, note: status === 'APPROVED' ? 'Approved by admin panel' : 'Rejected by admin panel' })
      setSuccess(`Đã ${status === 'APPROVED' ? 'duyệt' : 'từ chối'} listing.`)
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
      await createReport({
        recipientRole: 'ADMIN',
        reportType: 'SYSTEM_REVIEW',
        subject: 'Tổng hợp thao tác admin',
        content: 'Admin đã rà soát notification, report và listing approval trong control UI.',
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
    <section className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Admin operations</p>
          <h2>Duyệt listing, xem report, theo dõi notification</h2>
          <p>Khóa các workflow vận hành chính của phase 2-4 trước khi đi tiếp sang phase 5-6.</p>
        </div>
        <div className="section-actions">
          <Button variant="secondary" onClick={loadData} disabled={loading}>Làm mới</Button>
          <Button onClick={handleEscalationReport} disabled={saving}>Tạo report tổng hợp</Button>
        </div>
      </div>

      {loading ? <div className="glass-card">Đang tải dữ liệu vận hành...</div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <div className="content-grid">
        <article className="glass-card">
          <h3>Listing chờ duyệt</h3>
          {pendingRegistrations.length === 0 ? <p>Không còn listing nào chờ duyệt.</p> : null}
          <div className="form-grid">
            {pendingRegistrations.map((item) => (
              <div key={item.registrationId} className="business-card">
                <div>
                  <strong>{item.listingTitle}</strong>
                  <p>Farm user: {item.requestedByName}</p>
                  <p>Ghi chú: {item.note || 'Không có'}</p>
                  <p>Trạng thái listing: {item.listingStatus}</p>
                </div>
                <div className="inline-actions">
                  <Button variant="secondary" onClick={() => handleReview(item.registrationId, 'APPROVED')} disabled={saving}>Duyệt</Button>
                  <Button onClick={() => handleReview(item.registrationId, 'REJECTED')} disabled={saving}>Từ chối</Button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-card">
          <h3>Notification quan trọng</h3>
          {notifications.length === 0 ? <p>Chưa có notification.</p> : null}
          <div className="form-grid">
            {notifications.slice(0, 8).map((notification) => (
              <div key={notification.notificationId} className="business-card">
                <div>
                  <strong>{notification.title}</strong>
                  <p>{notification.message}</p>
                  <p>Loại: {notification.notificationType}</p>
                </div>
                <div className="inline-actions">
                  <span className={`status-pill status-${notification.read ? 'active' : 'pending'}`}>{notification.read ? 'Đã đọc' : 'Chưa đọc'}</span>
                  {!notification.read ? <Button variant="secondary" onClick={() => handleMarkRead(notification.notificationId)} disabled={saving}>Đánh dấu đã đọc</Button> : null}
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="content-grid top-gap">
        <article className="glass-card">
          <h3>Report gần đây</h3>
          {reports.length === 0 ? <p>Chưa có report.</p> : null}
          <div className="form-grid">
            {reports.slice(0, 8).map((report) => (
              <div key={report.reportId} className="business-card">
                <div>
                  <strong>{report.subject}</strong>
                  <p>{report.content}</p>
                  <p>Loại: {report.reportType}</p>
                  <p>Người gửi: {report.reporterName}</p>
                  <p>Trạng thái: {report.status}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-card">
          <h3>Tạo nội dung guest / educational</h3>
          <form className="form-grid" onSubmit={handleCreateContent}>
            <TextInput label="Tiêu đề" name="title" value={contentForm.title} onChange={handleContentChange} required />
            <TextInput label="Summary" name="summary" value={contentForm.summary} onChange={handleContentChange} />
            <div className="grid-two">
              <TextInput label="Loại nội dung" name="contentType" value={contentForm.contentType} onChange={handleContentChange} required />
              <TextInput label="Media URL" name="mediaUrl" value={contentForm.mediaUrl} onChange={handleContentChange} />
            </div>
            <TextInput label="Trạng thái" name="status" value={contentForm.status} onChange={handleContentChange} />
            <TextAreaField label="Nội dung" name="body" value={contentForm.body} onChange={handleContentChange} required />
            <Button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Tạo nội dung'}</Button>
          </form>
        </article>
      </div>
    </section>
  )
}
