import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button.jsx'
import { RoleBadge } from '../components/RoleBadge.jsx'
import { TextAreaField } from '../components/TextAreaField.jsx'
import { TextInput } from '../components/TextInput.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getErrorMessage, getPrimaryRole, mapBackendValidationErrors } from '../utils/helpers'
import { ROLES } from '../utils/constants'
import { validateProfileForm } from '../utils/validation'

function buildInitialForm(user) {
  const profile = user?.profile || {}
  return {
    fullName: user?.fullName || user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || profile.address || '',
    businessLicense: user?.businessLicense || profile.businessLicense || '',
    farmName: profile.farmName || '',
    farmAddress: profile.farmAddress || '',
    certificationInfo: profile.certificationInfo || '',
    companyName: profile.companyName || '',
    businessAddress: profile.businessAddress || '',
    driverLicenseNumber: profile.driverLicenseNumber || '',
    vehicleCode: profile.vehicleCode || '',
    notes: profile.notes || '',
    approvalStatus: profile.approvalStatus || 'PENDING',
  }
}

export function ProfilePage() {
  const { user, refreshProfile, updateProfile } = useAuth()
  const role = getPrimaryRole(user)
  const [form, setForm] = useState(buildInitialForm(user))
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    setForm(buildInitialForm(user))
  }, [user])

  const roleSummary = useMemo(() => {
    if (role === ROLES.FARM) return 'Farm owner profile and farm business information'
    if (role === ROLES.RETAILER) return 'Retailer owner profile and business information'
    if (role === ROLES.SHIPPING_MANAGER) return 'Logistics coordinator profile and company information'
    if (role === ROLES.DRIVER) return 'Driver profile and vehicle assignment information'
    return 'Basic account profile'
  }, [role])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  async function handleRefresh() {
    if (refreshing) return

    setError('')
    setSuccess('')
    setRefreshing(true)
    try {
      await refreshProfile()
      setSuccess('Profile refreshed from backend.')
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to refresh profile.'))
    } finally {
      setRefreshing(false)
    }
  }

  function renderRoleFields() {
    if (role === ROLES.FARM) {
      return (
        <div className="grid-two">
          <TextInput label="Farm name" name="farmName" value={form.farmName} onChange={handleChange} error={errors.farmName} required />
          <TextInput label="Farm address" name="farmAddress" value={form.farmAddress} onChange={handleChange} error={errors.farmAddress} required />
          <TextInput label="Business license" name="businessLicense" value={form.businessLicense} onChange={handleChange} error={errors.businessLicense} required />
          <TextInput label="Approval status" name="approvalStatus" value={form.approvalStatus} onChange={handleChange} disabled />
          <TextAreaField label="Certification information" name="certificationInfo" value={form.certificationInfo} onChange={handleChange} error={errors.certificationInfo} />
        </div>
      )
    }

    if (role === ROLES.RETAILER || role === ROLES.SHIPPING_MANAGER) {
      return (
        <div className="grid-two">
          <TextInput label="Company name" name="companyName" value={form.companyName} onChange={handleChange} error={errors.companyName} required />
          <TextInput label="Business address" name="businessAddress" value={form.businessAddress} onChange={handleChange} error={errors.businessAddress} required={role === ROLES.RETAILER} />
          <TextInput label="Business license" name="businessLicense" value={form.businessLicense} onChange={handleChange} error={errors.businessLicense} required={role === ROLES.RETAILER} />
          <TextAreaField label="Notes" name="notes" value={form.notes} onChange={handleChange} error={errors.notes} />
        </div>
      )
    }

    if (role === ROLES.DRIVER) {
      return (
        <div className="grid-two">
          <TextInput label="Driver license number" name="driverLicenseNumber" value={form.driverLicenseNumber} onChange={handleChange} error={errors.driverLicenseNumber} required />
          <TextInput label="Vehicle code" name="vehicleCode" value={form.vehicleCode} onChange={handleChange} error={errors.vehicleCode} />
          <TextAreaField label="Notes" name="notes" value={form.notes} onChange={handleChange} error={errors.notes} />
        </div>
      )
    }

    return <TextAreaField label="Notes" name="notes" value={form.notes} onChange={handleChange} error={errors.notes} />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (loading) return

    const nextErrors = validateProfileForm(form, role)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    setError('')
    setSuccess('')

    const trimmedPayload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim(),
      address: form.address.trim(),
      businessLicense: form.businessLicense.trim(),
      companyName: form.companyName.trim(),
      businessAddress: form.businessAddress.trim(),
      farmName: form.farmName.trim(),
      farmAddress: form.farmAddress.trim(),
      certificationInfo: form.certificationInfo.trim(),
      driverLicenseNumber: form.driverLicenseNumber.trim(),
      vehicleCode: form.vehicleCode.trim(),
      notes: form.notes.trim(),
      approvalStatus: form.approvalStatus,
    }

    try {
      await updateProfile({
        fullName: trimmedPayload.fullName,
        email: trimmedPayload.email,
        phoneNumber: trimmedPayload.phoneNumber,
        address: trimmedPayload.address,
        businessLicense: trimmedPayload.businessLicense,
        profile: {
          farmName: trimmedPayload.farmName,
          farmAddress: trimmedPayload.farmAddress,
          certificationInfo: trimmedPayload.certificationInfo,
          companyName: trimmedPayload.companyName,
          businessAddress: trimmedPayload.businessAddress,
          businessLicense: trimmedPayload.businessLicense,
          driverLicenseNumber: trimmedPayload.driverLicenseNumber,
          vehicleCode: trimmedPayload.vehicleCode,
          notes: trimmedPayload.notes,
          approvalStatus: trimmedPayload.approvalStatus,
        },
      })
      setSuccess('Profile updated successfully.')
    } catch (err) {
      const fieldErrors = mapBackendValidationErrors(err)
      if (Object.keys(fieldErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...fieldErrors }))
      }
      setError(getErrorMessage(err, 'Unable to update profile.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Profile center</p>
          <h2>Manage account and role-based business profile</h2>
          <p>{roleSummary}</p>
        </div>
        <div className="section-actions">
          <RoleBadge role={role} />
          <Button variant="secondary" onClick={handleRefresh} disabled={refreshing}>{refreshing ? 'Refreshing...' : 'Refresh profile'}</Button>
        </div>
      </div>

      <div className="profile-summary-grid">
        <article className="glass-card">
          <span className="summary-label">Current email</span>
          <strong>{user?.email || 'Not available'}</strong>
        </article>
        <article className="glass-card">
          <span className="summary-label">Assigned roles</span>
          <strong>{Array.isArray(user?.roles) ? user.roles.map((item) => item.name || item).join(', ') : role}</strong>
        </article>
        <article className="glass-card">
          <span className="summary-label">Approval status</span>
          <strong>{form.approvalStatus}</strong>
        </article>
      </div>

      <form className="form-grid glass-card" onSubmit={handleSubmit}>
        <div className="grid-two">
          <TextInput label="Full name" name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} required />
          <TextInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} required />
        </div>

        <div className="grid-two">
          <TextInput label="Phone number" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} error={errors.phoneNumber} />
          <TextInput label="Address" name="address" value={form.address} onChange={handleChange} error={errors.address} />
        </div>

        <div className="role-section compact">
          <div>
            <h3>Business and role-specific information</h3>
            <p>Fields below adapt to the current role and reflect Phase 2 business profile requirements.</p>
          </div>
          <div className="form-grid">{renderRoleFields()}</div>
        </div>

        {error ? <div className="alert alert-error">{error}</div> : null}
        {success ? <div className="alert alert-success">{success}</div> : null}

        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save profile changes'}</Button>
      </form>
    </section>
  )
}
