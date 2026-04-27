import { useMemo } from 'react'
import { DriverWorkspacePage } from './DriverWorkspacePage.jsx'

export function DriverMobilePage() {
  const installHint = useMemo(() => {
    const isStandalone = window.matchMedia?.('(display-mode: standalone)')?.matches
    return isStandalone ? null : 'Mẹo: Trên điện thoại, dùng Add to Home Screen để cài như app.'
  }, [])

  return (
    <div style={{ padding: '0 0 24px' }}>
      <div className="alert alert-info" style={{ margin: '18px 0' }}>
        <strong>BICAP Driver PWA</strong>
        <div>Giao diện tối ưu cho mobile: pickup, checkpoint, handover, report.</div>
        {installHint ? <div style={{ marginTop: 8 }}>{installHint}</div> : null}
      </div>
      <DriverWorkspacePage />
    </div>
  )
}
