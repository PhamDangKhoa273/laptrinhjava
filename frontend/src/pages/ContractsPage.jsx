import { useEffect, useState } from 'react'
import { getFarmContracts, getActiveFarmContracts, getRetailerContracts, createContract, reviewContract, cancelContract } from '../services/contractService'
import { getMyFarm, getMyRetailer, getAllFarms } from '../services/businessService'
import { getRetailers } from '../services/adminService'
import { getStoredUser } from '../utils/storage'
import { getPrimaryRole } from '../utils/helpers'
import { getErrorMessage } from '../utils/helpers'
import { ROLES } from '../utils/constants'

const initialForm = {
  farmId: '',
  retailerId: '',
  validFrom: '',
  validTo: '',
  productScope: '',
  agreedPriceRule: '',
  notes: '',
}

const statusColors = {
  PENDING: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  ACTIVE: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
  REJECTED: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  CANCELLED: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('vi-VN')
}

function formatDateTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('vi-VN')
}

export default function ContractsPage() {
  const [userRole, setUserRole] = useState(null)
  const [profileId, setProfileId] = useState(null)
  const [contracts, setContracts] = useState([])
  const [allFarms, setAllFarms] = useState([])
  const [allRetailers, setAllRetailers] = useState([])
  const [form, setForm] = useState(initialForm)
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const storedUser = getStoredUser()
    const role = getPrimaryRole(storedUser)
    setUserRole(role)
  }, [])

  useEffect(() => {
    if (!userRole) return
    async function init() {
      try {
        if (userRole === ROLES.FARM) {
          const farm = await getMyFarm()
          if (farm?.farmId) {
            setProfileId(farm.farmId)
            setForm((prev) => ({ ...prev, farmId: String(farm.farmId) }))
          }
        } else if (userRole === ROLES.RETAILER) {
          const retailer = await getMyRetailer()
          if (retailer?.retailerId) {
            setProfileId(retailer.retailerId)
          }
        }
      } catch { }
    }
    init()
  }, [userRole])

  async function loadData() {
    if (!userRole || !profileId) return
    setLoading(true)
    setError('')
    try {
      if (userRole === ROLES.FARM) {
        const [contractData, retailers] = await Promise.all([
          getFarmContracts(profileId),
          getRetailers().catch(() => []),
        ])
        setContracts(Array.isArray(contractData) ? contractData : [])
        setAllRetailers(Array.isArray(retailers) ? retailers : [])
      } else if (userRole === ROLES.RETAILER) {
        const [contractData, farms] = await Promise.all([
          getRetailerContracts(profileId),
          getAllFarms().catch(() => []),
        ])
        setContracts(Array.isArray(contractData) ? contractData : [])
        setAllFarms(Array.isArray(farms) ? farms : [])
      } else if (userRole === ROLES.ADMIN) {
        const [contractData, farms, retailers] = await Promise.all([
          getFarmContracts(profileId).catch(() => []),
          getAllFarms().catch(() => []),
          getRetailers().catch(() => []),
        ])
        setContracts(Array.isArray(contractData) ? contractData : [])
        setAllFarms(Array.isArray(farms) ? farms : [])
        setAllRetailers(Array.isArray(retailers) ? retailers : [])
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải danh sách hợp đồng'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [userRole, profileId])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.retailerId) {
      setError('Vui lòng chọn nhà bán lẻ')
      return
    }
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      const payload = {
        farmId: Number(form.farmId),
        retailerId: Number(form.retailerId),
        validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : null,
        validTo: form.validTo ? new Date(form.validTo).toISOString() : null,
        productScope: form.productScope.trim() || null,
        agreedPriceRule: form.agreedPriceRule.trim() || null,
        notes: form.notes.trim() || null,
      }
      await createContract(payload)
      setSuccess('Tạo hợp đồng thành công')
      setForm((prev) => ({ ...prev, retailerId: '', validFrom: '', validTo: '', productScope: '', agreedPriceRule: '', notes: '' }))
      setShowCreate(false)
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Tạo hợp đồng thất bại'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReview(contractId, status) {
    setError('')
    setSuccess('')
    try {
      await reviewContract(contractId, status)
      setSuccess(`Hợp đồng đã được ${status === 'ACTIVE' ? 'phê duyệt' : 'từ chối'}`)
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Thao tác thất bại'))
    }
  }

  async function handleCancel(contractId) {
    setError('')
    setSuccess('')
    try {
      await cancelContract(contractId)
      setSuccess('Hợp đồng đã bị hủy')
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Hủy hợp đồng thất bại'))
    }
  }

  const isFarm = userRole === ROLES.FARM
  const isRetailer = userRole === ROLES.RETAILER
  const isAdmin = userRole === ROLES.ADMIN

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Quản lý hợp đồng</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            {isFarm ? 'Hợp đồng cung cấp với nhà bán lẻ' : isRetailer ? 'Hợp đồng hợp tác với nông trại' : 'Quản lý hợp đồng giữa nông trại và nhà bán lẻ'}
          </p>
        </div>
        {isFarm && (
          <button onClick={() => { setShowCreate(!showCreate); setError(''); setSuccess('') }}
            style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: showCreate ? 'rgba(255,255,255,0.1)' : '#22c55e', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
            {showCreate ? 'Hủy' : '+ Tạo hợp đồng'}
          </button>
        )}
      </div>

      {error && <div style={{ color: '#ef4444', marginBottom: 12, padding: 10, background: 'rgba(239,68,68,0.1)', borderRadius: 8, fontSize: 13 }}>{error}</div>}
      {success && <div style={{ color: '#22c55e', marginBottom: 12, padding: 10, background: 'rgba(34,197,94,0.1)', borderRadius: 8, fontSize: 13 }}>{success}</div>}

      {showCreate && isFarm && (
        <section style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <h3 style={{ marginTop: 0, marginBottom: 16 }}>Tạo hợp đồng mới</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                Nhà bán lẻ *
                <select name="retailerId" value={form.retailerId} onChange={handleChange} required
                  style={{ padding: 8, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0' }}>
                  <option value="">-- Chọn nhà bán lẻ --</option>
                  {allRetailers.map((r) => (
                    <option key={r.retailerId || r.id} value={r.retailerId || r.id}>{r.retailerName || r.name || r.businessName}</option>
                  ))}
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                Nông trại
                <input value={form.farmId} disabled
                  style={{ padding: 8, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }} />
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                Hiệu lực từ
                <input type="date" name="validFrom" value={form.validFrom} onChange={handleChange}
                  style={{ padding: 8, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                Hiệu lực đến
                <input type="date" name="validTo" value={form.validTo} onChange={handleChange}
                  style={{ padding: 8, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0' }} />
              </label>
            </div>
            <input name="productScope" value={form.productScope} onChange={handleChange} placeholder="Phạm vi sản phẩm (vd: Cà phê, tiêu, điều)"
              style={{ padding: 8, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0' }} />
            <input name="agreedPriceRule" value={form.agreedPriceRule} onChange={handleChange} placeholder="Thỏa thuận giá"
              style={{ padding: 8, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0' }} />
            <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Ghi chú" rows={3}
              style={{ padding: 8, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', resize: 'vertical' }} />
            <button type="submit" disabled={submitting}
              style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#22c55e', color: '#fff', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}>
              {submitting ? 'Đang tạo...' : 'Tạo hợp đồng'}
            </button>
          </form>
        </section>
      )}

      <section>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
            <div style={{ width: 32, height: 32, border: '3px solid rgba(74,222,128,0.15)', borderTopColor: '#4ade80', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }}></div>
            <p>Đang tải...</p>
          </div>
        ) : contracts.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
            <p>Chưa có hợp đồng nào.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {contracts.map((c) => {
              const colors = statusColors[c.status] || statusColors.PENDING
              return (
                <article key={c.contractId} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Hợp đồng #{c.contractId}</h4>
                      <p style={{ margin: '4px 0', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                        {c.farmName || `Nông trại #${c.farmId}`} ↔ {c.retailerName || `Nhà bán lẻ #${c.retailerId}`}
                      </p>
                    </div>
                    <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: colors.bg, color: colors.color }}>
                      {c.status}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
                    {c.productScope && <span>Sản phẩm: {c.productScope}</span>}
                    {c.agreedPriceRule && <span>Giá: {c.agreedPriceRule}</span>}
                    <span>Hiệu lực: {formatDate(c.validFrom)} - {formatDate(c.validTo)}</span>
                  </div>
                  {c.notes && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 8px', fontStyle: 'italic' }}>{c.notes}</p>}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <small style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>Tạo: {formatDateTime(c.createdAt)}</small>
                    {c.signedAt && <small style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>Ký: {formatDateTime(c.signedAt)}</small>}
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                      {c.status === 'PENDING' && isRetailer && (
                        <>
                          <button onClick={() => handleReview(c.contractId, 'ACTIVE')}
                            style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: '#22c55e', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            Phê duyệt
                          </button>
                          <button onClick={() => handleReview(c.contractId, 'REJECTED')}
                            style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            Từ chối
                          </button>
                        </>
                      )}
                      {c.status === 'PENDING' && isFarm && (
                        <button onClick={() => handleCancel(c.contractId)}
                          style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          Hủy
                        </button>
                      )}
                      {(c.status === 'ACTIVE') && (isFarm || isRetailer) && (
                        <button onClick={() => handleCancel(c.contractId)}
                          style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer' }}>
                          Chấm dứt
                        </button>
                      )}
                      {isAdmin && (
                        <>
                          {c.status === 'PENDING' && (
                            <button onClick={() => handleReview(c.contractId, 'ACTIVE')}
                              style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: '#22c55e', color: '#fff', fontSize: 12, cursor: 'pointer' }}>
                              Duyệt
                            </button>
                          )}
                          <button onClick={() => handleCancel(c.contractId)}
                            style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontSize: 12, cursor: 'pointer' }}>
                            Hủy
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
