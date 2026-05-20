import { useEffect, useState } from 'react'
import { createBatch, generateBatchQr, getBatchQr, getBatches, getPhase3FarmContext, getSeasons } from '../services/phase3Service'
import { getErrorMessage } from '../utils/helpers'

const initialForm = {
  seasonId: '',
  productId: '',
  batchCode: '',
  harvestDate: '',
  quantity: '',
  availableQuantity: '',
  qualityGrade: '',
  expiryDate: '',
}

const qualityGrades = ['A', 'B', 'C']

function formatDate(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleDateString('vi-VN')
}

export default function BatchPage() {
  const [batches, setBatches] = useState([])
  const [seasons, setSeasons] = useState([])
  const [farmContext, setFarmContext] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [qrData, setQrData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function init() {
      try {
        const context = await getPhase3FarmContext()
        setFarmContext(context)
        if (context.products?.length) {
          setForm((prev) => ({ ...prev, productId: String(context.products[0].productId) }))
        }
      } catch { }
    }
    init()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [batchData, seasonData] = await Promise.all([getBatches(), getSeasons()])
      setBatches(Array.isArray(batchData) ? batchData : [])
      setSeasons(Array.isArray(seasonData) ? seasonData : [])
      setError('')
    } catch (err) {
      setError(getErrorMessage(err, 'Không th? t?i d? li?u'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'seasonId') {
        const season = seasons.find((s) => String(s.id) === value)
        if (season) next.productId = String(season.productId || prev.productId)
      }
      return next
    })
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.seasonId || !form.batchCode.trim() || !form.harvestDate || !form.quantity || !form.availableQuantity || !form.qualityGrade || !form.expiryDate) {
      setError('Vui l?ng điền đầy đủ thông tin b?t bu?c')
      return
    }
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      await createBatch({
        seasonId: Number(form.seasonId),
        productId: Number(form.productId),
        batchCode: form.batchCode.trim(),
        harvestDate: form.harvestDate,
        quantity: Number(form.quantity),
        availableQuantity: Number(form.availableQuantity),
        qualityGrade: form.qualityGrade,
        expiryDate: form.expiryDate,
      })
      setSuccess('T?o lô hàng thành công')
      setForm(initialForm)
      setQrData(null)
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'T?o lô hàng th?t b?i'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGenerateQr(batchId) {
    try {
      const result = await generateBatchQr(batchId)
      setQrData(result)
      setSuccess('M? QR đã được t?o')
    } catch (err) {
      setError(getErrorMessage(err, 'T?o QR th?t b?i'))
    }
  }

  async function handleViewQr(batchId) {
    try {
      const result = await getBatchQr(batchId)
      setQrData(result)
    } catch (err) {
      setError(getErrorMessage(err, 'Không th? t?i m? QR'))
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <h2>Qu?n l? lô hàng (Batch)</h2>

      {error && <div style={{ color: '#ef4444', marginBottom: 12 }}>{error}</div>}
      {success && <div style={{ color: '#22c55e', marginBottom: 12 }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <section style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 }}>
          <h3>T?o lô hàng m?i</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gap: 10 }}>
            <select name="seasonId" value={form.seasonId} onChange={handleChange} required
              style={{ padding: 8, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0' }}>
              <option value="">-- Ch?n mùa v? --</option>
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>{s.seasonCode || s.seasonName} ({s.seasonStatus})</option>
              ))}
            </select>

            <select name="productId" value={form.productId} onChange={handleChange} required
              style={{ padding: 8, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0' }}>
              <option value="">-- Ch?n s?n ph?m --</option>
              {(farmContext?.products || []).map((p) => (
                <option key={p.productId} value={p.productId}>{p.productName || p.name}</option>
              ))}
            </select>

            <input name="batchCode" value={form.batchCode} onChange={handleChange} placeholder="M? lô hàng *" required
              style={{ padding: 8, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                Ngày thu ho?ch *
                <input type="date" name="harvestDate" value={form.harvestDate} onChange={handleChange} required
                  style={{ padding: 8, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                Ngày h?t h?n *
                <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} required
                  style={{ padding: 8, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0' }} />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input name="quantity" type="number" value={form.quantity} onChange={handleChange} placeholder="S? lượng *" required min="1"
                style={{ padding: 8, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0' }} />
              <input name="availableQuantity" type="number" value={form.availableQuantity} onChange={handleChange} placeholder="SL kh? d?ng *" required min="1"
                style={{ padding: 8, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0' }} />
            </div>

            <select name="qualityGrade" value={form.qualityGrade} onChange={handleChange} required
              style={{ padding: 8, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0' }}>
              <option value="">-- Ch?n ch?t lượng --</option>
              {qualityGrades.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>

            <button type="submit" disabled={submitting}
              style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#22c55e', color: '#fff', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}>
              {submitting ? 'Đang t?o...' : 'T?o lô hàng'}
            </button>
          </form>
        </section>

        {qrData && (
          <section style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <h3>M? QR lô hàng</h3>
            {qrData.qrImageBase64 ? (
              <img src={`data:image/png;base64,${qrData.qrImageBase64}`} alt="QR Code" style={{ maxWidth: 200, margin: '12px 0' }} />
            ) : qrData.qrCodeData ? (
              <div style={{ padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 8, wordBreak: 'break-all', fontSize: 12 }}>
                <p style={{ color: '#94a3b8', marginBottom: 8 }}>QR Data:</p>
                <code>{qrData.qrCodeData}</code>
              </div>
            ) : (
              <p style={{ color: '#94a3b8' }}>Không có d? li?u QR</p>
            )}
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>Trace URL: {qrData.publicTraceUrl || qrData.traceUrl || 'N/A'}</p>
          </section>
        )}
      </div>

      <section>
        <h3>Danh sách lô hàng</h3>
        {loading ? (
          <p style={{ color: '#94a3b8' }}>Đang t?i...</p>
        ) : batches.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>Chưa có lô hàng nào.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 13, textAlign: 'left' }}>
                <th style={{ padding: '8px 4px' }}>M? lô</th>
                <th style={{ padding: '8px 4px' }}>Ch?t lượng</th>
                <th style={{ padding: '8px 4px' }}>S? lượng</th>
                <th style={{ padding: '8px 4px' }}>Tr?ng thái</th>
                <th style={{ padding: '8px 4px' }}>Ngày thu ho?ch</th>
                <th style={{ padding: '8px 4px' }}>QR</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr key={b.batchId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 14 }}>
                  <td style={{ padding: '10px 4px' }}>{b.batchCode}</td>
                  <td style={{ padding: '10px 4px' }}>{b.qualityGrade || '-'}</td>
                  <td style={{ padding: '10px 4px' }}>{b.quantity} (c?n: {b.availableQuantity})</td>
                  <td style={{ padding: '10px 4px' }}>{b.batchStatus}</td>
                  <td style={{ padding: '10px 4px' }}>{formatDate(b.harvestDate)}</td>
                  <td style={{ padding: '10px 4px' }}>
                    {b.qrCodeGenerated
                      ? <button onClick={() => handleViewQr(b.batchId)} style={{ background: 'none', border: '1px solid #3b82f6', color: '#3b82f6', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 12 }}>Xem QR</button>
                      : <button onClick={() => handleGenerateQr(b.batchId)} style={{ background: 'none', border: '1px solid #22c55e', color: '#22c55e', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 12 }}>T?o QR</button>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
