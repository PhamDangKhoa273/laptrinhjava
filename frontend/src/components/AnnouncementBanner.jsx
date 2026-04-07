import { useState, useEffect } from 'react'
import { Button } from './Button.jsx'

export function AnnouncementBanner() {
  const [visible, setVisible] = useState(true)
  const [content, setContent] = useState('')

  useEffect(() => {
    function loadContent() {
      const saved = localStorage.getItem('system_announcement')
      if (saved) {
        setContent(saved)
      } else {
        setContent('<p class="announcement-line">BICAP</p><p class="announcement-highlight dark">CHÚC BẠN</p><p class="announcement-highlight bright">MỘT NGÀY VUI VẺ 😊</p>')
      }
    }
    loadContent()
    window.addEventListener('storage', loadContent)
    return () => window.removeEventListener('storage', loadContent)
  }, [])

  if (!visible) return null

  return (
    <div className="announcement-overlay">
      <div className="announcement-modal">
        <div className="announcement-header">
          <h3>Thông báo</h3>
        </div>
        <div className="announcement-body" dangerouslySetInnerHTML={{ __html: content }} />
        <div className="announcement-actions">
          <Button variant="secondary" style={{ color: '#3a4f67', backgroundColor: '#eef2f6', borderColor: '#d1dce6' }} onClick={() => setVisible(false)}>Không hiển thị lại</Button>
          <Button onClick={() => setVisible(false)}>Đóng</Button>
        </div>
      </div>
    </div>
  )
}
