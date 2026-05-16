import { useEffect, useMemo, useState } from 'react'
import '../shipping-workspace.css'
import { createReport, getMyReports } from '../services/workflowService.js'
import { getErrorMessage } from '../utils/helpers.js'

const initialForm = { subject: '', content: '', severity: 'LOW' }

function Icon({ children, fill = false }) {
  return <span className={`material-symbols-outlined${fill ? ' fill' : ''}`}>{children}</span>
}

function Status({ value }) {
  const key = String(value || 'OPEN').toLowerCase()
  return <span className={`ship-status ${key}`}>{value || 'OPEN'}</span>
}

function PageChrome({ eyebrow, title, subtitle, actions, children, error, success, loading }) {
  return (
    <>
      <div className="ship-page-head">
        <div><p>{eyebrow}</p><h2>{title}</h2><span>{subtitle}</span></div>
        <div className="ship-actions">{actions}</div>
      </div>
      {loading ? <div className="ship-alert neutral">Đang tải báo cáo...</div> : null}
      {error ? <div className="ship-alert danger">{error}</div> : null}
      {success ? <div className="ship-alert success">{success}</div> : null}
      {children}
    </>
  )
}

function Metric({ icon, label, value, note, tone = 'green' }) {
  return (
    <article className={`ship-metric ${tone}`}>
      <div><Icon fill>{icon}</Icon>{note ? <span>{note}</span> : null}</div>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  )
}

function fmtDate(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString('vi-VN')
}

// R-FRM-210 — Farm gửi báo cáo cho admin.
export function FarmReportsPage() {
  const [reports, setReports] = useState([])
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function load() {
    setLoading(true)
    try {
      const data = await getMyReports()
      setReports(Array.isArray(data) ? data : [])
      setError('')
    } catch (err) {
      setError(getErrorMessage(err, 'Không tải được lịch sử báo cáo.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const stats = useMemo(() => {
    const open = reports.filter((r) => String(r.status).toUpperCase() === 'OPEN').length
    const inReview = reports.filter((r) => ['IN_REVIEW', 'ESCALATED'].includes(String(r.status).toUpperCase())).length
    const resolved = reports.filter((r) => ['RESOLVED', 'CLOSED'].includes(String(r.status).toUpperCase())).length
    return { total: reports.length, open, inReview, resolved }
  }, [reports])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.subject.trim() || !form.content.trim()) {
      setError('Vui lòng nhập đầy đủ tiêu đề và nội dung.')
      return
    }
    setSubmitting(true); setError(''); setSuccess('')
    try {
      // PlatformReport DTO requires {recipientRole, reportType, subject, content}.
      // Severity is encoded into subject because PlatformReport entity has no severity column.
      await createReport({
        recipientRole: 'ADMIN',
        reportType: 'FARM_OPERATION',
        subject: `[${form.severity}] ${form.subject.trim()}`,
        content: form.content.trim(),
      })
      setSuccess('Đã gửi báo cáo cho quản trị viên.')
      setForm(initialForm)
      await load()
    } catch (err) {
      setError(getErrorMessage(err, 'Không gửi được báo cáo.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="shipping-prototype-shell">
      <PageChrome
        eyebrow="Farm / Báo cáo / Gửi cho admin"
        title="Báo cáo cho quản trị viên"
        subtitle={`${stats.total} báo cáo đã gửi • ${stats.open} đang mở • ${stats.resolved} đã xử lý`}
        loading={loading}
        error={error}
        success={success}
        actions={<button type="button" onClick={load}><Icon>refresh</Icon>Làm mới</button>}
      >
        <section className="ship-metrics four">
          <Metric icon="outgoing_mail" label="Tổng báo cáo" value={stats.total} />
          <Metric icon="schedule" label="Đang mở" value={stats.open} tone="amber" />
          <Metric icon="inventory" label="Đang xử lý" value={stats.inReview} tone="blue" />
          <Metric icon="task_alt" label="Đã xử lý" value={stats.resolved} />
        </section>

        <div className="drivers-grid">
          <article className="ship-card">
            <h3><Icon>edit_note</Icon>Soạn báo cáo mới</h3>
            <form className="ship-form" onSubmit={handleSubmit}>
              <input
                name="subject"
                placeholder="Tiêu đề báo cáo (vd: Yêu cầu hỗ trợ duyệt listing)"
                value={form.subject}
                onChange={handleChange}
                required
              />
              <select name="severity" value={form.severity} onChange={handleChange}>
                <option value="LOW">Mức độ: Thấp</option>
                <option value="MEDIUM">Mức độ: Trung bình</option>
                <option value="HIGH">Mức độ: Cao</option>
                <option value="CRITICAL">Mức độ: Nghiêm trọng</option>
              </select>
              <textarea
                name="content"
                placeholder="Mô tả chi tiết vấn đề, thời gian, ngữ cảnh..."
                value={form.content}
                onChange={handleChange}
                rows={6}
                required
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" disabled={submitting}>
                  {submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
                </button>
                <button type="button" onClick={() => setForm(initialForm)} disabled={submitting}>
                  Đặt lại
                </button>
              </div>
            </form>
          </article>

          <article className="ship-card">
            <div className="ship-card-head">
              <h3><Icon>history</Icon>Lịch sử báo cáo</h3>
              <span className="success-pill">{stats.total}</span>
            </div>
            {reports.length === 0 ? (
              <p>Bạn chưa gửi báo cáo nào.</p>
            ) : (
              <div className="ship-timeline">
                {reports.map((r) => (
                  <div key={r.reportId}>
                    <i />
                    <strong>#{r.reportId} · {r.subject}</strong>
                    <p style={{ marginTop: 4 }}>{r.content}</p>
                    <p style={{ marginTop: 4 }}>
                      <Status value={r.status} /> · {r.reportType || 'FARM_OPERATION'} · {fmtDate(r.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>
      </PageChrome>
    </section>
  )
}
