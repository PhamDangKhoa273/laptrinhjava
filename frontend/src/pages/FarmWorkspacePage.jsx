import { useEffect, useState } from 'react'
import { Button } from '../components/Button.jsx'
import { TextAreaField } from '../components/TextAreaField.jsx'
import { TextInput } from '../components/TextInput.jsx'
import { createFarm, getMyFarm, updateFarm } from '../services/businessService'
import { getErrorMessage } from '../utils/helpers'

const initialForm = {
  farmCode: '',
  farmName: '',
  businessLicenseNo: '',
  address: '',
  province: '',
  description: '',
}

export function FarmWorkspacePage() {
  const [farm, setFarm] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function loadFarm() {
      try {
        const data = await getMyFarm()
        setFarm(data)
        setForm({
          farmCode: data.farmCode || '',
          farmName: data.farmName || '',
          businessLicenseNo: data.businessLicenseNo || '',
          address: data.address || '',
          province: data.province || '',
          description: data.description || '',
        })
      } catch (err) {
        setError(getErrorMessage(err, 'Farm profile has not been created yet.'))
      } finally {
        setLoading(false)
      }
    }

    loadFarm()
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
        farmCode: form.farmCode.trim(),
        farmName: form.farmName.trim(),
        businessLicenseNo: form.businessLicenseNo.trim(),
        address: form.address.trim(),
        province: form.province.trim(),
        description: form.description.trim(),
      }

      const result = farm
        ? await updateFarm(farm.farmId, {
          farmName: payload.farmName,
          businessLicenseNo: payload.businessLicenseNo,
          address: payload.address,
          province: payload.province,
          description: payload.description,
        })
        : await createFarm(payload)

      setFarm(result)
      setForm({
        farmCode: result.farmCode || payload.farmCode,
        farmName: result.farmName || '',
        businessLicenseNo: result.businessLicenseNo || '',
        address: result.address || '',
        province: result.province || '',
        description: result.description || '',
      })
      setSuccess(farm ? 'Farm profile updated successfully.' : 'Farm profile created successfully.')
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to save farm profile.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Farm workspace</p>
          <h2>Farm business profile</h2>
          <p>Create and maintain the farm profile connected directly to backend TV2 APIs.</p>
        </div>
      </div>

      <div className="content-grid">
        <article className="glass-card">
          <h3>Current farm status</h3>
          <ul className="feature-list">
            <li>Approval: {farm?.approvalStatus || 'Not created yet'}</li>
            <li>Certification: {farm?.certificationStatus || 'Not created yet'}</li>
            <li>Owner: {farm?.ownerFullName || 'Current FARM account'}</li>
          </ul>
        </article>
      </div>

      <form className="form-grid glass-card" onSubmit={handleSubmit}>
        <div className="grid-two">
          <TextInput label="Farm code" name="farmCode" value={form.farmCode} onChange={handleChange} required disabled={Boolean(farm)} />
          <TextInput label="Farm name" name="farmName" value={form.farmName} onChange={handleChange} required />
        </div>

        <div className="grid-two">
          <TextInput label="Business license" name="businessLicenseNo" value={form.businessLicenseNo} onChange={handleChange} required />
          <TextInput label="Province" name="province" value={form.province} onChange={handleChange} />
        </div>

        <TextInput label="Address" name="address" value={form.address} onChange={handleChange} />
        <TextAreaField label="Description" name="description" value={form.description} onChange={handleChange} />

        {loading ? <div className="alert">Checking farm profile...</div> : null}
        {error ? <div className="alert alert-error">{error}</div> : null}
        {success ? <div className="alert alert-success">{success}</div> : null}

        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : farm ? 'Update farm profile' : 'Create farm profile'}</Button>
      </form>
    </section>
  )
}
