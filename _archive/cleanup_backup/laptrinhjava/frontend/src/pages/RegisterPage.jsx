import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button.jsx'
import { TextAreaField } from '../components/TextAreaField.jsx'
import { TextInput } from '../components/TextInput.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getErrorMessage, mapBackendValidationErrors } from '../utils/helpers'
import { ROLE_LABELS, ROLES } from '../utils/constants'
import { validateRegisterForm } from '../utils/validation'

const initialState = {
  fullName: '',
  email: '',
  phoneNumber: '',
  role: ROLES.GUEST,
  password: '',
  confirmPassword: '',
  notes: '',
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { register, getPostLoginPath } = useAuth()
  const [form, setForm] = useState(initialState)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  
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
        role: form.role,
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
      <div className="card-header auth-form-header auth-form-header-centered">
        <img className="uth-auth-title-logo" src="/uth-logo.png" alt="UTH" />
        <h2>Đăng ký tài khoản</h2>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="grid-two">
          <TextInput label="Họ và tên" name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} required />
          <TextInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} required />
        </div>

        <div className="grid-two">
          <TextInput label="Số điện thoại" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} error={errors.phoneNumber} placeholder="0901234567" />
          <label className="field-group">
            <span className="field-label">Loại tài khoản</span>
            <select name="role" value={form.role} onChange={handleChange} className="form-input" required>
              {[ROLES.GUEST, ROLES.FARM, ROLES.RETAILER].map((role) => (
                <option key={role} value={role}>{ROLE_LABELS[role]}</option>
              ))}
            </select>
            {errors.role ? <span className="field-error">{errors.role}</span> : null}
          </label>
        </div>

        <div className="grid-two">
          <TextInput
            label="Mật khẩu"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            required
          />
          <TextInput
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
          />
        </div>

        <div className="auth-actions-row">
          <label className="auth-checkbox">
            <input
              type="checkbox"
              id="show-pass"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <span className="auth-text-black">Hiện mật khẩu</span>
          </label>
        </div>


        {apiError ? <div className="alert alert-error">{apiError}</div> : null}

        <Button type="submit" disabled={loading} className="auth-submit-button">{loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}</Button>
      </form>

      <p className="muted-text auth-footer-text">
        <span className="auth-text-black">Đã có tài khoản?</span>{' '}
        <Link to="/login" className="auth-link auth-link-danger">Đăng nhập</Link>
      </p>
    </div>
  )
}
