import { useEffect, useState } from 'react'
import { Button } from '../components/Button.jsx'
import { TextInput } from '../components/TextInput.jsx'
import { createRetailer, getMyRetailer, updateRetailer } from '../services/businessService'
import { getErrorMessage } from '../utils/helpers'

const initialForm = {
  retailerCode: '',
  retailerName: '',
  businessLicenseNo: '',
  address: '',
  status: 'ACTIVE',
}

export function RetailerWorkspacePage() {
  const [retailer, setRetailer] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function loadRetailer() {
      try {
        const data = await getMyRetailer()
        setRetailer(data)
        setForm({
          retailerCode: data.retailerCode || '',
          retailerName: data.retailerName || '',
          businessLicenseNo: data.businessLicenseNo || '',
          address: data.address || '',
          status: data.status || 'ACTIVE',
        })
      } catch (err) {
        setError(getErrorMessage(err, 'Retailer profile has not been created yet.'))
      } finally {
        setLoading(false)
      }
    }

    loadRetailer()
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (saving) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        retailerCode: form.retailerCode.trim(),
        retailerName: form.retailerName.trim(),
        businessLicenseNo: form.businessLicenseNo.trim(),
        address: form.address.trim(),
        status: form.status.trim(),
      }

      const result = retailer
        ? await updateRetailer(retailer.retailerId, {
          retailerName: payload.retailerName,
          businessLicenseNo: payload.businessLicenseNo,
          address: payload.address,
          status: payload.status,
        })
        : await createRetailer(payload)

      setRetailer(result)
      setForm({
        retailerCode: result.retailerCode || payload.retailerCode,
        retailerName: result.retailerName || '',
        businessLicenseNo: result.businessLicenseNo || '',
        address: result.address || '',
        status: result.status || 'ACTIVE',
      })
      setSuccess(retailer ? 'Retailer profile updated successfully.' : 'Retailer profile created successfully.')
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to save retailer profile.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Retailer workspace</p>
          <h2>Retailer business profile</h2>
          <p>Create and maintain the retailer profile connected directly to backend TV2 APIs.</p>
        </div>
      </div>

      <form className="form-grid glass-card" onSubmit={handleSubmit}>
        <div className="grid-two">
          <TextInput label="Retailer code" name="retailerCode" value={form.retailerCode} onChange={handleChange} required disabled={Boolean(retailer)} />
          <TextInput label="Retailer name" name="retailerName" value={form.retailerName} onChange={handleChange} required />
        </div>

        <div className="grid-two">
          <TextInput label="Business license" name="businessLicenseNo" value={form.businessLicenseNo} onChange={handleChange} required />
          <TextInput label="Status" name="status" value={form.status} onChange={handleChange} />
        </div>

        <TextInput label="Address" name="address" value={form.address} onChange={handleChange} required />

        {loading ? <div className="alert">Checking retailer profile...</div> : null}
        {error ? <div className="alert alert-error">{error}</div> : null}
        {success ? <div className="alert alert-success">{success}</div> : null}

        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : retailer ? 'Update retailer profile' : 'Create retailer profile'}</Button>
      </form>
    </section>
  )
}
