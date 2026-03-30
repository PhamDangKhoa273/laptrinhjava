import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button.jsx'
import { SelectField } from '../components/SelectField.jsx'
import { TextAreaField } from '../components/TextAreaField.jsx'
import { TextInput } from '../components/TextInput.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { ROLES } from '../utils/constants'
import { getErrorMessage, mapBackendValidationErrors } from '../utils/helpers'
import { validateRegisterForm } from '../utils/validation'

const initialState = {
  fullName: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
  role: ROLES.FARM,
  farmName: '',
  farmAddress: '',
  certificationInfo: '',
  companyName: '',
  businessLicense: '',
  businessAddress: '',
  notes: '',
}

const roleOptions = [
  { value: ROLES.FARM, label: 'Farm' },
  { value: ROLES.RETAILER, label: 'Retailer' },
  { value: ROLES.GUEST, label: 'Guest' },
]

export function RegisterPage() {
  const navigate = useNavigate()
  const { register, getPostLoginPath } = useAuth()
  const [form, setForm] = useState(initialState)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(() => Object.keys(validateRegisterForm(form)).length === 0, [form])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function renderRoleFields() {
    if (form.role === ROLES.FARM) {
      return (
        <>
          <TextInput label="Farm name" name="farmName" value={form.farmName} onChange={handleChange} error={errors.farmName} required />
          <TextInput label="Farm address" name="farmAddress" value={form.farmAddress} onChange={handleChange} error={errors.farmAddress} required />
          <TextInput label="Business license" name="businessLicense" value={form.businessLicense} onChange={handleChange} error={errors.businessLicense} required />
          <TextAreaField label="Certification information" name="certificationInfo" value={form.certificationInfo} onChange={handleChange} placeholder="VietGAP, organic certification, local authority approval..." error={errors.certificationInfo} />
        </>
      )
    }

    if (form.role === ROLES.RETAILER) {
      return (
        <>
          <TextInput label="Retailer company name" name="companyName" value={form.companyName} onChange={handleChange} error={errors.companyName} required />
          <TextInput label="Business address" name="businessAddress" value={form.businessAddress} onChange={handleChange} error={errors.businessAddress} required />
          <TextInput label="Business license" name="businessLicense" value={form.businessLicense} onChange={handleChange} error={errors.businessLicense} required />
        </>
      )
    }

    return (
      <TextAreaField label="Notes" name="notes" value={form.notes} onChange={handleChange} placeholder="Optional onboarding notes" error={errors.notes} />
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (loading) return

    const nextErrors = validateRegisterForm(form)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    setApiError('')
    setLoading(true)

    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        password: form.password,
        role: form.role,
        profile: {
          farmName: form.farmName.trim(),
          farmAddress: form.farmAddress.trim(),
          certificationInfo: form.certificationInfo.trim(),
          companyName: form.companyName.trim(),
          businessLicense: form.businessLicense.trim(),
          businessAddress: form.businessAddress.trim(),
          notes: form.notes.trim(),
        },
      }
      const user = await register(payload)
      navigate(getPostLoginPath(user), { replace: true })
    } catch (err) {
      const fieldErrors = mapBackendValidationErrors(err)
      if (Object.keys(fieldErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...fieldErrors }))
      }
      setApiError(getErrorMessage(err, 'Registration failed. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card auth-card-wide">
      <div className="card-header auth-form-header">
        <p className="eyebrow">BICAP onboarding</p>
        <h2>Create your account</h2>
        <p>Role-aware registration for Farm, Retailer, and Guest users in the BICAP platform.</p>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="grid-two">
          <TextInput label="Full name" name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} required />
          <TextInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} required />
        </div>

        <div className="grid-two">
          <TextInput label="Phone number" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} error={errors.phoneNumber} placeholder="0901234567" />
          <SelectField label="Register as" name="role" value={form.role} onChange={handleChange} options={roleOptions} error={errors.role} />
        </div>

        <div className="grid-two">
          <TextInput label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} required />
          <TextInput label="Confirm password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} required />
        </div>

        <div className="role-section">
          <div>
            <h3>{form.role === ROLES.FARM ? 'Farm information' : form.role === ROLES.RETAILER ? 'Retailer information' : 'Guest information'}</h3>
            <p>Display fields based on the selected role to match the BICAP domain logic.</p>
          </div>
          <div className="form-grid">{renderRoleFields()}</div>
        </div>

        {apiError ? <div className="alert alert-error">{apiError}</div> : null}

        <Button type="submit" disabled={!canSubmit || loading}>{loading ? 'Creating account...' : 'Create account'}</Button>
      </form>

      <p className="muted-text">
        Already registered? <Link to="/login">Login here</Link>
      </p>
    </div>
  )
}
