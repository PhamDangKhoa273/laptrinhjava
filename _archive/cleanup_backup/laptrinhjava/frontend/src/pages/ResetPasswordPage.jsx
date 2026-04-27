import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '../components/Button.jsx'
import { TextInput } from '../components/TextInput.jsx'
import { resetPassword } from '../services/authService'
import { getErrorMessage, mapBackendValidationErrors } from '../utils/helpers'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [form, setForm] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const canSubmit = useMemo(() => {
    return form.newPassword && form.confirmPassword && form.newPassword === form.confirmPassword
  }, [form])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (loading) return
    
    if (form.newPassword !== form.confirmPassword) {
      setErrors({ confirmPassword: 'Mật khẩu xác nhận không khớp.' })
      return
    }

    if (!token) {
      setError('Token không hợp lệ hoặc đã thiếu. Vui lòng yêu cầu lại link khôi phục.')
      return
    }

    setError('')
    setMessage('')
    setErrors({})
    setLoading(true)

    try {
      const resp = await resetPassword({ 
        token, 
        newPassword: form.newPassword 
      })
      setMessage(resp || 'Mật khẩu của bạn đã được cập nhật thành công.')
    } catch (err) {
      const fieldErrors = mapBackendValidationErrors(err)
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors)
      }
      setError(getErrorMessage(err, 'Đổi mật khẩu thất bại. Token có thể đã hết hạn.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <div className="card-header auth-form-header">
        <p className="eyebrow">Portal UTH</p>
        <h2>Đặt lại mật khẩu</h2>
        <p>Mật khẩu mới nên đủ mạnh, dễ nhớ với bạn nhưng khó đoán với người khác.</p>
      </div>

      {message ? (
        <div className="alert alert-success">
          {message}
          <div style={{ marginTop: '1rem' }}>
            <Link to="/login" className="btn btn-primary">Go to Login</Link>
          </div>
        </div>
      ) : (
        <form className="form-grid" onSubmit={handleSubmit}>
          {!token && <div className="alert alert-error">Token khôi phục không hợp lệ hoặc đã bị thiếu.</div>}
          
          <TextInput 
            label="Mật khẩu mới" 
            name="newPassword" 
            type={showPassword ? 'text' : 'password'} 
            value={form.newPassword} 
            onChange={handleChange} 
            placeholder="Min 8 chars, 1 Upper, 1 Lower, 1 Number" 
            error={errors.newPassword} 
            required 
          />
          
          <TextInput 
            label="Xác nhận mật khẩu" 
            name="confirmPassword" 
            type={showPassword ? 'text' : 'password'} 
            value={form.confirmPassword} 
            onChange={handleChange} 
            placeholder="Repeat your new password" 
            error={errors.confirmPassword} 
            required 
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <input 
              type="checkbox" 
              id="show-pass" 
              checked={showPassword} 
              onChange={() => setShowPassword(!showPassword)} 
            />
            <label htmlFor="show-pass" className="auth-link">Hiện mật khẩu</label>
          </div>

          {error ? <div className="alert alert-error">{error}</div> : null}

          <Button type="submit" disabled={!canSubmit || loading || !token} className="auth-submit-button">
            {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </Button>

          <p className="muted-text auth-footer-text">
            Nhớ lại rồi? <Link to="/login" className="auth-link">Quay lại đăng nhập</Link>
          </p>
        </form>
      )}
    </div>
  )
}
