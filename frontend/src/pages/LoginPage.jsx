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

  const canSubmit = useMemo(() => form.email && form.password, [form])

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
      setError(getErrorMessage(err, 'Login failed. Please check your credentials.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <div className="card-header auth-form-header">
        <p className="eyebrow">Secure sign-in</p>
        <h2>Login to the BICAP platform</h2>
        <p>Access the right dashboard and protected resources based on your assigned role.</p>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <TextInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" error={errors.email} required />
        <TextInput 
          label="Password" 
          name="password" 
          type={showPassword ? 'text' : 'password'} 
          value={form.password} 
          onChange={handleChange} 
          placeholder="Enter your password" 
          error={errors.password} 
          required 
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '-0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <input 
              type="checkbox" 
              id="show-pass" 
              checked={showPassword} 
              onChange={() => setShowPassword(!showPassword)} 
            />
            <label htmlFor="show-pass" style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>Show password</label>
          </div>
          <Link to="/forgot-password" style={{ fontSize: '0.875rem', color: 'var(--primary-color)' }}>Forgot password?</Link>
        </div>

        {error ? <div className="alert alert-error">{error}</div> : null}

        <Button type="submit" disabled={!canSubmit || loading}>{loading ? 'Signing in...' : 'Login securely'}</Button>
      </form>

      <p className="muted-text">
        Need an account? <Link to="/register">Create one here</Link>
      </p>
    </div>
  )
}
