import { useEffect, useState } from 'react'
import { Button } from '../components/Button.jsx'
import { TextAreaField } from '../components/TextAreaField.jsx'
import { TextInput } from '../components/TextInput.jsx'
import { uploadShippingProofFile } from '../services/mediaService.js'
import { getOrdersV2, uploadShippingProof } from '../services/workflowService.js'
import { getErrorMessage } from '../utils/helpers.js'

const initialForm = {
  imageUrl: '',
  note: '',
}

export function ShippingProofPage() {
  const [orders, setOrders] = useState([])
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [proofFile, setProofFile] = useState(null)

  async function loadOrders() {
    try {
      setLoading(true)
      const data = await getOrdersV2()
      setOrders(Array.isArray(data) ? data : [])
      if (!selectedOrderId && Array.isArray(data) && data.length > 0) {
        setSelectedOrderId(String(data[0].orderId))
      }
      setError('')
    } catch (err) {
      setError(getErrorMessage(err, 'Không t?i được danh sách order cho logistics.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!selectedOrderId) return
    try {
      setSaving(true)
      let imageUrl = form.imageUrl.trim()
      if (proofFile) {
        const uploaded = await uploadShippingProofFile(Number(selectedOrderId), proofFile)
        imageUrl = uploaded.fileUrl
      }
      await uploadShippingProof(Number(selectedOrderId), {
        imageUrl,
        note: form.note.trim(),
      })
      setSuccess('Đã c?p nh?t proof v?n chuy?n.')
      setForm(initialForm)
      setProofFile(null)
      await loadOrders()
    } catch (err) {
      setError(getErrorMessage(err, 'Không c?p nh?t được proof v?n chuy?n.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Shipping proof</p>
          <h2>C?p nh?t b?ng ch?ng giao v?n</h2>
          <p>Dành cho shipping manager ho?c driver ghi nh?n proof trong flow đơn hàng.</p>
        </div>
      </div>

      {loading ? <div className="glass-card">Đang t?i đơn hàng...</div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <div className="content-grid">
        <article className="glass-card">
          <h3>Ch?n order</h3>
          <div className="form-grid">
            {orders.map((order) => (
              <div key={order.orderId} className="business-card">
                <div>
                  <strong>Order #{order.orderId}</strong>
                  <p>Status: {order.status}</p>
                  <p>Shipping proof: {order.shippingProofImageUrl || 'Chưa có'}</p>
                </div>
                <Button variant="secondary" onClick={() => setSelectedOrderId(String(order.orderId))}>Ch?n</Button>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-card">
          <h3>G?i proof</h3>
          <form className="form-grid" onSubmit={handleSubmit}>
            <TextInput label="Image URL" name="imageUrl" value={form.imageUrl} onChange={handleChange} required />
            <label className="form-field">
              <span className="form-label">Ho?c ch?n file proof</span>
              <input className="form-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setProofFile(event.target.files?.[0] || null)} />
            </label>
            <TextAreaField label="Ghi chú" name="note" value={form.note} onChange={handleChange} />
            <Button type="submit" disabled={saving || !selectedOrderId}>{saving ? 'Đang lưu...' : 'C?p nh?t proof'}</Button>
          </form>
        </article>
      </div>
    </section>
  )
}
