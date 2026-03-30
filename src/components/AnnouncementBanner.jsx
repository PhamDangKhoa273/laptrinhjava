import { useState } from 'react'
import { Button } from './Button.jsx'

export function AnnouncementBanner() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="announcement-overlay">
      <div className="announcement-modal">
        <div className="announcement-header">
          <h3>Thông báo</h3>
        </div>
        <div className="announcement-body">
          <p className="announcement-line">BICAP</p>
          <p className="announcement-highlight dark">CHÚC BẠN</p>
          <p className="announcement-highlight bright">MỘT NGÀY VUI VẺ 😊</p>
        </div>
        <div className="announcement-actions">
          <Button variant="secondary" onClick={() => setVisible(false)}>Không hiển thị lại</Button>
          <Button onClick={() => setVisible(false)}>Đóng</Button>
        </div>
      </div>
    </div>
  )
}
