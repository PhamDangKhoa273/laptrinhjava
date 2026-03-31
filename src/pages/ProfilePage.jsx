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
  return {
    fullName: user?.fullName || user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || user?.phone || '',
    avatarUrl: user?.avatarUrl || '',
    notes: '',
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
    if (role === ROLES.FARM) return 'Farm role is assigned, but business profile modules are not yet connected to the current backend.'
    if (role === ROLES.RETAILER) return 'Retailer role is assigned, but extended business profile modules are still placeholder-only.'
    if (role === ROLES.SHIPPING_MANAGER) return 'Shipping manager role is available for navigation, waiting for deeper backend modules.'
    if (role === ROLES.DRIVER) return 'Driver role is available for navigation, waiting for profile and logistics tables.'
    return 'Basic account profile connected to the current backend user model.'
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

  async function handleSubmit(event) {
    event.preventDefault()
    if (loading) return

    const nextErrors = validateProfileForm(form, role)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await updateProfile({
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        avatarUrl: form.avatarUrl.trim(),
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
          <h2>Manage account profile</h2>
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
          <span className="summary-label">Account status</span>
          <strong>{user?.status || 'ACTIVE'}</strong>
        </article>
      </div>

      <form className="form-grid glass-card" onSubmit={handleSubmit}>
        <div className="grid-two">
          <TextInput label="Full name" name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} required />
          <TextInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} required disabled />
        </div>

        <div className="grid-two">
          <TextInput label="Phone number" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} error={errors.phoneNumber} />
          <TextInput label="Avatar URL" name="avatarUrl" value={form.avatarUrl} onChange={handleChange} error={errors.avatarUrl} />
        </div>

        <TextAreaField
          label="Notes"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          error={errors.notes}
          placeholder="Optional personal note. Not sent to backend in current Phase 2 core scope."
          disabled
        />

        {error ? <div className="alert alert-error">{error}</div> : null}
        {success ? <div className="alert alert-success">{success}</div> : null}

        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save profile changes'}</Button>
      </form>
    </section>
  )
}
