import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button.jsx'
import { SelectField } from '../components/SelectField.jsx'
import { TextAreaField } from '../components/TextAreaField.jsx'
import { TextInput } from '../components/TextInput.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { ROLES } from '../utils/constants'
import { getErrorMessage, mapBackendValidationErrors } from '../utils/helpers'
<<<<<<< Updated upstream
import { validateRegisterForm } from '../utils/validation'

const initialState = {
  fullName: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
  role: ROLES.GUEST,
  notes: '',
}

const roleOptions = [
  { value: ROLES.GUEST, label: 'Guest' },
  { value: ROLES.FARM, label: 'Farm (frontend placeholder)' },
  { value: ROLES.RETAILER, label: 'Retailer (frontend placeholder)' },
]
=======
import { ROLES } from '../utils/constants'

const initialForm = { email: '', password: '', fullName: '', phone: '', role: ROLES.FARM }
const roles = [ROLES.FARM, ROLES.RETAILER, ROLES.SHIPPING_MANAGER]
const roleIcons = { [ROLES.FARM]: 'agriculture', [ROLES.RETAILER]: 'storefront', [ROLES.SHIPPING_MANAGER]: 'local_shipping' }
>>>>>>> Stashed changes

export function RegisterPage() {
  const navigate = useNavigate()
  const { register, getPostLoginPath } = useAuth()
  const [form, setForm] = useState(initialState)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const canSubmit = useMemo(() => Object.keys(validateRegisterForm(form)).length === 0, [form])

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
<<<<<<< Updated upstream
    <div className="auth-card auth-card-wide">
      <div className="card-header auth-form-header">
        <p className="eyebrow">BICAP onboarding</p>
        <h2>Create your account</h2>
        <p>
          This registration form is aligned with the current backend scope. Role-specific business profiles
          can be completed later after login.
        </p>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="grid-two">
          <TextInput label="Full name" name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} required />
          <TextInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} required />
        </div>

        <div className="grid-two">
          <TextInput label="Phone number" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} error={errors.phoneNumber} placeholder="0901234567" />
          <SelectField label="Planned role" name="role" value={form.role} onChange={handleChange} options={roleOptions} error={errors.role} />
=======
    <div className="auth-proto-shell auth-split">
      <aside className="auth-image-pane" style={{ backgroundImage: "linear-gradient(135deg,rgba(13,99,27,.88),rgba(0,95,175,.80)), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80')" }}>
        <div className="auth-image-content">
          <h2 className="auth-title" style={{ color: '#fff', fontSize: 36, whiteSpace: 'nowrap' }}>Gia nhập hệ sinh thái BICAP</h2>
          <p style={{ color: 'rgba(255,255,255,.88)', fontSize: 17, lineHeight: 1.55 }}>Tạo tài khoản để sử dụng các chức năng nghiệp vụ phù hợp với vai trò của bạn.</p>
          {[[ 'agriculture', 'Nông trại', 'Quản lý mùa vụ, lô hàng và listing nông sản.' ], [ 'storefront', 'Nhà bán lẻ', 'Tìm nguồn hàng và tạo đơn mua từ marketplace.' ], [ 'local_shipping', 'Quản lý vận chuyển', 'Điều phối giao hàng và theo dõi trạng thái vận đơn.' ]].map(([icon, title, desc]) => <div className="auth-feature" key={title}><span className="material-symbols-outlined filled" style={{ color: 'var(--proto-primary-fixed)', fontSize: 26 }}>{icon}</span><div><strong>{title}</strong><p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,.72)' }}>{desc}</p></div></div>)}
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
            <div><span className="form-label">Vai trò đăng ký</span><div className="auth-role-grid">{roles.map((role) => <button type="button" key={role} className={`auth-role-card ${form.role === role ? 'active' : ''}`} onClick={() => setForm((prev) => ({ ...prev, role }))}><span className="material-symbols-outlined">{roleIcons[role]}</span><span>{role === ROLES.FARM ? 'Nông trại' : role === ROLES.RETAILER ? 'Nhà bán lẻ' : 'QL vận chuyển'}</span></button>)}</div></div>
            <hr style={{ border: 0, borderTop: '1px solid rgba(191,202,186,.4)' }} />
            <h3 className="proto-filter-sub">Thông tin tài khoản</h3>
            <div className="auth-two"><div className="auth-field"><label htmlFor="reg-fullName">Họ và tên</label><input id="reg-fullName" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Nguyễn Văn A" required />{errors.fullName ? <small className="field-error">{errors.fullName}</small> : null}</div><div className="auth-field"><label htmlFor="reg-phone">Số điện thoại</label><input id="reg-phone" name="phone" value={form.phone} onChange={handleChange} placeholder="0xxxxxxxxx hoặc +84xxxxxxxxx" />{errors.phone ? <small className="field-error">{errors.phone}</small> : null}</div></div>
            <div className="auth-field"><label htmlFor="reg-email">Email</label><input id="reg-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="ten@email.com" required />{errors.email ? <small className="field-error">{errors.email}</small> : null}</div>
            <div className="auth-field"><label htmlFor="reg-password">Mật khẩu</label><input id="reg-password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Tối thiểu 8 ký tự, có chữ hoa, chữ thường và số" required />{errors.password ? <small className="field-error">{errors.password}</small> : null}</div>
            <div className="auth-conditional"><div className="proto-kicker" style={{ marginBottom: 10 }}><span className="material-symbols-outlined">{roleIcons[form.role]}</span>{form.role === ROLES.FARM ? 'Không gian nông trại' : form.role === ROLES.RETAILER ? 'Không gian nhà bán lẻ' : 'Không gian quản lý vận chuyển'}</div><p className="public-muted" style={{ margin: 0 }}>Thông tin đăng ký được dùng để xác minh vai trò và phân quyền truy cập phù hợp.</p></div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, color: 'var(--proto-on-surface-variant)', lineHeight: 1.45 }}><input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} style={{ marginTop: 4 }} />Tôi đồng ý với điều khoản sử dụng, chính sách bảo mật và xác minh tài khoản trên BICAP.</label>
            {error ? <div className="alert alert-error">{error}</div> : null}
            <button className="auth-submit-button" type="submit" disabled={!canSubmit}>{loading ? 'Đang tạo tài khoản...' : <>Tạo tài khoản <span className="material-symbols-outlined">arrow_forward</span></>}</button>
          </form>
          <p className="auth-sub" style={{ marginTop: 18, marginBottom: 0, textAlign: 'center' }}>Đã có tài khoản? <Link className="auth-link-danger" to="/login">Đăng nhập</Link></p>
>>>>>>> Stashed changes
        </div>

        <div className="grid-two">
          <TextInput 
            label="Password" 
            name="password" 
            type={showPassword ? 'text' : 'password'} 
            value={form.password} 
            onChange={handleChange} 
            error={errors.password} 
            required 
          />
          <TextInput 
            label="Confirm password" 
            name="confirmPassword" 
            type={showPassword ? 'text' : 'password'} 
            value={form.confirmPassword} 
            onChange={handleChange} 
            error={errors.confirmPassword} 
            required 
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', marginTop: '-0.5rem' }}>
          <input 
            type="checkbox" 
            id="show-pass" 
            checked={showPassword} 
            onChange={() => setShowPassword(!showPassword)} 
          />
          <label htmlFor="show-pass" style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>Show password</label>
        </div>

        <TextAreaField
          label="Notes"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Optional note for later profile completion"
          error={errors.notes}
        />

        {apiError ? <div className="alert alert-error">{apiError}</div> : null}

        <Button type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Create account'}</Button>
      </form>

      <p className="muted-text">
        Already registered? <Link to="/login">Login here</Link>
      </p>
    </div>
  )
}
