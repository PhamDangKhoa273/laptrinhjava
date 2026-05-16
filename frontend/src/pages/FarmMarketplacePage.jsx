import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button.jsx'
import { TextAreaField } from '../components/TextAreaField.jsx'
import { TextInput } from '../components/TextInput.jsx'
import {
  createListing,
  getMyListings,
  updateListing,
} from '../services/listingService.js'
import {
  getMyListingRegistrations,
  submitListingRegistration,
} from '../services/workflowService.js'
import { getBatches } from '../services/phase3Service.js'
import { getErrorMessage } from '../utils/helpers.js'

const initialListingForm = {
  batchId: '',
  title: '',
  description: '',
  price: '',
  quantityAvailable: '',
  unit: 'kg',
  imageUrl: '',
}

function money(value) {
  if (value === null || value === undefined || value === '') return 'N/A'
  const number = Number(value)
  if (Number.isNaN(number)) return String(value)
  return number.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
}

function statusTone(status = '') {
  const value = String(status).toUpperCase()
  if (value.includes('ACTIVE') || value.includes('APPROVED') || value.includes('PUBLISH')) return 'green'
  if (value.includes('PENDING') || value.includes('DRAFT')) return 'orange'
  if (value.includes('REJECTED') || value.includes('ARCHIV') || value.includes('SOLD')) return 'red'
  return 'gray'
}

function unwrapList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.content)) return data.content
  return []
}

export function FarmMarketplacePage() {
  const [listings, setListings] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [batches, setBatches] = useState([])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [registeringId, setRegisteringId] = useState(null)
  const [registrationNote, setRegistrationNote] = useState('')

  const [form, setForm] = useState(initialListingForm)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadAll() {
    setLoading(true)
    try {
      const [listingData, registrationData, batchData] = await Promise.all([
        getMyListings().catch(() => []),
        getMyListingRegistrations().catch(() => []),
        getBatches().catch(() => []),
      ])
      setListings(unwrapList(listingData))
      setRegistrations(unwrapList(registrationData))
      setBatches(unwrapList(batchData))
      setError('')
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải dữ liệu marketplace.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  function resetForm() {
    setForm(initialListingForm)
    setEditingId(null)
  }

  function startEdit(listing) {
    setEditingId(listing.listingId)
    setForm({
      batchId: listing.batchId || '',
      title: listing.title || '',
      description: listing.description || '',
      price: listing.price ?? '',
      quantityAvailable: listing.quantityAvailable ?? '',
      unit: listing.unit || 'kg',
      imageUrl: listing.imageUrl || '',
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!form.batchId) {
      setError('Vui lòng chọn batch để đăng listing.')
      return
    }

    const payload = {
      batchId: Number(form.batchId),
      title: form.title.trim(),
      description: form.description.trim(),
      price: form.price === '' ? null : Number(form.price),
      quantityAvailable: form.quantityAvailable === '' ? null : Number(form.quantityAvailable),
      unit: form.unit.trim() || 'kg',
      imageUrl: form.imageUrl.trim() || null,
    }

    setSubmitting(true)
    try {
      if (editingId) {
        const { batchId: _ignored, ...updatePayload } = payload
        await updateListing(editingId, updatePayload)
        setSuccess(`Đã cập nhật listing #${editingId}.`)
      } else {
        const created = await createListing(payload)
        setSuccess(`Đã tạo listing #${created?.listingId || ''} ở trạng thái nháp. Submit để admin duyệt.`)
      }
      resetForm()
      await loadAll()
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể lưu listing.'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSubmitRegistration(listing) {
    if (!listing?.listingId) return
    if (!registrationNote.trim()) {
      setError('Vui lòng nhập ghi chú khi submit listing duyệt.')
      return
    }
    setError('')
    setSuccess('')
    setRegisteringId(listing.listingId)
    try {
      await submitListingRegistration(listing.listingId, { note: registrationNote.trim() })
      setSuccess(`Đã gửi yêu cầu duyệt cho listing #${listing.listingId}.`)
      setRegistrationNote('')
      await loadAll()
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể gửi yêu cầu duyệt.'))
    } finally {
      setRegisteringId(null)
    }
  }

  const totalActive = useMemo(() => listings.filter((l) => String(l.status).toUpperCase() === 'ACTIVE').length, [listings])
  const totalDraft = useMemo(() => listings.filter((l) => String(l.status).toUpperCase() === 'DRAFT').length, [listings])
  const pendingApproval = useMemo(() => registrations.filter((r) => String(r.status).toUpperCase() === 'PENDING').length, [registrations])

  const editableBatches = batches.filter((b) => b?.batchId)

  return (
    <section className="farm-content farm-proto-content">
      <div className="farm-page-head">
        <div>
          <h2>Quản lý đăng sàn</h2>
          <p>Tạo listing từ batch đã có, theo dõi trạng thái duyệt và quản lý sản phẩm trên sàn BICAP.</p>
        </div>
        <button className="farm-btn ghost" onClick={loadAll} disabled={loading}>
          <span className="material-symbols-outlined">refresh</span>
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {error ? <div className="driver-alert error" style={{ margin: '12px 0' }}>{error}</div> : null}
      {success ? <div className="driver-alert success" style={{ margin: '12px 0' }}>{success}</div> : null}

      <div className="farm-kpi-grid four">
        <article className="farm-stat-card green"><span>Tổng listing</span><strong>{listings.length}</strong></article>
        <article className="farm-stat-card blue"><span>Đang bán</span><strong>{totalActive}</strong></article>
        <article className="farm-stat-card brown"><span>Bản nháp</span><strong>{totalDraft}</strong></article>
        <article className="farm-stat-card red"><span>Đang chờ duyệt</span><strong>{pendingApproval}</strong></article>
      </div>

      <article className="farm-glass-card farm-form-card" style={{ marginTop: 16 }}>
        <h3>
          <span className="material-symbols-outlined">{editingId ? 'edit' : 'add_circle'}</span>
          {editingId ? `Cập nhật listing #${editingId}` : 'Tạo listing mới từ batch'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="strict-info-grid">
            <label className="strict-readonly-field editable">
              <span>Batch (bắt buộc)</span>
              <select
                value={form.batchId}
                onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                disabled={Boolean(editingId)}
                required
              >
                <option value="">— Chọn batch —</option>
                {editableBatches.map((b) => (
                  <option key={b.batchId} value={b.batchId}>
                    {b.batchCode || `Batch #${b.batchId}`} — {b.productName || b.product?.productName || 'Sản phẩm'}
                  </option>
                ))}
              </select>
            </label>
            <label className="strict-readonly-field editable">
              <span>Tiêu đề</span>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={255} />
            </label>
            <label className="strict-readonly-field editable">
              <span>Giá bán (VND)</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </label>
            <label className="strict-readonly-field editable">
              <span>Số lượng</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.quantityAvailable}
                onChange={(e) => setForm({ ...form, quantityAvailable: e.target.value })}
                required
              />
            </label>
            <label className="strict-readonly-field editable">
              <span>Đơn vị</span>
              <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="kg / thùng / tấn" />
            </label>
            <label className="strict-readonly-field editable">
              <span>Ảnh sản phẩm (URL)</span>
              <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
            </label>
            <label className="strict-readonly-field editable textarea-field" style={{ gridColumn: '1 / -1' }}>
              <span>Mô tả</span>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Mô tả sản phẩm, chứng nhận, vùng trồng..."
                maxLength={3000}
              />
            </label>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Tạo listing'}
            </Button>
            {editingId ? (
              <Button type="button" onClick={resetForm}>
                Hủy chỉnh sửa
              </Button>
            ) : null}
          </div>
        </form>
      </article>

      <article className="farm-table-card" style={{ marginTop: 16 }}>
        <h3 style={{ padding: '12px 16px 0' }}>Danh sách listing của tôi</h3>
        {loading ? (
          <p style={{ padding: 16 }}>Đang tải...</p>
        ) : listings.length === 0 ? (
          <p style={{ padding: 16 }}>Chưa có listing nào. Tạo listing đầu tiên ở form phía trên.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tiêu đề</th>
                <th>Batch</th>
                <th>Giá</th>
                <th>Tồn</th>
                <th>Trạng thái</th>
                <th>Duyệt</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => {
                const reg = registrations.find((r) => r.listingId === listing.listingId)
                return (
                  <tr key={listing.listingId}>
                    <td>#{listing.listingId}</td>
                    <td>{listing.title || '—'}</td>
                    <td>{listing.batchCode || `#${listing.batchId}`}</td>
                    <td>{money(listing.price)}</td>
                    <td>
                      {listing.quantityAvailable} {listing.unit || ''}
                    </td>
                    <td>
                      <span className={`chain ${statusTone(listing.status)}`}>{listing.status || 'DRAFT'}</span>
                    </td>
                    <td>
                      <span className={`chain ${statusTone(reg?.status || listing.approvalStatus || '')}`}>
                        {reg?.status || listing.approvalStatus || 'CHƯA SUBMIT'}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => startEdit(listing)} title="Chỉnh sửa">
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </article>

      <article className="farm-glass-card farm-form-card" style={{ marginTop: 16 }}>
        <h3>
          <span className="material-symbols-outlined">approval</span>
          Submit listing để admin duyệt
        </h3>
        <p style={{ marginBottom: 12 }}>
          Sau khi tạo listing, gửi kèm ghi chú để admin xét duyệt trước khi listing hiển thị công khai trên sàn.
        </p>
        <label className="strict-readonly-field editable" style={{ display: 'block', marginBottom: 8 }}>
          <span>Ghi chú gửi admin</span>
          <textarea
            rows={2}
            value={registrationNote}
            onChange={(e) => setRegistrationNote(e.target.value)}
            placeholder="Mô tả lý do, chứng nhận đính kèm..."
          />
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {listings
            .filter((l) => String(l.status).toUpperCase() === 'DRAFT' || String(l.approvalStatus || '').toUpperCase() !== 'APPROVED')
            .map((listing) => (
              <Button
                key={listing.listingId}
                type="button"
                onClick={() => handleSubmitRegistration(listing)}
                disabled={registeringId === listing.listingId}
              >
                {registeringId === listing.listingId
                  ? 'Đang gửi...'
                  : `Submit listing #${listing.listingId}`}
              </Button>
            ))}
          {listings.length === 0 ? <span>Chưa có listing nào để submit.</span> : null}
        </div>
      </article>
    </section>
  )
}

export default FarmMarketplacePage
