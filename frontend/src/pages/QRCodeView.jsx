import { useMemo } from 'react'
import QRCode from 'qrcode.react'
import { Button } from '../components/Button.jsx'
import { PageEmptyState } from '../components/PageState.jsx'

export default function QRCodeView({ value }) {
  const qrValue = useMemo(() => (value ? String(value).trim() : ''), [value])

  if (!qrValue) {
    return (
      <PageEmptyState
        icon="🔎"
        title="Chưa có dữ liệu QR"
        message="Cung cấp trace code hoặc public trace URL để hiển thị mã QR truy xuất nguồn gốc."
      />
    )
  }

  return (
    <article className="glass-card qr-trace-card">
      <div className="admin-table-head">
        <div>
          <p className="eyebrow">Traceability QR</p>
          <h3>Mã QR truy xuất</h3>
          <p>Quét mã để mở đường dẫn truy xuất nguồn gốc nông sản BICAP.</p>
        </div>
        <Button variant="secondary" onClick={() => window.print()}>In QR</Button>
      </div>
      <div className="qr-trace-frame">
        <QRCode value={qrValue} size={220} includeMargin />
      </div>
      <div className="qr-trace-value">
        <span>Giá trị mã hóa</span>
        <strong>{qrValue}</strong>
      </div>
    </article>
  )
}