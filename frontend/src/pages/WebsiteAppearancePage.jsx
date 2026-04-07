import { useMemo, useState } from 'react'
import { Button } from '../components/Button.jsx'

const assetDefinitions = [
  {
    key: 'gifLoading',
    title: 'Ảnh động tải dữ liệu',
    description: 'Ảnh động hiển thị trong lúc hệ thống tải dữ liệu hoặc xử lý tác vụ.',
    fallback: '/uth-logo.png',
    previewClassName: 'asset-preview-light',
  },
  {
    key: 'gifLoader',
    title: 'Ảnh động bộ nạp',
    description: 'Biểu tượng loader phụ dùng cho popup, modal hoặc các nút gửi biểu mẫu.',
    fallback: '/uth-logo.jpg',
    previewClassName: 'asset-preview-dark',
  },
  {
    key: 'gifGiftbox',
    title: 'Ảnh động hộp quà',
    description: 'Asset quà tặng / khuyến mãi hiển thị trên những khu vực marketing.',
    fallback: '/uth-logo.png',
    previewClassName: 'asset-preview-light',
  },
  {
    key: 'backgroundCard',
    title: 'Ảnh nền thẻ nội dung',
    description: 'Ảnh nền cho các thẻ giới thiệu, khối thông báo hoặc ưu đãi nổi bật.',
    fallback: '/auth-bg.jpg',
    previewClassName: 'asset-preview-dark',
  },
]

function buildPreview(file, fallback) {
  if (!file) return fallback
  return URL.createObjectURL(file)
}

function AssetRow({ item, file, preview, onChange, onReset }) {
  return (
    <div className="asset-row">
      <div className="asset-row-main">
        <div>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </div>
        <div className="asset-upload-control">
          <label className="browse-button" htmlFor={`${item.key}-upload`}>
            Chọn tệp
          </label>
          <input
            id={`${item.key}-upload`}
            type="file"
            accept="image/*"
            onChange={(event) => onChange(item.key, event)}
            hidden
          />
          <span className="asset-file-name">{file?.name || 'Chưa chọn tệp nào.'}</span>
        </div>
      </div>

      <div className="asset-row-side">
        <div className={`asset-preview ${item.previewClassName}`}>
          <img src={preview} alt={`${item.title} preview`} />
        </div>
        <button className="asset-side-button" type="button" onClick={() => onReset(item.key)}>
          Tải ảnh lên
        </button>
      </div>
    </div>
  )
}

export function WebsiteAppearancePage() {
  const [files, setFiles] = useState({})
  const [success, setSuccess] = useState('')
  const [announcementHtml, setAnnouncementHtml] = useState(() => {
    return localStorage.getItem('system_announcement') || '<p class="announcement-line">BICAP</p><p class="announcement-highlight dark">CHÚC BẠN</p><p class="announcement-highlight bright">MỘT NGÀY VUI VẺ 😊</p>'
  })

  const previews = useMemo(
    () => Object.fromEntries(assetDefinitions.map((item) => [item.key, buildPreview(files[item.key], item.fallback)])),
    [files],
  )

  function handleFileChange(key, event) {
    const file = event.target.files?.[0] || null
    setSuccess('')
    setFiles((prev) => ({ ...prev, [key]: file }))
  }

  function handleReset(key) {
    setFiles((prev) => ({ ...prev, [key]: null }))
    setSuccess('')
  }

  function handleSaveAll() {
    const hasAnyFile = Object.values(files).some(Boolean)
    
    // Save announcement
    localStorage.setItem('system_announcement', announcementHtml)
    // Dispatch event so other components listening (like banner) can update immediately if needed
    window.dispatchEvent(new Event('storage'))

    if (!hasAnyFile && announcementHtml === localStorage.getItem('system_announcement')) {
      setSuccess('Đã lưu nội dung thông báo thành công.')
      return
    }

    setSuccess('Đã lưu cấu hình asset và nội dung thông báo cho giao diện demo admin.')
  }

  return (
    <section className="page-section asset-manager-page">
      <div className="asset-manager-header glass-card">
        <div>
          <p className="eyebrow">Giao diện website</p>
          <h2>Quản lý giao diện website</h2>
          <p>
            Khu vực quản trị tài nguyên hiển thị của website. Quản trị viên có thể thay đổi ảnh động tải dữ liệu, bộ nạp, hộp quà và ảnh nền thẻ nội dung theo đúng phong cách bảng điều khiển quản trị.
          </p>
        </div>
        <div className="appearance-summary">
          <span className="role-chip">Bản demo quản trị</span>
          <span className="role-chip">Quản lý tài nguyên</span>
        </div>
      </div>

      {success ? <div className="alert alert-success">{success}</div> : null}

      <article className="glass-card mb-4" style={{ marginBottom: '24px' }}>
        <div className="asset-manager-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '16px' }}>
          <h3>Thay đổi thông báo toàn hệ thống</h3>
          <p style={{ color: '#8ea5c1', fontSize: '0.9rem' }}>Nội dung này sẽ hiển thị dưới dạng Popup ngay khi người dùng đăng nhập hệ thống.</p>
        </div>
        <div style={{ background: '#ffffff', color: '#000000', borderRadius: '8px', overflow: 'hidden', padding: '12px' }}>
          <textarea 
            value={announcementHtml} 
            onChange={(e) => setAnnouncementHtml(e.target.value)} 
            style={{ width: '100%', minHeight: '150px', border: '1px solid #ccc', borderRadius: '6px', padding: '8px' }} 
            placeholder="<html>...</html>"
          />
        </div>
      </article>

      <article className="glass-card asset-manager-card">
        <div className="asset-manager-list">
          {assetDefinitions.map((item) => (
            <AssetRow
              key={item.key}
              item={item}
              file={files[item.key]}
              preview={previews[item.key]}
              onChange={handleFileChange}
              onReset={handleReset}
            />
          ))}
        </div>

        <div className="asset-manager-footer">
          <Button variant="secondary" onClick={() => setFiles({})}>Đặt lại tất cả</Button>
          <Button onClick={handleSaveAll}>Lưu thay đổi</Button>
        </div>
      </article>
    </section>
  )
}
