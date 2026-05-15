import { useEffect, useRef, useState } from 'react'
import {
  SOCIAL_DEFINITIONS,
  SUPPORT_CONFIG_EVENT,
  buildTelegramLink,
  buildZaloLink,
  getSupportConfig,
  normalizeExternalUrl,
  refreshSupportConfigFromBackend,
} from '../utils/supportConfig.js'
import './SupportButton.css'

export function SupportButton({ variant = 'icon', className = '', label = 'Hỗ trợ' }) {
  const [open, setOpen] = useState(false)
  const [config, setConfig] = useState(() => getSupportConfig())
  const [popoverPos, setPopoverPos] = useState({ top: 0, right: 0 })
  const wrapperRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    function handleConfigChange(event) {
      setConfig(event?.detail || getSupportConfig())
    }
    function handleStorage(event) {
      if (!event || event.key === null || event.key?.includes('supportConfig')) {
        setConfig(getSupportConfig())
      }
    }
    window.addEventListener(SUPPORT_CONFIG_EVENT, handleConfigChange)
    window.addEventListener('storage', handleStorage)
    refreshSupportConfigFromBackend().then((fresh) => {
      if (fresh) setConfig(fresh)
    })
    return () => {
      window.removeEventListener(SUPPORT_CONFIG_EVENT, handleConfigChange)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  useEffect(() => {
    if (!open) return undefined
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    function handleEscape(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const telegramLink = buildTelegramLink(config.telegramHandle)
  const telegramLabel = config.telegramDisplay || (config.telegramHandle ? `@${String(config.telegramHandle).replace(/^@/, '')}` : '')
  const zaloLink = buildZaloLink(config.zaloPhone)
  const zaloLabel = config.zaloDisplay || config.zaloPhone

  const triggerClass = variant === 'text'
    ? `support-button support-button--text ${className}`
    : `support-button support-button--icon dashboard-icon-button ${className}`

  function handleToggle() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPopoverPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      })
    }
    setOpen((value) => !value)
  }

  return (
    <div className="support-button-wrapper" ref={wrapperRef}>
      <button
        ref={buttonRef}
        type="button"
        className={triggerClass}
        onClick={handleToggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label}
        title={label}
      >
        <span className="material-symbols-outlined" aria-hidden="true">support_agent</span>
        {variant === 'text' ? <span>{label}</span> : null}
      </button>

      {open ? (
        <div className="support-popover" role="dialog" aria-label="Kênh hỗ trợ BICAP" style={{ top: popoverPos.top, right: popoverPos.right }}>
          <header className="support-popover__head">
            <div className="support-popover__title">
              <span className="material-symbols-outlined" aria-hidden="true">support_agent</span>
              <div>
                <strong>Trung tâm hỗ trợ BICAP</strong>
                <span>{config.workingHours || 'Hỗ trợ trong giờ hành chính'}</span>
              </div>
            </div>
            <button type="button" className="support-popover__close" onClick={() => setOpen(false)} aria-label="Đóng">
              <span className="material-symbols-outlined" aria-hidden="true">close</span>
            </button>
          </header>

          <div className="support-popover__body">
            {telegramLink ? (
              <a className="support-channel support-channel--telegram" href={telegramLink} target="_blank" rel="noreferrer">
                <span className="support-channel__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M9.99 15.34 9.84 19a1 1 0 0 0 1.6.74l2.17-2 4.49 3.3a1 1 0 0 0 1.59-.58l3.3-15.47a1 1 0 0 0-1.35-1.13L2.3 10.18a1 1 0 0 0 .08 1.88l5.04 1.58 11.7-7.37-9.13 9.07Z"/></svg>
                </span>
                <div className="support-channel__body">
                  <strong>Telegram</strong>
                  <span>{telegramLabel || 'Nhắn tin qua Telegram'}</span>
                </div>
                <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
              </a>
            ) : null}

            {zaloLink ? (
              <a className="support-channel support-channel--zalo" href={zaloLink} target="_blank" rel="noreferrer">
                <span className="support-channel__icon" aria-hidden="true">
                  <svg viewBox="0 0 32 32" width="22" height="22"><path fill="currentColor" d="M16 3C8.3 3 2 8.3 2 14.8c0 3.7 2 7 5.2 9.2L6 29l5.4-2.4c1.5.3 3 .5 4.6.5 7.7 0 14-5.3 14-11.8S23.7 3 16 3Zm-6.2 9.2h1.4v7h3.3v1.3H9.8v-8.3Zm7.4 0h1.4v8.3h-1.4v-8.3Zm3.2 0h1.5l2.7 5.2V12.2h1.3v8.3h-1.4l-2.8-5.3v5.3h-1.3v-8.3Z"/></svg>
                </span>
                <div className="support-channel__body">
                  <strong>Zalo</strong>
                  <span>{zaloLabel || 'Nhắn tin qua Zalo'}</span>
                </div>
                <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
              </a>
            ) : null}

            {!telegramLink && !zaloLink ? (
              <div className="support-channel support-channel--empty">
                <span className="material-symbols-outlined" aria-hidden="true">info</span>
                <div className="support-channel__body">
                  <strong>Chưa cấu hình kênh hỗ trợ</strong>
                  <span>Quản trị viên chưa nhập Telegram hoặc Zalo.</span>
                </div>
              </div>
            ) : null}

            {(() => {
              const socialLinks = SOCIAL_DEFINITIONS
                .map((def) => ({ ...def, href: normalizeExternalUrl(config[def.key]) }))
                .filter((item) => item.href)
              if (!socialLinks.length) return null
              return (
                <div className="support-socials">
                  <div className="support-socials__label">Mạng xã hội &amp; liên kết khác</div>
                  <div className="support-socials__grid">
                    {socialLinks.map((item) => (
                      <a
                        key={item.key}
                        className="support-social"
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        title={item.label}
                        style={{ '--social-tone': item.tone }}
                      >
                        <span className="material-symbols-outlined" aria-hidden="true">{item.icon}</span>
                        <span>{item.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )
            })()}

            <div className="support-popover__contacts">
              {config.hotline ? (
                <a href={`tel:${String(config.hotline).replace(/\s+/g, '')}`} className="support-contact">
                  <span className="material-symbols-outlined" aria-hidden="true">call</span>
                  <span>{config.hotline}</span>
                </a>
              ) : null}
              {config.email ? (
                <a href={`mailto:${config.email}`} className="support-contact">
                  <span className="material-symbols-outlined" aria-hidden="true">mail</span>
                  <span>{config.email}</span>
                </a>
              ) : null}
            </div>

            {config.note ? <p className="support-popover__note">{config.note}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default SupportButton
