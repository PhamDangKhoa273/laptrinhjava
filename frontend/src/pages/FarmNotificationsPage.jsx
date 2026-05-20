import { useEffect, useMemo, useState } from 'react'
import '../shipping-workspace.css'
import { getMyNotifications, markNotificationRead } from '../services/workflowService'
import { getErrorMessage } from '../utils/helpers'

function Icon({ children, fill = false }) {
  return <span className={`material-symbols-outlined${fill ? ' fill' : ''}`}>{children}</span>
}

function PageChrome({ eyebrow, title, subtitle, actions, children, error, success, loading }) {
  return (
    <>
      <div className="ship-page-head">
        <div><p>{eyebrow}</p><h2>{title}</h2><span>{subtitle}</span></div>
        <div className="ship-actions">{actions}</div>
      </div>
      {loading ? <div className="ship-alert neutral">Đang t?i thông báo...</div> : null}
      {error ? <div className="ship-alert danger">{error}</div> : null}
      {success ? <div className="ship-alert success">{success}</div> : null}
      {children}
    </>
  )
}

function Metric({ icon, label, value, tone = 'green' }) {
  return (
    <article className={`ship-metric ${tone}`}>
      <div><Icon fill>{icon}</Icon></div>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  )
}

function notifIcon(type) {
  const t = String(type || '').toUpperCase()
  if (t.includes('IOT') || t.includes('SENSOR')) return 'sensors'
  if (t.includes('DRIVER') || t.includes('SHIPMENT')) return 'local_shipping'
  if (t.includes('RETAILER') || t.includes('ORDER')) return 'storefront'
  if (t.includes('SEASON') || t.includes('EXPORT')) return 'eco'
  if (t.includes('FARM')) return 'agriculture'
  return 'notifications'
}

function notifCategory(type) {
  const t = String(type || '').toUpperCase()
  if (t.includes('IOT') || t.includes('SENSOR')) return 'IoT'
  if (t.includes('DRIVER') || t.includes('SHIPMENT')) return 'V?n chuy?n'
  if (t.includes('RETAILER') || t.includes('ORDER')) return 'Nhà bán l?'
  if (t.includes('SEASON') || t.includes('EXPORT')) return 'Mùa v?'
  return 'H? th?ng'
}

function fmtDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('vi-VN')
}

const FILTER_OPTIONS = [
  { label: 'T?t c?', value: '' },
  { label: 'IoT (nhi?t độ, độ ?m, pH)', value: 'IOT' },
  { label: 'V?n chuy?n / Driver', value: 'SHIPMENT' },
  { label: 'Nhà bán l? / Đơn hàng', value: 'ORDER' },
  { label: 'Mùa v? / Xu?t', value: 'SEASON' },
]

export function FarmNotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [markingId, setMarkingId] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const data = await getMyNotifications()
      setNotifications(Array.isArray(data) ? data : [])
      setError('')
    } catch (err) {
      setError(getErrorMessage(err, 'Không t?i được thông báo.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleMarkRead(id) {
    setMarkingId(id)
    try {
      await markNotificationRead(id)
      setSuccess('Đã đánh d?u đọc.')
      await load()
    } catch (err) {
      setError(getErrorMessage(err, 'Không đánh d?u được.'))
    } finally {
      setMarkingId(null)
    }
  }

  async function handleMarkAllRead() {
    const unread = notifications.filter(n => !n.read)
    for (const n of unread) {
      try { await markNotificationRead(n.notificationId) } catch { }
    }
    setSuccess(`Đã đánh d?u đọc ${unread.length} thông báo.`)
    await load()
  }

  const filtered = useMemo(() => {
    if (!filter) return notifications
    return notifications.filter(n => {
      const t = String(n.notificationType || '').toUpperCase()
      if (filter === 'IOT') return t.includes('IOT') || t.includes('SENSOR')
      if (filter === 'SHIPMENT') return t.includes('DRIVER') || t.includes('SHIPMENT')
      if (filter === 'ORDER') return t.includes('RETAILER') || t.includes('ORDER')
      if (filter === 'SEASON') return t.includes('SEASON') || t.includes('EXPORT')
      return true
    })
  }, [notifications, filter])

  const stats = useMemo(() => {
    const unread = notifications.filter(n => !n.read).length
    const iot = notifications.filter(n => String(n.notificationType || '').toUpperCase().includes('IOT')).length
    const shipment = notifications.filter(n => {
      const t = String(n.notificationType || '').toUpperCase()
      return t.includes('DRIVER') || t.includes('SHIPMENT')
    }).length
    const retailer = notifications.filter(n => {
      const t = String(n.notificationType || '').toUpperCase()
      return t.includes('RETAILER') || t.includes('ORDER')
    }).length
    return { total: notifications.length, unread, iot, shipment, retailer }
  }, [notifications])

  return (
    <section className="shipping-prototype-shell">
      <PageChrome
        eyebrow="Farm / Thông báo"
        title="Thông báo"
        subtitle={`${stats.total} thông báo • ${stats.unread} chưa đọc • ${stats.iot} IoT • ${stats.shipment} v?n chuy?n • ${stats.retailer} nhà bán l?`}
        loading={loading}
        error={error}
        success={success}
        actions={
          <>
            <button type="button" onClick={load}><Icon>refresh</Icon>Làm m?i</button>
            {stats.unread > 0 ? <button type="button" onClick={handleMarkAllRead}><Icon>done_all</Icon>Đọc t?t c?</button> : null}
          </>
        }
      >
        <section className="ship-metrics four">
          <Metric icon="notifications" label="T?ng thông báo" value={stats.total} />
          <Metric icon="mark_email_unread" label="Chưa đọc" value={stats.unread} tone={stats.unread > 0 ? 'red' : 'green'} />
          <Metric icon="sensors" label="IoT (nhi?t độ/ẩm/pH)" value={stats.iot} tone="blue" />
          <Metric icon="local_shipping" label="V?n chuy?n / Driver" value={stats.shipment} tone="amber" />
        </section>

        <article className="ship-card">
          <div className="ship-card-head">
            <h3><Icon>filter_list</Icon>L?c theo lo?i</h3>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {FILTER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFilter(opt.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 999,
                  border: '1px solid var(--ship-border)',
                  background: filter === opt.value ? '#0d631b' : '#fff',
                  color: filter === opt.value ? '#fff' : '#0f172a',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                {opt.label}
                {opt.value === '' ? ` (${stats.total})` :
                  opt.value === 'IOT' ? ` (${stats.iot})` :
                  opt.value === 'SHIPMENT' ? ` (${stats.shipment})` :
                  opt.value === 'ORDER' ? ` (${stats.retailer})` : ''}
              </button>
            ))}
          </div>
        </article>

        <article className="ship-card" style={{ marginTop: 16 }}>
          <div className="ship-card-head">
            <h3><Icon>inbox</Icon>Danh sách thông báo</h3>
            <span className={stats.unread > 0 ? 'danger-pill' : 'success-pill'}>{stats.unread} chưa đọc</span>
          </div>
          {filtered.length === 0 ? (
            <p>Không có thông báo nào{filter ? ` lo?i "${FILTER_OPTIONS.find(o => o.value === filter)?.label}"` : ''}.</p>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {filtered.map(n => (
                <div
                  key={n.notificationId}
                  style={{
                    display: 'flex',
                    gap: 14,
                    padding: 16,
                    borderRadius: 12,
                    background: n.read ? '#f8fafc' : '#ecfdf5',
                    border: `1px solid ${n.read ? 'var(--ship-border)' : '#a7f3d0'}`,
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: n.read ? '#f1f5f9' : '#d1fae5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: n.read ? '#64748b' : '#0d631b',
                  }}>
                    <Icon fill>{notifIcon(n.notificationType)}</Icon>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <strong style={{ color: '#0f172a' }}>{n.title}</strong>
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 999,
                        background: '#e2e8f0', color: '#475569', fontWeight: 700,
                      }}>{notifCategory(n.notificationType)}</span>
                      {!n.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0d631b', display: 'inline-block' }} />}
                    </div>
                    <p style={{ margin: 0, color: '#475569', fontSize: 14 }}>{n.message}</p>
                    <small style={{ color: '#94a3b8' }}>{fmtDate(n.createdAt)}</small>
                  </div>
                  {!n.read ? (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(n.notificationId)}
                      disabled={markingId === n.notificationId}
                      title="Đánh d?u đã đọc"
                      style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--ship-border)', background: '#fff', cursor: 'pointer', flexShrink: 0 }}
                    >
                      <Icon>check</Icon>
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </article>
      </PageChrome>
    </section>
  )
}
