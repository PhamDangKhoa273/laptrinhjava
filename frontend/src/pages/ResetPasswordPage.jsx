import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../services/authService'
import { getErrorMessage, mapBackendValidationErrors } from '../utils/helpers'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const checks = useMemo(() => ({
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    lower: /[a-z]/.test(form.password),
    number: /\d/.test(form.password),
  }), [form.password])
  const strength = Object.values(checks).filter(Boolean).length
  function handleChange(event) { const { name, value } = event.target; setForm((prev) => ({ ...prev, [name]: value })); setErrors((prev) => ({ ...prev, [name]: '' })) }
  async function handleSubmit(event) {
    event.preventDefault(); if (loading) return; setError(''); setSuccess(''); setErrors({})
    if (!token) { setError('Thiếu mã đặt lại mật khẩu. Vui lòng mở lại liên kết trong email.'); return }
    if (form.password !== form.confirmPassword) { setErrors({ confirmPassword: 'Mật khẩu xác nhận không khớp.' }); return }
    setLoading(true)
    try { await resetPassword({ token, newPassword: form.password }); setSuccess('Đặt lại mật khẩu thành công. Bạn có thể đăng nhập ngay bây giờ.') }
    catch (err) { const fieldErrors = mapBackendValidationErrors(err); if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors); setError(getErrorMessage(err, 'Không thể đặt lại mật khẩu.')) }
    finally { setLoading(false) }
  }

  const Requirement = ({ ok, children }) => <li className="public-muted"><span className="material-symbols-outlined fill" style={{ fontSize: 14, color: ok ? 'var(--proto-primary)' : 'var(--proto-outline)' }}>{ok ? 'check_circle' : 'radio_button_unchecked'}</span>{children}</li>

  return (
    <div className="auth-proto-shell auth-split" style={{ gridTemplateColumns: '3fr 2fr' }}>
      <aside className="auth-image-pane" style={{ backgroundImage: "linear-gradient(to top, rgba(26,28,28,.90), rgba(26,28,28,.40), transparent), url('https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1600&q=80')" }}><div className="auth-image-content" style={{ alignSelf: 'end' }}><div className="proto-kicker" style={{ color: 'var(--proto-primary-fixed)', background: 'transparent' }}><span className="material-symbols-outlined fill">verified_user</span> Truy cập bảo mật</div><h2 className="auth-title" style={{ color: '#fff', fontSize: 48 }}>Bảo vệ mùa vụ số của bạn</h2><p style={{ color: 'rgba(243,243,243,.90)', fontSize: 18, lineHeight: 1.6 }}>Đảm bảo quyền truy cập an toàn, minh bạch và đáng tin cậy vào hệ sinh thái nông nghiệp ứng dụng Blockchain.</p></div></aside>
      <section className="auth-form-pane" style={{ background: 'var(--proto-surface)' }}>
        <div className="auth-form-card" style={{ maxWidth: 384 }}>
          <Link className="auth-brand" to="/marketplace" style={{ display: 'block', fontSize: 24 }}>BICAP</Link>
          <h1 className="auth-title">Đặt lại mật khẩu</h1>
          <p className="auth-sub">Tạo mật khẩu mới an toàn để khôi phục quyền truy cập tài khoản.</p>
          {!token ? <div className="alert alert-error" style={{ marginBottom: 18 }}><span className="material-symbols-outlined fill">error</span>Thiếu mã đặt lại mật khẩu. Vui lòng dùng liên kết bảo mật trong email.</div> : null}
          <form className="auth-grid" onSubmit={handleSubmit}>
            <div className="auth-field"><label htmlFor="reset-password">Mật khẩu mới</label><div style={{ position: 'relative' }}><input id="reset-password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Nhập mật khẩu mới" required style={{ paddingRight: 48 }} /><span className="material-symbols-outlined" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--proto-outline)' }}>visibility_off</span></div>{errors.password ? <small className="field-error">{errors.password}</small> : null}</div>
            <div style={{ background: 'var(--proto-surface-low)', border: '1px solid var(--proto-surface-variant)', borderRadius: 8, padding: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span className="proto-filter-sub" style={{ margin: 0 }}>Yêu cầu mật khẩu</span><strong style={{ color: strength >= 4 ? 'var(--proto-primary)' : 'var(--proto-outline)', fontSize: 12 }}>{strength >= 4 ? 'Đạt' : `${strength}/4`}</strong></div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4, height: 6 }}>{[0,1,2,3].map((index) => <span key={index} style={{ borderRadius: 999, background: index < strength ? 'var(--proto-primary)' : 'var(--proto-surface-variant)' }} />)}</div><ul style={{ margin: '12px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 4 }}><Requirement ok={checks.length}>Tối thiểu 8 ký tự</Requirement><Requirement ok={checks.upper}>Có ít nhất một chữ in hoa</Requirement><Requirement ok={checks.lower}>Có ít nhất một chữ thường</Requirement><Requirement ok={checks.number}>Có ít nhất một chữ số</Requirement></ul></div>
            <div className="auth-field"><label htmlFor="reset-confirm">Xác nhận mật khẩu mới</label><input id="reset-confirm" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Nhập lại mật khẩu mới" required />{errors.confirmPassword ? <small className="field-error">{errors.confirmPassword}</small> : null}</div>
            {error ? <div className="alert alert-error">{error}</div> : null}{success ? <div className="alert alert-success">{success}</div> : null}
            <button className="auth-submit-button" type="submit" disabled={loading || !token}>{loading ? 'Đang cập nhật...' : <>Xác nhận <span className="material-symbols-outlined">arrow_forward</span></>}</button>
          </form>
          <div style={{ textAlign: 'center', marginTop: 24, display: 'grid', gap: 12 }}><div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}><Link className="auth-link" to="/login"><span className="material-symbols-outlined">arrow_back</span>Quay lại đăng nhập</Link><span style={{ color: 'var(--proto-outline-variant)' }}>|</span><Link className="auth-link" to="/marketplace"><span className="material-symbols-outlined">home</span>Về trang chủ</Link></div><small style={{ color: 'var(--proto-outline)' }}>© 2026 BICAP Chợ nông sản</small></div>
        </div>
      </section>
    </div>
  )
}
