import { useMemo } from 'react'
import QRCode from 'qrcode.react'
import { Button } from '../components/Button.jsx'
import { PageEmptyState } from '../components/PageState.jsx'

export default function QRCodeView({ value }) {
  const qrValue = useMemo(() => (value ? String(value).trim() : ''), [value])

  if (!qrValue) {
    return (
      <PageEmptyState
        icon="??"
        title="Chưa có d? li?u QR"
        message="Cung c?p trace code ho?c public trace URL để hi?n th? m? QR truy xu?t ngu?n g?c."
      />
    )
  }

  return (
    <article className="glass-card qr-trace-card">
      <div className="admin-table-head">
        <div>
          <p className="eyebrow">Traceability QR</p>
          <h3>M? QR truy xu?t</h3>
          <p>Quét m? để m? đường d?n truy xu?t ngu?n g?c nông s?n BICAP.</p>
        </div>
        <Button variant="secondary" onClick={() => window.print()}>In QR</Button>
      </div>
      <div className="qr-trace-frame">
        <QRCode value={qrValue} size={220} includeMargin />
      </div>
      <div className="qr-trace-value">
        <span>Giá tr? m? hóa</span>
        <strong>{qrValue}</strong>
      </div>
    </article>
  )
}