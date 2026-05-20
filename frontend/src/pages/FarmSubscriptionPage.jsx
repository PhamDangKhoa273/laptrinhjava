import { useEffect, useMemo, useState } from 'react'
import {
  createSubscription,
  createSubscriptionPayment,
  getMyFarm,
  getMySubscriptionPayments,
  getMySubscriptions,
  getPackages,
} from '../services/businessService.js'
import { demoConfirmPayment } from '../services/subscriptionService.js'
import { getErrorMessage } from '../utils/helpers.js'

const EFFECTIVE_STATUSES = ['ACTIVE', 'EXPIRING_SOON', 'GRACE_PERIOD']
const PENDING_STATUSES = ['PENDING', 'PENDING_PAYMENT']

function money(value) {
  if (value === null || value === undefined || value === '') return '-'
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

function formatDate(value) {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleDateString('vi-VN')
  } catch {
    return String(value)
  }
}

function getStatus(value) {
  return String(value || '').toUpperCase()
}

export function FarmSubscriptionPage() {
  const [farm, setFarm] = useState(null)
  const [packages, setPackages] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [payments, setPayments] = useState([])
  const [selectedPackageId, setSelectedPackageId] = useState('')
  const [purchasing, setPurchasing] = useState(false)
  const [payingId, setPayingId] = useState(null)
  const [demoConfirming, setDemoConfirming] = useState(null)
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

  useEffect(() => { loadAll() }, [])

  const activeSubscription = useMemo(() => {
    const today = new Date()
    return subscriptions.find((sub) => {
      if (!EFFECTIVE_STATUSES.includes(getStatus(sub.status))) return false
      const start = sub.startDate ? new Date(sub.startDate) : null
      const end = sub.endDate ? new Date(sub.endDate) : null
      return (!start || start <= today) && (!end || end >= today)
    }) || null
  }, [subscriptions])

  const activePackage = useMemo(
    () => activeSubscription ? packages.find((pkg) => String(pkg.packageId) === String(activeSubscription.packageId)) || null : null,
    [activeSubscription, packages],
  )

  const activePackagePrice = Number(activePackage?.price || 0)

  const payablePendingSubscriptions = useMemo(
    () => subscriptions
      .filter((sub) => PENDING_STATUSES.includes(getStatus(sub.status)))
      .filter((sub) => {
        if (!activeSubscription) return true
        if (String(sub.subscriptionId) === String(activeSubscription.subscriptionId)) return false
        const pkg = packages.find((item) => String(item.packageId) === String(sub.packageId))
        return Number(pkg?.price || 0) > activePackagePrice
      })
      .sort((a, b) => Number(b.subscriptionId || 0) - Number(a.subscriptionId || 0)),
    [activePackagePrice, activeSubscription, packages, subscriptions],
  )

  const payableSubscriptionIds = useMemo(
    () => new Set(payablePendingSubscriptions.map((sub) => String(sub.subscriptionId))),
    [payablePendingSubscriptions],
  )

  async function handleDemoConfirm(paymentId) {
    setDemoConfirming(paymentId)
    setError('')
    setSuccess('')
    try {
      await demoConfirmPayment(paymentId)
      setSuccess('Đã xác nhận thanh toán thành công. Gói dịch vụ đã được kích hoạt.')
      setSelectedPackageId('')
      await loadAll()
    } catch (err) {
      setError(getErrorMessage(err, 'Không xác nhận được. Thử lại hoặc liên hệ admin.'))
    } finally {
      setDemoConfirming(null)
    }
  }

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
      const created = await createSubscription({ farmId: Number(farm.farmId), packageId: Number(selectedPackageId) })
      setSuccess(`Đã tạo subscription #${created?.subscriptionId || ''}. Tiến hành thanh toán để kích hoạt.`)
      setSelectedPackageId('')
      await loadAll()
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tạo subscription.'))
    } finally {
      setPurchasing(false)
    }
  }

  async function handleQuickPay(subscription, amount) {
    setPayingId(subscription.subscriptionId)
    setError('')
    setSuccess('')
    try {
      const txRef = `BICAP-SUB${subscription.subscriptionId}-${Date.now()}`
      const created = await createSubscriptionPayment({
        subscriptionId: subscription.subscriptionId,
        amount,
        method: 'BANK_TRANSFER',
        transactionRef: txRef,
      })
      if (created?.paymentId) await demoConfirmPayment(created.paymentId)
      setSuccess('Đã xác nhận thanh toán. Gói dịch vụ đã được kích hoạt.')
      await loadAll()
    } catch (err) {
      setError(getErrorMessage(err, 'Không xác nhận được.'))
    } finally {
      setPayingId(null)
    }
  }

  return (
    <section className="shipping-prototype-shell">
      <div className="ship-page-head">
        <div>
          <p>Farm / Tổng quan / Gói dịch vụ</p>
          <h2>Gói dịch vụ & Thanh toán</h2>
          <span>BICAP cung cấp các gói dịch vụ để Farm sử dụng nền tảng. Bạn chọn gói và thanh toán để kích hoạt quyền sử dụng.</span>
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
        <article className="ship-metric blue"><div><span className="material-symbols-outlined fill">storefront</span></div><p>Gói đang mở</p><strong>{packages.filter((pkg) => getStatus(pkg.status) === 'ACTIVE').length}</strong></article>
        <article className="ship-metric amber"><div><span className="material-symbols-outlined fill">pending_actions</span></div><p>Chờ thanh toán</p><strong>{payablePendingSubscriptions.length}</strong></article>
        <article className="ship-metric"><div><span className="material-symbols-outlined fill">receipt_long</span></div><p>Lịch sử thanh toán</p><strong>{payments.length}</strong></article>
      </section>

      {activeSubscription ? (
        <article className="ship-card" style={{ marginBottom: 24 }}>
          <div className="ship-card-head">
            <h3><span className="material-symbols-outlined fill">verified_user</span>Gói đang hoạt động</h3>
            <span className="success-pill">{activeSubscription.status}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <div><div style={{ color: 'var(--ship-muted)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Mã subscription</div><strong style={{ fontSize: 18 }}>#{activeSubscription.subscriptionId}</strong></div>
            <div><div style={{ color: 'var(--ship-muted)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Gói</div><strong style={{ fontSize: 18 }}>{activeSubscription.packageName}</strong></div>
            <div><div style={{ color: 'var(--ship-muted)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Hiệu lực</div><strong style={{ fontSize: 16 }}>{formatDate(activeSubscription.startDate)} - {formatDate(activeSubscription.endDate)}</strong></div>
          </div>
        </article>
      ) : null}

      <article className="ship-card" style={{ marginBottom: 24 }}>
        <div className="ship-card-head">
          <h3><span className="material-symbols-outlined">storefront</span>{activeSubscription ? 'Nâng cấp gói' : 'Mua gói dịch vụ'}</h3>
          {activeSubscription ? (
            <span style={{ fontSize: 13, color: '#64748b' }}>Gói hiện tại: <strong>{activeSubscription.packageName}</strong> - hết hạn {formatDate(activeSubscription.endDate)}</span>
          ) : selectedPackageId ? <span className="live-pill"><i />Đã chọn gói</span> : null}
        </div>
        <form onSubmit={handlePurchase}>
          {packages.filter((pkg) => getStatus(pkg.status) === 'ACTIVE').length === 0 ? (
            <p>Hiện chưa có gói dịch vụ nào. Liên hệ admin BICAP để mở gói.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {packages.filter((pkg) => getStatus(pkg.status) === 'ACTIVE').map((pkg) => {
                const isSelected = String(selectedPackageId) === String(pkg.packageId)
                const isCurrent = activeSubscription && String(activeSubscription.packageId) === String(pkg.packageId)
                const isUpgrade = activePackage ? Number(pkg.price || 0) > activePackagePrice : true
                const blocked = activeSubscription && (!isUpgrade || isCurrent)
                return (
                  <article
                    key={pkg.packageId}
                    onClick={() => { if (!blocked) setSelectedPackageId(String(pkg.packageId)) }}
                    style={{
                      cursor: blocked ? 'not-allowed' : 'pointer',
                      opacity: blocked ? 0.72 : 1,
                      borderRadius: 12,
                      padding: 20,
                      background: isCurrent ? '#eff6ff' : isSelected ? '#f0fdf4' : '#fff',
                      border: isCurrent ? '2px solid #2563eb' : isSelected ? '2px solid #0d631b' : '1px solid var(--ship-border)',
                      boxShadow: (isSelected || isCurrent) ? '0 12px 32px rgba(13, 99, 27, 0.14)' : '0 6px 16px rgba(15, 23, 42, 0.05)',
                      transition: 'all .15s ease',
                      position: 'relative',
                    }}
                  >
                    {isSelected ? <span style={{ position: 'absolute', top: 12, right: 12, background: '#0d631b', color: '#fff', borderRadius: '50%', width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900 }}>✓</span> : null}
                    <div style={{ color: '#0d631b', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>{pkg.packageCode}</div>
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
                      <li style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#0f172a' }}><span style={{ color: '#0d631b' }}>✓</span> IoT alert + digest hằng ngày</li>
                    </ul>
                    <button type="button" onClick={(e) => { e.stopPropagation(); if (!blocked) setSelectedPackageId(String(pkg.packageId)) }} disabled={blocked} style={{ marginTop: 16, width: '100%', padding: '10px 16px', borderRadius: 10, border: 0, background: isCurrent ? '#2563eb' : isSelected ? '#0d631b' : blocked ? '#cbd5e1' : '#f0f7f1', color: (isCurrent || isSelected) ? '#fff' : blocked ? '#64748b' : '#0d631b', fontWeight: 800, cursor: blocked ? 'not-allowed' : 'pointer' }}>
                      {isCurrent ? 'Gói hiện tại' : isSelected ? 'Đã chọn' : activeSubscription && !isUpgrade ? 'Không thể giảm gói' : 'Chọn gói'}
                    </button>
                  </article>
                )
              })}
            </div>
          )}
          {selectedPackageId ? (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--ship-border)' }}>
              {activeSubscription ? (
                <p style={{ margin: '0 0 12px', color: '#9a3412', fontSize: 13, fontWeight: 700, background: '#fff7ed', padding: '10px 14px', borderRadius: 8, border: '1px solid #fed7aa' }}>
                  Farm đang dùng gói <strong>{activeSubscription.packageName}</strong> đến <strong>{formatDate(activeSubscription.endDate)}</strong>. Chỉ có thể nâng cấp lên gói cao hơn.
                </p>
              ) : null}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {(() => {
                  const farmReady = farm && getStatus(farm.approvalStatus) === 'APPROVED'
                  const selectedPkg = packages.find((pkg) => String(pkg.packageId) === String(selectedPackageId))
                  const isSameOrLower = !!activeSubscription && !!activePackage && !!selectedPkg && Number(selectedPkg.price || 0) <= activePackagePrice
                  return (
                    <button type="submit" disabled={purchasing || !farmReady || isSameOrLower} className="primary-action" style={{ padding: '12px 28px', background: (!farmReady || isSameOrLower) ? '#94a3b8' : '#0d631b', color: '#fff', cursor: (!farmReady || isSameOrLower) ? 'not-allowed' : 'pointer' }}>
                      {purchasing ? 'Đang xử lý...' : !farm ? 'Cần đăng ký farm' : !farmReady ? `Farm chưa duyệt (${farm.approvalStatus})` : activeSubscription ? 'Nâng cấp lên gói này' : 'Đăng ký gói đã chọn'}
                    </button>
                  )
                })()}
              </div>
            </div>
          ) : null}
        </form>
      </article>

      {payablePendingSubscriptions.length > 0 ? (
        <article className="ship-card" style={{ marginBottom: 24 }}>
          <div className="ship-card-head">
            <h3><span className="material-symbols-outlined">account_balance</span>Hướng dẫn thanh toán</h3>
            <span className="danger-pill">Chờ thanh toán</span>
          </div>
          {payablePendingSubscriptions.map((sub) => {
            const pkg = packages.find((item) => String(item.packageId) === String(sub.packageId))
            const amount = pkg?.price || 0
            return (
              <div key={sub.subscriptionId} style={{ marginBottom: 20, padding: 20, borderRadius: 12, background: '#f0fdf4', border: '1px solid #a7f3d0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <div>
                    <strong style={{ fontSize: 16 }}>Subscription #{sub.subscriptionId} - {sub.packageName}</strong>
                    <p style={{ margin: '4px 0 0', color: '#475569', fontSize: 13 }}>Hiệu lực: {formatDate(sub.startDate)} - {formatDate(sub.endDate)}</p>
                  </div>
                  <strong style={{ fontSize: 24, color: '#0d631b' }}>{money(amount)}</strong>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 16, padding: 16, background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div><div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Ngân hàng</div><strong>Vietcombank</strong></div>
                  <div><div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Số tài khoản</div><strong>1234 5678 9012</strong></div>
                  <div><div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Chủ tài khoản</div><strong>CONG TY BICAP</strong></div>
                  <div><div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Nội dung chuyển khoản</div><strong style={{ color: '#0d631b' }}>BICAP SUB{sub.subscriptionId}</strong></div>
                  <div><div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Số tiền</div><strong style={{ fontSize: 20, color: '#0d631b' }}>{money(amount)}</strong></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => handleQuickPay(sub, amount)} disabled={payingId === sub.subscriptionId} style={{ padding: '12px 24px', borderRadius: 10, border: 0, background: '#0d631b', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: 15 }}>
                    {payingId === sub.subscriptionId ? 'Đang xử lý...' : 'Tôi đã chuyển khoản - Kích hoạt gói'}
                  </button>
                  <p style={{ margin: 0, color: '#64748b', fontSize: 12 }}>Trong môi trường thật, hệ thống tự xác nhận qua cổng thanh toán.</p>
                </div>
              </div>
            )
          })}
        </article>
      ) : null}

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
                <tr><th>Payment</th><th>Subscription</th><th>Số tiền</th><th>Phương thức</th><th>Trạng thái</th><th>Ngày tạo</th><th></th></tr>
              </thead>
              <tbody>
                {payments.map((payment) => {
                  const canConfirm = (!payment.paymentStatus || getStatus(payment.paymentStatus) === 'PENDING') && payableSubscriptionIds.has(String(payment.subscriptionId))
                  return (
                    <tr key={payment.paymentId}>
                      <td><b>#{payment.paymentId}</b><small>{payment.transactionRef || '-'}</small></td>
                      <td>#{payment.subscriptionId}</td>
                      <td><strong>{money(payment.amount)}</strong></td>
                      <td>{payment.method}</td>
                      <td><span className={`ship-status ${String(payment.paymentStatus).toLowerCase()}`}>{payment.paymentStatus}</span></td>
                      <td>{formatDate(payment.createdAt)}</td>
                      <td>
                        {canConfirm ? (
                          <button type="button" onClick={() => handleDemoConfirm(payment.paymentId)} disabled={demoConfirming === payment.paymentId} style={{ padding: '6px 12px', borderRadius: 8, border: 0, background: '#0d631b', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 12 }} title="Mô phỏng thanh toán thành công (demo)">
                            {demoConfirming === payment.paymentId ? '...' : 'Xác nhận'}
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </section>
  )
}

export default FarmSubscriptionPage
