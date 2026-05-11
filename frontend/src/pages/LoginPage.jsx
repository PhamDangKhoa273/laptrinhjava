import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getErrorMessage, mapBackendValidationErrors } from '../utils/helpers'

const initialState = { email: '', password: '' }

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState(initialState)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const canSubmit = useMemo(() => Boolean(form.email && form.password), [form])

  function handleChange(event) { const { name, value } = event.target; setForm((prev) => ({ ...prev, [name]: value })); setErrors((prev) => ({ ...prev, [name]: '' })) }
  async function handleSubmit(event) {
    event.preventDefault(); if (loading) return; setError(''); setErrors({}); setLoading(true)
    try { await login({ email: form.email.trim(), password: form.password }); if (typeof window !== 'undefined') { window.location.replace('/auth/landing'); return } navigate('/auth/landing', { replace: true }) }
    catch (err) { const fieldErrors = mapBackendValidationErrors(err); if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors); setError(getErrorMessage(err, 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.')) }
    finally { setLoading(false) }
  }

  return (
    <div className="auth-proto-shell auth-split">
      <section className="auth-form-pane">
        <div className="auth-form-card">
          <Link className="auth-link" to="/marketplace"><span className="material-symbols-outlined">arrow_back</span> Quay lại trang chủ</Link>
          <h1 className="auth-brand">BICAP</h1>
          <h2 className="auth-title" style={{ fontSize: 24 }}>Đăng nhập hệ thống BICAP</h2>
          <p className="auth-sub">Truy cập vào nền tảng nông nghiệp tích hợp blockchain.</p>
          <form className="auth-grid" onSubmit={handleSubmit}>
            <div className="auth-field"><label htmlFor="login-email">Email / Tên đăng nhập</label><div style={{ position: 'relative' }}><span className="material-symbols-outlined" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--proto-outline)' }}>person</span><input id="login-email" name="email" type="text" value={form.email} onChange={handleChange} placeholder="nhap@email.com" required style={{ paddingLeft: 48 }} /></div>{errors.email ? <small className="field-error">{errors.email}</small> : null}</div>
            <div className="auth-field"><label htmlFor="login-password">Mật khẩu</label><div style={{ position: 'relative' }}><span className="material-symbols-outlined" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--proto-outline)' }}>lock</span><input id="login-password" name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="••••••••" required style={{ paddingLeft: 48, paddingRight: 48 }} /><button type="button" onClick={() => setShowPassword((value) => !value)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 0, background: 'transparent', color: 'var(--proto-outline)', cursor: 'pointer' }}><span className="material-symbols-outlined">{showPassword ? 'visibility' : 'visibility_off'}</span></button></div>{errors.password ? <small className="field-error">{errors.password}</small> : null}</div>
            <div className="auth-actions-row"><label style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--proto-on-surface-variant)', fontWeight: 600 }}><input type="checkbox" /> Ghi nhớ đăng nhập</label><Link className="auth-link-danger" to="/forgot-password">Quên mật khẩu?</Link></div>
            {error ? <div className="alert alert-error">{error}</div> : null}
            <button className="auth-submit-button" type="submit" disabled={!canSubmit || loading}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
          </form>
          <p className="auth-sub" style={{ marginTop: 24, textAlign: 'center' }}>Chưa có tài khoản? <Link className="auth-link-danger" to="/register">Đăng ký ngay</Link></p>
        </div>
      </section>
      <aside className="auth-image-pane">
        <div className="auth-image-content">
          <h3 className="auth-title" style={{ color: '#fff', fontSize: 36, whiteSpace: 'nowrap' }}>Hệ sinh thái Nông nghiệp Số</h3>
          <p style={{ color: 'rgba(255,255,255,.82)', fontSize: 18, lineHeight: 1.6 }}>Kết nối nông dân, nhà phân phối và người tiêu dùng thông qua nền tảng minh bạch và an toàn.</p>
          {[[ 'qr_code_scanner', 'Truy xuất nguồn gốc', 'Theo dõi chi tiết vòng đời sản phẩm từ nông trại đến bàn ăn.' ], [ 'lan', 'Blockchain minh bạch', 'Dữ liệu được xác thực và không thể thay đổi.' ], [ 'local_shipping', 'Quản lý vận chuyển', 'Tối ưu hóa logistics và giám sát bảo quản.' ], [ 'storefront', 'Marketplace nông sản', 'Giao dịch trực tiếp, cắt giảm trung gian.' ]].map(([icon, title, desc]) => <div className="auth-feature" key={title}><span className="material-symbols-outlined filled" style={{ color: 'var(--proto-primary-fixed)', fontSize: 28 }}>{icon}</span><div><strong>{title}</strong><p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,.72)' }}>{desc}</p></div></div>)}
        </div>
      </aside>
    </div>
  )
}
