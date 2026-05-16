import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button.jsx'
import {
  createSubscription,
  createSubscriptionPayment,
  getMyFarm,
  getMySubscriptionPayments,
  getMySubscriptions,
  getPackages,
} from '../services/businessService.js'
import { getErrorMessage } from '../utils/helpers.js'

function money(value) {
  if (value === null || value === undefined || value === '') return 'N/A'
  const number = Number(value)
  if (Number.isNaN(number)) return String(value)
  return number.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
}

function unwrapList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.content)) return data.content
  return []
}

// eslint-disable-next-line no-unused-vars
function statusTone(status = '') {
  const value = String(status).toUpperCase()
  if (value === 'ACTIVE' || value === 'PAID' || value === 'CONFIRMED') return 'green'
  if (value === 'PENDING' || value === 'PENDING_PAYMENT' || value === 'EXPIRING_SOON') return 'orange'
  if (value === 'EXPIRED' || value === 'CANCELLED' || value === 'FAILED' || value === 'GRACE_PERIOD') return 'red'
  return 'gray'
}

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString('vi-VN')
  } catch {
    return String(value)
  }
}

const PAYMENT_METHODS = ['BANK_TRANSFER', 'CREDIT_CARD', 'MOMO', 'VNPAY']

export function FarmSubscriptionPage() {
  const [farm, setFarm] = useState(null)
  const [packages, setPackages] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [payments, setPayments] = useState([])

  const [selectedPackageId, setSelectedPackageId] = useState('')
  const [purchasing, setPurchasing] = useState(false)

  const [paymentForm, setPaymentForm] = useState({
    subscriptionId: '',
    amount: '',
    method: 'BANK_TRANSFER',
    transactionRef: '',
  })
  const [paying, setPaying] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadAll() {
    setLoading(true)
    try {
      const [farmData, packageData, subData, paymentData] = await Promise.all([
        getMyFarm().catch(() => null),
        getPackages().catch(() => []),
        getMySubscriptions().catch(() => []),
        getMySubscriptionPayments().catch(() => []),
      ])
      setFarm(farmData)
      setPackages(unwrapList(packageData))
      setSubscriptions(unwrapList(subData))
      setPayments(unwrapList(paymentData))
      setError('')
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải dữ liệu gói dịch vụ.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const activeSubscription = useMemo(
    () => subscriptions.find((s) => ['ACTIVE', 'EXPIRING_SOON', 'GRACE_PERIOD'].includes(String(s.subscriptionStatus).toUpperCase())) || null,
    [subscriptions],
  )

  const pendingSubscriptions = useMemo(
    () => subscriptions.filter((s) => String(s.subscriptionStatus).toUpperCase() === 'PENDING'),
    [subscriptions],
  )

  async function handlePurchase(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!selectedPackageId) {
      setError('Vui lòng chọn gói dịch vụ.')
      return
    }
    if (!farm?.farmId) {
      setError('Cần đăng ký farm trước khi mua gói.')
      return
    }

    setPurchasing(true)
    try {
      const created = await createSubscription({
        farmId: Number(farm.farmId),
        packageId: Number(selectedPackageId),
      })
      setSuccess(`Đã tạo subscription #${created?.subscriptionId || ''}. Tiến hành thanh toán để kích hoạt.`)
      setSelectedPackageId('')
      // Pre-fill payment form for convenience.
      setPaymentForm((current) => ({
        ...current,
        subscriptionId: created?.subscriptionId || '',
      }))
      await loadAll()
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tạo subscription.'))
    } finally {
      setPurchasing(false)
    }
  }

  async function handlePay(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!paymentForm.subscriptionId) {
      setError('Vui lòng chọn subscription cần thanh toán.')
      return
    }
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      setError('Số tiền thanh toán phải lớn hơn 0.')
      return
    }
    if (!paymentForm.method) {
      setError('Vui lòng chọn phương thức thanh toán.')
      return
    }

    setPaying(true)
    try {
      const payload = {
        subscriptionId: Number(paymentForm.subscriptionId),
        amount: Number(paymentForm.amount),
        method: paymentForm.method,
        transactionRef: paymentForm.transactionRef.trim() || undefined,
      }
      const created = await createSubscriptionPayment(payload)
      setSuccess(`Đã ghi nhận yêu cầu thanh toán #${created?.paymentId || ''}. Chờ gateway callback xác nhận để kích hoạt subscription.`)
      setPaymentForm({ subscriptionId: '', amount: '', method: 'BANK_TRANSFER', transactionRef: '' })
      await loadAll()
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tạo yêu cầu thanh toán.'))
    } finally {
      setPaying(false)
    }
  }

  function pickPackage(pkgId) {
    setSelectedPackageId(String(pkgId))
  }

  function quickPay(subscription, suggestedAmount) {
    setPaymentForm({
      subscriptionId: subscription.subscriptionId,
      amount: suggestedAmount,
      method: 'BANK_TRANSFER',
      transactionRef: '',
    })
    setSuccess('')
  }

  return (
    <section className="shipping-prototype-shell">
      <div className="ship-page-head">
        <div>
          <p>Farm / Tổng quan / Gói dịch vụ</p>
          <h2>Gói dịch vụ & Thanh toán</h2>
          <span>BICAP cung cấp các gói dịch vụ để Farm sử dụng nền tảng. Quản trị viên BICAP định giá; bạn chọn gói và thanh toán qua cổng.</span>
        </div>
        <div className="ship-actions">
          <button type="button" onClick={loadAll} disabled={loading}>
            <span className="material-symbols-outlined">refresh</span>
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>
      </div>

      {loading ? <div className="ship-alert neutral">Đang tải dữ liệu gói dịch vụ...</div> : null}
      {error ? <div className="ship-alert danger">{error}</div> : null}
      {success ? <div className="ship-alert success">{success}</div> : null}

      <section className="ship-metrics four">
        <article className="ship-metric"><div><span className="material-symbols-outlined fill">verified</span></div><p>Trạng thái</p><strong>{activeSubscription ? 'ACTIVE' : 'CHƯA MUA'}</strong></article>
        <article className="ship-metric blue"><div><span className="material-symbols-outlined fill">storefront</span></div><p>Gói catalogue</p><strong>{packages.filter((p) => String(p.status).toUpperCase() === 'ACTIVE').length}</strong></article>
        <article className="ship-metric amber"><div><span className="material-symbols-outlined fill">pending_actions</span></div><p>Sub chờ thanh toán</p><strong>{pendingSubscriptions.length}</strong></article>
        <article className="ship-metric"><div><span className="material-symbols-outlined fill">receipt_long</span></div><p>Lịch sử thanh toán</p><strong>{payments.length}</strong></article>
      </section>

      {activeSubscription ? (
        <article className="ship-card" style={{ marginBottom: 24 }}>
          <div className="ship-card-head">
            <h3><span className="material-symbols-outlined fill">verified_user</span>Gói đang hoạt động</h3>
            <span className="success-pill">{activeSubscription.subscriptionStatus}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div><div style={{ color: 'var(--ship-muted)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>Mã subscription</div><strong style={{ fontSize: 18 }}>#{activeSubscription.subscriptionId}</strong></div>
            <div><div style={{ color: 'var(--ship-muted)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>Gói</div><strong style={{ fontSize: 18 }}>{activeSubscription.packageName}</strong></div>
            <div><div style={{ color: 'var(--ship-muted)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>Hiệu lực</div><strong style={{ fontSize: 16 }}>{formatDate(activeSubscription.startDate)} → {formatDate(activeSubscription.endDate)}</strong></div>
          </div>
        </article>
      ) : null}

      <article className="ship-card" style={{ marginBottom: 24 }}>
        <div className="ship-card-head">
          <h3><span className="material-symbols-outlined">storefront</span>Mua gói dịch vụ</h3>
          {selectedPackageId ? <span className="live-pill"><i />Đã chọn gói</span> : null}
        </div>
        <form onSubmit={handlePurchase}>
          {packages.filter((p) => String(p.status).toUpperCase() === 'ACTIVE').length === 0 ? (
            <p>Hiện chưa có gói dịch vụ nào. Liên hệ admin BICAP để mở gói.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {packages.filter((p) => String(p.status).toUpperCase() === 'ACTIVE').map((pkg) => {
                const isSelected = String(selectedPackageId) === String(pkg.packageId)
                return (
                  <article
                    key={pkg.packageId}
                    onClick={() => pickPackage(pkg.packageId)}
                    style={{
                      cursor: 'pointer',
                      borderRadius: 16,
                      padding: 20,
                      background: isSelected ? 'linear-gradient(145deg, #e8f5e9, #f7fbf6)' : '#fff',
                      border: isSelected ? '2px solid #0d631b' : '1px solid var(--ship-border)',
                      boxShadow: isSelected ? '0 12px 32px rgba(13, 99, 27, 0.18)' : '0 6px 16px rgba(15, 23, 42, 0.05)',
                      transition: 'all .15s ease',
                      position: 'relative',
                    }}
                  >
                    {isSelected ? (
                      <span style={{ position: 'absolute', top: 12, right: 12, background: '#0d631b', color: '#fff', borderRadius: '50%', width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900 }}>✓</span>
                    ) : null}
                    <div style={{ color: '#0d631b', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 4 }}>{pkg.packageCode}</div>
                    <h4 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{pkg.packageName}</h4>
                    <div style={{ margin: '12px 0', fontSize: 28, fontWeight: 900, color: '#0d631b' }}>
                      {money(pkg.price)}
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ship-muted)' }}> / {pkg.durationDays} ngày</span>
                    </div>
                    {pkg.description ? <p style={{ margin: '0 0 12px', color: '#475569', fontSize: 13, lineHeight: 1.5 }}>{pkg.description}</p> : null}
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6 }}>
                      {pkg.maxSeasons ? <li style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#0f172a' }}><span style={{ color: '#0d631b' }}>✓</span> Tối đa {pkg.maxSeasons} mùa vụ</li> : null}
                      {pkg.maxListings ? <li style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#0f172a' }}><span style={{ color: '#0d631b' }}>✓</span> Tối đa {pkg.maxListings} listing/tháng</li> : null}
                      <li style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#0f172a' }}><span style={{ color: '#0d631b' }}>✓</span> Mã QR + blockchain proof</li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#0f172a' }}><span style={{ color: '#0d631b' }}>✓</span> IoT alert + digest hàng ngày</li>
                    </ul>
                    <button type="button" onClick={(e) => { e.stopPropagation(); pickPackage(pkg.packageId) }} style={{ marginTop: 16, width: '100%', padding: '10px 16px', borderRadius: 10, border: 0, background: isSelected ? '#0d631b' : '#f0f7f1', color: isSelected ? '#fff' : '#0d631b', fontWeight: 800, cursor: 'pointer' }}>
                      {isSelected ? '✓ Đã chọn' : 'Chọn gói'}
                    </button>
                  </article>
                )
              })}
            </div>
          )}
          {selectedPackageId ? (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--ship-border)', display: 'flex', justifyContent: 'flex-end' }}>
              {(() => {
                const farmReady = farm && String(farm.approvalStatus).toUpperCase() === 'APPROVED'
                return (
                  <button type="submit" disabled={purchasing || !farmReady} className="primary-action" style={{ padding: '12px 28px', background: !farmReady ? '#94a3b8' : '#0d631b', color: '#fff', cursor: !farmReady ? 'not-allowed' : 'pointer' }}>
                    {purchasing ? 'Đang xử lý...' : !farm ? 'Cần đăng ký farm' : !farmReady ? `Farm chưa duyệt (${farm.approvalStatus})` : 'Đăng ký gói đã chọn →'}
                  </button>
                )
              })()}
            </div>
          ) : null}
        </form>
      </article>

      {pendingSubscriptions.length > 0 ? (
        <article className="ship-card" style={{ marginBottom: 24 }}>
          <div className="ship-card-head">
            <h3><span className="material-symbols-outlined">payment</span>Subscription chờ thanh toán</h3>
            <span className="danger-pill">{pendingSubscriptions.length} PENDING</span>
          </div>
          <div className="ship-table-wrap">
            <table className="ship-table">
              <thead>
                <tr><th>ID</th><th>Gói</th><th>Giá</th><th>Hiệu lực dự kiến</th><th>Trạng thái</th><th>Hành động</th></tr>
              </thead>
              <tbody>
                {pendingSubscriptions.map((sub) => {
                  const pkg = packages.find((p) => p.packageId === sub.packageId)
                  return (
                    <tr key={sub.subscriptionId}>
                      <td><b>#{sub.subscriptionId}</b></td>
                      <td>{sub.packageName}<small>{sub.packageCode}</small></td>
                      <td><strong>{money(pkg?.price)}</strong></td>
                      <td>{formatDate(sub.startDate)} → {formatDate(sub.endDate)}</td>
                      <td><span className={`ship-status pending`}>{sub.subscriptionStatus}</span></td>
                      <td>
                        <button type="button" onClick={() => quickPay(sub, pkg?.price ?? '')}>
                          <span className="material-symbols-outlined">credit_card</span>Thanh toán
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </article>
      ) : null}

      <article className="ship-card" style={{ marginBottom: 24 }}>
        <div className="ship-card-head">
          <h3><span className="material-symbols-outlined">credit_card</span>Tạo yêu cầu thanh toán</h3>
        </div>
        <form onSubmit={handlePay} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ship-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Subscription</span>
            <select
              value={paymentForm.subscriptionId}
              onChange={(e) => setPaymentForm({ ...paymentForm, subscriptionId: e.target.value })}
              required
              style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid var(--ship-border)', background: '#fff' }}
            >
              <option value="">— Chọn subscription —</option>
              {subscriptions
                .filter((s) => ['PENDING', 'EXPIRING_SOON', 'GRACE_PERIOD'].includes(String(s.subscriptionStatus).toUpperCase()))
                .map((s) => (
                  <option key={s.subscriptionId} value={s.subscriptionId}>
                    #{s.subscriptionId} — {s.packageName} ({s.subscriptionStatus})
                  </option>
                ))}
            </select>
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ship-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Số tiền (VND)</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              required
              style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid var(--ship-border)' }}
            />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ship-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Phương thức</span>
            <select
              value={paymentForm.method}
              onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
              required
              style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid var(--ship-border)', background: '#fff' }}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ship-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Mã giao dịch</span>
            <input
              value={paymentForm.transactionRef}
              onChange={(e) => setPaymentForm({ ...paymentForm, transactionRef: e.target.value })}
              placeholder="Tự sinh nếu để trống"
              style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid var(--ship-border)' }}
            />
          </label>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
            <p style={{ margin: 0, color: 'var(--ship-muted)', fontSize: 13 }}>
              Yêu cầu được tạo PENDING. Subscription chuyển ACTIVE sau khi gateway callback HMAC verified.
            </p>
            <button type="submit" disabled={paying} className="primary-action" style={{ padding: '12px 28px', background: '#0d631b', color: '#fff' }}>
              {paying ? 'Đang gửi...' : 'Gửi yêu cầu thanh toán'}
            </button>
          </div>
        </form>
      </article>

      <article className="ship-card">
        <div className="ship-card-head">
          <h3><span className="material-symbols-outlined">history</span>Lịch sử thanh toán</h3>
          <span className="live-pill"><i />{payments.length} giao dịch</span>
        </div>
        {payments.length === 0 ? (
          <p>Chưa có thanh toán nào.</p>
        ) : (
          <div className="ship-table-wrap">
            <table className="ship-table">
              <thead>
                <tr><th>Payment</th><th>Subscription</th><th>Số tiền</th><th>Phương thức</th><th>Trạng thái</th><th>Ngày tạo</th></tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.paymentId}>
                    <td><b>#{p.paymentId}</b><small>{p.transactionRef || '—'}</small></td>
                    <td>#{p.subscriptionId}</td>
                    <td><strong>{money(p.amount)}</strong></td>
                    <td>{p.method}</td>
                    <td><span className={`ship-status ${String(p.paymentStatus).toLowerCase()}`}>{p.paymentStatus}</span></td>
                    <td>{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </section>
  )
}

export default FarmSubscriptionPage
