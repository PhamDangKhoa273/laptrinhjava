import { useEffect, useMemo, useState } from 'react'
import '../shipping-workspace.css'
import { getFarmShipmentReports } from '../services/workflowService'
import { getErrorMessage } from '../utils/helpers'

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

function severityTone(severity) {
  const s = String(severity || '').toUpperCase()
  if (s === 'HIGH' || s === 'CRITICAL') return 'red'
  if (s === 'MEDIUM') return 'amber'
  return 'green'
}

export function FarmShipmentReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, _setSuccess] = useState('')

  async function load() {
    setLoading(true)
    try {
      const data = await getFarmShipmentReports()
      setReports(Array.isArray(data) ? data : [])
      setError('')
    } catch (err) {
      setError(getErrorMessage(err, 'Không tải được báo cáo vận chuyển.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const stats = useMemo(() => {
    const open = reports.filter((r) => String(r.status).toUpperCase() === 'OPEN').length
    const high = reports.filter((r) => String(r.severity).toUpperCase() === 'HIGH' || String(r.severity).toUpperCase() === 'CRITICAL').length
    const resolved = reports.filter((r) => ['RESOLVED', 'CLOSED'].includes(String(r.status).toUpperCase())).length
    return { total: reports.length, open, high, resolved }
  }, [reports])

  return (
    <section className="shipping-prototype-shell">
      <PageChrome
        eyebrow="Farm / Kinh doanh / Báo cáo vận chuyển"
        title="Báo cáo vận chuyển từ tài xế"
        subtitle={`${stats.total} báo cáo • ${stats.open} đang mở • ${stats.high} mức độ cao`}
        loading={loading}
        error={error}
        success={success}
        actions={<button type="button" onClick={load}><Icon>refresh</Icon>Làm mới</button>}
      >
        <section className="ship-metrics four">
          <Metric icon="report" label="Tổng báo cáo" value={stats.total} />
          <Metric icon="warning" label="Đang mở" value={stats.open} tone="amber" />
          <Metric icon="priority_high" label="Mức độ cao" value={stats.high} tone="red" />
          <Metric icon="task_alt" label="Đã xử lý" value={stats.resolved} />
        </section>

        <article className="ship-card">
          <div className="ship-card-head">
            <h3><Icon>report</Icon>Driver Issue Inbox</h3>
            <span className="danger-pill">{stats.open} OPEN</span>
          </div>
          {reports.length === 0 ? (
            <p>Chưa có báo cáo vận chuyển nào liên quan tới farm.</p>
          ) : (
            <div className="ship-table-wrap">
              <table className="ship-table">
                <thead>
                  <tr><th>Report</th><th>Shipment</th><th>Driver</th><th>Issue</th><th>Severity</th><th>Trạng thái</th><th>Tạo lúc</th></tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.reportId}>
                      <td><b>#{r.reportId}</b><small>{r.description?.slice(0, 60) || '—'}</small></td>
                      <td>#{r.shipmentId}</td>
                      <td>#{r.driverId || '—'}</td>
                      <td>{r.issueType || '—'}</td>
                      <td><span className={`ship-status ${severityTone(r.severity)}`}>{r.severity || '—'}</span></td>
                      <td><Status value={r.status} /></td>
                      <td>{fmtDate(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </PageChrome>
    </section>
  )
}
