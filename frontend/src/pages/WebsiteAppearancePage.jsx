import { useEffect, useMemo, useState } from 'react'
import { getActiveAnnouncement, getPublishedContent, updateActiveAnnouncement } from '../services/workflowService.js'
import { sanitizeAnnouncementHtml } from '../utils/announcementSanitizer.js'
import { Button } from '../components/Button.jsx'
import { StatusCard } from '../components/StatusCard.jsx'

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
    <article className="appearance-asset-card">
      <div className="appearance-asset-preview-wrap">
        <div className={`asset-preview ${item.previewClassName}`}>
          <img src={preview} alt={`${item.title} preview`} />
        </div>
      </div>

      <div className="appearance-asset-body">
        <span className="feature-badge">Asset</span>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <div className="appearance-file-state">
          <strong>{file?.name || 'Đang dùng ảnh mặc định'}</strong>
          <span>{file ? 'Sẵn sàng lưu thay đổi' : 'Chưa chọn tệp mới'}</span>
        </div>
      </div>

      <div className="appearance-asset-actions">
        <label className="button button-secondary appearance-upload-button" htmlFor={`${item.key}-upload`}>
          Chọn tệp
        </label>
        <input
          id={`${item.key}-upload`}
          type="file"
          accept="image/*"
          onChange={(event) => onChange(item.key, event)}
          hidden
        />
        <button className="button button-ghost" type="button" onClick={() => onReset(item.key)}>
          Đặt lại
        </button>
      </div>
    </article>
  )
}

export function WebsiteAppearancePage() {
  const [files, setFiles] = useState({})
  const [success, setSuccess] = useState('')
  const [announcementHtml, setAnnouncementHtml] = useState('<p class="announcement-line">BICAP</p><p class="announcement-highlight dark">CHÚC BẠN</p><p class="announcement-highlight bright">MỘT NGÀY VUI VẺ 😊</p>')
  const [publishedContent, setPublishedContent] = useState([])

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [announcement, content] = await Promise.all([getActiveAnnouncement(), getPublishedContent()])
        if (announcement?.contentHtml) setAnnouncementHtml(sanitizeAnnouncementHtml(announcement.contentHtml))
        setPublishedContent(Array.isArray(content) ? content : [])
      } catch {
        setPublishedContent([])
      }
    }

    loadInitialData()
  }, [])

  const liveAnnouncement = publishedContent[0]?.title || 'Thông báo hệ thống'
  const selectedFileCount = Object.values(files).filter(Boolean).length

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

  async function handleSaveAll() {
    try {
      await updateActiveAnnouncement({ contentHtml: sanitizeAnnouncementHtml(announcementHtml) })
      setSuccess('Đã lưu cấu hình asset và thông báo hệ thống.')
    } catch {
      setSuccess('Đã lưu cấu hình asset. Không cập nhật được thông báo hệ thống.')
    }
  }

  return (
    <section className="page-section admin-page appearance-admin-page">
      <div className="section-heading appearance-hero">
        <div>
          <h2>Quản lý giao diện website</h2>
        </div>
      </div>

      <div className="status-grid appearance-status-grid">
        <StatusCard label="Asset quản lý" value={assetDefinitions.length} tone="primary" />
        <StatusCard label="File đã chọn" value={selectedFileCount} tone={selectedFileCount ? 'success' : 'warning'} />
        <StatusCard label="Published content" value={publishedContent.length} tone="success" />
        <StatusCard label="Preview nguồn" value="Live" tone="primary" />
      </div>

      {success ? <div className="alert alert-success">{success}</div> : null}

      <div className="appearance-composer-grid">
        <article className="glass-card appearance-panel appearance-editor-panel">
          <div className="admin-table-head">
            <div>
              <span className="feature-badge">Announcement</span>
              <h3>Thông báo toàn hệ thống</h3>
              <p>Chỉnh nội dung HTML đã sanitize dùng cho khu vực thông báo/landing public.</p>
            </div>
          </div>

          <textarea
            className="form-input appearance-textarea"
            value={announcementHtml}
            onChange={(event) => setAnnouncementHtml(event.target.value)}
            placeholder="<p>Nhập nội dung thông báo...</p>"
          />

          <div className="appearance-source-note">
            <strong>Nguồn public hiện tại</strong>
            <span>{liveAnnouncement}</span>
          </div>
        </article>

        <article className="glass-card appearance-panel appearance-preview-panel">
          <div className="admin-table-head">
            <div>
              <span className="feature-badge">Preview</span>
              <h3>Xem trước hiển thị</h3>
              <p>Admin kiểm tra nhanh nội dung trước khi lưu thay đổi.</p>
            </div>
          </div>

          <div className="appearance-live-preview">
            <div className="appearance-preview-window">
              <div className="appearance-preview-dots"><span /><span /><span /></div>
              <div className="appearance-preview-content" dangerouslySetInnerHTML={{ __html: sanitizeAnnouncementHtml(announcementHtml) }} />
            </div>
          </div>
        </article>
      </div>

      <article className="glass-card appearance-assets-panel">
        <div className="admin-table-head">
          <div>
            <span className="feature-badge">Media assets</span>
            <h3>Thư viện tài nguyên hiển thị</h3>
            <p>Quản lý loader, hộp quà và hình nền cho các khu vực marketing/public.</p>
          </div>
          <div className="appearance-panel-actions">
            <Button variant="secondary" onClick={() => setFiles({})}>Đặt lại tất cả</Button>
            <Button onClick={handleSaveAll}>Lưu thay đổi</Button>
          </div>
        </div>

        <div className="appearance-asset-grid">
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
      </article>
    </section>
  )
}
