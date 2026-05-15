import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button.jsx'
import { getAllSubscriptionPayments } from '../services/adminService.js'
import { api } from '../services/api.js'

function unwrap(response) {
  return response.data?.data || response.data
}

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.content)) return payload.content
  if (Array.isArray(payload?.items)) return payload.items
  return []
}

function money(value) {
  if (value === null || value === undefined) return 'N/A'
  const n = Number(value)
  if (Number.isNaN(n)) return String(value)
  return n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
}

function statusTone(status = '') {
  const v = String(status).toUpperCase()
  if (v === 'PAID') return 'green'
  if (v === 'PENDING') return 'yellow'
  if (v === 'FAILED') return 'red'
  return 'gray'
}

export function AdminSubscriptionPaymentsPage() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [overrideNote, setOverrideNote] = useState('')
  const [overridingId, setOverridingId] = useState(null)

  async function load() {
    try {
      setLoading(true)
      setError('')
      const data = normalizeList(await getAllSubscriptionPayments())
      setPayments(data)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không tải được danh sách thanh toán.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase()
    return payments.filter((p) => {
      const matchStatus = statusFilter === 'ALL' || String(p.paymentStatus || '').toUpperCase() === statusFilter
      const matchKw = !kw || [p.farmName, p.payerFullName, p.transactionRef, String(p.subscriptionPaymentId || '')].some((v) => String(v || '').toLowerCase().includes(kw))
      return matchStatus && matchKw
    })
  }, [payments, search, statusFilter])

  const metrics = useMemo(() => {
    const paid = payments.filter((p) => String(p.paymentStatus || '').toUpperCase() === 'PAID')
    const pending = payments.filter((p) => String(p.paymentStatus || '').toUpperCase() === 'PENDING')
    const failed = payments.filter((p) => String(p.paymentStatus || '').toUpperCase() === 'FAILED')
    const totalRevenue = paid.reduce((sum, p) => sum + Number(p.amount || 0), 0)
    return { paid: paid.length, pending: pending.length, failed: failed.length, totalRevenue }
  }, [payments])

  async function handleAdminOverride(paymentId) {
    if (!overrideNote.trim()) {
      setError('Vui lòng nhập ghi chú lý do override.')
      return
    }
    setOverridingId(paymentId)
    setError('')
    setSuccess('')
    try {
      await unwrap(await api.post(`/subscription-payments/${paymentId}/admin-override`, null, { params: { note: overrideNote.trim() } }))
      setSuccess(`Đã override thanh toán #${paymentId} thành PAID.`)
      setOverrideNote('')
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể override thanh toán.')
    } finally {
      setOverridingId(null)
    }
  }

  return (
    <section className="page-section admin-page">
      <div className="section-heading">
        <div>
          <h2>Thanh toán gói dịch vụ</h2>
          <p>Xem tất cả thanh toán subscription của các nông trại và override thủ công khi cần.</p>
        </div>
        <div className="section-actions">
          <Button variant="secondary" onClick={load} disabled={loading}>{loading ? 'Đang tải...' : 'Làm mới'}</Button>
        </div>
      </div>

      <div className="status-grid admin-overview-grid">
        <article className="status-card"><span>Tổng thanh toán</span><strong>{payments.length}</strong></article>
        <article className="status-card"><span>Đã thanh toán</span><strong>{metrics.paid}</strong></article>
        <article className="status-card"><span>Chờ xử lý</span><strong>{metrics.pending}</strong></article>
        <article className="status-card"><span>Thất bại</span><strong>{metrics.failed}</strong></article>
        <article className="status-card"><span>Tổng doanh thu</span><strong>{money(metrics.totalRevenue)}</strong></article>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      {/* Override panel */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 700 }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '6px' }}>admin_panel_settings</span>
          Admin Override — Kích hoạt thanh toán thủ công
        </h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Ghi chú lý do (bắt buộc)</label>
            <input
              className="form-input"
              value={overrideNote}
              onChange={(e) => setOverrideNote(e.target.value)}
              placeholder="Ví dụ: Đã xác nhận chuyển khoản qua ngân hàng..."
              style={{ width: '100%' }}
            />
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', alignSelf: 'center' }}>
            Chọn một thanh toán trong bảng bên dưới rồi nhấn nút Override.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters compact-filters" style={{ marginBottom: '16px' }}>
        <input
          className="form-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm tên farm, người dùng, mã giao dịch..."
          style={{ minWidth: '240px' }}
        />
        <select className="form-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PAID">PAID</option>
          <option value="PENDING">PENDING</option>
          <option value="FAILED">FAILED</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f1f5f9', background: '#f8fafc' }}>
              {['ID', 'Nông trại', 'Người thanh toán', 'Số tiền', 'Phương thức', 'Trạng thái', 'Mã giao dịch', 'Ngày thanh toán', 'Hành động'].map((h) => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>Không có dữ liệu phù hợp.</td></tr>
            ) : filtered.map((p) => (
              <tr key={p.subscriptionPaymentId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>#{p.subscriptionPaymentId}</td>
                <td style={{ padding: '10px 12px' }}>{p.farmName || 'N/A'}</td>
                <td style={{ padding: '10px 12px' }}>{p.payerFullName || `#${p.payerUserId}` || 'N/A'}</td>
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>{money(p.amount)}</td>
                <td style={{ padding: '10px 12px' }}>{p.method || 'N/A'}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span className={`status-pill status-${statusTone(p.paymentStatus)}`}>{p.paymentStatus || 'N/A'}</span>
                </td>
                <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: '11px', color: '#64748b' }}>
                  {p.transactionRef ? p.transactionRef.slice(0, 20) + (p.transactionRef.length > 20 ? '...' : '') : 'N/A'}
                </td>
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#64748b' }}>
                  {p.paidAt ? new Date(p.paidAt).toLocaleDateString('vi-VN') : 'N/A'}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  {String(p.paymentStatus || '').toUpperCase() !== 'PAID' ? (
                    <Button
                      variant="secondary"
                      onClick={() => handleAdminOverride(p.subscriptionPaymentId)}
                      disabled={overridingId === p.subscriptionPaymentId}
                      style={{ fontSize: '12px', padding: '4px 10px', whiteSpace: 'nowrap' }}
                    >
                      {overridingId === p.subscriptionPaymentId ? 'Đang xử lý...' : 'Override → PAID'}
                    </Button>
                  ) : (
                    <span style={{ color: '#16a34a', fontSize: '12px', fontWeight: 600 }}>✓ Đã thanh toán</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
