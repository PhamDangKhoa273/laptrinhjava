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
        <p className="eyebrow">Portal UTH</p>
        <h2>Khôi phục mật khẩu</h2>
        <p>Nhập email tài khoản để nhận liên kết đặt lại mật khẩu.</p>
      </div>

      {message ? (
        <div className="alert alert-success">
          {message}
          <div style={{ marginTop: '1rem' }}>
            <Link to="/login" className="auth-link">Quay lại đăng nhập</Link>
          </div>
        </div>
      ) : (
        <form className="form-grid" onSubmit={handleSubmit}>
          <TextInput 
            label="Email" 
            name="email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="you@example.com" 
            error={errors.email} 
            required 
          />

          {error ? <div className="alert alert-error">{error}</div> : null}

          <Button type="submit" disabled={!email || loading} className="auth-submit-button">
            {loading ? 'Đang gửi liên kết...' : 'Gửi liên kết khôi phục'}
          </Button>

          <p className="muted-text auth-footer-text">
            Nhớ mật khẩu rồi? <Link to="/login" className="auth-link">Đăng nhập</Link>
          </p>
        </form>
      )}
    </div>
  )
}
