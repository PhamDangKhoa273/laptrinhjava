import { useEffect, useState } from 'react'
import '../retailer-workspace.css'
import { getFarmContracts, getRetailerContracts, createContract, reviewContract, cancelContract } from '../services/contractService'
import { getMyFarm, getMyRetailer, getAllFarms } from '../services/businessService'
import { getRetailers } from '../services/adminService'
import { getStoredUser } from '../utils/storage'
import { getPrimaryRole, getErrorMessage } from '../utils/helpers'
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
  PENDING: { bg: 'rgba(245,158,11,0.15)', color: '#b45309' },
  ACTIVE: { bg: 'rgba(34,197,94,0.15)', color: '#15803d' },
  REJECTED: { bg: 'rgba(239,68,68,0.15)', color: '#b91c1c' },
  CANCELLED: { bg: 'rgba(148,163,184,0.15)', color: '#475569' },
}

function statusLabel(status) {
  const labels = {
    PENDING: 'Chờ duyệt',
    ACTIVE: 'Đang hiệu lực',
    REJECTED: 'Đã từ chối',
    CANCELLED: 'Đã hủy',
  }
  return labels[String(status || '').toUpperCase()] || status || 'Chờ duyệt'
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
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const storedUser = getStoredUser()
    setUserRole(getPrimaryRole(storedUser))
  }, [])

  useEffect(() => {
    if (!userRole) return
    async function init() {
      try {
        if (userRole === ROLES.FARM) {
          const farm = await getMyFarm()
          const farmId = farm?.farmId || farm?.id
          if (farmId) {
            setProfileId(farmId)
            setForm((prev) => ({ ...prev, farmId: String(farmId) }))
          }
        } else if (userRole === ROLES.RETAILER) {
          const retailer = await getMyRetailer()
          const retailerId = retailer?.retailerId || retailer?.id
          if (retailerId) setProfileId(retailerId)
        }
      } catch (err) {
        setError(getErrorMessage(err, 'Không thể tải hồ sơ hợp đồng.'))
        setLoading(false)
      }
    }
    init()
  }, [userRole])

  async function loadData() {
    if (!userRole) {
      setLoading(false)
      return
    }
    if (userRole !== ROLES.ADMIN && !profileId) {
      setLoading(false)
      setContracts([])
      return
    }
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
      setError(getErrorMessage(err, 'Không thể tải danh sách hợp đồng.'))
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
      setError('Vui lòng chọn nhà bán lẻ.')
      return
    }
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      await createContract({
        farmId: Number(form.farmId),
        retailerId: Number(form.retailerId),
        validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : null,
        validTo: form.validTo ? new Date(form.validTo).toISOString() : null,
        productScope: form.productScope.trim() || null,
        agreedPriceRule: form.agreedPriceRule.trim() || null,
        notes: form.notes.trim() || null,
      })
      setSuccess('Tạo hợp đồng thành công.')
      setForm((prev) => ({ ...prev, retailerId: '', validFrom: '', validTo: '', productScope: '', agreedPriceRule: '', notes: '' }))
      setShowCreate(false)
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Tạo hợp đồng thất bại.'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReview(contractId, status) {
    setError('')
    setSuccess('')
    try {
      await reviewContract(contractId, status)
      setSuccess(`Hợp đồng đã được ${status === 'ACTIVE' ? 'phê duyệt' : 'từ chối'}.`)
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Thao tác thất bại.'))
    }
  }

  async function handleCancel(contractId) {
    setError('')
    setSuccess('')
    try {
      await cancelContract(contractId)
      setSuccess('Hợp đồng đã bị hủy.')
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Hủy hợp đồng thất bại.'))
    }
  }

  const isFarm = userRole === ROLES.FARM
  const isRetailer = userRole === ROLES.RETAILER
  const isAdmin = userRole === ROLES.ADMIN

  return (
    <div className="retailer-contracts-page bicap-contracts-page">
      <div className="retailer-contracts-head">
        <div>
          <h2>Quản lý hợp đồng</h2>
          <p>
            {isFarm ? 'Hợp đồng cung cấp với nhà bán lẻ' : isRetailer ? 'Hợp đồng hợp tác với nông trại' : 'Quản lý hợp đồng giữa nông trại và nhà bán lẻ'}
          </p>
        </div>
        {isFarm && (
          <button onClick={() => { setShowCreate(!showCreate); setError(''); setSuccess('') }}
            className={showCreate ? 'retailer-contracts-button ghost' : 'retailer-contracts-button'}>
            {showCreate ? 'Hủy' : '+ Tạo hợp đồng'}
          </button>
        )}
      </div>

      {error && <div className="retailer-contracts-alert error">{error}</div>}
      {success && <div className="retailer-contracts-alert success">{success}</div>}

      {showCreate && isFarm && (
        <section className="retailer-contracts-form-card">
          <h3>Tạo hợp đồng mới</h3>
          <form className="bicap-contract-form" onSubmit={handleCreate}>
            <div className="retailer-contracts-form-grid">
              <label>
                Nhà bán lẻ *
                <select name="retailerId" value={form.retailerId} onChange={handleChange} required>
                  <option value="">-- Chọn nhà bán lẻ --</option>
                  {allRetailers.map((r) => (
                    <option key={r.retailerId || r.id} value={r.retailerId || r.id}>{r.retailerName || r.name || r.businessName}</option>
                  ))}
                </select>
              </label>
              <label>
                Nông trại
                <input value={form.farmId} disabled />
              </label>
            </div>
            <div className="retailer-contracts-form-grid">
              <label>
                Hiệu lực từ
                <input type="date" name="validFrom" value={form.validFrom} onChange={handleChange} />
              </label>
              <label>
                Hiệu lực đến
                <input type="date" name="validTo" value={form.validTo} onChange={handleChange} />
              </label>
            </div>
            <input name="productScope" value={form.productScope} onChange={handleChange} placeholder="Phạm vi sản phẩm, ví dụ: cà phê, tiêu, điều" />
            <input name="agreedPriceRule" value={form.agreedPriceRule} onChange={handleChange} placeholder="Thỏa thuận giá" />
            <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Ghi chú" rows={3} />
            <button type="submit" disabled={submitting} className="retailer-contracts-button">
              {submitting ? 'Đang tạo...' : 'Tạo hợp đồng'}
            </button>
          </form>
        </section>
      )}

      <section>
        {loading ? (
          <div className="retailer-contracts-loading">
            <div></div>
            <p>Đang tải...</p>
          </div>
        ) : contracts.length === 0 ? (
          <div className="retailer-contracts-empty">
            <h3>Chưa có hợp đồng</h3>
            <p>Backend chưa trả về hợp đồng cho hồ sơ hiện tại.</p>
          </div>
        ) : (
          <div className="retailer-contracts-list">
            {contracts.map((c) => {
              const colors = statusColors[c.status] || statusColors.PENDING
              return (
                <article key={c.contractId} className="retailer-contract-card">
                  <div className="retailer-contract-card-head">
                    <div>
                      <h4>Hợp đồng #{c.contractId}</h4>
                      <p>{c.farmName || `Nông trại #${c.farmId}`} - {c.retailerName || `Nhà bán lẻ #${c.retailerId}`}</p>
                    </div>
                    <span style={{ background: colors.bg, color: colors.color }}>
                      {statusLabel(c.status)}
                    </span>
                  </div>
                  <div className="retailer-contract-meta">
                    {c.productScope && <span>Sản phẩm: {c.productScope}</span>}
                    {c.agreedPriceRule && <span>Giá: {c.agreedPriceRule}</span>}
                    <span>Hiệu lực: {formatDate(c.validFrom)} - {formatDate(c.validTo)}</span>
                  </div>
                  {c.notes && <p className="retailer-contract-note">{c.notes}</p>}
                  <div className="retailer-contract-footer">
                    <small>Tạo: {formatDateTime(c.createdAt)}</small>
                    {c.signedAt && <small>Ký: {formatDateTime(c.signedAt)}</small>}
                    <div>
                      {c.status === 'PENDING' && isRetailer && (
                        <>
                          <button onClick={() => handleReview(c.contractId, 'ACTIVE')} className="retailer-contracts-button compact">Phê duyệt</button>
                          <button onClick={() => handleReview(c.contractId, 'REJECTED')} className="retailer-contracts-button danger compact">Từ chối</button>
                        </>
                      )}
                      {c.status === 'PENDING' && isFarm && (
                        <button onClick={() => handleCancel(c.contractId)} className="retailer-contracts-button danger compact">Hủy</button>
                      )}
                      {c.status === 'ACTIVE' && (isFarm || isRetailer) && (
                        <button onClick={() => handleCancel(c.contractId)} className="retailer-contracts-button ghost compact">Chấm dứt</button>
                      )}
                      {isAdmin && (
                        <>
                          {c.status === 'PENDING' && (
                            <button onClick={() => handleReview(c.contractId, 'ACTIVE')} className="retailer-contracts-button compact">Duyệt</button>
                          )}
                          <button onClick={() => handleCancel(c.contractId)} className="retailer-contracts-button danger compact">Hủy</button>
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
