import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { changePassword } from '../services/authService.js'
import {
  createFarm,
  getMyFarm,
  updateFarm,
  uploadFarmBusinessLicense,
} from '../services/businessService.js'
import { getErrorMessage } from '../utils/helpers.js'

const initialFarmForm = {
  farmCode: '',
  farmName: '',
  farmType: '',
  businessLicenseNo: '',
  address: '',
  province: '',
  totalArea: '',
  contactPerson: '',
  description: '',
}

const farmFieldsFromResponse = (farm) => ({
  farmCode: farm?.farmCode || '',
  farmName: farm?.farmName || '',
  farmType: farm?.farmType || '',
  businessLicenseNo: farm?.businessLicenseNo || '',
  address: farm?.address || '',
  province: farm?.province || '',
  totalArea: farm?.totalArea ?? '',
  contactPerson: farm?.contactPerson || '',
  description: farm?.description || '',
})

export function FarmProfilePage() {
  const { user, updateProfile } = useAuth()

  const [farm, setFarm] = useState(null)
  const [farmForm, setFarmForm] = useState(initialFarmForm)
  const [loadingFarm, setLoadingFarm] = useState(true)
  const [savingFarm, setSavingFarm] = useState(false)
  const [creatingFarm, setCreatingFarm] = useState(false)

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phoneNumber || user?.phone || '',
  })
  const [savingProfile, setSavingProfile] = useState(false)

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [savingPassword, setSavingPassword] = useState(false)

  const [licenseFile, setLicenseFile] = useState(null)
  const [uploadingLicense, setUploadingLicense] = useState(false)
  const fileInputRef = useRef(null)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const data = await getMyFarm()
        if (!mounted) return
        setFarm(data)
        setFarmForm(farmFieldsFromResponse(data))
      } catch (err) {
        if (!mounted) return
        // 404 expected when farm does not exist yet — switch to create mode silently.
        const status = err?.response?.status
        if (status === 404) {
          setFarm(null)
          setFarmForm(initialFarmForm)
        } else {
          setError(getErrorMessage(err, 'Không thể tải thông tin farm.'))
        }
      } finally {
        if (mounted) setLoadingFarm(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  async function handleProfileSubmit(event) {
    event.preventDefault()
    setSavingProfile(true)
    setError('')
    setSuccess('')
    try {
      await updateProfile(profileForm)
      setSuccess('Thông tin chủ sở hữu đã được cập nhật.')
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể cập nhật hồ sơ.'))
    } finally {
      setSavingProfile(false)
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }
    setSavingPassword(true)
    try {
      const message = await changePassword(passwordForm)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSuccess(message || 'Mật khẩu đã được cập nhật.')
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể đổi mật khẩu.'))
    } finally {
      setSavingPassword(false)
    }
  }

  async function handleFarmSave(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const payload = {
      ...farmForm,
      totalArea: farmForm.totalArea === '' ? null : Number(farmForm.totalArea),
    }

    try {
      if (!farm) {
        setCreatingFarm(true)
        const created = await createFarm(payload)
        setFarm(created)
        setFarmForm(farmFieldsFromResponse(created))
        setSuccess('Đã đăng ký farm. Hồ sơ đang chờ admin xét duyệt.')
      } else {
        setSavingFarm(true)
        const updated = await updateFarm(farm.farmId, payload)
        setFarm(updated)
        setFarmForm(farmFieldsFromResponse(updated))
        setSuccess('Đã cập nhật thông tin farm.')
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể lưu thông tin farm.'))
    } finally {
      setCreatingFarm(false)
      setSavingFarm(false)
    }
  }

  async function handleLicenseUpload(event) {
    event.preventDefault()
    if (!farm?.farmId) {
      setError('Cần đăng ký farm trước khi upload giấy phép.')
      return
    }
    if (!licenseFile) {
      setError('Vui lòng chọn file giấy phép kinh doanh.')
      return
    }
    setError('')
    setSuccess('')
    setUploadingLicense(true)
    try {
      const updated = await uploadFarmBusinessLicense(farm.farmId, licenseFile)
      setFarm(updated)
      setLicenseFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setSuccess('Đã tải lên giấy phép kinh doanh. Admin sẽ xét duyệt lại.')
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể upload giấy phép.'))
    } finally {
      setUploadingLicense(false)
    }
  }

  function updateFarmField(field, value) {
    setFarmForm((current) => ({ ...current, [field]: value }))
  }

  const isCreating = !farm
  const approvalLabel = farm?.approvalStatus
    ? farm.approvalStatus === 'APPROVED'
      ? 'Đã duyệt'
      : farm.approvalStatus === 'PENDING'
      ? 'Chờ duyệt'
      : farm.approvalStatus === 'REJECTED'
      ? 'Bị từ chối'
      : farm.approvalStatus === 'SUSPENDED'
      ? 'Tạm khóa'
      : farm.approvalStatus === 'REVOKED'
      ? 'Đã thu hồi'
      : farm.approvalStatus
    : 'Chưa đăng ký'

  return (
    <section className="bicap-profile-prototype strict-profile-prototype" aria-labelledby="farm-profile-title">
      <section className="profile-prototype-header strict-profile-header">
        <div className="profile-prototype-cover" aria-hidden="true" />
        <div className="profile-prototype-avatar-wrap">
          <div className="profile-prototype-avatar">
            <span>{(farmForm.farmName || profileForm.fullName || user?.email || 'F').slice(0, 1).toUpperCase()}</span>
          </div>
        </div>
        <div className="profile-prototype-identity">
          <div className="profile-prototype-name-row">
            <h1 id="farm-profile-title">{farmForm.farmName || profileForm.fullName || 'Farm Manager'}</h1>
            <span className="profile-prototype-verified">
              <span className="material-symbols-outlined" aria-hidden="true">agriculture</span>
              {approvalLabel}
            </span>
          </div>
          <p>
            <span className="material-symbols-outlined" aria-hidden="true">mail</span>
            {user?.email || 'No email on file'}
          </p>
        </div>
        <div className="profile-prototype-status">
          <span>Trạng thái Farm</span>
          <strong>
            <i /> {approvalLabel}
          </strong>
        </div>
      </section>

      {error ? <div className="driver-alert error">{error}</div> : null}
      {success ? <div className="driver-alert success">{success}</div> : null}

      <div className="strict-profile-grid">
        <div className="strict-profile-left">
          <form onSubmit={handleProfileSubmit}>
            <article className="profile-prototype-card strict-profile-card">
              <div className="profile-prototype-card-head">
                <h2>Thông tin cá nhân chủ sở hữu</h2>
                <button type="submit" disabled={savingProfile}>
                  <span className="material-symbols-outlined" aria-hidden="true">save</span>
                  {savingProfile ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
              <div className="strict-info-grid">
                <label className="strict-readonly-field editable">
                  <span>Họ và tên</span>
                  <input value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} required />
                </label>
                <label className="strict-readonly-field">
                  <span>Email</span>
                  <input value={user?.email || ''} readOnly />
                </label>
                <label className="strict-readonly-field editable">
                  <span>Số điện thoại</span>
                  <input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                </label>
                <label className="strict-readonly-field">
                  <span>Vai trò</span>
                  <input value={user?.role || (user?.roles && user.roles[0]) || 'FARM'} readOnly />
                </label>
              </div>
            </article>
          </form>

          <form onSubmit={handleFarmSave}>
            <article className="profile-prototype-card strict-profile-card">
              <div className="profile-prototype-card-head">
                <h2>{isCreating ? 'Đăng ký nông trại' : 'Thông tin nông trại'}</h2>
                <button type="submit" disabled={savingFarm || creatingFarm || loadingFarm}>
                  <span className="material-symbols-outlined" aria-hidden="true">save</span>
                  {creatingFarm ? 'Đang đăng ký...' : savingFarm ? 'Đang lưu...' : isCreating ? 'Đăng ký farm' : 'Lưu thông tin'}
                </button>
              </div>
              {loadingFarm ? (
                <p className="strict-readonly-field"><span>Đang tải dữ liệu farm...</span></p>
              ) : (
                <div className="strict-info-grid">
                  <label className="strict-readonly-field editable">
                    <span>Mã farm</span>
                    <input
                      value={farmForm.farmCode}
                      onChange={(e) => updateFarmField('farmCode', e.target.value)}
                      disabled={!isCreating}
                      placeholder="VD: GREENFIELD-01"
                      required
                    />
                  </label>
                  <label className="strict-readonly-field editable">
                    <span>Tên farm</span>
                    <input value={farmForm.farmName} onChange={(e) => updateFarmField('farmName', e.target.value)} required />
                  </label>
                  <label className="strict-readonly-field editable">
                    <span>Loại hình</span>
                    <input value={farmForm.farmType} onChange={(e) => updateFarmField('farmType', e.target.value)} placeholder="Ví dụ: Cà phê hữu cơ" />
                  </label>
                  <label className="strict-readonly-field editable">
                    <span>Số giấy phép kinh doanh</span>
                    <input
                      value={farmForm.businessLicenseNo}
                      onChange={(e) => updateFarmField('businessLicenseNo', e.target.value)}
                      disabled={!isCreating}
                      required
                    />
                  </label>
                  <label className="strict-readonly-field editable">
                    <span>Địa chỉ</span>
                    <input value={farmForm.address} onChange={(e) => updateFarmField('address', e.target.value)} required />
                  </label>
                  <label className="strict-readonly-field editable">
                    <span>Tỉnh / TP</span>
                    <input value={farmForm.province} onChange={(e) => updateFarmField('province', e.target.value)} required />
                  </label>
                  <label className="strict-readonly-field editable">
                    <span>Diện tích (ha)</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={farmForm.totalArea}
                      onChange={(e) => updateFarmField('totalArea', e.target.value)}
                      placeholder="0"
                    />
                  </label>
                  <label className="strict-readonly-field editable">
                    <span>Người liên hệ</span>
                    <input value={farmForm.contactPerson} onChange={(e) => updateFarmField('contactPerson', e.target.value)} />
                  </label>
                  <label className="strict-readonly-field textarea-field editable" style={{ gridColumn: '1 / -1' }}>
                    <span>Mô tả</span>
                    <textarea
                      rows={3}
                      value={farmForm.description}
                      onChange={(e) => updateFarmField('description', e.target.value)}
                      placeholder="Mô tả ngắn về nông trại..."
                    />
                  </label>
                </div>
              )}
              {farm?.reviewComment ? (
                <p className="strict-readonly-field" style={{ marginTop: 12 }}>
                  <span>Ghi chú từ admin</span>
                  <em>{farm.reviewComment}</em>
                </p>
              ) : null}
            </article>
          </form>

          <form onSubmit={handleLicenseUpload}>
            <article className="profile-prototype-card strict-profile-card">
              <div className="profile-prototype-card-head">
                <h2>Giấy phép kinh doanh</h2>
                <button type="submit" disabled={uploadingLicense || !farm?.farmId}>
                  <span className="material-symbols-outlined" aria-hidden="true">upload_file</span>
                  {uploadingLicense ? 'Đang tải lên...' : 'Tải lên giấy phép'}
                </button>
              </div>
              <div className="strict-info-grid">
                <label className="strict-readonly-field editable" style={{ gridColumn: '1 / -1' }}>
                  <span>Tải file giấy phép (PDF/JPG/PNG)</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,image/jpeg,image/png,image/webp"
                    onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                  />
                </label>
                {farm?.businessLicenseFileUrl ? (
                  <label className="strict-readonly-field" style={{ gridColumn: '1 / -1' }}>
                    <span>File hiện tại</span>
                    <a href={farm.businessLicenseFileUrl} target="_blank" rel="noreferrer">
                      {farm.businessLicenseFileName || 'Xem file giấy phép'}
                    </a>
                  </label>
                ) : (
                  <p className="strict-readonly-field" style={{ gridColumn: '1 / -1' }}>
                    <span>Chưa có giấy phép tải lên.</span>
                  </p>
                )}
              </div>
              <p className="strict-readonly-field" style={{ marginTop: 8 }}>
                <span>Lưu ý: sau khi tải lên file mới, hồ sơ farm chuyển sang trạng thái PENDING để admin duyệt lại.</span>
              </p>
            </article>
          </form>
        </div>

        <aside className="strict-profile-right">
          <article className="profile-prototype-card strict-profile-card strict-security-card">
            <div className="profile-prototype-card-title">
              <span className="material-symbols-outlined" aria-hidden="true">lock</span>
              <h2>Bảo mật</h2>
            </div>
            <form onSubmit={handlePasswordSubmit} className="strict-password-form">
              <label>
                Mật khẩu hiện tại
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                />
              </label>
              <label>
                Mật khẩu mới
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
              </label>
              <label>
                Xác nhận mật khẩu
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                />
              </label>
              <button type="submit" disabled={savingPassword}>
                {savingPassword ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
              </button>
            </form>
          </article>

          <article className="strict-blockchain-card">
            <span className="blockchain-watermark material-symbols-outlined" aria-hidden="true">account_tree</span>
            <h3>
              <span className="material-symbols-outlined" aria-hidden="true">verified_user</span>
              Tổng quan Farm
            </h3>
            <div className="strict-chain-row">
              <span className="material-symbols-outlined" aria-hidden="true">badge</span>
              <p><small>Mã farm</small><strong>{farm?.farmCode || 'Chưa đăng ký'}</strong></p>
            </div>
            <div className="strict-chain-row">
              <span className="material-symbols-outlined" aria-hidden="true">workspace_premium</span>
              <p><small>Chứng nhận</small><strong>{farm?.certificationStatus || 'N/A'}</strong></p>
            </div>
            <div className="strict-chain-row">
              <span className="material-symbols-outlined" aria-hidden="true">history</span>
              <p><small>Cập nhật cuối</small><strong>{farm?.reviewedAt ? new Date(farm.reviewedAt).toLocaleDateString('vi-VN') : 'Chưa có'}</strong></p>
            </div>
          </article>
        </aside>
      </div>
    </section>
  )
}

export default FarmProfilePage
