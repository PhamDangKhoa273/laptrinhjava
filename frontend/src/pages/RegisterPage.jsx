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
  role: ROLES.GUEST,
  notes: '',
}

const roleOptions = [
  { value: ROLES.GUEST, label: 'Guest' },
  { value: ROLES.FARM, label: 'Farm (frontend placeholder)' },
  { value: ROLES.RETAILER, label: 'Retailer (frontend placeholder)' },
]

export function RegisterPage() {
  const navigate = useNavigate()
  const { register, getPostLoginPath } = useAuth()
  const [form, setForm] = useState(initialState)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const canSubmit = useMemo(() => Object.keys(validateRegisterForm(form)).length === 0, [form])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
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
      const user = await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        password: form.password,
      })
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
        <p>
          This registration form is aligned with the current backend scope. Role-specific business profiles
          can be completed later after login.
        </p>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="grid-two">
          <TextInput label="Full name" name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} required />
          <TextInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} required />
        </div>

        <div className="grid-two">
          <TextInput label="Phone number" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} error={errors.phoneNumber} placeholder="0901234567" />
          <SelectField label="Planned role" name="role" value={form.role} onChange={handleChange} options={roleOptions} error={errors.role} />
        </div>

        <div className="grid-two">
          <TextInput 
            label="Password" 
            name="password" 
            type={showPassword ? 'text' : 'password'} 
            value={form.password} 
            onChange={handleChange} 
            error={errors.password} 
            required 
          />
          <TextInput 
            label="Confirm password" 
            name="confirmPassword" 
            type={showPassword ? 'text' : 'password'} 
            value={form.confirmPassword} 
            onChange={handleChange} 
            error={errors.confirmPassword} 
            required 
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', marginTop: '-0.5rem' }}>
          <input 
            type="checkbox" 
            id="show-pass" 
            checked={showPassword} 
            onChange={() => setShowPassword(!showPassword)} 
          />
          <label htmlFor="show-pass" style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>Show password</label>
        </div>

        <TextAreaField
          label="Notes"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Optional note for later profile completion"
          error={errors.notes}
        />

        {apiError ? <div className="alert alert-error">{apiError}</div> : null}

        <Button type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</Button>
      </form>

      <p className="muted-text">
        Already registered? <Link to="/login">Login here</Link>
      </p>
    </div>
  )
}
