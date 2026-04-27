import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button.jsx'
import { TextInput } from '../components/TextInput.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getErrorMessage, mapBackendValidationErrors } from '../utils/helpers'

const initialState = {
  email: '',
  password: '',
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, getPostLoginPath } = useAuth()
  const [form, setForm] = useState(initialState)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const canSubmit = useMemo(() => Boolean(form.email && form.password), [form])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (loading) return

    setError('')
    setErrors({})
    setLoading(true)

    try {
      const user = await login({
        email: form.email.trim(),
        password: form.password,
      })
      const fallbackPath = getPostLoginPath(user)
      const nextPath = location.state?.from?.pathname || fallbackPath
      navigate(nextPath, { replace: true })
    } catch (err) {
      const fieldErrors = mapBackendValidationErrors(err)
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors)
      }
      setError(getErrorMessage(err, 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card auth-card-login">
      <div className="card-header auth-form-header auth-form-header-centered">
        <img className="uth-auth-title-logo" src="/uth-logo.png" alt="UTH" />
        <h2>Đăng nhập hệ thống</h2>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <TextInput
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="ten@uth.edu.vn"
          error={errors.email}
          required
        />
        <TextInput
          label="Mật khẩu"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={form.password}
          onChange={handleChange}
          placeholder="Nhập mật khẩu"
          error={errors.password}
          required
        />

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
          <Link to="/forgot-password" className="auth-link auth-link-danger">Quên mật khẩu?</Link>
        </div>

        {error ? <div className="alert alert-error">{error}</div> : null}

        <Button type="submit" disabled={!canSubmit || loading} className="auth-submit-button">
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>

      <p className="muted-text auth-footer-text">
        <span className="auth-text-black">Chưa có tài khoản?</span>{' '}
        <Link to="/register" className="auth-link auth-link-danger">Đăng ký</Link>
      </p>
    </div>
  )
}
