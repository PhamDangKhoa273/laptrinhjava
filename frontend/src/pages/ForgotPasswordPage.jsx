import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../services/authService'
import { getErrorMessage, mapBackendValidationErrors } from '../utils/helpers'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const canSubmit = Boolean(email.trim()) && !loading

  async function handleSubmit(event) {
    event.preventDefault()
    if (!canSubmit) return
    setError(''); setSuccess(''); setErrors({}); setLoading(true)
    try {
      await forgotPassword({ email: email.trim() })
      setSuccess('Nếu email này có tài khoản trên BICAP, hướng dẫn đặt lại mật khẩu đã được gửi.')
    } catch (err) {
      const fieldErrors = mapBackendValidationErrors(err)
      if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors)
      setError(getErrorMessage(err, 'Không thể gửi yêu cầu đặt lại mật khẩu.'))
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-center-bg">
      <div className="auth-glass-card">
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 className="auth-title" style={{ color: 'var(--proto-primary)', fontSize: 24 }}><Link to="/marketplace">BICAP</Link></h1>
          <h2 className="auth-title">Quên mật khẩu</h2>
          <p className="auth-sub" style={{ marginBottom: 0 }}>Nhập email tài khoản để nhận hướng dẫn đặt lại mật khẩu an toàn.</p>
        </div>
        {error ? <div className="alert alert-error"><span className="material-symbols-outlined fill">error</span>{error}</div> : null}
        {success ? <div className="alert alert-success"><span className="material-symbols-outlined fill">check_circle</span>{success}</div> : null}
        <form className="auth-grid" onSubmit={handleSubmit} style={{ marginTop: error || success ? 24 : 0 }}>
          <div className="auth-field"><label htmlFor="forgot-email">Email</label><div style={{ position: 'relative' }}><span className="material-symbols-outlined" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--proto-outline)' }}>mail</span><input id="forgot-email" name="email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setErrors({}) }} placeholder="ten@email.com" required style={{ paddingLeft: 48 }} /></div>{errors.email ? <small className="field-error">{errors.email}</small> : null}</div>
          <button className="auth-submit-button" type="submit" disabled={!canSubmit}>{loading ? 'Đang gửi...' : <>Gửi hướng dẫn đặt lại <span className="material-symbols-outlined">arrow_forward</span></>}</button>
        </form>
        <div style={{ marginTop: 42, paddingTop: 22, borderTop: '1px solid var(--proto-surface-variant)', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}><Link className="auth-link" to="/login"><span className="material-symbols-outlined">arrow_back</span>Quay lại đăng nhập</Link><span style={{ color: 'var(--proto-surface-variant)' }}>|</span><Link className="auth-link" to="/marketplace"><span className="material-symbols-outlined">home</span>Về trang chủ</Link></div>
      </div>
    </div>
  )
}
