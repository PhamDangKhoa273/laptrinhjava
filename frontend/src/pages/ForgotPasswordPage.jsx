import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button.jsx'
import { TextInput } from '../components/TextInput.jsx'
import { forgotPassword } from '../services/authService'
import { getErrorMessage, mapBackendValidationErrors } from '../utils/helpers'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (loading) return

    setError('')
    setMessage('')
    setErrors({})
    setLoading(true)

    try {
      const resp = await forgotPassword({ email: email.trim() })
      setMessage(resp || 'Link khôi phục mật khẩu đã được gửi đến email của bạn.')
    } catch (err) {
      const fieldErrors = mapBackendValidationErrors(err)
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors)
      }
      setError(getErrorMessage(err, 'Gửi yêu cầu thất bại. Vui lòng kiểm tra lại email.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <div className="card-header auth-form-header">
        <p className="eyebrow">Account Recovery</p>
        <h2>Forgot your password?</h2>
        <p>Enter your email address and we'll send you a link to reset your password and regain access to your account.</p>
      </div>

      {message ? (
        <div className="alert alert-success">
          {message}
          <div style={{ marginTop: '1rem' }}>
            <Link to="/login" className="btn btn-primary">Back to Login</Link>
          </div>
        </div>
      ) : (
        <form className="form-grid" onSubmit={handleSubmit}>
          <TextInput 
            label="Email Address" 
            name="email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="you@example.com" 
            error={errors.email} 
            required 
          />

          {error ? <div className="alert alert-error">{error}</div> : null}

          <Button type="submit" disabled={!email || loading}>
            {loading ? 'Sending link...' : 'Send reset link'}
          </Button>

          <p className="muted-text">
            Remember your password? <Link to="/login">Sign in here</Link>
          </p>
        </form>
      )}
    </div>
  )
}
