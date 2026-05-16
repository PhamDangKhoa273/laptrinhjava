import { useEffect, useMemo, useState } from 'react'
import '../shipping-workspace.css'
import {
  createBatch,
  generateBatchQr,
  getBatches,
  getPhase3FarmContext,
  getSeasons,
  updateBatch,
} from '../services/phase3Service'
import { getErrorMessage } from '../utils/helpers'

const initialBatchForm = {
  seasonId: '',
  productId: '',
  batchCode: '',
  harvestDate: '',
  quantity: '',
  availableQuantity: '',
  qualityGrade: '',
  expiryDate: '',
  batchStatus: 'CREATED',
}

const batchStatuses = ['CREATED', 'READY', 'STORED', 'SOLD_OUT']
const qualityGrades = ['A', 'B', 'C']

function Icon({ children, fill = false }) {
  return <span className={`material-symbols-outlined${fill ? ' fill' : ''}`}>{children}</span>
}

function Status({ value }) {
  const key = String(value || 'CREATED').toLowerCase()
  return <span className={`ship-status ${key}`}>{value || 'CREATED'}</span>
}

function PageChrome({ eyebrow, title, subtitle, actions, children, error, success, loading }) {
  return (
    <>
      <div className="ship-page-head">
        <div><p>{eyebrow}</p><h2>{title}</h2><span>{subtitle}</span></div>
        <div className="ship-actions">{actions}</div>
      </div>
      {loading ? <div className="ship-alert neutral">Đang đồng bộ dữ liệu lô hàng...</div> : null}
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

function buildBatchCode(seasonCode) {
  const stamp = new Date().toISOString().slice(11, 19).replaceAll(':', '')
  return `${seasonCode || 'BATCH'}-${stamp}`
}

function fmtDate(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleDateString('vi-VN')
}

export function FarmBatchesPage() {
  const [farmContext, setFarmContext] = useState(null)
  const [seasons, setSeasons] = useState([])
  const [batches, setBatches] = useState([])
  const [batchForm, setBatchForm] = useState(initialBatchForm)
  const [editingBatchId, setEditingBatchId] = useState('')
  const [generatingQrId, setGeneratingQrId] = useState('')
  const [qrResult, setQrResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function load() {
    setLoading(true)
    try {
      const [ctx, seasonList, batchList] = await Promise.all([getPhase3FarmContext(), getSeasons(), getBatches()])
      setFarmContext(ctx.farm)
      setSeasons(Array.isArray(seasonList) ? seasonList : [])
      setBatches(Array.isArray(batchList) ? batchList : [])
      setError('')
    } catch (err) {
      setError(getErrorMessage(err, 'Không tải được dữ liệu lô hàng.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const stats = useMemo(() => ({
    total: batches.length,
    ready: batches.filter((b) => b.batchStatus === 'READY').length,
    sold: batches.filter((b) => b.batchStatus === 'SOLD_OUT').length,
    available: batches.reduce((sum, b) => sum + Number(b.availableQuantity || 0), 0),
  }), [batches])

  function handleChange(e) {
    const { name, value } = e.target
    setBatchForm((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'seasonId') {
        const season = seasons.find((s) => String(s.id) === String(value))
        if (season) {
          next.productId = String(season.productId || '')
          if (!editingBatchId) next.batchCode = buildBatchCode(season.seasonCode)
        }
      }
      return next
    })
  }

  function fillBatch(batch) {
    setEditingBatchId(String(batch.batchId))
    setBatchForm({
      seasonId: String(batch.seasonId || ''),
      productId: String(batch.productId || ''),
      batchCode: batch.batchCode || '',
      harvestDate: batch.harvestDate ? String(batch.harvestDate).slice(0, 10) : '',
      quantity: String(batch.quantity ?? ''),
      availableQuantity: String(batch.availableQuantity ?? ''),
      qualityGrade: batch.qualityGrade || '',
      expiryDate: batch.expiryDate ? String(batch.expiryDate).slice(0, 10) : '',
      batchStatus: batch.batchStatus || 'CREATED',
    })
  }

  function resetForm() {
    setEditingBatchId('')
    setBatchForm(initialBatchForm)
  }

  async function submit(e) {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess('')
    try {
      const payload = {
        seasonId: Number(batchForm.seasonId),
        productId: Number(batchForm.productId),
        batchCode: batchForm.batchCode.trim(),
        harvestDate: batchForm.harvestDate || null,
        quantity: Number(batchForm.quantity),
        availableQuantity: Number(batchForm.availableQuantity),
        qualityGrade: batchForm.qualityGrade || null,
        expiryDate: batchForm.expiryDate || null,
        batchStatus: batchForm.batchStatus,
      }
      if (editingBatchId) {
        await updateBatch(editingBatchId, payload)
        setSuccess('Đã cập nhật lô hàng.')
      } else {
        await createBatch(payload)
        setSuccess('Đã tạo lô hàng.')
      }
      resetForm()
      await load()
    } catch (err) {
      setError(getErrorMessage(err, 'Không lưu được lô hàng.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleGenerateQr(batchId) {
    setGeneratingQrId(String(batchId))
    setError(''); setSuccess('')
    try {
      const qr = await generateBatchQr(batchId)
      setQrResult(qr)
      setSuccess('Đã sinh QR cho batch.')
    } catch (err) {
      setError(getErrorMessage(err, 'Không tạo được QR.'))
    } finally {
      setGeneratingQrId('')
    }
  }

  return (
    <section className="shipping-prototype-shell">
      <PageChrome
        eyebrow="Farm / Sản xuất / Lô hàng"
        title="Quản lý Lô hàng"
        subtitle={`${stats.total} lô • ${stats.ready} sẵn sàng • ${stats.sold} đã bán hết • ${stats.available.toLocaleString('vi-VN')} kg còn lại`}
        loading={loading}
        error={error}
        success={success}
        actions={<button type="button" onClick={load}><Icon>refresh</Icon>Làm mới</button>}
      >
        <section className="ship-metrics four">
          <Metric icon="inventory_2" label="Tổng số lô" value={stats.total} />
          <Metric icon="check_circle" label="Sẵn sàng bán" value={stats.ready} tone="blue" />
          <Metric icon="store" label="Đã bán hết" value={stats.sold} tone="amber" />
          <Metric icon="scale" label="Khả dụng (kg)" value={stats.available.toLocaleString('vi-VN')} />
        </section>

        <div className="drivers-grid">
          <article className="ship-card">
            <div className="ship-card-head">
              <h3><Icon>list</Icon>Danh sách lô hàng</h3>
            </div>
            {seasons.length === 0 ? (
              <p>Chưa có mùa vụ. <a href="/farm/seasons">Tạo mùa vụ</a> trước.</p>
            ) : batches.length === 0 ? (
              <p>Chưa có lô hàng nào. Tạo lô từ form bên cạnh.</p>
            ) : (
              <div className="ship-table-wrap">
                <table className="ship-table">
                  <thead>
                    <tr><th>Mã batch</th><th>Mùa vụ</th><th>Thu hoạch</th><th>Số lượng (Còn / Tổng)</th><th>Grade</th><th>Trạng thái</th><th></th></tr>
                  </thead>
                  <tbody>
                    {batches.map((b) => (
                      <tr key={b.batchId}>
                        <td><b>{b.batchCode}</b><small>ID #{b.batchId}</small></td>
                        <td>#{b.seasonId}</td>
                        <td>{fmtDate(b.harvestDate)}</td>
                        <td>{Number(b.availableQuantity || 0).toLocaleString('vi-VN')}/{Number(b.quantity || 0).toLocaleString('vi-VN')}</td>
                        <td>{b.qualityGrade || '-'}</td>
                        <td><Status value={b.batchStatus} /></td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button type="button" onClick={() => fillBatch(b)} title="Sửa"><Icon>edit</Icon></button>
                            <button type="button" onClick={() => handleGenerateQr(b.batchId)} disabled={generatingQrId === String(b.batchId)} title="Generate QR"><Icon>qr_code_2</Icon></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>

          <article className="ship-card">
            <h3><Icon>{editingBatchId ? 'edit' : 'add_circle'}</Icon>{editingBatchId ? 'Cập nhật lô hàng' : 'Tạo lô hàng'}</h3>
            <form className="ship-form" onSubmit={submit}>
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ship-muted)' }}>Mùa vụ <em style={{ color: 'var(--ship-danger)' }}>*</em></span>
                <select name="seasonId" value={batchForm.seasonId} onChange={handleChange} required disabled={Boolean(editingBatchId)}>
                  <option value="">— Chọn mùa vụ —</option>
                  {seasons.map((s) => <option key={s.id} value={s.id}>{s.seasonCode} - {s.productName || `#${s.productId}`}</option>)}
                </select>
                <small style={{ color: 'var(--ship-muted)' }}>Lô hàng được tạo từ mùa vụ đã thu hoạch.</small>
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ship-muted)' }}>Mã lô hàng <em style={{ color: 'var(--ship-danger)' }}>*</em></span>
                <input name="batchCode" placeholder="VD: BATCH-202605-001" value={batchForm.batchCode} onChange={handleChange} required disabled={Boolean(editingBatchId)} />
                <small style={{ color: 'var(--ship-muted)' }}>Mã định danh duy nhất cho lô hàng.</small>
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ship-muted)' }}>Ngày thu hoạch <em style={{ color: 'var(--ship-danger)' }}>*</em></span>
                <input type="date" name="harvestDate" value={batchForm.harvestDate} onChange={handleChange} required />
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ship-muted)' }}>Hạn sử dụng <em style={{ color: 'var(--ship-danger)' }}>*</em></span>
                <input type="date" name="expiryDate" value={batchForm.expiryDate} onChange={handleChange} required />
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ship-muted)' }}>Tổng sản lượng (kg) <em style={{ color: 'var(--ship-danger)' }}>*</em></span>
                <input type="number" min="0" step="0.01" name="quantity" placeholder="VD: 1000" value={batchForm.quantity} onChange={handleChange} required />
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ship-muted)' }}>Số lượng còn lại (kg) <em style={{ color: 'var(--ship-danger)' }}>*</em></span>
                <input type="number" min="0" step="0.01" name="availableQuantity" placeholder="Số kg sẵn sàng bán" value={batchForm.availableQuantity} onChange={handleChange} required />
                <small style={{ color: 'var(--ship-muted)' }}>Khi mới tạo thường bằng tổng sản lượng. Giảm dần khi bán.</small>
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ship-muted)' }}>Phân loại chất lượng</span>
                <select name="qualityGrade" value={batchForm.qualityGrade} onChange={handleChange}>
                  <option value="">— Tùy chọn —</option>
                  {qualityGrades.map((g) => <option key={g} value={g}>Hạng {g}</option>)}
                </select>
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ship-muted)' }}>Trạng thái</span>
                <select name="batchStatus" value={batchForm.batchStatus} onChange={handleChange}>
                  <option value="CREATED">Mới tạo</option>
                  <option value="READY">Sẵn sàng bán</option>
                  <option value="STORED">Đang lưu kho</option>
                  <option value="SOLD_OUT">Đã bán hết</option>
                </select>
              </label>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : (editingBatchId ? 'Cập nhật lô hàng' : 'Tạo lô hàng')}</button>
                {editingBatchId ? <button type="button" onClick={resetForm}>Huỷ</button> : null}
              </div>
            </form>
          </article>
        </div>

        {qrResult ? (
          <article className="ship-card" style={{ marginTop: 24 }}>
            <div className="ship-card-head">
              <h3><Icon>qr_code_2</Icon>QR vừa tạo</h3>
              <span className="success-pill">Batch #{qrResult.batchId}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 24, alignItems: 'start' }}>
              {qrResult.qrImageBase64 ? <img src={`data:image/png;base64,${qrResult.qrImageBase64}`} alt="QR" style={{ width: 180, height: 180 }} /> : null}
              <div>
                <p><strong>Serial:</strong> {qrResult.serialNo || 'N/A'}</p>
                <p><strong>Trace code:</strong> {qrResult.traceCode || 'N/A'}</p>
                <p><strong>Public URL:</strong> {qrResult.qrUrl ? <a href={qrResult.qrUrl} target="_blank" rel="noreferrer">{qrResult.qrUrl}</a> : 'N/A'}</p>
                <button type="button" onClick={() => setQrResult(null)}>Đóng</button>
              </div>
            </div>
          </article>
        ) : null}
      </PageChrome>
    </section>
  )
}
