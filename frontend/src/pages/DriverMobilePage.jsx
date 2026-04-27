import { useMemo } from 'react'
import { DriverWorkspacePage } from './DriverWorkspacePage.jsx'

const mobileSteps = [
  'Mở tuyến được phân công',
  'Quét QR tại điểm pickup',
  'Xác nhận nhận hàng từ farm',
  'Ghi checkpoint trên đường',
  'Báo cáo sự cố cho shipping manager',
  'Xác nhận bàn giao cho retailer',
]

export function DriverMobilePage() {
  const installHint = useMemo(() => {
    const isStandalone = window.matchMedia?.('(display-mode: standalone)')?.matches
    return isStandalone ? null : 'Mẹo: Trên điện thoại, dùng Add to Home Screen để cài như app.'
  }, [])

  return (
    <div style={{ padding: '0 0 24px' }}>
      <section className="role-command-center driver-mission-hub" aria-label="Driver mobile workflow">
        <div className="role-command-center__header">
          <div>
            <p className="eyebrow">Driver mobile / PWA</p>
            <h3>Luồng giao nhận tối ưu cho điện thoại</h3>
            <p>Giao diện mobile gom đúng thứ tự thao tác bắt buộc của tài xế: tuyến, QR, pickup, checkpoint, report và handover.</p>
          </div>
          <span className="coverage-badge">6 bước</span>
        </div>
        <div className="role-feature-grid">
          {mobileSteps.map((step, index) => (
            <a key={step} className="role-feature-card" href={index === 0 ? '#driver-shipments' : index === 1 ? '#driver-qr' : index === 2 ? '#driver-pickup' : index === 3 ? '#driver-checkpoint' : index === 4 ? '#driver-report' : '#driver-handover'}>
              <span className="coverage-dot" />
              <strong>{String(index + 1).padStart(2, '0')} · {step}</strong>
              <p>Điểm vào nhanh cho bước vận hành bắt buộc trên mobile.</p>
              <span className="role-feature-card__action">Mở bước</span>
            </a>
          ))}
        </div>
      </section>

      {installHint ? <div className="alert alert-info" style={{ margin: '18px 0' }}>{installHint}</div> : null}
      <DriverWorkspacePage module="mobile" />
    </div>
  )
}
