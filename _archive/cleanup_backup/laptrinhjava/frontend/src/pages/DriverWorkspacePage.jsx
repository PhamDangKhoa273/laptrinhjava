import { useEffect, useRef, useState, useMemo } from 'react'
import { Button } from '../components/Button.jsx'
import { TextAreaField } from '../components/TextAreaField.jsx'
import { TextInput } from '../components/TextInput.jsx'
import { 
  getMyShipments, 
  getShipmentById, 
  driverConfirmPickup, 
  driverAddCheckpoint, 
  driverConfirmHandover, 
  driverReportIssue 
} from '../services/workflowService.js'
import { getErrorMessage } from '../utils/helpers'
import { Html5QrcodeScanner } from 'html5-qrcode'
import '../shipping-workspace.css'
import '../transaction-hardening.css'

export function DriverWorkspacePage() {
  const [shipments, setShipments] = useState([])
  const [selectedShipment, setSelectedShipment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Forms
  const [qrCode, setQrCode] = useState('')
  const [checkpointNote, setCheckpointNote] = useState('')
  const [checkpointLocation, setCheckpointLocation] = useState('')
  const [checkpointImageUrl, setCheckpointImageUrl] = useState('')
  const [handoverNote, setHandoverNote] = useState('')
  const [reportForm, setReportForm] = useState({ issueType: 'DELAY', description: '', severity: 'MEDIUM' })
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scanMode, setScanMode] = useState('PICKUP')
  const [pickupEvidence, setPickupEvidence] = useState('')
  const [handoverEvidence, setHandoverEvidence] = useState('')
  const [overrideReason, setOverrideReason] = useState('')
  const scannerRef = useRef(null)

  useEffect(() => {
    loadShipments()
  }, [])

  useEffect(() => {
    if (!scannerOpen) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
        scannerRef.current = null
      }
      return
    }

    const scanner = new Html5QrcodeScanner('driver-qr-reader', {
      fps: 10,
      qrbox: { width: 220, height: 220 },
      rememberLastUsedCamera: true,
    }, false)

    scannerRef.current = scanner
    scanner.render(
      (decodedText) => {
        setQrCode(decodedText)
        if (scanMode === 'PICKUP') setPickupEvidence(decodedText)
        if (scanMode === 'HANDOVER') setHandoverEvidence(decodedText)
        if (scanMode === 'CHECKPOINT') setCheckpointImageUrl(decodedText)
        setSuccess('?? qu?t QR th?nh c?ng.')
        setScannerOpen(false)
      },
      () => {}
    )

    return () => {
      scanner.clear().catch(() => {})
      scannerRef.current = null
    }
  }, [scannerOpen])

  async function loadShipments() {
    setLoading(true)
    try {
      const data = await getMyShipments()
      setShipments(Array.isArray(data) ? data : [])
      setError('')
    } catch (err) {
      setError(getErrorMessage(err, 'Không tải được danh sách shipment.'))
    } finally {
      setLoading(false)
    }
  }

  async function handleSelectShipment(id) {
    setLoading(true)
    try {
      const data = await getShipmentById(id)
      setSelectedShipment(data)
      setQrCode(data?.traceCode || data?.batchCode || '')
      setPickupEvidence('')
      setHandoverEvidence('')
      setOverrideReason('')
      setCheckpointNote('')
      setCheckpointLocation('')
      setCheckpointImageUrl('')
      setHandoverNote('')
      setError('')
    } catch (err) {
      setError(getErrorMessage(err, 'Không tải được chi tiết shipment.'))
    } finally {
      setLoading(false)
    }
  }

  async function onConfirmPickup(e) {
    e.preventDefault()
    if (!selectedShipment || actionLoading) return
    setActionLoading(true)
    try {
      await driverConfirmPickup(selectedShipment.shipmentId, { 
        qrCode: qrCode || pickupEvidence, 
        expectedCode: selectedShipment.traceCode || selectedShipment.batchCode || '',
        overrideReason: overrideReason,
        note: 'Pickup confirmed by driver via QR scan.',
        location: 'At Farm' 
      })
      setSuccess('Đã xác nhận lấy hàng thành công!')
      await handleSelectShipment(selectedShipment.shipmentId)
      await loadShipments()
    } catch (err) {
      setError(getErrorMessage(err, 'Xác nhận pickup thất bại.'))
    } finally {
      setActionLoading(false)
    }
  }

  async function onAddCheckpoint(e) {
    e.preventDefault()
    if (!selectedShipment || actionLoading) return
    setActionLoading(true)
    try {
      await driverAddCheckpoint(selectedShipment.shipmentId, {
        type: 'CHECKPOINT',
        note: checkpointNote,
        location: checkpointLocation,
        imageUrl: checkpointImageUrl,
        qrEvidence: qrCode || checkpointImageUrl,
        overrideReason: overrideReason,
      })
      setSuccess('Đã thêm checkpoint vận chuyển.')
      setCheckpointNote('')
      setCheckpointLocation('')
      setCheckpointImageUrl('')
      await handleSelectShipment(selectedShipment.shipmentId)
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể thêm checkpoint.'))
    } finally {
      setActionLoading(false)
    }
  }

  async function onConfirmHandover(e) {
    e.preventDefault()
    if (!selectedShipment || actionLoading) return
    setActionLoading(true)
    try {
      await driverConfirmHandover(selectedShipment.shipmentId, {
        status: 'DELIVERED',
        note: handoverNote || 'Handover confirmed by driver at destination.',
        evidence: handoverEvidence || qrCode,
        overrideReason: overrideReason,
      })
      setSuccess('Đơn hàng đã được giao thành công!')
      await handleSelectShipment(selectedShipment.shipmentId)
      await loadShipments()
    } catch (err) {
      setError(getErrorMessage(err, 'Xác nhận giao hàng thất bại.'))
    } finally {
      setActionLoading(false)
    }
  }

  async function onSubmitReport(e) {
    e.preventDefault()
    if (!selectedShipment || actionLoading) return
    setActionLoading(true)
    try {
      await driverReportIssue(selectedShipment.shipmentId, reportForm)
      setSuccess('Báo cáo sự cố đã được gửi tới manager.')
      setReportForm({ issueType: 'DELAY', description: '', severity: 'MEDIUM' })
      await handleSelectShipment(selectedShipment.shipmentId)
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể gửi báo cáo.'))
    } finally {
      setActionLoading(false)
    }
  }

  function openScanner(mode = 'PICKUP') {
    setError('')
    setSuccess('')
    setScanMode(mode)
    setScannerOpen(true)
  }

  function closeScanner() {
    setScannerOpen(false)
  }

  function formatDateTime(val) {
    if (!val) return 'N/A'
    return new Date(val).toLocaleString('vi-VN')
  }

  const activeShipments = useMemo(() => shipments.filter(s => s.status !== 'DELIVERED' && s.status !== 'CANCELLED'), [shipments])
  const historyShipments = useMemo(() => shipments.filter(s => s.status === 'DELIVERED' || s.status === 'CANCELLED'), [shipments])

  return (
    <section className="page-section driver-workspace-shell">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Driver Workspace</p>
          <h2>Lộ trình của tôi</h2>
          <p>Quản lý các shipment đang vận chuyển và xác nhận giao hàng.</p>
        </div>
        <div className="section-actions">
           <Button variant="secondary" onClick={loadShipments} disabled={loading}>Làm mới</Button>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <div className="shipping-workspace-grid">
        {/* Left Panel: List */}
        <article className="glass-card shipping-panel">
          <h3>Đang thực hiện ({activeShipments.length})</h3>
          <div className="form-grid top-gap">
            {activeShipments.length === 0 ? <p>Bạn không có đơn hàng nào đang vận chuyển.</p> : activeShipments.map(s => (
              <div 
                key={s.shipmentId} 
                className={`business-card clickable ${selectedShipment?.shipmentId === s.shipmentId ? 'active' : ''}`}
                onClick={() => handleSelectShipment(s.shipmentId)}
              >
                <strong>Shipment #{s.shipmentId}</strong>
                <p>{s.farmName} → {s.retailerName}</p>
                <span className={`status-pill status-${s.status.toLowerCase()}`}>{s.status}</span>
              </div>
            ))}
          </div>

          <h3 className="top-gap">Lịch sử ({historyShipments.length})</h3>
          <div className="form-grid top-gap">
            {historyShipments.map(s => (
              <div 
                 key={s.shipmentId} 
                 className={`business-card clickable ${selectedShipment?.shipmentId === s.shipmentId ? 'active' : ''}`}
                 onClick={() => handleSelectShipment(s.shipmentId)}
              >
                <strong>Shipment #{s.shipmentId}</strong>
                <p>Status: {s.status}</p>
              </div>
            ))}
          </div>
        </article>

        {/* Right Panel: Detail & Actions */}
        <article className="glass-card shipping-panel shipping-panel-wide">
          {selectedShipment ? (
            <div className="shipment-execution-flow">
              <div className="execution-header">
                <h3>Chi tiết Shipment #{selectedShipment.shipmentId}</h3>
                <span className={`status-pill status-${selectedShipment.status.toLowerCase()}`}>{selectedShipment.status}</span>
              </div>

              <div className="feature-grid top-gap">
                <div className="info-box">
                  <p className="field-label">Từ Farm</p>
                  <strong>{selectedShipment.farmName}</strong>
                </div>
                <div className="info-box">
                  <p className="field-label">Đến Retailer</p>
                  <strong>{selectedShipment.retailerName}</strong>
                </div>
                <div className="info-box">
                  <p className="field-label">Vehicle</p>
                  <strong>{selectedShipment.vehiclePlateNo}</strong>
                </div>
                <div className="info-box">
                  <p className="field-label">Batch / Trace</p>
                  <strong>{selectedShipment.batchCode || 'N/A'} / {selectedShipment.traceCode || 'N/A'}</strong>
                </div>
              </div>

              {/* ACTION FLOW */}
              <div className="execution-actions top-gap">
                {selectedShipment.status === 'ASSIGNED' && (
                  <form className="execution-card highlight" onSubmit={onConfirmPickup}>
                    <h4>Bước 1: Xác nhận lấy hàng (Pickup)</h4>
                    <p>Quét mã QR trên lô hàng để xác nhận đúng Batch.</p>
                    <TextInput 
                      label="Mã QR / Trace / Batch" 
                      value={qrCode} 
                      onChange={e => setQrCode(e.target.value)} 
                      placeholder="Ví dụ: TRACE-P3-001 hoặc BATCH-001"
                      required 
                    />
                    {selectedShipment.qrCodeUrl ? <p className="helper-text">QR URL: {selectedShipment.qrCodeUrl}</p> : null}
                    <Button type="submit" disabled={actionLoading}>Xác nhận Pickup</Button>
                  </form>
                )}

                {selectedShipment.status === 'IN_TRANSIT' && (
                  <div className="execution-steps">
                    <form className="execution-card" onSubmit={onAddCheckpoint}>
                      <h4>Bước 2: Cập nhật lộ trình</h4>
                      <TextAreaField 
                        label="Ghi chú (Checkpoint)" 
                        value={checkpointNote} 
                        onChange={e => setCheckpointNote(e.target.value)} 
                        placeholder="Ví dụ: Đã đến trạm dừng nghỉ A, nghỉ ngơi 30p."
                      />
                      <TextInput
                        label="Vị trí checkpoint"
                        value={checkpointLocation}
                        onChange={e => setCheckpointLocation(e.target.value)}
                        placeholder="Ví dụ: Quốc lộ 1A, Bình Thuận"
                      />
                      <TextInput
                        label="Proof image URL"
                        value={checkpointImageUrl}
                        onChange={e => setCheckpointImageUrl(e.target.value)}
                        placeholder="https://..."
                      />
                      <div className="inline-actions">
                        <Button variant="secondary" type="button" onClick={() => openScanner('CHECKPOINT')}>Rescan checkpoint QR</Button>
                      </div>
                      <Button type="submit" variant="secondary" disabled={actionLoading}>Lưu Checkpoint</Button>
                    </form>

                    <form className="execution-card highlight top-gap" onSubmit={onConfirmHandover}>
                      <h4>Bước 3: Bàn giao hàng (Handover)</h4>
                      <p>Xác nhận đã giao hàng cho Retailer.</p>
                      <TextAreaField 
                        label="Ký nhận/Ghi chú thêm" 
                        value={handoverNote} 
                        onChange={e => setHandoverNote(e.target.value)} 
                        placeholder="Ví dụ: Retailer đã nhận đủ hàng, không hư hỏng."
                      />
                      <Button type="submit" disabled={actionLoading}>Xác nhận Giao hàng Xong</Button>
                    </form>
                  </div>
                )}
              </div>

              {/* REPORTING */}
              <form className="execution-card tone-error top-gap" onSubmit={onSubmitReport}>
                <h4>Báo cáo sự cố (Report Issue)</h4>
                <div className="grid-two">
                  <label className="field-group">
                    <span className="field-label">Loại sự cố</span>
                    <select 
                      className="field-input" 
                      value={reportForm.issueType} 
                      onChange={e => setReportForm({...reportForm, issueType: e.target.value})}
                    >
                      <option value="DELAY">Trễ chuyến (Delay)</option>
                      <option value="DAMAGED">Hàng hư hỏng (Damaged)</option>
                      <option value="WRONG_BATCH">Sai lô hàng (Wrong Batch)</option>
                      <option value="ROUTE_ISSUE">Sự cố đường xá (Route Issue)</option>
                    </select>
                  </label>
                  <label className="field-group">
                    <span className="field-label">Mức độ</span>
                    <select 
                      className="field-input" 
                      value={reportForm.severity} 
                      onChange={e => setReportForm({...reportForm, severity: e.target.value})}
                    >
                      <option value="LOW">Thấp</option>
                      <option value="MEDIUM">Trung bình</option>
                      <option value="HIGH">Nghiêm trọng (Cần xử lý ngay)</option>
                    </select>
                  </label>
                </div>
                <TextAreaField 
                  label="Mô tả chi tiết" 
                  value={reportForm.description} 
                  onChange={e => setReportForm({...reportForm, description: e.target.value})} 
                  placeholder="Mô tả tình hình hiện tại..."
                  required
                />
                <Button type="submit" variant="secondary" disabled={actionLoading}>Gửi báo cáo sự cố</Button>
              </form>

              {/* TIMELINE LOGS */}
              <div className="timeline-section top-gap">
                <h4>Lịch sử vận chuyển</h4>
                <div className="timeline-list">
                  {selectedShipment.logs?.length === 0 ? <p>Chưa có lịch sử.</p> : selectedShipment.logs?.map(log => (
                    <div key={log.logId} className="timeline-item">
                      <span className="timeline-time">{formatDateTime(log.recordedAt)}</span>
                      <div className="timeline-content">
                        <strong>{log.type}</strong>
                        <p>{log.note}</p>
                        {log.location ? <small>Vị trí: {log.location}</small> : null}
                        {log.imageUrl ? <small> • Proof: {log.imageUrl}</small> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="timeline-section top-gap">
                <h4>Báo cáo sự cố đã gửi</h4>
                <div className="timeline-list">
                  {selectedShipment.reports?.length === 0 ? <p>Chưa có báo cáo sự cố.</p> : selectedShipment.reports?.map(report => (
                    <div key={report.reportId} className="timeline-item">
                      <span className="timeline-time">{formatDateTime(report.createdAt)}</span>
                      <div className="timeline-content">
                        <strong>{report.issueType} • {report.severity || 'N/A'}</strong>
                        <p>{report.description}</p>
                        <small>Trạng thái: {report.status || 'OPEN'}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>Chọn một shipment từ danh sách bên trái để bắt đầu thực hiện lộ trình.</p>
            </div>
          )}
        </article>
      </div>
    </section>
  )
}
