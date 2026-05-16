import { useEffect, useMemo, useState } from 'react'
import { getActiveAnnouncement, getPublishedContent, updateActiveAnnouncement } from '../services/workflowService.js'
import { sanitizeAnnouncementHtml } from '../utils/announcementSanitizer.js'
import { Button } from '../components/Button.jsx'
import { StatusCard } from '../components/StatusCard.jsx'
import {
  buildTelegramLink,
  buildZaloLink,
  getSupportConfig,
  saveSupportConfig,
  SOCIAL_DEFINITIONS,
} from '../utils/supportConfig.js'
import { getAdminSupportConfig, updateAdminSupportConfig } from '../services/supportService.js'

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
  const [supportForm, setSupportForm] = useState(() => getSupportConfig())
  const [supportMessage, setSupportMessage] = useState('')

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

    ;(async () => {
      try {
        const remote = await getAdminSupportConfig()
        if (remote && typeof remote === 'object') {
          setSupportForm((prev) => ({ ...prev, ...remote }))
          saveSupportConfig(remote)
        }
      } catch {
        /* bỏ qua, dùng cấu hình cục bộ */
      }
    })()
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

  function handleSupportChange(event) {
    const { name, value } = event.target
    setSupportForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSupportSave(event) {
    event.preventDefault()
    saveSupportConfig(supportForm)
    setSupportMessage('Đã lưu thông tin hỗ trợ cục bộ. Đang đồng bộ với máy chủ...')
    ;(async () => {
      try {
        const saved = await updateAdminSupportConfig(supportForm)
        if (saved && typeof saved === 'object') {
          setSupportForm((prev) => ({ ...prev, ...saved }))
          saveSupportConfig(saved)
        }
        setSupportMessage('Đã lưu thông tin hỗ trợ. Khách và người dùng sẽ thấy Telegram/Zalo mới khi bấm nút hỗ trợ.')
      } catch {
        setSupportMessage('Đã lưu cục bộ. Không kết nối được máy chủ để đồng bộ.')
      }
    })()
  }

  const telegramPreviewLink = buildTelegramLink(supportForm.telegramHandle)
  const zaloPreviewLink = buildZaloLink(supportForm.zaloPhone)

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

      <article className="glass-card appearance-panel appearance-support-panel">
        <div className="admin-table-head">
          <div>
            <span className="feature-badge">Hỗ trợ khách hàng</span>
            <h3>Liên kết Telegram &amp; Zalo</h3>
            <p>Cấu hình kênh hỗ trợ hiển thị khi khách hoặc người dùng bấm nút “Hỗ trợ” ở mọi trang.</p>
          </div>
        </div>

        {supportMessage ? <div className="alert alert-success">{supportMessage}</div> : null}

        <form className="appearance-support-form" onSubmit={handleSupportSave}>
          <div className="appearance-support-grid">
            <label className="appearance-support-field">
              <span>Tên tài khoản Telegram</span>
              <input
                type="text"
                name="telegramHandle"
                className="form-input"
                value={supportForm.telegramHandle || ''}
                onChange={handleSupportChange}
                placeholder="vd: bicap_support hoặc @bicap_support"
              />
              <small>{telegramPreviewLink ? `Sẽ mở: ${telegramPreviewLink}` : 'Để trống nếu không dùng Telegram.'}</small>
            </label>
            <label className="appearance-support-field">
              <span>Tên hiển thị Telegram</span>
              <input
                type="text"
                name="telegramDisplay"
                className="form-input"
                value={supportForm.telegramDisplay || ''}
                onChange={handleSupportChange}
                placeholder="vd: @bicap_support"
              />
            </label>
            <label className="appearance-support-field">
              <span>Số điện thoại Zalo</span>
              <input
                type="text"
                name="zaloPhone"
                className="form-input"
                value={supportForm.zaloPhone || ''}
                onChange={handleSupportChange}
                placeholder="vd: 0909xxxxxx"
              />
              <small>{zaloPreviewLink ? `Sẽ mở: ${zaloPreviewLink}` : 'Để trống nếu không dùng Zalo.'}</small>
            </label>
            <label className="appearance-support-field">
              <span>Tên hiển thị Zalo</span>
              <input
                type="text"
                name="zaloDisplay"
                className="form-input"
                value={supportForm.zaloDisplay || ''}
                onChange={handleSupportChange}
                placeholder="vd: BICAP Hỗ trợ"
              />
            </label>
            <label className="appearance-support-field">
              <span>Hotline</span>
              <input
                type="text"
                name="hotline"
                className="form-input"
                value={supportForm.hotline || ''}
                onChange={handleSupportChange}
                placeholder="vd: 1900 1009"
              />
            </label>
            <label className="appearance-support-field">
              <span>Email hỗ trợ</span>
              <input
                type="email"
                name="email"
                className="form-input"
                value={supportForm.email || ''}
                onChange={handleSupportChange}
                placeholder="vd: support@bicap.vn"
              />
            </label>
            <label className="appearance-support-field">
              <span>Giờ làm việc</span>
              <input
                type="text"
                name="workingHours"
                className="form-input"
                value={supportForm.workingHours || ''}
                onChange={handleSupportChange}
                placeholder="vd: Thứ 2 - Thứ 7, 8:00 - 18:00"
              />
            </label>
            <label className="appearance-support-field appearance-support-field--wide">
              <span>Ghi chú hiển thị thêm</span>
              <textarea
                name="note"
                className="form-input"
                rows={3}
                value={supportForm.note || ''}
                onChange={handleSupportChange}
                placeholder="vd: Đội ngũ BICAP sẽ phản hồi trong vòng 30 phút vào giờ hành chính."
              />
            </label>
          </div>
          <div className="appearance-panel-actions">
            <Button variant="secondary" type="button" onClick={() => { setSupportForm(getSupportConfig()); setSupportMessage('Đã khôi phục thông tin đang dùng.') }}>
              Khôi phục
            </Button>
            <Button type="submit">Lưu thông tin hỗ trợ</Button>
          </div>
        </form>
      </article>

      <article className="glass-card appearance-panel appearance-support-panel">
        <div className="admin-table-head">
          <div>
            <span className="feature-badge">Chăm sóc khách hàng</span>
            <h3>Mạng xã hội &amp; website cá nhân</h3>
            <p>Thêm URL mạng xã hội, link cá nhân của quản trị viên. Sẽ hiển thị ngay trong popup Hỗ trợ cho khách và người dùng.</p>
          </div>
        </div>

        <form className="appearance-support-form" onSubmit={handleSupportSave}>
          <div className="appearance-support-grid appearance-social-grid">
            {SOCIAL_DEFINITIONS.map((def) => (
              <label className="appearance-support-field" key={def.key}>
                <span>
                  <span className="material-symbols-outlined" aria-hidden="true" style={{ color: def.tone, fontSize: 18, verticalAlign: 'text-bottom', marginRight: 6 }}>{def.icon}</span>
                  {def.label}
                </span>
                <input
                  type="url"
                  name={def.key}
                  className="form-input"
                  value={supportForm[def.key] || ''}
                  onChange={handleSupportChange}
                  placeholder={def.key === 'websiteUrl' ? 'https://tentoi.com' : `https://${def.label.toLowerCase().replace(/\s+.*/, '')}.com/ten-tai-khoan`}
                />
              </label>
            ))}
          </div>
          <div className="appearance-panel-actions">
            <Button type="submit">Lưu liên kết</Button>
          </div>
        </form>
      </article>
    </section>
  )
}
