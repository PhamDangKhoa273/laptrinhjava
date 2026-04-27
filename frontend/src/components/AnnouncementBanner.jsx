import { useState, useEffect } from 'react'
import { Button } from './Button.jsx'
import { getActiveAnnouncement } from '../services/workflowService.js'
import { getDefaultAnnouncementHtml, sanitizeAnnouncementHtml } from '../utils/announcementSanitizer.js'

export function AnnouncementBanner() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.sessionStorage.getItem('bicap-announcement-dismissed') !== 'true'
      && window.localStorage.getItem('bicap-announcement-hidden') !== 'true'
  })
  const [content, setContent] = useState('')

  useEffect(() => {
    let mounted = true
    async function loadContent() {
      try {
        const data = await getActiveAnnouncement()
        if (!mounted) return
        setContent(sanitizeAnnouncementHtml(data?.contentHtml || data?.body || getDefaultAnnouncementHtml()))
      } catch {
        if (mounted) setContent(sanitizeAnnouncementHtml(getDefaultAnnouncementHtml()))
      }
    }
    loadContent()
    return () => { mounted = false }
  }, [])

  function dismissForSession() {
    if (typeof window !== 'undefined') window.sessionStorage.setItem('bicap-announcement-dismissed', 'true')
    setVisible(false)
  }

  function hidePermanently() {
    if (typeof window !== 'undefined') window.localStorage.setItem('bicap-announcement-hidden', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="announcement-overlay">
      <div className="announcement-modal">
        <div className="announcement-header">
          <h3>Thông báo</h3>
        </div>
        <div className="announcement-body" dangerouslySetInnerHTML={{ __html: content }} />
        <div className="announcement-actions">
          <Button variant="secondary" style={{ color: '#3a4f67', backgroundColor: '#eef2f6', borderColor: '#d1dce6' }} onClick={hidePermanently}>Không hiển thị lại</Button>
          <Button onClick={dismissForSession}>Đóng</Button>
        </div>
      </div>
    </div>
  )
}
