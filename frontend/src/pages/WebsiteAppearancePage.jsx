import { useEffect, useMemo, useState } from 'react'
import { getActiveAnnouncement, getPublishedContent, updateActiveAnnouncement } from '../services/workflowService.js'
import { sanitizeAnnouncementHtml } from '../utils/announcementSanitizer.js'
import { Button } from '../components/Button.jsx'
import { StatusCard } from '../components/StatusCard.jsx'

const assetDefinitions = [
  {
    key: 'gifLoading',
    title: '?nh động t?i d? li?u',
    description: '?nh động hi?n th? trong lúc h? th?ng t?i d? li?u ho?c x? l? tác v?.',
    fallback: '/uth-logo.png',
    previewClassName: 'asset-preview-light',
  },
  {
    key: 'gifLoader',
    title: '?nh động b? n?p',
    description: 'Bi?u tượng loader ph? dùng cho popup, modal ho?c các nút g?i bi?u m?u.',
    fallback: '/uth-logo.jpg',
    previewClassName: 'asset-preview-dark',
  },
  {
    key: 'gifGiftbox',
    title: '?nh động h?p quà',
    description: 'Asset quà t?ng / khuy?n m?i hi?n th? trên nh?ng khu v?c marketing.',
    fallback: '/uth-logo.png',
    previewClassName: 'asset-preview-light',
  },
  {
    key: 'backgroundCard',
    title: '?nh n?n th? n?i dung',
    description: '?nh n?n cho các th? gi?i thi?u, kh?i thông báo ho?c ưu đãi n?i b?t.',
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
          <strong>{file?.name || 'Đang dùng ?nh m?c định'}</strong>
          <span>{file ? 'S?n sàng lưu thay đổi' : 'Chưa ch?n t?p m?i'}</span>
        </div>
      </div>

      <div className="appearance-asset-actions">
        <label className="button button-secondary appearance-upload-button" htmlFor={`${item.key}-upload`}>
          Ch?n t?p
        </label>
        <input
          id={`${item.key}-upload`}
          type="file"
          accept="image/*"
          onChange={(event) => onChange(item.key, event)}
          hidden
        />
        <button className="button button-ghost" type="button" onClick={() => onReset(item.key)}>
          Đặt l?i
        </button>
      </div>
    </article>
  )
}

export function WebsiteAppearancePage() {
  const [files, setFiles] = useState({})
  const [success, setSuccess] = useState('')
  const [announcementHtml, setAnnouncementHtml] = useState('<p class="announcement-line">BICAP</p><p class="announcement-highlight dark">CHÚC B?N</p><p class="announcement-highlight bright">M?T NGÀY VUI V? ??</p>')
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

  const liveAnnouncement = publishedContent[0]?.title || 'Thông báo h? th?ng'
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
      setSuccess('Đã lưu c?u h?nh asset và thông báo h? th?ng.')
    } catch {
      setSuccess('Đã lưu c?u h?nh asset. Không c?p nh?t được thông báo h? th?ng.')
    }
  }

  return (
    <section className="page-section admin-page appearance-admin-page">
      <div className="section-heading appearance-hero">
        <div>
          <h2>Qu?n l? giao di?n website</h2>
        </div>
      </div>

      <div className="status-grid appearance-status-grid">
        <StatusCard label="Asset qu?n l?" value={assetDefinitions.length} tone="primary" />
        <StatusCard label="File đã ch?n" value={selectedFileCount} tone={selectedFileCount ? 'success' : 'warning'} />
        <StatusCard label="Published content" value={publishedContent.length} tone="success" />
        <StatusCard label="Preview ngu?n" value="Live" tone="primary" />
      </div>

      {success ? <div className="alert alert-success">{success}</div> : null}

      <div className="appearance-composer-grid">
        <article className="glass-card appearance-panel appearance-editor-panel">
          <div className="admin-table-head">
            <div>
              <span className="feature-badge">Announcement</span>
              <h3>Thông báo toàn h? th?ng</h3>
              <p>Ch?nh n?i dung HTML đã sanitize dùng cho khu v?c thông báo/landing public.</p>
            </div>
          </div>

          <textarea
            className="form-input appearance-textarea"
            value={announcementHtml}
            onChange={(event) => setAnnouncementHtml(event.target.value)}
            placeholder="<p>Nh?p n?i dung thông báo...</p>"
          />

          <div className="appearance-source-note">
            <strong>Ngu?n public hi?n t?i</strong>
            <span>{liveAnnouncement}</span>
          </div>
        </article>

        <article className="glass-card appearance-panel appearance-preview-panel">
          <div className="admin-table-head">
            <div>
              <span className="feature-badge">Preview</span>
              <h3>Xem trước hi?n th?</h3>
              <p>Admin ki?m tra nhanh n?i dung trước khi lưu thay đổi.</p>
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
            <h3>Thư vi?n tài nguyên hi?n th?</h3>
            <p>Qu?n l? loader, h?p quà và h?nh n?n cho các khu v?c marketing/public.</p>
          </div>
          <div className="appearance-panel-actions">
            <Button variant="secondary" onClick={() => setFiles({})}>Đặt l?i t?t c?</Button>
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
