import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { changePassword } from '../services/authService.js'
import { getErrorMessage } from '../utils/helpers.js'

export function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || user?.name || '',
    phone: user?.phoneNumber || user?.phone || '',
    avatarUrl: user?.avatarUrl || '',
  })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const initials = useMemo(() => (profileForm.fullName || user?.email || 'B').trim().slice(0, 1).toUpperCase(), [profileForm.fullName, user?.email])
  const roleLabel = user?.role || user?.roles?.[0] || user?.roleName || 'Authenticated User'

  async function submitProfile(event) {
    event.preventDefault()
    setSavingProfile(true)
    setError('')
    setStatus('')
    try {
      await updateProfile(profileForm)
      setStatus('Hồ sơ đã được cập nhật từ backend.')
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể cập nhật hồ sơ.'))
    } finally {
      setSavingProfile(false)
    }
  }

  async function submitPassword(event) {
    event.preventDefault()
    setError('')
    setStatus('')
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }
    setSavingPassword(true)
    try {
      const message = await changePassword(passwordForm)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setStatus(message || 'Mật khẩu đã được cập nhật.')
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể đổi mật khẩu.'))
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <section className="bicap-profile-prototype strict-profile-prototype" aria-labelledby="profile-prototype-title">
      <section className="profile-prototype-header strict-profile-header">
        <div className="profile-prototype-cover" aria-hidden="true" />
        <div className="profile-prototype-avatar-wrap">
          <div className="profile-prototype-avatar"><span>{initials}</span></div>
        </div>
        <div className="profile-prototype-identity">
          <div className="profile-prototype-name-row">
            <h1 id="profile-prototype-title">{profileForm.fullName || user?.email || 'BICAP User'}</h1>
            <span className="profile-prototype-verified"><span className="material-symbols-outlined" aria-hidden="true">verified</span>Verified Account</span>
          </div>
          <p><span className="material-symbols-outlined" aria-hidden="true">mail</span>{user?.email || 'No email on file'}</p>
        </div>
        <div className="profile-prototype-status"><span>Account Status</span><strong><i /> {user?.status || 'ACTIVE'}</strong></div>
      </section>

      {error ? <div className="driver-alert error">{error}</div> : null}
      {status ? <div className="driver-alert success">{status}</div> : null}

      <form className="strict-profile-grid" onSubmit={submitProfile}>
        <div className="strict-profile-left">
          <article className="profile-prototype-card strict-profile-card">
            <div className="profile-prototype-card-head"><h2>Personal Information</h2><button type="submit" disabled={savingProfile}><span className="material-symbols-outlined" aria-hidden="true">save</span>{savingProfile ? 'Saving...' : 'Save Details'}</button></div>
            <div className="strict-info-grid">
              <label className="strict-readonly-field editable"><span>Full Name</span><input value={profileForm.fullName} onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })} required /></label>
              <label className="strict-readonly-field"><span>Email Address</span><input value={user?.email || ''} readOnly /></label>
              <label className="strict-readonly-field editable"><span>Phone Number</span><input value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} /></label>
              <label className="strict-readonly-field"><span>Account Role</span><input value={roleLabel} readOnly /></label>
            </div>
          </article>

          <article className="profile-prototype-card strict-profile-card">
            <div className="profile-prototype-card-title"><span className="material-symbols-outlined" aria-hidden="true">business</span><h2>Business Information</h2></div>
            <div className="strict-business-form">
              <div className="strict-info-grid two">
                <label className="strict-readonly-field"><span>User ID</span><input value={user?.userId || user?.id || 'N/A'} readOnly /></label>
                <label className="strict-readonly-field certificate"><span>Certification Status</span><div><span className="material-symbols-outlined" aria-hidden="true">shield_person</span>{user?.certificationStatus || 'Managed by role module'}</div></label>
              </div>
              <label className="strict-readonly-field textarea-field"><span>Profile Source</span><textarea value="Thông tin tài khoản được lấy từ /auth/me và cập nhật qua /users/me/profile." readOnly rows={2} /></label>
            </div>
          </article>
        </div>

        <aside className="strict-profile-right">
          <article className="profile-prototype-card strict-profile-card strict-security-card">
            <div className="profile-prototype-card-title"><span className="material-symbols-outlined" aria-hidden="true">lock</span><h2>Security</h2></div>
            <div className="strict-2fa-row"><div><span className="material-symbols-outlined" aria-hidden="true">security</span><p><strong>Password Protected</strong><small>Strong password policy enforced by backend</small></p></div><button type="button" aria-label="Password protection enabled"><span /></button></div>
            <div className="strict-password-form" onSubmit={submitPassword} as="form">
              <label>Current Password<input placeholder="••••••••" type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} /></label>
              <label>New Password<input placeholder="At least 8 chars, upper/lower/number" type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} /></label>
              <label>Confirm Password<input placeholder="••••••••" type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} /></label>
              <button type="button" onClick={submitPassword} disabled={savingPassword}>{savingPassword ? 'Updating...' : 'Update Password'}</button>
            </div>
          </article>

          <article className="strict-blockchain-card">
            <span className="blockchain-watermark material-symbols-outlined" aria-hidden="true">account_tree</span>
            <h3><span className="material-symbols-outlined" aria-hidden="true">verified_user</span>Account Integrity</h3>
            <div className="strict-chain-row"><span className="material-symbols-outlined" aria-hidden="true">data_object</span><p><small>Email</small><strong>{user?.email || 'N/A'}</strong></p></div>
            <div className="strict-chain-row"><span className="material-symbols-outlined" aria-hidden="true">history</span><p><small>Last Sync</small><strong>Current session</strong></p></div>
          </article>
        </aside>
      </form>
    </section>
  )
}
