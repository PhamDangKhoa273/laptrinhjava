import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getErrorMessage, mapBackendValidationErrors } from '../utils/helpers'
import { ROLE_LABELS, ROLES } from '../utils/constants'

const initialForm = { email: '', password: '', fullName: '', phone: '', role: ROLES.GUEST }
const roles = [ROLES.GUEST, ROLES.FARM, ROLES.RETAILER, ROLES.SHIPPING_MANAGER]
const roleIcons = { [ROLES.GUEST]: 'person', [ROLES.FARM]: 'agriculture', [ROLES.RETAILER]: 'storefront', [ROLES.SHIPPING_MANAGER]: 'local_shipping' }

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [terms, setTerms] = useState(false)
  const canSubmit = useMemo(() => terms && form.fullName && form.email && form.password && !loading, [terms, form, loading])

  function handleChange(event) { const { name, value } = event.target; setForm((prev) => ({ ...prev, [name]: value })); setErrors((prev) => ({ ...prev, [name]: '' })) }
  function validateForm() {
    const nextErrors = {}
    if (!/^(0|\+84)[0-9]{9,10}$/.test(form.phone || '')) nextErrors.phone = 'Số điện thoại phải bắt đầu bằng 0 hoặc +84 và có 10-11 chữ số.'
    if (!/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(form.password || '')) nextErrors.password = 'Mật khẩu tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và số. Ví dụ: Password123'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }
  async function handleSubmit(event) {
    event.preventDefault(); if (!canSubmit) return; if (!validateForm()) return; setLoading(true); setError(''); setErrors({})
    try { await register(form); navigate('/login', { replace: true }) }
    catch (err) { const fieldErrors = mapBackendValidationErrors(err); if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors); setError(getErrorMessage(err, 'Không thể đăng ký tài khoản. Vui lòng kiểm tra lại mật khẩu, số điện thoại hoặc email đã tồn tại.')) }
    finally { setLoading(false) }
  }

  return (
    <div className="auth-proto-shell auth-split">
      <aside className="auth-image-pane" style={{ backgroundImage: "linear-gradient(135deg,rgba(13,99,27,.88),rgba(0,95,175,.80)), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80')" }}>
        <div className="auth-image-content">
          <h2 className="auth-title" style={{ color: '#fff', fontSize: 36, whiteSpace: 'nowrap' }}>Gia nhập hệ sinh thái BICAP</h2>
          <p style={{ color: 'rgba(255,255,255,.88)', fontSize: 17, lineHeight: 1.55 }}>Tạo tài khoản để sử dụng các chức năng nghiệp vụ phù hợp với vai trò của bạn.</p>
          {[[ 'person', 'Khách hàng', 'Đặt hàng và theo dõi giao dịch sau khi đăng nhập.' ], [ 'agriculture', 'Nông trại', 'Quản lý mùa vụ, lô hàng và listing nông sản.' ], [ 'storefront', 'Nhà bán lẻ', 'Tìm nguồn hàng và tạo đơn mua từ marketplace.' ], [ 'local_shipping', 'Vận chuyển', 'Điều phối giao hàng và theo dõi trạng thái vận đơn.' ]].map(([icon, title, desc]) => <div className="auth-feature" key={title}><span className="material-symbols-outlined filled" style={{ color: 'var(--proto-primary-fixed)', fontSize: 26 }}>{icon}</span><div><strong>{title}</strong><p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,.72)' }}>{desc}</p></div></div>)}
        </div>
      </aside>
      <section className="auth-form-pane">
        <div className="auth-form-card register-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', marginBottom: 18 }}>
            <Link className="public-brand" to="/marketplace"><span className="material-symbols-outlined fill">eco</span>BICAP</Link>
            <Link className="auth-link" to="/marketplace"><span className="material-symbols-outlined">arrow_back</span> Trang chủ</Link>
          </div>
          <h1 className="auth-title">Tạo tài khoản BICAP</h1>
          <p className="auth-sub">Chọn vai trò phù hợp để bắt đầu sử dụng các chức năng nghiệp vụ.</p>
          <form className="auth-grid" onSubmit={handleSubmit}>
            <div><span className="form-label">Vai trò đăng ký</span><div className="auth-role-grid">{roles.map((role) => <button type="button" key={role} className={`auth-role-card ${form.role === role ? 'active' : ''}`} onClick={() => setForm((prev) => ({ ...prev, role }))}><span className="material-symbols-outlined">{roleIcons[role]}</span><span>{role === ROLES.GUEST ? 'Khách' : role === ROLES.FARM ? 'Nông trại' : role === ROLES.RETAILER ? 'Nhà bán lẻ' : 'Vận chuyển'}</span></button>)}</div></div>
            <hr style={{ border: 0, borderTop: '1px solid rgba(191,202,186,.4)' }} />
            <h3 className="proto-filter-sub">Thông tin tài khoản</h3>
            <div className="auth-two"><div className="auth-field"><label htmlFor="reg-fullName">Họ và tên</label><input id="reg-fullName" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Nguyễn Văn A" required />{errors.fullName ? <small className="field-error">{errors.fullName}</small> : null}</div><div className="auth-field"><label htmlFor="reg-phone">Số điện thoại</label><input id="reg-phone" name="phone" value={form.phone} onChange={handleChange} placeholder="0xxxxxxxxx hoặc +84xxxxxxxxx" />{errors.phone ? <small className="field-error">{errors.phone}</small> : null}</div></div>
            <div className="auth-field"><label htmlFor="reg-email">Email</label><input id="reg-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="ten@email.com" required />{errors.email ? <small className="field-error">{errors.email}</small> : null}</div>
            <div className="auth-field"><label htmlFor="reg-password">Mật khẩu</label><input id="reg-password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Tối thiểu 8 ký tự, có chữ hoa, chữ thường và số" required />{errors.password ? <small className="field-error">{errors.password}</small> : null}</div>
            <div className="auth-conditional"><div className="proto-kicker" style={{ marginBottom: 10 }}><span className="material-symbols-outlined">{roleIcons[form.role]}</span>{form.role === ROLES.GUEST ? 'Tài khoản khách hàng' : form.role === ROLES.FARM ? 'Không gian nông trại' : form.role === ROLES.RETAILER ? 'Không gian nhà bán lẻ' : 'Không gian vận chuyển'}</div><p className="public-muted" style={{ margin: 0 }}>Thông tin đăng ký được dùng để xác minh vai trò và phân quyền truy cập phù hợp. Khách vẫn có thể xem thông tin công khai mà không cần đăng nhập.</p></div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, color: 'var(--proto-on-surface-variant)', lineHeight: 1.45 }}><input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} style={{ marginTop: 4 }} />Tôi đồng ý với điều khoản sử dụng, chính sách bảo mật và xác minh tài khoản trên BICAP.</label>
            {error ? <div className="alert alert-error">{error}</div> : null}
            <button className="auth-submit-button" type="submit" disabled={!canSubmit}>{loading ? 'Đang tạo tài khoản...' : <>Tạo tài khoản <span className="material-symbols-outlined">arrow_forward</span></>}</button>
          </form>
          <p className="auth-sub" style={{ marginTop: 18, marginBottom: 0, textAlign: 'center' }}>Đã có tài khoản? <Link className="auth-link-danger" to="/login">Đăng nhập</Link></p>
        </div>
      </section>
    </div>
  )
}
